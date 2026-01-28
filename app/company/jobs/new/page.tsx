import { JobPostingForm } from "@/components/forms/job-posting-form";
import { getCompanyAssistants } from "@/app/actions/job-actions";

export default async function NewJobPage() {
  const assistants = await getCompanyAssistants();

  return (
    <div className="flex-1 p-4">
      <JobPostingForm assistants={assistants} />
    </div>
  );
}
