'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { formatCurrency, formatDate } from '../../../lib/utils'
import { Plus, Search, Filter, AlertTriangle, Package } from 'lucide-react'
import { useAuthStore } from '../../../lib/stores/authStore'
import { getInventoryBatches } from '../../../lib/api/inventoryService'

interface InventoryItem {
  id: string
  productId: string
  productName: string
  batchNumber: string
  expiryDate: string
  quantity: number
  location: string
  costPrice: number
  status: 'Good' | 'Expiring Soon' | 'Low Stock' | 'Expired'
}

export default function InventoryPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [lowStockCount, setLowStockCount] = useState(0)
  const [expiringCount, setExpiringCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchInventory = async () => {
      if (!user?.pharmacyId) {
        setInventory([])
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        console.log('Token in inventory page:', !!token)
        
        if (!token) {
          console.log('No token found in inventory page, redirecting to login')
          router.push('/login')
          return
        }
        
        const data = await getInventoryBatches(user.pharmacyId)
        
        const mappedInventory = data.map((item: any) => {
          let status: InventoryItem['status'] = 'Good'
          const expiryDate = new Date(item.expiryDate)
          const today = new Date()
          const diffDays = (expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
          if (diffDays < 0) {
            status = 'Expired'
          } else if (diffDays < 90) {
            status = 'Expiring Soon'
          }
          if (item.quantity < 5) {
            status = 'Low Stock'
          }
          return {
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            quantity: item.quantity,
            location: item.branch?.name || 'Unknown',
            costPrice: item.costPrice,
            status,
          }
        })
        
        setInventory(mappedInventory)
        setLowStockCount(mappedInventory.filter(item => item.status === 'Low Stock').length)
        setExpiringCount(mappedInventory.filter(item => item.status === 'Expiring Soon' || item.status === 'Expired').length)
      } catch (error) {
        console.error('Failed to fetch inventory', error)
        setError("Failed to load inventory. Please try again.")
        
        // Handle authentication errors
        if (error instanceof Error && error.message === 'Authentication token not found') {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchInventory()
  }, [user?.pharmacyId, router])

  const filteredInventory = inventory.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-slate-500">Manage your pharmacy inventory</p>
        </div>

        <div className="flex space-x-2">
          <Link href="/inventory/receive">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Receive Stock
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-5 w-5 text-slate-500 mr-2" />
              <span className="text-2xl font-bold">{inventory.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-2xl font-bold text-red-500">{lowStockCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiring Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold text-amber-500">{expiringCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">Loading inventory...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Batch #</th>
                    <th className="text-left py-3 px-4">Expiry Date</th>
                    <th className="text-left py-3 px-4">Quantity</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link href={`/products/${item.productId}`} className="text-blue-600 hover:underline">
                          {item.productName}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{item.batchNumber}</td>
                      <td className="py-3 px-4">{formatDate(item.expiryDate)}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">{item.location}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'Good' ? 'bg-green-100 text-green-800' : 
                          item.status === 'Low Stock' ? 'bg-red-100 text-red-800' : 
                          item.status === 'Expired' ? 'bg-red-100 text-red-800' : 
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(item.costPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
