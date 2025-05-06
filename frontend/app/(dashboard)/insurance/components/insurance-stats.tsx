"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { insuranceApi } from "../../../../lib/api/insurance"
import { useEffect, useState } from "react"
import { Loader2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, FileText, Timer } from "lucide-react"

interface StatsData {
  totalClaims: number
  pendingClaims: number
  approvedClaims: number
  rejectedClaims: number
  totalAmount: number
  approvedAmount: number
  rejectedAmount: number
  averageProcessingTime: number
  claimsByProvider: {
    providerId: string
    providerName: string
    count: number
    amount: number
  }[]
}

export function InsuranceStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get current date and 30 days ago for default date range
        const endDate = new Date().toISOString().split('T')[0]
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        const data = await insuranceApi.getClaimStatistics({
          startDate,
          endDate
        })
        
        // Ensure all required properties exist with default values if needed
        const formattedData: StatsData = {
          totalClaims: data.totalClaims || 0,
          pendingClaims: data.pendingClaims || 0,
          approvedClaims: data.approvedClaims || 0,
          rejectedClaims: data.rejectedClaims || 0,
          totalAmount: data.totalAmount || 0,
          approvedAmount: data.approvedAmount || 0,
          rejectedAmount: data.rejectedAmount || 0,
          averageProcessingTime: data.averageProcessingTime || 0,
          claimsByProvider: data.claimsByProvider || []
        }
        
        setStats(formattedData)
      } catch (err) {
        console.error("Failed to fetch insurance statistics:", err)
        setError("Failed to load statistics")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error || "Failed to load statistics"}</p>
        </div>
      </Card>
    )
  }

  // Calculate percentages safely
  const approvalRate = stats.totalClaims > 0 
    ? Math.round((stats.approvedClaims / stats.totalClaims) * 100) 
    : 0;
    
  const pendingRate = stats.totalClaims > 0 
    ? Math.round((stats.pendingClaims / stats.totalClaims) * 100) 
    : 0;
    
  const approvedAmountRate = stats.totalAmount > 0 
    ? Math.round((stats.approvedAmount / stats.totalAmount) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Claims
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {stats.totalClaims}
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500">
            <span className="inline-flex items-center text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {approvalRate}% approval rate
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Claims
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {stats.pendingClaims}
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500">
            <span className="inline-flex items-center text-amber-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              {pendingRate}% of total claims
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Approved Amount
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              ${(stats.approvedAmount || 0).toLocaleString()}
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500">
            <span className="inline-flex items-center text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {approvedAmountRate}% of total amount
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg. Processing Time
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {stats.averageProcessingTime} days
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Timer className="h-6 w-6 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500">
            <span className="inline-flex items-center">
              {stats.averageProcessingTime < 3 ? (
                <span className="text-green-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Faster than target
                </span>
              ) : (
                <span className="text-amber-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Slower than target
                </span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}