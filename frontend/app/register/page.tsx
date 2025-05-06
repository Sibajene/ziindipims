'use client'

import * as z from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '../../components/ui/logo'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { toast } from 'react-hot-toast'
import { authService } from '../../lib/api/authService'
import { subscriptionService } from '../../lib/api/subscriptionService'
import { EyeIcon, EyeOffIcon, ArrowLeftIcon, CheckCircle2 } from 'lucide-react'

// Define the registration schema based on the User model in schema.prisma
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["ADMIN", "PHARMACIST", "ASSISTANT", "OWNER", "MANAGER"]),
  pharmacyName: z.string().min(2, "Pharmacy name must be at least 2 characters"),
  pharmacyAddress: z.string().min(5, "Address must be at least 5 characters"),
  pharmacyPhone: z.string().optional(),
  pharmacyEmail: z.string().email("Invalid pharmacy email").optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "OWNER",
      pharmacyName: "",
      pharmacyAddress: "",
      pharmacyPhone: "",
      pharmacyEmail: "",
      termsAccepted: false
    },
    mode: "onChange"
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      // Call the backend API for registration using authService
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        pharmacy: {
          name: data.pharmacyName,
          address: data.pharmacyAddress,
          phone: data.pharmacyPhone,
          email: data.pharmacyEmail
        }
      });

      toast.success("Registration successful! Please check your email to verify your account.");
      router.push('/login');
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message || "Registration failed. Please try again.");
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step fields before proceeding
    if (currentStep === 1) {
      form.trigger(['name', 'email', 'password', 'confirmPassword', 'role']).then((isValid) => {
        if (isValid) setCurrentStep(2);
      });
    } else if (currentStep === 2) {
      form.trigger(['pharmacyName', 'pharmacyAddress', 'pharmacyPhone', 'pharmacyEmail']).then((isValid) => {
        if (isValid) setCurrentStep(3);
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const { formState } = form;
  const { isValid } = formState;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with logo and login link */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white shadow-sm">
      <Link href="/" className="flex items-center">
        <Logo size="lg" withText={false} asLink={false} />
      </Link>
        <Link href="/login" className="text-sm text-purple hover:text-purple/80 font-medium">
          Already have an account? Sign in
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Left side - Progress and Benefits */}
          <div className="md:col-span-2 bg-gradient-to-br from-navy to-purple p-8 text-white flex flex-col">
            <div>
              <h2 className="text-2xl font-bold mb-6">Create your account</h2>
              
              {/* Progress steps */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${currentStep >= 1 ? 'bg-white text-purple' : 'bg-white/30 text-white'}`}>
                    {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
                  </div>
                  <div>
                    <p className={`font-medium ${currentStep >= 1 ? 'text-white' : 'text-white/70'}`}>Account Information</p>
                    <p className="text-xs text-white/70">Your personal details</p>
                  </div>
                </div>
                
                <div className="w-px h-6 bg-white/30 ml-4 mb-4"></div>
                
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${currentStep >= 2 ? 'bg-white text-purple' : 'bg-white/30 text-white'}`}>
                    {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : "2"}
                  </div>
                  <div>
                    <p className={`font-medium ${currentStep >= 2 ? 'text-white' : 'text-white/70'}`}>Pharmacy Details</p>
                    <p className="text-xs text-white/70">Your pharmacy information</p>
                  </div>
                </div>
                
                <div className="w-px h-6 bg-white/30 ml-4 mb-4"></div>
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${currentStep >= 3 ? 'bg-white text-purple' : 'bg-white/30 text-white'}`}>
                    {currentStep > 3 ? <CheckCircle2 className="w-5 h-5" /> : "3"}
                  </div>
                  <div>
                    <p className={`font-medium ${currentStep >= 3 ? 'text-white' : 'text-white/70'}`}>Review & Confirm</p>
                    <p className="text-xs text-white/70">Finalize your registration</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Benefits section - visible on larger screens */}
            <div className="mt-auto hidden md:block">
              <h3 className="text-lg font-semibold mb-4">Benefits of ZiindiPro</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                  <span className="text-sm">Complete inventory management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                  <span className="text-sm">Streamlined prescription processing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-400 flex-shrink-0" />
                  <span className="text-sm">Integrated insurance claims</span>
                </li>
              </ul>
              
              <div className="mt-6 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <p className="italic text-sm mb-2">"ZiindiPro has transformed how we manage our pharmacy."</p>
                <p className="font-semibold text-sm">— Sibajene Sikasukwe, Pharmacy Owner</p>
              </div>
            </div>
          </div>
          
          {/* Right side - Form */}
          <div className="md:col-span-3 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Step 1: Account Information */}
                {currentStep === 1 && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-navy mb-2">Account Information</h3>
                      <p className="text-slate-500">Please provide your personal details</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              className="h-11 px-4"
                            />
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
                            <Input 
                              type="email" 
                              placeholder="john@example.com" 
                              {...field} 
                              className="h-11 px-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...field} 
                                className="h-11 px-4 pr-10"
                              />
                              <button 
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-slate-500 mt-1">
                            Password must be at least 8 characters
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              {...field} 
                              className="h-11 px-4 pr-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Role</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OWNER">Pharmacy Owner</SelectItem>
                              <SelectItem value="MANAGER">Pharmacy Manager</SelectItem>
                              <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                              <SelectItem value="ASSISTANT">Pharmacy Assistant</SelectItem>
                              <SelectItem value="ADMIN">System Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4">
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        className="w-full bg-purple hover:bg-purple/90 h-11"
                      >
                        Continue to Pharmacy Details
                      </Button>
                    </div>
                  </>
                )}
                
                {/* Step 2: Pharmacy Information */}
                {currentStep === 2 && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-navy mb-2">Pharmacy Information</h3>
                      <p className="text-slate-500">Tell us about your pharmacy</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="pharmacyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pharmacy Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City Pharmacy" 
                              {...field} 
                              className="h-11 px-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pharmacyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pharmacy Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="123 Main St, City" 
                              {...field} 
                              className="h-11 px-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="pharmacyPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pharmacy Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+1 234 567 8900" 
                                {...field} 
                                className="h-11 px-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pharmacyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pharmacy Email (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="info@citypharmacy.com" 
                                {...field} 
                                className="h-11 px-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button" 
                        onClick={prevStep}
                        variant="outline" 
                        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 h-11"
                      >
                        <ArrowLeftIcon size={16} className="mr-2" />
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        className="flex-1 bg-purple hover:bg-purple/90 h-11"
                      >
                        Review & Confirm
                      </Button>
                    </div>
                  </>
                )}
                
                {/* Step 3: Review & Confirm */}
                {currentStep === 3 && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-navy mb-2">Review & Confirm</h3>
                      <p className="text-slate-500">Please review your information before creating your account</p>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Account Information Review */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-navy">Account Information</h4>
                          <button 
                            type="button" 
                            onClick={() => setCurrentStep(1)} 
                            className="text-sm text-purple hover:text-purple/80"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">Full Name</p>
                            <p className="font-medium">{form.getValues("name")}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Email</p>
                            <p className="font-medium">{form.getValues("email")}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Role</p>
                            <p className="font-medium">
                              {form.getValues("role") === "OWNER" && "Pharmacy Owner"}
                              {form.getValues("role") === "MANAGER" && "Pharmacy Manager"}
                              {form.getValues("role") === "PHARMACIST" && "Pharmacist"}
                              {form.getValues("role") === "ASSISTANT" && "Pharmacy Assistant"}
                              {form.getValues("role") === "ADMIN" && "Administrator"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pharmacy Information Review */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-navy">Pharmacy Information</h4>
                          <button 
                            type="button" 
                            onClick={() => setCurrentStep(2)} 
                            className="text-sm text-purple hover:text-purple/80"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">Pharmacy Name</p>
                            <p className="font-medium">{form.getValues("pharmacyName")}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Address</p>
                            <p className="font-medium">{form.getValues("pharmacyAddress")}</p>
                          </div>
                          {form.getValues("pharmacyPhone") && (
                            <div>
                              <p className="text-slate-500">Phone</p>
                              <p className="font-medium">{form.getValues("pharmacyPhone")}</p>
                            </div>
                          )}
                          {form.getValues("pharmacyEmail") && (
                            <div>
                              <p className="text-slate-500">Email</p>
                              <p className="font-medium">{form.getValues("pharmacyEmail")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              I agree to the <Link href="/terms" className="text-purple hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-purple hover:underline">Privacy Policy</Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button" 
                        onClick={prevStep}
                        variant="outline" 
                        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 h-11"
                      >
                        <ArrowLeftIcon size={16} className="mr-2" />
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading || !form.getValues("termsAccepted")}
                        className="flex-1 bg-purple hover:bg-purple/90 h-11"
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
      
      <footer className="w-full py-4 px-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} ZiindiPro. All rights reserved.</p>
      </footer>
    </div>
  );
}
