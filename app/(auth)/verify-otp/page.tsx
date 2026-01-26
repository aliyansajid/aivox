"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { VerifyOTPForm } from "@/components/forms/verify-otp-form";

const VerifyOTPPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

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
      <VerifyOTPForm email={email} />
    </Suspense>
  );
};

export default VerifyOTPPage;
