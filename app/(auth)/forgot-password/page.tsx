"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPasswordRequestSchema } from "@/schemas";

// Schema for password form only (without email and otp)
const passwordOnlySchema = z
  .object({
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
import {
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
} from "@/app/actions/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomFormField, FormFieldType } from "@/components/custom-form-field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AnimatedSuccess } from "@/components/ui/animated-success";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type ForgotPasswordStep = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const router = useRouter();

  // Step 1: Email form
  const emailForm = useForm<z.infer<typeof forgotPasswordRequestSchema>>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  // Step 3: Password form
  const passwordForm = useForm<z.infer<typeof passwordOnlySchema>>({
    resolver: zodResolver(passwordOnlySchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle email submission
  async function handleEmailSubmit(
    values: z.infer<typeof forgotPasswordRequestSchema>,
  ) {
    setIsLoading(true);
    try {
      const result = await sendForgotPasswordOTP(values);

      if (result.success) {
        setEmail(values.email);
        toast.success(result.message);
        setStep("otp");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Email submit error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle OTP submission
  async function handleOTPSubmit() {
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyForgotPasswordOTP({
        email,
        otp: otpValue,
      });

      if (result.success) {
        toast.success("Code verified successfully");
        setStep("password");
      } else {
        toast.error(result.error);
        setOtpValue("");
      }
    } catch (error) {
      console.error("OTP submit error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  // Handle password reset submission
  async function handlePasswordSubmit(
    values: z.infer<typeof passwordOnlySchema>,
  ) {
    setIsLoading(true);
    try {
      const result = await resetPassword({
        email,
        otp: otpValue,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      if (result.success) {
        toast.success(result.message);
        setStep("success");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle resend OTP
  async function handleResendOTP() {
    setIsResending(true);
    try {
      const result = await sendForgotPasswordOTP({ email });

      if (result.success) {
        toast.success("New code sent to your email");
        setOtpValue("");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card className="w-full shadow-xl max-w-md">
      <CardHeader>
        <CardTitle>
          {step === "email" && "Forgot Password?"}
          {step === "otp" && "Enter Verification Code"}
          {step === "password" && "Create New Password"}
          {step === "success" && "Password Reset Successful"}
        </CardTitle>
        <CardDescription>
          {step === "email" &&
            "Enter your email address and we'll send you a verification code"}
          {step === "otp" &&
            `We've sent a verification code to ${email}. Please check your inbox.`}
          {step === "password" && "Enter your new password below"}
          {step === "success" && "You can now sign in with your new password"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Step 1: Email Input */}
        {step === "email" && (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="space-y-6"
            >
              <CustomFormField
                control={emailForm.control}
                fieldType={FormFieldType.INPUT}
                inputType="email"
                name="email"
                label="Email"
                placeholder="e.g. m@example.com"
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Send Verification Code"}
              </Button>
            </form>
          </Form>
        )}

        {/* Step 2: OTP Input */}
        {step === "otp" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(value) => setOtpValue(value)}
              >
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator className="mx-2" />
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleOTPSubmit}
                disabled={isVerifying || isResending || otpValue.length !== 6}
                className="w-full"
              >
                {isVerifying ? <Spinner /> : "Verify"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleResendOTP}
                disabled={isVerifying || isResending}
              >
                {isResending ? <Spinner /> : "Resend code"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Password Input */}
        {step === "password" && (
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-6"
            >
              <CustomFormField
                control={passwordForm.control}
                fieldType={FormFieldType.INPUT}
                inputType="password"
                name="password"
                label="New Password"
                placeholder="********"
                showPasswordStrength={true}
              />

              <CustomFormField
                control={passwordForm.control}
                fieldType={FormFieldType.INPUT}
                inputType="password"
                name="confirmPassword"
                label="Confirm New Password"
                placeholder="********"
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Reset Password"}
              </Button>
            </form>
          </Form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <AnimatedSuccess />
            </div>

            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully. You can now sign in
              with your new password.
            </p>

            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
