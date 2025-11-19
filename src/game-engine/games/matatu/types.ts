import { GameState, Move } from '../../../types';

export const suits = ['clubs', 'diamonds', 'hearts', 'spades'] as const;
export const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

export type Suit = typeof suits[number];
export type Rank = typeof ranks[number];

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type MatatuAction = 'playCard' | 'drawCard';

/**
 * Represents a player's move in Matatu.
 */
export interface MatatuMove extends Move {
  action: MatatuAction;
  card?: Card; // Only provided when action is 'playCard'
}

/**
 * The specific game state for a Matatu match.
 */
export interface MatatuGameState extends GameState {
  gameType: 'matatu';
  playerHands: {
    [playerId: string]: Card[];
  };
  drawPile: Card[];
  discardPile: Card[];
  // Could add properties for special card effects, e.g.:
  // pendingDraws: number;
}
