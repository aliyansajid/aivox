"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { jobSchema } from "@/schemas";
import { createJob, updateJob } from "@/app/actions/job-actions";
import { Assistant, Job } from "@/app/generated/prisma";
import { Bot, PlusCircle, Save } from "lucide-react";

interface JobPostingFormProps {
  assistants: Assistant[];
  initialData?: Job;
}

export function JobPostingForm({
  assistants,
  initialData,
}: JobPostingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || "",
      employmentType: (initialData?.employmentType as any) || "FULL_TIME",
      locationType: (initialData?.locationType as any) || "ONSITE",
      location: initialData?.location || "",
      salaryRange: initialData?.salaryRange || "",
      shortlistThreshold: initialData?.shortlistThreshold || 70,
      description: initialData?.description || "",
      assistantId: initialData?.assistantId || "",
    },
  });

  const locationType = form.watch("locationType");

  async function onSubmit(data: z.infer<typeof jobSchema>) {
    setIsLoading(true);
    try {
      let result;
      if (initialData) {
        result = await updateJob(initialData.id, data);
      } else {
        result = await createJob(data);
      }

      if (result.success) {
        toast.success(result.message);
        router.push("/company/jobs");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const employmentTypes = [
    { label: "Full Time", value: "FULL_TIME" },
    { label: "Part Time", value: "PART_TIME" },
    { label: "Contract", value: "CONTRACT" },
    { label: "Internship", value: "INTERNSHIP" },
  ];

  const locationTypes = [
    { label: "On-site", value: "ONSITE" },
    { label: "Remote", value: "REMOTE" },
    { label: "Hybrid", value: "HYBRID" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {initialData ? "Edit Job Posting" : "Create Job Posting"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {initialData
                ? "Update the job details below."
                : "Provide the details below to publish a new job opening."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  {initialData ? <Save /> : <PlusCircle />}
                  {initialData ? "Update Job" : "Post Job"}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  The core information about the position.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="title"
                  label="Job Title"
                  placeholder="e.g. Senior Software Engineer"
                />
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.TEXTAREA}
                  name="description"
                  label="Job Description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="min-h-96"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Screening Configuration</CardTitle>
                <CardDescription>
                  Setup how the AI assistant interacts with candidates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex gap-3">
                    <div>
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Bot size={16} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-medium text-sm">How it works</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        When a candidate applies, the selected AI assistant will
                        conduct a voice interview based on the job description.
                        Candidates achieving a score above the threshold will be
                        automatically shortlisted.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SELECT}
                    name="assistantId"
                    label="Select AI Assistant"
                    placeholder="Choose an assistant"
                    selectOptions={assistants.map((a) => ({
                      label: a.name,
                      value: a.id,
                    }))}
                    className="w-full"
                  />
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.SLIDER}
                    name="shortlistThreshold"
                    label="Shortlist Threshold"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="employmentType"
                  label="Employment Type"
                  placeholder="Select type"
                  selectOptions={employmentTypes}
                  className="w-full"
                />

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="locationType"
                  label="Location Type"
                  placeholder="Select type"
                  selectOptions={locationTypes}
                  className="w-full"
                />

                {locationType !== "REMOTE" && (
                  <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    inputType="text"
                    name="location"
                    label="Location"
                    placeholder="e.g. New York, NY"
                  />
                )}

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="salaryRange"
                  label="Salary Range"
                  placeholder="e.g. $100k - $120k"
                />
              </CardContent>
            </Card>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">
                Tips for a great job post
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-2 list-disc pl-4">
                <li>Be specific about the role's responsibilities.</li>
                <li>Clearly state the required skills and experience.</li>
                <li>Mention the benefits and perks of working with you.</li>
                <li>Keep the title clear and standard.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
