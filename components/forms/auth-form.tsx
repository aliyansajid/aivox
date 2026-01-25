"use client";

import { z } from "zod";
import { loginFormSchema, signUpFormSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  sendSignupOTP,
  loginWithCredentials,
  signInWithOAuth,
} from "@/app/actions/auth-actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { CustomFormField, FormFieldType } from "../custom-form-field";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Form, FormLabel } from "../ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Spinner } from "../ui/spinner";
import { Building, User } from "lucide-react";

type AuthFormType = "login" | "signup";

interface AuthFormProps {
  type: AuthFormType;
}

export const AuthForm = ({ type }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || null;

  const isLogin = type === "login";

  const form = useForm<
    z.infer<typeof loginFormSchema> | z.infer<typeof signUpFormSchema>
  >({
    resolver: zodResolver(isLogin ? loginFormSchema : signUpFormSchema),
    defaultValues: isLogin
      ? {
          email: "",
          password: "",
        }
      : ({
          role: "company",
          email: "",
          password: "",
          confirmPassword: "",
          companyName: "",
          fullName: "",
          website: "",
        } as z.infer<typeof signUpFormSchema>),
  });

  const role = !isLogin
    ? (form.watch("role") as "company" | "applicant")
    : null;

  // Handle tab change to reset form and update role
  function handleTabChange(value: string) {
    const newRole = value as "company" | "applicant";
    form.setValue("role", newRole);

    // Reset fields except role when switching tabs
    form.reset({
      role: newRole,
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      fullName: "",
      website: "",
    });
  }

  async function handleSubmit(
    values: z.infer<typeof loginFormSchema> | z.infer<typeof signUpFormSchema>,
  ) {
    setIsLoading(true);
    try {
      if (isLogin) {
        // Login with credentials
        const loginData = values as z.infer<typeof loginFormSchema>;
        const result = await loginWithCredentials(
          loginData.email,
          loginData.password,
        );

        if (result.success) {
          toast.success(result.message);
          // Redirect to callback URL or role-based dashboard
          const redirectUrl = callbackUrl || result.redirectUrl || "/";
          router.push(redirectUrl);
        } else {
          toast.error(result.error);
        }
      } else {
        // Signup flow with OTP verification
        const signupData = values as z.infer<typeof signUpFormSchema>;
        const result = await sendSignupOTP(signupData);

        if (result.success) {
          toast.success(result.message);

          // Redirect to OTP verification page with only email (data stored server-side)
          const params = new URLSearchParams({
            email: signupData.email,
          });
          router.push(`/verify-otp?${params.toString()}`);
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      // Don't log errors on client side
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuthSignIn(provider: "google" | "linkedin") {
    try {
      setIsLoading(true);
      await signInWithOAuth(provider);
    } catch (error) {
      // Don't log errors on client side
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-xl max-w-md">
      <CardHeader>
        <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Sign in to your AIVOX account"
            : "Choose your account type and get started"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {!isLogin ? (
              // Sign-up form with role tabs
              <>
                <Tabs
                  defaultValue="company"
                  onValueChange={handleTabChange}
                  className="flex gap-6"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="company">
                      <Building />
                      Company
                    </TabsTrigger>
                    <TabsTrigger value="applicant">
                      <User />
                      Applicant
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="company" className="space-y-6">
                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      inputType="text"
                      name="companyName"
                      label="Company Name"
                      placeholder="e.g. Acme Corp"
                    />

                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      inputType="url"
                      name="website"
                      label="Company Website"
                      placeholder="e.g. https://example.com"
                    />

                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      inputType="email"
                      name="email"
                      label="Work Email"
                      placeholder="e.g. m@company.com"
                    />

                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      inputType="password"
                      name="password"
                      label="Password"
                      placeholder="********"
                      showPasswordStrength={true}
                    />

                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      inputType="password"
                      name="confirmPassword"
                      label="Confirm Password"
                      placeholder="********"
                    />
                  </TabsContent>

                  <TabsContent value="applicant" className="space-y-6">
                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      inputType="text"
                      name="fullName"
                      label="Full Name"
                      placeholder="e.g. John Doe"
                    />

                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      inputType="email"
                      name="email"
                      label="Email"
                      placeholder="e.g. m@example.com"
                    />

                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      inputType="password"
                      name="password"
                      label="Password"
                      placeholder="********"
                      showPasswordStrength={true}
                    />

                    <CustomFormField
                      control={form.control}
                      fieldType={FormFieldType.INPUT}
                      inputType="password"
                      name="confirmPassword"
                      label="Confirm Password"
                      placeholder="********"
                    />
                  </TabsContent>
                </Tabs>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Spinner />
                  ) : role === "company" ? (
                    "Create Company Account"
                  ) : (
                    "Create Applicant Account"
                  )}
                </Button>
              </>
            ) : (
              // Login form
              <>
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="email"
                  name="email"
                  label="Email"
                  placeholder="e.g. m@example.com"
                />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="password"
                    name="password"
                    placeholder="********"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Log in"}
                </Button>
              </>
            )}
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-muted-foreground">
              or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleOAuthSignIn("linkedin")}
            disabled={isLoading}
          >
            <svg className="h-4 w-4" fill="#0A66C2" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </Button>
        </div>

        {!isLogin && (
          <p className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our&nbsp;
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>
            &nbsp;and&nbsp;
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              Don't have an account?&nbsp;
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?&nbsp;
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
