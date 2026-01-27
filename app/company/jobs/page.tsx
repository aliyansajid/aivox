import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { JobListItem } from "@/components/jobs/job-list-item";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";

export default async function JobsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: {
        include: {
          jobs: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user?.company) {
    redirect("/onboarding/company");
  }

  const jobs = user.company.jobs;

  return (
    <div className="flex-1 p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jobs</h2>
          <p className="text-muted-foreground text-sm">
            Manage your job postings and AI interviews.
          </p>
        </div>
        <Button asChild>
          <Link href="/company/jobs/new">
            <PlusCircle />
            Post New Job
          </Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Empty>
          <EmptyTitle>No jobs posted</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t posted any jobs yet. Start hiring by creating your
            first job post.
          </EmptyDescription>
          <Button asChild variant="outline">
            <Link href="/company/jobs/new">
              <PlusCircle />
              Post Job
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobListItem key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
