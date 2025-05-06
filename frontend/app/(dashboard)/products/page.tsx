'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { formatCurrency } from '../../../lib/utils'
import { Plus, Search } from 'lucide-react'
import { productService } from '../../../lib/api/productService'

interface Product {
  id: string
  name: string
  genericName: string
  dosageForm: string
  strength: string
  barcode?: string
  requiresPrescription: boolean
  controlled: boolean
  unitPrice: number
  reorderLevel: number
  category?: string
  manufacturer?: string
  description?: string
  imageUrl?: string
  isActive: boolean
  supplierId?: string
  supplier?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        console.log('Token in products page:', !!token);
        console.log('Token first 10 chars:', token ? token.substring(0, 10) + '...' : 'No token');
        
        if (!token) {
          console.log('No token found in products page, redirecting to login');
          router.push('/login')
          return
        }
        
        const data = await productService.getProducts(token)
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products', error)
        setError("Failed to load products. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProducts()
  }, [router])
  
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-slate-500">Manage your pharmacy products</p>
        </div>
        
        <Link href="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline">Filter</Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">Loading products...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <p className="text-sm text-slate-500">{product.genericName}</p>
              </div>
              <div className="w-24 h-24 flex-shrink-0 ml-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl.startsWith('http')
                      ? product.imageUrl
                      : product.imageUrl.startsWith('/uploads')
                        ? `/api/uploads${product.imageUrl.substring('/uploads'.length)}`
                        : `/api/uploads${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      console.error('Image failed to load:', product.imageUrl);
                      (e.target as HTMLImageElement).src = '/images/No-image.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-xs">
                    No Image
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm line-clamp-2">{product.description || `${product.dosageForm} ${product.strength}`}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium bg-slate-100 px-2 py-1 rounded">
                    {product.category || 'Uncategorized'}
                  </span>
                  <span className="font-bold text-lg">
                    {formatCurrency(product.unitPrice)}
                  </span>
                </div>
                {product.requiresPrescription && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                    Requires Prescription
                  </p>
                )}
                {product.controlled && (
                  <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded inline-block ml-1">
                    Controlled
                  </p>
                )}
              </div>
            </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          No products found. {searchTerm ? 'Try a different search term.' : 'Add your first product.'}
        </div>
      )}
    </div>
  )
}
