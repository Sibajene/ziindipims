import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table'
import { Button } from '../ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface BatchesTableProps {
  batches: any[]
  onEdit?: (batch: any) => void
  onDelete?: (batch: any) => void
}

export function BatchesTable({ batches, onEdit, onDelete }: BatchesTableProps) {
  if (!batches || batches.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No batches available for this product.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch Number</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Cost Price</TableHead>
            <TableHead className="text-right">Selling Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell className="font-medium">{batch.batchNumber}</TableCell>
              <TableCell>{batch.branch?.name || 'Unknown'}</TableCell>
              <TableCell>
                {new Date(batch.expiryDate).toLocaleDateString()}
                {isExpiringSoon(batch.expiryDate) && (
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Expiring Soon
                  </span>
                )}
                {isExpired(batch.expiryDate) && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    Expired
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">{batch.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(batch.costPrice)}</TableCell>
              <TableCell className="text-right">{formatCurrency(batch.sellingPrice)}</TableCell>
              <TableCell>
                {batch.isActive ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    Inactive
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(batch)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(batch)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Helper functions to check expiry status
function isExpiringSoon(expiryDate: string): boolean {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const threeMonths = 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
  
  return expiry > today && expiry.getTime() - today.getTime() < threeMonths
}

function isExpired(expiryDate: string): boolean {
  const expiry = new Date(expiryDate)
  const today = new Date()
  
  return expiry < today
}