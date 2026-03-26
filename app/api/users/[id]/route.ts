import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userUpdateSchema } from '@/lib/validators';
import { getAuthToken, hasRole, hashPassword } from '@/lib/auth';
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

    const user = await db.users.getById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Users can only view their own profile or admins can view anyone
    const currentUser = await db.users.getById(token);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    if (token !== params.id && !hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { password_hash, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user' },
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

    // Users can only update their own profile or admins can update anyone
    const currentUser = await db.users.getById(token);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    if (token !== params.id && !hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    const updates: any = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    if (body.password && typeof body.password === 'string' && body.password.length >= 6) {
      updates.password_hash = await hashPassword(body.password);
    }

    const updatedUser = await db.users.update(params.id, updates);

    const { password_hash, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'User updated successfully',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
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

    // Only admins can delete users
    const currentUser = await db.users.getById(token);
    if (!hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await db.users.delete(params.id);
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
