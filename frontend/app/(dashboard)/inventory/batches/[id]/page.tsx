"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { ArrowLeft, Edit, Save, Trash } from 'lucide-react'
import { inventoryService } from '../../../../../lib/api'
import { format } from 'date-fns'
import { Label } from '../../../../../components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../components/ui/popover'
import { Calendar } from '../../../../../components/ui/calendar'
import { cn } from '../../../../../lib/utils'
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
} from '../../../../../components/ui/alert-dialog'

export default function BatchDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const batchId = params.id as string
  
  const [batch, setBatch] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [batchNumber, setBatchNumber] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [quantity, setQuantity] = useState<number>(0)
  const [costPrice, setCostPrice] = useState<number>(0)
  const [sellingPrice, setSellingPrice] = useState<number>(0)
  const [isActive, setIsActive] = useState<boolean>(true)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchBatch = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        
        // Fetch batch details
        const batchData = await inventoryService.getBatch(token, batchId)
        setBatch(batchData)
        
        // Set form values
        setBatchNumber(batchData.batchNumber)
        setExpiryDate(new Date(batchData.expiryDate))
        setQuantity(batchData.quantity)
        setCostPrice(batchData.costPrice)
        setSellingPrice(batchData.sellingPrice)
        setIsActive(batchData.isActive)
      } catch (error) {
        console.error('Failed to fetch batch', error)
        setError('Failed to load batch details. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (batchId) {
      fetchBatch()
    }
  }, [batchId, router])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!batchNumber || !expiryDate || quantity < 0 || costPrice <= 0 || sellingPrice <= 0) {
      setError('Please fill in all required fields with valid values')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      const batchData = {
        batchNumber,
        expiryDate: expiryDate.toISOString(),
        quantity,
        costPrice,
        sellingPrice,
        isActive
      }
      
      // Update the batch
      await inventoryService.updateBatch(token, batchId, batchData)
      
      setSuccessMessage('Batch updated successfully')
      setIsEditing(false)
      
      // Refresh batch data
      const updatedBatch = await inventoryService.getBatch(token, batchId)
      setBatch(updatedBatch)
    } catch (error) {
      console.error('Failed to update batch', error)
      setError('Failed to update batch. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      // Delete the batch
      await inventoryService.deleteBatch(token, batchId)
      
      setSuccessMessage('Batch deleted successfully')
      
      // Redirect after a short delay
      setTimeout(() => {
        if (batch?.productId) {
          router.push(`/products/${batch.productId}`)
        } else {
          router.push('/inventory/batches')
        }
      }, 1500)
    } catch (error) {
      console.error('Failed to delete batch', error)
      setError('Failed to delete batch. This batch may be referenced in sales or other records.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }
  
  if (!batch) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          Batch not found
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold">Batch Details</h1>
        </div>
        
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(false)} variant="outline">
              Cancel
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the batch
                  and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Product
                </Label>
                <p className="font-medium">{batch.product?.name}</p>
                <p className="text-sm text-slate-500">
                  {batch.product?.genericName} {batch.product?.strength} {batch.product?.dosageForm}
                </p>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Branch
                </Label>
                <p className="font-medium">{batch.branch?.name}</p>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Batch Number
                </Label>
                <p className="font-medium">{batch.batchNumber}</p>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Expiry Date
                </Label>
                <p className="font-medium">{format(new Date(batch.expiryDate), 'PPP')}</p>
                {new Date(batch.expiryDate) < new Date() && (
                  <p className="text-sm text-red-500">Expired</p>
                )}
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Quantity
                </Label>
                <p className="font-medium">{batch.quantity}</p>
              </div>
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Cost Price
                </Label>
                <p className="font-medium">${batch.costPrice.toFixed(2)}</p>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Selling Price
                </Label>
                <p className="font-medium">${batch.sellingPrice.toFixed(2)}</p>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Status
                </Label>
                <p className={`font-medium ${batch.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {batch.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Created At
                </Label>
                <p className="font-medium">{format(new Date(batch.createdAt), 'PPP')}</p>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-slate-500 mb-1">
                  Last Updated
                </Label>
                <p className="font-medium">{format(new Date(batch.updatedAt), 'PPP')}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-1">
                    Product
                  </Label>
                  <p className="font-medium">{batch.product?.name}</p>
                  <p className="text-sm text-slate-500">
                    {batch.product?.genericName} {batch.product?.strength} {batch.product?.dosageForm}
                  </p>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-1">
                    Branch
                  </Label>
                  <p className="font-medium">{batch.branch?.name}</p>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-1">
                    Batch Number*
                  </Label>
                  <Input
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Enter batch number"
                    required
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-1">
                    Expiry Date*
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expiryDate && "text-muted-foreground"
                        )}
                      >
                        {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-1">
                    Quantity*
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Enter quantity"
                    required
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-1">
                    Cost Price*
                  </Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Enter cost price"
                    required
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-slate-700 mb-1">
                    Selling Price*
                  </Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Enter selling price"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                    Active
                  </Label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !batchNumber || !expiryDate || quantity < 0 || costPrice <= 0 || sellingPrice <= 0}
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}