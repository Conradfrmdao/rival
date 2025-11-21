import { v4 as uuidv4 } from 'uuid';
import { IGame, Player, Stakes, GameResult } from '../../../types';
import { RockPaperScissorsGameState, RockPaperScissorsMove, RpsMove } from './types';
import { calculatePayouts } from '../../payout';

const winningMoves: { [key in RpsMove]: RpsMove } = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
};

export class RockPaperScissorsGame implements IGame<RockPaperScissorsGameState, RockPaperScissorsMove> {
  createGame(players: Player[], stakes: Stakes): RockPaperScissorsGameState {
    if (players.length !== 2) {
      throw new Error('Rock Paper Scissors requires exactly 2 players.');
    }

    return {
      gameId: uuidv4(),
      gameType: 'rock-paper-scissors',
      players,
      stakes,
      status: 'in-progress',
      moves: {
        [players[0].id]: null,
        [players[1].id]: null,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  makeMove(currentState: RockPaperScissorsGameState, move: RockPaperScissorsMove): RockPaperScissorsGameState {
    const { playerId, move: playerMove } = move;

    if (!currentState.moves.hasOwnProperty(playerId)) {
      throw new Error(`Player with ID '${playerId}' is not in this game.`);
    }

    if (currentState.moves[playerId] !== null) {
      throw new Error(`Player with ID '${playerId}' has already made a move.`);
    }

    const newState: RockPaperScissorsGameState = {
      ...currentState,
      moves: {
        ...currentState.moves,
        [playerId]: playerMove,
      },
      updatedAt: Date.now(),
    };

    // Check if the game is complete after this move
    const winnerId = this.checkWinner(newState);
    if (winnerId) {
      newState.status = winnerId === 'draw' ? 'draw' : 'completed';
      newState.winnerId = winnerId === 'draw' ? null : winnerId;
    }

    return newState;
  }

  checkWinner(state: RockPaperScissorsGameState): string | 'draw' | null {
    const [player1Id, player2Id] = state.players.map(p => p.id);
    const move1 = state.moves[player1Id];
    const move2 = state.moves[player2Id];

    if (!move1 || !move2) {
      // Game is not over yet
      return null;
    }

    if (move1 === move2) {
      return 'draw';
    }

    if (winningMoves[move1] === move2) {
      return player1Id; // Player 1 wins
    }

    return player2Id; // Player 2 wins
  }

  endGame(finalState: RockPaperScissorsGameState): GameResult {
    if (finalState.status !== 'completed' && finalState.status !== 'draw') {
      throw new Error('Game cannot be ended before it is completed or drawn.');
    }
    return calculatePayouts(finalState);
  }

  getSanitizedState(state: RockPaperScissorsGameState, perspectivePlayerId?: string): Partial<RockPaperScissorsGameState> {
    const sanitizedState: any = { ...state };

    const originalMoves = sanitizedState.moves;
    delete sanitizedState.moves;

    if (perspectivePlayerId) {
      const opponent = state.players.find(p => p.id !== perspectivePlayerId);
      sanitizedState.myMove = originalMoves[perspectivePlayerId];

      if (state.status === 'completed' || state.status === 'draw') {
        sanitizedState.opponentMove = originalMoves[opponent!.id];
      } else {
        sanitizedState.opponentMove = null;
      }
    } else {
      sanitizedState.myMove = null;
      sanitizedState.opponentMove = null;
    }

    return sanitizedState;
  }
}
