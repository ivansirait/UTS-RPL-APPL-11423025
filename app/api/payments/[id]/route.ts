import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthToken, hasRole } from '@/lib/auth';

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

    const payment = await db.payments.getById(params.id);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const currentUser = await db.users.getById(token);
    const isAuthorized =
      payment.patient_id === token ||
      hasRole(currentUser.role, ['admin']);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payment' },
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

    const currentUser = await db.users.getById(token);

    // Only admins can update payment status
    if (!hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const payment = await db.payments.getById(params.id);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    const updatedPayment = await db.payments.update(params.id, {
      status,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: 'Payment updated successfully',
    });
  } catch (error: any) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update payment' },
      { status: 500 }
    );
  }
}
