import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Helper function to verify JWT and extract user
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'access') {
      return null;
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();

    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get wallet balance
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      data: {
        balance: wallet.balance,
        pendingDeposits: wallet.pending_deposits,
        pendingWithdrawals: wallet.pending_withdrawals,
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Balance fetch error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}