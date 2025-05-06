'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../../components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail,
  Building
} from 'lucide-react'
import { supplierService } from '../../../lib/api/supplierService'
import { Skeleton } from '../../../components/ui/skeleton'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog'

interface Supplier {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  contactPerson?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SuppliersPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }
        
        const data = await supplierService.getSuppliers()
        setSuppliers(data)
        setFilteredSuppliers(data)
      } catch (error: any) {
        console.error('Failed to fetch suppliers', error)
        setError('Failed to load suppliers. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSuppliers()
  }, [router])
  
  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSuppliers(suppliers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = suppliers.filter(
        supplier => 
          supplier.name.toLowerCase().includes(query) ||
          (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(query)) ||
          (supplier.email && supplier.email.toLowerCase().includes(query)) ||
          (supplier.phone && supplier.phone.includes(query))
      )
      setFilteredSuppliers(filtered)
    }
  }, [searchQuery, suppliers])
  
  // Handle delete
  const handleDelete = async () => {
    if (!deleteSupplier) return
    
    try {
      setIsDeleting(true)
      
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      await supplierService.deleteSupplier(deleteSupplier.id)
      
      // Update the suppliers list
      setSuppliers(suppliers.filter(s => s.id !== deleteSupplier.id))
      setFilteredSuppliers(filteredSuppliers.filter(s => s.id !== deleteSupplier.id))
      
      // Close the dialog
      setDeleteSupplier(null)
    } catch (error: any) {
      console.error('Failed to delete supplier', error)
      setError('Failed to delete supplier. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Button onClick={() => router.push('/suppliers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Suppliers</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search suppliers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-6">
              <Building className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No suppliers found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery ? 'Try a different search term' : 'Get started by adding a new supplier'}
              </p>
              {!searchQuery && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/suppliers/new')}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Supplier
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson || "—"}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3 text-slate-500" />
                            {supplier.phone}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3 text-slate-500" />
                            {supplier.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? "default" : "secondary"}>
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/suppliers/${supplier.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/suppliers/${supplier.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteSupplier(supplier)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {deleteSupplier && (
        <AlertDialog 
          open={!!deleteSupplier} 
          onOpenChange={(open) => setDeleteSupplier(open ? deleteSupplier : null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the supplier.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}