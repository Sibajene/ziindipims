'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Textarea } from '../../../../../components/ui/textarea'
import { Checkbox } from '../../../../../components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../../../../../components/ui/form'
import { supplierService } from '../../../../../lib/api/supplierService'
import { Skeleton } from '../../../../../components/ui/skeleton'

// Define the form validation schema
const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  isActive: z.boolean().default(true),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

export default function EditSupplierPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Initialize form with empty values that will be filled after fetching
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      contactPerson: '',
      isActive: true,
    },
  })
  
  // Fetch supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        
        const data = await supplierService.getSupplierById(params.id)
        
        // Update form with fetched data
        form.reset({
          name: data.name,
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          contactPerson: data.contactPerson || '',
          isActive: data.isActive,
        })
      } catch (error: any) {
        console.error('Failed to fetch supplier', error)
        setError(error.message || 'Failed to fetch supplier details')
      } finally {
        setIsLoading(false)
      }
    }    
    fetchSupplier()
  }, [params.id, router, form])
  
  const onSubmit = async (data: SupplierFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Clean up empty strings to null for optional fields
      const cleanedData = {
        ...data,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        contactPerson: data.contactPerson || null,
      }
      
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      await supplierService.updateSupplier(params.id, cleanedData)
      setSuccessMessage('Supplier updated successfully')
      
      // Redirect to supplier details page after a short delay
      setTimeout(() => {
        router.push(`/suppliers/${params.id}`)
      }, 1500)
    } catch (error: any) {
      console.error('Failed to update supplier', error)
      
      // Handle validation errors specifically
      if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
        // NestJS validation errors are usually an array of error messages
        const errorMessages = error.response.data.message.join(', ')
        setError(`Validation error: ${errorMessages}`)
      } else {
        setError(error.response?.data?.message || 'Failed to update supplier. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-[250px]" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold">Edit Supplier</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
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
                      <FormLabel>Supplier Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter supplier name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact person name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter supplier address" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-slate-500">
                        Inactive suppliers won't appear in selection dropdowns
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
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
                      Save Changes
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