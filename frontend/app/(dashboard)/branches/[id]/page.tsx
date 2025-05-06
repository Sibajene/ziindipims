'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { branchService } from '../../../../lib/api/branchService'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { useToast } from '../../../../components/ui/use-toast'

const BranchDetailPage: React.FC = () => {
  const [branch, setBranch] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    if (params.id === 'new') {
      router.push('/branches/create')
      return
    }
    const fetchBranch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // Remove the token parameter - it's not needed based on your other service calls
        const data = await branchService.getById(params.id)
        setBranch(data)
      } catch (err) {
        console.error("Error fetching branch:", err)
        setError('Failed to load branch details')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBranch()
  }, [params.id, router])

  const handleBack = () => {
    router.push('/branches')
  }

  if (isLoading) return <p>Loading branch details...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!branch) return <p>No branch found.</p>

  return (
    <div className="space-y-6">
      <Button onClick={handleBack}>Back to Branches</Button>
      <Card>
        <CardHeader>
          <CardTitle>{branch.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Location:</strong> {branch.location}</p>
          <p><strong>Phone:</strong> {branch.phone}</p>
          <p><strong>Email:</strong> {branch.email}</p>
          <p><strong>Manager Email:</strong> {branch.managerEmail}</p>
          <p><strong>Opening Hours:</strong> {branch.openingHours}</p>
          <p><strong>GPS Coordinates:</strong> {branch.gpsCoordinates}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default BranchDetailPage;