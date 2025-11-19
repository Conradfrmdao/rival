import { v4 as uuidv4 } from 'uuid';
import { IGame, Player, Stakes, GameResult } from '../../../types';
import { TicTacToeGameState, TicTacToeMove, Board } from './types';
import { calculatePayouts } from '../../payout';

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],             // Diagonals
];

export class TicTacToeGame implements IGame<TicTacToeGameState, TicTacToeMove> {
  createGame(players: Player[], stakes: Stakes): TicTacToeGameState {
    if (players.length !== 2) {
      throw new Error('Tic Tac Toe requires exactly 2 players.');
    }

    const player1Id = players[0].id;
    const player2Id = players[1].id;

    // Randomly decide who starts
    const starterId = Math.random() < 0.5 ? player1Id : player2Id;

    return {
      gameId: uuidv4(),
      gameType: 'tic-tac-toe',
      players,
      stakes,
      status: 'in-progress',
      board: Array(9).fill(null),
      marks: {
        [player1Id]: 'X',
        [player2Id]: 'O',
      },
      currentPlayerId: starterId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  makeMove(currentState: TicTacToeGameState, move: TicTacToeMove): TicTacToeGameState {
    const { playerId, position } = move;

    if (playerId !== currentState.currentPlayerId) {
      throw new Error("It's not your turn.");
    }

    if (currentState.board[position] !== null) {
      throw new Error('This cell is already occupied.');
    }

    if (position < 0 || position > 8) {
        throw new Error('Invalid move. Position must be between 0 and 8.')
    }

    const newBoard = [...currentState.board];
    newBoard[position] = playerId;

    const nextPlayerId = currentState.players.find(p => p.id !== playerId)!.id;

    const newState: TicTacToeGameState = {
      ...currentState,
      board: newBoard,
      currentPlayerId: nextPlayerId,
      updatedAt: Date.now(),
    };

    const winnerId = this.checkWinner(newState);
    if (winnerId) {
      newState.status = winnerId === 'draw' ? 'draw' : 'completed';
      newState.winnerId = winnerId === 'draw' ? null : winnerId;
      newState.currentPlayerId = null; // No more moves
    }

    return newState;
  }

  checkWinner(state: TicTacToeGameState): string | 'draw' | null {
    const { board } = state;

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // Returns the winner's ID
      }
    }

    // Check for a draw (if all cells are filled and no winner)
    if (board.every(cell => cell !== null)) {
      return 'draw';
    }

    // Game is still in progress
    return null;
  }

  endGame(finalState: TicTacToeGameState): GameResult {
    if (finalState.status !== 'completed' && finalState.status !== 'draw') {
      throw new Error('Game cannot be ended before it is completed or drawn.');
    }
    return calculatePayouts(finalState);
  }

  getSanitizedState(state: TicTacToeGameState, perspectivePlayerId?: string): Partial<TicTacToeGameState> {
    // For Tic Tac Toe, the entire state is public knowledge, so we can return it as is.
    return {
      gameId: state.gameId,
      gameType: state.gameType,
      players: state.players,
      stakes: state.stakes,
      status: state.status,
      board: state.board,
      marks: state.marks,
      currentPlayerId: state.currentPlayerId,
      winnerId: state.winnerId,
    };
  }
}
