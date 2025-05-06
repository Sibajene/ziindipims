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
import { Switch } from "../../../../components/ui/switch"
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Building2 
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { insuranceApi, InsuranceProvider, CreateProviderRequest, UpdateProviderRequest } from "../../../../lib/api/insurance"
import { useToast } from "../../../../components/ui/use-toast"

const providerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  contact: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  active: z.boolean().default(true),
  approvalRequired: z.boolean().default(false),
  paymentTermDays: z.number().int().min(0).default(30),
  discountRate: z.number().min(0).max(100).optional(),
})

type ProviderFormValues = z.infer<typeof providerFormSchema>

export function InsuranceProviderList() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<InsuranceProvider | null>(null)
  const { toast } = useToast()

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      name: "",
      code: "",
      contact: "",
      email: "",
      address: "",
      active: true,
      approvalRequired: false,
      paymentTermDays: 30,
      discountRate: 0,
    },
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    if (editingProvider) {
      form.reset({
        name: editingProvider.name,
        code: editingProvider.code,
        contact: editingProvider.contact || "",
        email: editingProvider.email || "",
        address: editingProvider.address || "",
        active: editingProvider.active,
        approvalRequired: editingProvider.approvalRequired,
        paymentTermDays: editingProvider.paymentTermDays,
        discountRate: editingProvider.discountRate || 0,
      })
    } else {
      form.reset({
        name: "",
        code: "",
        contact: "",
        email: "",
        address: "",
        active: true,
        approvalRequired: false,
        paymentTermDays: 30,
        discountRate: 0,
      })
    }
  }, [editingProvider, form])

  const fetchProviders = async () => {
    try {
      setIsLoading(true)
      const data = await insuranceApi.getProviders()
      setProviders(data)
    } catch (error) {
      console.error("Failed to fetch insurance providers:", error)
      toast({
        title: "Error",
        description: "Failed to load insurance providers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProvider = async (data: ProviderFormValues) => {
    try {
      setIsSubmitting(true)
      const newProvider = await insuranceApi.createProvider(data as CreateProviderRequest)
      setProviders([...providers, newProvider])
      toast({
        title: "Success",
        description: "Insurance provider created successfully",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to create insurance provider:", error)
      toast({
        title: "Error",
        description: "Failed to create insurance provider",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProvider = async (data: ProviderFormValues) => {
    if (!editingProvider) return

    try {
      setIsSubmitting(true)
      const updatedProvider = await insuranceApi.updateProvider(
        editingProvider.id, 
        data as UpdateProviderRequest
      )
      
      setProviders(providers.map(p => 
        p.id === updatedProvider.id ? updatedProvider : p
      ))
      
      toast({
        title: "Success",
        description: "Insurance provider updated successfully",
      })
      
      setIsDialogOpen(false)
      setEditingProvider(null)
    } catch (error) {
      console.error("Failed to update insurance provider:", error)
      toast({
        title: "Error",
        description: "Failed to update insurance provider",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (data: ProviderFormValues) => {
    if (editingProvider) {
      handleUpdateProvider(data)
    } else {
      handleCreateProvider(data)
    }
  }

  const handleEdit = (provider: InsuranceProvider) => {
    setEditingProvider(provider)
    setIsDialogOpen(true)
  }

  const filteredProviders = providers.filter(provider => 
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Insurance Providers</CardTitle>
          <CardDescription>Manage insurance providers and their details</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingProvider(null)}
              className="ml-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingProvider ? "Edit Insurance Provider" : "Add Insurance Provider"}
              </DialogTitle>
              <DialogDescription>
                {editingProvider 
                  ? "Update the insurance provider details below"
                  : "Fill in the details to add a new insurance provider"}
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
                        <FormLabel>Provider Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. National Health Insurance" {...field} />
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
                        <FormLabel>Provider Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. NHIS" 
                            {...field} 
                            disabled={!!editingProvider}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +1234567890" {...field} />
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
                          <Input placeholder="e.g. contact@nhis.com" {...field} />
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
                        <Input placeholder="Provider address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms (Days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Rate (%)</FormLabel>
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Provider is currently active
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
                    name="approvalRequired"
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
                        {editingProvider ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      editingProvider ? "Update Provider" : "Add Provider"
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
              placeholder="Search providers..."
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
        ) : filteredProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mb-2" />
            <h3 className="text-lg font-medium">No providers found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery 
                ? "Try adjusting your search query" 
                : "Add your first insurance provider to get started"}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.code}</TableCell>
                    <TableCell>
                      {provider.contact || provider.email || "N/A"}
                    </TableCell>
                    <TableCell>{provider.paymentTermDays} days</TableCell>
                    <TableCell>
                      <Badge 
                        variant={provider.active ? "default" : "secondary"}
                        className={provider.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {provider.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(provider)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
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