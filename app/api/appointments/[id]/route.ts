import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateAppointmentSchema } from '@/lib/validators';
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

    const appointment = await db.appointments.getById(params.id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check authorization: patient (owner), doctor (assigned), or admin
    const currentUser = await db.users.getById(token);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    const isAuthorized =
      appointment.patient_id === token ||
      appointment.doctor_id === token ||
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

    const appointment = await db.appointments.getById(params.id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const currentUser = await db.users.getById(token);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // Check authorization: doctor, admin, or patient (owner) can update
    const isAuthorized =
      appointment.doctor_id === token ||
      hasRole(currentUser.role, ['admin']) ||
      (appointment.patient_id === token && currentUser.role === 'patient');

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateAppointmentSchema.parse(body);

    // Jika pasien, batasi update hanya pada status (cancel) atau waktu (reschedule)
    if (currentUser.role === 'patient') {
      // Pasien hanya boleh mengubah status (misal ke 'cancelled') atau appointment_date & appointment_time
      const allowedFields = ['status', 'appointment_date', 'appointment_time'];
      const requestedFields = Object.keys(validatedData);
      const isOnlyAllowed = requestedFields.every(field => allowedFields.includes(field));
      if (!isOnlyAllowed) {
        return NextResponse.json(
          { success: false, error: 'Pasien hanya dapat membatalkan atau menjadwal ulang janji temu' },
          { status: 403 }
        );
      }

      // Jika mengubah waktu, validasi ketersediaan
      if (validatedData.appointment_date || validatedData.appointment_time) {
        const newDate = validatedData.appointment_date || appointment.appointment_date;
        const newTime = validatedData.appointment_time || appointment.appointment_time;
        const isAvailable = await db.appointments.checkAvailability(
          appointment.doctor_id,
          newDate,
          newTime,
          params.id // exclude current appointment from check
        );
        if (!isAvailable) {
          return NextResponse.json(
            { success: false, error: 'Jadwal dokter sudah terisi pada waktu tersebut' },
            { status: 409 }
          );
        }
      }

      // Jika pasien membatalkan, hanya status 'cancelled' yang diizinkan
      if (validatedData.status && validatedData.status !== 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'Pasien hanya dapat membatalkan janji temu (status cancelled)' },
          { status: 403 }
        );
      }
    }

    const updatedAppointment = await db.appointments.update(params.id, {
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

    const appointment = await db.appointments.getById(params.id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check authorization - doctor or admin can delete
    const currentUser = await db.users.getById(token);
    const isAuthorized =
      appointment.doctor_id === token ||
      hasRole(currentUser.role, ['admin']);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await db.appointments.delete(params.id);
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