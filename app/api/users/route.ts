import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthToken, verifyToken, hasRole } from '@/lib/auth';
import { userCreateSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/auth';

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

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');

    let users;

    if (role === 'doctor' && currentUser.role === 'patient') {
      // Patient can view doctors for booking
      users = await db.users.getAll('doctor');
    } else if (role === 'patient' && hasRole(currentUser.role, ['doctor', 'admin'])) {
      // Doctor and admin can view patients for records and care workflows
      users = await db.users.getAll('patient');
    } else {
      // Only admin can query arbitrary user data
      if (!hasRole(currentUser.role, ['admin'])) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - Only admin can access' },
          { status: 403 }
        );
      }

      if (role) {
        users = await db.users.getAll(role);
      } else {
        users = await db.users.getAll();
      }
    }

    // Remove password hash from response
    const safeUsers = users.map((user: any) => {
      const { password_hash, ...rest } = user;
      return rest;
    });

    return NextResponse.json({
      success: true,
      data: safeUsers,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
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

    if (!hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admin can access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = userCreateSchema.parse(body);

    const existingUser = await db.users.getByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(validatedData.password);

    const newUser = await db.users.create({
      email: validatedData.email,
      password_hash,
      full_name: validatedData.full_name,
      role: validatedData.role,
      phone: validatedData.phone || null,
      date_of_birth: validatedData.date_of_birth || null,
      gender: validatedData.gender || null,
      address: validatedData.address || null,
      city: validatedData.city || null,
      state: validatedData.state || null,
      postal_code: validatedData.postal_code || null,
      country: validatedData.country || null,
      specialization: validatedData.specialization || null,
      license_number: validatedData.license_number || null,
      department_id: validatedData.department_id || null,
      is_active: true,
    });

    const { password_hash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        data: userWithoutPassword,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError' || error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: (error as any).errors || error.message },
        { status: 400 }
      );
    }
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}