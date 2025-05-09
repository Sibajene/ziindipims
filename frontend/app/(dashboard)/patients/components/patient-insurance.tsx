"use client"
import { useState, useEffect } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent } from "../../../../components/ui/card"
import { insuranceApi } from "../../../../lib/api/insurance"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../../../../components/ui/dialog"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription
} from "../../../../components/ui/form"
import { Input } from "../../../../components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../../../components/ui/select"
import { Switch } from "../../../../components/ui/switch"
import { Loader2, Plus, Shield, Calendar, Edit, Trash2, AlertCircle } from "lucide-react"
import { formatDate } from "../../../../lib/utils"
import { useToast } from "../../../../components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  getPatientInsurance, 
  addPatientInsurance, 
  updatePatientInsurance, 
  removePatientInsurance 
} from "../../../../lib/api/patients"

interface PatientInsuranceProps {
  patientId: string
}

// Form schema for adding/updating insurance
const insuranceSchema = z.object({
  planId: z.string().min(1, "Insurance plan is required"),
  membershipNumber: z.string().min(1, "Membership number is required"),
  primaryHolder: z.boolean().default(true),
  relationshipToHolder: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
})

type InsuranceFormValues = z.infer<typeof insuranceSchema>

export function PatientInsurance({ patientId }: PatientInsuranceProps) {
  const [insurancePlans, setInsurancePlans] = useState<any[]>([])
  const [patientInsurance, setPatientInsurance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentInsurance, setCurrentInsurance] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      planId: "",
      membershipNumber: "",
      primaryHolder: true,
      relationshipToHolder: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
    },
  })

  const editForm = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      planId: "",
      membershipNumber: "",
      primaryHolder: true,
      relationshipToHolder: "",
      startDate: "",
      endDate: "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [insuranceData, plansData] = await Promise.all([
          getPatientInsurance(patientId),
          insuranceApi.getPlans()
        ])
        setPatientInsurance(insuranceData)
        setInsurancePlans(plansData)
      } catch (error) {
        console.error("Failed to fetch insurance data:", error)
        toast({
          title: "Error",
          description: "Failed to load insurance information",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
    }
}

fetchData()
}, [patientId, toast])

useEffect(() => {
if (currentInsurance && isEditDialogOpen) {
  const plan = insurancePlans.find(p => p.id === currentInsurance.planId)
  
  editForm.reset({
    planId: currentInsurance.planId,
    membershipNumber: currentInsurance.membershipNumber,
    primaryHolder: currentInsurance.primaryHolder,
    relationshipToHolder: currentInsurance.relationshipToHolder || "",
    startDate: new Date(currentInsurance.startDate).toISOString().split('T')[0],
    endDate: currentInsurance.endDate 
      ? new Date(currentInsurance.endDate).toISOString().split('T')[0] 
      : "",
  })
}
}, [currentInsurance, isEditDialogOpen, editForm, insurancePlans])

const onAddSubmit = async (values: InsuranceFormValues) => {
try {
  setIsSubmitting(true)
  const selectedPlan = insurancePlans.find(plan => plan.id === values.planId)
  if (!selectedPlan) {
    throw new Error("Selected insurance plan not found")
  }
  const data = {
    providerId: selectedPlan.providerId,
    policyNumber: values.membershipNumber,
    coverageType: selectedPlan.name,
    startDate: values.startDate,
    endDate: values.endDate,
    status: "ACTIVE", // or get from form if needed
  }
  const newInsurance = await addPatientInsurance(patientId, data)
  setPatientInsurance([...patientInsurance, newInsurance])
  toast({
    title: "Success",
    description: "Insurance plan added successfully",
  })
  setIsAddDialogOpen(false)
  form.reset()
} catch (error) {
  console.error("Failed to add insurance plan:", error)
  toast({
    title: "Error",
    description: "Failed to add insurance plan",
    variant: "destructive",
  })
} finally {
  setIsSubmitting(false)
}
}
const onEditSubmit = async (values: InsuranceFormValues) => {
if (!currentInsurance) return

try {
  setIsSubmitting(true)
  const updatedInsurance = await updatePatientInsurance(currentInsurance.id, values)
  setPatientInsurance(patientInsurance.map(insurance => 
    insurance.id === currentInsurance.id ? updatedInsurance : insurance
  ))
  toast({
    title: "Success",
    description: "Insurance plan updated successfully",
  })
  setIsEditDialogOpen(false)
} catch (error) {
  console.error("Failed to update insurance plan:", error)
  toast({
    title: "Error",
    description: "Failed to update insurance plan",
    variant: "destructive",
  })
} finally {
  setIsSubmitting(false)
}
}

const onDelete = async () => {
if (!currentInsurance) return

try {
  setIsSubmitting(true)
  await removePatientInsurance(currentInsurance.id)
  setPatientInsurance(patientInsurance.filter(insurance => insurance.id !== currentInsurance.id))
  toast({
    title: "Success",
    description: "Insurance plan removed successfully",
  })
  setIsDeleteDialogOpen(false)
} catch (error) {
  console.error("Failed to remove insurance plan:", error)
  toast({
    title: "Error",
    description: "Failed to remove insurance plan",
    variant: "destructive",
  })
} finally {
  setIsSubmitting(false)
}
}

if (loading) {
return (
  <div className="flex justify-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
)
}

return (
<div>
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-medium">Insurance Plans</h3>
    <Button onClick={() => setIsAddDialogOpen(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Add Insurance
    </Button>
  </div>

  {patientInsurance.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-8 border rounded-lg bg-slate-50">
      <Shield className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Insurance Plans</h3>
      <p className="text-muted-foreground text-center mb-4">
        This patient doesn't have any insurance plans added yet.
      </p>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Insurance Plan
      </Button>
    </div>
  ) : (
    <div className="space-y-4">
      {patientInsurance.map((insurance) => {
        const plan = insurancePlans.find(p => p.id === insurance.planId)
        return (
          <Card key={insurance.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-500" />
                    <h4 className="font-medium">{plan?.name || "Unknown Plan"}</h4>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      insurance.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      insurance.status === 'EXPIRED' ? 'bg-red-100 text-red-800' : 
                      insurance.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-800' : 
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {insurance.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan?.provider || "Unknown Provider"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setCurrentInsurance(insurance)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setCurrentInsurance(insurance)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Membership Number</p>
                  <p className="text-sm font-medium">{insurance.membershipNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Primary Holder</p>
                  <p className="text-sm font-medium">
                    {insurance.primaryHolder ? "Yes" : "No"}
                    {!insurance.primaryHolder && insurance.relationshipToHolder && 
                      ` (${insurance.relationshipToHolder})`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">{formatDate(insurance.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="text-sm font-medium">
                    {insurance.endDate ? formatDate(insurance.endDate) : "No end date"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )}

  {/* Add Insurance Dialog */}
  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Insurance Plan</DialogTitle>
        <DialogDescription>
          Add a new insurance plan for this patient.
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="planId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Plan</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an insurance plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {insurancePlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} ({plan.provider})
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
            name="membershipNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membership Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="primaryHolder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Primary Policy Holder</FormLabel>
                  <FormDescription>
                    Is this patient the primary holder of the policy?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {!form.watch("primaryHolder") && (
            <FormField
              control={form.control}
              name="relationshipToHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship to Holder</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button 
                           type="submit"
                           disabled={isSubmitting}
                         >
                           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           Add Insurance
                         </Button>
                       </DialogFooter>
                     </form>
                   </Form>
                 </DialogContent>
               </Dialog>
             
               {/* Edit Insurance Dialog */}
               <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                 <DialogContent>
                   <DialogHeader>
                     <DialogTitle>Edit Insurance Plan</DialogTitle>
                     <DialogDescription>
                       Update the insurance plan details.
                     </DialogDescription>
                   </DialogHeader>
                   
                   <Form {...editForm}>
                     <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                       <FormField
                         control={editForm.control}
                         name="planId"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Insurance Plan</FormLabel>
                             <Select 
                               onValueChange={field.onChange} 
                               defaultValue={field.value}
                             >
                               <FormControl>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Select an insurance plan" />
                                 </SelectTrigger>
                               </FormControl>
                               <SelectContent>
                                 {insurancePlans.map(plan => (
                                   <SelectItem key={plan.id} value={plan.id}>
                                     {plan.name} ({plan.provider})
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       
                       <FormField
                         control={editForm.control}
                         name="membershipNumber"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Membership Number</FormLabel>
                             <FormControl>
                               <Input {...field} />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       
                       <FormField
                         control={editForm.control}
                         name="primaryHolder"
                         render={({ field }) => (
                           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                             <div className="space-y-0.5">
                               <FormLabel>Primary Policy Holder</FormLabel>
                               <FormDescription>
                                 Is this patient the primary holder of the policy?
                               </FormDescription>
                             </div>
                             <FormControl>
                               <Switch
                                 checked={field.value}
                                 onCheckedChange={field.onChange}
                               />
                             </FormControl>
                           </FormItem>
                         )}
                       />
                       
                       {!editForm.watch("primaryHolder") && (
                         <FormField
                           control={editForm.control}
                           name="relationshipToHolder"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Relationship to Holder</FormLabel>
                               <FormControl>
                                 <Input {...field} />
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                       )}
                       
                       <FormField
                         control={editForm.control}
                         name="startDate"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Start Date</FormLabel>
                             <FormControl>
                               <Input type="date" {...field} />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       
                       <FormField
                         control={editForm.control}
                         name="endDate"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>End Date (Optional)</FormLabel>
                             <FormControl>
                               <Input type="date" {...field} />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       
                       <DialogFooter>
                         <Button 
                           type="submit"
                           disabled={isSubmitting}
                         >
                           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           Update Insurance
                         </Button>
                       </DialogFooter>
                     </form>
                   </Form>
                 </DialogContent>
               </Dialog>
             
               {/* Delete Confirmation Dialog */}
               <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                 <DialogContent>
                   <DialogHeader>
                     <DialogTitle>Remove Insurance Plan</DialogTitle>
                     <DialogDescription>
                       Are you sure you want to remove this insurance plan? This action cannot be undone.
                     </DialogDescription>
                   </DialogHeader>
                   
                   <div className="flex items-center p-4 border rounded-lg bg-red-50 mb-4">
                     <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                     <p className="text-sm text-red-500">
                       This will permanently remove the insurance plan from this patient's record.
                     </p>
                   </div>
                   
                   <DialogFooter>
                     <Button 
                       variant="outline" 
                       onClick={() => setIsDeleteDialogOpen(false)}
                     >
                       Cancel
                     </Button>
                     <Button 
                       variant="destructive"
                       onClick={onDelete}
                       disabled={isSubmitting}
                     >
                       {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Remove
                     </Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>
             </div>
             )
             } 