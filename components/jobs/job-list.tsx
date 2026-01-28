"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { Job } from "@/app/generated/prisma";
import { toggleSaveJob } from "@/app/actions/applicant-actions";
import { toast } from "sonner";

interface JobListProps {
  jobs: (Job & { company: { name: string; logoUrl?: string | null } })[];
  savedJobIds?: string[];
}

export function JobList({ jobs, savedJobIds = [] }: JobListProps) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const handleToggleSave = async (jobId: string) => {
    const result = await toggleSaveJob(jobId);
    if (!result.success) {
      toast.error(result.error);
      throw new Error(result.error);
    }
    toast.success(result.message);
  };

  const searchParams = useSearchParams();
  const showSidebar = !!searchParams.get("jobId");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div className="text-sm text-muted-foreground">
          Showing <strong>{jobs.length}</strong> jobs
        </div>
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={layout === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setLayout("grid")}
          >
            <LayoutGrid />
          </Button>
          <Button
            variant={layout === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setLayout("list")}
          >
            <List />
          </Button>
        </div>
      </div>

      <div
        className={
          layout === "grid"
            ? `grid grid-cols-1 md:grid-cols-2 ${showSidebar ? "" : "lg:grid-cols-3"} gap-4`
            : "flex flex-col gap-4"
        }
      >
        {jobs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No jobs found matching your criteria.
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              variant={layout}
              isSaved={savedJobIds.includes(job.id)}
              onToggleSave={handleToggleSave}
            />
          ))
        )}
      </div>
    </div>
  );
}
