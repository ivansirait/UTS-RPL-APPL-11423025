import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointmentSchema } from '@/lib/validators';
import { getAuthToken, verifyToken, hasRole } from '@/lib/auth';
import { getPaginationParams } from '@/lib/api';
import { ZodError } from 'zod';

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
    if (!decoded.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const currentUser = await db.users.getById(decoded.userId!);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, offset } = getPaginationParams(searchParams);

    let appointments;
    let total = 0;

    if (currentUser.role === 'patient') {
      const result = await db.appointments.getByPatientId(decoded.userId!, limit, offset);
      appointments = result.data;
      total = result.count || 0;
    } else if (currentUser.role === 'doctor') {
      const result = await db.appointments.getByDoctorId(decoded.userId!, limit, offset);
      appointments = result.data;
      total = result.count || 0;
    } else if (currentUser.role === 'admin') {
      const result = await db.appointments.getAll(limit, offset);
      appointments = result.data;
      total = result.count || 0;
    } else {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointments,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const currentUser = await db.users.getById(decoded.userId!);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    if (!hasRole(currentUser.role, ['doctor', 'admin', 'patient'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = appointmentSchema.parse(body);

    if (currentUser.role === 'patient') {
      validatedData.patient_id = decoded.userId!;
    }

    const isAvailable = await db.appointments.checkAvailability(
      validatedData.doctor_id,
      validatedData.appointment_date
    );

    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: 'Selected appointment slot is not available' },
        { status: 409 }
      );
    }

    const appointment = await db.appointments.create({
      ...validatedData,
      status: currentUser.role === 'patient' ? 'pending' : 'scheduled',
    });

    return NextResponse.json(
      {
        success: true,
        data: appointment,
        message: 'Appointment created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create appointment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}