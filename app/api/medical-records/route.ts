import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { medicalRecordSchema } from '@/lib/validators';
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

    const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

    let result;

    if (currentUser.role === 'patient') {
      result = await db.medicalRecords.getByPatientId(decoded.userId!, limit, offset);
    } else if (currentUser.role === 'doctor') {
      result = await db.medicalRecords.getByDoctorId(decoded.userId!, limit, offset);
    } else if (currentUser.role === 'admin') {
      result = await db.medicalRecords.getAll(limit, offset);
    } else {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        page,
        limit,
        total: result.count || 0,
        pages: Math.ceil((result.count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Get medical records error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch medical records' },
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

    if (!hasRole(currentUser.role, ['doctor', 'admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = medicalRecordSchema.parse(
      currentUser.role === 'doctor'
        ? { ...body, doctor_id: decoded.userId! }
        : body
    );

    const dataToCreate = validatedData;

    const record = await db.medicalRecords.create(dataToCreate);

    return NextResponse.json(
      {
        success: true,
        data: record,
        message: 'Medical record created successfully',
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

    console.error('Create medical record error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create medical record' },
      { status: 500 }
    );
  }
}