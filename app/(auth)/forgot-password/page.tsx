import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

const ForgotPasswordPage = () => {
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
      <ForgotPasswordForm />
    </Suspense>
  );
};

export default ForgotPasswordPage;
