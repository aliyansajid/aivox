import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@/app/generated/prisma";
import { ApplicantOnboardingForm } from "@/components/forms/applicant-onboarding-form";

export default async function ApplicantOnboardingPage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user is an applicant
  if (session.user.role !== Role.APPLICANT) {
    redirect("/company");
  }

  return <ApplicantOnboardingForm />;
}
