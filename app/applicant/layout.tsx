import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@/app/generated/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { JobProvider } from "@/components/jobs/job-provider";
import { SidebarRight } from "@/components/sidebar-right";

export default async function ApplicantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/login");
  }

  // Check if user has APPLICANT role
  if (session.user.role !== Role.APPLICANT) {
    // Redirect to company dashboard if user is a company
    if (session.user.role === Role.COMPANY) {
      redirect("/company");
    }
    // Fallback redirect to login if role is unknown
    redirect("/login");
  }

  return (
    <JobProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
        <SidebarRight />
      </SidebarProvider>
    </JobProvider>
  );
}
