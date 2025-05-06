'use client'

import React, { useState, useEffect } from 'react'
import { Checkbox } from '../../../../components/ui/checkbox'
import { useRouter } from 'next/navigation'
import { supplierService } from '../../../../lib/api/supplierService'
import { Textarea } from '../../../../components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import {
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../../../../components/ui/form'
import { productService } from '../../../../lib/api/productService'
import { Input } from '../../../../components/ui/input'
import { useForm } from 'react-hook-form'
import { Button } from '../../../../components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../../components/ui/select'
import * as z from 'zod'
import { useAuthStore } from '../../../../lib/stores/authStore'

// Define the product schema for form validation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  genericName: z.string().min(1, "Generic name is required"),
  dosageForm: z.string().min(1, "Dosage form is required"),
  strength: z.string().min(1, "Strength is required"),
  barcode: z.string().optional(),
  requiresPrescription: z.boolean().default(false),
  controlled: z.boolean().default(false),
  unitPrice: z.coerce.number().min(0, "Price must be 0 or greater"),
  reorderLevel: z.coerce.number().min(1, "Reorder level must be at least 1"),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
  supplierId: z.string().optional(),
})

// Define the type based on the schema
type ProductFormValues = z.infer<typeof productSchema>

// Define the Supplier type
interface Supplier {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false)
  const user = useAuthStore(state => state.user)
  
  // Initialize form with all required fields
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      genericName: '',
      dosageForm: '',
      strength: '',
      barcode: '',
      requiresPrescription: false,
      controlled: false,
      unitPrice: 0,
      reorderLevel: 10,
      category: '',
      manufacturer: '',
      description: '',
      supplierId: '',
    },
  })
  
  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoadingSuppliers(true)
        const token = localStorage.getItem('token')
        if (!token) return
        
        // Use the supplier service to fetch suppliers with token
        const data = await supplierService.getSuppliers(token)
        setSuppliers(data)
      } catch (error) {
        console.error('Failed to fetch suppliers', error)
      } finally {
        setIsLoadingSuppliers(false)
      }
    }
    
    fetchSuppliers()
  }, [])
  
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Log user pharmacyId for debugging
      console.log('User pharmacyId:', user?.pharmacyId)

      // Debug log to see what's being sent
      console.log('Submitting product data:', JSON.stringify(data, null, 2))

      // Clean up empty strings to null for optional fields
      const cleanedData = {
        ...data,
        barcode: data.barcode || null,
        category: data.category || null,
        manufacturer: data.manufacturer || null,
        description: data.description || null,
        supplierId: data.supplierId || null,
        pharmacyId: user?.pharmacyId ?? null,
      }

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await productService.createProduct(token, cleanedData)
      setSuccessMessage('Product created successfully')

      // Redirect to product details page after a short delay
      setTimeout(() => {
        router.push(`/products/${response.id}`)
      }, 1500)
    } catch (error: any) {
      console.error('Failed to create product', error)

      // Detailed error logging
      console.log('Error response data:', error.response?.data)

      // Handle validation errors specifically
      if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
        // NestJS validation errors are usually an array of error messages
        const errorMessages = error.response.data.message.join(', ')
        setError(`Validation error: ${errorMessages}`)
      } else {
        setError(error.response?.data?.message || 'Failed to create product. Please try again.')
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
        
        <h1 className="text-3xl font-bold">Add New Product</h1>
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
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter barcode (optional)" {...field} />
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
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
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price*</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
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
                        <Input type="number" min="1" {...field} />
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
                        disabled={isLoadingSuppliers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Select supplier"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
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
                
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-8">
                  <FormField
                    control={form.control}
                    name="requiresPrescription"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Requires Prescription</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="controlled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Controlled Substance</FormLabel>
                          </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
