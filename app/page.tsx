'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, FileText, Pill, CreditCard, BarChart3, CheckCircle2, XCircle } from 'lucide-react';

export default function Home() {
  // --- LOGIKA PENGECEKAN SUPABASE ---
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Mencoba mengambil data minimal dari tabel users
        const { data, error } = await supabaseClient.from('users').select('id').limit(1);
        
        if (error) {
          console.error('❌ Supabase Error:', error.message);
          alert('Koneksi Supabase Gagal: ' + error.message);
        } else {
          console.log('✅ Supabase Connected!', data);
        }
      } catch (err) {
        console.error('❌ Connection Crash:', err);
      }
    };

    checkConnection();
  }, []);
  // ----------------------------------

  const features = [
    {
      icon: Heart,
      title: 'Patient Management',
      description: 'Easy appointment scheduling and medical record access for patients',
    },
    {
      icon: Users,
      title: 'Doctor Dashboard',
      description: 'Manage appointments, view patient records, and prescribe medications',
    },
    {
      icon: FileText,
      title: 'Medical Records',
      description: 'Secure EHR system with complete medical history',
    },
    {
      icon: Pill,
      title: 'Pharmacy System',
      description: 'Prescription management and medication inventory tracking',
    },
    {
      icon: CreditCard,
      title: 'Payment Processing',
      description: 'Secure and easy payment handling for services',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Comprehensive reporting and analytics dashboard',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">MediTrack</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Register</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Healthcare Management Made Simple
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            MediTrack is a comprehensive healthcare management system for patients, doctors, and administrators.
            Manage appointments, medical records, prescriptions, and payments all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            Powerful Features for Healthcare Management
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to manage healthcare operations efficiently and securely.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 MediTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
