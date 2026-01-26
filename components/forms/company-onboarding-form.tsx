"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomFormField, FormFieldType } from "@/components/custom-form-field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { companyOnboardingSchema } from "@/schemas";
import { completeCompanyOnboarding } from "@/app/actions/onboarding-actions";
import { Building2, FileText, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type CompanyOnboardingFormData = z.infer<typeof companyOnboardingSchema>;

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Construction",
  "Real Estate",
  "Marketing & Advertising",
  "Consulting",
  "Legal",
  "Other",
];

export function CompanyOnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyOnboardingFormData>({
    resolver: zodResolver(companyOnboardingSchema),
    defaultValues: {
      industry: "",
      size: "",
      location: "",
      description: "",
    },
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    let fieldsToValidate: (keyof CompanyOnboardingFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["industry", "size"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["location", "description"];
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: CompanyOnboardingFormData) => {
    setIsSubmitting(true);

    try {
      const result = await completeCompanyOnboarding(data);

      if (result.success) {
        toast.success(result.message);
        router.push("/company");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl max-w-lg">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Welcome to AIVOX</CardTitle>
            <CardDescription>
              Let's set up your company profile to get started
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Tell us about your company
                    </p>
                  </div>
                </div>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="industry"
                  label="Industry"
                  placeholder="Select your industry"
                  selectOptions={INDUSTRIES.map((industry) => ({
                    label: industry,
                    value: industry,
                  }))}
                  className="w-full"
                />

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="size"
                  label="Company Size"
                  placeholder="Select company size"
                  selectOptions={COMPANY_SIZES}
                  className="w-full"
                />
              </div>
            )}

            {/* Step 2: Description */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Company Description
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Help candidates learn about your company
                    </p>
                  </div>
                </div>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="location"
                  label="Headquarters Location"
                  placeholder="e.g. San Francisco, CA"
                />

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.TEXTAREA}
                  name="description"
                  label="About Your Company"
                  placeholder="Tell us about your company, mission, values, and culture..."
                />
              </div>
            )}

            {/* Step 3: Review & Complete */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Review & Complete</h3>
                    <p className="text-sm text-muted-foreground">
                      Review your information before completing
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{form.watch("industry")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Company Size
                    </p>
                    <p className="font-medium">{form.watch("size")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{form.watch("location")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium text-sm">
                      {form.watch("description")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Back
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext} className="flex-1">
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? <Spinner /> : "Complete Onboarding"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
