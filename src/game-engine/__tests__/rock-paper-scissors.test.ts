import { RockPaperScissorsGame } from '../games/rock-paper-scissors';
import { Player, Stakes } from '../../types';

describe('RockPaperScissorsGame', () => {
  const game = new RockPaperScissorsGame();
  const player1: Player = { id: 'p1', name: 'Alice' };
  const player2: Player = { id: 'p2', name: 'Bob' };
  const stakes: Stakes = { amount: 10, currency: 'USD' };

  it('should create a new game correctly', () => {
    const state = game.createGame([player1, player2], stakes);
    expect(state.gameType).toBe('rock-paper-scissors');
    expect(state.players.length).toBe(2);
    expect(state.status).toBe('in-progress');
    expect(state.moves['p1']).toBeNull();
    expect(state.moves['p2']).toBeNull();
  });

  it('should record a player\'s move', () => {
    let state = game.createGame([player1, player2], stakes);
    state = game.makeMove(state, { playerId: 'p1', move: 'rock' });
    expect(state.moves['p1']).toBe('rock');
    expect(state.moves['p2']).toBeNull();
  });

  it('should throw an error for a non-existent player', () => {
    const state = game.createGame([player1, player2], stakes);
    expect(() => game.makeMove(state, { playerId: 'p3', move: 'rock' })).toThrow('Player not in this game.');
  });

  it('should determine a winner when player 1 wins', () => {
    let state = game.createGame([player1, player2], stakes);
    state = game.makeMove(state, { playerId: 'p1', move: 'rock' });
    state = game.makeMove(state, { playerId: 'p2', move: 'scissors' });
    const winnerId = game.checkWinner(state);
    expect(winnerId).toBe('p1');
  });

  it('should determine a winner when player 2 wins', () => {
    let state = game.createGame([player1, player2], stakes);
    state = game.makeMove(state, { playerId: 'p1', move: 'paper' });
    state = game.makeMove(state, { playerId: 'p2', move: 'scissors' });
    const winnerId = game.checkWinner(state);
    expect(winnerId).toBe('p2');
  });

  it('should determine a draw', () => {
    let state = game.createGame([player1, player2], stakes);
    state = game.makeMove(state, { playerId: 'p1', move: 'rock' });
    state = game.makeMove(state, { playerId: 'p2', move: 'rock' });
    const winnerId = game.checkWinner(state);
    expect(winnerId).toBe('draw');
  });

  it('should not determine a winner if not all players have moved', () => {
    let state = game.createGame([player1, player2], stakes);
    state = game.makeMove(state, { playerId: 'p1', move: 'rock' });
    const winnerId = game.checkWinner(state);
    expect(winnerId).toBeNull();
  });

  it('should correctly sanitize the state for player 1 before both moves', () => {
      let state = game.createGame([player1, player2], stakes);
      state = game.makeMove(state, { playerId: 'p1', move: 'rock' });

      const sanitizedState = game.getSanitizedState(state, 'p1');

      expect((sanitizedState as any).myMove).toBe('rock');
      expect((sanitizedState as any).opponentMove).toBe(null);
  });

  it('should correctly sanitize the state for player 2 after both moves', () => {
      let state = game.createGame([player1, player2], stakes);
      state = game.makeMove(state, { playerId: 'p1', move: 'rock' });
      state = game.makeMove(state, { playerId: 'p2', move: 'paper' });

      const sanitizedState = game.getSanitizedState(state, 'p2');

      expect((sanitizedState as any).myMove).toBe('paper');
      expect((sanitizedState as any).opponentMove).toBe('rock');
  });
});
