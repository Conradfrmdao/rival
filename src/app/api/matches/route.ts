import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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

// Helper function to generate Agora channel name
function generateAgoraChannel(matchId: string): string {
  return `match_${matchId}_${Date.now()}`;
}

// Helper function to check if user has sufficient balance
async function checkUserBalance(userId: string, stakeAmount: number): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data: wallet, error } = await (supabase as any)
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (error || !wallet) {
    return false;
  }

  // Convert stake amount to cents and check balance
  const stakeAmountCents = stakeAmount * 100;
  return wallet.balance >= stakeAmountCents;
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

    const body = await request.json();
    const { action, gameType, stakeAmount } = body;

    const supabase = getSupabaseClient();

    if (action === 'join_matchmaking') {
      // Validate input
      const matchmakingSchema = z.object({
        gameType: z.string(),
        stakeAmount: z.number().min(500, 'Minimum stake is UGX 500')
      });

      const validatedData = matchmakingSchema.parse({ gameType, stakeAmount });

      // Verify game exists and is active
      const { data: game, error: gameError } = await (supabase as any)
        .from('games')
        .select('*')
        .eq('type', validatedData.gameType)
        .eq('is_active', true)
        .single();

      if (gameError || !game) {
        return NextResponse.json(
          { success: false, error: 'Game not found or inactive' },
          { status: 404 }
        );
      }

      // Validate stake amount against game limits
      if (validatedData.stakeAmount < game.min_stake || validatedData.stakeAmount > game.max_stake) {
        return NextResponse.json(
          {
            success: false,
            error: `Stake amount must be between UGX ${game.min_stake} and UGX ${game.max_stake}`
          },
          { status: 400 }
        );
      }

      // Check user balance
      const hasSufficientBalance = await checkUserBalance(user.id, validatedData.stakeAmount);
      if (!hasSufficientBalance) {
        return NextResponse.json(
          { success: false, error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Look for existing match in matchmaking
      const { data: existingMatch, error: matchError } = await (supabase as any)
        .from('matches')
        .select('*')
        .eq('game_id', game.id)
        .eq('status', 'matchmaking')
        .eq('player2_id', null)
        .neq('player1_id', user.id)
        .eq('stake_amount', validatedData.stakeAmount)
        .order('created_at', 'asc')
        .limit(1);

      if (!matchError && existingMatch) {
        // Found a match - join it
        const matchId = existingMatch.id;
        const agoraChannel = generateAgoraChannel(matchId);

        // Update match with player2 and status
        const { data: updatedMatch, error: updateError } = await (supabase as any)
          .from('matches')
          .update({
            player2_id: user.id,
            status: 'active',
            agora_channel: agoraChannel,
            started_at: new Date().toISOString(),
            game_data: {
              currentTurn: existingMatch.player1_id,
              timeLeft: 300, // 5 minutes for each turn
              moves: {},
              state: 'ready'
            }
          })
          .eq('id', matchId)
          .select()
          .single();

        if (updateError || !updatedMatch) {
          return NextResponse.json(
            { success: false, error: 'Failed to join match' },
            { status: 500 }
          );
        }

        // Create game sessions for both players
        await (supabase as any)
          .from('game_sessions')
          .insert([
            { match_id: matchId, player_id: existingMatch.player1_id },
            { match_id: matchId, player_id: user.id }
          ]);

        // Deduct stake amounts from both players' wallets
        const stakeAmountCents = validatedData.stakeAmount * 100;

        await (supabase as any)
          .from('wallets')
          .update({ balance: `balance - ${stakeAmountCents}` })
          .eq('user_id', existingMatch.player1_id);

        await (supabase as any)
          .from('wallets')
          .update({ balance: `balance - ${stakeAmountCents}` })
          .eq('user_id', user.id);

        // Get opponent info
        const { data: opponent, error: opponentError } = await (supabase as any)
          .from('users')
          .select('id, username, phone')
          .eq('id', existingMatch.player1_id)
          .single();

        if (opponentError || !opponent) {
          return NextResponse.json(
            { success: false, error: 'Failed to get opponent info' },
            { status: 500 }
          );
        }

        const response = {
          success: true,
          data: {
            match: {
              id: updatedMatch.id,
              gameType: game.type,
              stakeAmount: validatedData.stakeAmount,
              status: 'active',
              agoraChannel: agoraChannel,
              opponent: {
                id: opponent.id,
                username: opponent.username,
                // Don't expose phone for privacy
              }
            }
          },
          message: 'Match found! Game starting...'
        };

        return NextResponse.json(response, { status: 201 });

      } else {
        // No match found - create new matchmaking entry
        const matchId = uuidv4();
        const agoraChannel = generateAgoraChannel(matchId);

        const { data: newMatch, error: createError } = await (supabase as any)
          .from('matches')
          .insert({
            game_id: game.id,
            player1_id: user.id,
            stake_amount: validatedData.stakeAmount,
            status: 'matchmaking',
            agora_channel: agoraChannel,
            game_data: {
              createdBy: user.id,
              createdAt: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (createError || !newMatch) {
          return NextResponse.json(
            { success: false, error: 'Failed to create match' },
            { status: 500 }
          );
        }

        // Create game session
        await (supabase as any)
          .from('game_sessions')
          .insert({
            match_id: newMatch.id,
            player_id: user.id
          });

        const response = {
          success: true,
          data: {
            match: {
              id: newMatch.id,
              gameType: game.type,
              stakeAmount: validatedData.stakeAmount,
              status: 'matchmaking',
              agoraChannel: agoraChannel
            }
          },
          message: 'Added to matchmaking queue'
        };

        return NextResponse.json(response, { status: 201 });
      }

    } else if (action === 'leave_matchmaking') {
      // Remove user from any active matchmaking matches
      const { data: deletedMatch } = await (supabase as any)
        .from('matches')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('player1_id', user.id)
        .eq('status', 'matchmaking');

      if (deletedMatch) {
        // Remove game session
        await (supabase as any)
          .from('game_sessions')
          .delete()
          .eq('match_id', deletedMatch.id)
          .eq('player_id', user.id);

        return NextResponse.json(
          { success: true, message: 'Left matchmaking queue' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Not in matchmaking queue' },
        { status: 200 }
      );

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Match management error:', error);
    return NextResponse.json(
      { success: false, error: 'Match management failed' },
      { status: 500 }
    );
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = getSupabaseClient();

    let query = (supabase as any)
      .from('matches')
      .select(`
        *,
        games(name, type, description),
        player1:users(id, username),
        player2:users(id, username)
      `)
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('created_at', 'desc');

    if (status) {
      query = query.eq('status', status);
    }

    const { data: matches, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: matches || []
    });

  } catch (error) {
    console.error('Match fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}