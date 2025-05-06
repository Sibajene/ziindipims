'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { ArrowLeft, Upload } from 'lucide-react'
import { productService } from '../../../../../lib/api/productService'

export default function EditProductImagePage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
        if (data.imageUrl) {
          setPreviewUrl(data.imageUrl.startsWith('http') 
            ? data.imageUrl 
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${data.imageUrl}`)
        }
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }
    
    setSelectedFile(file)
    setError(null)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const handleUpload = async () => {
    if (!selectedFile || !product) return
    
    try {
      setIsUploading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      // Create form data
      const formData = new FormData()
      formData.append('image', selectedFile)

      await productService.uploadProductImage(token, product.id, formData)

      // Fetch updated product data
      const updatedProduct = await productService.getProduct(token, product.id)
      setProduct(updatedProduct)

      // Use the same URL construction logic as in the useEffect
      if (updatedProduct.imageUrl) {
        setPreviewUrl(updatedProduct.imageUrl.startsWith('http') 
          ? updatedProduct.imageUrl 
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${updatedProduct.imageUrl}`)
      }
      
      setSuccessMessage('Product image updated successfully')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/products/${product.id}`)
      }, 1500)
    } catch (error) {
      console.error('Failed to upload image', error)
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }
  
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading product details...</div>
  }
  
  if (!product) {
    return <div className="flex justify-center py-8">Product not found</div>
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
        
        <h1 className="text-3xl font-bold">Edit Product Image</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Product Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-2">Product</p>
            <p className="font-medium">{product.name}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-500 mb-2">Current Image</p>
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt={product.name} 
                className="w-full max-w-[300px] h-auto rounded-md object-cover"
              />
            ) : (
              <div className="w-full max-w-[300px] h-[200px] bg-slate-100 rounded-md flex items-center justify-center">
                <p className="text-slate-400">No image</p>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-500 mb-2">Upload New Image</p>
            <div className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center">
              <input
                type="file"
                id="product-image"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="product-image" 
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Click to select an image</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}