"use client";

import { Command } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Role } from "@/app/generated/prisma";
import { applicantMenu, companyMenu } from "@/constants";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();

  // Don't render guest data while session is loading
  const user = session?.user
    ? {
        name: session.user.name || "Unknown User",
        email: session.user.email || "",
        avatar: session.user.image || "",
      }
    : status === "loading"
      ? {
          name: "Loading...",
          email: "",
          avatar: "",
        }
      : {
          name: "Guest",
          email: "guest@example.com",
          avatar: "",
        };

  // Get menu items based on user role
  const menuItems =
    session?.user.role === Role.COMPANY ? companyMenu : applicantMenu;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">AIVOX</span>
                  <span className="truncate text-xs">
                    {session?.user.role === Role.COMPANY
                      ? "Company"
                      : "Applicant"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
