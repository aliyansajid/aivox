import { getSavedJobIds, getSavedJobs } from "@/app/actions/applicant-actions";
import { JobList } from "@/components/jobs/job-list";

export default async function SavedJobsPage() {
  // Parallel fetch: Saved Job IDs (for heart icon) and Saved Job Details
  const [savedJobIds, jobs] = await Promise.all([
    getSavedJobIds(),
    getSavedJobs(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground text-sm">
          Jobs you have bookmarked for later.
        </p>
      </div>

      <JobList jobs={jobs} savedJobIds={savedJobIds} />
    </div>
  );
}
