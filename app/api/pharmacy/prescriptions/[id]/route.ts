import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prescriptionUpdateSchema } from '@/lib/validators';
import { getAuthToken, hasRole } from '@/lib/auth';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prescription = await db.prescriptions.getById(params.id);
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const currentUser = await db.users.getById(token);
    const isAuthorized =
      prescription.patient_id === token ||
      prescription.doctor_id === token ||
      hasRole(currentUser.role, ['admin', 'pharmacist']);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prescription,
    });
  } catch (error: any) {
    console.error('Get prescription error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch prescription' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prescription = await db.prescriptions.getById(params.id);
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Check authorization - pharmacist can update status to dispensed, doctor/admin can update anything
    const currentUser = await db.users.getById(token);
    const isAuthorized =
      hasRole(currentUser.role, ['doctor', 'admin']) ||
      (hasRole(currentUser.role, ['pharmacist']) && body.status === 'dispensed');

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = prescriptionUpdateSchema.parse(body);

    // Pharmacist can only update status to 'dispensed'
    let dataToUpdate = validatedData;
    if (hasRole(currentUser.role, ['pharmacist'])) {
      dataToUpdate = { status: 'dispensed' };
    }

    const updatedPrescription = await db.prescriptions.update(params.id, {
      ...dataToUpdate,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedPrescription,
      message: 'Prescription updated successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update prescription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prescription' },
      { status: 500 }
    );
  }
}