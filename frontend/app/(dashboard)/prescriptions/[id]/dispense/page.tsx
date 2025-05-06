'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../../../components/ui/card'
import { Input } from '../../../../../components/ui/input'
import { Textarea } from '../../../../../components/ui/textarea'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../../../../../components/ui/form'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../../../components/ui/select'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { prescriptionService, Prescription, DispenseItemData } from '../../../../../lib/api/prescriptionService'
import { Separator } from '../../../../../components/ui/separator'
import { Badge } from '../../../../../components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../../../components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '../../../../../components/ui/alert'
import { Skeleton } from '../../../../../components/ui/skeleton'
import Link from 'next/link'

// Define the schema for dispensing prescription items
const dispenseSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    quantityToDispense: z.number().min(1, "Quantity must be at least 1"),
    batchId: z.string().optional(),
    notes: z.string().optional()
  }))
})

type DispenseFormValues = z.infer<typeof dispenseSchema>

export default function DispensePrescriptionPage() {
  const router = useRouter()
  const params = useParams()
  const prescriptionId = params.id as string
  
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productBatches, setProductBatches] = useState<Record<string, any[]>>({})
  const [error, setError] = useState<string | null>(null)
  
  // Initialize form
  const form = useForm<DispenseFormValues>({
    resolver: zodResolver(dispenseSchema),
    defaultValues: {
      items: []
    }
  })
  
  // Fetch prescription data
  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setIsLoading(true)
        const response = await prescriptionService.getPrescription(prescriptionId)
        setPrescription(response.data)
        
        // Initialize form values based on prescription items
        const formItems = response.data.items.map(item => ({
          itemId: item.id as string,
          quantityToDispense: item.quantity - (item.dispensed || 0),
          batchId: '',
          notes: ''
        }))
        
        form.setValue('items', formItems)
        
        // Fetch product batches for each item
        const batchPromises = response.data.items.map(async (item) => {
          try {
            // This would be your actual API call to get batches
const batchResponse = await fetch(`/api/inventory/batches?productId=${item.productId}`)
const batchData = await batchResponse.json()
return { productId: item.productId, batches: batchData }
                    } catch (error) {
                      console.error(`Failed to fetch batches for product ${item.productId}`, error)
                      return { productId: item.productId, batches: [] }
                    }
                  })
        
        const batchResults = await Promise.all(batchPromises)
        const batchesMap: Record<string, any[]> = {}
        
        batchResults.forEach(result => {
          batchesMap[result.productId] = result.batches
        })
        
        setProductBatches(batchesMap)
      } catch (error) {
        console.error('Failed to fetch prescription', error)
        setError('Failed to load prescription data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (prescriptionId) {
      fetchPrescription()
    }
  }, [prescriptionId, form])
  
  // Handle form submission
const onSubmit = async (data: DispenseFormValues) => {
  setIsSubmitting(true)
  
  try {
    // Ensure itemId is present and map to DispenseItemData[]
    const itemsToDispense: DispenseItemData[] = data.items.map(item => ({
      itemId: item.itemId!,
      quantityToDispense: item.quantityToDispense,
      batchId: item.batchId,
      notes: item.notes
    }))
    await prescriptionService.dispensePrescriptionItems(prescriptionId, itemsToDispense)
    toast.success('Prescription items dispensed successfully')
    router.push(`/prescriptions/${prescriptionId}`)
  } catch (error) {
    console.error('Failed to dispense prescription items', error)
    toast.error('Failed to dispense prescription items')
  } finally {
    setIsSubmitting(false)
  }
}
  
  // Calculate remaining quantity for an item
  const getRemainingQuantity = (item: any) => {
    return item.quantity - (item.dispensed || 0)
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  if (!prescription) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Prescription not found</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dispense Prescription</h1>
            <p className="text-slate-500">
              Prescription #{prescription.prescriptionNumber} for {prescription.patient?.name}
            </p>
          </div>
        </div>
        
        <Link href={`/prescriptions/${prescriptionId}`}>
          <Button variant="outline">View Prescription Details</Button>
        </Link>
      </div>
      
      {/* Prescription Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Summary</CardTitle>
          <CardDescription>Review the prescription details before dispensing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-sm text-slate-500 mb-2">Patient Information</h3>
              <div className="space-y-1">
                <p className="font-medium">{prescription.patient?.name}</p>
                {prescription.patient?.dateOfBirth && (
                  <p className="text-sm text-slate-600">
                    DOB: {format(new Date(prescription.patient.dateOfBirth), 'PPP')}
                  </p>
                )}
                {prescription.patient?.phoneNumber && (
                  <p className="text-sm text-slate-600">{prescription.patient.phoneNumber}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-slate-500 mb-2">Prescription Information</h3>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Issued By:</span> {prescription.issuedBy}
                </p>
                {prescription.doctorName && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Doctor:</span> {prescription.doctorName}
                  </p>
                )}
                {prescription.hospitalName && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Hospital:</span> {prescription.hospitalName}
                  </p>
                )}
                {prescription.diagnosis && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                  </p>
                )}
                {prescription.validUntil && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Valid Until:</span> {format(new Date(prescription.validUntil), 'PPP')}
                  </p>
                )}
                <div className="flex items-center mt-1">
                  <span className="font-medium text-sm mr-2">Status:</span>
                  <Badge 
                    className={
                      prescription.status === 'PENDING' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                      prescription.status === 'PARTIALLY_FULFILLED' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                      prescription.status === 'FULFILLED' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                      'bg-red-100 text-red-800 hover:bg-red-100'
                    }
                  >
                    {prescription.status === 'PENDING' ? 'Pending' :
                     prescription.status === 'PARTIALLY_FULFILLED' ? 'Partially Fulfilled' :
                     prescription.status === 'FULFILLED' ? 'Fulfilled' :
                     'Canceled'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dispense Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Dispense Medications</CardTitle>
              <CardDescription>Enter the quantities to dispense for each medication</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead className="w-[100px] text-right">Prescribed</TableHead>
                    <TableHead className="w-[100px] text-right">Dispensed</TableHead>
                    <TableHead className="w-[100px] text-right">Remaining</TableHead>
                    <TableHead className="w-[150px] text-right">Dispense Qty</TableHead>
                    <TableHead className="w-[200px]">Batch (Optional)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescription.items.map((item, index) => {
                    const remaining = getRemainingQuantity(item);
                    const isFullyDispensed = remaining <= 0;
                    
                    return (
                      <TableRow key={item.id} className={isFullyDispensed ? "bg-slate-50" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            {item.product?.sku && (
                              <p className="text-xs text-slate-500">SKU: {item.product.sku}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{item.dosage}</p>
                            {item.frequency && <p className="text-xs text-slate-500">{item.frequency}</p>}
                            {item.duration && <p className="text-xs text-slate-500">for {item.duration}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.dispensed || 0}</TableCell>
                        <TableCell className="text-right font-medium">
                          {remaining}
                        </TableCell>
                        <TableCell>
                          {isFullyDispensed ? (
                            <Badge variant="outline" className="ml-auto">Fully Dispensed</Badge>
                          ) : (
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantityToDispense`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={remaining}
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      className="w-full text-right"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {isFullyDispensed ? (
                            <span className="text-sm text-slate-500">N/A</span>
                          ) : (
                            <FormField
                              control={form.control}
                              name={`items.${index}.batchId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      disabled={isFullyDispensed}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select batch" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {productBatches[item.productId]?.length > 0 ? (
                                          productBatches[item.productId].map((batch) => (
                                            <SelectItem key={batch.id} value={batch.id}>
                                              {batch.batchNumber} - Exp: {format(new Date(batch.expiryDate), 'MMM yyyy')}
                                            </SelectItem>
                                          ))
                                        ) : (
<SelectItem value="none" disabled>
  No batches available
</SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {/* Notes */}
              <div className="mt-6">
                <h3 className="font-medium mb-2">Dispensing Notes</h3>
                <Textarea 
                  placeholder="Enter any notes about this dispensing (optional)"
                  className="h-24"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || prescription.items.every(item => getRemainingQuantity(item) <= 0)}
                className="bg-purple hover:bg-purple/90"
              >
                {isSubmitting ? "Processing..." : "Dispense Medications"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}