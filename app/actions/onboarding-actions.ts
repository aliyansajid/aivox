"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  companyOnboardingSchema,
  applicantOnboardingSchema,
} from "@/schemas";

// Server action to update company onboarding
export async function completeCompanyOnboarding(
  data: z.infer<typeof companyOnboardingSchema>,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Validate data
    const validatedData = companyOnboardingSchema.parse(data);

    // Find company by userId
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });

    if (!company) {
      return {
        success: false,
        error: "Company profile not found",
      };
    }

    // Update company with onboarding data
    await prisma.company.update({
      where: { id: company.id },
      data: {
        industry: validatedData.industry,
        size: validatedData.size,
        location: validatedData.location,
        description: validatedData.description,
        onboardingComplete: true,
      },
    });

    // Revalidate company dashboard
    revalidatePath("/company");

    return {
      success: true,
      message: "Onboarding completed successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data",
      };
    }

    if (process.env.NODE_ENV === "development") {
      console.error("Error in completeCompanyOnboarding:", error);
    }
    return {
      success: false,
      error: "Failed to complete onboarding. Please try again.",
    };
  }
}

// Server action to update applicant onboarding
export async function completeApplicantOnboarding(
  data: z.infer<typeof applicantOnboardingSchema>,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Validate data
    const validatedData = applicantOnboardingSchema.parse(data);

    // Find applicant by userId
    const applicant = await prisma.applicant.findUnique({
      where: { userId: session.user.id },
    });

    if (!applicant) {
      return {
        success: false,
        error: "Applicant profile not found",
      };
    }

    // Update applicant with onboarding data
    await prisma.applicant.update({
      where: { id: applicant.id },
      data: {
        phone: validatedData.phone,
        location: validatedData.location,
        currentTitle: validatedData.currentTitle,
        experience: validatedData.experience,
        skills: validatedData.skills,
        cvUrl: validatedData.cvUrl || null,
        onboardingComplete: true,
      },
    });

    // Revalidate applicant dashboard
    revalidatePath("/applicant");

    return {
      success: true,
      message: "Onboarding completed successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data",
      };
    }

    if (process.env.NODE_ENV === "development") {
      console.error("Error in completeApplicantOnboarding:", error);
    }
    return {
      success: false,
      error: "Failed to complete onboarding. Please try again.",
    };
  }
}

// Get company onboarding status
export async function getCompanyOnboardingStatus() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { onboardingComplete: false };
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      select: { onboardingComplete: true },
    });

    return { onboardingComplete: company?.onboardingComplete || false };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in getCompanyOnboardingStatus:", error);
    }
    return { onboardingComplete: false };
  }
}

// Get applicant onboarding status
export async function getApplicantOnboardingStatus() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { onboardingComplete: false };
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId: session.user.id },
      select: { onboardingComplete: true },
    });

    return { onboardingComplete: applicant?.onboardingComplete || false };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in getApplicantOnboardingStatus:", error);
    }
    return { onboardingComplete: false };
  }
}
