'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Globe, 
  PaintBucket,
  Loader2 
} from 'lucide-react'
import { useAuthStore } from '../../../lib/stores/authStore'
import { userApi, UserProfile, UpdateProfileRequest } from '../../../lib/api/user'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Separator } from '../../../components/ui/separator'
import { Switch } from '../../../components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Alert, AlertDescription } from '../../../components/ui/alert'

// Define the form schema
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredLanguage: z.string().optional(),
  theme: z.string().optional(),
  profileImageUrl: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')

  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') : 'http://localhost:3001'

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      preferredLanguage: 'en',
      theme: 'light',
      profileImageUrl: '',
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch user profile from API
        const profile = await userApi.getProfile()

        // Prepend backend base URL to profileImageUrl if needed
        let profileImageUrl = profile.profileImageUrl || ''
        if (profileImageUrl && !/^https?:\/\//i.test(profileImageUrl)) {
          profileImageUrl = BACKEND_BASE_URL + profileImageUrl
        }
        
        form.reset({
          name: profile.name || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          preferredLanguage: profile.preferredLanguage || 'en',
          theme: profile.theme || 'light',
          profileImageUrl: profileImageUrl,
          password: '',
        })
        
        // Update the user in auth store if needed
        if (user && (
          user.name !== profile.name || 
          user.email !== profile.email || 
          user.profileImageUrl !== profileImageUrl
        )) {
          updateUser({ ...profile, profileImageUrl })
        }
      } catch (err) {
        setError('Failed to load profile')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfile()
  }, [form, user, updateUser, BACKEND_BASE_URL])

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true)
      setSuccessMessage(null)
      setError(null)
      
      const updateData: UpdateProfileRequest = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        preferredLanguage: data.preferredLanguage,
        theme: data.theme,
      }
      
      // Only include password if it's provided
      if (data.password) {
        updateData.password = data.password
      }
      
      // Update profile via API
      const updatedProfile = await userApi.updateProfile(updateData)
      
      // Prepend backend base URL to profileImageUrl if needed
      let updatedProfileImageUrl = updatedProfile.profileImageUrl || ''
      if (updatedProfileImageUrl && !/^https?:\/\//i.test(updatedProfileImageUrl)) {
        updatedProfileImageUrl = BACKEND_BASE_URL + updatedProfileImageUrl
      }
      
      // Update the user in the auth store
      updateUser({ ...updatedProfile, profileImageUrl: updatedProfileImageUrl })
      
        setSuccessMessage('Profile information updated successfully')
    } catch (err) {
      setError('Failed to update profile')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsSubmitting(true)
        
        // Upload image via API
        const result = await userApi.uploadProfileImage(file)

        // Prepend backend base URL to image URL if needed
        let imageUrl = result.url || ''
        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
          imageUrl = BACKEND_BASE_URL + imageUrl
        }
        
        // Update form with new image URL
        form.setValue('profileImageUrl', imageUrl)
        
        // Update user in auth store
        if (user) {
          updateUser({
            ...user,
            profileImageUrl: imageUrl
          })
        }
        
        setSuccessMessage('Profile image uploaded successfully')
      } catch (err) {
        setError('Failed to upload image')
        console.error(err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handlePasswordChange = async () => {
    const password = form.getValues('password')
    if (!password) {
      return
    }
    
    try {
      setIsSubmitting(true)
      setSuccessMessage(null)
      setError(null)
      
      // In a real implementation, you would need to collect the current password as well
      // For this example, we're assuming a simplified flow
      await userApi.changePassword('currentPassword', password)
      
      form.setValue('password', '')
      setSuccessMessage('Password updated successfully')
    } catch (err) {
      setError('Failed to update password')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-4">
                  <div className="relative mb-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage key={form.watch('profileImageUrl')} src={form.watch('profileImageUrl') || ''} alt={user?.name || 'User'} />
                      <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700">
                      <Camera size={16} />
                      <input 
                        id="profile-image" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-lg">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.role}</p>
                    {user?.branchId && (
                      <p className="text-xs text-gray-400 mt-1">Branch ID: {user.branchId}</p>
                    )}
                  </div>
                  <div className="mt-6 w-full">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Last Login</span>
                      <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Account Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">User ID</span>
                      <span className="text-xs font-mono">{user?.id?.substring(0, 8)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Profile Form */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {successMessage && (
                    <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  )}
                  
                  {error && (
                    <Alert className="mb-4 bg-red-50 text-red-700 border-red-200">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <Input placeholder="Your full name" className="pl-10" {...field} />
                              </div>
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
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <Input placeholder="Your email address" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <Input placeholder="Your phone number" className="pl-10" {...field} value={field.value || ''} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                {successMessage && (
                  <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                
                {error && (
                  <Alert className="mb-4 bg-red-50 text-red-700 border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...form}>
                  <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter new password" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            Password should be at least 8 characters and include a mix of letters, numbers, and symbols
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting || !form.watch('password')}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">User Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                {successMessage && (
                  <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                
                {error && (
                  <Alert className="mb-4 bg-red-50 text-red-700 border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Language</FormLabel>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value || 'en'}
                            >
                              <FormControl>
                                <SelectTrigger className="pl-10">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="sw">Swahili</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <div className="relative">
                            <PaintBucket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value || 'light'}
                            >
                              <FormControl>
                                <SelectTrigger className="pl-10">
                                  <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Notification Preferences
                        </FormLabel>
                        <FormDescription>
                          Receive email notifications for important updates
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={true} />
                      </FormControl>
                    </FormItem>
                    
                    <Separator />
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Preferences'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}