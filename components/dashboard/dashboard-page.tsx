"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Calendar,
  Zap,
  Network,
  Globe,
  Link,
  ArrowLeft,
} from "lucide-react"

// Enhanced sample data with cross-platform focus
const velocityData = [
  {
    platform: "Instagram",
    avgReportTime: 8, // 2.3 hours * 60 = 138 minutes
    avgResolutionTime: 4, // 18.5 hours * 60 = 1110 minutes
    totalReports: 1247,
  },
  {
    platform: "Facebook",
    avgReportTime: 5, // 1.8 hours * 60 = 108 minutes
    avgResolutionTime: 3, // 22.1 hours * 60 = 1326 minutes
    totalReports: 2156,
  },
  {
    platform: "WhatsApp",
    avgReportTime: 10, // 3.1 hours * 60 = 186 minutes
    avgResolutionTime: 6, // 15.2 hours * 60 = 912 minutes
    totalReports: 892,
  },
  {
    platform: "Messenger",
    avgReportTime: 7, // 2.7 hours * 60 = 162 minutes
    avgResolutionTime: 6, // 19.8 hours * 60 = 1188 minutes
    totalReports: 634,
  }
]

const platformDistributionData = [
  {
    name: "2 Platforms",
    value: 3245,
    percentage: 39.7,
    color: "#f97316",
    harmTypes: [
      { name: "Fraud_and_Scams", incidents: 1298, color: "#8b5cf6" },
      { name: "Impersonation", incidents: 974, color: "#f97316" },
      { name: "Hacked Account", incidents: 649, color: "#ef4444" },
      { name: "Harassment", incidents: 324, color: "#06b6d4" },
    ],
  },
  {
    name: "3 Platforms",
    value: 1634,
    percentage: 20.0,
    color: "#ef4444",
    harmTypes: [
      { name: "Hacked Account", incidents: 653, color: "#ef4444" },
      { name: "Fraud_and_Scams", incidents: 490, color: "#8b5cf6" },
      { name: "Impersonation", incidents: 327, color: "#f97316" },
      { name: "NCII", incidents: 164, color: "#ec4899" },
    ],
  },
  {
    name: "4+ Platforms",
    value: 501,
    percentage: 6.1,
    color: "#dc2626",
    harmTypes: [
      { name: "Hacked Account", incidents: 200, color: "#ef4444" },
      { name: "Fraud_and_Scams", incidents: 150, color: "#8b5cf6" },
      { name: "Harassment", incidents: 100, color: "#06b6d4" },
      { name: "Impersonation", incidents: 51, color: "#f97316" },
    ],
  },
  {
    name: "5+ Platforms",
    value: 2792,
    percentage: 34.2,
    color: "#94a3b8",
    harmTypes: [
      { name: "Hacked Account Takeover", incidents: 1117, color: "#ef4444" },
      { name: "Impersonation", incidents: 838, color: "#f97316" },
      { name: "Fraud_and_Scams", incidents: 445, color: "#8b5cf6" },
      { name: "Harassment", incidents: 279, color: "#06b6d4" },
      { name: "Hate Speech", incidents: 445, color: "#84cc16" },
      { name: "NCII (Non-consensual)", incidents: 234, color: "#ec4899" },
    ],
  },
]

const multiPlatformAttackPatterns = [
  { type: "Coordinated Impersonation", incidents: 1456, platforms: 2.8, trend: "+23%" },
  { type: "Multi-Platform Fraud_and_Scams", incidents: 1234, platforms: 3.2, trend: "+18%" },
  { type: "Account Takeover Chain", incidents: 987, platforms: 2.4, trend: "+31%" },
  { type: "Harassment Campaign", incidents: 743, platforms: 2.9, trend: "+12%" },
]

const harmTypesData = [
  { name: "Hacked Account Takeover", known: 1247, inferred: 234, color: "#ef4444" },
  { name: "Impersonation", known: 892, inferred: 156, color: "#f97316" },
  { name: "Fraud_and_Scams", known: 2156, inferred: 445, color: "#8b5cf6" },
  { name: "Harassment", known: 634, inferred: 89, color: "#06b6d4" },
  { name: "Hate Speech", known: 445, inferred: 67, color: "#84cc16" },
  { name: "NCII (Non-consensual)", known: 234, inferred: 78, color: "#ec4899" },
]

const trendsData = [
  { month: "Jan", reports: 1200, resolved: 1150, dsaCompliant: 1100, tidCompliant: 1140 },
  { month: "Feb", reports: 1350, resolved: 1280, dsaCompliant: 1220, tidCompliant: 1270 },
  { month: "Mar", reports: 1180, resolved: 1120, dsaCompliant: 1050, tidCompliant: 1110 },
  { month: "Apr", reports: 1420, resolved: 1380, dsaCompliant: 1300, tidCompliant: 1360 },
  { month: "May", reports: 1650, resolved: 1590, dsaCompliant: 1480, tidCompliant: 1570 },
  { month: "Jun", reports: 1890, resolved: 1820, dsaCompliant: 1720, tidCompliant: 1800 },
]

const dsaComplianceData = [
  { platform: "Instagram", within48h: 87, total: 100, percentage: 87 },
  { platform: "Facebook", within48h: 92, total: 100, percentage: 92 },
  { platform: "WhatsApp", within48h: 78, total: 100, percentage: 78 },
  { platform: "Twitter", within48h: 65, total: 100, percentage: 65 },
  { platform: "TikTok", within48h: 71, total: 100, percentage: 71 },
]

const tidComplianceData = [
  { platform: "Instagram", within24h: 94, total: 100, percentage: 94 },
  { platform: "Facebook", within24h: 89, total: 100, percentage: 89 },
  { platform: "Twitter", within24h: 82, total: 100, percentage: 82 },
  { platform: "TikTok", within24h: 76, total: 100, percentage: 76 },
]

const platformConnectionData = [
  { platforms: "Instagram & Facebook", incidents: 1500, strength: 85 },
  { platforms: "Instagram & WhatsApp", incidents: 1200, strength: 75 },
  { platforms: "Facebook & Twitter", incidents: 1000, strength: 65 },
  { platforms: "WhatsApp & TikTok", incidents: 800, strength: 55 },
]

const crossPlatformRemediationData = [
  { month: "Jan", avgRemediationHours: 28.5, multiPlatformIncidents: 1200 },
  { month: "Feb", avgRemediationHours: 26.8, multiPlatformIncidents: 1350 },
  { month: "Mar", avgRemediationHours: 24.2, multiPlatformIncidents: 1180 },
  { month: "Apr", avgRemediationHours: 22.1, multiPlatformIncidents: 1420 },
  { month: "May", avgRemediationHours: 19.8, multiPlatformIncidents: 1650 },
  { month: "Jun", avgRemediationHours: 18.3, multiPlatformIncidents: 1890 },
]

const getComplianceColor = (percentage: number) => {
  if (percentage >= 90) return "text-green-600 bg-green-50"
  if (percentage >= 75) return "text-yellow-600 bg-yellow-50"
  return "text-red-600 bg-red-50"
}

const getComplianceIcon = (percentage: number) => {
  if (percentage >= 90) return <CheckCircle2 className="h-4 w-4" />
  if (percentage >= 75) return <AlertTriangle className="h-4 w-4" />
  return <XCircle className="h-4 w-4" />
}

export default function DashboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("6months")
  const [selectedPlatformGroup, setSelectedPlatformGroup] = useState<any>(null)

  const totalReports = velocityData.reduce((sum, item) => sum + item.totalReports, 0)
  const avgPlatformsPerIncident =
    platformDistributionData.reduce((sum, item, index) => {
      const multiplier =
        item.name === "2 Platforms" ? 2 : item.name === "3 Platforms" ? 3 : item.name === "4+ Platforms" ? 4 : 5
      return sum + item.value * multiplier
    }, 0) / platformDistributionData.reduce((sum, item) => sum + item.value, 0)

  const avgResolutionTime = velocityData.reduce((sum, item) => sum + item.avgResolutionTime, 0) / velocityData.length
  const overallDSACompliance =
    dsaComplianceData.reduce((sum, item) => sum + item.percentage, 0) / dsaComplianceData.length
  const overallTIDCompliance =
    tidComplianceData.reduce((sum, item) => sum + item.percentage, 0) / tidComplianceData.length

  const handlePieClick = (data: any) => {
    setSelectedPlatformGroup(data)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Platform Incident Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor coordinated incidents across multiple platforms and regulatory compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            Export Report
          </Button> */}
        </div>
      </div>

      {/* Key Metrics - Enhanced with Cross-Platform Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900">{totalReports.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12.5% from last month</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Avg Platforms/Incident</p>
                <p className="text-3xl font-bold text-orange-900">{Math.round(avgPlatformsPerIncident)}</p>
                <div className="flex items-center mt-2">
                  <Globe className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600">Multi-platform attacks</span>
                </div>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <Link className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">DSA Compliance</p>
                <p className="text-3xl font-bold text-gray-900">{overallDSACompliance.toFixed(0)}%</p>
                <div className="flex items-center mt-2">
                  <Shield className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-gray-600">48h mandate</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-gray-900">{avgResolutionTime.toFixed(1)}m</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">-8.2% improvement</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="platform-analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-2">
          <TabsTrigger
            value="platform-analysis"
            className="border rounded-md py-2 px-4 font-medium text-sm bg-white hover:bg-gray-100 data-[state=active]:bg-orange-100 data-[state=active]:border-orange-500 data-[state=active]:text-orange-700 transition"
          >
            Platform Analysis
          </TabsTrigger>
          <TabsTrigger
            value="velocity"
            className="border rounded-md py-2 px-4 font-medium text-sm bg-white hover:bg-gray-100 data-[state=active]:bg-gray-200 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 transition"
          >
            Platform Velocity
          </TabsTrigger>
          <TabsTrigger
            value="regulatory"
            className="border rounded-md py-2 px-4 font-medium text-sm bg-white hover:bg-gray-100 data-[state=active]:bg-gray-200 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 transition"
          >
            Regulatory Barometers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Network className="h-5 w-5" />
                  Platform Distribution
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {selectedPlatformGroup
                    ? `Harm types for ${selectedPlatformGroup.name} incidents`
                    : "Number of platforms affected per incident"}
                </p>
                {selectedPlatformGroup && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedPlatformGroup(null)} className="mt-2">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Platform Distribution
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={selectedPlatformGroup ? selectedPlatformGroup.harmTypes : platformDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey={selectedPlatformGroup ? "incidents" : "value"}
                      onClick={selectedPlatformGroup ? undefined : handlePieClick}
                      style={{ cursor: selectedPlatformGroup ? "default" : "pointer" }}
                    >
                      {(selectedPlatformGroup ? selectedPlatformGroup.harmTypes : platformDistributionData).map(
                        (entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ),
                      )}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} incidents`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(selectedPlatformGroup ? selectedPlatformGroup.harmTypes : platformDistributionData).map(
                    (item: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                        <span>
                          {item.name}: {selectedPlatformGroup ? item.incidents : `${item.percentage}%`}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Link className="h-5 w-5" />
                  Harm Lateral Movement Trend
                </CardTitle>
                <p className="text-sm text-gray-600">Most common platform combinations in attacks</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformConnectionData.map((connection, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{connection.platforms}</p>
                        <p className="text-xs text-gray-600">{connection.incidents} incidents</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={connection.strength} className="w-16" />
                        <span className="text-sm font-medium w-8">{connection.strength}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Globe className="h-5 w-5" />
                Multi-Platform Attack Patterns
              </CardTitle>
              <p className="text-sm text-gray-600">Coordinated attack campaigns across multiple platforms</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {multiPlatformAttackPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-orange-900">{pattern.type}</h4>
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        {pattern.trend}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Incidents</p>
                        <p className="text-xl font-bold text-orange-800">{pattern.incidents.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Platforms</p>
                        <p className="text-xl font-bold text-orange-800">{pattern.platforms}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Reporting Velocity</CardTitle>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">Measurement Timeline:</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Start: Incident occurs</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>End: Report submitted to platform</span>
                    </div>
                  </div>
                  <p className="text-xs italic">Shows how quickly users report incidents after they happen</p>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Bar dataKey="avgReportTime" fill="#3b82f6" name="Avg Report Time" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resolution Time by Platform</CardTitle>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">Measurement Timeline:</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Start: Report received by platform</span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>End: Incident resolved/action taken</span>
                    </div>
                  </div>
                  <p className="text-xs italic">Shows platform response time from report to resolution</p>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Bar dataKey="avgResolutionTime" fill="#10b981" name="Avg Resolution Time" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Velocity of Cross Platform Remediation
              </CardTitle>
              <p className="text-sm text-gray-600">
                Average time to resolve incidents across multiple platforms - showing improvement over time
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={crossPlatformRemediationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="hours" label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                  <YAxis
                    yAxisId="incidents"
                    orientation="right"
                    label={{ value: "Incidents", angle: 90, position: "insideRight" }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "avgRemediationHours" ? `${value}h` : value,
                      name === "avgRemediationHours" ? "Avg Remediation Time" : "Multi-Platform Incidents",
                    ]}
                  />
                  <Line
                    yAxisId="hours"
                    type="monotone"
                    dataKey="avgRemediationHours"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="avgRemediationHours"
                  />
                  <Line
                    yAxisId="incidents"
                    type="monotone"
                    dataKey="multiPlatformIncidents"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="multiPlatformIncidents"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">-35%</div>
                  <p className="text-sm text-green-700">Improvement in 6 months</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">18.3h</div>
                  <p className="text-sm text-blue-700">Current avg remediation</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">+58%</div>
                  <p className="text-sm text-purple-700">Volume increase handled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Platform</th>
                      <th className="text-left p-3">Total Reports</th>
                      <th className="text-left p-3">Avg Report Time</th>
                      <th className="text-left p-3">Avg Resolution Time</th>
                      <th className="text-left p-3">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {velocityData.map((platform) => (
                      <tr key={platform.platform} className="border-b">
                        <td className="p-3 font-medium">{platform.platform}</td>
                        <td className="p-3">{platform.totalReports.toLocaleString()}</td>
                        <td className="p-3">{platform.avgReportTime}m</td>
                        <td className="p-3">{platform.avgResolutionTime}m</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              platform.avgResolutionTime < 1200
                                ? "default"
                                : platform.avgResolutionTime < 1800
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {platform.avgResolutionTime < 1200
                              ? "Excellent"
                              : platform.avgResolutionTime < 1800
                                ? "Good"
                                : "Needs Improvement"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  DSA 48-Hour Compliance Barometer
                </CardTitle>
                <p className="text-sm text-gray-600">
                  EU Digital Services Act mandates response to illegal content within 48 hours
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{overallDSACompliance.toFixed(0)}%</div>
                  <p className="text-sm text-purple-700">Overall DSA Compliance Rate</p>
                </div>
                <div className="space-y-3">
                  {dsaComplianceData.map((platform) => (
                    <div
                      key={platform.platform}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${getComplianceColor(platform.percentage)}`}>
                          {getComplianceIcon(platform.percentage)}
                        </div>
                        <span className="font-medium">{platform.platform}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={platform.percentage} className="w-24" />
                        <span className="text-sm font-medium w-12">{platform.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-red-600" />
                  Take It Down Bill Compliance
                </CardTitle>
                <p className="text-sm text-gray-600">48-hour mandate for non-consensual intimate image removal</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 mb-2">{overallTIDCompliance.toFixed(0)}%</div>
                  <p className="text-sm text-red-700">Overall TID Compliance Rate</p>
                </div>
                <div className="space-y-3">
                  {tidComplianceData.map((platform) => (
                    <div
                      key={platform.platform}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${getComplianceColor(platform.percentage)}`}>
                          {getComplianceIcon(platform.percentage)}
                        </div>
                        <span className="font-medium">{platform.platform}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={platform.percentage} className="w-24" />
                        <span className="text-sm font-medium w-12">{platform.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
