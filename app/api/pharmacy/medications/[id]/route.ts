import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicationSchema } from '@/lib/validators';
import { getAuthToken, hasRole } from '@/lib/auth';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const medication = await db.medications.getById(id);
    if (!medication) {
      return NextResponse.json(
        { success: false, error: 'Medication not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: medication,
    });
  } catch (error: any) {
    console.error('Get medication error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch medication' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = await db.users.getById(token);

    // Only admins and pharmacists can update medications (for inventory management)
    if (!hasRole(currentUser.role, ['admin', 'pharmacist'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const medication = await db.medications.getById(id);
    if (!medication) {
      return NextResponse.json(
        { success: false, error: 'Medication not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = medicationSchema.parse(body);

    const updatedMedication = await db.medications.update(id, {
      ...validatedData,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedMedication,
      message: 'Medication updated successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update medication error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update medication' },
      { status: 500 }
    );
  }
}
