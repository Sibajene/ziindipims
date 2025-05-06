"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../../components/ui/select'
import { useToast } from '../../../../components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { Search, Plus, Trash, ArrowLeft, Save } from 'lucide-react'
import api, { 
  inventoryService, 
  prescriptionService, 
  patientService, 
  branchService, 
  userService 
} from '../../../../lib/api'
import { formatCurrency } from '../../../../lib/utils'

interface Branch {
  id: string
  name: string
}

interface User {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  genericName: string
  strength: string
  category: string
  requiresPrescription: boolean
  barcode?: string
}

interface Batch {
  id: string
  batchNumber: string
  expiryDate: string
  quantity: number
  sellingPrice: number
  product: Product
}

interface Patient {
  id: string
  name: string
  patientInsurances?: PatientInsurance[]
}

interface PatientInsurance {
  id: string
  membershipNumber: string
  plan: {
    id: string
    name: string
    provider: {
      id: string
      name: string
    }
  }
}

interface Prescription {
  id: string
  prescriptionNumber: string
  patient: Patient
  items: {
    id: string
    productId: string
    product: Product
    quantity: number
    dispensed: number
  }[]
}

interface SaleItem {
  batchId: string
  batch?: Batch
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export default function NewSalePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Form state
  const [branchId, setBranchId] = useState('')
  const [soldById, setSoldById] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [patientId, setPatientId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paymentStatus, setPaymentStatus] = useState('PAID')
  const [prescriptionId, setPrescriptionId] = useState('')
  const [patientInsuranceId, setPatientInsuranceId] = useState('')
  const [items, setItems] = useState<SaleItem[]>([])
  
  // Data state
  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([])
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Use the service functions instead of direct API calls
        const [branchesRes, usersRes, batchesData, patientsData, prescriptionsData] = await Promise.all([
          branchService.getAllBranches(),
          userService.getAllUsers(),
          inventoryService.getBatches({ inStock: true }),
          patientService.getPatients(),
          prescriptionService.getPrescriptions({ status: 'PENDING,PARTIALLY_FULFILLED' })
        ])
        
        setBranches(branchesRes.data)
        setUsers(usersRes.data)
        setBatches(batchesData)
        setFilteredBatches(batchesData)
        setPatients(patientsData)
        setFilteredPatients(patientsData)
        setPrescriptions(prescriptionsData)
        setFilteredPrescriptions(prescriptionsData)
        
        // Set default branch and user if available
        if (branchesRes.data.length > 0) {
          setBranchId(branchesRes.data[0].id)
        }
        
        if (usersRes.data.length > 0) {
          setSoldById(usersRes.data[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch initial data', error)
        toast({
          title: 'Error',
          description: 'Failed to load required data. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast])
  
  // Filter batches based on search term
  useEffect(() => {
    if (!batches) return
    
    let filtered = [...batches]
    
    // Filter by search term
    if (productSearchTerm) {
      const searchLower = productSearchTerm.toLowerCase()
      filtered = filtered.filter(batch => 
        batch.product.name.toLowerCase().includes(searchLower) ||
        batch.product.genericName.toLowerCase().includes(searchLower) ||
        batch.product.barcode?.toLowerCase().includes(searchLower) ||
        batch.batchNumber.toLowerCase().includes(searchLower)
      )
    }
    
    // Only show batches with stock
    filtered = filtered.filter(batch => batch.quantity > 0)
    
    // Sort by product name
    filtered.sort((a, b) => a.product.name.localeCompare(b.product.name))
    
    setFilteredBatches(filtered)
  }, [batches, productSearchTerm])
  
  // Filter patients based on search term
  useEffect(() => {
    if (patientSearchTerm.trim() === '') {
      setFilteredPatients(patients)
    } else {
      const term = patientSearchTerm.toLowerCase()
      setFilteredPatients(
        patients.filter(patient => 
          patient.name.toLowerCase().includes(term)
        )
      )
    }
  }, [patientSearchTerm, patients])
  
  // Filter prescriptions based on search term and selected patient
  useEffect(() => {
    let filtered = prescriptions
    
    if (patientId) {
      filtered = filtered.filter(prescription => prescription.patient.id === patientId)
    }
    
    if (prescriptionSearchTerm.trim() !== '') {
      const term = prescriptionSearchTerm.toLowerCase()
      filtered = filtered.filter(prescription => 
        prescription.prescriptionNumber.toLowerCase().includes(term)
      )
    }
    
    setFilteredPrescriptions(filtered)
  }, [prescriptionSearchTerm, prescriptions, patientId])
  
  // Update selected patient when patientId changes
  useEffect(() => {
    if (patientId) {
      const patient = patients.find(p => p.id === patientId)
      setSelectedPatient(patient || null)
    } else {
      setSelectedPatient(null)
      setPatientInsuranceId('')
    }
  }, [patientId, patients])
  
  // Update selected prescription when prescriptionId changes
  useEffect(() => {
    if (prescriptionId) {
      const prescription = prescriptions.find(p => p.id === prescriptionId)
      setSelectedPrescription(prescription || null)
      
      // If prescription has a patient, select that patient
      if (prescription && prescription.patient) {
        setPatientId(prescription.patient.id)
      }
    } else {
      setSelectedPrescription(null)
    }
  }, [prescriptionId, prescriptions])
  
  // Add item to sale
  const addItem = (batch: Batch) => {
    // Check if item already exists
    const existingItemIndex = items.findIndex(item => item.batchId === batch.id)
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items]
      const item = updatedItems[existingItemIndex]
      
      // Check if there's enough stock
      if (item.quantity + 1 > batch.quantity) {
        toast({
          title: 'Insufficient Stock',
          description: `Only ${batch.quantity} units available in this batch.`,
          variant: 'destructive',
        })
        return
      }
      
      item.quantity += 1
      item.total = (item.unitPrice * item.quantity) - item.discount
      updatedItems[existingItemIndex] = item
      setItems(updatedItems)
    } else {
      // Add new item
      const newItem: SaleItem = {
        batchId: batch.id,
        batch,
        quantity: 1,
        unitPrice: batch.sellingPrice,
        discount: 0,
        total: batch.sellingPrice
      }
      setItems([...items, newItem])
    }
  }
  
  // Update item quantity
  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...items]
    const item = updatedItems[index]
    
    // Check if there's enough stock
    if (quantity > (item.batch?.quantity || 0)) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${item.batch?.quantity} units available in this batch.`,
        variant: 'destructive',
      })
      return
    }
    
    item.quantity = quantity
    item.total = (item.unitPrice * item.quantity) - item.discount
    updatedItems[index] = item
    setItems(updatedItems)
  }
  
  // Update item discount
  const updateItemDiscount = (index: number, discount: number) => {
    const updatedItems = [...items]
    const item = updatedItems[index]
    
    // Ensure discount is not greater than total before discount
    const totalBeforeDiscount = item.unitPrice * item.quantity
    if (discount > totalBeforeDiscount) {
      toast({
        title: 'Invalid Discount',
        description: 'Discount cannot be greater than the total price.',
        variant: 'destructive',
      })
      return
    }
    
    item.discount = discount
    item.total = totalBeforeDiscount - discount
    updatedItems[index] = item
    setItems(updatedItems)
  }
  
  // Remove item from sale
  const removeItem = (index: number) => {
    const updatedItems = [...items]
    updatedItems.splice(index, 1)
    setItems(updatedItems)
  }
  
  // Add prescription items to sale
  const addPrescriptionItems = () => {
    if (!selectedPrescription) return
    
    // For each prescription item, find a matching batch and add it to the sale
    selectedPrescription.items.forEach(prescriptionItem => {
      // Skip if already fully dispensed
      if (prescriptionItem.dispensed >= prescriptionItem.quantity) return
      
      // Find quantity still needed
      const quantityNeeded = prescriptionItem.quantity - prescriptionItem.dispensed
      
      // Find matching batches for this product
      const matchingBatches = batches.filter(
        batch => batch.product.id === prescriptionItem.productId && batch.quantity > 0
      )
      
      if (matchingBatches.length === 0) {
        toast({
          title: 'Product Not Available',
          description: `${prescriptionItem.product.name} is not in stock.`,
          variant: 'destructive',
        })
        return
      }
      
      // Sort batches by expiry date (earliest first)
      matchingBatches.sort((a, b) => 
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      )
      
      // Add the first available batch
      const batch = matchingBatches[0]
      const quantityToAdd = Math.min(quantityNeeded, batch.quantity)
      
      // Check if item already exists
      const existingItemIndex = items.findIndex(item => item.batchId === batch.id)
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...items]
        const item = updatedItems[existingItemIndex]
        
        // Check if there's enough stock
        if (item.quantity + quantityToAdd > batch.quantity) {
          toast({
            title: 'Insufficient Stock',
            description: `Only ${batch.quantity} units available in this batch.`,
            variant: 'destructive',
          })
          return
        }
        
        item.quantity += quantityToAdd
        item.total = (item.unitPrice * item.quantity) - item.discount
        updatedItems[existingItemIndex] = item
        setItems(updatedItems)
      } else {
        // Add new item
        const newItem: SaleItem = {
          batchId: batch.id,
          batch,
          quantity: quantityToAdd,
          unitPrice: batch.sellingPrice,
          discount: 0,
          total: batch.sellingPrice * quantityToAdd
        }
        setItems(prev => [...prev, newItem])
      }
    })
  }
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0)
  const total = subtotal - totalDiscount
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      toast({
        title: 'No Items',
        description: 'Please add at least one item to the sale.',
        variant: 'destructive',
      })
      return
    }
    
    if (!branchId) {
      toast({
        title: 'Branch Required',
        description: 'Please select a branch for this sale.',
        variant: 'destructive',
      })
      return
    }
    
    if (!soldById) {
      toast({
        title: 'Seller Required',
        description: 'Please select a user who is making this sale.',
        variant: 'destructive',
      })
      return
    }
    
    // Check if any product requires prescription but no prescription is selected
    const requiresPrescription = items.some(
      item => item.batch?.product.requiresPrescription
    )
    
    if (requiresPrescription && !prescriptionId) {
      toast({
        title: 'Prescription Required',
        description: 'One or more products require a prescription. Please select a prescription.',
        variant: 'destructive',
      })
      return
    }
    
    // Prepare sale data
    const saleData = {
      branchId,
      soldById,
      customer: customerName || undefined,
      patientId: patientId || undefined,
      paymentMethod,
      paymentStatus,
      prescriptionId: prescriptionId || undefined,
      patientInsuranceId: patientInsuranceId || undefined,
      items: items.map(item => ({
        batchId: item.batchId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      })),
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await api.post('/sales', saleData)
      
      toast({
        title: 'Sale Completed',
        description: `Invoice #${response.data.invoiceNumber} has been created.`,
      })
      
      // Redirect to sale details page
      router.push(`/sales/${response.data.id}`)
    } catch (error: any) {
      console.error('Failed to create sale', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create sale. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Sale</h1>
            <p className="text-slate-500">Create a new sales transaction</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Sale details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sale Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="soldBy">Sold By</Label>
                  <Select value={soldById} onValueChange={setSoldById}>
                    <SelectTrigger id="soldBy">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="MOMO">Mobile Money</SelectItem>
                      <SelectItem value="INSURANCE">Insurance</SelectItem>
                      <SelectItem value="CREDIT">Credit</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger id="paymentStatus">
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="patient">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="patient">Patient</TabsTrigger>
                    <TabsTrigger value="walkin">Walk-in</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="patient" className="space-y-4 pt-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        type="search"
                        placeholder="Search patients..."
                        className="pl-8"
                        value={patientSearchTerm}
                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {filteredPatients.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">No patients found</div>
                      ) : (
                        <ul className="divide-y">
                          {filteredPatients.map(patient => (
                            <li 
                              key={patient.id}
                              className={`p-3 cursor-pointer hover:bg-slate-50 ${patientId === patient.id ? 'bg-slate-100' : ''}`}
                              onClick={() => setPatientId(patient.id)}
                            >
                              <div className="font-medium">{patient.name}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    {selectedPatient && selectedPatient.patientInsurances && selectedPatient.patientInsurances.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="insurance">Insurance Plan</Label>
                        <Select value={patientInsuranceId} onValueChange={setPatientInsuranceId}>
                          <SelectTrigger id="insurance">
                            <SelectValue placeholder="Select insurance plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No insurance</SelectItem>
                            {selectedPatient.patientInsurances.map(insurance => (
                              <SelectItem key={insurance.id} value={insurance.id}>
                                {insurance.plan.provider.name} - {insurance.plan.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {selectedPatient && (
                      <div className="space-y-2">
                        <Label htmlFor="prescription">Prescription</Label>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                          <Input
                            type="search"
                            placeholder="Search prescriptions..."
                            className="pl-8"
                            value={prescriptionSearchTerm}
                            onChange={(e) => setPrescriptionSearchTerm(e.target.value)}
                          />
                        </div>
                        
                        <div className="border rounded-md max-h-48 overflow-y-auto">
                          {filteredPrescriptions.length === 0 ? (
                            <div className="p-4 text-center text-slate-500">No prescriptions found</div>
                          ) : (
                            <ul className="divide-y">
                              {filteredPrescriptions.map(prescription => (
                                <li 
                                  key={prescription.id}
                                  className={`p-3 cursor-pointer hover:bg-slate-50 ${prescriptionId === prescription.id ? 'bg-slate-100' : ''}`}
                                  onClick={() => setPrescriptionId(prescription.id)}
                                >
                                  <div className="font-medium">{prescription.prescriptionNumber}</div>
                                  <div className="text-sm text-slate-500">
                                    {prescription.items.length} items
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        
                        {selectedPrescription && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={addPrescriptionItems}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Prescription Items
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="walkin" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        placeholder="Enter customer name (optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Middle column - Products */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Product listing */}
                <div className="border rounded-md max-h-[400px] overflow-y-auto">
                  {filteredBatches.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No products found</div>
                  ) : (
                    <ul className="divide-y">
                      {filteredBatches.map(batch => (
                        <li 
                          key={batch.id}
                          className="p-3 cursor-pointer hover:bg-slate-50 flex justify-between items-center"
                          onClick={() => addItem(batch)}
                        >
                          <div>
                            <div className="font-medium">{batch.product.name}</div>
                            <div className="text-sm text-slate-500">
                              {batch.product.genericName} • {batch.product.strength}
                            </div>
                            <div className="text-xs text-slate-400">
                              Batch: {batch.batchNumber} • Exp: {new Date(batch.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(batch.sellingPrice)}</div>
                            <div className="text-sm text-slate-500">Stock: {batch.quantity}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Cart */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sale Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No items added to this sale yet.</p>
                    <p className="text-sm">Search and click on products to add them.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ul className="divide-y">
                      {items.map((item, index) => (
                        <li key={index} className="py-3">
                          <div className="flex justify-between">
                            <div className="font-medium">{item.batch?.product.name}</div>
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => removeItem(index)}
                              className="h-6 w-6 p-0 text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-slate-500">
                            Batch: {item.batch?.batchNumber}
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div>
                              <Label htmlFor={`quantity-${index}`} className="text-xs">Qty</Label>
                              <Input
                                id={`quantity-${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`price-${index}`} className="text-xs">Price</Label>
                              <Input
                                id={`price-${index}`}
                                type="number"
                                value={item.unitPrice}
                                disabled
                                className="h-8 bg-slate-50"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`discount-${index}`} className="text-xs">Discount</Label>
                              <Input
                                id={`discount-${index}`}
                                type="number"
                                min="0"
                                value={item.discount}
                                onChange={(e) => updateItemDiscount(index, parseFloat(e.target.value) || 0)}
                                className="h-8"
                              />
                            </div>
                          </div>
                          <div className="text-right mt-2 font-medium">
                            {formatCurrency(item.total)}
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Discount</span>
                        <span>-{formatCurrency(totalDiscount)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting || items.length === 0}>
                      {isSubmitting ? 'Processing...' : 'Complete Sale'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}