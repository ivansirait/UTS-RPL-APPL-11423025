'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, Loader2, UserCircle2, CalendarDays, Stethoscope } from 'lucide-react';
import { Appointment, User } from '@/types';

interface AppointmentWithRelations extends Appointment {
  patient?: User;
  doctor?: User;
}

interface PatientSummary {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  gender?: string;
  appointmentCount: number;
  lastAppointment?: string;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
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

    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();
        setAppointments(data.data || []);
      } catch (fetchError: any) {
        setError(fetchError.message || 'Error loading patients');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [router]);

  const patients = useMemo<PatientSummary[]>(() => {
    const map = new Map<string, PatientSummary>();

    appointments.forEach((appointment) => {
      const patient = appointment.patient;
      if (!patient) return;

      const existing = map.get(patient.id);
      const appointmentDate = appointment.appointment_date;
      if (existing) {
        existing.appointmentCount += 1;
        if (!existing.lastAppointment || new Date(appointmentDate) > new Date(existing.lastAppointment)) {
          existing.lastAppointment = appointmentDate;
        }
      } else {
        map.set(patient.id, {
          id: patient.id,
          full_name: patient.full_name,
          email: patient.email,
          phone: patient.phone,
          gender: patient.gender,
          appointmentCount: 1,
          lastAppointment: appointmentDate,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const aDate = a.lastAppointment ? new Date(a.lastAppointment).getTime() : 0;
      const bDate = b.lastAppointment ? new Date(b.lastAppointment).getTime() : 0;
      return bDate - aDate;
    });
  }, [appointments]);

  const stats = useMemo(() => ({
    totalPatients: patients.length,
    totalAppointments: appointments.length,
    activePatients: patients.filter((patient) => patient.appointmentCount > 1).length,
  }), [appointments.length, patients]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading patients...
      </div>
    );
  }

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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Patients</h1>
          <p className="text-muted-foreground">View your patient list based on appointment history</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-800">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <UserCircle2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Returning Patients</CardTitle>
              <Stethoscope className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePatients}</div>
            </CardContent>
          </Card>
        </div>

        {patients.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No patients found yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {patients.map((patient) => (
              <Card key={patient.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{patient.full_name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">Email: {patient.email}</p>
                      {patient.phone && <p className="text-sm text-muted-foreground mb-1">Phone: {patient.phone}</p>}
                      <p className="text-sm text-muted-foreground mb-1">Gender: {patient.gender || '-'}</p>
                      <p className="text-sm text-muted-foreground mb-1">Appointments: {patient.appointmentCount}</p>
                      <p className="text-sm text-muted-foreground">
                        Last appointment:{' '}
                        {patient.lastAppointment
                          ? new Date(patient.lastAppointment).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
