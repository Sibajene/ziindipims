'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '../../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../../../../../components/ui/form'
import { Input } from '../../../../../components/ui/input'
import { Textarea } from '../../../../../components/ui/textarea'
import { Checkbox } from '../../../../../components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../../../components/ui/select'
import { productService } from '../../../../../lib/api/productService'
import { supplierService } from '../../../../../lib/api/supplierService'

// Define the form validation schema
const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters' }),
  genericName: z.string().min(2, { message: 'Generic name must be at least 2 characters' }),
  dosageForm: z.string().min(1, { message: 'Dosage form is required' }),
  strength: z.string().min(1, { message: 'Strength is required' }),
  unitPrice: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  reorderLevel: z.coerce.number().int().nonnegative({ message: 'Reorder level must be a non-negative integer' }),
  barcode: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
  requiresPrescription: z.boolean().default(false),
  controlled: z.boolean().default(false),
  supplierId: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<any[]>([])
  
  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      genericName: '',
      dosageForm: '',
      strength: '',
      unitPrice: 0,
      reorderLevel: 0,
      barcode: '',
      category: '',
      manufacturer: '',
      description: '',
      requiresPrescription: false,
      controlled: false,
      supplierId: '',
    }
  })
  
  // Fetch product data and suppliers on component mount
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
        
        // Fetch product data
        const productData = await productService.getProduct(token, params.id as string)
        
        // Fetch suppliers for dropdown
        const suppliersData = await supplierService.getSuppliers(token)
        setSuppliers(suppliersData)
        
        // Set form values from product data
        form.reset({
          name: productData.name,
          genericName: productData.genericName,
          dosageForm: productData.dosageForm,
          strength: productData.strength,
          unitPrice: productData.unitPrice,
          reorderLevel: productData.reorderLevel,
          barcode: productData.barcode || '',
          category: productData.category || '',
          manufacturer: productData.manufacturer || '',
          description: productData.description || '',
          requiresPrescription: productData.requiresPrescription,
          controlled: productData.controlled,
          supplierId: productData.supplierId || '',
        })
      } catch (error) {
        console.error('Failed to fetch data', error)
        setError("Failed to load product data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params.id) {
      fetchData()
    }
  }, [params.id, router, form])
  
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Clean up empty strings to null for optional fields
      const cleanedData = {
        ...data,
        barcode: data.barcode || null,
        category: data.category || null,
        manufacturer: data.manufacturer || null,
        description: data.description || null,
        supplierId: data.supplierId || null,
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('You are not authenticated. Please log in again.')
        router.push('/login')
        return
      }
      
      await productService.updateProduct(token, params.id as string, cleanedData)
      setSuccessMessage('Product updated successfully')
      
      // Redirect to product details page after a short delay
      setTimeout(() => {
        router.push(`/products/${params.id}`)
      }, 1500)
    } catch (error: any) {
      console.error('Failed to update product', error)
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.')
        // Clear token and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
        return
      }
      
      // Handle validation errors specifically
      if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
        const errorMessages = error.response.data.message.join(', ')
        setError(`Validation error: ${errorMessages}`)
      } else {
        setError(error.response?.data?.message || 'Failed to update product. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Common dosage forms
  const dosageForms = [
    'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Cream', 
    'Ointment', 'Gel', 'Solution', 'Powder', 'Drops', 'Inhaler', 'Spray'
  ]
  
  // Common categories
  const categories = [
    'Antibiotics', 'Analgesics', 'Antidiabetics', 'Antihypertensives', 
    'Antihistamines', 'Antidepressants', 'Vitamins', 'Supplements',
    'Gastrointestinal', 'Respiratory', 'Dermatological', 'Ophthalmic'
  ]
  
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading product data...</div>
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
        
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="genericName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generic Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter generic name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dosageForm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage Form*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select dosage form" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dosageForms.map(form => (
                            <SelectItem key={form} value={form}>{form}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="strength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strength*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 500mg, 5mg/ml" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                                      )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select 
                                              onValueChange={field.onChange} 
                                              defaultValue={field.value}
                                              value={field.value}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select category (optional)" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {categories.map(category => (
                                                  <SelectItem key={category} value={category}>{category}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name="manufacturer"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Manufacturer</FormLabel>
                                            <FormControl>
                                              <Input placeholder="Enter manufacturer (optional)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name="supplierId"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Supplier</FormLabel>
                                            <Select 
                                              onValueChange={field.onChange} 
                                              defaultValue={field.value}
                                              value={field.value}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select supplier (optional)" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {suppliers.map(supplier => (
                                                  <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name="unitPrice"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Selling Price*</FormLabel>
                                            <FormControl>
                                              <Input type="number" step="0.01" min="0" placeholder="Enter selling price" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name="reorderLevel"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Reorder Level*</FormLabel>
                                            <FormControl>
                                              <Input type="number" min="0" placeholder="Enter reorder level" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    
                                    <FormField
                                      control={form.control}
                                      name="description"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Textarea 
                                              placeholder="Enter product description (optional)" 
                                              className="min-h-[100px]" 
                                              {...field} 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <FormField
                                        control={form.control}
                                        name="requiresPrescription"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                              />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel>Requires Prescription</FormLabel>
                                              <p className="text-sm text-gray-500">
                                                Check if this product requires a prescription to be sold
                                              </p>
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name="controlled"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                              />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel>Controlled Substance</FormLabel>
                                              <p className="text-sm text-gray-500">
                                                Check if this product is a controlled substance
                                              </p>
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    
                                    <div className="flex justify-end space-x-2">
                                      <Button 
                                        variant="outline" 
                                        type="button" 
                                        onClick={() => router.back()}
                                        disabled={isSubmitting}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                      >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                      </Button>
                                    </div>
                                  </form>
                                </Form>
                              </CardContent>
                            </Card>
                          </div>
                        )
                      }