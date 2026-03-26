import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prescriptionSchema } from '@/lib/validators';
import { getAuthToken, hasRole } from '@/lib/auth';
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

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    const currentUser = await db.users.getById(token);

    // Patients can only view their own prescriptions
    let patientIdToFetch = patientId;
    if (currentUser.role === 'patient') {
      patientIdToFetch = token;
    } else if (patientId && currentUser.role === 'patient' && patientId !== token) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!patientIdToFetch) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const prescriptions = await db.prescriptions.getByPatientId(patientIdToFetch);

    return NextResponse.json({
      success: true,
      data: prescriptions,
    });
  } catch (error: any) {
    console.error('Get prescriptions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch prescriptions' },
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

    const currentUser = await db.users.getById(token);

    // Only doctors and admins can create prescriptions
    if (!hasRole(currentUser.role, ['doctor', 'admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = prescriptionSchema.parse(body);

    // If doctor, set themselves as the doctor_id
    const dataToCreate =
      currentUser.role === 'doctor'
        ? { ...validatedData, doctor_id: token }
        : validatedData;

    const prescription = await db.prescriptions.create(dataToCreate);

    return NextResponse.json(
      {
        success: true,
        data: prescription,
        message: 'Prescription created successfully',
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

    console.error('Create prescription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}
