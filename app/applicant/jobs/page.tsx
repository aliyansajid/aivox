import { Suspense } from "react";
import { JobFilterToolbar } from "@/components/jobs/job-filter-toolbar";
import { JobResults } from "@/components/jobs/job-results";
import { JobListSkeleton } from "@/components/jobs/job-list-skeleton";
import { getJobFilterOptions } from "@/app/actions/applicant-actions";

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
  const filterOptions = await getJobFilterOptions();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Search & Filter Toolbar - Now acts as the main header area */}
      <div className="flex flex-col gap-6 pt-8 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Connect with your next opportunity
          </h1>
          <p className="text-muted-foreground text-sm">
            Discover roles at top technology companies that match your skills
            and ambitions.
          </p>
        </div>

        <JobFilterToolbar locations={filterOptions.locationTypes} />
      </div>

      {/* Job List with Suspense */}
      <div className="flex-1 overflow-auto min-h-0 pb-10">
        <Suspense fallback={<JobListSkeleton />}>
          <JobResults searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
