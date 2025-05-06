'use client'

import React, { useEffect, useState } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'
import Link from 'next/link'
import { prescriptionService } from '../../../lib/api/prescriptionService'
import { format } from 'date-fns'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true)
        const response = await prescriptionService.getPrescriptions({
          take: 50,
          status: statusFilter !== 'all' ? statusFilter : undefined
        })
        setPrescriptions(response.data)
      } catch (error) {
        console.error('Failed to fetch prescriptions', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrescriptions()
  }, [statusFilter])
  
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const searchLower = searchTerm.toLowerCase()
    return (
      prescription.prescriptionNumber?.toLowerCase().includes(searchLower) ||
      prescription.patient?.name?.toLowerCase().includes(searchLower) ||
      prescription.doctorName?.toLowerCase().includes(searchLower) ||
      prescription.hospitalName?.toLowerCase().includes(searchLower)
    )
  })
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'PARTIALLY_FULFILLED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Partially Fulfilled</Badge>
      case 'FULFILLED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Fulfilled</Badge>
      case 'CANCELED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Canceled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Prescriptions</h1>
          <p className="text-slate-500">Manage and track patient prescriptions</p>
        </div>
        <Link href="/prescriptions/new">
          <Button className="bg-purple hover:bg-purple/90">
            <Plus className="mr-2 h-4 w-4" />
            New Prescription
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search prescriptions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIALLY_FULFILLED">Partially Fulfilled</SelectItem>
                <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                <SelectItem value="CANCELED">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Date Range
              </Button>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Prescriptions Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      {searchTerm || statusFilter !== 'all' ? (
                        <div className="flex flex-col items-center">
                          <AlertTriangle className="h-8 w-8 text-slate-400 mb-2" />
                          <p>No prescriptions found matching your filters.</p>
                          <Button 
                            variant="link" 
                            onClick={() => {
                              setSearchTerm('')
                              setStatusFilter('all')
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8 text-slate-400 mb-2" />
                        <p>No prescriptions found.</p>
                        <p className="text-sm text-slate-400">Create your first prescription to get started.</p>
                        <Link href="/prescriptions/new" className="mt-2">
                          <Button variant="outline" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            New Prescription
                          </Button>
                        </Link>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell className="font-medium">
                      <Link href={`/prescriptions/${prescription.id}`} className="text-purple hover:underline">
                        {prescription.prescriptionNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{prescription.patient?.name}</span>
                        {prescription.patient?.phoneNumber && (
                          <span className="text-xs text-slate-500">{prescription.patient.phoneNumber}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{prescription.doctorName || 'N/A'}</span>
                        {prescription.hospitalName && (
                          <span className="text-xs text-slate-500">{prescription.hospitalName}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {prescription.createdAt && (
                        <div className="flex flex-col">
                          <span>{format(new Date(prescription.createdAt), 'MMM d, yyyy')}</span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(prescription.createdAt), 'h:mm a')}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50">
                        {prescription.items?.length || 0} items
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/prescriptions/${prescription.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        {prescription.status === 'PENDING' && (
                          <Link href={`/prescriptions/${prescription.id}/dispense`}>
                            <Button size="sm" className="bg-purple hover:bg-purple/90">
                              Dispense
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  </div>
)
}