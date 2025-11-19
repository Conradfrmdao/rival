import { GameState, Move } from '../../../types';

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PlayerColor = 'white' | 'black' | 'red' | 'green';

export interface Piece {
  type: PieceType;
  color: PlayerColor;
  hasMoved?: boolean;
}

// The board is a 2D array representing the 8x8 grid.
// Some squares are null because the Clover board is not a perfect square.
export type Board = (Piece | null)[][];

/**
 * Represents a player's move in Clover Chess.
 */
export interface CloverChessMove extends Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
  promotion?: PieceType; // For pawn promotion
}

/**
 * The specific game state for a Clover Chess match.
 */
export interface CloverChessGameState extends GameState {
  gameType: 'clover-chess';
  board: Board;
  capturedPieces: { [color in PlayerColor]?: Piece[] };
  // Players are eliminated when their king is captured.
  eliminatedPlayers: PlayerColor[];
}
