"use client"
import { useState } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent } from "../../../../components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../../../../components/ui/dialog"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../../components/ui/form"
import { Input } from "../../../../components/ui/input"
import { Textarea } from "../../../../components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../../../components/ui/select"
import { Loader2, User, Phone, Mail, MapPin, Calendar, Edit } from "lucide-react"
import { formatDate } from "../../../../lib/utils"
import { useToast } from "../../../../components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updatePatient } from "../../../../lib/api/patients"

interface PatientProfileProps {
  patient: any
  onUpdate: (updatedPatient: any) => void
}

// Form schema for updating patient
const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  notes: z.string().optional(),
})

type PatientFormValues = z.infer<typeof patientSchema>

export function PatientProfile({ patient, onUpdate }: PatientProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email || "",
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
      gender: patient.gender,
      address: patient.address || "",
      city: patient.city || "",
      state: patient.state || "",
      postalCode: patient.postalCode || "",
      allergies: patient.allergies || "",
      medicalConditions: patient.medicalConditions || "",
      notes: patient.notes || "",
    },
  })

  const onSubmit = async (values: PatientFormValues) => {
    try {
      setIsSubmitting(true)
      const updatedPatient = await updatePatient(patient.id, values)
      onUpdate(updatedPatient)
      toast({
        title: "Success",
        description: "Patient information updated successfully",
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Failed to update patient:", error)
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Patient Information</h3>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Personal Information</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              </div>
              
              {patient.email && (
                <div className="flex items-start">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium">
                    {patient.gender === "MALE" ? "Male" : 
                     patient.gender === "FEMALE" ? "Female" : 
                     patient.gender === "OTHER" ? "Other" : "Prefer not to say"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Address</h4>
            <div className="space-y-3">
              {(patient.address || patient.city || patient.state || patient.postalCode) ? (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {patient.address && <span>{patient.address}<br /></span>}
                      {patient.city && patient.state && (
                        <span>{patient.city}, {patient.state} {patient.postalCode}</span>
                      )}
                      {patient.city && !patient.state && (
                        <span>{patient.city} {patient.postalCode}</span>
                      )}
                      {!patient.city && patient.state && (
                        <span>{patient.state} {patient.postalCode}</span>
                      )}
                      {!patient.city && !patient.state && patient.postalCode && (
                        <span>{patient.postalCode}</span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No address information provided</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Medical Information</h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Allergies</p>
                {patient.allergies ? (
                  <p className="text-sm">{patient.allergies}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No allergies recorded</p>
                )}
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Medical Conditions</p>
                {patient.medicalConditions ? (
                  <p className="text-sm">{patient.medicalConditions}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No medical conditions recorded</p>
                )}
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                {patient.notes ? (
                  <p className="text-sm">{patient.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No additional notes</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Patient Information</DialogTitle>
          <DialogDescription>
            Update the patient's personal and medical information.
          </DialogDescription>
        </DialogHeader>
          
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                          <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="List any allergies the patient has"
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="medicalConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="List any medical conditions the patient has"
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Any additional notes about the patient"
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="sticky bottom-0 pt-2 bg-background">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}