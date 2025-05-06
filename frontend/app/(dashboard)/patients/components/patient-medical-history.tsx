"use client"
import { useState, useEffect } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent } from "../../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { Loader2, FileText, Pill, Calendar, DollarSign } from "lucide-react"
import { formatDateTime, formatCurrency } from "../../../../lib/utils"
import { useToast } from "../../../../components/ui/use-toast"
import { getPatientMedicationHistory } from "../../../../lib/api/patients"

interface PatientMedicalHistoryProps {
  patientId: string
}

export function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
  const [history, setHistory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("prescriptions")
  const { toast } = useToast()

  useEffect(() => {
    const fetchMedicationHistory = async () => {
      try {
        setLoading(true)
        const data = await getPatientMedicationHistory(patientId)
        setHistory(data)
      } catch (error) {
        console.error("Failed to fetch medication history:", error)
        toast({
          title: "Error",
          description: "Failed to load medication history",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMedicationHistory()
  }, [patientId, toast])

  if (loading) {
    return (
        <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!history || (!history.prescriptions?.length && !history.dispensations?.length)) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Medical History</h3>
        <p className="text-muted-foreground text-center">
          This patient doesn't have any recorded prescriptions or dispensations yet.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prescriptions">
            <FileText className="h-4 w-4 mr-2" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="dispensations">
            <Pill className="h-4 w-4 mr-2" />
            Dispensations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="prescriptions" className="mt-4">
          {history.prescriptions?.length ? (
            <div className="space-y-4">
              {history.prescriptions.map((prescription: any) => (
                <Card key={prescription.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-slate-50 p-4 border-b">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Prescription #{prescription.prescriptionNumber}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDateTime(prescription.createdAt)}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/prescriptions/${prescription.id}`} target="_blank" rel="noopener noreferrer">
                            View Details
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-2">Prescribed Medications</h4>
                      <ul className="space-y-2">
                        {prescription.items.map((item: any) => (
                          <li key={item.id} className="text-sm">
                            <div className="flex justify-between">
                              <span>{item.product.name}</span>
                              <span className="font-medium">{item.quantity} {item.unit}</span>
                            </div>
                            <p className="text-muted-foreground text-xs mt-1">
                              {item.dosageInstructions}
                            </p>
                          </li>
                        ))}
                      </ul>
                      
                      {prescription.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-1">Notes</h4>
                          <p className="text-sm text-muted-foreground">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No prescriptions found for this patient.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="dispensations" className="mt-4">
          {history.dispensations?.length ? (
            <div className="space-y-4">
              {history.dispensations.map((dispensation: any) => (
                <Card key={dispensation.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-slate-50 p-4 border-b">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Dispensation #{dispensation.receiptNumber}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDateTime(dispensation.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <div className="text-sm font-medium">Total</div>
                            <div className="text-sm text-muted-foreground flex items-center justify-end">
                              <DollarSign className="h-3 w-3 mr-0.5" />
                              {formatCurrency(dispensation.totalAmount)}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/sales/${dispensation.id}`} target="_blank" rel="noopener noreferrer">
                              View Details
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium mb-2">Dispensed Medications</h4>
                      <ul className="space-y-2">
                        {dispensation.items.map((item: any) => (
                          <li key={item.id} className="text-sm">
                            <div className="flex justify-between">
                              <span>{item.product.name}</span>
                              <div className="text-right">
                                <span className="font-medium">{item.quantity} {item.unit}</span>
                                <div className="text-xs text-muted-foreground">
                                  {formatCurrency(item.unitPrice)} each
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      
                      {dispensation.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-1">Notes</h4>
                          <p className="text-sm text-muted-foreground">{dispensation.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Pill className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No dispensations found for this patient.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}