import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validators';
import { registerUser } from '@/lib/auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // 1. Validasi Environment Variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('CRITICAL: Supabase Env Missing in API Route');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // 2. Validasi input dengan Zod
    // Pastikan registerSchema kamu menerima field 'full_name' atau 'fullName'
    const validatedData = registerSchema.parse(body);

    // 3. Mapping Data (PENTING!)
    // Kita pastikan data yang dikirim ke registerUser sesuai dengan kolom DB
    const { confirmPassword, ...dataToRegister } = validatedData;
    
    // Jika di Zod kamu pakai 'fullName', kita ubah ke 'full_name' untuk database
    const finalData = {
      ...dataToRegister,
      full_name: dataToRegister.full_name || (dataToRegister as any).fullName,
    };

    // 4. Panggil fungsi Register
    const result = await registerUser(finalData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // 5. Buat Response
    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        message: result.message,
      },
      { status: 201 }
    );

    // 6. Set Cookie (Gunakan ID dari hasil register)
    if (result.user && result.user.id) {
      response.cookies.set({
        name: 'auth_token',
        value: result.user.id,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 hari
      });
    }

    return response;

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Input tidak valid', details: error.errors },
        { status: 400 }
      );
    }

    // Cek detail error di terminal VS Code jika terjadi 500
    console.error('Registration error detailed:', error);
    
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}