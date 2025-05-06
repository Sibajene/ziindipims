'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { formatCurrency, formatDate } from '../../../lib/utils'
import { Plus, Search, Filter, Download, BarChart2, X } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../components/ui/select'
import { DatePickerWithRange } from '../../../components/ui/date-range-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { toast } from '../../../components/ui/use-toast'
import api from '../../../lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

interface Sale {
  id: string
  invoiceNumber: string
  createdAt: string
  customer: string
  total: number
  paymentMethod: string
  paymentStatus: string
  patient: {
    name: string
  } | null
  saleItems: {
    id: string
  }[]
}

interface Branch {
  id: string
  name: string
}

interface SalesReport {
  summary: {
    totalSales: number
    totalRevenue: number
    totalItems: number
    totalQuantity: number
    startDate: string
    endDate: string
  }
  salesByPaymentMethod: Record<string, { count: number; total: number }>
  salesByDay: Record<string, { count: number; total: number }>
  topProducts: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
  }>
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [report, setReport] = useState<SalesReport | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true)
        const [salesResponse, branchesResponse] = await Promise.all([
          api.get('/sales'),
          api.get('/branches')
        ])
        
        setSales(salesResponse.data)
        setFilteredSales(salesResponse.data)
        setBranches(branchesResponse.data)
      } catch (error) {
        console.error('Failed to fetch sales', error)
        toast({
          title: 'Error',
          description: 'Failed to load sales data. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSales()
  }, [])
  
  useEffect(() => {
    // Apply filters
    let result = sales

    if (searchTerm) {
      result = result.filter(sale => 
        sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer && sale.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.patient && sale.patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter) {
      result = result.filter(sale => sale.paymentStatus === statusFilter)
    }

    if (paymentMethodFilter) {
      result = result.filter(sale => sale.paymentMethod === paymentMethodFilter)
    }

    if (branchFilter) {
      result = result.filter(sale => sale.branch?.id === branchFilter)
    }

    if (dateRange && dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999) // End of day

      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt)
        return saleDate >= fromDate && saleDate <= toDate
      })
    }

    setFilteredSales(result)
  }, [sales, searchTerm, statusFilter, paymentMethodFilter, branchFilter, dateRange])

  const generateReport = async () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      toast({
        title: 'Error',
        description: 'Please select a date range for the report.',
        variant: 'destructive',
      })
      return
    }

    setReportLoading(true)
    try {
      const fromDate = dateRange.from.toISOString().split('T')[0]
      const toDate = dateRange.to.toISOString().split('T')[0]
      
      const response = await api.get(`/sales/report?startDate=${fromDate}&endDate=${toDate}${branchFilter ? `&branchId=${branchFilter}` : ''}`)
      setReport(response.data)
      setShowReportDialog(true)
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate sales report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setReportLoading(false)
    }
  }

  const exportReport = () => {
    if (!report) return

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"
    
    // Add header
    csvContent += "Sales Report\r\n"
    csvContent += `Period: ${formatDate(report.summary.startDate)} to ${formatDate(report.summary.endDate)}\r\n\r\n`
    
    // Add summary
    csvContent += "Summary\r\n"
    csvContent += `Total Sales,${report.summary.totalSales}\r\n`
    csvContent += `Total Revenue,${formatCurrency(report.summary.totalRevenue)}\r\n`
    csvContent += `Total Items,${report.summary.totalItems}\r\n`
    csvContent += `Total Quantity,${report.summary.totalQuantity}\r\n\r\n`
    
    // Add payment methods
    csvContent += "Sales by Payment Method\r\n"
    csvContent += "Payment Method,Count,Total\r\n"
    Object.entries(report.salesByPaymentMethod).forEach(([method, data]) => {
      csvContent += `${method},${data.count},${formatCurrency(data.total)}\r\n`
    })
    csvContent += "\r\n"
    
    // Add daily sales
    csvContent += "Daily Sales\r\n"
    csvContent += "Date,Count,Total\r\n"
    Object.entries(report.salesByDay).forEach(([day, data]) => {
      csvContent += `${day},${data.count},${formatCurrency(data.total)}\r\n`
    })
    csvContent += "\r\n"
    
    // Add top products
    csvContent += "Top Products\r\n"
    csvContent += "Product,Quantity,Revenue\r\n"
    report.topProducts.forEach(product => {
      csvContent += `${product.name},${product.quantity},${formatCurrency(product.revenue)}\r\n`
    })
    
    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `sales_report_${formatDate(report.summary.startDate)}_to_${formatDate(report.summary.endDate)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetFilters = () => {
    setStatusFilter('')
    setPaymentMethodFilter('')
    setBranchFilter('')
    setDateRange({
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    })
  }
  
  const getCustomerName = (sale: Sale) => {
    if (sale.patient) return sale.patient.name
    if (sale.customer) return sale.customer
    return 'Walk-in Customer'
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-amber-100 text-amber-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-slate-500">Manage your pharmacy sales</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateReport} disabled={reportLoading}>
            <BarChart2 className="mr-2 h-4 w-4" />
            {reportLoading ? 'Generating...' : 'Generate Report'}
          </Button>
          
          <Link href="/sales/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search by invoice number or customer..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-slate-100' : ''}
        >
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Payment Method</label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All methods</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="MOMO">Mobile Money</SelectItem>
                  <SelectItem value="INSURANCE">Insurance</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Branch</label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All branches</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={resetFilters} className="mr-2">
              <X className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading sales...</p>
          </div>
        </div>
      ) : (
        <>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-slate-500">No sales found matching your criteria.</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left py-3 px-4">Invoice #</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Items</th>
                        <th className="text-left py-3 px-4">Payment</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-right py-3 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <Link href={`/sales/${sale.id}`} className="text-blue-600 hover:underline">
                              {sale.invoiceNumber}
                            </Link>
                          </td>
                          <td className="py-3 px-4">{formatDate(sale.createdAt)}</td>
                          <td className="py-3 px-4">{getCustomerName(sale)}</td>
                          <td className="py-3 px-4">{sale.saleItems.length}</td>
                          <td className="py-3 px-4">
                            {sale.paymentMethod.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(sale.paymentStatus)}`}>
                              {sale.paymentStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(sale.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {/* Sales Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sales Report</DialogTitle>
          </DialogHeader>
          
          {report && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">
                    {formatDate(report.summary.startDate)} - {formatDate(report.summary.endDate)}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {branchFilter ? branches.find(b => b.id === branchFilter)?.name : 'All Branches'}
                  </p>
                </div>
                <Button variant="outline" onClick={exportReport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{report.summary.totalSales}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(report.summary.totalRevenue)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{report.summary.totalItems}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Total Quantity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{report.summary.totalQuantity}</div>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="payment">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="payment">By Payment Method</TabsTrigger>
                  <TabsTrigger value="products">Top Products</TabsTrigger>
                </TabsList>
                
                <TabsContent value="payment" className="pt-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Payment Method</th>
                        <th className="text-right py-2 px-4">Count</th>
                        <th className="text-right py-2 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.salesByPaymentMethod).map(([method, data]) => (
                        <tr key={method} className="border-b">
                          <td className="py-2 px-4">{method.replace('_', ' ')}</td>
                          <td className="py-2 px-4 text-right">{data.count}</td>
                          <td className="py-2 px-4 text-right font-medium">{formatCurrency(data.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TabsContent>
                
                <TabsContent value="products" className="pt-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Product</th>
                        <th className="text-right py-2 px-4">Quantity</th>
                        <th className="text-right py-2 px-4">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topProducts.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="py-2 px-4">{product.name}</td>
                          <td className="py-2 px-4 text-right">{product.quantity}</td>
                          <td className="py-2 px-4 text-right font-medium">{formatCurrency(product.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}