"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { jobSchema } from "@/schemas";
import { JobLocationType, EmploymentType } from "@/app/generated/prisma";

// Helper function to get authenticated company
async function getAuthenticatedCompany() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { company: true },
  });

  if (!user?.company) {
    throw new Error("Company not found");
  }

  return user.company;
}

// Create Job
export async function createJob(data: z.infer<typeof jobSchema>) {
  try {
    // Validate data
    const validatedData = jobSchema.parse(data);

    // Get authenticated company
    const company = await getAuthenticatedCompany();

    // Verify assistant exists and belongs to company
    const assistant = await prisma.assistant.findFirst({
      where: {
        id: validatedData.assistantId,
        companyId: company.id,
      },
    });

    if (!assistant) {
      return {
        success: false,
        error:
          "Selected assistant not found or does not belong to your company",
      };
    }

    // Create job in database
    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: validatedData.title,
        employmentType: validatedData.employmentType as EmploymentType,
        locationType: validatedData.locationType as JobLocationType,
        location: validatedData.location,
        salaryRange: validatedData.salaryRange,
        assistantId: validatedData.assistantId,
        shortlistThreshold: validatedData.shortlistThreshold,
        description: validatedData.description,
        criteria: {
          matchThreshold: validatedData.shortlistThreshold,
        },
      },
    });

    revalidatePath("/company/jobs");

    return {
      success: true,
      message: "Job posted successfully",
      data: job,
    };
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error("Create job error:", error);
    }

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data. Please check your inputs.",
      };
    }

    return {
      success: false,
      error: "Failed to post job. Please try again.",
    };
  }
}

// Update Job
export async function updateJob(
  jobId: string,
  data: z.infer<typeof jobSchema>,
) {
  try {
    const validatedData = jobSchema.parse(data);
    const company = await getAuthenticatedCompany();

    // Verify job ownership
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existingJob || existingJob.companyId !== company.id) {
      return { success: false, error: "Job not found or unauthorized" };
    }

    // Verify assistant
    const assistant = await prisma.assistant.findFirst({
      where: {
        id: validatedData.assistantId,
        companyId: company.id,
      },
    });

    if (!assistant) {
      return {
        success: false,
        error: "Selected assistant not found or unauthorized",
      };
    }

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: validatedData.title,
        employmentType: validatedData.employmentType as EmploymentType,
        locationType: validatedData.locationType as JobLocationType,
        location: validatedData.location,
        salaryRange: validatedData.salaryRange,
        assistantId: validatedData.assistantId,
        shortlistThreshold: validatedData.shortlistThreshold,
        description: validatedData.description,
        criteria: {
          matchThreshold: validatedData.shortlistThreshold,
        },
      },
    });

    revalidatePath("/company/jobs");
    revalidatePath(`/company/jobs/${jobId}`);

    return {
      success: true,
      message: "Job updated successfully",
      data: job,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Update job error:", error);
    }
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid form data" };
    }
    return { success: false, error: "Failed to update job" };
  }
}

// Delete Job
export async function deleteJob(jobId: string) {
  try {
    const company = await getAuthenticatedCompany();

    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existingJob || existingJob.companyId !== company.id) {
      return { success: false, error: "Job not found or unauthorized" };
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    revalidatePath("/company/jobs");

    return {
      success: true,
      message: "Job deleted successfully",
    };
  } catch (error) {
    console.error("Delete job error:", error);
    return { success: false, error: "Failed to delete job" };
  }
}
