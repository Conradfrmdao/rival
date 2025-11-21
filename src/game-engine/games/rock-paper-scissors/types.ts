import { GameState, Move } from '../../../types';

export type RpsMove = 'rock' | 'paper' | 'scissors';

/**
 * Represents a player's move in Rock Paper Scissors.
 */
export interface RockPaperScissorsMove extends Move {
  move: RpsMove;
}

/**
 * The specific game state for a Rock Paper Scissors match.
 */
export interface RockPaperScissorsGameState extends GameState {
  gameType: 'rock-paper-scissors';
  moves: {
    [playerId: string]: RpsMove | null;
  };
}
