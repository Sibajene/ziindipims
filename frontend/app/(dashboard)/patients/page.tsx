'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Button } from '../../../components/ui/button'
import { PlusCircle, FileText, Users, ClipboardList, FileCheck2, Search } from 'lucide-react'
import { Input } from '../../../components/ui/input'
import { PatientList } from './components/patient-list'
import { PatientRegistration } from './components/patient-registration'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import Link from 'next/link'
import { Card, CardContent } from '../../../components/ui/card'
import { formatDate } from '../../../lib/utils'
import { Patient, getPatients } from '../../../lib/api/patients'
import { useToast } from '../../../components/ui/use-toast'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true)
        const data = await getPatients({
          name: searchQuery || undefined
        })
        setPatients(data)
      } catch (error) {
        console.error('Failed to fetch patients', error)
        toast({
          title: "Error",
          description: "Failed to load patients",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPatients()
  }, [searchQuery, toast])
  
  const filteredPatients = patients.filter(patient => {
    // First apply search filter
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (patient.insuranceNumber && patient.insuranceNumber.includes(searchQuery));
    
    // Then apply tab filter
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return patient.status === 'active';
    if (activeTab === 'inactive') return patient.status === 'inactive';
    if (activeTab === 'recent') {
      if (!patient.lastVisit) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(patient.lastVisit) >= thirtyDaysAgo;
    }
    
    return true;
  });
  
  const recentPatients = patients.filter(patient => {
    if (!patient.lastVisit) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(patient.lastVisit) >= thirtyDaysAgo;
  });
  
  const activePatients = patients.filter(patient => patient.status === 'active');
  const inactivePatients = patients.filter(patient => patient.status === 'inactive');
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">View and manage patient records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsRegistrationOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients by name, phone, email or insurance number..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">Loading patients...</div>
      ) : (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                All Patients ({patients.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center">
                <FileCheck2 className="mr-2 h-4 w-4" />
                Active ({activePatients.length})
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" />
                Recent Visits ({recentPatients.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Inactive ({inactivePatients.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <LocalPatientTable patients={filteredPatients} />
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            <LocalPatientTable patients={filteredPatients} />
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            <LocalPatientTable patients={filteredPatients} />
          </TabsContent>
          
          <TabsContent value="inactive" className="mt-0">
            <LocalPatientTable patients={filteredPatients} />
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
          </DialogHeader>
          <PatientRegistration 
            onSuccess={() => {
              setIsRegistrationOpen(false);
              // Refresh the patient list
              const fetchPatients = async () => {
                try {
                  setIsLoading(true);
                  const data = await getPatients();
                  setPatients(data);
                } catch (error) {
                  console.error('Failed to fetch patients', error);
                  toast({
                    title: "Error",
                    description: "Failed to refresh patient list",
                    variant: "destructive",
                  });
                } finally {
                  setIsLoading(false);
                }
              };
              fetchPatients();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LocalPatientTable({ patients }: { patients: Patient[] }) {
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-slate-50">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          No patients match your current filters. Try adjusting your search criteria or add a new patient.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Contact</th>
                <th className="text-left py-3 px-4">Date of Birth</th>
                <th className="text-left py-3 px-4">Gender</th>
                <th className="text-left py-3 px-4">Insurance</th>
                <th className="text-left py-3 px-4">Last Visit</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <Link href={`/patients/${patient.id}`} className="text-blue-600 hover:underline">
                      {patient.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div>{patient.phone}</div>
                    <div className="text-xs text-slate-500">{patient.email}</div>
                  </td>
                  <td className="py-3 px-4">{formatDate(patient.dateOfBirth)}</td>
                  <td className="py-3 px-4">{patient.gender}</td>
                  <td className="py-3 px-4">
                    {patient.insuranceProvider ? (
                      <div>
                        <div>{patient.insuranceProvider}</div>
                        <div className="text-xs text-slate-500">{patient.insuranceNumber}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {patient.lastVisit ? (
                      formatDate(patient.lastVisit)
                    ) : (
                      <span className="text-slate-500">No visits</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                      patient.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {patient.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}