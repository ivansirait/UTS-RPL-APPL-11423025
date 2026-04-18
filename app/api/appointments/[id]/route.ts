import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateAppointmentSchema } from '@/lib/validators';
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

    const appointment = await db.appointments.getById(id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check authorization: patient (owner), doctor (assigned), or admin
    const currentUser = await db.users.getById(decoded.userId!);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    const isAuthorized =
      appointment.patient_id === decoded.userId ||
      appointment.doctor_id === decoded.userId ||
      hasRole(currentUser.role, ['admin']);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    console.error('Get appointment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch appointment' },
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

    const appointment = await db.appointments.getById(id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const currentUser = await db.users.getById(decoded.userId!);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // Check authorization: doctor, admin, or patient (owner) can update
    const isAuthorized =
      appointment.doctor_id === decoded.userId ||
      hasRole(currentUser.role, ['admin']) ||
      (appointment.patient_id === decoded.userId && currentUser.role === 'patient');

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateAppointmentSchema.parse(body);

    // Restrict patient updates to cancellation and rescheduling only.
    if (currentUser.role === 'patient') {
      const allowedFields = ['status', 'appointment_date'];
      const requestedFields = Object.keys(validatedData);
      const isOnlyAllowed = requestedFields.every(field => allowedFields.includes(field));
      if (!isOnlyAllowed) {
        return NextResponse.json(
          { success: false, error: 'Patients can only cancel or reschedule appointments' },
          { status: 403 }
        );
      }

      if (validatedData.appointment_date) {
        const newDate = validatedData.appointment_date || appointment.appointment_date;
        const isAvailable = await db.appointments.checkAvailability(
          appointment.doctor_id,
          newDate,
          id // exclude current appointment from check
        );
        if (!isAvailable) {
          return NextResponse.json(
            { success: false, error: 'Selected appointment slot is not available' },
            { status: 409 }
          );
        }
      }

      if (validatedData.status && validatedData.status !== 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'Patients can only set status to cancelled' },
          { status: 403 }
        );
      }
    }

    const updatedAppointment = await db.appointments.update(id, {
      ...validatedData,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedAppointment,
      message: 'Appointment updated successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update appointment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const appointment = await db.appointments.getById(id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check authorization - doctor or admin can delete
    const currentUser = await db.users.getById(decoded.userId!);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }
    const isAuthorized =
      appointment.doctor_id === decoded.userId ||
      hasRole(currentUser.role, ['admin']);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await db.appointments.delete(id);
    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete appointment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}