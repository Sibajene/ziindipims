'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Input } from '../../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'
import { Textarea } from '../../../../components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { productService } from '../../../../lib/api/productService'
import { inventoryService } from '../../../../lib/api'

export default function StockAdjustmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  
  const [product, setProduct] = useState<any>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add')
  const [quantity, setQuantity] = useState<number>(0)
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        
        // If productId is provided, fetch the product details
        if (productId) {
          const productData = await productService.getProduct(token, productId)
          setProduct(productData)
          
          if (productData.batches && productData.batches.length > 0) {
            setBatches(productData.batches)
            setSelectedBatchId(productData.batches[0].id)
          }
        } else {
          // Otherwise, fetch all batches
          const batchesData = await inventoryService.getBatches({ inStock: true })
          setBatches(batchesData)
          if (batchesData.length > 0) {
            setSelectedBatchId(batchesData[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data', error)
        setError("Failed to load data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [productId, router])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBatchId || quantity <= 0 || !reason) {
      setError('Please fill in all required fields')
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
      
      const adjustmentData = {
        batchId: selectedBatchId,
        quantity: adjustmentType === 'add' ? quantity : -quantity,
        reason
      }
      
      await inventoryService.adjustStock(token, adjustmentData)
      
      setSuccessMessage('Stock adjustment completed successfully')
      
            // Reset form fields
            setQuantity(0)
            setReason('')
            
            // Refresh the data after a successful adjustment
            if (productId) {
              const productData = await productService.getProduct(token, productId)
              setProduct(productData)
              
              if (productData.batches && productData.batches.length > 0) {
                setBatches(productData.batches)
              }
            } else {
              const batchesData = await inventoryService.getBatches({ inStock: true })
              setBatches(batchesData)
            }
            
            // Redirect after a short delay
            setTimeout(() => {
              if (productId) {
                router.push(`/products/${productId}`)
              } else {
                router.push('/inventory')
              }
            }, 2000)
          } catch (error) {
            console.error('Failed to adjust stock', error)
            setError("Failed to adjust stock. Please try again.")
          } finally {
            setIsSubmitting(false)
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
              
              <h1 className="text-3xl font-bold">Stock Adjustment</h1>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Adjust Stock Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {product && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Product</p>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.genericName} {product.strength} {product.dosageForm}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Batch
                    </label>
                    <Select 
                      value={selectedBatchId} 
                      onValueChange={setSelectedBatchId}
                      disabled={batches.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.batchNumber} - Exp: {new Date(batch.expiryDate).toLocaleDateString()} 
                            ({batch.quantity} units)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {batches.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">No batches available for this product</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Adjustment Type
                    </label>
                    <Select 
                      value={adjustmentType} 
                      onValueChange={(value) => setAdjustmentType(value as 'add' | 'subtract')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select adjustment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Add Stock</SelectItem>
                        <SelectItem value="subtract">Remove Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quantity
                    </label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Reason for Adjustment
                    </label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for stock adjustment"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || batches.length === 0 || !selectedBatchId || quantity <= 0 || !reason}
                    >
                      {isSubmitting ? 'Processing...' : 'Submit Adjustment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )
      }