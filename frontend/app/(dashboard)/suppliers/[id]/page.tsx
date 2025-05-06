'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { Skeleton } from '../../../../components/ui/skeleton'
import { 
  ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, 
  User, Building, Package, Calendar, Clock, ShoppingBag, Plus 
} from 'lucide-react'
import { supplierService } from '../../../../lib/api/supplierService'
import { formatDate } from '../../../../lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table"


interface Supplier {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  contactPerson?: string
  isActive: boolean
  products?: Product[]
  purchaseOrders?: PurchaseOrder[]
  createdAt: string
  updatedAt: string
  createdBy?: string
}

interface Product {
  id: string
  name: string
  genericName: string
  dosageForm: string
  strength: string
  category?: string
}

interface PurchaseOrder {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  expectedDate?: string
  receivedDate?: string
}

export default function SupplierDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        
        const data = await supplierService.getSupplierById(params.id)
        setSupplier(data)
      } catch (error: any) {
        console.error('Failed to fetch supplier details', error)
        setError(error.message || 'Failed to fetch supplier details')
      } finally {
        setIsLoading(false)
      }
    }    
    fetchSupplier()
  }, [params.id, router])
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      await supplierService.deleteSupplier(params.id)
      router.push('/suppliers')
    } catch (error: any) {
      console.error('Failed to delete supplier', error)
      alert(error.message || 'Failed to delete supplier')
    }
  }  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
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
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    )
  }
  
  if (!supplier) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center py-10">
          <Building className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-lg font-medium text-slate-900">Supplier not found</h3>
          <p className="mt-1 text-sm text-slate-500">
            The supplier you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/suppliers')}>
              Go back to suppliers
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/suppliers/${supplier.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{supplier.name}</h3>
                <Badge variant={supplier.isActive ? "default" : "secondary"}>
                  {supplier.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              {supplier.contactPerson && (
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-slate-500" />
                  <span>{supplier.contactPerson}</span>
                </div>
              )}
              
              {supplier.phone && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-slate-500" />
                  <span>{supplier.phone}</span>
                </div>
              )}
              
              {supplier.email && (
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-slate-500" />
                  <span>{supplier.email}</span>
                </div>
              )}
              
              {supplier.address && (
                <div className="flex items-start">
                  <MapPin className="mr-2 h-4 w-4 text-slate-500 mt-1" />
                  <span>{supplier.address}</span>
                </div>
              )}
              
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Created</span>
                  <span>{formatDate(supplier.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-500">Last Updated</span>
                  <span>{formatDate(supplier.updatedAt)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:w-2/3">
          <Tabs defaultValue="products">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">
                <Package className="mr-2 h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Purchase Orders
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Supplied Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {!supplier.products || supplier.products.length === 0 ? (
                    <div className="text-center py-6">
                      <Package className="mx-auto h-8 w-8 text-slate-300" />
                      <h3 className="mt-2 text-sm font-medium text-slate-900">No products</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        This supplier doesn't have any products yet.
                      </p>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push('/products/new?supplierId=' + supplier.id)}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Add Product
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Generic Name</TableHead>
                          <TableHead>Form</TableHead>
                          <TableHead>Strength</TableHead>
                          <TableHead>Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplier.products.map((product) => (
                          <TableRow 
                            key={product.id}
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() => router.push(`/products/${product.id}`)}
                          >
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.genericName}</TableCell>
                            <TableCell>{product.dosageForm}</TableCell>
                            <TableCell>{product.strength}</TableCell>
                            <TableCell>{product.category || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {!supplier.purchaseOrders || supplier.purchaseOrders.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
                      <h3 className="mt-2 text-sm font-medium text-slate-900">No orders</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        This supplier doesn't have any purchase orders yet.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order Number</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Expected Date</TableHead>
                          <TableHead>Received Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplier.purchaseOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.total}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>{order.expectedDate ? formatDate(order.expectedDate) : "—"}</TableCell>
                            <TableCell>{order.receivedDate ? formatDate(order.receivedDate) : "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}