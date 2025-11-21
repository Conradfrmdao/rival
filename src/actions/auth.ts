'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Validation schemas
const sendOTPSchema = z.object({
  phone: z.string().min(10).max(15),
});

const verifyOTPSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
});

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json() as T;

    if (!response.ok) {
      return {
        success: false,
        error: (data as any).error || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

export async function sendOTP(phone: string): Promise<APIResponse> {
  try {
    // Validate input
    const validatedPhone = sendOTPSchema.parse({ phone });

    const response = await apiRequest('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(validatedPhone),
    });

    if (response.success) {
      revalidatePath('/register');
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

export async function verifyOTP(phone: string, otp: string): Promise<APIResponse> {
  try {
    // Validate input
    const validatedData = verifyOTPSchema.parse({ phone, otp });

    const response = await apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    });

    if (response.success) {
      revalidatePath('/dashboard');
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid phone or OTP format',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify OTP',
    };
  }
}

export async function refreshToken(refreshToken: string): Promise<APIResponse> {
  try {
    const response = await apiRequest('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    return response;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh token',
    };
  }
}

export async function checkUserExists(phone: string): Promise<APIResponse<boolean>> {
  try {
    const validatedPhone = sendOTPSchema.parse({ phone });

    const response = await apiRequest<boolean>(`/api/users/exists?phone=${encodeURIComponent(validatedPhone.phone)}`);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check user existence',
    };
  }
}