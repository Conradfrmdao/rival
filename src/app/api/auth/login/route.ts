import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Validation schema
const loginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(1, 'Password is required'),
});

// Helper functions
const generateTokens = (userId: string) => {
  const token = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );

  return {
    token,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
};

const formatUserResponse = (user: any) => {
  return {
    id: user.id,
    phone: user.phone,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    nin: user.nin,
    email: user.email,
    avatar_url: user.avatar_url,
    is_active: user.is_active,
    last_login: user.last_login,
    is_verified: user.is_verified,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user by phone
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', validatedData.phone)
      .eq('is_active', true)
      .single();

    if (error || !user || !user.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    const response = {
      success: true,
      data: {
        user: formatUserResponse(user),
        tokens
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}