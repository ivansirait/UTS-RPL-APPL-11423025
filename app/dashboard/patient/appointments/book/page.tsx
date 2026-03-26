'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { User } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Doctor extends User {
  specialization?: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 30,
    reason_for_visit: '',
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
      if (parsedUser.role !== 'patient') {
        router.push('/');
        return;
      }
      setUser(parsedUser);

      // Fetch doctors
      const fetchDoctors = async () => {
        try {
          const res = await fetch('/api/users?role=doctor', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setDoctors(data.data || []);
          }
        } catch (err) {
          console.error('Error fetching doctors:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchDoctors();
    } catch (error) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token || !user) {
      setError('Authentication required');
      setSubmitting(false);
      return;
    }

    // Validasi
    if (!formData.doctor_id) {
      setError('Please select a doctor');
      setSubmitting(false);
      return;
    }

    if (!formData.appointment_date) {
      setError('Please select appointment date and time');
      setSubmitting(false);
      return;
    }

    if (formData.reason_for_visit.trim().length < 3) {
      setError('Reason for visit must be at least 3 characters');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: formData.doctor_id,
          appointment_date: formData.appointment_date,
          duration_minutes: formData.duration_minutes,
          reason_for_visit: formData.reason_for_visit,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        router.push('/dashboard/patient/appointments?success=booked');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to book appointment');
      }
    } catch (err: any) {
      setError(err.message || 'Error booking appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">MediTrack</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/patient/appointments">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appointments
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book an Appointment</h1>
          <p className="text-muted-foreground">Schedule a consultation with a doctor</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Fill in the information below to book your appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Doctor Selection */}
              <div className="space-y-2">
                <Label htmlFor="doctor_id">Select a Doctor *</Label>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <p className="text-sm text-muted-foreground">Loading doctors...</p>
                  </div>
                ) : doctors.length === 0 ? (
                  <p className="text-sm text-red-600">No doctors available at the moment</p>
                ) : (
                  <Select value={formData.doctor_id} onValueChange={(value) => handleSelectChange('doctor_id', value)}>
                    <SelectTrigger id="doctor_id">
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.full_name}
                          {doctor.specialization && ` - ${doctor.specialization}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Appointment Date */}
              <div className="space-y-2">
                <Label htmlFor="appointment_date">Date & Time *</Label>
                <Input
                  id="appointment_date"
                  type="datetime-local"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Select a future date and time</p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                <Select
                  value={formData.duration_minutes.toString()}
                  onValueChange={(value) => handleSelectChange('duration_minutes', value)}
                >
                  <SelectTrigger id="duration_minutes">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reason for Visit */}
              <div className="space-y-2">
                <Label htmlFor="reason_for_visit">Reason for Visit *</Label>
                <Textarea
                  id="reason_for_visit"
                  name="reason_for_visit"
                  placeholder="Describe your symptoms or the reason for your visit..."
                  value={formData.reason_for_visit}
                  onChange={handleInputChange}
                  required
                  minLength={3}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.reason_for_visit.length}/200 characters
                </p>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional information you'd like to share..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || loading || doctors.length === 0}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
