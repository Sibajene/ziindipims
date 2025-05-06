'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { branchService } from '../../../lib/api/branchService'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useToast } from '../../../components/ui/use-toast'

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        // Fix: use branchService.get() instead of branchService.getBranches()
        const data = await branchService.get()
        setBranches(data)
      } catch (err) {
        setError('Failed to load branches')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBranches()
  }, [router])

  const handleAddBranch = () => {
    router.push('/branches/new')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Branches</h1>
        <Button onClick={handleAddBranch}>Add Branch</Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {isLoading ? (
        <p>Loading branches...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="cursor-pointer" onClick={() => router.push(`/branches/${branch.id}`)}>
              <CardHeader>
                <CardTitle>{branch.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{branch.location}</p>
                <p>{branch.phone}</p>
                <p>{branch.email}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default BranchesPage
