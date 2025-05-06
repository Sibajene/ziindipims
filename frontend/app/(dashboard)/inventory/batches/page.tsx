import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Plus, Filter } from 'lucide-react'
import { inventoryService } from '../../../../lib/api'
import { BatchesTable } from '../../../../components/inventory/BatchesTable'
import { Input } from '../../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog'

export default function BatchesPage() {
  const router = useRouter()
  const [batches, setBatches] = useState<any[]>([])
  const [filteredBatches, setFilteredBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterExpiry, setFilterExpiry] = useState<string>('all')
  const [batchToDelete, setBatchToDelete] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        
        const data = await inventoryService.getBatches()
        setBatches(data)
        setFilteredBatches(data)
      } catch (error) {
        console.error('Failed to fetch batches', error)
        setError('Failed to load batches. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchBatches()
  }, [router])
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    let result = [...batches]
    
    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase()
      result = result.filter(batch => 
        batch.batchNumber.toLowerCase().includes(lowerCaseSearch) ||
        batch.product?.name.toLowerCase().includes(lowerCaseSearch) ||
        batch.branch?.name.toLowerCase().includes(lowerCaseSearch)
      )
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active'
      result = result.filter(batch => batch.isActive === isActive)
    }
    
    // Apply expiry filter
    if (filterExpiry !== 'all') {
      const today = new Date()
      
      if (filterExpiry === 'expired') {
        result = result.filter(batch => new Date(batch.expiryDate) < today)
      } else if (filterExpiry === 'expiring-soon') {
        const threeMonths = 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
        result = result.filter(batch => {
          const expiryDate = new Date(batch.expiryDate)
          return expiryDate > today && expiryDate.getTime() - today.getTime() < threeMonths
        })
      } else if (filterExpiry === 'valid') {
        const threeMonths = 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
        result = result.filter(batch => {
          const expiryDate = new Date(batch.expiryDate)
          return expiryDate > today && expiryDate.getTime() - today.getTime() >= threeMonths
        })
      }
    }
    
    setFilteredBatches(result)
  }, [batches, searchTerm, filterStatus, filterExpiry])
  
  const handleEditBatch = (batch: any) => {
    router.push(`/inventory/edit-batch/${batch.id}`)
  }
  
  const handleDeleteBatch = (batch: any) => {
    setBatchToDelete(batch)
    setIsDeleteDialogOpen(true)
  }
  
  const confirmDeleteBatch = async () => {
    if (!batchToDelete) return
    
    try {
      setIsDeleting(true)
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      await inventoryService.adjustStock(token, {
        batchId: batchToDelete.id,
        action: 'delete'
      })
      
      // Remove the deleted batch from the state
      setBatches(batches.filter(b => b.id !== batchToDelete.id))
      setIsDeleteDialogOpen(false)
      setBatchToDelete(null)
    } catch (error) {
      console.error('Failed to delete batch', error)
      setError('Failed to delete batch. It may be referenced in sales or other records.')
    } finally {
      setIsDeleting(false)
    }
  }  
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Batches</h1>
        <Button onClick={() => router.push('/inventory/new-batch')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Batch
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Batch Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by batch number, product, or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterExpiry} onValueChange={setFilterExpiry}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expiry Dates</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <BatchesTable 
            batches={filteredBatches} 
            onEdit={handleEditBatch} 
            onDelete={handleDeleteBatch} 
          />
          
          {filteredBatches.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No batches found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete batch {batchToDelete?.batchNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteBatch} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}