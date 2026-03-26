import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthToken, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // VERIFIKASI TOKEN - ini yang penting!
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id; // Ambil ID dari token yang sudah diverifikasi
    const userRole = decoded.role;

    let medicalRecords;
    
    if (userRole === 'patient') {
      // Pasien hanya bisa melihat rekam medis mereka sendiri
      medicalRecords = await db.medicalRecords.getByPatientId(userId);
    } else if (userRole === 'doctor') {
      // Dokter bisa melihat rekam medis pasien mereka
      medicalRecords = await db.medicalRecords.getByDoctorId(userId);
    } else if (userRole === 'admin') {
      // Admin bisa melihat semua
      medicalRecords = await db.medicalRecords.getAll();
    } else {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: medicalRecords,
    });
  } catch (error: any) {
    console.error('Get medical records error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch medical records' },
      { status: 500 }
    );
  }
}