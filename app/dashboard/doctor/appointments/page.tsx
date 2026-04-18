'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, Loader2, Calendar, UserCircle2, CheckCircle2, XCircle } from 'lucide-react';
import { Appointment, User } from '@/types';

interface AppointmentWithRelations extends Appointment {
  patient?: User;
  doctor?: User;
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
        setError(fetchError.message || 'Error loading appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [router]);

  const stats = useMemo(() => {
    const pending = appointments.filter((appointment) => appointment.status === 'pending').length;
    const scheduled = appointments.filter((appointment) => appointment.status === 'scheduled').length;
    const completed = appointments.filter((appointment) => appointment.status === 'completed').length;
    const cancelled = appointments.filter((appointment) => appointment.status === 'cancelled').length;
    return { pending, scheduled, completed, cancelled };
  }, [appointments]);

  const updateStatus = async (appointmentId: string, status: 'pending' | 'scheduled' | 'completed' | 'cancelled') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setUpdatingId(appointmentId);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to update appointment');
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
    } catch (updateError: any) {
      setError(updateError.message || 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading appointments...
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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
          <p className="text-muted-foreground">View and manage your patient appointments</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-800">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No appointments found
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {new Date(appointment.appointment_date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                            appointment.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : appointment.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Patient: <span className="font-medium text-foreground">{appointment.patient?.full_name || appointment.patient_id}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Duration: {appointment.duration_minutes} minutes
                      </p>
                      {appointment.reason_for_visit && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Reason: {appointment.reason_for_visit}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground">Notes: {appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(appointment.id, 'scheduled')}
                            disabled={updatingId === appointment.id}
                          >
                            {updatingId === appointment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Accept'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => updateStatus(appointment.id, 'cancelled')}
                            disabled={updatingId === appointment.id}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {appointment.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(appointment.id, 'completed')}
                            disabled={updatingId === appointment.id}
                          >
                            {updatingId === appointment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Mark Completed'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => updateStatus(appointment.id, 'cancelled')}
                            disabled={updatingId === appointment.id}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
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
