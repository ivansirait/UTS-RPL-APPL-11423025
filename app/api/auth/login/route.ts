import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';
import { loginUser } from '@/lib/auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Login user
    const result = await loginUser(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie with token
    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        data: result.user,
        token: result.user.id,
        message: result.message,
      },
      { status: 200 }
    );

    // In a real app, set JWT token in secure cookie
    response.cookies.set({
      name: 'auth_token',
      value: result.user.id, // In production, use a signed JWT instead
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
