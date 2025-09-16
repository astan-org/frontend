import type { HarmType, PlatformSelect, IncidentClassification, IncidentFormData } from "@/types"

// Harm Types
export const HARM_TYPES: HarmType[] = ["Hacked", "Impersonation", "NCII", "Fraud_and_Scams"]

// All Platforms for General Selection Dropdown
export const ALL_PLATFORMS_SELECT: PlatformSelect[] = [
  "Instagram",
  "Facebook",
  "Messenger",
  "WhatsApp",
]

// Platforms for Dynamic Questions
export const PLATFORMS_DYNAMIC = ["Instagram", "Facebook", "Messenger", "WhatsApp"]

// Secondary Incident Classification
export const INCIDENT_CLASSIFICATIONS: IncidentClassification[] = [
  "Sale of illegal goods",
  "Harassment",
  "Hate Speech",
  "Spam",
  "Nudity",
  "Violence",
  "Scam",
  "False Information",
  "Something else",
]

// Platform-specific field requirements based on harm type
export const PLATFORM_HARM_REQUIREMENTS: Record<PlatformSelect, Partial<Record<HarmType, string[]>>> = {
  Instagram: {
    Hacked: ["victimUrl", "emailUsedToOpen", "newEmailToRecover"],
    Impersonation: ["fakeAccountUrls", "realAccountUrl"],
    NCII: ["nciiUrls", "victimUrlOrPhone"],
    Fraud_and_Scams: ["fraudEvidenceUrl", "victimUrlOrPhone"],
  },
  Facebook: {
    Hacked: ["victimUrl", "emailUsedToOpen", "newEmailToRecover"],
    Impersonation: ["fakeAccountUrls", "realAccountUrl"],
    NCII: ["nciiUrls", "victimUrlOrPhone"],
    Fraud_and_Scams: ["fraudEvidenceUrl", "victimUrlOrPhone"],
  },
  Messenger: {
    Hacked: ["victimUrl", "emailUsedToOpen", "newEmailToRecover"],
    Impersonation: ["fakeAccountUrls", "realAccountUrl"],
    NCII: ["nciiUrls", "victimUrlOrPhone"],
    Fraud_and_Scams: ["fraudEvidenceUrl", "victimUrlOrPhone"],
  },
  WhatsApp: {
    Hacked: ["victimPhoneNumber", "victimEmailAddress"],
    Impersonation: ["victimPhoneNumber", "victimEmailAddress"],
    NCII: ["victimPhoneNumber", "victimEmailAddress"],
    Fraud_and_Scams: ["victimPhoneNumber", "victimEmailAddress"],
  },
  Twitter: {},
  LinkedIn: {},
  Reddit: {},
  Tumblr: {},
  WeChat: {},
  TikTok: {},
  Other: {},
}

// Field labels for platform-specific requirements
export const PLATFORM_HARM_FIELD_LABELS: Record<string, string> = {
  victimUrl: "URL(s) of the victim",
  emailUsedToOpen: "Email used to open the account",
  newEmailToRecover: "Brand new email to recover the account",
  fakeAccountUrls: "URL(s) of the fake accounts",
  realAccountUrl: "URL or User ID of the real account/victim",
  nciiUrls: "URLs or ID of NCII",
  victimUrlOrPhone: "URL or phone number of the victim",
  fraudEvidenceUrl: "URL or objects evidence of fraud",
  victimPhoneNumber: "Phone number of victim",
  victimEmailAddress: "Email address of victim",
}

// Fields that support multiple URLs
export const MULTI_URL_FIELDS = ["victimUrl", "fakeAccountUrls", "nciiUrls", "fraudEvidenceUrl"]

// Initial form data
export const initialIncidentFormData: IncidentFormData = {
  firstName: "",
  lastName: "",
  emailAddress: "",
  primaryHarmType: "",
  affectedPlatforms: [],
  harmTypeGroups: [], // Make sure this starts empty
  platformForDynamicQuestions: "",
  country: "",
  city: "",
  violationCode: "",
  incidentClassification: "",
  typeOfSupportProvided: "",
  culturalContext: "",
  evidenceFiles: [],
}

// Dynamic field requirements and labels (legacy - keeping for compatibility)
export const FIELD_REQUIREMENTS: Partial<Record<HarmType, Record<string, string[]>>> = {}
export const DYNAMIC_FIELD_LABELS: Record<string, string> = {}
