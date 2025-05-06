"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../../components/ui/table"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent } from "../../../../components/ui/card"
import { Eye, FileText, Loader2 } from "lucide-react"
import { formatDateTime } from "../../../../lib/utils"
import { useToast } from "../../../../components/ui/use-toast"
import { Patient, getPatients } from "../../../../lib/api/patients"

export function PatientList({ searchQuery }: { searchQuery: string }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const data = await getPatients({
          name: searchQuery || undefined
        })
        setPatients(data)
      } catch (error) {
        console.error("Failed to fetch patients:", error)
        toast({
          title: "Error",
          description: "Failed to load patients",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [searchQuery, toast])

  const viewPatient = (id: string) => {
    router.push(`/patients/${id}`)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p>Loading patients...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? "No patients match your search criteria." : "You haven't registered any patients yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Registered On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.email || "—"}</TableCell>
                <TableCell>{patient.gender || "—"}</TableCell>
                <TableCell>
                  {patient.dateOfBirth 
                    ? new Date(patient.dateOfBirth).toLocaleDateString() 
                    : "—"}
                </TableCell>
                <TableCell>{formatDateTime(patient.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => viewPatient(patient.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}