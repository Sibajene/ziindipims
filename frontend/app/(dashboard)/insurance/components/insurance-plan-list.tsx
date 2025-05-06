import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../../components/ui/table"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Badge } from "../../../../components/ui/badge"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../../../../components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../../../../components/ui/dialog"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../../components/ui/form"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { Switch } from "../../../../components/ui/switch"
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Loader2, 
  ClipboardList,
  Percent
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  insuranceApi, 
  InsurancePlan, 
  InsuranceProvider,
  CreatePlanRequest, 
  UpdatePlanRequest 
} from "../../../../lib/api/insurance"
import { useToast } from "../../../../components/ui/use-toast"

const planFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  providerId: z.string().min(1, "Provider is required"),
  coveragePercentage: z.number().min(0).max(100).default(80),
  annualLimit: z.number().min(0).optional().nullable(),
  requiresApproval: z.boolean().default(false),
  patientCopay: z.number().min(0).max(100).default(0),
  active: z.boolean().default(true),
})

type PlanFormValues = z.infer<typeof planFormSchema>

export function InsurancePlanList() {
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<InsurancePlan | null>(null)
  const { toast } = useToast()

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      code: "",
      providerId: "",
      coveragePercentage: 80,
      annualLimit: null,
      requiresApproval: false,
      patientCopay: 0,
      active: true,
    },
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (editingPlan) {
      form.reset({
        name: editingPlan.name,
        code: editingPlan.code,
        providerId: editingPlan.providerId,
        coveragePercentage: editingPlan.coveragePercentage,
        annualLimit: editingPlan.annualLimit || null,
        requiresApproval: editingPlan.requiresApproval,
        patientCopay: editingPlan.patientCopay,
        active: editingPlan.active,
      })
    } else {
      form.reset({
        name: "",
        code: "",
        providerId: providers.length > 0 ? providers[0].id : "",
        coveragePercentage: 80,
        annualLimit: null,
        requiresApproval: false,
        patientCopay: 0,
        active: true,
      })
    }
  }, [editingPlan, form, providers])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [plansData, providersData] = await Promise.all([
        insuranceApi.getPlans(),
        insuranceApi.getProviders()
      ])
      setPlans(plansData)
      setProviders(providersData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast({
        title: "Error",
        description: "Failed to load insurance plans and providers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlan = async (data: PlanFormValues) => {
    try {
      setIsSubmitting(true)
      const newPlan = await insuranceApi.createPlan({
        ...data,
        annualLimit: data.annualLimit || undefined,
      } as CreatePlanRequest)
      
      setPlans([...plans, newPlan])
      toast({
        title: "Success",
        description: "Insurance plan created successfully",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to create insurance plan:", error)
      toast({
        title: "Error",
        description: "Failed to create insurance plan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePlan = async (data: PlanFormValues) => {
    if (!editingPlan) return

    try {
      setIsSubmitting(true)
      const updatedPlan = await insuranceApi.updatePlan(
        editingPlan.id, 
        {
          name: data.name,
          coveragePercentage: data.coveragePercentage,
          annualLimit: data.annualLimit,
          requiresApproval: data.requiresApproval,
          patientCopay: data.patientCopay,
          active: data.active,
        } as UpdatePlanRequest
      )
      
      setPlans(plans.map(p => 
        p.id === updatedPlan.id ? updatedPlan : p
      ))
      
      toast({
        title: "Success",
        description: "Insurance plan updated successfully",
      })
      
      setIsDialogOpen(false)
      setEditingPlan(null)
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

  const handleSubmit = (data: PlanFormValues) => {
    if (editingPlan) {
      handleUpdatePlan(data)
    } else {
      handleCreatePlan(data)
    }
  }

  const handleEdit = (plan: InsurancePlan) => {
    setEditingPlan(plan)
    setIsDialogOpen(true)
  }

  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    return provider ? provider.name : "Unknown Provider"
  }

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getProviderName(plan.providerId).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Insurance Plans</CardTitle>
          <CardDescription>Manage insurance plans and coverage details</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingPlan(null)}
              className="ml-auto"
              disabled={providers.length === 0}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Insurance Plan" : "Add Insurance Plan"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan 
                  ? "Update the insurance plan details below"
                  : "Fill in the details to add a new insurance plan"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Premium Health Plan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. PHP-001" 
                            {...field} 
                            disabled={!!editingPlan}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!!editingPlan}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providers.map((provider) => (
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="coveragePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coverage Percentage (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientCopay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Copay (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="annualLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Limit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          placeholder="Leave empty for no limit"
                          {...field}
                          value={field.value === null ? '' : field.value}
                          onChange={(e) => {
                            const value = e.target.value === '' ? null : parseFloat(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum amount covered per year (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requiresApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Requires Approval</FormLabel>
                          <FormDescription>
                            Claims require pre-approval
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
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Plan is currently active
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
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingPlan ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      editingPlan ? "Update Plan" : "Add Plan"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search plans..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? "No plans match your search" : "No insurance plans found"}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Annual Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <div>{plan.name}</div>
                      <div className="text-xs text-gray-500">{plan.code}</div>
                    </TableCell>
                    <TableCell>{getProviderName(plan.providerId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{plan.coveragePercentage}%</span>
                      </div>
                      {plan.patientCopay > 0 && (
                        <div className="text-xs text-gray-500">
                          {plan.patientCopay}% copay
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.annualLimit ? (
                        <span>${plan.annualLimit.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-500">No limit</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={plan.active ? "default" : "outline"}
                        className={plan.active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                      >
                        {plan.active ? "Active" : "Inactive"}
                      </Badge>
                      {plan.requiresApproval && (
                        <Badge 
                          variant="outline" 
                          className="ml-2 bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50"
                        >
                          Approval Required
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Navigate to coverage details page
                            window.location.href = `/insurance/plans/${plan.id}/coverage`;
                          }}
                        >
                          <ClipboardList className="h-4 w-4" />
                          <span className="sr-only">Coverage Details</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}