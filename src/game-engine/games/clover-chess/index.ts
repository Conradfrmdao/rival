
import { v4 as uuidv4 } from 'uuid';
import { IGame, Player, Stakes, GameResult } from '../../../types';
import { CloverChessGameState, CloverChessMove, Board, Piece, PlayerColor } from './types';
import { calculatePayouts } from '../../payout';

const BOARD_SIZE = 16;

export class CloverChessGame implements IGame<CloverChessGameState, CloverChessMove> {
  createGame(players: Player[], stakes: Stakes): CloverChessGameState {
    if (players.length !== 4) {
      throw new Error('Clover Chess requires exactly 4 players.');
    }

    const initialBoard = this.createInitialBoard();
    const playerColors: { [id: string]: PlayerColor } = {
        [players[0].id]: 'white',
        [players[1].id]: 'black',
        [players[2].id]: 'red',
        [players[3].id]: 'green',
    };

    return {
      gameId: uuidv4(),
      gameType: 'clover-chess',
      players,
      stakes,
      status: 'in-progress',
      board: initialBoard,
      capturedPieces: { white: [], black: [], red: [], green: [] },
      eliminatedPlayers: [],
      currentPlayerId: players[0].id,
      playerColors, // Store mapping from playerId to color
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  makeMove(currentState: CloverChessGameState, move: CloverChessMove): CloverChessGameState {
    // Basic validation
    if (move.playerId !== currentState.currentPlayerId) {
      throw new Error("It's not your turn.");
    }

    const playerColor = (currentState as any).playerColors[move.playerId];
    if (currentState.eliminatedPlayers.includes(playerColor)) {
        throw new Error("You have been eliminated from the game.");
    }

    const piece = currentState.board[move.from.row][move.from.col];
    if (!piece || piece.color !== playerColor) {
        throw new Error("Invalid move: You can only move your own pieces.");
    }

    // TODO: Implement comprehensive move validation for each piece type
    // This is a placeholder for the complex rules of chess
    if (!this.isValidMove(currentState, move)) {
      throw new Error('Invalid move.');
    }

    const newState = JSON.parse(JSON.stringify(currentState));
    const capturedPiece = newState.board[move.to.row][move.to.col];

    if (capturedPiece) {
        newState.capturedPieces[playerColor]!.push(capturedPiece);
        // If a king is captured, the player is eliminated
        if (capturedPiece.type === 'king') {
            newState.eliminatedPlayers.push(capturedPiece.color);
        }
    }

    newState.board[move.to.row][move.to.col] = piece;
    newState.board[move.from.row][move.from.col] = null;
    piece.hasMoved = true;

    // Switch to the next active player
    let currentPlayerIndex = newState.players.findIndex(p => p.id === move.playerId);
    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % newState.players.length;
        const nextPlayer = newState.players[currentPlayerIndex];
        const nextPlayerColor = (newState as any).playerColors[nextPlayer.id];
        if (!newState.eliminatedPlayers.includes(nextPlayerColor)) {
            newState.currentPlayerId = nextPlayer.id;
            break;
        }
    } while (newState.players[currentPlayerIndex].id !== move.playerId); // Full circle check

    newState.updatedAt = Date.now();

    const winner = this.checkWinner(newState);
    if (winner) {
      newState.status = 'completed';
      newState.winnerId = winner;
      newState.currentPlayerId = null; // No more moves
    }

    return newState;
  }

  checkWinner(state: CloverChessGameState): string | 'draw' | null {
    const activePlayers = state.players.filter(p => !state.eliminatedPlayers.includes((state as any).playerColors[p.id]));
    if (activePlayers.length === 1) {
      return activePlayers[0].id;
    }
    // TODO: Implement stalemate and other draw conditions
    return null;
  }

  endGame(finalState: CloverChessGameState): GameResult {
    if (finalState.status !== 'completed') {
      throw new Error('Game is not over yet.');
    }
    return calculatePayouts(finalState);
  }

  getSanitizedState(state: CloverChessGameState, perspectivePlayerId?: string): Partial<CloverChessGameState> {
    // For chess, the whole board is public information.
    // No need to sanitize much, but we could strip player color mapping for neatness.
    const { playerColors, ...rest } = state as any;
    return rest;
  }

  private isValidMove(state: CloverChessGameState, move: CloverChessMove): boolean {
    // Placeholder for complex chess move validation logic.
    // This needs to check piece movement rules, check/checkmate, etc.
    return true; // DANGEROUS: For now, all moves are valid.
  }

  private createInitialBoard(): Board {
    const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

    // This function defines the playable area and sets up pieces for all 4 players

    const setupPlayer = (color: PlayerColor, rowOffset: number, colOffset: number, isVertical: boolean) => {
        const backRank = [
            { type: 'rook', color }, { type: 'knight', color }, { type: 'bishop', color }, { type: 'queen', color },
            { type: 'king', color }, { type: 'bishop', color }, { type: 'knight', color }, { type: 'rook', color }
        ];
        for (let i = 0; i < 8; i++) {
            if (isVertical) {
                board[rowOffset + i][colOffset + 1] = { type: 'pawn', color };
                board[rowOffset + i][colOffset] = backRank[i];
            } else {
                board[rowOffset + 1][colOffset + i] = { type: 'pawn', color };
                board[rowOffset][colOffset + i] = backRank[i];
            }
        }
    }

    // Setup non-playable areas (corners of the 16x16 grid)
    for(let r = 0; r < 4; r++) {
        for(let c = 0; c < 4; c++) {
            board[r][c] = undefined; // Top-left
            board[r][c + 12] = undefined; // Top-right
            board[r + 12][c] = undefined; // Bottom-left
            board[r + 12][c + 12] = undefined; // Bottom-right
        }
    }

    // Setup the 4 players
    setupPlayer('white', 12, 4, false); // Bottom player
    setupPlayer('black', 0, 4, false);  // Top player
    setupPlayer('red', 4, 0, true);    // Left player
    setupPlayer('green', 4, 12, true);  // Right player

    return board;
  }
}
