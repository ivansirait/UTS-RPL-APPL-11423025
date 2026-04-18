import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentSchema } from '@/lib/validators';
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
      result = await db.payments.getByPatientId(decoded.userId!, limit, offset);
    } else if (currentUser.role === 'admin') {
      result = await db.payments.getAll(limit, offset);
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
    console.error('Get payments error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payments' },
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

    if (!hasRole(currentUser.role, ['patient', 'admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    const dataToCreate =
      currentUser.role === 'patient'
        ? {
            ...validatedData,
            patient_id: decoded.userId!,
            status: 'pending',
          }
        : {
            ...validatedData,
            status: validatedData.amount > 0 ? 'pending' : 'failed',
          };

    const payment = await db.payments.create(dataToCreate);

    return NextResponse.json(
      {
        success: true,
        data: payment,
        message: 'Payment created successfully',
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

    console.error('Create payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}