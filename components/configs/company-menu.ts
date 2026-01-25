import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Video,
  Settings,
  Plus,
  List,
  Users,
  BarChart3,
} from "lucide-react";

export const companyMenu = [
  {
    title: "Dashboard",
    url: "/company",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Jobs",
    url: "/company/jobs",
    icon: Briefcase,
    items: [
      {
        title: "Post New Job",
        url: "/company/jobs/new",
        icon: Plus,
      },
      {
        title: "All Jobs",
        url: "/company/jobs",
        icon: List,
      },
    ],
  },
  {
    title: "Applications",
    url: "/company/applications",
    icon: FileText,
    items: [
      {
        title: "All Applications",
        url: "/company/applications",
      },
      {
        title: "Shortlisted",
        url: "/company/applications/shortlisted",
      },
      {
        title: "Rejected",
        url: "/company/applications/rejected",
      },
    ],
  },
  {
    title: "Interviews",
    url: "/company/interviews",
    icon: Video,
    items: [
      {
        title: "Scheduled",
        url: "/company/interviews/scheduled",
      },
      {
        title: "Completed",
        url: "/company/interviews/completed",
      },
      {
        title: "Reports",
        url: "/company/interviews/reports",
      },
    ],
  },
  {
    title: "Analytics",
    url: "/company/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/company/settings",
    icon: Settings,
    items: [
      {
        title: "Company Profile",
        url: "/company/settings/profile",
      },
      {
        title: "Team",
        url: "/company/settings/team",
      },
      {
        title: "Billing",
        url: "/company/settings/billing",
      },
    ],
  },
];
