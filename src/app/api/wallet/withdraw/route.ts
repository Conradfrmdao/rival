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
const withdrawSchema = z.object({
  amount: z.number().min(1000, 'Minimum withdrawal is UGX 1000'),
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
  return `WD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
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
    const validatedData = withdrawSchema.parse(body);

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

    // Calculate withdrawal amount in cents and withdrawal fee (10%)
    const withdrawalAmountCents = validatedData.amount * 100;
    const withdrawalFee = Math.floor(withdrawalAmountCents * 0.1);
    const totalDeduction = withdrawalAmountCents + withdrawalFee;

    // Check if user has sufficient balance
    if (wallet.balance < totalDeduction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient balance',
          details: {
            current_balance: wallet.balance,
            withdrawal_amount: withdrawalAmountCents,
            withdrawal_fee: withdrawalFee,
            total_required: totalDeduction
          }
        },
        { status: 400 }
      );
    }

    // Generate transaction reference
    const transactionReference = generateTransactionReference();

    // Create withdrawal transaction record
    const { data: transaction, error: transactionError } = await (supabase as any)
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -(withdrawalAmountCents), // Negative amount for withdrawal
        status: 'pending',
        reference: transactionReference,
        description: `Mobile Money withdrawal of UGX ${validatedData.amount.toLocaleString()}`,
        metadata: {
          phone: validatedData.phone,
          method: 'mobile_money',
          withdrawal_fee: withdrawalFee,
          gross_amount: withdrawalAmountCents,
          net_amount: withdrawalAmountCents
        },
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Failed to create withdrawal transaction' },
        { status: 500 }
      );
    }

    // Create fee transaction record
    await (supabase as any)
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'fee',
        amount: -(withdrawalFee), // Negative amount for fee
        status: 'completed',
        reference: `${transactionReference}_FEE`,
        description: `Withdrawal processing fee (${(withdrawalFee / 100).toFixed(2)} UGX)`,
        metadata: {
          withdrawal_reference: transactionReference,
          fee_rate: 0.10,
          withdrawal_amount: withdrawalAmountCents
        },
        completed_at: new Date().toISOString()
      });

    // Update wallet balance and pending withdrawals
    await (supabase as any)
      .from('wallets')
      .update({
        balance: wallet.balance - withdrawalAmountCents,
        pending_withdrawals: wallet.pending_withdrawals + withdrawalAmountCents
      })
      .eq('user_id', user.id);

    // In a real implementation, you would integrate with a payment gateway like pawaPay here
    // For now, we'll simulate the payment flow

    // Mock withdrawal initiation response
    const paymentResponse = {
      transactionId: transactionReference,
      status: 'pending',
      message: 'Processing withdrawal to your mobile money account',
      instructions: {
        provider: 'Mobile Money',
        phone: validatedData.phone,
        amount: validatedData.amount,
        withdrawal_fee: withdrawalFee / 100,
        net_amount: validatedData.amount - (withdrawalFee / 100),
        reference: transactionReference,
        estimated_processing_time: '5-10 minutes'
      }
    };

    const response = {
      success: true,
      data: {
        transaction: {
          id: transaction.id,
          reference: transactionReference,
          amount: validatedData.amount,
          withdrawal_fee: withdrawalFee / 100,
          net_amount: validatedData.amount - (withdrawalFee / 100),
          status: 'pending',
          created_at: transaction.created_at
        },
        payment: paymentResponse,
        updated_balance: wallet.balance - withdrawalAmountCents
      },
      message: 'Withdrawal initiated successfully'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Withdrawal initiation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to initiate withdrawal' },
      { status: 500 }
    );
  }
}