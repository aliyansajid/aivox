export interface CostBreakdown {
  hosting: number;
  transcribe: number;
  model: number;
  voice: number;
  total: number;
  currency: string;
}

// Fixed Costs
export const COSTS = {
  HOSTING: 0.05,
  TRANSCRIBE: 0.01,
};

// Model Costs Map (Exact ID -> Cost)
export const MODEL_Costs: Record<string, number> = {
  // OpenAI
  "gpt-5.2": 0.08,
  "gpt-5.2-chat-latest": 0.08,
  "gpt-5.1": 0.08,
  "gpt-5.1-chat-latest": 0.08,
  "gpt-5": 0.08,
  "gpt-5-chat-latest": 0.08,
  "gpt-5-mini": 0.02,
  "gpt-5-nano": 0.01,
  "gpt-4.1": 0.02,
  "gpt-4.1-nano": 0.01,
  "gpt-4.1-mini": 0.01,
  "gpt-4o-mini": 0.01,
  "gpt-4o": 0.02,
  "chatgpt-4o-latest": 0.02,
  "gpt-realtime-2025-08-28": 0.16,
  "gpt-4o-mini-realtime-preview-2024-12-17": 0.04,
  "gpt-4o-realtime-preview-2024-12-17": 0.16,
  o3: 0.01,
  "o3-mini": 0.01,
  "o4-mini": 0.04,

  // Anthropic
  "claude-sonnet-4-20250514": 0,
  "claude-sonnet-4-5-20250929": 0,
  "claude-haiku-4-5-20251001": 0,
  "claude-opus-4-20250514": 0,
  "claude-opus-4-5-20251101": 0,

  // Google
  "gemini-3-flash-preview": 0,
  "google/gemma-3-4b-it": 0,
  "gemini-2.5-pro": 0,
  "gemini-2.5-flash": 0,
  "gemini-2.5-flash-lite": 0,
  "gemini-2.0-flash": 0,
  "gemini-2.0-flash-realtime-exp": 0,
  "gemini-2.0-flash-thinking-exp": 0,

  // XAI
  "grok-4-fast-reasoning": 0,
  "grok-3": 0,
};

// Supported Models List (Filters)
export const SUPPORTED_MODELS = Object.keys(MODEL_Costs);

// Voice Costs Map (Provider -> Cost)
export const VOICE_PROVIDER_COSTS: Record<string, number> = {
  vapi: 0.022,
};

// Supported Voice Providers
export const SUPPORTED_VOICE_PROVIDERS = ["vapi"];

// Specific Vapi Voices Whitelist
export const VAPI_VOICE_WHITELIST = [
  "Tara",
  "Leah",
  "Dan",
  "Zac",
  "Jess",
  "Mia",
  "Zoe",
  "Leo",
  "Savannah",
  "Rohan",
  "Elliot",
];

export function calculateCostBreakdown(
  provider?: string,
  model?: string,
  voiceProvider?: string,
): CostBreakdown {
  const breakdown: CostBreakdown = {
    hosting: COSTS.HOSTING,
    transcribe: COSTS.TRANSCRIBE,
    model: 0,
    voice: 0,
    total: 0,
    currency: "USD",
  };

  if (model && MODEL_Costs[model]) {
    breakdown.model = MODEL_Costs[model];
  }

  if (voiceProvider) {
    const vProvider = voiceProvider.toLowerCase();
    if (VOICE_PROVIDER_COSTS[vProvider]) {
      breakdown.voice = VOICE_PROVIDER_COSTS[vProvider];
    }
  }

  breakdown.total =
    breakdown.hosting +
    breakdown.transcribe +
    breakdown.model +
    breakdown.voice;

  return breakdown;
}

export function isSupportedModel(model: string): boolean {
  return SUPPORTED_MODELS.includes(model);
}

export function isSupportedVoice(
  voiceProvider: string,
  voiceValue: string,
): boolean {
  const vp = voiceProvider.toLowerCase();

  if (vp === "vapi") {
    return VAPI_VOICE_WHITELIST.includes(voiceValue);
  }

  return false;
}
