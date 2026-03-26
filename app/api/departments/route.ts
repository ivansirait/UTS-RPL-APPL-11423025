import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthToken, hasRole } from '@/lib/auth';
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

    const currentUser = await db.users.getById(token);

    // Only admins can view departments
    if (!hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, offset } = getPaginationParams(searchParams);

    const departments = await db.departments.getAll();

    // Apply pagination
    const total = departments.length;
    const paginatedDepartments = departments.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedDepartments,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch departments' },
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

    const currentUser = await db.users.getById(token);

    // Only admins can create departments
    if (!hasRole(currentUser.role, ['admin'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const department = await db.departments.create(body);

    return NextResponse.json(
      {
        success: true,
        data: department,
        message: 'Department created successfully',
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

    console.error('Create department error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create department' },
      { status: 500 }
    );
  }
}