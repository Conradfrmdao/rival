import { GameState, Move } from '../../../types';

// The board is a 9-element array representing the 3x3 grid.
// Each cell can hold a player's ID or be null.
export type Board = (string | null)[];

/**
 * Represents a player's move in Tic Tac Toe.
 */
export interface TicTacToeMove extends Move {
  position: number; // A number from 0 to 8
}

/**
 * The specific game state for a Tic Tac Toe match.
 */
export interface TicTacToeGameState extends GameState {
  gameType: 'tic-tac-toe';
  board: Board;
  marks: {
    [playerId: string]: 'X' | 'O';
  };
}
