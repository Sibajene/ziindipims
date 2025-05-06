'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsService } from '../../../lib/api/settingsService'
import { Button } from '../../../components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Loader2 } from 'lucide-react'

// Define the schema for pharmacy form validation
const pharmacySchema = z.object({
  name: z.string().min(1, 'Pharmacy name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  license: z.string().optional(),
  taxId: z.string().optional(),
  logoUrl: z.string().optional(),
  website: z.string().optional(),
  openingHours: z.string().optional(),
  currencyCode: z.string().optional(),
})

// Define the type for form values
type PharmacyFormValues = z.infer<typeof pharmacySchema>

export default function PharmacyPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PharmacyFormValues>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      license: '',
      taxId: '',
      logoUrl: '',
      website: '',
      openingHours: '',
      currencyCode: '',
    },
  })

  useEffect(() => {
    async function fetchPharmacy() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await settingsService.getPharmacyProfile()
        console.log('Pharmacy data loaded:', data)
        form.reset(data)
      } catch (error) {
        console.error('Error loading pharmacy profile:', error)
        setError('Failed to load pharmacy profile. Please try again later.')
        toast.error('Failed to load pharmacy profile')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPharmacy()
  }, [form])

  const onSubmit = async (data: PharmacyFormValues) => {
    setIsSaving(true)
    try {
      await settingsService.updatePharmacyProfile(data)
      toast.success('Pharmacy profile updated successfully')
    } catch (error) {
      console.error('Error updating pharmacy profile:', error)
      toast.error('Failed to update pharmacy profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        <span className="ml-2">Loading pharmacy profile...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pharmacy Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Pharmacy Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Pharmacy name" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Pharmacy address" {...field} disabled={isSaving} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} disabled={isSaving} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="license"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License</FormLabel>
                    <FormControl>
                      <Input placeholder="License number" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Tax ID" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Logo URL" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Website URL" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="openingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Hours</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Opening hours" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currencyCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Currency code" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? 'Saving...' : 'Save Pharmacy Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}