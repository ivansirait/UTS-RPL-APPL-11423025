import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthToken, hasRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = await db.users.getById(token);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // Only admins can view analytics
    if (!hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Aggregate data snapshots for dashboard analytics.
    const allUsers = await db.users.getAll();
    const allAppointments = (await db.appointments.getAll(1000, 0)).data || [];
    const allRecords = (await db.medicalRecords.getAll(1000, 0)).data || [];
    const allPrescriptions = (await db.prescriptions.getAll(1000, 0)).data || [];
    const allPayments = (await db.payments.getAll(1000, 0)).data || [];

    const patients = allUsers.filter(u => u.role === 'patient');
    const doctors = allUsers.filter(u => u.role === 'doctor');
    const pharmacists = allUsers.filter(u => u.role === 'pharmacist');

    const completedAppointments = allAppointments.filter(a => a.status === 'completed');
    const cancelledAppointments = allAppointments.filter(a => a.status === 'cancelled');
    const totalRevenue = allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const doctorPerformance = doctors.map((doctor) => {
      const doctorAppointments = allAppointments.filter(a => a.doctor_id === doctor.id);
      const doctorCompleted = doctorAppointments.filter(a => a.status === 'completed').length;
      const completionRate = doctorAppointments.length
        ? Number(((doctorCompleted / doctorAppointments.length) * 100).toFixed(2))
        : 0;

      return {
        doctor_id: doctor.id,
        doctor_name: doctor.full_name,
        total_appointments: doctorAppointments.length,
        completed_appointments: doctorCompleted,
        completion_rate_percent: completionRate,
      };
    });

    const medicationMap = new Map<string, { medication_id: string; medication_name: string; total_prescribed: number }>();
    for (const prescription of allPrescriptions) {
      const medicationId = prescription.medication_id;
      const medicationName = prescription.medication?.name || 'Unknown';
      const current = medicationMap.get(medicationId);
      if (current) {
        current.total_prescribed += 1;
      } else {
        medicationMap.set(medicationId, {
          medication_id: medicationId,
          medication_name: medicationName,
          total_prescribed: 1,
        });
      }
    }
    const drugUsageTrends = Array.from(medicationMap.values())
      .sort((a, b) => b.total_prescribed - a.total_prescribed)
      .slice(0, 10);

    const analytics = {
      overview: {
        total_users: allUsers.length,
        total_patients: patients.length,
        total_doctors: doctors.length,
        total_pharmacists: pharmacists.length,
        total_admins: allUsers.filter(u => u.role === 'admin').length,
        total_appointments: allAppointments.length,
        total_medical_records: allRecords.length,
        total_prescriptions: allPrescriptions.length,
        total_payments: allPayments.length,
      },
      patient_outcomes: {
        completed_appointments: completedAppointments.length,
        cancelled_appointments: cancelledAppointments.length,
        appointment_completion_rate_percent: allAppointments.length
          ? Number(((completedAppointments.length / allAppointments.length) * 100).toFixed(2))
          : 0,
      },
      doctor_performance: doctorPerformance,
      drug_usage_trends: drugUsageTrends,
      financial_summary: {
        completed_payments: allPayments.filter(p => p.status === 'completed').length,
        pending_payments: allPayments.filter(p => p.status === 'pending').length,
        total_revenue: Number(totalRevenue.toFixed(2)),
      },
      summary: {
        message: 'Analytics data aggregated successfully',
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
