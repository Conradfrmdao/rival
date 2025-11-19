import { PenaltyTakeGame } from '../games/penalty-take';
import { Player, Stakes } from '../../types';
import { PenaltyTakeMove } from '../games/penalty-take/types';

describe('PenaltyTakeGame', () => {
  const game = new PenaltyTakeGame();
  const player1: Player = { id: 'p1', name: 'Alice' };
  const player2: Player = { id: 'p2', name: 'Bob' };
  const players = [player1, player2];
  const stakes: Stakes = { amount: 10, currency: 'USD' };

  it('should create a new game correctly', () => {
    const state = game.createGame(players, stakes);
    expect(state.gameType).toBe('penalty-take');
    expect(state.players.length).toBe(2);
    expect(state.status).toBe('in-progress');
    expect(state.currentRound).toBe(1);
    expect(Object.keys(state.roles).length).toBe(2);
    expect(state.score.p1).toBe(0);
    expect(state.score.p2).toBe(0);
  });

  it('should allow a striker to shoot', () => {
    let state = game.createGame(players, stakes);
    const strikerId = game.getPlayerIdByRole(state, 'striker');
    const move: PenaltyTakeMove = { playerId: strikerId, action: 'striker', position: 1, power: 80 };
    state = game.makeMove(state, move);
    const currentShot = game.getCurrentShot(state);
    expect(currentShot?.shot).toEqual({ position: 1, power: 80 });
    expect(state.currentPlayerId).not.toBe(strikerId);
  });

  it('should allow a keeper to dive', () => {
    let state = game.createGame(players, stakes);
    const strikerId = game.getPlayerIdByRole(state, 'striker');
    const keeperId = game.getPlayerIdByRole(state, 'keeper');
    state = game.makeMove(state, { playerId: strikerId, action: 'striker', position: 1, power: 80 });
    const move: PenaltyTakeMove = { playerId: keeperId, action: 'keeper', position: 1 };
    state = game.makeMove(state, move);
    const currentShot = game.getCurrentShot(state);
    expect(currentShot?.dive).toEqual({ position: 1 });
  });

  it('should resolve a round after both players have moved', () => {
    let state = game.createGame(players, stakes);
    const strikerId = game.getPlayerIdByRole(state, 'striker');
    const keeperId = game.getPlayerIdByRole(state, 'keeper');

    // Striker scores
    state = game.makeMove(state, { playerId: strikerId, action: 'striker', position: 1, power: 80 });
    state = game.makeMove(state, { playerId: keeperId, action: 'keeper', position: 2 });

    expect(state.score[strikerId]).toBe(1);
    expect(state.score[keeperId]).toBe(0);
    expect(state.currentRound).toBe(2);
  });

  it('should swap roles for the next round', () => {
    let state = game.createGame(players, stakes);
    const originalStriker = game.getPlayerIdByRole(state, 'striker');
    const originalKeeper = game.getPlayerIdByRole(state, 'keeper');

    // Complete round 1
    state = game.makeMove(state, { playerId: originalStriker, action: 'striker', position: 1, power: 80 });
    state = game.makeMove(state, { playerId: originalKeeper, action: 'keeper', position: 1 });

    expect(state.currentRound).toBe(2);
    expect(state.roles[originalStriker]).toBe('keeper');
    expect(state.roles[originalKeeper]).toBe('striker');
  });
});
