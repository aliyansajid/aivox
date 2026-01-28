"use client";

import { useState } from "react";
import { Job } from "@/app/generated/prisma";
import { CompanyJobsToolbar } from "./company-jobs-toolbar";
import { CompanyJobCard } from "./company-job-card";
import { PaginationControls } from "@/components/jobs/pagination-controls";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

interface CompanyJobsContentProps {
  jobs: (Job & { _count?: { applications: number } })[];
  totalPages: number;
  currentPage: number;
}

export function CompanyJobsContent({
  jobs,
  totalPages,
  currentPage,
}: CompanyJobsContentProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-col gap-6">
      <CompanyJobsToolbar viewMode={viewMode} setViewMode={setViewMode} />

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-lg bg-card/50 border-dashed animate-in fade-in-50">
          <Empty>
            <EmptyTitle>No jobs found</EmptyTitle>
            <EmptyDescription>
              We couldn&apos;t find any jobs matching your filters.
            </EmptyDescription>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/company/jobs/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Post New Job
              </Link>
            </Button>
          </Empty>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {jobs.map((job) => (
            <CompanyJobCard key={job.id} job={job} viewMode={viewMode} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <PaginationControls totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  );
}
