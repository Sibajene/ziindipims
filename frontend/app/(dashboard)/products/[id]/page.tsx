'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { formatCurrency } from '../../../../lib/utils'
import { ArrowLeft, Edit, Trash, Plus } from 'lucide-react'
import { productService } from '../../../../lib/api/productService'

interface Product {
  id: string
  name: string
  genericName: string
  dosageForm: string
  strength: string
  barcode?: string
  requiresPrescription: boolean
  controlled: boolean
  unitPrice: number
  reorderLevel: number
  category?: string
  manufacturer?: string
  description?: string
  imageUrl?: string
  isActive: boolean
  supplierId?: string
  supplier?: {
    id: string
    name: string
  }
  batches?: Batch[]
  createdAt: string
  updatedAt: string
}

interface Batch {
  id: string
  productId: string
  branchId: string
  quantity: number
  batchNumber: string
  expiryDate: string
  costPrice: number
  sellingPrice: number
  isActive: boolean
  branch: {
    id: string
    name: string
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        
        const data = await productService.getProduct(token, params.id as string)
        setProduct(data)
      } catch (error) {
        console.error('Failed to fetch product', error)
        setError("Failed to load product details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])
  
  const handleDelete = async () => {
    if (!product) return
    
    try {
      setIsDeleting(true)
      setError(null)
      const token = localStorage.getItem('token') || ''
      
      if (!token) {
        router.push('/login')
        return
      }
      
      await productService.deleteProduct(token, product.id)
      setSuccessMessage("Product deleted successfully")
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push('/products')
      }, 1500)
    } catch (error) {
      console.error('Failed to delete product', error)
      setError("Failed to delete product. It may have associated batches or sales.")
      setIsDeleting(false)
    } finally {
      setShowDeleteDialog(false)
    }
  }
  
  const handleSubmit = async (data) => {
    try {
      console.log('Batch data to send:', data);


      const token = localStorage.getItem('token') || '';
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await productService.createBatch(token, data);
      // Handle success
      console.log('Batch created successfully:', response);
      // Reset form or show success message
    } catch (error) {
      console.error('Failed to create batch', error);
      // Show error message
    }

  };  
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading product details...</div>
  }
  
  if (!product) {
    return <div className="flex justify-center py-8">Product not found</div>
  }
  
  // Calculate total stock across all batches
  const totalStock = product.batches?.reduce((sum, batch) => sum + batch.quantity, 0) || 0
  
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
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
            <p className="mb-6 text-gray-600">
              This action cannot be undone. This will permanently delete the product
              {product.batches && product.batches.length > 0 
                ? ", but it cannot be deleted while it has existing batches."
                : "."}
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || (product.batches && product.batches.length > 0)}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold">{product.name}</h1>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => router.push(`/products/${product.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
        >
          <Trash className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
        <Button 
          onClick={() => router.push(`/inventory/new-batch?productId=${product.id}`)}
          className="ml-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Batch
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-6">
              {product.imageUrl ? (
                <div className="mb-4">
                  <img 
                    src={product.imageUrl.startsWith('http') 
                      ? product.imageUrl 
                      : product.imageUrl.startsWith('/uploads') 
                        ? `/api/uploads${product.imageUrl.substring('/uploads'.length)}` 
                        : `/api/uploads${product.imageUrl}`} 
                    alt={product.name} 
                    className="w-full max-w-[300px] h-auto rounded-md object-cover mb-2"
                    onError={(e) => {
                      console.error('Image failed to load:', product.imageUrl);
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src = '/images/No-image.png';
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/products/${product.id}/edit-image`)}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="w-full max-w-[300px] h-[200px] bg-slate-100 rounded-md flex items-center justify-center mb-2">
                    <p className="text-slate-400">No image</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/products/${product.id}/edit-image`)}
                  >
                    Add Image
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Generic Name</p>
                <p>{product.genericName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Category</p>
                <p>{product.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Dosage Form</p>
                <p>{product.dosageForm}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Strength</p>
                <p>{product.strength}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Manufacturer</p>
                <p>{product.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Requires Prescription</p>
                <p>{product.requiresPrescription ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Controlled Substance</p>
                <p>{product.controlled ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Barcode</p>
                <p>{product.barcode || 'N/A'}</p>
              </div>
              {product.supplier && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Supplier</p>
                  <p>{product.supplier.name}</p>
                </div>
              )}
            </div>
            
            {product.description && (
              <div>
                <p className="text-sm font-medium text-slate-500">Description</p>
                <p className="mt-1">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
          
        <div className="space-y-6">
          <Card>
          <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Selling Price</p>
                <p className="text-2xl font-bold">{formatCurrency(product.unitPrice)}</p>
              </div>
              {product.batches && product.batches.length > 0 && (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Average Cost Price</p>
                    <p className="text-lg">
                      {formatCurrency(
                        product.batches.reduce((sum, batch) => sum + batch.costPrice, 0) / product.batches.length
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Avg. Profit Margin</p>
                    <p className="text-lg">
                      {Math.round(
                        ((product.unitPrice - 
                          (product.batches.reduce((sum, batch) => sum + batch.costPrice, 0) / product.batches.length)
                        ) / product.unitPrice) * 100
                      )}%
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
            
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Current Stock</p>
                <p className="text-2xl font-bold">{totalStock} units</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Reorder Level</p>
                <p className="text-lg">{product.reorderLevel} units</p>
              </div>
              <Button 
                className="w-full"
                onClick={() => router.push(`/inventory/stock-adjustment?productId=${product.id}`)}
              >
                Update Stock
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
        </CardHeader>
        <CardContent>
          {product.batches && product.batches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Branch</th>
                    <th className="text-left py-3 px-4">Batch Number</th>
                    <th className="text-left py-3 px-4">Expiry Date</th>
                    <th className="text-left py-3 px-4">Quantity</th>
                    <th className="text-left py-3 px-4">Cost Price</th>
                    <th className="text-left py-3 px-4">Selling Price</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {product.batches.map((batch) => {
                    const expiryDate = new Date(batch.expiryDate);
                    const today = new Date();
                    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    let status = 'Good';
                    let statusClass = 'bg-green-100 text-green-800';
                    
                    if (daysUntilExpiry < 0) {
                      status = 'Expired';
                      statusClass = 'bg-red-100 text-red-800';
                    } else if (daysUntilExpiry < 30) {
                      status = 'Expiring Soon';
                      statusClass = 'bg-amber-100 text-amber-800';
                    } else if (batch.quantity <= product.reorderLevel) {
                      status = 'Low Stock';
                      statusClass = 'bg-blue-100 text-blue-800';
                    }
                    
                    return (
                      <tr key={batch.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">{batch.branch.name}</td>
                        <td className="py-3 px-4">{batch.batchNumber}</td>
                        <td className="py-3 px-4">
                          {new Date(batch.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{batch.quantity} units</td>
                        <td className="py-3 px-4">{formatCurrency(batch.costPrice)}</td>
                        <td className="py-3 px-4">{formatCurrency(batch.sellingPrice)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${statusClass}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-slate-500">No batches available for this product</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

