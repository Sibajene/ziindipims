'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '../../components/ui/logo'
import { useAuthStore } from './../../lib/stores/authStore'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form'
import { Checkbox } from '../../components/ui/checkbox'
import { Loader2, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoginAttempts(prev => prev + 1)
      await login(data.email, data.password)
      
      // Show success toast
      toast.success('Login successful! Redirecting to dashboard...')
      
      // Redirect with a slight delay for better UX
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (err) {
      console.error('Login error:', err)
      // Error handling is managed by the auth store
    }
  }
  
  if (!mounted) {
    return null
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with logo and register link */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-20">
          <Link href="/" className="flex items-center group transition-transform duration-300 hover:scale-105">
            <Logo size="lg" withText={true} asLink={false} />
          </Link>
        <div className="flex items-center space-x-4">
          <Link href="/register">
            <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
              Register
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content with video background and centered login form */}
      <main className="flex-grow relative flex items-center justify-center pt-0 pb-16">
        {/* Video background with improved visibility */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="object-cover h-full w-full absolute inset-0"
          >
            <source src="/images/Vid.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Lighter overlay to make video more visible */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy/15 via-purple/10 to-transparent"></div>
        </div>
        
        {/* Centered login form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md px-4 mt-24"
        >
          <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden border border-white/50 transition-all duration-300 hover:shadow-purple/10">
            {/* Form header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-navy">Welcome Back</h1>
                <p className="text-slate-600 mt-2">Sign in to your ZiindiPro account</p>
              </motion.div>
            </div>
            
            {/* Login form */}
            <div className="px-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-navy font-medium">Email</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input 
                              type="email" 
                              placeholder="name@example.com" 
                              {...field} 
                              className="h-11 pl-10 bg-white/80 border-slate-300 focus:border-purple focus:ring-2 focus:ring-purple/30 transition-all duration-200 group-hover:border-purple/50"
                              autoComplete="email"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple/70 transition-colors duration-200">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  {/* Password field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-navy font-medium">Password</FormLabel>
                          <Link href="/forgot-password" className="text-xs text-purple hover:text-purple/80 font-medium transition-colors duration-200 hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative group">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              {...field} 
                              className="h-11 pl-10 pr-10 bg-white/80 border-slate-300 focus:border-purple focus:ring-2 focus:ring-purple/30 transition-all duration-200 group-hover:border-purple/50"
                              autoComplete="current-password"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-purple/70 transition-colors duration-200">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  {/* Remember me checkbox */}
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="rememberMe"
                            className="data-[state=checked]:bg-purple data-[state=checked]:border-purple transition-colors duration-200"
                          />
                        </FormControl>
                        <div className="leading-none">
                          <label
                            htmlFor="rememberMe"
                            className="text-sm font-medium text-slate-700 cursor-pointer hover:text-navy transition-colors duration-200"
                          >
                            Remember me for 30 days
                          </label>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {/* Security notice - only show after failed attempts */}
                  {loginAttempts > 0 && (
                    <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg border border-blue-200 flex items-start">
                                            <ShieldCheck className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Your security is important to us. All login attempts are encrypted and monitored.
                      </span>
                    </div>
                  )}
                  
                  {/* Submit button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-purple hover:bg-purple/90 text-white h-11 font-medium relative overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple/20" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          Sign in to your account
                          <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      )}
                    </Button>
                  </motion.div>
                  
                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">Or continue with</span>
                    </div>
                  </div>
                  
                  {/* Social login buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center justify-center space-x-2 h-11 border-slate-300 hover:bg-slate-50 transition-all duration-200"
                      onClick={() => toast.error("Google login is not available yet")}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Google</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center justify-center space-x-2 h-11 border-slate-300 hover:bg-slate-50 transition-all duration-200"
                      onClick={() => toast.error("Microsoft login is not available yet")}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#f25022" d="M1 1h10v10H1z" />
                        <path fill="#00a4ef" d="M1 13h10v10H1z" />
                        <path fill="#7fba00" d="M13 1h10v10H13z" />
                        <path fill="#ffb900" d="M13 13h10v10H13z" />
                      </svg>
                      <span>Microsoft</span>
                    </Button>
                  </div>
                  
                  {/* Register link */}
                  <div className="text-center mt-6">
                    <p className="text-sm text-slate-600">
                      Don't have an account?{" "}
                      <Link href="/register" className="text-purple hover:text-purple/80 font-medium transition-colors duration-200 hover:underline">
                        Create an account
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </div>
          </div>
          
          {/* Floating features cards with animations */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -left-64 top-1/3 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/40 hidden xl:block"
          >
            <h3 className="font-semibold text-navy mb-3 flex items-center">
              <svg className="h-5 w-5 text-purple mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Why ZiindiPro?
            </h3>
            <ul className="space-y-2">
              {[
                "Complete pharmacy management",
                "Inventory tracking & alerts",
                "Prescription processing",
                "Patient records management",
                "Reporting & analytics"
              ].map((feature, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1), duration: 0.3 }}
                >
                  <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -right-64 top-1/4 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/40 hidden xl:block"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-navy">Trusted by Professionals</h3>
                <p className="text-xs text-slate-600">Join thousands of pharmacists</p>
              </div>
            </div>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    </main>
                    
                    {/* Footer */}
                    <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-slate-200 py-4 px-6">
                      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                        <div className="text-sm text-slate-500 mb-4 md:mb-0">
                          &copy; {new Date().getFullYear()} ZiindiPro. All rights reserved.
                        </div>
                        <div className="flex space-x-6">
                          <Link href="/privacy" className="text-sm text-slate-500 hover:text-purple transition-colors duration-200">
                            Privacy Policy
                          </Link>
                          <Link href="/terms" className="text-sm text-slate-500 hover:text-purple transition-colors duration-200">
                            Terms of Service
                          </Link>
                          <Link href="/help" className="text-sm text-slate-500 hover:text-purple transition-colors duration-200">
                            Help Center
                          </Link>
                        </div>
                      </div>
                    </footer>
                  </div>
                )
              }