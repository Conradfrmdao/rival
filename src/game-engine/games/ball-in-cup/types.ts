import { GameState, Move } from '../../../types';

export type GamePhase = 'hiding' | 'shuffling' | 'guessing' | 'revealed';

/**
 * Represents the guesser's move in Ball in the Cup.
 */
export interface BallInCupMove extends Move {
  cupIndex: number; // The cup index the player guesses (e.g., 0, 1, or 2)
}

/**
 * The specific game state for a Ball in the Cup match.
 */
export interface BallInCupGameState extends GameState {
  gameType: 'ball-in-cup';
  phase: GamePhase;

  // Roles
  hiderId: string;
  guesserId: string;

  // Secret state - should not be sent to the guesser until the end
  ballPosition: number;

  // Player's action
  guess: number | null;
}
