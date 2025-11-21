import { GameState, Move } from '../../../types';

export type PlayerRole = 'striker' | 'keeper';

/**
 * Represents a single shot event in the penalty shootout.
 */
export interface Shot {
  round: number;
  strikerId: string;
  keeperId: string;
  shot: {
    position: number; // 0-8 grid representing the goal
    power: number; // 0-100
  } | null;
  dive: {
    position: number; // 0-8 grid
  } | null;
  isGoal: boolean | null;
}

/**
 * Represents a player's move in the Penalty Take game.
 * A player can either be shooting or diving.
 */
export interface PenaltyTakeMove extends Move {
  action: PlayerRole;
  position: number;
  power?: number; // Only for the striker
}

/**
 * The specific game state for a Penalty Take match.
 */
export interface PenaltyTakeGameState extends GameState {
  gameType: 'penalty-take';
  roles: {
    [playerId: string]: PlayerRole;
  };
  shots: Shot[];
  score: {
    [playerId: string]: number;
  };
  currentRound: number;
  maxRounds: number;
}
