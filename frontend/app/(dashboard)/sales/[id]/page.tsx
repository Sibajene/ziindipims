"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { toast } from '../../../../components/ui/use-toast';
import { api } from '../../../../lib/axiosClient';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import { Printer, ArrowLeft, Download, AlertTriangle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  insuranceCoverage: number | null;
  batch: {
    product: {
      name: string;
      requiresPrescription: boolean;
    }
  }
}

interface Sale {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  customer: string;
  patientPaid: number;
  insurancePaid: number | null;
  branch: {
    name: string;
    location: string;
    phone: string;
  };
  soldBy: {
    name: string;
  };
  patient: {
    name: string;
  } | null;
  saleItems: SaleItem[];
}

const SaleReceiptPage = () => {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await api.get(`/sales/${params.id}`);
        setSale(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sale:', err);
        setError('Failed to load sale details. Please try again.');
        setLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to load sale details. Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (params.id) {
      fetchSale();
    }
  }, [params.id]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current!,
    documentTitle: `Receipt-${sale?.invoiceNumber || 'Sale'}`,
  } as any);

  const handleCancelSale = async () => {
    if (!sale || sale.paymentStatus === 'CANCELLED') return;

    if (!confirm('Are you sure you want to cancel this sale? This action cannot be undone.')) {
      return;
    }

    try {
      await api.post(`/sales/${sale.id}/cancel`);
      toast({
        title: 'Success',
        description: 'Sale has been cancelled successfully.',
      });
      // Refresh sale data
      const response = await api.get(`/sales/${params.id}`);
      setSale(response.data);
    } catch (err) {
      console.error('Error cancelling sale:', err);
      toast({
        title: 'Error',
        description: 'Failed to cancel sale. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Sale</h2>
          <p className="text-gray-600 mb-4">{error || 'Sale not found'}</p>
          <Button onClick={() => router.push('/sales')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.push('/sales')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sales
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handlePrint()}>
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
          </Button>
          {sale.paymentStatus !== 'CANCELLED' && (
            <Button variant="destructive" onClick={handleCancelSale}>
              Cancel Sale
            </Button>
          )}
        </div>
      </div>

      {/* Receipt Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto" ref={printRef}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{sale.branch.name}</h1>
          <p className="text-gray-600">{sale.branch.location}</p>
          <p className="text-gray-600">{sale.branch.phone}</p>
          <h2 className="text-xl font-bold mt-4">SALES RECEIPT</h2>
          {sale.paymentStatus === 'CANCELLED' && (
            <div className="mt-2">
              <Badge variant="destructive" className="text-lg px-4 py-1">CANCELLED</Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><span className="font-semibold">Invoice:</span> {sale.invoiceNumber}</p>
            <p><span className="font-semibold">Date:</span> {formatDate(sale.createdAt)}</p>
            <p><span className="font-semibold">Cashier:</span> {sale.soldBy.name}</p>
          </div>
          <div>
            <p><span className="font-semibold">Customer:</span> {sale.patient ? sale.patient.name : (sale.customer || 'Walk-in Customer')}</p>
            <p><span className="font-semibold">Payment Method:</span> {sale.paymentMethod.replace('_', ' ')}</p>
            <p><span className="font-semibold">Status:</span> {sale.paymentStatus}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.saleItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.batch.product.name}
                  {item.batch.product.requiresPrescription && (
                    <Badge variant="outline" className="ml-2 bg-yellow-100">Rx</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
          
          {sale.insurancePaid && (
            <>
              <div className="flex justify-between text-lg">
                <span>Insurance Coverage:</span>
                <span>{formatCurrency(sale.insurancePaid)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Patient Paid:</span>
                <span>{formatCurrency(sale.patientPaid)}</span>
              </div>
            </>
          )}
          
          {!sale.insurancePaid && (
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Thank you for your purchase!</p>
          <p>For returns or exchanges, please present this receipt within 7 days.</p>
        </div>
      </div>
    </div>
  );
};

export default SaleReceiptPage;