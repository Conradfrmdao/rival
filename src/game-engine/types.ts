/**
 * Core Types for the Rival Game Engine
 */

// Represents a single player in the system
export interface Player {
  id: string; // User ID
  username: string;
}

// Represents the stakes for a game
export interface Stakes {
  amount: number; // The amount each player stakes (in UGX)
  currency: 'UGX';
}

// The possible statuses of a game
export type GameStatus = 'waiting' | 'in-progress' | 'completed' | 'draw' | 'cancelled';

/**
 * Base interface for the state of any game.
 * Each game will extend this with its own specific state properties.
 */
export interface GameState {
  gameId: string;
  gameType: string;
  players: Player[];
  stakes: Stakes;
  status: GameStatus;
  currentPlayerId?: string | null; // ID of the player whose turn it is
  winnerId?: string | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Represents a single move or action taken by a player.
 * Each game will have its own more specific move type.
 */
export interface Move {
  playerId: string;
  [key: string]: any; // Game-specific move data, e.g., { card: 'AS', action: 'play' }
}

/**
 * Defines the structure of the result of a completed game
 */
export interface GameResult {
  status: 'completed' | 'draw';
  winner?: Player;
  loser?: Player;
  payouts: {
    [playerId: string]: number; // The amount each player receives
  };
}

/**
 * The main interface that every game must implement.
 * This provides a consistent API for the game manager to interact with any game.
 * T - The game's specific state (e.g., TicTacToeGameState)
 * M - The game's specific move type (e.g., TicTacToeMove)
 */
export interface IGame<T extends GameState, M extends Move> {
  /**
   * Creates a new instance of a game with initial state.
   * @param players - The array of players for this game.
   * @param stakes - The stakes for the game.
   * @returns The initial state of the game.
   */
  createGame(players: Player[], stakes: Stakes): T;

  /**
   * Processes a player's move and updates the game state.
   * @param currentState - The current state of the game.
   * @param move - The move being made by the player.
   * @returns The updated game state.
   * @throws Error if the move is invalid or it's not the player's turn.
   */
  makeMove(currentState: T, move: M): T;

  /**
   * Checks if the game has a winner or is a draw.
   * This method should not modify the state.
   * @param state - The current state of the game.
   * @returns The winner's ID, 'draw', or null if the game is still in progress.
   */
  checkWinner(state: T): string | 'draw' | null;

  /**
   * Ends the game and calculates the final result and payouts.
   * @param finalState - The final state of the game after a win or draw.
   * @returns A GameResult object with the winner, loser, and payout details.
   */
  endGame(finalState: T): GameResult;

  /**
   * A utility to get a sanitized version of the state to send to clients.
   * This should remove any sensitive or server-only information.
   * @param state - The current state of the game.
   * @param perspectivePlayerId - (Optional) The ID of the player viewing the state.
   * @returns A partial, safe-to-view version of the game state.
   */
  getSanitizedState(state: T, perspectivePlayerId?: string): Partial<T>;
}
