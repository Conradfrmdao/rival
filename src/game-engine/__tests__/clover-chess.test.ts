import { CloverChessGame } from '../games/clover-chess';
import { Player, Stakes } from '../../types';
import { CloverChessMove } from '../games/clover-chess/types';

describe('CloverChessGame', () => {
  const game = new CloverChessGame();
  const p1: Player = { id: 'p1', name: 'Alice' };
  const p2: Player = { id: 'p2', name: 'Bob' };
  const p3: Player = { id: 'p3', name: 'Charlie' };
  const p4: Player = { id: 'p4', name: 'Dave' };
  const players = [p1, p2, p3, p4];
  const stakes: Stakes = { amount: 100, currency: 'USD' };

  it('should create a new 4-player game correctly', () => {
    const state = game.createGame(players, stakes);
    expect(state.gameType).toBe('clover-chess');
    expect(state.players.length).toBe(4);
    expect(state.status).toBe('in-progress');
    expect(state.board.length).toBe(16);
    expect(state.eliminatedPlayers.length).toBe(0);
    // Check if a corner is non-playable
    expect(state.board[0][0]).toBeUndefined();
    // Check if a player's piece is in the correct starting position
    expect(state.board[12][4]?.type).toBe('rook');
    expect(state.board[12][4]?.color).toBe('white');
  });

  it('should allow a valid knight move', () => {
    let state = game.createGame(players, stakes);
    const whitePlayerId = Object.keys(state.playerColors).find(id => state.playerColors[id] === 'white')!;
    state.currentPlayerId = whitePlayerId;

    // White knight's opening move
    const move: CloverChessMove = { playerId: whitePlayerId, from: { row: 12, col: 5 }, to: { row: 10, col: 6 } };
    state = game.makeMove(state, move);
    expect(state.board[10][6]?.type).toBe('knight');
    expect(state.board[12][5]).toBeNull();
  });

  it('should prevent moving another player\'s piece', () => {
    let state = game.createGame(players, stakes);
    const whitePlayerId = Object.keys(state.playerColors).find(id => state.playerColors[id] === 'white')!;
    const blackPlayerId = Object.keys(state.playerColors).find(id => state.playerColors[id] === 'black')!;
    state.currentPlayerId = whitePlayerId;

    // White player tries to move a black pawn
    const move: CloverChessMove = { playerId: whitePlayerId, from: { row: 2, col: 4 }, to: { row: 3, col: 4 } };
    expect(() => game.makeMove(state, move)).toThrow('Invalid move: You can only move your own pieces.');
  });

  it('should eliminate a player when their king is captured', () => {
    let state = game.createGame(players, stakes);
    const whitePlayerId = Object.keys(state.playerColors).find(id => state.playerColors[id] === 'white')!;
    const redPlayerId = Object.keys(state.playerColors).find(id => state.playerColors[id] === 'red')!;
    state.currentPlayerId = whitePlayerId;

    // Manually set up a capture scenario
    state.board[5][4] = { type: 'king', color: 'red' }; // Red king
    state.board[6][4] = { type: 'rook', color: 'white' }; // White rook

    const move: CloverChessMove = { playerId: whitePlayerId, from: { row: 6, col: 4 }, to: { row: 5, col: 4 } };
    state = game.makeMove(state, move);

    expect(state.eliminatedPlayers).toContain('red');
    expect(state.capturedPieces.white?.some(p => p.type === 'king' && p.color === 'red')).toBe(true);
  });
});
