'use client'

import React, { useEffect, useState } from 'react'
import { analyticsService } from '../../lib/api/analyticsService'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const AnalyticsSummary: React.FC<{ pharmacyId: string }> = ({ pharmacyId }) => {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await analyticsService.getAnalyticsSummary(pharmacyId)
        setSummary(data)
      } catch (err) {
        setError('Failed to load analytics summary')
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [pharmacyId])

  if (loading) return <p>Loading analytics...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Total Events: {summary.totalEvents}</p>
        <p>Active Users: {summary.activeUsers}</p>
        <p>Revenue: ${summary.revenue}</p>
      </CardContent>
    </Card>
  )
}

export default AnalyticsSummary
