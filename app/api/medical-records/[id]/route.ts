import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicalRecordSchema } from '@/lib/validators';
import { getAuthToken, hasRole, verifyToken } from '@/lib/auth';
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

    const decoded = verifyToken(token);
    if (!decoded.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const record = await db.medicalRecords.getById(id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Medical record not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const currentUser = await db.users.getById(decoded.userId!);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    const isAuthorized =
      record.patient_id === decoded.userId ||
      record.doctor_id === decoded.userId ||
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

    const decoded = verifyToken(token);
    if (!decoded.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const record = await db.medicalRecords.getById(id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Medical record not found' },
        { status: 404 }
      );
    }

    // Check authorization - doctor who created it or admin
    const currentUser = await db.users.getById(decoded.userId!);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    const isAuthorized =
      record.doctor_id === decoded.userId ||
      hasRole(currentUser.role, ['admin']);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = medicalRecordSchema.parse(body);

    const updatedRecord = await db.medicalRecords.update(id, {
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
