import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { JobPostingForm } from "@/components/forms/job-posting-form";

interface JobEditPageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function JobEditPage({ params }: JobEditPageProps) {
  const session = await auth();
  const { jobId } = await params;

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
          assistants: true,
        },
      },
    },
  });

  if (!user?.company) {
    redirect("/onboarding/company");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    redirect("/company/jobs");
  }

  // Ensure company owns this job
  if (job.companyId !== user.company.id) {
    redirect("/company/jobs");
  }

  return (
    <div className="flex-1 p-4">
      <JobPostingForm assistants={user.company.assistants} initialData={job} />
    </div>
  );
}
