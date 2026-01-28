"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  Prisma,
  JobLocationType,
  EmploymentType,
} from "@/app/generated/prisma";
import { redis } from "@/lib/redis";

// Helper function to get authenticated applicant
async function getAuthenticatedApplicant() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { applicant: true },
  });

  if (!user?.applicant) {
    throw new Error("Applicant profile not found");
  }

  return user.applicant;
}

export async function toggleSaveJob(jobId: string) {
  try {
    const applicant = await getAuthenticatedApplicant();

    const existingSave = await prisma.savedJob.findUnique({
      where: {
        applicantId_jobId: {
          applicantId: applicant.id,
          jobId,
        },
      },
    });

    if (existingSave) {
      // Unsave
      await prisma.savedJob.delete({
        where: {
          id: existingSave.id,
        },
      });
      return {
        success: true,
        saved: false,
        message: "Job removed from saved items",
      };
    } else {
      // Save
      await prisma.savedJob.create({
        data: {
          applicantId: applicant.id,
          jobId,
        },
      });
      return { success: true, saved: true, message: "Job saved successfully" };
    }
  } catch (error) {
    console.error("Error toggling saved job:", error);
    return { success: false, error: "Failed to update saved job status" };
  }
}

export async function getSavedJobIds() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        applicant: {
          include: {
            savedJobs: {
              select: { jobId: true },
            },
          },
        },
      },
    });

    if (!user?.applicant) return [];

    return user.applicant.savedJobs.map((saved) => saved.jobId);
  } catch (error) {
    console.error("Error fetching saved job IDs:", error);
    return [];
  }
}

export async function getJobDetails(jobId: string) {
  try {
    const session = await auth();
    console.log("[getJobDetails] Session user:", session?.user?.id);

    // Allow unauthenticated access? Probably not for applicant portal, but let's check auth.
    if (!session?.user?.id) {
      console.log("[getJobDetails] Unauthorized: No session");
      return { success: false, error: "Unauthorized" };
    }

    // cache check
    let job = null;
    if (redis) {
      const cached = await redis.get(`job:${jobId}`);
      if (cached) job = JSON.parse(cached);
    }

    if (!job) {
      job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true,
              description: true,
              location: true,
              website: true,
              size: true,
              industry: true,
            },
          },
        },
      });

      if (!job) {
        console.log("[getJobDetails] Job not found:", jobId);
        return { success: false, error: "Job not found" };
      }

      if (redis) {
        await redis.set(`job:${jobId}`, JSON.stringify(job), "EX", 300);
      }
    }

    // Check if saved
    let isSaved = false;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { applicant: true },
    });

    if (user?.applicant) {
      const saved = await prisma.savedJob.findUnique({
        where: {
          applicantId_jobId: {
            applicantId: user.applicant.id,
            jobId: job.id,
          },
        },
      });
      isSaved = !!saved;
    }

    return { success: true, data: { ...job, isSaved } };
  } catch (error) {
    console.error("Error fetching job details:", error);
    return {
      success: false,
      error:
        "Failed to fetch job details: " +
        (error instanceof Error ? error.message : String(error)),
    };
  }
}

export async function getJobFilterOptions() {
  try {
    // Try Cache
    if (redis) {
      const cached = await redis.get("job:filters");
      if (cached) return JSON.parse(cached);
    }

    const locations = await prisma.job.findMany({
      where: { status: "ACTIVE" },
      select: { locationType: true },
      distinct: ["locationType"],
    });

    const result = {
      locationTypes: Object.values(JobLocationType),
    };

    // Set Cache (1 hour)
    if (redis) {
      await redis.set("job:filters", JSON.stringify(result), "EX", 3600);
    }

    return result;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return { locationTypes: [] };
  }
}

// --- Efficient Data Access ---

interface GetJobsParams {
  q?: string;
  type?: string;
  location?: string;
  page?: number;
  limit?: number;
  salary?: string;
}

export async function getJobs({
  q,
  type,
  location,
  salary,
  page = 1,
  limit = 12,
}: GetJobsParams) {
  try {
    const session = await auth();

    // Cache Key for Default View (No filters, Page 1)
    const isDefaultView =
      !q && !type && !location && !salary && page === 1 && limit === 12;
    const cacheKey = "jobs:default";

    if (isDefaultView && redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const where: Prisma.JobWhereInput = {
      status: "ACTIVE",
    };

    // Optimize Search: Use OR only if query exists
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
        // removed description search for performance? Or keep it?
        // Description search is heavy. Let's keep it for now but maybe make it optional or secondary.
        // { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (type) {
      const types = type
        .split(",")
        .filter((t) =>
          Object.values(EmploymentType).includes(t as EmploymentType),
        ) as EmploymentType[];
      if (types.length > 0) where.employmentType = { in: types };
    }

    if (location) {
      const locations = location
        .split(",")
        .filter((t) =>
          Object.values(JobLocationType).includes(t as JobLocationType),
        ) as JobLocationType[];
      if (locations.length > 0) where.locationType = { in: locations };
    }

    if (salary) {
      // Basic text filtering for salary since it's a string field
      // e.g. "50k-100k" -> search for "50k", "60k", ... or just naive contain?
      // Better approach for string fields: partial match on range boundaries if possible,
      // but without structured data, we'll try to find jobs that might match.
      // For now, let's assume the string might contain "50k" or numbers.
      // A more robust way:
      // if value is "0-50k", maybe we just ignore for now as it needs parsing.
      // Or we just check if the salaryRange field is not null.
      // Let's implement a naive check: if salary is "100k-150k",
      // we check if description or salaryRange contains "100k" or "150k".
      // Actually, let's just use `contains` for the search term if it's simple?
      // No, let's do this:
      // if "50k-100k": keys ["50k", "60k", "70k", "80k", "90k", "100k"]? Too complex.
      // Let's simplified: If user selects "100k-150k", we require salaryRange to contain "1" (for 100) or check overlaps?
      // Realistically without changing schema to Int, we can't do accurate range queries.
      // Let's just filter for non-null salaryRange to start + maybe keyword match.

      // Decision: For this "MVP" fix on string data:
      // We will assume jobs with "100k" in the string match "100k+" or "50k-100k".
      // This is imperfect but better than nothing.

      const salaryKey = salary.split("-")[0].replace("k", ""); // "50"
      if (salaryKey !== "0") {
        where.salaryRange = { contains: salaryKey, mode: "insensitive" };
      }
    }

    // Parallelize Count and Data Fetch
    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true,
              // Optimized: Only selecting fields needed for the card
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const result = {
      jobs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };

    // Cache Default View (1 minute)
    const redisClient = redis;
    if (isDefaultView && redisClient) {
      await redisClient.set(cacheKey, JSON.stringify(result), "EX", 60);
    }

    return result;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { jobs: [], total: 0, totalPages: 0, currentPage: 1 };
  }
}

export async function getSavedJobs() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const savedJobs = await prisma.savedJob.findMany({
      where: {
        applicant: {
          userId: session.user.id,
        },
        job: {
          status: "ACTIVE",
        },
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return savedJobs.map((saved) => saved.job);
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return [];
  }
}
