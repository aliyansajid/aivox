import { Suspense } from "react";
import { getCompanyJobs } from "@/app/actions/job-actions";
import { CompanyJobsContent } from "./_components/company-jobs-content";
import Loading from "./loading";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    employmentType?: string;
    page?: string;
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 9; // Grid friendly

  const result = await getCompanyJobs({
    page,
    limit,
    search: params.search,
    status: params.status,
    employmentType: params.employmentType,
  });

  if (!result.success) {
    return (
      <div className="flex-1 p-8">
        <div className="text-destructive">Error: {result.error}</div>
      </div>
    );
  }

  const { jobs, pagination } = result.data;

  return (
    <div className="flex-1 px-4 py-8">
      <Suspense fallback={<Loading />}>
        <CompanyJobsContent
          jobs={jobs}
          totalPages={pagination.pages}
          currentPage={pagination.page}
        />
      </Suspense>
    </div>
  );
}
