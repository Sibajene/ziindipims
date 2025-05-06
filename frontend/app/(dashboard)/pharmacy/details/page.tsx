"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { settingsService } from '../../../../lib/api/settingsService'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Loader2, Edit, ArrowLeft, Building2, Phone, Mail, FileText, CreditCard, Globe, Clock, DollarSign, AlertCircle, MapPin, Image } from 'lucide-react'
import { Separator } from '../../../../components/ui/separator'
import { Badge } from '../../../../components/ui/badge'
import { toast } from 'react-hot-toast'

export default function PharmacyDetailsPage() {
  const [pharmacy, setPharmacy] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPharmacy() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await settingsService.getPharmacyProfile()
        setPharmacy(data)
      } catch (error) {
        setError('Failed to load pharmacy details. Please try again later.')
        toast.error('Failed to load pharmacy details')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPharmacy()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
        <span className="text-gray-600 font-medium">Loading pharmacy details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-3xl mx-auto border-red-200 shadow-md">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="text-red-600 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading Pharmacy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
          <div className="mt-4 flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="flex items-center"
            >
              <Clock className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pharmacy Details</h1>
          <p className="text-slate-500">View and manage your pharmacy information</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => router.push('/pharmacy/edit')}
            className="flex items-center bg-purple-600 hover:bg-purple-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Pharmacy
          </Button>
        </div>
      </div>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-purple-600" />
              Pharmacy Profile
            </CardTitle>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {pharmacy?.status || 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Pharmacy Name</p>
                    <p className="text-base font-medium text-slate-800">{pharmacy?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Registration Number</p>
                    <p className="text-base font-medium text-slate-800">{pharmacy?.registrationNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Tax ID / VAT Number</p>
                    <p className="text-base font-medium text-slate-800">{pharmacy?.taxId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Established Date</p>
                    <p className="text-base font-medium text-slate-800">
                      {pharmacy?.establishedDate 
                        ? new Date(pharmacy.establishedDate).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Phone Number</p>
                      <p className="text-base font-medium text-slate-800">{pharmacy?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Email Address</p>
                      <p className="text-base font-medium text-slate-800">{pharmacy?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Website</p>
                      <p className="text-base font-medium text-slate-800">
                        {pharmacy?.website ? (
                          <a 
                            href={pharmacy.website.startsWith('http') ? pharmacy.website : `https://${pharmacy.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {pharmacy.website}
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Address</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-slate-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Physical Address</p>
                      <p className="text-base font-medium text-slate-800">
                        {pharmacy?.address?.street || 'N/A'}{pharmacy?.address?.street2 ? `, ${pharmacy.address.street2}` : ''}
                        <br />
                        {pharmacy?.address?.city || 'N/A'}{pharmacy?.address?.state ? `, ${pharmacy.address.state}` : ''} {pharmacy?.address?.postalCode || ''}
                        <br />
                        {pharmacy?.address?.country || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Operating Hours</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">Monday - Friday</p>
                    <p className="text-sm font-medium text-slate-800">
                      {pharmacy?.operatingHours?.weekdays || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">Saturday</p>
                    <p className="text-sm font-medium text-slate-800">
                      {pharmacy?.operatingHours?.saturday || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">Sunday</p>
                    <p className="text-sm font-medium text-slate-800">
                      {pharmacy?.operatingHours?.sunday || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">Holidays</p>
                    <p className="text-sm font-medium text-slate-800">
                      {pharmacy?.operatingHours?.holidays || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                  <p className="text-sm font-medium text-slate-500">Additional Information</p>
                    <p className="text-base font-medium text-slate-800">
                      {pharmacy?.additionalInfo || 'No additional information provided.'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Services Offered</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pharmacy?.services && pharmacy.services.length > 0 ? (
                        pharmacy.services.map((service: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                            {service}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-slate-600">No services listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">License Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">License Number</p>
                  <p className="text-base font-medium text-slate-800">{pharmacy?.license?.number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Issuing Authority</p>
                  <p className="text-base font-medium text-slate-800">{pharmacy?.license?.issuingAuthority || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Issue Date</p>
                  <p className="text-base font-medium text-slate-800">
                    {pharmacy?.license?.issueDate 
                      ? new Date(pharmacy.license.issueDate).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Expiry Date</p>
                  <p className="text-base font-medium text-slate-800">
                    {pharmacy?.license?.expiryDate 
                      ? new Date(pharmacy.license.expiryDate).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Banking Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Bank Name</p>
                  <p className="text-base font-medium text-slate-800">{pharmacy?.banking?.bankName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Account Name</p>
                  <p className="text-base font-medium text-slate-800">{pharmacy?.banking?.accountName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Account Number</p>
                  <p className="text-base font-medium text-slate-800">
                    {pharmacy?.banking?.accountNumber 
                      ? `xxxx-xxxx-${pharmacy.banking.accountNumber.slice(-4)}` 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Currency</p>
                  <p className="text-base font-medium text-slate-800">{pharmacy?.banking?.currency || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button 
          onClick={() => router.push('/pharmacy/edit')}
          className="flex items-center bg-purple-600 hover:bg-purple-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Pharmacy
        </Button>
      </div>
    </div>
  )
}