"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { jobSchema } from "@/schemas";
import {
  JobLocationType,
  EmploymentType,
  Prisma,
} from "@/app/generated/prisma";
import { redis } from "@/lib/redis";

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

    // Invalidate Cache
    const redisClient = redis;
    if (redisClient) {
      await redisClient.del("jobs:default");
      await redisClient.del("job:filters");
    }

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

    // Invalidate Cache
    const redisClient = redis;
    if (redisClient) {
      await redisClient.del("jobs:default");
      await redisClient.del("job:filters");
      await redisClient.del(`job:${jobId}`);
      await redisClient.del(`jobs:company:${company.id}`); // Invalidate company-specific job list
    }

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

    // Invalidate Cache
    const redisClient = redis;
    if (redisClient) {
      await redisClient.del("jobs:default");
      await redisClient.del(`job:${jobId}`);
    }

    return {
      success: true,
      message: "Job deleted successfully",
    };
  } catch (error) {
    console.error("Delete job error:", error);
    return { success: false, error: "Failed to delete job" };
  }
}

// Get Company Jobs with filters and pagination
export async function getCompanyJobs({
  page = 1,
  limit = 10,
  search,
  status,
  employmentType,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  employmentType?: string;
} = {}) {
  try {
    const company = await getAuthenticatedCompany();
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      companyId: company.id,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (employmentType && employmentType !== "ALL") {
      where.employmentType = employmentType;
    }

    // Execute query
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      },
    };
  } catch (error) {
    console.error("Get company jobs error:", error);
    return {
      success: false,
      error: "Failed to fetch jobs",
      data: {
        jobs: [],
        pagination: { total: 0, pages: 0, page: 1, limit: 10 },
      },
    };
  }
}

// Duplicate Job
export async function duplicateJob(jobId: string) {
  try {
    const company = await getAuthenticatedCompany();

    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existingJob || existingJob.companyId !== company.id) {
      return { success: false, error: "Job not found or unauthorized" };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, status, ...jobData } = existingJob;

    const newJob = await prisma.job.create({
      data: {
        ...jobData,
        title: `${jobData.title} (Copy)`,
        status: "ACTIVE",
        criteria: jobData.criteria ?? Prisma.JsonNull,
        interviewQuestions: jobData.interviewQuestions ?? Prisma.JsonNull,
      },
    });

    revalidatePath("/company/jobs");
    return { success: true, message: "Job duplicated", data: newJob };
  } catch (error) {
    console.error("Duplicate job error:", error);
    return { success: false, error: "Failed to duplicate job" };
  }
}

export async function getCompanyAssistants() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      include: {
        assistants: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return company?.assistants || [];
  } catch (error) {
    console.error("Error fetching assistants:", error);
    return [];
  }
}

export async function getJobForEdit(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: {
          include: {
            assistants: true,
          },
        },
      },
    });

    if (!user?.company) return null;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.companyId !== user.company.id) {
      return null;
    }

    return {
      job,
      assistants: user.company.assistants,
    };
  } catch (error) {
    console.error("Error fetching job for edit:", error);
    return null;
  }
}
