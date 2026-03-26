'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, FileText, Pill, CreditCard, LogOut, PlusCircle } from 'lucide-react';
import { User, Appointment, MedicalRecord, Prescription, Payment } from '@/types';

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
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

      // Fetch data from APIs
      const fetchData = async () => {
        try {
          // Asumsikan token disimpan di localStorage dengan key 'token'
          const token = localStorage.getItem('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          const [appointmentsRes, recordsRes, prescriptionsRes, paymentsRes] = await Promise.all([
            fetch('/api/appointments', { headers }),
            fetch('/api/medical-records', { headers }).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
            fetch('/api/prescriptions', { headers }).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
            fetch('/api/payments', { headers }).catch(() => ({ ok: false, json: () => ({ data: [] }) })),
          ]);

          const appointmentsData = appointmentsRes.ok ? (await appointmentsRes.json()).data : [];
          const recordsData = recordsRes.ok ? (await recordsRes.json()).data : [];
          const prescriptionsData = prescriptionsRes.ok ? (await prescriptionsRes.json()).data : [];
          const paymentsData = paymentsRes.ok ? (await paymentsRes.json()).data : [];

          setAppointments(appointmentsData);
          setMedicalRecords(recordsData);
          setPrescriptions(prescriptionsData);
          setPayments(paymentsData);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } catch (error) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Hapus token juga
    router.push('/');
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled').length;
  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  const stats = [
    {
      label: 'Upcoming Appointments',
      value: upcomingAppointments,
      icon: Calendar,
    },
    {
      label: 'Medical Records',
      value: medicalRecords.length,
      icon: FileText,
    },
    {
      label: 'Active Prescriptions',
      value: activePrescriptions,
      icon: Pill,
    },
    {
      label: 'Pending Payments',
      value: pendingPayments,
      icon: CreditCard,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">MediTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium text-foreground">{user.full_name}</div>
              <div className="text-muted-foreground capitalize">{user.role}</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user.full_name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Manage your appointments, medical records, and health information</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Schedule and manage your appointments with doctors</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button className="w-full" asChild>
                <Link href="/dashboard/patient/appointments">View Appointments</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/patient/appointments/book">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Book New Appointment
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>Access your medical history and health records</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/dashboard/patient/records">View Records</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>View your current and past prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/dashboard/patient/prescriptions">View Prescriptions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>Manage your payments and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/dashboard/patient/payments">View Payments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link href="/dashboard/patient/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}