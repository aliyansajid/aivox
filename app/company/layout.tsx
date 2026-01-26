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

export default async function CompanyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/login");
  }

  // Check if user has COMPANY role
  if (session.user.role !== Role.COMPANY) {
    // Redirect to applicant dashboard if user is an applicant
    if (session.user.role === Role.APPLICANT) {
      redirect("/applicant");
    }
    // Fallback redirect to login if role is unknown
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen flex flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <DynamicBreadcrumb />
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
