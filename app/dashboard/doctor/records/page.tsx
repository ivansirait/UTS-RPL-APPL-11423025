'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heart, ArrowLeft, Loader2, FileText, UserCircle2, CalendarDays, ChevronRight } from 'lucide-react';
import { Appointment, MedicalRecord, User } from '@/types';

interface MedicalRecordWithRelations extends MedicalRecord {
  patient?: User;
  doctor?: User;
  appointment?: Appointment;
}

export default function DoctorMedicalRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecordWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    chief_complaint: '',
    history_of_present_illness: '',
    past_medical_history: '',
    medications: '',
    allergies: '',
    physical_examination: '',
    lab_results: '',
    diagnosis: '',
    treatment_plan: '',
    notes: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      router.push('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'doctor') {
        router.push('/');
        return;
      }
      setUser(parsedUser);
    } catch {
      router.push('/auth/login');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const fetchData = async () => {
      try {
        const [patientsResponse, appointmentsResponse, recordsResponse] = await Promise.all([
          fetch('/api/users?role=patient', { headers }),
          fetch('/api/appointments', { headers }),
          fetch('/api/medical-records', { headers }),
        ]);

        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData.data || []);
        }

        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          setAppointments(appointmentsData.data || []);
        }

        if (recordsResponse.ok) {
          const recordsData = await recordsResponse.json();
          setRecords(recordsData.data || []);
        }
      } catch (fetchError: any) {
        setError(fetchError.message || 'Failed to load medical records');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      appointment_id: '',
      chief_complaint: '',
      history_of_present_illness: '',
      past_medical_history: '',
      medications: '',
      allergies: '',
      physical_examination: '',
      lab_results: '',
      diagnosis: '',
      treatment_plan: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token || !user) {
      setError('Authentication required');
      setSubmitting(false);
      return;
    }

    if (!formData.patient_id) {
      setError('Please select a patient');
      setSubmitting(false);
      return;
    }

    if (formData.chief_complaint.trim().length < 5) {
      setError('Chief complaint must be at least 5 characters');
      setSubmitting(false);
      return;
    }

    try {
      const payload: Record<string, string> = {
        patient_id: formData.patient_id,
        chief_complaint: formData.chief_complaint.trim(),
      };

      if (formData.appointment_id) payload.appointment_id = formData.appointment_id;
      if (formData.history_of_present_illness.trim()) payload.history_of_present_illness = formData.history_of_present_illness.trim();
      if (formData.past_medical_history.trim()) payload.past_medical_history = formData.past_medical_history.trim();
      if (formData.medications.trim()) payload.medications = formData.medications.trim();
      if (formData.allergies.trim()) payload.allergies = formData.allergies.trim();
      if (formData.physical_examination.trim()) payload.physical_examination = formData.physical_examination.trim();
      if (formData.lab_results.trim()) payload.lab_results = formData.lab_results.trim();
      if (formData.diagnosis.trim()) payload.diagnosis = formData.diagnosis.trim();
      if (formData.treatment_plan.trim()) payload.treatment_plan = formData.treatment_plan.trim();
      if (formData.notes.trim()) payload.notes = formData.notes.trim();

      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const createdRecord = await response.json();
        setRecords((prev) => [createdRecord.data, ...prev]);
        setSuccess('Medical record created successfully');
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create medical record');
      }
    } catch (submitError: any) {
      setError(submitError.message || 'Error creating medical record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading medical records...
      </div>
    );
  }

  const recordCount = records.length;
  const uniquePatients = new Set(records.map((record) => record.patient_id)).size;
  const linkedAppointments = records.filter((record) => record.appointment_id).length;
  const patientNameMap = new Map(patients.map((patient) => [patient.id, patient.full_name]));

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">MediTrack</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/doctor">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Medical Records</h1>
          <p className="text-muted-foreground">Create and view medical records</p>
        </div>

        {(error || success) && (
          <Card className={error ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <CardContent className="pt-6">
              <p className={error ? 'text-red-800' : 'text-green-800'}>{error || success}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recordCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients Covered</CardTitle>
              <UserCircle2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniquePatients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Linked Appointments</CardTitle>
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{linkedAppointments}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Medical Record</CardTitle>
              <CardDescription>Fill in the patient diagnosis and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_id">Patient *</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => handleSelectChange('patient_id', value)}>
                    <SelectTrigger id="patient_id">
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name} - {patient.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment_id">Related Appointment (optional)</Label>
                  <Select value={formData.appointment_id} onValueChange={(value) => handleSelectChange('appointment_id', value)}>
                    <SelectTrigger id="appointment_id">
                      <SelectValue placeholder="Link to an appointment" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointments.map((appointment) => (
                        <SelectItem key={appointment.id} value={appointment.id}>
                          {new Date(appointment.appointment_date).toLocaleDateString('id-ID')} - {appointment.reason_for_visit || 'No reason'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chief_complaint">Chief Complaint *</Label>
                  <Textarea
                    id="chief_complaint"
                    name="chief_complaint"
                    value={formData.chief_complaint}
                    onChange={handleInputChange}
                    placeholder="Primary complaint or symptom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="history_of_present_illness">History of Present Illness</Label>
                  <Textarea
                    id="history_of_present_illness"
                    name="history_of_present_illness"
                    value={formData.history_of_present_illness}
                    onChange={handleInputChange}
                    placeholder="Onset, duration, severity, and associated symptoms"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="past_medical_history">Past Medical History</Label>
                  <Textarea
                    id="past_medical_history"
                    name="past_medical_history"
                    value={formData.past_medical_history}
                    onChange={handleInputChange}
                    placeholder="Relevant prior conditions or surgeries"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Medications</Label>
                  <Textarea
                    id="medications"
                    name="medications"
                    value={formData.medications}
                    onChange={handleInputChange}
                    placeholder="Current medications"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="Known allergies"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="physical_examination">Physical Examination</Label>
                  <Textarea
                    id="physical_examination"
                    name="physical_examination"
                    value={formData.physical_examination}
                    onChange={handleInputChange}
                    placeholder="Vitals and exam findings"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lab_results">Lab Results</Label>
                  <Textarea
                    id="lab_results"
                    name="lab_results"
                    value={formData.lab_results}
                    onChange={handleInputChange}
                    placeholder="Laboratory and imaging results"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Primary diagnosis"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment_plan">Treatment Plan</Label>
                  <Textarea
                    id="treatment_plan"
                    name="treatment_plan"
                    value={formData.treatment_plan}
                    onChange={handleInputChange}
                    placeholder="Plan, therapy, and follow-up"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Create Medical Record'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Records</CardTitle>
              <CardDescription>View records created by this doctor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[1200px] overflow-y-auto">
              {records.length === 0 ? (
                <p className="text-sm text-muted-foreground">No medical records found yet.</p>
              ) : (
                records.map((record) => (
                  <div key={record.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {record.patient?.full_name || patientNameMap.get(record.patient_id) || 'Unknown patient'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/doctor/records/${record.id}`}>
                          View Detail
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>

                    <p className="text-sm"><span className="font-medium">Chief complaint:</span> {record.chief_complaint || '-'}</p>
                    {record.diagnosis && <p className="text-sm"><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>}
                    {record.treatment_plan && <p className="text-sm"><span className="font-medium">Treatment:</span> {record.treatment_plan}</p>}
                    {record.lab_results && <p className="text-sm"><span className="font-medium">Lab:</span> {record.lab_results}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
