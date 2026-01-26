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
import { applicantOnboardingSchema } from "@/schemas";
import { completeApplicantOnboarding } from "@/app/actions/onboarding-actions";
import { User, Briefcase, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type ApplicantOnboardingFormData = z.infer<typeof applicantOnboardingSchema>;

const EXPERIENCE_LEVELS = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

const POPULAR_SKILLS = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "TypeScript",
  "Java",
  "SQL",
  "AWS",
  "Docker",
  "Git",
  "C++",
  "Go",
];

export function ApplicantOnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const form = useForm<ApplicantOnboardingFormData>({
    resolver: zodResolver(applicantOnboardingSchema),
    defaultValues: {
      phone: "",
      location: "",
      currentTitle: "",
      experience: "",
      skills: [],
      cvUrl: "",
    },
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      const updatedSkills = [...skills, trimmedSkill];
      setSkills(updatedSkills);
      form.setValue("skills", updatedSkills, { shouldValidate: true });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(updatedSkills);
    form.setValue("skills", updatedSkills, { shouldValidate: true });
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof ApplicantOnboardingFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["phone", "location"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["currentTitle", "experience", "skills"];
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: ApplicantOnboardingFormData) => {
    setIsSubmitting(true);

    try {
      const result = await completeApplicantOnboarding(data);

      if (result.success) {
        toast.success(result.message);
        router.push("/applicant");
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
              Let's build your professional profile
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
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Personal Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Tell us about yourself
                    </p>
                  </div>
                </div>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="tel"
                  name="phone"
                  label="Phone Number"
                  placeholder="+1 (555) 123-4567"
                />

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="location"
                  label="Location"
                  placeholder="e.g. New York, NY"
                />
              </div>
            )}

            {/* Step 2: Professional Background */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Professional Background
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Share your experience and skills
                    </p>
                  </div>
                </div>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="text"
                  name="currentTitle"
                  label="Current Job Title"
                  placeholder="e.g. Senior Software Engineer"
                />

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.SELECT}
                  name="experience"
                  label="Years of Experience"
                  placeholder="Select your experience level"
                  selectOptions={EXPERIENCE_LEVELS}
                  className="w-full"
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Skills <span className="text-destructive">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Add your technical skills or select from popular ones
                  </p>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a skill and press Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(skillInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSkill(skillInput)}
                    >
                      Add
                    </Button>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/50">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="pl-3 pr-1 py-1.5"
                        >
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 ml-1 hover:bg-transparent"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Popular Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SKILLS.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {form.formState.errors.skills && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.skills.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Final Review */}
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
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{form.watch("phone")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{form.watch("location")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Title
                    </p>
                    <p className="font-medium">{form.watch("currentTitle")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">
                      {
                        EXPERIENCE_LEVELS.find(
                          (level) => level.value === form.watch("experience"),
                        )?.label
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  inputType="url"
                  name="cvUrl"
                  label="Resume/CV URL (Optional)"
                  placeholder="https://example.com/resume.pdf"
                />
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
