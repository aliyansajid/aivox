import { JobList } from "@/components/jobs/job-list";
import { getSavedJobIds, getJobs } from "@/app/actions/applicant-actions";

import { PaginationControls } from "@/components/jobs/pagination-controls";

interface JobResultsProps {
  searchParams: {
    q?: string;
    type?: string;
    location?: string;
    salary?: string;
    page?: string;
  };
}

export async function JobResults({ searchParams }: JobResultsProps) {
  const { q, type, location, page } = searchParams;
  const currentPage = Number(page) || 1;
  const LIMIT = 12;

  // Parallel fetch: Saved IDs and Jobs
  const [savedJobIds, { jobs, totalPages }] = await Promise.all([
    getSavedJobIds(),
    getJobs({
      q,
      type,
      location,
      salary: searchParams.salary,
      page: currentPage,
      limit: LIMIT,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <JobList jobs={jobs} savedJobIds={savedJobIds} />
      <PaginationControls totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
