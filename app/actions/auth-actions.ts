"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";
import {
  signUpFormSchema,
  forgotPasswordRequestSchema,
  forgotPasswordVerifyOTPSchema,
  resetPasswordSchema,
} from "@/schemas";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { otpVerificationTemplate } from "@/lib/email-templates/otp-verification";
import { passwordResetTemplate } from "@/lib/email-templates/password-reset";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limiter";

// Constants
const BCRYPT_ROUNDS = 12;
const MAX_OTP_ATTEMPTS = 5;

// Helper function to get client identifier (IP + User-Agent)
async function getClientIdentifier(): Promise<string> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";
  return `${ip}-${userAgent}`;
}

// Generate a cryptographically secure 6-digit OTP
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Hash OTP before storing
async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10); // Use fewer rounds for OTP (temporary data)
}

// Verify OTP hash
async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

// Server action to send OTP for signup
export async function sendSignupOTP(
  formData: z.infer<typeof signUpFormSchema>,
) {
  try {
    // Rate limiting check
    const clientId = await getClientIdentifier();
    const rateLimit = rateLimiter.check(
      `signup-${clientId}`,
      RATE_LIMITS.OTP_SEND.maxRequests,
      RATE_LIMITS.OTP_SEND.windowMs,
    );

    if (!rateLimit.success) {
      const minutesUntilReset = rateLimiter.getMinutesUntilReset(
        rateLimit.resetTime,
      );
      return {
        success: false,
        error: `Too many signup attempts. Please try again in ${minutesUntilReset} minutes.`,
      };
    }

    // Server-side validation
    const validatedData = signUpFormSchema.parse(formData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Delete any existing OTP for this email
    await prisma.oTPVerification.deleteMany({
      where: { email: validatedData.email },
    });

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    // Store OTP in database with 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store signup data server-side (not in URL)
    await prisma.oTPVerification.create({
      data: {
        email: validatedData.email,
        otp: hashedOTP,
        attempts: 0,
        signupData: validatedData as any, // Store signup data securely
        expiresAt,
      },
    });

    // Get name for email personalization
    const name =
      validatedData.role === "company"
        ? validatedData.companyName
        : validatedData.fullName;

    // Send OTP email
    const emailResult = await sendEmail({
      to: validatedData.email,
      subject: "Verify Your Email - AIVOX",
      html: otpVerificationTemplate(otp, name),
    });

    if (!emailResult.success) {
      return {
        success: false,
        error: "Failed to send verification email. Please try again.",
      };
    }

    return {
      success: true,
      message: "Verification code sent to your email",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data",
      };
    }

    // Don't log sensitive errors in production
    if (process.env.NODE_ENV === "development") {
      console.error("Error in sendSignupOTP:", error);
    }
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Server action to verify OTP and register user
export async function verifyOTPAndRegister(
  email: string,
  otp: string,
) {
  try {
    // Find OTP record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return {
        success: false,
        error: "Invalid verification code",
      };
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return {
        success: false,
        error: "Verification code has expired. Please request a new one.",
      };
    }

    // Check OTP attempts (prevent brute force)
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return {
        success: false,
        error: "Too many failed attempts. Please request a new code.",
      };
    }

    // Verify hashed OTP
    const isValidOTP = await verifyOTP(otp, otpRecord.otp);

    if (!isValidOTP) {
      // Increment attempts
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });

      return {
        success: false,
        error: `Invalid verification code. ${MAX_OTP_ATTEMPTS - otpRecord.attempts - 1} attempts remaining.`,
      };
    }

    // Get signup data from database (not from URL)
    const userData = otpRecord.signupData as z.infer<typeof signUpFormSchema>;

    if (!userData) {
      return {
        success: false,
        error: "Signup data not found. Please sign up again.",
      };
    }

    // Check if user already exists (double-check)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Use transaction for atomic user creation
    const user = await prisma.$transaction(async (tx) => {
      // Hash password with stronger rounds
      const passwordHash = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);

      // Create user with company or applicant profile
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: userData.role.toUpperCase() as "COMPANY" | "APPLICANT",
          ...(userData.role === "company"
            ? {
                company: {
                  create: {
                    name: userData.companyName!,
                    website: userData.website || null,
                  },
                },
              }
            : {
                applicant: {
                  create: {
                    fullName: userData.fullName!,
                  },
                },
              }),
        },
      });

      // Mark OTP as verified and delete it
      await tx.oTPVerification.deleteMany({
        where: { email },
      });

      return newUser;
    });

    return {
      success: true,
      message: "Account created successfully",
      userId: user.id,
      role: user.role,
    };
  } catch (error) {
    // Don't log sensitive errors in production
    if (process.env.NODE_ENV === "development") {
      console.error("Error in verifyOTPAndRegister:", error);
    }
    return {
      success: false,
      error: "Failed to create account. Please try again.",
    };
  }
}

// Server action for credentials login
export async function loginWithCredentials(email: string, password: string) {
  try {
    // Rate limiting check
    const clientId = await getClientIdentifier();
    const rateLimit = rateLimiter.check(
      `login-${clientId}`,
      RATE_LIMITS.LOGIN.maxRequests,
      RATE_LIMITS.LOGIN.windowMs,
    );

    if (!rateLimit.success) {
      const minutesUntilReset = rateLimiter.getMinutesUntilReset(
        rateLimit.resetTime,
      );
      return {
        success: false,
        error: `Too many login attempts. Please try again in ${minutesUntilReset} minutes.`,
      };
    }

    const { signIn } = await import("@/auth");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Get user to determine redirect URL
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    const redirectUrl =
      user?.role === "COMPANY" ? "/company" : "/applicant";

    return {
      success: true,
      message: "Logged in successfully",
      redirectUrl,
    };
  } catch (error) {
    // Don't log sensitive errors in production
    if (process.env.NODE_ENV === "development") {
      console.error("Login error:", error);
    }
    return {
      success: false,
      error: "Invalid email or password",
    };
  }
}

// Server action for OAuth sign-in
export async function signInWithOAuth(
  provider: "google" | "linkedin",
  callbackUrl?: string | null,
) {
  try {
    const { signIn } = await import("@/auth");
    await signIn(provider, { redirectTo: callbackUrl || "/dashboard" });

    return {
      success: true,
    };
  } catch (error) {
    // Don't log sensitive errors in production
    if (process.env.NODE_ENV === "development") {
      console.error(`${provider} sign-in error:`, error);
    }
    return {
      success: false,
      error: "Failed to sign in. Please try again.",
    };
  }
}

// Server action to sign out
export async function handleSignOut() {
  try {
    const { signOut } = await import("@/auth");
    await signOut({ redirectTo: "/login" });
  } catch (error) {
    // Don't log sensitive errors in production
    if (process.env.NODE_ENV === "development") {
      console.error("Sign out error:", error);
    }
    throw error;
  }
}

// Server action to resend OTP
export async function resendOTP(email: string) {
  try {
    // Find the latest OTP record for this email
    const latestOTP = await prisma.oTPVerification.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!latestOTP) {
      return {
        success: false,
        error: "No verification request found for this email",
      };
    }

    // Preserve signup data from the previous OTP record
    const signupData = latestOTP.signupData;

    // Delete existing OTPs
    await prisma.oTPVerification.deleteMany({
      where: { email },
    });

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTPVerification.create({
      data: {
        email,
        otp: hashedOTP,
        attempts: 0,
        signupData: signupData || undefined,
        expiresAt,
      },
    });

    // Get name for email personalization
    const userData = signupData as any;
    const name = userData?.role === "company" ? userData?.companyName : userData?.fullName;

    // Send email
    const emailResult = await sendEmail({
      to: email,
      subject: "Verify Your Email - AIVOX",
      html: otpVerificationTemplate(otp, name),
    });

    if (!emailResult.success) {
      return {
        success: false,
        error: "Failed to send verification email. Please try again.",
      };
    }

    return {
      success: true,
      message: "Verification code resent to your email",
    };
  } catch (error) {
    // Don't log sensitive errors in production
    if (process.env.NODE_ENV === "development") {
      console.error("Error in resendOTP:", error);
    }
    return {
      success: false,
      error: "Failed to resend code. Please try again.",
    };
  }
}

// Server action to send forgot password OTP
export async function sendForgotPasswordOTP(
  formData: z.infer<typeof forgotPasswordRequestSchema>,
) {
  try {
    // Rate limiting check
    const clientId = await getClientIdentifier();
    const rateLimit = rateLimiter.check(
      `password-reset-${clientId}`,
      RATE_LIMITS.PASSWORD_RESET.maxRequests,
      RATE_LIMITS.PASSWORD_RESET.windowMs,
    );

    if (!rateLimit.success) {
      const minutesUntilReset = rateLimiter.getMinutesUntilReset(
        rateLimit.resetTime,
      );
      return {
        success: false,
        error: `Too many password reset attempts. Please try again in ${minutesUntilReset} minutes.`,
      };
    }

    // Server-side validation
    const validatedData = forgotPasswordRequestSchema.parse(formData);

    // Check if user exists (but don't reveal this information)
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Always return success for security (prevent email enumeration)
    // But only send email if user exists
    if (user) {
      // Delete any existing password reset OTP for this email
      await prisma.oTPVerification.deleteMany({
        where: { email: validatedData.email },
      });

      // Generate OTP
      const otp = generateOTP();
      const hashedOTP = await hashOTP(otp);

      // Store OTP in database with 10-minute expiry (longer for password reset)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.oTPVerification.create({
        data: {
          email: validatedData.email,
          otp: hashedOTP,
          attempts: 0,
          expiresAt,
        },
      });

      // Send password reset email
      await sendEmail({
        to: validatedData.email,
        subject: "Reset Your Password - AIVOX",
        html: passwordResetTemplate(otp),
      });
    }

    // Always return success (security best practice)
    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset code shortly.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid email address",
      };
    }

    // Don't log sensitive errors in production
    if (process.env.NODE_ENV === "development") {
      console.error("Error in sendForgotPasswordOTP:", error);
    }
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Server action to verify forgot password OTP
export async function verifyForgotPasswordOTP(
  formData: z.infer<typeof forgotPasswordVerifyOTPSchema>,
) {
  try {
    // Server-side validation
    const validatedData = forgotPasswordVerifyOTPSchema.parse(formData);

    // Find OTP record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email: validatedData.email,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return {
        success: false,
        error: "Invalid verification code",
      };
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return {
        success: false,
        error: "Verification code has expired. Please request a new one.",
      };
    }

    // Check OTP attempts (prevent brute force)
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      return {
        success: false,
        error: "Too many failed attempts. Please request a new code.",
      };
    }

    // Verify hashed OTP
    const isValidOTP = await verifyOTP(validatedData.otp, otpRecord.otp);

    if (!isValidOTP) {
      // Increment attempts
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });

      return {
        success: false,
        error: `Invalid verification code. ${MAX_OTP_ATTEMPTS - otpRecord.attempts - 1} attempts remaining.`,
      };
    }

    // Mark OTP as verified
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return {
      success: true,
      message: "Verification code is valid",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid verification code",
      };
    }

    // Don't log sensitive errors in production
    if (process.env.NODE_ENV === "development") {
      console.error("Error in verifyForgotPasswordOTP:", error);
    }
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Server action to reset password
export async function resetPassword(
  formData: z.infer<typeof resetPasswordSchema>,
) {
  try {
    // Server-side validation
    const validatedData = resetPasswordSchema.parse(formData);

    // Find OTP record - must be verified
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email: validatedData.email,
        verified: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return {
        success: false,
        error: "Invalid or unverified code. Please verify your code first.",
      };
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return {
        success: false,
        error: "Verification code has expired. Please start over.",
      };
    }

    // Verify hashed OTP
    const isValidOTP = await verifyOTP(validatedData.otp, otpRecord.otp);

    if (!isValidOTP) {
      return {
        success: false,
        error: "Invalid verification code",
      };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Use transaction for atomic password update and OTP deletion
    await prisma.$transaction(async (tx) => {
      // Hash new password with stronger rounds
      const newPasswordHash = await bcrypt.hash(
        validatedData.password,
        BCRYPT_ROUNDS,
      );

      // Update user password
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      });

      // Delete OTP record
      await tx.oTPVerification.deleteMany({
        where: { email: validatedData.email },
      });
    });

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data",
      };
    }

    // Don't log sensitive errors in production
    if (process.env.NODE_ENV === "development") {
      console.error("Error in resetPassword:", error);
    }
    return {
      success: false,
      error: "Failed to reset password. Please try again.",
    };
  }
}
