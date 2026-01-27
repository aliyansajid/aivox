import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { JobPostingForm } from "@/components/forms/job-posting-form";

export default async function NewJobPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get company and assistants
  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
      assistants: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) {
    redirect("/applicant");
  }

  return (
    <div className="flex-1 p-4">
      <JobPostingForm assistants={company.assistants} />
    </div>
  );
}
