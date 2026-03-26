import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthToken, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // VERIFIKASI TOKEN
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const userRole = decoded.role;

    let payments;
    
    if (userRole === 'patient') {
      payments = await db.payments.getByPatientId(userId);
    } else if (userRole === 'admin') {
      payments = await db.payments.getAll();
    } else {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}