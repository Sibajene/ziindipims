'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsService } from '../../../../lib/api/settingsService'
import { Button } from '../../../../components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../components/ui/form'
import { Input } from '../../../../components/ui/input'
import { Textarea } from '../../../../components/ui/textarea'
import { toast } from 'react-hot-toast'

const branchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  managerEmail: z.string().email('Invalid email').optional(),
  pharmacyId: z.string().uuid('Invalid pharmacy ID'),
  openingHours: z.string().optional(),
  gpsCoordinates: z.string().optional(),
})

type BranchFormValues = z.infer<typeof branchSchema>

export default function CreateBranchPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      location: '',
      phone: '',
      email: '',
      managerEmail: '',
      pharmacyId: '',
      openingHours: '',
      gpsCoordinates: '',
    },
  })

  const onSubmit = async (data: BranchFormValues) => {
    setIsLoading(true)
    try {
      await settingsService.createBranch(data)
      toast.success('Branch created successfully')
      router.push('/branches')
    } catch (error) {
      toast.error('Failed to create branch')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Branch</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Branch name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Branch location" {...field} disabled={isLoading} />
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
                  <Input placeholder="Phone number" {...field} disabled={isLoading} />
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
                  <Input placeholder="Email address" type="email" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="managerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manager Email</FormLabel>
                <FormControl>
                  <Input placeholder="Manager email" type="email" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pharmacyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pharmacy ID</FormLabel>
                <FormControl>
                  <Input placeholder="Pharmacy ID (UUID)" {...field} disabled={isLoading} />
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
                  <Textarea placeholder="e.g. Mon-Fri 9am-5pm" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gpsCoordinates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GPS Coordinates</FormLabel>
                <FormControl>
                  <Input placeholder="Latitude, Longitude" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Branch'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
