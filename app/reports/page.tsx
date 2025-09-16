"use client"
import { deleteIncident } from "@/lib/api/deleteIncident"
import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "react-oidc-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import {
  Loader2,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Globe,
  Shield,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Calendar,
  MapPin,
  User,
} from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchUserIncidents } from "@/lib/api/fetchUserIncidents"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface HarmTypeGroup {
  id: string
  harmType: string
  selectedPlatforms: string[]
  platformData: Record<
    string,
    {
      platform: string
      profileUrls: string[]
      userCount: number
    }
  >
}

interface Incident {
  incidentId: string
  createdAt: string
  status: string
  userId: string
  userBlock: {
    firstName: string
    lastName: string
    emailAddress: string
    userEmail?: string | null
  }
  incidentBlock: {
    // Legacy fields for backward compatibility
    primaryHarmType?: string
    affectedPlatforms?: Array<{
      platform: string
      profileUrls: string[]
      userCount: number
    }>
    // New structure
    harmTypeGroups?: HarmTypeGroup[]
    country?: string
    city?: string | null
    violationReason?: string
    incidentClassification?: string | null
    violationCode?: string | null
    dynamicExtras?: {
      realAccountUrl?: string
      fakeAccountUrls?: string
      proofOfRealAccount?: string
      evidenceFileKeys?: string[]
      sumSubVerificationId?: string
      [key: string]: any
    }
    platformForDynamicQuestions?: string
    typeOfSupportProvided?: string | null
    culturalContext?: string | null
    hackedElsewhere?: string | null
    hackedElsewhereDetails?: string | null
    crossPlatformDetails?: string | null
    platformsSummary?: string[]
  }
  evidenceMeta: Record<string, any>
  raw: Record<string, any>
}

type SortField = "createdAt" | "status" | "primaryHarmType" | "country" | "platformCount"
type SortDirection = "asc" | "desc"

interface FilterState {
  status: string[]
  harmType: string[]
  country: string[]
  dateRange: string
  platformCount: string
}

const getHarmTypes = (incident: Incident): string[] => {
  if (incident.incidentBlock.harmTypeGroups && incident.incidentBlock.harmTypeGroups.length > 0) {
    return incident.incidentBlock.harmTypeGroups
      .map((group) => group.harmType)
      .filter((harmType) => harmType && harmType.trim() !== "")
  }
  // Fallback to legacy structure
  if (incident.incidentBlock.primaryHarmType) {
    return [incident.incidentBlock.primaryHarmType]
  }
  return []
}

const getPrimaryHarmType = (incident: Incident): string => {
  const harmTypes = getHarmTypes(incident)
  return harmTypes[0] || "Unknown"
}

const getAllPlatforms = (incident: Incident): Array<{ platform: string; profileUrls: string[]; userCount: number }> => {
  const platforms: Array<{ platform: string; profileUrls: string[]; userCount: number }> = []

  if (incident.incidentBlock.harmTypeGroups && incident.incidentBlock.harmTypeGroups.length > 0) {
    incident.incidentBlock.harmTypeGroups.forEach((group) => {
      Object.values(group.platformData || {}).forEach((platformData) => {
        platforms.push(platformData)
      })
    })
  }

  // Fallback to legacy structure
  if (platforms.length === 0 && incident.incidentBlock.affectedPlatforms) {
    platforms.push(...incident.incidentBlock.affectedPlatforms)
  }

  return platforms
}

const getTotalPlatformCount = (incident: Incident): number => {
  return getAllPlatforms(incident).length
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "in_progress":
    case "in progress":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "resolved":
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
    case "declined":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return <FileText className="h-4 w-4" />
    case "pending":
      return <Clock className="h-4 w-4" />
    case "in_progress":
    case "in progress":
      return <RefreshCw className="h-4 w-4" />
    case "resolved":
    case "completed":
      return <CheckCircle2 className="h-4 w-4" />
    case "rejected":
    case "declined":
      return <XCircle className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getHarmTypeColor = (harmType: string) => {
  switch (harmType) {
    case "Hacked Account Take over":
    case "Hacked":
      return "bg-red-50 text-red-700 border-red-200"
    case "Impersonation":
      return "bg-orange-50 text-orange-700 border-orange-200"
    case "Fraud_and_Scams":
    case "Fraud_and_Scams":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "NCCI":
      return "bg-blue-50 text-blue-700 border-blue-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

// Normalize statuses to tab groups; also map PENDING_ID_VERIFICATION into "draft" tab.
const transformStatus = (status: string) => {
  const s = (status || "").toUpperCase()
  if (s === "VERIFIED") return "pending"
  if (s === "PENDING_ID_VERIFICATION") return "draft"
  return s.toLowerCase()
}

const isUnverifiedDraft = (incident: Incident) => {
  const status = incident.status?.toLowerCase()
  const verificationId = incident.incidentBlock?.dynamicExtras?.sumSubVerificationId
  const isDraft = status === "draft"
  const isMissingVerification = !verificationId
  return isDraft && isMissingVerification
}

export default function ReportsPage() {
  const auth = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [activeTab, setActiveTab] = useState<"draft" | "pending" | "resolved">("draft")

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const [filters, setFilters] = useState<Omit<FilterState, "status">>({
    harmType: [],
    country: [],
    dateRange: "all",
    platformCount: "all",
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Filter options derived from data
  const [filterOptions, setFilterOptions] = useState({
    statuses: [] as string[],
    harmTypes: [] as string[],
    countries: [] as string[],
  })

  const fetchData = async () => {
    if (!auth.isAuthenticated || !auth.user?.access_token) return

    try {
      setLoading(true)
      setError(null)
      const token = auth.user.access_token
      localStorage.setItem("accessToken", token)
      const data = await fetchUserIncidents(token)

      if (Array.isArray(data)) {
        setIncidents(data)

        const statuses = [...new Set(data.map((i) => transformStatus(i.status)))]
        const allHarmTypes = data.flatMap((incident) => getHarmTypes(incident))
        const harmTypes = [...new Set(allHarmTypes)]
        const countries = [...new Set(data.map((i) => i.incidentBlock.country).filter(Boolean))]

        setFilterOptions({
          statuses: statuses.sort(),
          harmTypes: harmTypes.sort(),
          countries: countries.sort(),
        })
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch incidents")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = incidents.filter((incident) => {
      const harmTypes = getHarmTypes(incident)
      const searchMatch =
        !searchTerm ||
        incident.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        harmTypes.some((harmType) => harmType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        incident.incidentBlock.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incidentBlock.violationReason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transformStatus(incident.status).toLowerCase().includes(searchTerm.toLowerCase())

      const statusMatch = transformStatus(incident.status).toLowerCase() === activeTab

      const harmTypeMatch =
        filters.harmType.length === 0 || harmTypes.some((harmType) => filters.harmType.includes(harmType))

      // Country filter
      const countryMatch =
        filters.country.length === 0 ||
        (incident.incidentBlock.country && filters.country.includes(incident.incidentBlock.country))

      // Date range filter
      const dateMatch = (() => {
        if (filters.dateRange === "all") return true
        const incidentDate = new Date(incident.createdAt)
        const now = new Date()
        switch (filters.dateRange) {
          case "7days":
            return incidentDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          case "30days":
            return incidentDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          case "90days":
            return incidentDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          default:
            return true
        }
      })()

      const platformMatch = (() => {
        if (filters.platformCount === "all") return true
        const platformCount = getTotalPlatformCount(incident)
        switch (filters.platformCount) {
          case "single":
            return platformCount === 1
          case "multiple":
            return platformCount > 1
          default:
            return true
        }
      })()

      return searchMatch && statusMatch && harmTypeMatch && countryMatch && dateMatch && platformMatch
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "status":
          aValue = transformStatus(a.status)
          bValue = transformStatus(b.status)
          break
        case "primaryHarmType":
          aValue = getPrimaryHarmType(a)
          bValue = getPrimaryHarmType(b)
          break
        case "country":
          aValue = a.incidentBlock.country || ""
          bValue = b.incidentBlock.country || ""
          break
        case "platformCount":
          aValue = getTotalPlatformCount(a)
          bValue = getTotalPlatformCount(b)
          break
        default:
          return 0
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    setFilteredIncidents(filtered)
  }, [searchTerm, incidents, filters, sortField, sortDirection, activeTab])

  useEffect(() => {
    fetchData()
  }, [auth])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleFilterChange = (filterType: keyof Omit<FilterState, "status">, value: string | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const handleDeleteDraft = async (incidentId: string) => {
    if (!auth.user?.access_token) return
    setDeleteError(null)
    setDeletingId(incidentId)
    try {
      await deleteIncident(incidentId, auth.user.access_token)
      // Optimistic UI: remove locally
      setIncidents((prev) => prev.filter((i) => i.incidentId !== incidentId))
      // Close details modal if it was open for this incident
      setSelectedIncident((curr) => (curr?.incidentId === incidentId ? null : curr))
    } catch (e: any) {
      // Common backend errors: 401, 403, 404, 409 (cannot_delete_finalized_incident)
      setDeleteError(e?.message || "Failed to delete report")
    } finally {
      setDeletingId(null)
    }
  }

  const clearFilters = () => {
    setFilters({
      harmType: [],
      country: [],
      dateRange: "all",
      platformCount: "all",
    })
    setSearchTerm("")
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getActiveFilterCount = () => {
    return (
      filters.harmType.length +
      filters.country.length +
      (filters.dateRange !== "all" ? 1 : 0) +
      (filters.platformCount !== "all" ? 1 : 0)
    )
  }

  if (auth.isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{auth.error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border max-w-md">
          <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You must be signed in to view your reports.</p>
          <Button onClick={() => auth.signinRedirect()} className="w-full">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const statusCounts = incidents.reduce(
    (acc, incident) => {
      const status = transformStatus(incident.status).toLowerCase()
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <DashboardLayout currentStep="reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-1">Triage and manage your submitted incident reports</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.draft || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.pending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statusCounts.resolved || statusCounts.completed || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "draft" | "pending" | "resolved")}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-auto grid-cols-3 bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-lg shadow-sm border">
              <TabsTrigger
                value="draft"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 transition-all duration-200 hover:bg-white/50"
              >
                <FileText className="h-4 w-4" />
                Draft ({statusCounts.draft || 0})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 transition-all duration-200 hover:bg-white/50"
              >
                <Clock className="h-4 w-4" />
                Pending ({statusCounts.pending || 0})
              </TabsTrigger>
              <TabsTrigger
                value="resolved"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 transition-all duration-200 hover:bg-white/50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Resolved ({statusCounts.resolved || statusCounts.completed || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Enhanced Search and Filters */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by case ID, harm type, country, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="relative bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                          {getActiveFilterCount()}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-white border shadow-lg z-50" align="end">
                    <div className="space-y-4 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filters</h4>
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          <X className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      </div>

                      {/* Harm Type Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">Harm Type</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {filterOptions.harmTypes.map((harmType) => (
                            <div key={harmType} className="flex items-center space-x-2">
                              <Checkbox
                                id={`harm-${harmType}`}
                                checked={filters.harmType.includes(harmType)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleFilterChange("harmType", [...filters.harmType, harmType])
                                  } else {
                                    handleFilterChange(
                                      "harmType",
                                      filters.harmType.filter((h) => h !== harmType),
                                    )
                                  }
                                }}
                              />
                              <label htmlFor={`harm-${harmType}`} className="text-sm cursor-pointer">
                                {harmType}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Country Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">Country</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                          {filterOptions.countries.map((country) => (
                            <div key={country} className="flex items-center space-x-2">
                              <Checkbox
                                id={`country-${country}`}
                                checked={filters.country.includes(country)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleFilterChange("country", [...filters.country, country])
                                  } else {
                                    handleFilterChange(
                                      "country",
                                      filters.country.filter((c) => c !== country),
                                    )
                                  }
                                }}
                              />
                              <label htmlFor={`country-${country}`} className="text-sm cursor-pointer">
                                {country}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Date Range Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">Date Range</label>
                        <Select
                          value={filters.dateRange}
                          onValueChange={(value) => handleFilterChange("dateRange", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="90days">Last 90 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Platform Count Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium block">Platform Count</label>
                        <Select
                          value={filters.platformCount}
                          onValueChange={(value) => handleFilterChange("platformCount", value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="single">Single Platform</SelectItem>
                            <SelectItem value="multiple">Multiple Platforms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Sort by:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("createdAt")}
                  className={sortField === "createdAt" ? "bg-gray-100" : ""}
                >
                  Date {getSortIcon("createdAt")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("primaryHarmType")}
                  className={sortField === "primaryHarmType" ? "bg-gray-100" : ""}
                >
                  Harm Type {getSortIcon("primaryHarmType")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("platformCount")}
                  className={sortField === "platformCount" ? "bg-gray-100" : ""}
                >
                  Platforms {getSortIcon("platformCount")}
                </Button>
              </div>

              {getActiveFilterCount() > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.harmType.map((harmType) => (
                    <Badge key={harmType} variant="secondary" className="gap-1">
                      {harmType}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          handleFilterChange(
                            "harmType",
                            filters.harmType.filter((h) => h !== harmType),
                          )
                        }
                      />
                    </Badge>
                  ))}
                  {filters.country.map((country) => (
                    <Badge key={country} variant="secondary" className="gap-1">
                      {country}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          handleFilterChange(
                            "country",
                            filters.country.filter((c) => c !== country),
                          )
                        }
                      />
                    </Badge>
                  ))}
                  {filters.dateRange !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.dateRange === "7days"
                        ? "Last 7 Days"
                        : filters.dateRange === "30days"
                        ? "Last 30 Days"
                        : filters.dateRange === "90days"
                        ? "Last 90 Days"
                        : filters.dateRange}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("dateRange", "all")} />
                    </Badge>
                  )}
                  {filters.platformCount !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.platformCount === "single" ? "Single Platform" : "Multiple Platforms"}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleFilterChange("platformCount", "all")}
                      />
                    </Badge>
                  )}
                </div>
              )}

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Showing {filteredIncidents.length} of {statusCounts[activeTab] || 0} {activeTab} reports
              </div>
            </CardContent>
          </Card>

          {/* Error Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Reports</AlertTitle>
              <AlertDescription className="mt-2">
                {error}
                <Button variant="outline" size="sm" onClick={fetchData} className="mt-3 ml-0 bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {deleteError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Delete Failed</AlertTitle>
              <AlertDescription className="mt-2">{deleteError}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="draft" className="mt-0">
            {filteredIncidents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || getActiveFilterCount() > 0 ? "No matching draft reports found" : "No draft reports"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || getActiveFilterCount() > 0
                      ? "Try adjusting your search terms or filters to see more results."
                      : "You don't have any draft reports. Start by creating your first report."}
                  </p>
                  {searchTerm || getActiveFilterCount() > 0 ? (
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  ) : (
                    <Button onClick={() => (window.location.href = "/")}>Create First Report</Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-900">Case ID</th>
                          <th className="text-left p-4 font-medium text-gray-900">Harm Type</th>
                          <th className="text-left p-4 font-medium text-gray-900">Platforms</th>
                          <th className="text-left p-4 font-medium text-gray-900">Location</th>
                          <th className="text-left p-4 font-medium text-gray-900">Date</th>
                          <th className="text-left p-4 font-medium text-gray-900">Status</th>
                          <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredIncidents.map((incident) => {
                          const harmTypes = getHarmTypes(incident)
                          const allPlatforms = getAllPlatforms(incident)
                          const uniquePlatforms = [...new Set(allPlatforms.map((p) => p.platform))]

                          return (
                            <tr key={incident.incidentId} className="hover:bg-gray-50">
                              <td className="p-4">
                                <div className="font-mono text-sm">#{incident.incidentId.slice(-8)}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {harmTypes.slice(0, 2).map((harmType, index) => (
                                    <Badge key={index} className={getHarmTypeColor(harmType)} variant="outline">
                                      {harmType}
                                    </Badge>
                                  ))}
                                  {harmTypes.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{harmTypes.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {uniquePlatforms.slice(0, 2).map((platform, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {platform}
                                    </Badge>
                                  ))}
                                  {uniquePlatforms.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{uniquePlatforms.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {incident.incidentBlock.country || "Unknown"}
                                  {incident.incidentBlock.city && `, ${incident.incidentBlock.city}`}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(incident.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </td>
                              <td className="p-4">
                                {isUnverifiedDraft(incident) ? (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Needs Verification
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className={getStatusColor("draft")}>
                                    <FileText className="h-3 w-3 mr-1" />
                                    Draft
                                  </Badge>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setSelectedIncident(incident)}>
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  {isUnverifiedDraft(incident) && (
                                    <Button
                                      size="sm"
                                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                      onClick={() =>
                                        (window.location.href = `/identity-verification/${incident.incidentId}`)
                                      }
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      Verify
                                    </Button>
                                  )}

                                  {/* NEW: Cancel/Delete action */}
                                  <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1">
                                      <Trash2 className="h-3 w-3" />
                                      Cancel
                                    </Button>
                                  </AlertDialogTrigger>

                                  {/* Force solid white bg + strong shadow so it’s not see-through */}
                                  <AlertDialogContent className="bg-white text-gray-900 shadow-2xl border rounded-xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancel this draft?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the report from our system. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                      {/* Make cancel text black explicitly */}
                                      <AlertDialogCancel className="text-black border-gray-300">
                                        Keep Draft
                                      </AlertDialogCancel>

                                      <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => handleDeleteDraft(incident.incidentId)}
                                        disabled={deletingId === incident.incidentId}
                                      >
                                        {deletingId === incident.incidentId ? (
                                          <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Deleting…
                                          </>
                                        ) : (
                                          "Delete"
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            {filteredIncidents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || getActiveFilterCount() > 0
                      ? "No matching pending reports found"
                      : "No pending reports"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || getActiveFilterCount() > 0
                      ? "Try adjusting your search terms or filters to see more results."
                      : "You don't have any pending reports at the moment."}
                  </p>
                  {searchTerm ||
                    (getActiveFilterCount() > 0 && (
                      <Button onClick={clearFilters} variant="outline">
                        Clear All Filters
                      </Button>
                    ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-900">Case ID</th>
                          <th className="text-left p-4 font-medium text-gray-900">Harm Type</th>
                          <th className="text-left p-4 font-medium text-gray-900">Platforms</th>
                          <th className="text-left p-4 font-medium text-gray-900">Location</th>
                          <th className="text-left p-4 font-medium text-gray-900">Date</th>
                          <th className="text-left p-4 font-medium text-gray-900">Status</th>
                          <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredIncidents.map((incident) => {
                          const harmTypes = getHarmTypes(incident)
                          const allPlatforms = getAllPlatforms(incident)
                          const uniquePlatforms = [...new Set(allPlatforms.map((p) => p.platform))]

                          return (
                            <tr key={incident.incidentId} className="hover:bg-gray-50">
                              <td className="p-4">
                                <div className="font-mono text-sm">#{incident.incidentId.slice(-8)}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {harmTypes.slice(0, 2).map((harmType, index) => (
                                    <Badge key={index} className={getHarmTypeColor(harmType)} variant="outline">
                                      {harmType}
                                    </Badge>
                                  ))}
                                  {harmTypes.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{harmTypes.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {uniquePlatforms.slice(0, 2).map((platform, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {platform}
                                    </Badge>
                                  ))}
                                  {uniquePlatforms.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{uniquePlatforms.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {incident.incidentBlock.country || "Unknown"}
                                  {incident.incidentBlock.city && `, ${incident.incidentBlock.city}`}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(incident.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className={getStatusColor("pending")}>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Button variant="outline" size="sm" onClick={() => setSelectedIncident(incident)}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="mt-0">
            {filteredIncidents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || getActiveFilterCount() > 0
                      ? "No matching resolved reports found"
                      : "No resolved reports"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || getActiveFilterCount() > 0
                      ? "Try adjusting your search terms or filters to see more results."
                      : "You don't have any resolved reports at the moment."}
                  </p>
                  {searchTerm || getActiveFilterCount() > 0 ? (
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-900">Case ID</th>
                          <th className="text-left p-4 font-medium text-gray-900">Harm Type</th>
                          <th className="text-left p-4 font-medium text-gray-900">Platforms</th>
                          <th className="text-left p-4 font-medium text-gray-900">Location</th>
                          <th className="text-left p-4 font-medium text-gray-900">Date</th>
                          <th className="text-left p-4 font-medium text-gray-900">Status</th>
                          <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredIncidents.map((incident) => {
                          const harmTypes = getHarmTypes(incident)
                          const allPlatforms = getAllPlatforms(incident)
                          const uniquePlatforms = [...new Set(allPlatforms.map((p) => p.platform))]

                          return (
                            <tr key={incident.incidentId} className="hover:bg-gray-50">
                              <td className="p-4">
                                <div className="font-mono text-sm">#{incident.incidentId.slice(-8)}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {harmTypes.slice(0, 2).map((harmType, index) => (
                                    <Badge key={index} className={getHarmTypeColor(harmType)} variant="outline">
                                      {harmType}
                                    </Badge>
                                  ))}
                                  {harmTypes.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{harmTypes.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                  {uniquePlatforms.slice(0, 2).map((platform, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {platform}
                                    </Badge>
                                  ))}
                                  {uniquePlatforms.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{uniquePlatforms.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {incident.incidentBlock.country || "Unknown"}
                                  {incident.incidentBlock.city && `, ${incident.incidentBlock.city}`}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(incident.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className={getStatusColor("resolved")}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Button variant="outline" size="sm" onClick={() => setSelectedIncident(incident)}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Enhanced Modal for Incident Details */}
        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedIncident(null)} />

            {/* Modal Content */}
            <Card className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
              <CardHeader className="border-b bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Incident Details</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Case #{selectedIncident.incidentId}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedIncident(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-white">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Submitter Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Name:</span>{" "}
                          {selectedIncident.userBlock.firstName} {selectedIncident.userBlock.lastName}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>{" "}
                          {selectedIncident.userBlock.emailAddress}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">User ID:</span>{" "}
                          <code className="text-xs bg-gray-100 px-1 rounded">{selectedIncident.userId}</code>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Case Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>{" "}
                          <Badge className={getStatusColor(transformStatus(selectedIncident.status))}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(transformStatus(selectedIncident.status))}
                              {transformStatus(selectedIncident.status).replace("_", " ").toUpperCase()}
                            </div>
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Submitted:</span>{" "}
                          {new Date(selectedIncident.createdAt).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(selectedIncident.createdAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>{" "}
                          {selectedIncident.incidentBlock.country || "Unknown"}
                          {selectedIncident.incidentBlock.city ? `, ${selectedIncident.incidentBlock.city}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Incident Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Harm Types:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getHarmTypes(selectedIncident).map((harmType, index) => (
                              <Badge key={index} className={getHarmTypeColor(harmType)}>
                                {harmType}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {selectedIncident.incidentBlock.platformForDynamicQuestions && (
                          <div>
                            <span className="font-medium text-gray-700">Primary Platform:</span>{" "}
                            {selectedIncident.incidentBlock.platformForDynamicQuestions}
                          </div>
                        )}
                        {selectedIncident.incidentBlock.incidentClassification && (
                          <div>
                            <span className="font-medium text-gray-700">Classification:</span>{" "}
                            {selectedIncident.incidentBlock.incidentClassification}
                          </div>
                        )}
                        {selectedIncident.incidentBlock.violationCode && (
                          <div>
                            <span className="font-medium text-gray-700">Violation Code:</span>{" "}
                            {selectedIncident.incidentBlock.violationCode}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Affected Platforms
                      </h3>
                      <div className="space-y-2">
                        {getAllPlatforms(selectedIncident).map((platform, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary">{platform.platform}</Badge>
                              <span className="text-xs text-gray-600">
                                {platform.userCount} user{platform.userCount !== 1 ? "s" : ""} affected
                              </span>
                            </div>
                            <div className="space-y-1">
                              {platform.profileUrls.map((url, urlIndex) => (
                                <div key={urlIndex} className="text-xs text-gray-600 flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="truncate">{url}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Full Description</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedIncident.incidentBlock.violationReason || "No description provided"}
                  </p>
                </div>

                {/* Dynamic Extras */}
                {selectedIncident.incidentBlock.dynamicExtras && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedIncident.incidentBlock.dynamicExtras.realAccountUrl && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="font-medium text-blue-900">Real Account URL:</span>
                          <p className="text-sm text-blue-800 mt-1 break-all">
                            {selectedIncident.incidentBlock.dynamicExtras.realAccountUrl}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.dynamicExtras.fakeAccountUrls && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <span className="font-medium text-red-900">Fake Account URLs:</span>
                          <p className="text-sm text-red-800 mt-1 break-all">
                            {selectedIncident.incidentBlock.dynamicExtras.fakeAccountUrls}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.dynamicExtras.proofOfRealAccount && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <span className="font-medium text-green-900">Proof of Real Account:</span>
                          <p className="text-sm text-green-800 mt-1">
                            {selectedIncident.incidentBlock.dynamicExtras.proofOfRealAccount}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.dynamicExtras.sumSubVerificationId && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <span className="font-medium text-purple-900">Verification ID:</span>
                          <p className="text-sm text-purple-800 mt-1 font-mono">
                            {selectedIncident.incidentBlock.dynamicExtras.sumSubVerificationId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Harm Type Groups */}
                {selectedIncident.incidentBlock.harmTypeGroups &&
                  selectedIncident.incidentBlock.harmTypeGroups.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Harm Type Groups</h3>
                      <div className="space-y-4">
                        {selectedIncident.incidentBlock.harmTypeGroups.map((group) => (
                          <div key={group.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={getHarmTypeColor(group.harmType)}>{group.harmType}</Badge>
                              <span className="text-sm text-gray-600">
                                {Object.keys(group.platformData || {}).length} platform(s)
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.values(group.platformData || {}).map((platformData, platformIndex) => (
                                <div key={platformIndex} className="bg-white p-3 rounded border">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline">{platformData.platform}</Badge>
                                    <span className="text-xs text-gray-600">{platformData.userCount} affected</span>
                                  </div>
                                  <div className="space-y-1">
                                    {platformData.profileUrls.map((url, urlIndex) => (
                                      <div key={urlIndex} className="text-xs text-gray-600 flex items-center gap-1">
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="truncate">{url}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Additional Context */}
                {(selectedIncident.incidentBlock.culturalContext ||
                  selectedIncident.incidentBlock.typeOfSupportProvided ||
                  selectedIncident.incidentBlock.hackedElsewhereDetails ||
                  selectedIncident.incidentBlock.crossPlatformDetails) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Additional Context</h3>
                    <div className="space-y-3">
                      {selectedIncident.incidentBlock.culturalContext && (
                        <div>
                          <span className="font-medium text-gray-700">Cultural Context:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {selectedIncident.incidentBlock.culturalContext}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.typeOfSupportProvided && (
                        <div>
                          <span className="font-medium text-gray-700">Support Provided:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {selectedIncident.incidentBlock.typeOfSupportProvided}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.hackedElsewhereDetails && (
                        <div>
                          <span className="font-medium text-gray-700">Other Platforms Affected:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {selectedIncident.incidentBlock.hackedElsewhereDetails}
                          </p>
                        </div>
                      )}
                      {selectedIncident.incidentBlock.crossPlatformDetails && (
                        <div>
                          <span className="font-medium text-gray-700">Cross-Platform Details:</span>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                            {selectedIncident.incidentBlock.crossPlatformDetails}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
