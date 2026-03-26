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

    // Only admins can view analytics
    if (!hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get all users
    const allUsers = await db.users.getAll();
    const patients = allUsers.filter(u => u.role === 'patient');
    const doctors = allUsers.filter(u => u.role === 'doctor');

    // Calculate statistics
    const analytics = {
      overview: {
        total_users: allUsers.length,
        total_patients: patients.length,
        total_doctors: doctors.length,
        total_admins: allUsers.filter(u => u.role === 'admin').length,
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
