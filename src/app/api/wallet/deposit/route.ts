import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/database';
import jwt from 'jsonwebtoken';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Validation schema
const depositSchema = z.object({
  amount: z.number().min(1000, 'Minimum deposit is UGX 1000'),
  phone: z.string().min(10, 'Valid phone number required'),
});

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

    const supabase = getSupabaseClient();
    const { data: user } = await (supabase as any)
      .from('users')
      .select('id, phone, username')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();

    return user;
  } catch (error) {
    return null;
  }
}

// Helper function to generate transaction reference
function generateTransactionReference(): string {
  return `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = depositSchema.parse(body);

    const supabase = getSupabaseClient();

    // Check if user exists and is active
    const { data: existingUser, error: userError } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await (supabase as any)
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Generate transaction reference
    const transactionReference = generateTransactionReference();

    // Create deposit transaction record
    const { data: transaction, error: transactionError } = await (supabase as any)
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        amount: validatedData.amount * 100, // Convert to UGX cents
        status: 'pending',
        reference: transactionReference,
        description: `Mobile Money deposit of UGX ${validatedData.amount.toLocaleString()}`,
        metadata: {
          phone: validatedData.phone,
          method: 'mobile_money',
          provider: 'pending', // Will be updated based on actual provider
        },
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Failed to create deposit transaction' },
        { status: 500 }
      );
    }

    // Update wallet pending deposits
    await (supabase as any)
      .from('wallets')
      .update({
        pending_deposits: wallet.pending_deposits + (validatedData.amount * 100)
      })
      .eq('user_id', user.id);

    // In a real implementation, you would integrate with a payment gateway like pawaPay here
    // For now, we'll simulate the payment flow

    // Mock payment initiation response
    const paymentResponse = {
      transactionId: transactionReference,
      status: 'pending',
      message: 'Please authorize the mobile money transaction on your phone',
      instructions: {
        provider: 'Mobile Money',
        phone: validatedData.phone,
        amount: validatedData.amount,
        reference: transactionReference
      }
    };

    const response = {
      success: true,
      data: {
        transaction: {
          id: transaction.id,
          reference: transactionReference,
          amount: validatedData.amount,
          status: 'pending',
          created_at: transaction.created_at
        },
        payment: paymentResponse
      },
      message: 'Deposit initiated successfully'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Deposit initiation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to initiate deposit' },
      { status: 500 }
    );
  }
}