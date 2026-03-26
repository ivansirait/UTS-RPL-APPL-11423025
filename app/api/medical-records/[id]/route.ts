import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicalRecordSchema } from '@/lib/validators';
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

    const record = await db.medicalRecords.getById(params.id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Medical record not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const currentUser = await db.users.getById(token);
    const isAuthorized =
      record.patient_id === token ||
      record.doctor_id === token ||
      hasRole(currentUser.role, ['admin']);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    console.error('Get medical record error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch medical record' },
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

    const record = await db.medicalRecords.getById(params.id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Medical record not found' },
        { status: 404 }
      );
    }

    // Check authorization - doctor who created it or admin
    const currentUser = await db.users.getById(token);
    const isAuthorized =
      record.doctor_id === token ||
      hasRole(currentUser.role, ['admin']);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = medicalRecordSchema.parse(body);

    const updatedRecord = await db.medicalRecords.update(params.id, {
      ...validatedData,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedRecord,
      message: 'Medical record updated successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update medical record error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update medical record' },
      { status: 500 }
    );
  }
}
