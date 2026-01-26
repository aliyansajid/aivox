import {
  Search,
  User,
  Clock,
  CheckCircle,
  LayoutDashboard,
  Briefcase,
  FileText,
  Video,
  Settings,
  Plus,
  List,
  BarChart3,
  Bot,
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

export const companyMenu = [
  {
    title: "Dashboard",
    url: "/company",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Assistants",
    url: "/company/assistants",
    icon: Bot,
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

export const CONSTANTS = {
  HOSTING_COST: 0.05,
  TRANSCRIBE_COST: 0.01,
  PLATFORM_FEE_PERCENT: 0.2,
};

export const PROVIDERS = [
  { label: "OpenAI", value: "openai" },
  { label: "Anthropic", value: "anthropic" },
  { label: "Google", value: "google" },
  { label: "Xai", value: "xai" },
];

export const VOICE_PROVIDERS = [{ label: "Vapi", value: "vapi" }];

export interface Model {
  label: string;
  value: string;
  cost: number;
  badges: string[];
}

export const MODELS: Record<string, Model[]> = {
  openai: [
    {
      label: "GPT 5.2",
      value: "gpt-5.2",
      cost: 0.08,
      badges: ["Multimodal", "Standard", "Latest"],
    },
    {
      label: "GPT 5.2 Instant",
      value: "gpt-5.2-chat-latest",
      cost: 0.08,
      badges: ["Standard", "Latest"],
    },
    {
      label: "GPT 5.1",
      value: "gpt-5.1",
      cost: 0.08,
      badges: ["Multimodal", "Standard"],
    },
    {
      label: "GPT 5.1 Instant",
      value: "gpt-5.1-chat-latest",
      cost: 0.08,
      badges: ["Standard"],
    },
    {
      label: "GPT 5",
      value: "gpt-5",
      cost: 0.08,
      badges: ["Multimodal", "Standard"],
    },
    {
      label: "GPT 5 Instant",
      value: "gpt-5-chat-latest",
      cost: 0.08,
      badges: [],
    },
    {
      label: "GPT 5 Mini",
      value: "gpt-5-mini",
      cost: 0.02,
      badges: ["Balanced", "Mini"],
    },
    {
      label: "GPT 5 Nano",
      value: "gpt-5-nano",
      cost: 0.01,
      badges: ["Nano"],
    },
    {
      label: "GPT 4.1",
      value: "gpt-4.1",
      cost: 0.02,
      badges: ["Multimodal", "Standard"],
    },
    {
      label: "GPT 4.1 Nano",
      value: "gpt-4.1-nano",
      cost: 0.01,
      badges: ["Cheapest", "Nano"],
    },
    {
      label: "GPT 4.1 Mini",
      value: "gpt-4.1-mini",
      cost: 0.01,
      badges: ["Balanced", "Mini"],
    },
    {
      label: "GPT 4o Mini Cluster",
      value: "gpt-4o-mini",
      cost: 0.01,
      badges: ["Fastest", "Balanced", "Multimodal", "Mini"],
    },
    {
      label: "GPT 4o Cluster",
      value: "gpt-4o",
      cost: 0.02,
      badges: ["Multimodal", "Conversational", "Standard"],
    },
    {
      label: "GPT 4o (Latest) Cluster",
      value: "chatgpt-4o-latest",
      cost: 0.02,
      badges: ["Multimodal", "Conversational", "Latest"],
    },
    {
      label: "GPT Realtime Cluster",
      value: "gpt-realtime-2025-08-28",
      cost: 0.16,
      badges: ["Realtime", "Conversational", "Latest"],
    },
    {
      label: "GPT 4o Mini Realtime Preview Cluster",
      value: "gpt-4o-mini-realtime-preview-2024-12-17",
      cost: 0.04,
      badges: ["Realtime", "Mini", "Preview"],
    },
    {
      label: "GPT 4o Realtime Preview Cluster",
      value: "gpt-4o-realtime-preview-2024-12-17",
      cost: 0.16,
      badges: ["Realtime", "Multimodal", "Conversational", "Preview"],
    },
    {
      label: "GPT o3 Cluster",
      value: "o3",
      cost: 0.01,
      badges: ["Reasoning", "Standard", "Latest"],
    },
    {
      label: "GPT o3 Mini Cluster",
      value: "o3-mini",
      cost: 0.01,
      badges: ["Balanced", "Reasoning", "Mini", "Latest"],
    },
    {
      label: "GPT o4 Mini Cluster",
      value: "o4-mini",
      cost: 0.04,
      badges: ["Reasoning", "Mini", "Preview"],
    },
  ],
  anthropic: [
    {
      label: "Claude Sonnet 4",
      value: "claude-sonnet-4-20250514",
      cost: 0,
      badges: [],
    },
    {
      label: "Claude Sonnet 4.5",
      value: "claude-sonnet-4-5-20250929",
      cost: 0,
      badges: [],
    },
    {
      label: "Claude Haiku 4.5",
      value: "claude-haiku-4-5-20251001",
      cost: 0,
      badges: [],
    },
    {
      label: "Claude Opus 4",
      value: "claude-opus-4-20250514",
      cost: 0,
      badges: [],
    },
    {
      label: "Claude Opus 4.5",
      value: "claude-opus-4-5-20251101",
      cost: 0,
      badges: [],
    },
  ],
  google: [
    {
      label: "Gemini 3 Flash (preview)",
      value: "gemini-3-flash-preview",
      cost: 0,
      badges: [],
    },
    { label: "Gemini 3", value: "google/gemma-3-4b-it", cost: 0, badges: [] },
    { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro", cost: 0, badges: [] },
    {
      label: "Gemini 2.5 Flash",
      value: "gemini-2.5-flash",
      cost: 0,
      badges: [],
    },
    {
      label: "Gemini 2.5 Flash Lite",
      value: "gemini-2.5-flash-lite",
      cost: 0,
      badges: [],
    },
    {
      label: "Gemini 2.0 Flash",
      value: "gemini-2.0-flash",
      cost: 0,
      badges: [],
    },
    {
      label: "Gemini 2.0 Flash Multimodal Live API",
      value: "gemini-2.0-flash-realtime-exp",
      cost: 0,
      badges: [],
    },
    {
      label: "Gemini 2.5 Flash Thinking",
      value: "gemini-2.0-flash-thinking-exp",
      cost: 0,
      badges: [],
    },
  ],
  xai: [
    {
      label: "Grok-4-fast-reasoning",
      value: "grok-4-fast-reasoning",
      cost: 0,
      badges: [],
    },
    { label: "Grok-3", value: "grok-3", cost: 0, badges: [] },
  ],
};

export interface Voice {
  label: string;
  value: string; // voiceId
  provider: string;
  cost: number;
  badges: string[];
}

export const VOICES: Voice[] = [
  // Vapi Voices - Cost $0.022
  {
    label: "Tara",
    value: "Tara",
    provider: "vapi",
    cost: 0.022,
    badges: ["Conversational", "Clear"],
  },
  {
    label: "Leah",
    value: "Leah",
    provider: "vapi",
    cost: 0.022,
    badges: ["Warm", "Gentle"],
  },
  {
    label: "Dan",
    value: "Dan",
    provider: "vapi",
    cost: 0.022,
    badges: ["Casual", "Friendly"],
  },
  {
    label: "Zac",
    value: "Zac",
    provider: "vapi",
    cost: 0.022,
    badges: ["Enthusiastic", "Dynamic"],
  },
  {
    label: "Jess",
    value: "Jess",
    provider: "vapi",
    cost: 0.022,
    badges: ["Energetic", "Youthful"],
  },
  {
    label: "Mia",
    value: "Mia",
    provider: "vapi",
    cost: 0.022,
    badges: ["Professional", "Articulate"],
  },
  {
    label: "Zoe",
    value: "Zoe",
    provider: "vapi",
    cost: 0.022,
    badges: ["Calm", "Soothing"],
  },
  {
    label: "Leo",
    value: "Leo",
    provider: "vapi",
    cost: 0.022,
    badges: ["Authoritative", "Deep"],
  },
  {
    label: "Savannah",
    value: "Savannah",
    provider: "vapi",
    cost: 0.022,
    badges: ["25 years old female", "American", "Southern accent"],
  },
  {
    label: "Rohan",
    value: "Rohan",
    provider: "vapi",
    cost: 0.022,
    badges: ["24 years old male", "Indian american", "Bright", "Energetic"],
  },
  {
    label: "Elliot",
    value: "Elliot",
    provider: "vapi",
    cost: 0.022,
    badges: ["25 years old male", "Canadian", "Friendly", "Professional"],
  },
];

export const BADGE_COLORS: Record<
  string,
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "green"
  | "purple"
  | "orange"
  | "blue"
> = {
  // Green: Multimodal, Conversational, Realtime
  Multimodal: "green",
  Conversational: "green",
  Realtime: "green",
  // Purple: Standard, Mini, Nano
  Standard: "purple",
  Mini: "purple",
  Nano: "purple",
  // Orange: Latest, Preview
  Latest: "orange",
  Preview: "orange",
  // Blue: Balanced, Cheapest, Fastest
  Balanced: "blue",
  Cheapest: "blue",
  Fastest: "blue",
  Reasoning: "blue",
  // Default fallback for others
};
