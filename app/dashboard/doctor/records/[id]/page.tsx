'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Heart, FileText, UserCircle2, CalendarDays, Stethoscope } from 'lucide-react';
import { Appointment, MedicalRecord, User } from '@/types';

interface MedicalRecordDetail extends MedicalRecord {
  patient?: User;
  doctor?: User;
  appointment?: Appointment;
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground whitespace-pre-wrap">{value || '-'}</div>
    </div>
  );
}

export default function MedicalRecordDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [record, setRecord] = useState<MedicalRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/medical-records/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || 'Failed to load medical record');
        }

        const data = await response.json();
        setRecord(data.data);
      } catch (fetchError: any) {
        setError(fetchError.message || 'Failed to load medical record');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRecord();
    }
  }, [params.id, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading medical record...
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-foreground">MediTrack</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/doctor/records">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Records
              </Link>
            </Button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-800">{error || 'Medical record not found'}</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">MediTrack</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/doctor/records">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Records
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Medical Record Detail</h1>
          <p className="text-muted-foreground">Complete clinical notes and patient context</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient</CardTitle>
              <UserCircle2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-semibold">{record.patient?.full_name || '-'}</div>
              <div className="text-sm text-muted-foreground">{record.patient?.email || '-'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doctor</CardTitle>
              <Stethoscope className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-semibold">{record.doctor?.full_name || user.full_name}</div>
              <div className="text-sm text-muted-foreground">{record.doctor?.specialization || user.specialization || 'Doctor'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-semibold">{new Date(record.created_at).toLocaleDateString('id-ID')}</div>
              <div className="text-sm text-muted-foreground">{new Date(record.created_at).toLocaleTimeString('id-ID')}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Clinical Summary
            </CardTitle>
            <CardDescription>Medical record reference {record.id}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailRow label="Chief Complaint" value={record.chief_complaint} />
            <DetailRow label="Diagnosis" value={record.diagnosis} />
            <DetailRow label="History of Present Illness" value={record.history_of_present_illness} />
            <DetailRow label="Past Medical History" value={record.past_medical_history} />
            <DetailRow label="Medications" value={record.medications} />
            <DetailRow label="Allergies" value={record.allergies} />
            <DetailRow label="Physical Examination" value={record.physical_examination} />
            <DetailRow label="Lab Results" value={record.lab_results} />
            <DetailRow label="Treatment Plan" value={record.treatment_plan} />
            <DetailRow label="Notes" value={record.notes} />
          </CardContent>
        </Card>

        {record.appointment && (
          <Card>
            <CardHeader>
              <CardTitle>Linked Appointment</CardTitle>
              <CardDescription>Appointment that produced this medical record</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailRow label="Appointment Date" value={new Date(record.appointment.appointment_date).toLocaleString('id-ID')} />
              <DetailRow label="Duration" value={`${record.appointment.duration_minutes} minutes`} />
              <DetailRow label="Reason" value={record.appointment.reason_for_visit} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
