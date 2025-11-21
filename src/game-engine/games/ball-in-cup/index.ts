import { v4 as uuidv4 } from 'uuid';
import { IGame, Player, Stakes, GameResult } from '../../../types';
import { BallInCupGameState, BallInCupMove, GamePhase } from './types';
import { calculatePayouts } from '../../payout';

const NUMBER_OF_CUPS = 3;

export class BallInCupGame implements IGame<BallInCupGameState, BallInCupMove> {
  createGame(players: Player[], stakes: Stakes): BallInCupGameState {
    if (players.length !== 2) {
      throw new Error('Ball in the Cup requires exactly 2 players.');
    }

    // Randomly assign hider and guesser
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const hiderId = shuffledPlayers[0].id;
    const guesserId = shuffledPlayers[1].id;

    return {
      gameId: uuidv4(),
      gameType: 'ball-in-cup',
      players,
      stakes,
      status: 'in-progress',
      phase: 'hiding', // The game starts with the hider placing the ball
      hiderId,
      guesserId,
      ballPosition: Math.floor(Math.random() * NUMBER_OF_CUPS),
      guess: null,
      currentPlayerId: guesserId, // The guesser is the first to make a move
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  makeMove(currentState: BallInCupGameState, move: BallInCupMove): BallInCupGameState {
    const { playerId, cupIndex } = move;

    if (playerId !== currentState.guesserId) {
      throw new Error('Only the guesser can make a move.');
    }

    if (currentState.phase !== 'guessing') {
        // In a real implementation, we'd have a shuffling phase.
        // For this logic, we assume the guess happens right after hiding.
        // We will change the phase here before processing the move.
        currentState.phase = 'guessing';
    }

    if (currentState.guess !== null) {
      throw new Error('A guess has already been made.');
    }

    if (cupIndex < 0 || cupIndex >= NUMBER_OF_CUPS) {
      throw new Error(`Invalid cup index. Must be between 0 and ${NUMBER_OF_CUPS - 1}.`);
    }

    const newState: BallInCupGameState = {
      ...currentState,
      guess: cupIndex,
      phase: 'revealed',
      currentPlayerId: null, // Game is over, no more moves
      updatedAt: Date.now(),
    };

    const winnerId = this.checkWinner(newState);
    if (winnerId) {
        newState.status = winnerId === 'draw' ? 'draw' : 'completed';
        newState.winnerId = winnerId === 'draw' ? null : winnerId;
    } else {
        // This should not happen in Ball in the Cup, but as a safeguard:
        throw new Error("Could not determine a winner after the guess.")
    }

    return newState;
  }

  checkWinner(state: BallInCupGameState): string | 'draw' | null {
    if (state.guess === null) {
      return null; // Game not over
    }

    if (state.guess === state.ballPosition) {
      return state.guesserId; // Guesser wins
    } else {
      return state.hiderId; // Hider wins
    }
  }

  endGame(finalState: BallInCupGameState): GameResult {
    if (finalState.status !== 'completed') {
      throw new Error('Game cannot be ended before it is completed.');
    }
    return calculatePayouts(finalState);
  }

  getSanitizedState(state: BallInCupGameState, perspectivePlayerId?: string): Partial<BallInCupGameState> {
    const sanitizedState: Partial<BallInCupGameState> = {
      gameId: state.gameId,
      gameType: state.gameType,
      players: state.players,
      stakes: state.stakes,
      status: state.status,
      phase: state.phase,
      hiderId: state.hiderId,
      guesserId: state.guesserId,
      guess: state.guess,
      winnerId: state.winnerId,
      currentPlayerId: state.currentPlayerId,
    };

    // The ball position is only revealed when the game is over.
    if (state.phase === 'revealed') {
      (sanitizedState as BallInCupGameState).ballPosition = state.ballPosition;
    }

    return sanitizedState;
  }
}
