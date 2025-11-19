import { IGame, GameState, Move, Player, Stakes } from '../types';

// A simple in-memory store for active games. In production, you might use Redis.
const activeGames = new Map<string, GameState>();

// A registry to hold all the available game logic classes.
const gameRegistry = new Map<string, IGame<any, any>>();

/**
 * Registers a game logic class with the game manager.
 * All games must be registered before they can be used.
 * @param gameType - A unique string identifier for the game (e.g., 'tic-tac-toe').
 * @param gameLogic - The class that implements the IGame interface for this game.
 */
export function registerGame(gameType: string, gameLogic: IGame<any, any>) {
  if (gameRegistry.has(gameType)) {
    console.warn(`Game type '${gameType}' is already registered. Overwriting.`);
  }
  gameRegistry.set(gameType, gameLogic);
  console.log(`[GameManager] Registered game: ${gameType}`);
}

/**
 * The GameManager class provides a centralized API for managing game lifecycles.
 */
export class GameManager {
  /**
   * Creates a new game of a specified type.
   * @param gameType - The type of game to create (must be registered).
   * @param players - The players participating in the game.
   * @param stakes - The stakes for the game.
   * @returns The initial state of the newly created game.
   */
  createGame(gameType: string, players: Player[], stakes: Stakes): GameState {
    const gameLogic = gameRegistry.get(gameType);
    if (!gameLogic) {
      throw new Error(`Game type '${gameType}' is not registered.`);
    }

    const initialState = gameLogic.createGame(players, stakes);
    activeGames.set(initialState.gameId, initialState);

    console.log(`[GameManager] Created game ${initialState.gameId} of type ${gameType}`);
    return initialState;
  }

  /**
   * Applies a player's move to a specific game.
   * @param gameId - The ID of the game to apply the move to.
   * @param move - The move object from the player.
   * @returns The updated game state after the move.
   */
  makeMove(gameId: string, move: Move): GameState {
    const currentState = activeGames.get(gameId);
    if (!currentState) {
      throw new Error(`Game with ID '${gameId}' not found or is no longer active.`);
    }

    const gameLogic = gameRegistry.get(currentState.gameType);
    if (!gameLogic) {
      throw new Error(`Logic for game type '${currentState.gameType}' is not registered.`);
    }

    const updatedState = gameLogic.makeMove(currentState, move);
    activeGames.set(gameId, updatedState);

    console.log(`[GameManager] Move made in game ${gameId}`);
    return updatedState;
  }

  /**
   * Retrieves the current state of a game.
   * @param gameId - The ID of the game to retrieve.
   * @param perspectivePlayerId - (Optional) Player ID to get a sanitized view.
   * @returns The current (potentially sanitized) game state.
   */
  getGameState(gameId: string, perspectivePlayerId?: string): Partial<GameState> | null {
    const state = activeGames.get(gameId);
    if (!state) {
      return null;
    }

    const gameLogic = gameRegistry.get(state.gameType);
    if (perspectivePlayerId && gameLogic) {
      return gameLogic.getSanitizedState(state, perspectivePlayerId);
    }

    return state;
  }

  /**
   * Ends a game, removing it from the active list.
   * This should be called after payouts are handled.
   * @param gameId - The ID of the game to end.
   */
  endGame(gameId: string): void {
    if (activeGames.has(gameId)) {
      activeGames.delete(gameId);
      console.log(`[GameManager] Ended and removed game ${gameId}`);
    } else {
      console.warn(`[GameManager] Attempted to end a game with ID '${gameId}' that was not found.`);
    }
  }

  /**
   * Gets a list of all currently active games.
   * @returns An array of active game states.
   */
  getActiveGames(): GameState[] {
    return Array.from(activeGames.values());
  }
}

// Export a singleton instance of the GameManager for global use.
export const gameManager = new GameManager();
