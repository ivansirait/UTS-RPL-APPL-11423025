import { supabase } from './db';
import { LoginInput, RegisterInput } from './validators';
import { supabaseServer } from './supabase-server'; 
import { User } from '@/types';
import bcrypt from 'bcrypt';

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Login user
export async function loginUser(input: LoginInput) {
  try {
    // Check if user exists - use supabaseServer to bypass RLS
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', input.email)
      .single();

    if (userError || !userData) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await comparePassword(input.password, userData.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!userData.is_active) {
      throw new Error('User account is inactive');
    }

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = userData;
    return {
      success: true,
      user: userWithoutPassword as User,
      message: 'Login successful',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  }
}

// Register user
// Register user
export async function registerUser(input: RegisterInput) {
  try {
    // 1. Cek Email (gunakan supabase biasa, karena SELECT masih aman dengan RLS)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', input.email)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: 'Email sudah terdaftar' };
    }

    // 2. Hash password
    const password_hash = await hashPassword(input.password);

    // 3. Insert user menggunakan supabaseServer (bypass RLS)
    const { data: newUser, error: createError } = await supabaseServer
      .from('users')
      .insert([
        {
          email: input.email,
          password_hash,
          full_name: input.full_name,
          role: input.role,
          phone: input.phone || null,
          date_of_birth: input.date_of_birth || null,
          gender: input.gender || null,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("Database Insert Error:", createError.message);
      return { success: false, error: createError.message };
    }

    const { password_hash: _, ...userWithoutPassword } = newUser;
    return {
      success: true,
      user: userWithoutPassword as User,
      message: 'Registrasi berhasil!',
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || 'Registration failed' };
  }
}

// Get current user from session
export async function getCurrentUser(token: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', token)
      .single();

    if (error || !data) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = data;
    return userWithoutPassword as User;
  } catch (error) {
    return null;
  }
}

// Verify token (in a real app, this would verify JWT)
export function verifyToken(token: string): { valid: boolean; userId?: string } {
  try {
    // In a real app, verify JWT signature
    // For now, just check if token is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(token)) {
      return { valid: true, userId: token };
    }
    return { valid: false };
  } catch (error) {
    return { valid: false };
  }
}

// Check user role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Get auth token from request (header Bearer or cookie)
export function getAuthToken(request: any): string | null {
  const authHeader = request.headers?.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Next.js request cookie support
  if (request.cookies && typeof request.cookies.get === 'function') {
    const tokenCookie = request.cookies.get('auth_token');
    if (tokenCookie && tokenCookie.value) return tokenCookie.value;
  }

  // Fallback for raw cookie header
  const cookieHeader = request.headers?.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}
