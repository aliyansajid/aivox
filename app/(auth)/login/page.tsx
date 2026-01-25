import { Suspense } from "react";
import { AuthForm } from "@/components/forms/auth-form";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

const LoginPage = () => {
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
      <AuthForm type="login" />
    </Suspense>
  );
};

export default LoginPage;
