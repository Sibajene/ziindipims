"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Button } from "../../../components/ui/button"
import { PlusCircle, FileText, Building2, ClipboardList, FileCheck2, Loader2, CreditCard, RefreshCw, Users } from "lucide-react"
import { InsuranceProviderList } from "./components/insurance-provider-list"
import { InsurancePlanList } from "./components/insurance-plan-list"
import { InsuranceClaimList } from "./components/insurance-claim-list"
import { InsuranceVerification } from "./components/insurance-verification"
import { InsuranceStats } from "./components/insurance-stats"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "../../../components/ui/use-toast"
import Link from "next/link"
import { insuranceApi } from "../../../lib/api/insurance"
import { getPatients } from "../../../lib/api/patients"

// Define interfaces based on your Prisma schema
interface Patient {
  id: string
  name: string
}

interface InsuranceProvider {
  id: string
  name: string
}

interface InsurancePlan {
  id: string
  name: string
  providerId: string
}

interface Sale {
  id: string
  invoiceNumber: string
  total: number
  patientId: string
}

// Form schema for creating a new claim
const newClaimSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  providerId: z.string().min(1, "Insurance provider is required"),
  planId: z.string().min(1, "Insurance plan is required"),
  saleId: z.string().min(1, "Sale is required"),
  notes: z.string().optional(),
})

export default function InsurancePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // State for storing data from the database
  const [patients, setPatients] = useState<Patient[]>([])
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredPlans, setFilteredPlans] = useState<InsurancePlan[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])

  const form = useForm<z.infer<typeof newClaimSchema>>({
    resolver: zodResolver(newClaimSchema),
    defaultValues: {
      patientId: "",
      providerId: "",
      planId: "",
      saleId: "",
      notes: "",
    },
  })

  // Fetch data when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchFormData()
    }
  }, [isDialogOpen])

  // Filter plans when provider changes
  useEffect(() => {
    const providerId = form.watch("providerId")
    if (providerId) {
      setFilteredPlans(plans.filter(plan => plan.providerId === providerId))
    } else {
      setFilteredPlans([])
    }
  }, [form.watch("providerId"), plans])

  // Filter sales when patient changes
  useEffect(() => {
    const patientId = form.watch("patientId")
    if (patientId) {
      setFilteredSales(sales.filter(sale => sale.patientId === patientId))
    } else {
      setFilteredSales([])
    }
  }, [form.watch("patientId"), sales])

  const fetchFormData = async () => {
    setIsLoading(true)
    try {
      // Fetch patients, providers, plans, and eligible sales
      const [patientsData, providersData, plansData, salesData] = await Promise.all([
        getPatients(),
        insuranceApi.getProviders(),
        insuranceApi.getPlans(),
        insuranceApi.getEligibleSales()
      ])
      
      setPatients(patientsData)
      setProviders(providersData)
      setPlans(plansData)
      setSales(salesData)
    } catch (error) {
      console.error("Failed to fetch form data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof newClaimSchema>) => {
    try {
      setIsSubmitting(true)
      
      // Call API to create a new claim with real data
      await insuranceApi.createClaim({
        patientId: values.patientId,
        providerId: values.providerId,
        planId: values.planId,
        saleId: values.saleId,
        notes: values.notes
      })
      
      toast({
        title: "Success",
        description: "Insurance claim created successfully",
      })
      
      setIsDialogOpen(false)
      form.reset()
      
      // Switch to claims tab
      document.querySelector('[value="claims"]')?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      )
    } catch (error) {
      console.error("Failed to create claim:", error)
      toast({
        title: "Error",
        description: "Failed to create insurance claim",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Insurance Management</h1>
          <p className="text-slate-500">Manage insurance providers, plans, and claims</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Claim
          </Button>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-3 text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div onClick={() => setIsDialogOpen(true)} className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
            <CreditCard className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-center">New Claim</span>
          </div>
          <Link href="#" className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
            <Building2 className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-center">Add Provider</span>
          </Link>
          <Link href="#" className="flex flex-col items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
            <ClipboardList className="h-6 w-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-center">New Plan</span>
          </Link>
          <Link href="#" className="flex flex-col items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer">
            <FileCheck2 className="h-6 w-6 text-amber-600 mb-2" />
            <span className="text-sm font-medium text-center">Verify Coverage</span>
          </Link>
        </div>
      </div>

      <InsuranceStats />

      <Tabs defaultValue="providers" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">
            <Building2 className="mr-2 h-4 w-4" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="plans">
            <ClipboardList className="mr-2 h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="claims">
            <FileCheck2 className="mr-2 h-4 w-4" />
            Claims
          </TabsTrigger>
          <TabsTrigger value="verification">
            <FileText className="mr-2 h-4 w-4" />
            Verification
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="providers" className="mt-6">
          <InsuranceProviderList />
        </TabsContent>
        
        <TabsContent value="plans" className="mt-6">
          <InsurancePlanList />
        </TabsContent>
        
        <TabsContent value="claims" className="mt-6">
          <InsuranceClaimList />
        </TabsContent>
        
        <TabsContent value="verification" className="mt-6">
          <InsuranceVerification />
        </TabsContent>
      </Tabs>

      {/* New Claim Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Insurance Claim</DialogTitle>
            <DialogDescription>
              Submit a new insurance claim for a patient's purchase
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2">Loading data...</span>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset sale when patient changes
                        form.setValue("saleId", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.length === 0 ? (
                          <SelectItem value="no-patients" disabled>
                            No patients found
                          </SelectItem>
                        ) : (
                          patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset plan when provider changes
                        form.setValue("planId", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers.length === 0 ? (
                          <SelectItem value="no-providers" disabled>
                            No providers found
                          </SelectItem>
                        ) : (
                          providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))
                        )}
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
                      disabled={!form.watch("providerId")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={form.watch("providerId") ? "Select plan" : "Select provider first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredPlans.length === 0 ? (
                          <SelectItem value="no-plans" disabled>
                            {form.watch("providerId") ? "No plans found for this provider" : "Select a provider first"}
                          </SelectItem>
                        ) : (
                          filteredPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="saleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Invoice</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!form.watch("patientId")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={form.watch("patientId") ? "Select sale invoice" : "Select patient first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSales.length === 0 ? (
                          <SelectItem value="no-sales" disabled>
                            {form.watch("patientId") ? "No eligible sales found for this patient" : "Select a patient first"}
                          </SelectItem>
                        ) : (
                          filteredSales.map((sale) => (
                            <SelectItem key={sale.id} value={sale.id}>
                              {sale.invoiceNumber} - ${sale.total.toFixed(2)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional notes for this claim" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Claim"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}