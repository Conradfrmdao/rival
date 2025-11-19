
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
    const piece = state.board[move.from.row][move.from.col];
    if (!piece) return false;

    // Target square must be within bounds and playable
    if (
        move.to.row < 0 || move.to.row >= BOARD_SIZE ||
        move.to.col < 0 || move.to.col >= BOARD_SIZE ||
        state.board[move.to.row][move.to.col] === undefined // Non-playable square
    ) {
        return false;
    }

    // A piece cannot capture a piece of the same color
    const destinationPiece = state.board[move.to.row][move.to.col];
    if (destinationPiece && destinationPiece.color === piece.color) {
        return false;
    }

    switch (piece.type) {
        case 'pawn':
            return this.isValidPawnMove(state, piece, move);
        // case 'rook':
        //     return this.isValidRookMove(state, piece, move);
        // case 'knight':
        //     return this.isValidKnightMove(state, piece, move);
        // case 'bishop':
        //     return this.isValidBishopMove(state, piece, move);
        // case 'queen':
        //     return this.isValidQueenMove(state, piece, move);
        // case 'king':
        //     return this.isValidKingMove(state, piece, move);
        default:
            // For now, allow other pieces to move anywhere as a placeholder
            return true;
    }
  }

  private isValidPawnMove(state: CloverChessGameState, piece: Piece, move: CloverChessMove): boolean {
    const { from, to } = move;
    const dy = to.row - from.row;
    const dx = to.col - from.col;
    const destinationPiece = state.board[to.row][to.col];

    switch (piece.color) {
        case 'white': // Moves "up" the board (decreasing row)
            // Forward move
            if (dx === 0 && !destinationPiece) {
                if (dy === -1) return true; // Standard one-step move
                // Initial two-step move
                if (dy === -2 && from.row === 13 && !state.board[from.row - 1][from.col]) return true;
            }
            // Capture move
            if (Math.abs(dx) === 1 && dy === -1 && destinationPiece) {
                return true;
            }
            break;

        case 'black': // Moves "down" the board (increasing row)
            if (dx === 0 && !destinationPiece) {
                if (dy === 1) return true; // Standard one-step move
                if (dy === 2 && from.row === 2 && !state.board[from.row + 1][from.col]) return true;
            }
            if (Math.abs(dx) === 1 && dy === 1 && destinationPiece) {
                return true;
            }
            break;

        case 'red': // Moves "right" the board (increasing col)
            if (dy === 0 && !destinationPiece) {
                if (dx === 1) return true; // Standard one-step move
                if (dx === 2 && from.col === 2 && !state.board[from.row][from.col + 1]) return true;
            }
            if (Math.abs(dy) === 1 && dx === 1 && destinationPiece) {
                return true;
            }
            break;

        case 'green': // Moves "left" the board (decreasing col)
            if (dy === 0 && !destinationPiece) {
                if (dx === -1) return true; // Standard one-step move
                if (dx === -2 && from.col === 13 && !state.board[from.row][from.col - 1]) return true;
            }
            if (Math.abs(dy) === 1 && dx === -1 && destinationPiece) {
                return true;
            }
            break;
    }

    return false;
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
