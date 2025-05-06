"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { ArrowLeft, Edit, Calendar, User, Phone, Mail, MapPin, AlertCircle, FileText, Shield, Loader2 } from "lucide-react"
import { formatDateTime } from "../../../../lib/utils"
import { useToast } from "../../../../components/ui/use-toast"
import { PatientProfile } from "../components/patient-profile"
import { PatientMedicalHistory } from "../components/patient-medical-history"
import { PatientInsurance } from "../components/patient-insurance"
import { Patient, getPatient } from "../../../../lib/api/patients"

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true)
        const data = await getPatient(params.id as string)
        setPatient(data)
      } catch (error) {
        console.error("Failed to fetch patient:", error)
        toast({
          title: "Error",
          description: "Failed to load patient details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPatient()
    }
  }, [params.id, toast])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <h1 className="text-3xl font-bold tracking-tight">Loading patient details...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Patient not found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Patient not found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The patient you are looking for does not exist or has been removed.
              </p>
              <Button onClick={() => router.push('/patients')}>
                Return to Patient List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Helper function to split full name into first and last names
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(" ")
    const firstName = parts.shift() || ""
    const lastName = parts.join(" ") || ""
    return { firstName, lastName }
  }

  // Prepare patient data with firstName and lastName for PatientProfile
  const patientWithNames = {
    ...patient,
    ...splitName(patient.name),
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
        </div>
        <Button onClick={() => setActiveTab("profile")}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Gender:</span>
                <span>{patient.gender || "Not specified"}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Date of Birth:</span>
                <span>
                  {patient.dateOfBirth 
                    ? new Date(patient.dateOfBirth).toLocaleDateString() 
                    : "Not specified"}
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Phone:</span>
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Email:</span>
                <span>{patient.email || "Not specified"}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                <span className="text-muted-foreground mr-2">Address:</span>
                <span>{patient.address || "Not specified"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  Allergies
                </h4>
                <p className="text-sm mt-1">{patient.allergies || "No known allergies"}</p>
              </div>
              <div>
                <h4 className="font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  Medical Conditions
                </h4>
                <p className="text-sm mt-1">{patient.medicalConditions || "No known medical conditions"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{patient.emergencyContact || "No emergency contact provided"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="medical-history">
            <FileText className="h-4 w-4 mr-2" />
            Medical History
          </TabsTrigger>
          <TabsTrigger value="insurance">
            <Shield className="h-4 w-4 mr-2" />
            Insurance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Profile</CardTitle>
              <CardDescription>
                View and update patient's personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientProfile 
                patient={patientWithNames} 
                onUpdate={(updatedPatient) => setPatient(updatedPatient)} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medical-history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>
                View patient's medication and prescription history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientMedicalHistory patientId={patient.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insurance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>
                Manage patient's insurance plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientInsurance 
                patientId={patient.id} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
