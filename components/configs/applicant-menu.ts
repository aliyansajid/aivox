import {
  LayoutDashboard,
  Search,
  FileText,
  Video,
  User,
  Settings,
  Clock,
  CheckCircle,
} from "lucide-react";

export const applicantMenu = [
  {
    title: "Dashboard",
    url: "/applicant",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Browse Jobs",
    url: "/applicant/jobs",
    icon: Search,
    items: [
      {
        title: "All Jobs",
        url: "/applicant/jobs",
      },
      {
        title: "Saved Jobs",
        url: "/applicant/jobs/saved",
      },
      {
        title: "Recommended",
        url: "/applicant/jobs/recommended",
      },
    ],
  },
  {
    title: "My Applications",
    url: "/applicant/applications",
    icon: FileText,
    items: [
      {
        title: "All Applications",
        url: "/applicant/applications",
      },
      {
        title: "In Progress",
        url: "/applicant/applications/in-progress",
        icon: Clock,
      },
      {
        title: "Shortlisted",
        url: "/applicant/applications/shortlisted",
        icon: CheckCircle,
      },
    ],
  },
  {
    title: "Interviews",
    url: "/applicant/interviews",
    icon: Video,
    items: [
      {
        title: "Upcoming",
        url: "/applicant/interviews/upcoming",
      },
      {
        title: "Completed",
        url: "/applicant/interviews/completed",
      },
    ],
  },
  {
    title: "Profile",
    url: "/applicant/profile",
    icon: User,
    items: [
      {
        title: "Personal Info",
        url: "/applicant/profile",
      },
      {
        title: "Resume/CV",
        url: "/applicant/profile/resume",
      },
      {
        title: "Skills",
        url: "/applicant/profile/skills",
      },
    ],
  },
  {
    title: "Settings",
    url: "/applicant/settings",
    icon: Settings,
    items: [
      {
        title: "Account",
        url: "/applicant/settings/account",
      },
      {
        title: "Notifications",
        url: "/applicant/settings/notifications",
      },
      {
        title: "Privacy",
        url: "/applicant/settings/privacy",
      },
    ],
  },
];
