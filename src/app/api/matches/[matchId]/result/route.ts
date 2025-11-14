import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/database';
import jwt from 'jsonwebtoken';

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

// Game result validation schema
const resultSchema = z.object({
  result: z.enum(['win', 'lose', 'draw']),
  gameData: z.any().optional(),
  winnerId: z.string().uuid().optional(),
  details: z.any().optional()
});

// Game logic functions for determining winners
function determineRockPaperScissorsWinner(move1: string, move2: string): 'player1' | 'player2' | 'draw' {
  const normalizedMove1 = move1.toLowerCase();
  const normalizedMove2 = move2.toLowerCase();

  if (normalizedMove1 === normalizedMove2) {
    return 'draw';
  }

  // Rock beats Scissors, Scissors beats Paper, Paper beats Rock
  if (
    (normalizedMove1 === 'rock' && normalizedMove2 === 'scissors') ||
    (normalizedMove1 === 'scissors' && normalizedMove2 === 'paper') ||
    (normalizedMove1 === 'paper' && normalizedMove2 === 'rock')
  ) {
    return 'player1';
  } else {
    return 'player2';
  }
}

function determineTicTacToeWinner(board: number[]): number {
  // Check rows, columns, and diagonals
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Return 1 for player1, 2 for player2
    }
  }

  // Check for draw
  if (board.every(cell => cell !== 0)) {
    return 3; // Draw
  }

  return 0; // No winner yet
}

function determineBallInCupWinner(player1Choice: number, player2Choice: number, ballPosition: number): 'player1' | 'player2' | 'draw' {
  if (player1Choice === ballPosition && player2Choice === ballPosition) {
    return 'draw'; // Both chose correctly
  } else if (player1Choice === ballPosition) {
    return 'player1';
  } else if (player2Choice === ballPosition) {
    return 'player2';
  } else {
    return 'draw'; // Neither chose correctly
  }
}

function determinePenaltyWinner(player1Moves: any[], player2Moves: any[]): 'player1' | 'player2' | 'draw' {
  // Simple implementation: count successful goals
  const player1Goals = player1Moves.filter(move => move.result === 'goal').length;
  const player2Goals = player2Moves.filter(move => move.result === 'goal').length;

  if (player1Goals > player2Goals) {
    return 'player1';
  } else if (player2Goals > player1Goals) {
    return 'player2';
  } else {
    return 'draw';
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    // Verify user authentication
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { matchId } = params;
    const body = await request.json();
    const validatedData = resultSchema.parse(body);

    const supabase = getSupabaseClient();

    // Get match details
    const { data: match, error: matchError } = await (supabase as any)
      .from('matches')
      .select(`
        *,
        games(name, type),
        player1:users(id, username),
        player2:users(id, username)
      `)
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    // Check if match is active and not already completed
    if (match.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Match is not active or already completed' },
        { status: 400 }
      );
    }

    // Check if user is part of this match
    if (match.player1.id !== user.id && match.player2.id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not part of this match' },
        { status: 403 }
      );
    }

    const gameData = match.game_data || {};
    let winner = null;
    let resultDetails = {};

    // Determine winner based on game type
    switch (match.games.type) {
      case 'rock_paper_scissors':
        // Game data should contain moves from both players
        const player1Move = gameData.player1Move;
        const player2Move = gameData.player2Move;

        if (!player1Move || !player2Move) {
          return NextResponse.json(
            { success: false, error: 'Both players must make a move' },
            { status: 400 }
          );
        }

        const gameResult = determineRockPaperScissorsWinner(player1Move, player2Move);
        winner = gameResult === 'player1' ? match.player1.id :
                 gameResult === 'player2' ? match.player2.id : null;

        resultDetails = {
          player1Move,
          player2Move,
          gameResult
        };
        break;

      case 'tic_tac_toe':
        const board = gameData.board || [0, 0, 0, 0, 0, 0, 0, 0, 0];
        const gameResult = determineTicTacToeWinner(board);

        winner = gameResult === 1 ? match.player1.id :
                 gameResult === 2 ? match.player2.id : null;

        resultDetails = {
          board,
          gameResult: gameResult === 1 ? 'player1_wins' :
                   gameResult === 2 ? 'player2_wins' : 'draw'
        };
        break;

      case 'ball_in_cup':
        const player1Choice = gameData.playerChoices?.[match.player1.id];
        const player2Choice = gameData.playerChoices?.[match.player2.id];
        const ballPosition = gameData.ballPosition;

        if (player1Choice === undefined || player2Choice === undefined || ballPosition === undefined) {
          return NextResponse.json(
            { success: false, error: 'Both players must make a choice' },
            { status: 400 }
          );
        }

        const gameResult = determineBallInCupWinner(player1Choice, player2Choice, ballPosition);
        winner = gameResult === 'player1' ? match.player1.id :
                 gameResult === 'player2' ? match.player2.id : null;

        resultDetails = {
          player1Choice,
          player2Choice,
          ballPosition,
          gameResult
        };
        break;

      case 'penalty_take':
        const player1Moves = gameData.playerMoves?.[match.player1.id] || [];
        const player2Moves = gameData.playerMoves?.[match.player2.id] || [];

        // Ensure both players have taken their shots
        if (player1Moves.length < 5 || player2Moves.length < 5) {
          return NextResponse.json(
            { success: false, error: 'Both players must complete their penalty shots' },
            { status: 400 }
          );
        }

        const gameResult = determinePenaltyWinner(player1Moves, player2Moves);
        winner = gameResult === 'player1' ? match.player1.id :
                 gameResult === 'player2' ? match.player2.id : null;

        resultDetails = {
          player1Goals: player1Moves.filter(m => m.result === 'goal').length,
          player2Goals: player2Moves.filter(m => m.result === 'goal').length,
          player1Moves,
          player2Moves,
          gameResult: gameResult === 'player1' ? 'player1_wins' :
                   gameResult === 'player2' ? 'player2_wins' : 'draw'
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported game type' },
          { status: 400 }
        );
    }

    // Override winner if explicitly provided (for draws or testing)
    if (validatedData.winnerId) {
      winner = validatedData.winnerId;
    }

    // Calculate winnings
    const stakeAmount = match.stake_amount;
    const totalStake = stakeAmount * 2; // Both players contributed
    const platformFee = Math.floor(totalStake * 0.1); // 10% platform fee
    const totalWinnings = totalStake - platformFee;

    // Update match with result
    const { data: updatedMatch, error: updateError } = await (supabase as any)
      .from('matches')
      .update({
        status: 'completed',
        winner_id: winner,
        completed_at: new Date().toISOString(),
        game_data: {
          ...gameData,
          result: validatedData.result,
          resultDetails,
          completedBy: user.id,
          completedAt: new Date().toISOString()
        }
      })
      .eq('id', matchId)
      .select()
      .single();

    if (updateError || !updatedMatch) {
      return NextResponse.json(
        { success: false, error: 'Failed to update match result' },
        { status: 500 }
      );
    }

    // Process winnings through database function
    if (winner && validatedData.result !== 'draw') {
      const loserId = winner === match.player1.id ? match.player2.id : match.player1.id;

      try {
        await (supabase as any).rpc('process_game_winnings', {
          p_match_id: matchId,
          p_winner_id: winner,
          p_loser_id: loserId,
          p_stake_amount: stakeAmount
        });
      } catch (error) {
        console.error('Failed to process game winnings:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to process winnings' },
          { status: 500 }
        );
      }
    }

    // For draws, refund stakes to both players
    if (validatedData.result === 'draw') {
      try {
        // Refund player 1
        await (supabase as any)
          .from('wallets')
          .update({ balance: `balance + ${stakeAmount * 100}` })
          .eq('user_id', match.player1.id);

        // Refund player 2
        await (supabase as any)
          .from('wallets')
          .update({ balance: `balance + ${stakeAmount * 100}` })
          .eq('user_id', match.player2.id);

        // Create refund transactions
        await (supabase as any)
          .from('transactions')
          .insert([
            {
              user_id: match.player1.id,
              type: 'game_win',
              amount: stakeAmount * 100,
              status: 'completed',
              description: `Draw - refunded stake of UGX ${stakeAmount.toLocaleString()}`,
              metadata: {
                match_id: matchId,
                game_type: match.games.type,
                is_draw: true
              },
              completed_at: new Date().toISOString()
            },
            {
              user_id: match.player2.id,
              type: 'game_win',
              amount: stakeAmount * 100,
              status: 'completed',
              description: `Draw - refunded stake of UGX ${stakeAmount.toLocaleString()}`,
              metadata: {
                match_id: matchId,
                game_type: match.games.type,
                is_draw: true
              },
              completed_at: new Date().toISOString()
            }
          ]);
      } catch (error) {
        console.error('Failed to process draw refunds:', error);
      }
    }

    // Get winner information
    let winnerInfo = null;
    if (winner) {
      const { data: winnerData } = await (supabase as any)
        .from('users')
        .select('id, username, phone')
        .eq('id', winner)
        .single();

      winnerInfo = winnerData;
    }

    const response = {
      success: true,
      data: {
        match: updatedMatch,
        result: validatedData.result,
        winner: winnerInfo,
        winnings: validatedData.result !== 'draw' ? {
          amount: winner ? totalWinnings : 0,
          platform_fee: platformFee
        } : null,
        resultDetails
      },
      message: `Game ${validatedData.result}${winner ? ` - ${winnerInfo?.username} wins!` : ' - Draw'}`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Game result error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Invalid result data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process game result' },
      { status: 500 }
    );
  }
}