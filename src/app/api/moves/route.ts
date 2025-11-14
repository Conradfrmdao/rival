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

// Game logic validation functions
function validateRockPaperScissors(move: string): boolean {
  return ['rock', 'paper', 'scissors'].includes(move.toLowerCase());
}

function validateTicTacToe(board: number[], move: number): boolean {
  // Move must be between 0-8 and the position must be empty (0)
  return move >= 0 && move <= 8 && board[move] === 0;
}

function checkTicTacToeWinner(board: number[]): number {
  // Check rows, columns, and diagonals
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  // Check for draw
  if (board.every(cell => cell !== 0)) {
    return 3; // Draw
  }

  return 0; // No winner yet
}

function validatePenaltyMove(move: any): boolean {
  // Move should have position (0-8) and power (0-100)
  return (
    move &&
    typeof move.position === 'number' &&
    move.position >= 0 &&
    move.position <= 8 &&
    typeof move.power === 'number' &&
    move.power >= 0 &&
    move.power <= 100
  );
}

function validateBallInCup(move: number): boolean {
  return move >= 0 && move <= 2; // 3 cups
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
    const { matchId, gameType, move, action } = body;

    const supabase = getSupabaseClient();

    // Get match details
    const { data: match, error: matchError } = await (supabase as any)
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    // Check if user is part of this match
    if (match.player1_id !== user.id && match.player2_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not part of this match' },
        { status: 403 }
      );
    }

    // Check if match is active
    if (match.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Match is not active' },
        { status: 400 }
      );
    }

    // Get game data
    const gameData = match.game_data || {};
    let updatedGameData = { ...gameData };

    if (action === 'make_move') {
      // Validate move based on game type
      let isValidMove = false;
      let moveData = move;

      switch (gameType) {
        case 'rock_paper_scissors':
          isValidMove = validateRockPaperScissors(move);
          break;

        case 'tic_tac_toe':
          const board = gameData.board || [0, 0, 0, 0, 0, 0, 0, 0, 0];
          isValidMove = validateTicTacToe(board, move.position);
          if (isValidMove) {
            // Update board with player's move
            const player = match.player1_id === user.id ? 1 : 2;
            board[move.position] = player;
            updatedGameData.board = board;
            updatedGameData.lastMove = {
              player,
              position: move.position,
              timestamp: Date.now()
            };
          }
          break;

        case 'penalty_take':
          isValidMove = validatePenaltyMove(move);
          if (isValidMove)) {
            updatedGameData.playerMoves = updatedGameData.playerMoves || {};
            updatedGameData.playerMoves[user.id] = move;
          }
          break;

        case 'ball_in_cup':
          isValidMove = validateBallInCup(move);
          if (isValidMove) {
            updatedGameData.playerChoices = updatedGameData.playerChoices || {};
            updatedGameData.playerChoices[user.id] = move;
          }
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid game type' },
            { status: 400 }
          );
      }

      if (!isValidMove) {
        return NextResponse.json(
          { success: false, error: 'Invalid move' },
          { status: 400 }
        );
      }

      // Update match with move data
      const { data: updatedMatch, error: updateError } = await (supabase as any)
        .from('matches')
        .update({
          game_data: updatedGameData
        })
        .eq('id', matchId)
        .select()
        .single();

      if (updateError || !updatedMatch) {
        return NextResponse.json(
          { success: false, error: 'Failed to update match' },
          {status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          move: moveData,
          gameData: updatedGameData,
          timestamp: Date.now()
        },
        message: 'Move recorded successfully'
      });

    } else if (action === 'get_game_state') {
      // Return current game state
      return NextResponse.json({
        success: true,
        data: {
          match: {
            id: match.id,
            gameType: gameData.gameType,
            status: match.status,
            stakeAmount: match.stake_amount,
            player1_id: match.player1_id,
            player2_id: match.player2_id
          },
          gameData: gameData
        }
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Game move error:', error);
    return NextResponse.json(
      { success: false, error: 'Game move failed' },
      { status: 500 }
    );
  }
}