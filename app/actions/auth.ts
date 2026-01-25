"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
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

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Server action to send OTP for signup
export async function sendSignupOTP(
  formData: z.infer<typeof signUpFormSchema>,
) {
  try {
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

    // Store OTP in database with 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.oTPVerification.create({
      data: {
        email: validatedData.email,
        otp,
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

    console.error("Error in sendSignupOTP:", error);
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
  userData: z.infer<typeof signUpFormSchema>,
) {
  try {
    // Find OTP record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email,
        otp,
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

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Create user with company or applicant profile
    const user = await prisma.user.create({
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

    // Mark OTP as verified
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return {
      success: true,
      message: "Account created successfully",
      userId: user.id,
      role: user.role,
    };
  } catch (error) {
    console.error("Error in verifyOTPAndRegister:", error);
    return {
      success: false,
      error: "Failed to create account. Please try again.",
    };
  }
}

// Server action for credentials login
export async function loginWithCredentials(email: string, password: string) {
  try {
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

    return {
      success: true,
      message: "Logged in successfully",
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Invalid email or password",
    };
  }
}

// Server action for OAuth sign-in
export async function signInWithOAuth(provider: "google" | "linkedin") {
  try {
    const { signIn } = await import("@/auth");
    await signIn(provider, { redirectTo: "/dashboard" });

    return {
      success: true,
    };
  } catch (error) {
    console.error(`${provider} sign-in error:`, error);
    return {
      success: false,
      error: "Failed to sign in. Please try again.",
    };
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

    // Delete existing OTPs
    await prisma.oTPVerification.deleteMany({
      where: { email },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTPVerification.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send email
    const emailResult = await sendEmail({
      to: email,
      subject: "Verify Your Email - AIVOX",
      html: otpVerificationTemplate(otp),
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
    console.error("Error in resendOTP:", error);
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

      // Store OTP in database with 10-minute expiry (longer for password reset)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.oTPVerification.create({
        data: {
          email: validatedData.email,
          otp,
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

    console.error("Error in sendForgotPasswordOTP:", error);
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
        otp: validatedData.otp,
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

    console.error("Error in verifyForgotPasswordOTP:", error);
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

    // Find OTP record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email: validatedData.email,
        otp: validatedData.otp,
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
        error: "Verification code has expired. Please start over.",
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

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validatedData.password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Mark OTP as verified and delete it
    await prisma.oTPVerification.deleteMany({
      where: { email: validatedData.email },
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

    console.error("Error in resetPassword:", error);
    return {
      success: false,
      error: "Failed to reset password. Please try again.",
    };
  }
}
