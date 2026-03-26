import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicationSchema } from '@/lib/validators';
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

    // Any authenticated user can view medications
    const medications = await db.medications.getAll();

    return NextResponse.json({
      success: true,
      data: medications,
    });
  } catch (error: any) {
    console.error('Get medications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch medications' },
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

    // Only admins, doctors, and pharmacists can create medications
    if (!hasRole(currentUser.role, ['doctor', 'admin', 'pharmacist'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = medicationSchema.parse(body);

    const medication = await db.medications.create(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: medication,
        message: 'Medication created successfully',
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

    console.error('Create medication error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create medication' },
      { status: 500 }
    );
  }
}
