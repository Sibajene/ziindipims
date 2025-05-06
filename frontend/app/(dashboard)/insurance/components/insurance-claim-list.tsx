"use client"
import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../../../../components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../../components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../../../components/ui/select"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Badge } from "../../../../components/ui/badge"
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
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../../components/ui/form"
import { useToast } from "../../../../components/ui/use-toast"
import { 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Calendar 
} from "lucide-react"
import { insuranceApi } from "../../../../lib/api/insurance"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

// Define the claim status badge component
const ClaimStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    case 'APPROVED':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      )
    case 'REJECTED':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      )
    case 'SUBMITTED':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <FileText className="h-3 w-3 mr-1" />
          Submitted
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      )
  }
}

// Define the claim interface
interface InsuranceClaim {
  id: string
  claimNumber: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  planId: string
  planName: string
  totalAmount: number
  coveredAmount: number
  status: string
  submittedAt: string
  updatedAt: string
  items: {
    id: string
    itemId: string
    itemName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    coveredAmount: number
  }[]
}

export function InsuranceClaimList() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [providerFilter, setProviderFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  // Form schema for updating claim status
  const updateClaimSchema = z.object({
    status: z.enum(["SUBMITTED", "UNDER_REVIEW", "APPROVED", "PARTIALLY_APPROVED", "REJECTED", "PAID", "CANCELLED"]),
    notes: z.string().optional(),
  })

  const form = useForm<z.infer<typeof updateClaimSchema>>({
    resolver: zodResolver(updateClaimSchema),
    defaultValues: {
      status: "SUBMITTED",
      notes: "",
    },
  })

  // Fetch claims and providers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch providers for the filter dropdown
        const providersData = await insuranceApi.getProviders()
        setProviders(providersData)
        
        // Fetch claims with date range filter
        const claimsData = await insuranceApi.getClaims({
          startDate: dateRange.start,
          endDate: dateRange.end
        })
        setClaims(claimsData)
      } catch (err) {
        console.error("Failed to fetch insurance data:", err)
        setError("Failed to load insurance claims")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [dateRange])

  // Filter claims based on search query, status, and provider
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.providerName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter
    const matchesProvider = providerFilter === "all" || claim.providerId === providerFilter
    
    return matchesSearch && matchesStatus && matchesProvider
  })

  // Handle claim selection for viewing details
  const handleViewClaim = (claim: InsuranceClaim) => {
    setSelectedClaim(claim)
    setIsDialogOpen(true)
    
    // Set form default values based on selected claim
    form.reset({
      status: claim.status as any,
      notes: "",
    })
  }

  // Handle claim status update
  const handleUpdateClaimStatus = async (values: z.infer<typeof updateClaimSchema>) => {
    if (!selectedClaim) return
    
    try {
      setIsUpdating(true)
      
      // Call API to update claim status
      await insuranceApi.updateClaimStatus(selectedClaim.id, {
        status: values.status,
        notes: values.notes || undefined
      })
      
      // Update local state
      setClaims(claims.map(claim => 
        claim.id === selectedClaim.id 
          ? { ...claim, status: values.status } 
          : claim
      ))
      
      // Show success toast
      toast({
        title: "Claim status updated",
        description: `Claim #${selectedClaim.claimNumber} status changed to ${values.status.toLowerCase()}`,
        variant: "default",
      })
      
      // Close dialog
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Failed to update claim status:", err)
      toast({
        title: "Update failed",
        description: "Failed to update claim status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Claims</CardTitle>
        <CardDescription>
          View and manage insurance claims submitted to providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search claims..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PARTIALLY_APPROVED">Partially Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={providerFilter}
              onValueChange={setProviderFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-[140px]"
              />
              <span>to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-[140px]"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery || statusFilter !== "all" || providerFilter !== "all" 
              ? "No claims match your search criteria" 
              : "No insurance claims found"}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Covered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                    <TableCell>{claim.patientName}</TableCell>
                    <TableCell>
                      <div>{claim.providerName}</div>
                      <div className="text-xs text-gray-500">{claim.planName}</div>
                    </TableCell>
                    <TableCell>${claim.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>${claim.coveredAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <ClaimStatusBadge status={claim.status} />
                    </TableCell>
                    <TableCell>
                      {format(new Date(claim.submittedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewClaim(claim)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Claim Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Claim #{selectedClaim?.claimNumber}
              </DialogTitle>
              <DialogDescription>
                Submitted on {selectedClaim && format(new Date(selectedClaim.submittedAt), "MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            {selectedClaim && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Patient Information</h4>
                    <p className="font-medium">{selectedClaim.patientName}</p>
                    <p className="text-sm text-gray-500">ID: {selectedClaim.patientId}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Insurance Information</h4>
                    <p className="font-medium">{selectedClaim.providerName}</p>
                    <p className="text-sm text-gray-500">Plan: {selectedClaim.planName}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Claim Items</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Covered</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {selectedClaim.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.coveredAmount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">Totals:</TableCell>
                          <TableCell className="text-right font-medium">${selectedClaim.totalAmount.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">${selectedClaim.coveredAmount.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Status update form */}
                {selectedClaim.status !== "APPROVED" && selectedClaim.status !== "REJECTED" && (
                  <div className="border rounded-md p-4">
                    <h4 className="text-sm font-medium mb-3">Update Claim Status</h4>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleUpdateClaimStatus)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="PENDING">Pending</SelectItem>
                                  <SelectItem value="APPROVED">Approved</SelectItem>
                                  <SelectItem value="REJECTED">Rejected</SelectItem>
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
                                <Input placeholder="Add notes about this status change" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Status"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}