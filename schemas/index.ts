import z from "zod";

// List of personal email domains to block for company signup
const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "zoho.com",
];

export const loginFormSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signUpFormSchema = z
  .object({
    role: z.enum(["company", "applicant"]),
    email: z.email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    // Company-specific fields
    companyName: z.string().optional(),
    website: z.string().optional(),
    // Applicant-specific fields
    fullName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // For company role, validate professional email
      if (data.role === "company") {
        const emailDomain = data.email.split("@")[1]?.toLowerCase();
        return !PERSONAL_EMAIL_DOMAINS.includes(emailDomain);
      }
      return true;
    },
    {
      message: "Please use a professional email address",
      path: ["email"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "company") {
        return !!data.companyName && data.companyName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Company name is required",
      path: ["companyName"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "company") {
        return !!data.website && data.website.trim().length > 0;
      }
      return true;
    },
    {
      message: "Website is required",
      path: ["website"],
    },
  )
  .refine(
    (data) => {
      // Validate URL format for company website
      if (data.role === "company" && data.website) {
        try {
          new URL(data.website);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Please enter a valid URL ",
      path: ["website"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "applicant") {
        return !!data.fullName && data.fullName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Full name is required",
      path: ["fullName"],
    },
  );

// Forgot Password Schemas
export const forgotPasswordRequestSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export const forgotPasswordVerifyOTPSchema = z.object({
  email: z.email("Please enter a valid email"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resetPasswordSchema = z
  .object({
    email: z.email("Please enter a valid email"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
