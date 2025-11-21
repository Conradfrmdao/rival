import { v4 as uuidv4 } from 'uuid';
import { IGame, Player, Stakes, GameResult } from '../../../types';
import { PenaltyTakeGameState, PenaltyTakeMove, Shot } from './types';
import { calculatePayouts } from '../../payout';

const MAX_ROUNDS = 5;
const GOAL_SIZE = 9; // 3x3 grid

export class PenaltyTakeGame implements IGame<PenaltyTakeGameState, PenaltyTakeMove> {
  createGame(players: Player[], stakes: Stakes): PenaltyTakeGameState {
    if (players.length !== 2) {
      throw new Error('Penalty Take requires exactly 2 players.');
    }

    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const strikerId = shuffledPlayers[0].id;
    const keeperId = shuffledPlayers[1].id;

    return {
      gameId: uuidv4(),
      gameType: 'penalty-take',
      players,
      stakes,
      status: 'in-progress',
      roles: {
        [strikerId]: 'striker',
        [keeperId]: 'keeper',
      },
      shots: [],
      score: {
        [strikerId]: 0,
        [keeperId]: 0, // Represents saves for the keeper
      },
      currentRound: 1,
      maxRounds: MAX_ROUNDS,
      currentPlayerId: strikerId, // Striker goes first
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  makeMove(currentState: PenaltyTakeGameState, move: PenaltyTakeMove): PenaltyTakeGameState {
    const { playerId, action, position, power } = move;

    if (action !== currentState.roles[playerId]) {
      throw new Error(`Invalid action. Your role is ${currentState.roles[playerId]}.`);
    }

    let currentShot = this.getCurrentShot(currentState);

    // If it's a new round, create a new shot entry
    if (!currentShot || (currentShot.shot && currentShot.dive)) {
        const strikerId = this.getPlayerIdByRole(currentState, 'striker');
        const keeperId = this.getPlayerIdByRole(currentState, 'keeper');
        currentShot = {
            round: currentState.currentRound,
            strikerId,
            keeperId,
            shot: null,
            dive: null,
            isGoal: null,
        };
        currentState.shots.push(currentShot);
    }

    if (action === 'striker') {
      if (currentShot.shot) throw new Error('Striker has already shot in this round.');
      if (power === undefined) throw new Error('Shot power must be defined.');
      currentShot.shot = { position, power };
    } else { // Keeper's move
      if (currentShot.dive) throw new Error('Keeper has already dived in this round.');
      currentShot.dive = { position };
    }

    const newState = { ...currentState, updatedAt: Date.now() };

    // If both players have made their move for the round, resolve it
    if (currentShot.shot && currentShot.dive) {
      this.resolveRound(newState);
      const winnerId = this.checkWinner(newState);
        if (winnerId) {
            newState.status = winnerId === 'draw' ? 'draw' : 'completed';
            newState.winnerId = winnerId === 'draw' ? null : winnerId;
            newState.currentPlayerId = null; // Game over
        } else {
            // Prepare for the next round by swapping roles
            const oldStriker = this.getPlayerIdByRole(newState, 'striker');
            const oldKeeper = this.getPlayerIdByRole(newState, 'keeper');
            newState.roles[oldStriker] = 'keeper';
            newState.roles[oldKeeper] = 'striker';
            newState.currentRound += 1;
            newState.currentPlayerId = newState.roles[oldStriker] === 'striker' ? oldStriker : oldKeeper;
        }
    } else {
        // Switch turn to the other player for the current round
        newState.currentPlayerId = newState.players.find(p => p.id !== playerId)!.id;
    }

    return newState;
  }

  checkWinner(state: PenaltyTakeGameState): string | 'draw' | null {
    const { score, currentRound, maxRounds, roles } = state;
    const strikerId = this.getPlayerIdByRole(state, 'striker');
    const keeperId = this.getPlayerIdByRole(state, 'keeper');

    const strikerScore = score[strikerId];
    const keeperSaves = score[keeperId]; // Let's consider keeper's score as saves

    const roundsRemaining = maxRounds - currentRound;

    // Check for insurmountable lead
    if (strikerScore > (maxRounds - keeperSaves) + keeperSaves) return strikerId; // Striker wins
    if (keeperSaves > (maxRounds - strikerScore) + strikerScore) return keeperId; // Keeper wins

    // If all rounds are completed
    if (currentRound > maxRounds) {
      if (strikerScore > (maxRounds - keeperSaves)) return strikerId;
      if ((maxRounds - keeperSaves) > strikerScore) return keeperId;
      return 'draw';
    }

    return null; // Game is still in progress
  }

  endGame(finalState: PenaltyTakeGameState): GameResult {
    if (finalState.status !== 'completed' && finalState.status !== 'draw') {
      throw new Error('Game cannot be ended before it is completed or drawn.');
    }
    return calculatePayouts(finalState);
  }

  getSanitizedState(state: PenaltyTakeGameState, perspectivePlayerId?: string): Partial<PenaltyTakeGameState> {
    const sanitizedState: Partial<PenaltyTakeGameState> = { ...state };

    // Hide the sensitive details of the current shot until both players have moved
    const currentShot = this.getCurrentShot(state);
    if(currentShot && (!currentShot.shot || !currentShot.dive)) {
        const sanitizedShots = state.shots.slice(0, -1); // Send all but the current shot
        const sanitizedCurrentShot: Shot = { ...currentShot, shot: null, dive: null }; // Create a clean version

        // Reveal the player's own move
        if (perspectivePlayerId) {
            if (state.roles[perspectivePlayerId] === 'striker' && currentShot.shot) {
                sanitizedCurrentShot.shot = currentShot.shot;
            } else if (state.roles[perspectivePlayerId] === 'keeper' && currentShot.dive) {
                sanitizedCurrentShot.dive = currentShot.dive;
            }
        }
        sanitizedState.shots = [...sanitizedShots, sanitizedCurrentShot];
    }

    return sanitizedState;
  }

  // --- Helper Methods ---

  private resolveRound(state: PenaltyTakeGameState): void {
    const currentShot = this.getCurrentShot(state);
    if (!currentShot || !currentShot.shot || !currentShot.dive) return;

    const isGoal = this.isGoal(currentShot.shot, currentShot.dive);
    currentShot.isGoal = isGoal;

    if (isGoal) {
      state.score[currentShot.strikerId] += 1;
    } else {
      state.score[currentShot.keeperId] += 1; // Keeper gets a point for a save
    }
  }

  private isGoal(shot: { position: number, power: number }, dive: { position: number }): boolean {
    // Simple logic: if the keeper dives to the same position, it's a save.
    // We can add more complex logic with power and randomness later.
    return shot.position !== dive.position;
  }

  private getCurrentShot(state: PenaltyTakeGameState): Shot | undefined {
    return state.shots[state.shots.length - 1];
  }

  private getPlayerIdByRole(state: PenaltyTakeGameState, role: 'striker' | 'keeper'): string {
      for(const playerId in state.roles) {
          if(state.roles[playerId] === role) return playerId;
      }
      throw new Error('Could not find player with role ' + role);
  }
}
