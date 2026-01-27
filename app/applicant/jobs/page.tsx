import {
  Prisma,
  EmploymentType,
  JobLocationType,
} from "@/app/generated/prisma";
import prisma from "@/lib/prisma";
import { JobFilterSidebar } from "@/components/jobs/job-filter-sidebar";
import { JobList } from "@/components/jobs/job-list";

interface ApplicantJobsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    location?: string;
  }>;
}

export default async function ApplicantJobsPage({
  searchParams,
}: ApplicantJobsPageProps) {
  const params = await searchParams;
  const { q, type, location } = params;

  // Build filter conditions
  const where: Prisma.JobWhereInput = {
    status: "ACTIVE", // Only show active jobs
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { company: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (type) {
    const types = type
      .split(",")
      .filter((t) =>
        Object.values(EmploymentType).includes(t as EmploymentType),
      ) as EmploymentType[];

    if (types.length > 0) {
      where.employmentType = { in: types };
    }
  }

  if (location) {
    const locations = location
      .split(",")
      .filter((t) =>
        Object.values(JobLocationType).includes(t as JobLocationType),
      ) as JobLocationType[];

    if (locations.length > 0) {
      where.locationType = { in: locations };
    }
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      company: {
        select: {
          name: true,
          logoUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Browse Jobs</h1>
        <p className="text-muted-foreground text-sm">
          Find your next opportunity from top companies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <JobFilterSidebar />
        </aside>

        <section className="lg:col-span-3">
          <JobList jobs={jobs} />
        </section>
      </div>
    </div>
  );
}
