"use client"

import { useState, useMemo, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowRight, User, FileText, Plus, Trash2, Shield } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

import {
  HARM_TYPES,
  ALL_PLATFORMS_SELECT,
  INCIDENT_CLASSIFICATIONS,
  initialIncidentFormData,
  PLATFORM_HARM_REQUIREMENTS,
  PLATFORM_HARM_FIELD_LABELS,
  MULTI_URL_FIELDS,
} from "@/lib/constants"
import type {
  IncidentFormData,
  HarmType,
  PlatformSelect,
  IncidentClassification,
  PlatformProfile,
  HarmTypeGroup,
} from "@/types"

// Only these 4 platforms are supported for redirecting
const SUPPORTED_PLATFORMS = ["Instagram", "Facebook", "Messenger", "WhatsApp"] as const
type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number]

const PLATFORM_REPORT_URLS: Record<SupportedPlatform, string> = {
  Instagram: "https://help.instagram.com/370054663112398",
  Facebook: "https://www.facebook.com/help/263149623790594",
  Messenger: "https://www.facebook.com/help/messenger-app/713635396288741",
  WhatsApp: "https://faq.whatsapp.com/",
}


const isEmailKey = (k: string) => /email/i.test(k)
const isPhoneKey = (k: string) => /(phone|mobile|whats ?app)/i.test(k)

const isValidUrl = (url: string): boolean => {
  try {
    const urlToTest = url.startsWith("http") ? url : `https://${url}`
    new URL(urlToTest)
    return true
  } catch {
    return false
  }
}

interface AddRequestPageProps {
  onSubmitAccountInfo: (data: IncidentFormData) => void
  onDeferToPlatform: () => void
  initialData?: Partial<IncidentFormData>
}

export default function AddRequestPage({ onSubmitAccountInfo, onDeferToPlatform, initialData }: AddRequestPageProps) {
  // Create exactly one group at mount
  const [formData, setFormData] = useState<IncidentFormData>(() => {
    const base = { ...initialIncidentFormData, ...initialData }
    if (!base.harmTypeGroups || base.harmTypeGroups.length === 0) {
      const first: HarmTypeGroup = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `g-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        harmType: "",
        selectedPlatforms: [],
        platformData: {} as Record<PlatformSelect, PlatformProfile>,
      }
      return { ...base, harmTypeGroups: [first] }
    }
    return base
  })
  const [error, setError] = useState<string | null>(null)

  // Last seen contact values (for suggestions)
  const [lastEmail, setLastEmail] = useState<string | null>(null)
  const [lastPhone, setLastPhone] = useState<string | null>(null)

  // ---- derived: if union of all selected platforms === 1, it's single-platform
const singlePlatform: SupportedPlatform | null = useMemo(() => {
  const all = new Set<string>(formData.harmTypeGroups.flatMap((g) => g.selectedPlatforms || []))
  if (all.size !== 1) return null
  const only = Array.from(all)[0]
  return (SUPPORTED_PLATFORMS as readonly string[]).includes(only) ? (only as SupportedPlatform) : null
}, [formData.harmTypeGroups])

const singlePlatformUrl = singlePlatform ? PLATFORM_REPORT_URLS[singlePlatform] : null

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof IncidentFormData | string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIncidentClassificationChange = (value: IncidentClassification | "") => {
    setFormData((prev) => ({ ...prev, incidentClassification: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const maxFileSize = 10 * 1024 * 1024 // 10MB
      const maxFiles = 5

      if (files.length > maxFiles) {
        setError(`Please select no more than ${maxFiles} files.`)
        return
      }

      const oversizedFiles = files.filter((file) => file.size > maxFileSize)
      if (oversizedFiles.length > 0) {
        setError(`File "${oversizedFiles[0].name}" is too large. Maximum file size is 10MB.`)
        return
      }

      setFormData((prev) => ({ ...prev, evidenceFiles: files }))
      setError(null)
    }
  }

  // ---- Harm Type Group Management
  const addHarmTypeGroup = () => {
    const newGroup: HarmTypeGroup = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `g-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      harmType: "",
      selectedPlatforms: [],
      platformData: {} as Record<PlatformSelect, PlatformProfile>,
    }
    setFormData((prev) => ({
      ...prev,
      harmTypeGroups: [...prev.harmTypeGroups, newGroup],
    }))
  }

  const removeHarmTypeGroup = (groupId: string) => {
    setFormData((prev) => ({
      ...prev,
      harmTypeGroups: prev.harmTypeGroups.filter((group) => group.id !== groupId),
    }))
  }

  const updateHarmTypeGroup = (groupId: string, updates: Partial<HarmTypeGroup>) => {
    setFormData((prev) => ({
      ...prev,
      harmTypeGroups: prev.harmTypeGroups.map((group) => {
        if (group.id === groupId) {
          const updatedGroup = { ...group, ...updates }

          // If harm type changed, reset platform data
          if (updates.harmType && updates.harmType !== group.harmType) {
            updatedGroup.platformData = {} as Record<PlatformSelect, PlatformProfile>
            updatedGroup.selectedPlatforms.forEach((platform) => {
              updatedGroup.platformData[platform] = createInitialPlatformData(platform, updates.harmType as HarmType)
            })
          }

          // If platforms changed, update platform data
          if (updates.selectedPlatforms) {
            const newPlatformData: Record<PlatformSelect, PlatformProfile> = {} as any
            updates.selectedPlatforms.forEach((platform) => {
              newPlatformData[platform] =
                group.platformData[platform] || createInitialPlatformData(platform, group.harmType as HarmType)
            })
            updatedGroup.platformData = newPlatformData
          }

          return updatedGroup
        }
        return group
      }),
    }))
  }

  const createInitialPlatformData = (platform: PlatformSelect, harmType: HarmType): PlatformProfile => {
    const platformData: PlatformProfile = {
      platform,
      profileUrls: [], // backend allows empty
      userCount: 1,
    }

    const requiredFields = PLATFORM_HARM_REQUIREMENTS[platform]?.[harmType] || []
    requiredFields.forEach((fieldKey) => {
      if (MULTI_URL_FIELDS.includes(fieldKey)) {
        ;(platformData as any)[fieldKey] = [""]
      } else {
        ;(platformData as any)[fieldKey] = ""
      }
    })

    return platformData
  }

  const updatePlatformData = (groupId: string, platform: PlatformSelect, updates: Partial<PlatformProfile>) => {
    setFormData((prev) => ({
      ...prev,
      harmTypeGroups: prev.harmTypeGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            platformData: {
              ...group.platformData,
              [platform]: {
                ...group.platformData[platform],
                ...updates,
              },
            },
          }
        }
        return group
      }),
    }))

    // record latest email/phone
    Object.entries(updates).forEach(([key, val]) => {
      if (typeof val === "string" && val.trim()) {
        if (isEmailKey(key)) setLastEmail(val.trim())
        if (isPhoneKey(key)) setLastPhone(val.trim())
      }
    })
  }

  // Multi-URL management
  const updatePlatformMultiUrlField = (
    groupId: string,
    platform: PlatformSelect,
    fieldKey: string,
    urlIndex: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      harmTypeGroups: prev.harmTypeGroups.map((group) => {
        if (group.id === groupId) {
          const currentUrls = ((group.platformData[platform] as any)?.[fieldKey] as string[]) || [""]
          const newUrls = currentUrls.map((url: string, j: number) => (j === urlIndex ? value : url))
          return {
            ...group,
            platformData: {
              ...group.platformData,
              [platform]: {
                ...group.platformData[platform],
                [fieldKey]: newUrls,
              },
            },
          }
        }
        return group
      }),
    }))
  }

  const addUrlToPlatformField = (groupId: string, platform: PlatformSelect, fieldKey: string) => {
    setFormData((prev) => ({
      ...prev,
      harmTypeGroups: prev.harmTypeGroups.map((group) => {
        if (group.id === groupId) {
          const currentUrls = ((group.platformData[platform] as any)?.[fieldKey] as string[]) || [""]
          return {
            ...group,
            platformData: {
              ...group.platformData,
              [platform]: {
                ...group.platformData[platform],
                [fieldKey]: [...currentUrls, ""],
              },
            },
          }
        }
        return group
      }),
    }))
  }

  const removeUrlFromPlatformField = (
    groupId: string,
    platform: PlatformSelect,
    fieldKey: string,
    urlIndex: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      harmTypeGroups: prev.harmTypeGroups.map((group) => {
        if (group.id === groupId) {
          const currentUrls = ((group.platformData[platform] as any)?.[fieldKey] as string[]) || [""]
          if (currentUrls.length > 1) {
            return {
              ...group,
              platformData: {
                ...group.platformData,
                [platform]: {
                  ...group.platformData[platform],
                  [fieldKey]: currentUrls.filter((_: string, j: number) => j !== urlIndex),
                },
              },
            }
          }
        }
        return group
      }),
    }))
  }

  // ---- Validation & submit
  const validateForm = (): boolean => {
    const requiredFields: (keyof IncidentFormData)[] = ["firstName", "lastName", "emailAddress", "country"]

    if (formData.harmTypeGroups.length === 0) {
      setError("Please add at least one harm type and platform combination.")
      return false
    }

    for (let i = 0; i < formData.harmTypeGroups.length; i++) {
      const group = formData.harmTypeGroups[i]

      if (!group.harmType) {
        setError(`Please select a harm type for Group ${i + 1}.`)
        return false
      }

      if (group.selectedPlatforms.length === 0) {
        setError(`Please select at least one platform for Group ${i + 1}.`)
        return false
      }

      for (const platform of group.selectedPlatforms) {
        const platformData = group.platformData[platform]

        if (!platformData) {
          setError(`Missing data for ${platform} in Group ${i + 1}.`)
          return false
        }

        if (platformData.userCount < 1) {
          setError(`User count must be at least 1 for ${platform} in Group ${i + 1}.`)
          return false
        }

        const requiredFields = PLATFORM_HARM_REQUIREMENTS[platform]?.[group.harmType as HarmType] || []
        for (const fieldKey of requiredFields) {
          if (MULTI_URL_FIELDS.includes(fieldKey)) {
            const urls = (platformData as any)[fieldKey] || []
            if (!Array.isArray(urls) || urls.length === 0) {
              const fieldLabel = PLATFORM_HARM_FIELD_LABELS[fieldKey] || fieldKey
              setError(`Please fill in at least one "${fieldLabel}" for ${platform} in Group ${i + 1}.`)
              return false
            }
            for (let k = 0; k < urls.length; k++) {
              if (!urls[k] || urls[k].trim() === "") {
                const fieldLabel = PLATFORM_HARM_FIELD_LABELS[fieldKey] || fieldKey
                setError(`Please fill in "${fieldLabel}" entry ${k + 1} for ${platform} in Group ${i + 1}.`)
                return false
              }
            }
          } else {
            if (!(platformData as any)[fieldKey] || String((platformData as any)[fieldKey]).trim() === "") {
              const fieldLabel = PLATFORM_HARM_FIELD_LABELS[fieldKey] || fieldKey
              setError(`Please fill in "${fieldLabel}" for ${platform} in Group ${i + 1}.`)
              return false
            }
          }
        }
      }
    }

    setError(null)
    return true
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Single-platform guardrail: open platform reporting and stop flow
    // if (singlePlatformUrl) {
    //   // optional callback if you want to track/branch UI
    //   try {
    //     onDeferToPlatform?.()
    //   } catch {}
    //   window.open(singlePlatformUrl, "_blank", "noopener,noreferrer")
    //   return
    // }

    if (!validateForm()) return
    onSubmitAccountInfo(formData)
  }

  // ---- UI
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            Account & Incident Information
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Please provide all necessary details. You can add multiple harm types and platforms affected.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Single-platform banner */}
            {/* Single-platform banner */}
{/* {singlePlatform && singlePlatformUrl && (
  <Alert className="border-amber-200 bg-amber-50">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle className="text-amber-900 font-semibold">Single-platform report detected</AlertTitle>
    <AlertDescription className="text-amber-800">
      <p>
        Our tool is for cross-platform cases. Since your selections currently only include{" "}
        <span className="font-medium">{singlePlatform}</span>
        {". "}Please report directly on that platform.
      </p>
      <div className="mt-3">
        <a
          href={singlePlatformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
        >
          Go to {singlePlatform} reporting
        </a>
      </div>
    </AlertDescription>
  </Alert>
)} */}


            {/* Submitter Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Submitter Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAddress" className="text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="emailAddress"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Harm Types & Platforms */}
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Harm Types & Affected Platforms</h3>
                </div>
                <Button
                  type="button"
                  onClick={addHarmTypeGroup}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Harm Type
                </Button>
              </div>

              {formData.harmTypeGroups.map((group, groupIndex) => (
                <div
                  key={group.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900">Harm Type Group {groupIndex + 1}</h4>
                    {formData.harmTypeGroups.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeHarmTypeGroup(group.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Group
                      </Button>
                    )}
                  </div>

                  {/* Harm Type */}
                  <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Harm Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={group.harmType}
                        onValueChange={(value) => updateHarmTypeGroup(group.id, { harmType: value as HarmType })}
                        required
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                          <SelectValue placeholder="Select harm type" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                          {HARM_TYPES.map((type) => (
                            <SelectItem key={type} value={type} className="hover:bg-blue-50">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Platforms */}
                    {group.harmType && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Affected Platforms <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {ALL_PLATFORMS_SELECT.map((platform) => (
                            <div key={platform} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${group.id}-${platform}`}
                                checked={group.selectedPlatforms.includes(platform)}
                                onCheckedChange={(checked) => {
                                  const newPlatforms = checked
                                    ? [...group.selectedPlatforms, platform]
                                    : group.selectedPlatforms.filter((p) => p !== platform)
                                  updateHarmTypeGroup(group.id, { selectedPlatforms: newPlatforms })
                                }}
                              />
                              <Label
                                htmlFor={`${group.id}-${platform}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {platform}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Platform-Specific Questions */}
                  {group.harmType && group.selectedPlatforms.length > 0 && (
                    <div className="space-y-6">
                      <h5 className="text-md font-semibold text-gray-900 border-b border-gray-300 pb-2">
                        Platform Details for {group.harmType}
                      </h5>

                      {group.selectedPlatforms.map((platform) => {
                        const platformData = group.platformData[platform]
                        const requiredFields = PLATFORM_HARM_REQUIREMENTS[platform]?.[group.harmType as HarmType] || []

                        return (
                          <div key={platform} className="bg-white p-5 rounded-lg border border-gray-200">
                            <h6 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              {platform}
                            </h6>

                            {requiredFields.length > 0 && (
                              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h6 className="text-sm font-semibold text-blue-900">
                                  Required Information for {group.harmType} on {platform}
                                </h6>

                                {requiredFields.map((fieldKey) => {
                                  const currentValue = String((platformData as any)?.[fieldKey] ?? "")
                                  // Only suggest when empty
                                  const suggestion =
                                    !currentValue.trim() && isEmailKey(fieldKey) && lastEmail
                                      ? lastEmail
                                      : !currentValue.trim() && isPhoneKey(fieldKey) && lastPhone
                                      ? lastPhone
                                      : null

                                  return (
                                    <div key={fieldKey} className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-gray-700">
                                          {PLATFORM_HARM_FIELD_LABELS[fieldKey] || fieldKey}{" "}
                                          <span className="text-red-500">*</span>
                                        </Label>
                                        {MULTI_URL_FIELDS.includes(fieldKey) && (
                                          <Button
                                            type="button"
                                            onClick={() => addUrlToPlatformField(group.id, platform, fieldKey)}
                                            variant="outline"
                                            size="sm"
                                            className="border-green-300 text-green-600 hover:bg-green-50"
                                          >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add URL
                                          </Button>
                                        )}
                                      </div>

                                      {MULTI_URL_FIELDS.includes(fieldKey) ? (
                                        // Multi-URL field
                                        <div className="space-y-2">
                                          {(((platformData as any)?.[fieldKey] as string[]) || [""]).map(
                                            (url: string, urlIndex: number) => (
                                              <div key={urlIndex} className="flex gap-2">
                                                <Input
                                                  value={url}
                                                  onChange={(e) =>
                                                    updatePlatformMultiUrlField(
                                                      group.id,
                                                      platform,
                                                      fieldKey,
                                                      urlIndex,
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder={`${PLATFORM_HARM_FIELD_LABELS[fieldKey]} ${urlIndex + 1}`}
                                                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                  required
                                                />
                                                {((((platformData as any)?.[fieldKey] as string[]) || []).length >
                                                  1) && (
                                                  <Button
                                                    type="button"
                                                    onClick={() =>
                                                      removeUrlFromPlatformField(
                                                        group.id,
                                                        platform,
                                                        fieldKey,
                                                        urlIndex
                                                      )
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : (
                                        // Single-value with inline ghost suggestion + Tab to accept
                                        <div className="relative">
                                          <Input
                                            value={currentValue}
                                            onChange={(e) =>
                                              updatePlatformData(group.id, platform, {
                                                [fieldKey]: e.target.value,
                                              } as any)
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === "Tab" && suggestion) {
                                                e.preventDefault()
                                                updatePlatformData(group.id, platform, {
                                                  [fieldKey]: suggestion,
                                                } as any)
                                              }
                                            }}
                                            placeholder={
                                              suggestion ? "" : PLATFORM_HARM_FIELD_LABELS[fieldKey] || fieldKey
                                            }
                                            className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                                              suggestion ? "pr-16" : ""
                                            }`}
                                            required
                                          />

                                          {suggestion && (
                                            <>
                                              <span
                                                className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 select-none truncate"
                                                aria-hidden="true"
                                              >
                                                {suggestion}
                                              </span>
                                              <kbd
                                                className="pointer-events-none absolute inset-y-0 right-3 my-auto hidden sm:inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium bg-gray-50 text-gray-500"
                                                aria-hidden="true"
                                              >
                                                Tab
                                              </kbd>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* Additional Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Additional Case Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City (Optional)
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="violationCode" className="text-sm font-medium text-gray-700">
                  Violation Code (Optional)
                </Label>
                <Input
                  id="violationCode"
                  name="violationCode"
                  value={formData.violationCode}
                  onChange={handleChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="typeOfSupportProvided" className="text-sm font-medium text-gray-700">
                    Type of support provided (Optional)
                  </Label>
                  <Textarea
                    id="typeOfSupportProvided"
                    name="typeOfSupportProvided"
                    value={formData.typeOfSupportProvided}
                    onChange={handleChange}
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="culturalContext" className="text-sm font-medium text-gray-700">
                    Cultural context of the request? (Optional)
                  </Label>
                  <Textarea
                    id="culturalContext"
                    name="culturalContext"
                    value={formData.culturalContext}
                    onChange={handleChange}
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidenceFiles" className="text-sm font-medium text-gray-700">
                  Additional Evidence (Optional, max 5 files)
                </Label>
                <Input
                  id="evidenceFiles"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.evidenceFiles.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                    <ul className="space-y-1">
                      {formData.evidenceFiles.map((file) => (
                        <li key={file.name} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                type="submit"
                size="lg"
                disabled={!!singlePlatformUrl}
                title={
                  singlePlatformUrl ? "Single-platform reports should be filed on the platform directly." : undefined
                }
                className="min-w-[250px] bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Proceed to Identity Verification <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
