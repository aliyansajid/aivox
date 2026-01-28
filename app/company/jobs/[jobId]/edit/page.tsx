import { redirect } from "next/navigation";
import { JobPostingForm } from "@/components/forms/job-posting-form";
import { getJobForEdit } from "@/app/actions/job-actions";

interface JobEditPageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function JobEditPage({ params }: JobEditPageProps) {
  const { jobId } = await params;
  const data = await getJobForEdit(jobId);

  if (!data) {
    redirect("/company/jobs");
  }

  return (
    <div className="flex-1 p-4">
      <JobPostingForm assistants={data.assistants} initialData={data.job} />
    </div>
  );
}
