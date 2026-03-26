'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { Appointment } from '@/types';

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/appointments', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await res.json();
        setAppointments(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Error loading appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [router]);

  const cancelAppointment = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setCanceling(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (res.ok) {
        setAppointments(appointments.map(a => 
          a.id === id ? { ...a, status: 'cancelled' } : a
        ));
      } else {
        setError('Failed to cancel appointment');
      }
    } catch (err: any) {
      setError(err.message || 'Error canceling appointment');
    } finally {
      setCanceling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">MediTrack</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/patient">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
            <p className="text-muted-foreground">View and manage your scheduled appointments</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/patient/appointments/book">
              <PlusCircle className="w-4 h-4 mr-2" />
              Book New Appointment
            </Link>
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <p>Loading appointments...</p>
            </CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No appointments scheduled yet</p>
              <Button asChild>
                <Link href="/dashboard/patient/appointments/book">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Book Your First Appointment
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
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
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Duration: {appointment.duration_minutes} minutes
                      </p>
                      {appointment.reason_for_visit && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Reason:</span> {appointment.reason_for_visit}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      )}
                    </div>
                    {appointment.status === 'scheduled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelAppointment(appointment.id)}
                        disabled={canceling === appointment.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {canceling === appointment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
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