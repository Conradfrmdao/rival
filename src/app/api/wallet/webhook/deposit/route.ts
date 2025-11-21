import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/database';
import crypto from 'crypto';

// Webhook validation schema
const webhookSchema = z.object({
  transactionReference: z.string(),
  status: z.enum(['success', 'failed', 'cancelled']),
  amount: z.number(),
  phone: z.string(),
  provider: z.string(),
  timestamp: z.string(),
  signature: z.string(), // HMAC signature for verification
});

// Helper function to verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Helper function to get user by transaction reference
async function getUserByTransactionReference(transactionReference: string) {
  const supabase = getSupabaseClient();

  const { data: transaction, error: transactionError } = await (supabase as any)
    .from('transactions')
    .select('user_id')
    .eq('reference', transactionReference)
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .single();

  if (transactionError || !transaction) {
    return null;
  }

  const { data: user, error: userError } = await (supabase as any)
    .from('users')
    .select('id, phone, username')
    .eq('id', transaction.user_id)
    .eq('is_active', true)
    .single();

  if (userError || !user) {
    return null;
  }

  return { user, transaction };
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment variables
    const webhookSecret = process.env.PAWAPAY_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Parse the body
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON in webhook payload:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid payload format' },
        { status: 400 }
      );
    }

    // Validate webhook data
    const validatedData = webhookSchema.parse(webhookData);

    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature') || request.headers.get('signature');
    if (!signature || !verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Get transaction and user information
    const { user, transaction } = await getUserByTransactionReference(validatedData.transactionReference);
    if (!user || !transaction) {
      console.error('Transaction not found or invalid:', validatedData.transactionReference);
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const supabase = getSupabaseClient();

    // Get user's wallet
    const { data: wallet, error: walletError } = await (supabase as any)
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      console.error('Wallet not found for user:', user.id);
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Process deposit based on status
    let finalStatus = 'completed';
    let completedAt = null;

    if (validatedData.status === 'success') {
      // Successful deposit - add funds to wallet
      const depositAmountCents = Math.round(validatedData.amount * 100);

      // Update wallet
      const { error: updateError } = await (supabase as any)
        .from('wallets')
        .update({
          balance: wallet.balance + depositAmountCents,
          pending_deposits: Math.max(0, wallet.pending_deposits - depositAmountCents)
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update wallet:', updateError);
        finalStatus = 'failed';
      } else {
        completedAt = new Date().toISOString();
      }
    } else if (validatedData.status === 'failed' || validatedData.status === 'cancelled') {
      // Failed or cancelled deposit - update pending deposits
      const depositAmountCents = Math.round(validatedData.amount * 100);

      await (supabase as any)
        .from('wallets')
        .update({
          pending_deposits: Math.max(0, wallet.pending_deposits - depositAmountCents)
        })
        .eq('user_id', user.id);

      finalStatus = validatedData.status === 'failed' ? 'failed' : 'cancelled';
      completedAt = new Date().toISOString();
    }

    // Update transaction status
    const { data: updatedTransaction, error: updateTransactionError } = await (supabase as any)
      .from('transactions')
      .update({
        status: finalStatus,
        metadata: {
          ...transaction.metadata,
          webhook_payload: validatedData,
          processed_at: new Date().toISOString(),
          provider_response: {
            status: validatedData.status,
            phone: validatedData.phone,
            amount: validatedData.amount
          }
        },
        completed_at: completedAt
      })
      .eq('id', transaction.id)
      .select()
      .single();

    if (updateTransactionError || !updatedTransaction) {
      console.error('Failed to update transaction:', updateTransactionError);
      return NextResponse.json(
        { success: false, error: 'Failed to update transaction' },
        { status: 500 }
      );
    }

    // Get updated wallet for response
    const { data: updatedWallet } = await (supabase as any)
      .from('wallets')
      .select('balance, pending_deposits, pending_withdrawals')
      .eq('user_id', user.id)
      .single();

    const response = {
      success: true,
      data: {
        transaction: {
          id: updatedTransaction.id,
          reference: updatedTransaction.reference,
          status: finalStatus,
          amount: validatedData.amount,
          completed_at: completedAt
        },
        wallet: updatedWallet,
        user: {
          id: user.id,
          username: user.username
        }
      },
      message: `Deposit ${finalStatus} successfully`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Invalid webhook data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}