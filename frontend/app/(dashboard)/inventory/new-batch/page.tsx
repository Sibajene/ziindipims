"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { ArrowLeft, Save } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { productService } from '../../../../lib/api/productService'
import { createInventoryBatch } from '../../../../lib/api/inventoryService'
import { branchService } from '../../../../lib/api/branchService'
import { format } from 'date-fns'
import { Calendar } from '../../../../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover'
import { cn } from '../../../../lib/utils'
import { Label } from '../../../../components/ui/label'

export default function NewBatchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  
  const [products, setProducts] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>(productId || '')
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [batchNumber, setBatchNumber] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [quantity, setQuantity] = useState<number>(0)
  const [costPrice, setCostPrice] = useState<number>(0)
  const [sellingPrice, setSellingPrice] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        
        // Fetch products
        const productsData = await productService.getProducts(token)
        setProducts(productsData)
        
        // Fetch branches using branchService instead of inventoryService
        const branchesData = await branchService.get()
        setBranches(branchesData)
        
        // If we have branches, select the first one by default
        if (branchesData.length > 0) {
          setSelectedBranchId(branchesData[0].id)
        }
        
        // Generate a default batch number (current date in YYYYMMDD format)
        const today = new Date()
        const defaultBatchNumber = `B${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        setBatchNumber(defaultBatchNumber)
        
        // Set default expiry date (1 year from now)
        const defaultExpiryDate = new Date()
        defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1)
        setExpiryDate(defaultExpiryDate)
        
        // If productId is provided, fetch product details to pre-fill some fields
        if (productId) {
          const productData = await productService.getProduct(token, productId)
          setSelectedProductId(productId)
          
          // Pre-fill selling price if available
          if (productData.unitPrice) {
            setSellingPrice(productData.unitPrice)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data', error)
        setError('Failed to load data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }    
    fetchData()
  }, [productId, router])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!selectedProductId || !selectedBranchId || !batchNumber || !expiryDate || quantity <= 0 || costPrice <= 0 || sellingPrice <= 0) {
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
        productId: selectedProductId,
        branchId: selectedBranchId,
        batchNumber,
        expiryDate: expiryDate || null, // Send as Date object, not ISO string
        quantity,
        costPrice,
        sellingPrice,
        createdBy: localStorage.getItem('userId') || '', // Add the user ID who is creating the batch
      }
      
      console.log('Batch data to send:', batchData);
      
      try {
        // Create the batch
        const response = await createInventoryBatch(batchData);
        console.log('Response from server:', response);
        setSuccessMessage('Batch created successfully');
        
        // Reset form or redirect
        setTimeout(() => {
          if (productId) {
            router.push(`/products/${productId}`);
          } else {
            router.push('/inventory');
          }
        }, 1500);
      } catch (apiError) {
        console.error('API Error:', apiError);
        if (apiError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', apiError.response.data);
          console.error('Error response status:', apiError.response.status);
          console.error('Error response headers:', apiError.response.headers);
          
          // Set a more specific error message if available
          if (apiError.response.data && apiError.response.data.message) {
            setError(`Failed to create batch: ${apiError.response.data.message}`);
          } else {
            setError(`Failed to create batch: Server returned ${apiError.response.status}`);
          }
        } else if (apiError.request) {
          // The request was made but no response was received
          console.error('Error request:', apiError.request);
          setError('Failed to create batch: No response received from server');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', apiError.message);
          setError(`Failed to create batch: ${apiError.message}`);
        }
      }
    } catch (error) {
      console.error('General error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold">Add New Batch</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1">
                  Product*
                </Label>
                <Select 
                  value={selectedProductId} 
                  onValueChange={setSelectedProductId}
                  disabled={!!productId || products.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.genericName} {product.strength}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {products.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">No products available</p>
                )}
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1">
                  Branch*
                </Label>
                <Select 
                  value={selectedBranchId} 
                  onValueChange={setSelectedBranchId}
                  disabled={branches.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {branches.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">No branches available</p>
                )}
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
                      disabled={(date) => date < new Date()}
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
                  min="1"
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
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedProductId || !selectedBranchId || !batchNumber || !expiryDate || quantity <= 0 || costPrice <= 0 || sellingPrice <= 0}
              >
                {isSubmitting ? 'Creating...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Batch
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}