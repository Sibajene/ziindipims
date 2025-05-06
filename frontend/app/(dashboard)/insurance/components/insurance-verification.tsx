import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../../../../components/ui/card"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../../components/ui/form"
import { Input } from "../../../../components/ui/input"
import { Button } from "../../../../components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../../../components/ui/select"
import { useToast } from "../../../../components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react"
import { insuranceApi } from "../../../../lib/api/insurance"

// Define verification form schema
const verificationSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  insuranceNumber: z.string().min(1, "Insurance number is required"),
  providerId: z.string().min(1, "Provider is required"),
  planId: z.string().optional(),
})

// Define verification result interface
interface VerificationResult {
  status: "ACTIVE" | "INACTIVE" | "NOT_FOUND" | "ERROR"
  message: string
  patientName?: string
  planDetails?: {
    name: string
    code: string
    coveragePercentage: number
    annualLimit?: number
    requiresApproval: boolean
    patientCopay: number
    active: boolean
  }
  eligibility?: {
    isEligible: boolean
    remainingBenefit?: number
    startDate?: string
    endDate?: string
    notes?: string
  }
}

export function InsuranceVerification() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [providers, setProviders] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [result, setResult] = useState<VerificationResult | null>(null)
  const { toast } = useToast()

  // Initialize form
  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      patientId: "",
      insuranceNumber: "",
      providerId: "",
      planId: "",
    },
  })

  // Load providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providersData = await insuranceApi.getProviders({ active: true })
        setProviders(providersData)
      } catch (err) {
        console.error("Failed to fetch insurance providers:", err)
        toast({
          title: "Error",
          description: "Failed to load insurance providers",
          variant: "destructive",
        })
      }
    }
    
    fetchProviders()
  }, [])

  // Load plans when provider is selected
  const handleProviderChange = async (providerId: string) => {
    form.setValue("providerId", providerId)
    form.setValue("planId", "")
    
    if (!providerId) {
      setPlans([])
      return
    }
    
    try {
      const plansData = await insuranceApi.getPlans({ 
        providerId, 
        active: true 
      })
      setPlans(plansData)
    } catch (err) {
      console.error("Failed to fetch insurance plans:", err)
      toast({
        title: "Error",
        description: "Failed to load insurance plans for the selected provider",
        variant: "destructive",
      })
    }
  }

  // Handle form submission
  const handleVerify = async (values: z.infer<typeof verificationSchema>) => {
    setIsVerifying(true)
    setResult(null)
    
    try {
      // This would be a real API call in a production app
      // For demo purposes, we'll simulate a verification result
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate verification result
      const mockResult: VerificationResult = {
        status: Math.random() > 0.3 ? "ACTIVE" : Math.random() > 0.5 ? "INACTIVE" : "NOT_FOUND",
        message: "",
        patientName: "John Doe",
        planDetails: {
          name: "Premium Health Plan",
          code: "PHP-001",
          coveragePercentage: 80,
          annualLimit: 10000,
          requiresApproval: false,
          patientCopay: 20,
          active: true
        },
        eligibility: {
          isEligible: Math.random() > 0.2,
          remainingBenefit: 8500,
          startDate: "2023-01-01",
          endDate: "2023-12-31",
        }
      }
      
      // Set appropriate message based on status
      switch (mockResult.status) {
        case "ACTIVE":
          mockResult.message = "Insurance coverage is active and valid"
          break
        case "INACTIVE":
          mockResult.message = "Insurance coverage is currently inactive"
          break
        case "NOT_FOUND":
          mockResult.message = "Insurance information not found"
          break
        case "ERROR":
          mockResult.message = "Error verifying insurance information"
          break
      }
      
      setResult(mockResult)
      
      // Show toast notification
      toast({
        title: mockResult.status === "ACTIVE" ? "Verification Successful" : "Verification Failed",
        description: mockResult.message,
        variant: mockResult.status === "ACTIVE" ? "default" : "destructive",
      })
    } catch (err) {
      console.error("Failed to verify insurance:", err)
      setResult({
        status: "ERROR",
        message: "Failed to verify insurance. Please try again."
      })
      
      toast({
        title: "Verification Error",
        description: "Failed to verify insurance information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Insurance Verification</CardTitle>
          <CardDescription>
            Verify patient insurance coverage and eligibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="insuranceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter insurance number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
                    <Select
                      onValueChange={handleProviderChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers.map(provider => (
                                                      <SelectItem key={provider.id} value={provider.id}>
                                                      {provider.name}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        
                                        <FormField
                                          control={form.control}
                                          name="planId"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Insurance Plan</FormLabel>
                                              <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!form.getValues("providerId") || plans.length === 0}
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select plan" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  {plans.map(plan => (
                                                    <SelectItem key={plan.id} value={plan.id}>
                                                      {plan.name}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        
                                        <Button type="submit" className="w-full" disabled={isVerifying}>
                                          {isVerifying ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Verifying...
                                            </>
                                          ) : (
                                            "Verify Insurance"
                                          )}
                                        </Button>
                                      </form>
                                    </Form>
                                  </CardContent>
                                </Card>
                                
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Verification Results</CardTitle>
                                    <CardDescription>
                                      Insurance coverage and eligibility information
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    {isVerifying ? (
                                      <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
                                        <p className="text-gray-500">Verifying insurance information...</p>
                                      </div>
                                    ) : !result ? (
                                      <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Info className="h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500 mb-2">No verification results yet</p>
                                        <p className="text-sm text-gray-400">
                                          Enter patient and insurance information and click "Verify Insurance"
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-6">
                                        <div className="flex items-center p-4 rounded-md border">
                                          {result.status === "ACTIVE" ? (
                                            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
                                          ) : (
                                            <AlertCircle className="h-8 w-8 text-red-500 mr-4" />
                                          )}
                                          <div>
                                            <h3 className="font-medium">
                                              {result.status === "ACTIVE" ? "Coverage Active" : 
                                               result.status === "INACTIVE" ? "Coverage Inactive" : 
                                               "Coverage Not Found"}
                                            </h3>
                                            <p className="text-sm text-gray-500">{result.message}</p>
                                          </div>
                                        </div>
                                        
                                        {result.patientName && (
                                          <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Patient Information</h3>
                                            <div className="p-4 rounded-md border">
                                              <p className="font-medium">{result.patientName}</p>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {result.planDetails && (
                                          <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Plan Details</h3>
                                            <div className="p-4 rounded-md border space-y-2">
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Plan Name:</span>
                                                <span className="font-medium">{result.planDetails.name}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Plan Code:</span>
                                                <span>{result.planDetails.code}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Coverage:</span>
                                                <span>{result.planDetails.coveragePercentage}%</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Patient Copay:</span>
                                                <span>{result.planDetails.patientCopay}%</span>
                                              </div>
                                              {result.planDetails.annualLimit && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Annual Limit:</span>
                                                  <span>${result.planDetails.annualLimit.toLocaleString()}</span>
                                                </div>
                                              )}
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Pre-approval Required:</span>
                                                <span>{result.planDetails.requiresApproval ? "Yes" : "No"}</span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {result.eligibility && (
                                          <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Eligibility</h3>
                                            <div className="p-4 rounded-md border space-y-2">
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Status:</span>
                                                <span className={result.eligibility.isEligible ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                  {result.eligibility.isEligible ? "Eligible" : "Not Eligible"}
                                                </span>
                                              </div>
                                              {result.eligibility.remainingBenefit !== undefined && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Remaining Benefit:</span>
                                                  <span>${result.eligibility.remainingBenefit.toLocaleString()}</span>
                                                </div>
                                              )}
                                              {result.eligibility.startDate && result.eligibility.endDate && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Coverage Period:</span>
                                                  <span>{result.eligibility.startDate} to {result.eligibility.endDate}</span>
                                                </div>
                                              )}
                                              {result.eligibility.notes && (
                                                <div className="pt-2 border-t">
                                                  <span className="text-gray-500 block mb-1">Notes:</span>
                                                  <p className="text-sm">{result.eligibility.notes}</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="flex justify-end">
                                          <Button 
                                            variant="outline" 
                                            onClick={() => setResult(null)}
                                          >
                                            Clear Results
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            )
                          }