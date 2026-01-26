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

// Company onboarding schema
export const companyOnboardingSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  size: z.string().min(1, "Company size is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
});

// Applicant onboarding schema
export const applicantOnboardingSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  currentTitle: z.string().min(1, "Current title is required"),
  experience: z.string().min(1, "Experience level is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  cvUrl: z.url("Must be a valid URL").optional().or(z.literal("")),
});

export const createAssistantSchema = z.object({
  name: z
    .string()
    .min(1, "Assistant name is required")
    .max(40, "Assistant name must be 40 characters or less"),
});

// Assistant schema
export const assistantSchema = z.object({
  name: z
    .string()
    .min(1, "Assistant name is required")
    .max(40, "Assistant name must be 40 characters or less"),
  provider: z.string().min(1, "Please select a model provider"),
  model: z.string().min(1, "Model is required"),
  voiceProvider: z.string().min(1, "Please select a voice provider"),
  voice: z.string().min(1, "Voice is required"),
  firstMessage: z.string().min(1, "First message is required"),
  systemPrompt: z
    .string()
    .min(50, "System prompt must be at least 50 characters"),
  endMessage: z.string().optional(),
});
