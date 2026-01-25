"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { verifyOTPAndRegister, resendOTP } from "@/app/actions/auth";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Get email and user data from URL params
  const email = searchParams.get("email");
  const userData = searchParams.get("data");

  useEffect(() => {
    if (!email || !userData) {
      toast.error("Invalid verification link. Please sign up again.");
      router.push("/sign-up");
    }
  }, [email, userData, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    if (!email || !userData) return;

    setIsVerifying(true);

    try {
      const parsedUserData = JSON.parse(decodeURIComponent(userData));
      const result = await verifyOTPAndRegister(email, otp, parsedUserData);

      if (result.success) {
        toast.success(result.message);

        // Redirect to onboarding based on role
        const redirectPath =
          result.role === "COMPANY"
            ? "/company/onboarding"
            : "/applicant/onboarding";
        router.push(redirectPath);
      } else {
        toast.error(result.error);
        setOtp(""); // Clear OTP
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;

    setIsResending(true);

    try {
      const result = await resendOTP(email);

      if (result.success) {
        toast.success(result.message);
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        setOtp("");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full shadow-xl max-w-md">
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          Enter the verification code we sent to your email address:&nbsp;
          <strong>{email}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
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
            onClick={handleVerify}
            disabled={isVerifying || isResending || otp.length !== 6}
            className="w-full"
          >
            {isVerifying ? <Spinner /> : "Verify"}
          </Button>

          <Button
            onClick={handleResend}
            variant="secondary"
            disabled={!canResend || isResending || isVerifying}
            className="w-full"
          >
            {isResending ? <Spinner /> : "Resend code"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full shadow-xl max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Spinner />
          </CardContent>
        </Card>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
