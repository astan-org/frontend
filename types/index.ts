export type HarmType = "Hacked" | "Impersonation" | "NCII" | "Fraud_and_Scams"

export type PlatformSelect = 
  | "Instagram"
  | "Facebook" 
  | "Messenger"
  | "WhatsApp"
  | "Twitter"
  | "LinkedIn"
  | "Reddit"
  | "Tumblr"
  | "WeChat"
  | "TikTok"
  | "Other"

  export type PlatformDynamic = "Instagram" | "Facebook" | "Messenger" | "WhatsApp";

export type IncidentClassification = 
  | "Sale of illegal goods"
  | "Harassment"
  | "Hate Speech"
  | "Spam"
  | "Nudity"
  | "Violence"
  | "Scam"
  | "False Information"
  | "Something else"

export interface PlatformProfile {
  platform: PlatformSelect
  profileUrls: string[]
  userCount: number
  [key: string]: any // For dynamic platform-specific fields
}

export interface HarmTypeGroup {
  id: string
  harmType: HarmType | ""
  selectedPlatforms: PlatformSelect[]
  platformData: Record<PlatformSelect, PlatformProfile>
}

export interface IncidentFormData {
  firstName: string
  lastName: string
  emailAddress: string
  primaryHarmType: HarmType | ""
  affectedPlatforms: PlatformProfile[]
  harmTypeGroups: HarmTypeGroup[]
  platformForDynamicQuestions: PlatformSelect | ""
  country: string
  city: string
  violationCode: string
  incidentClassification: IncidentClassification | ""
  typeOfSupportProvided: string
  culturalContext: string
  evidenceFiles: File[]
}

export interface UserIncident {
  id: string
  submittedAt: string
  status: "pending" | "in-review" | "resolved" | "rejected"
  harmType: HarmType
  platforms: PlatformSelect[]
  country: string
  description: string
}
