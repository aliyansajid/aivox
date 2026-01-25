"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { VerifyOTPForm } from "@/components/forms/verify-otp-form";

function VerifyOTPContent() {
  const searchParams = useSearchParams();

  // Get only email from URL params (data stored server-side)
  const email = searchParams.get("email") || "";

  return <VerifyOTPForm email={email} />;
}

const VerifyOTPPage = () => {
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
};

export default VerifyOTPPage;
