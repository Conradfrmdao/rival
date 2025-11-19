import { BallInCupGame } from '../games/ball-in-cup';
import { Player, Stakes } from '../../types';
import { BallInCupMove } from '../games/ball-in-cup/types';

describe('BallInCupGame', () => {
  const game = new BallInCupGame();
  const player1: Player = { id: 'p1', name: 'Alice' };
  const player2: Player = { id: 'p2', name: 'Bob' };
  const players = [player1, player2];
  const stakes: Stakes = { amount: 10, currency: 'USD' };

  it('should create a new game correctly', () => {
    const state = game.createGame(players, stakes);
    expect(state.gameType).toBe('ball-in-cup');
    expect(state.players.length).toBe(2);
    expect(state.status).toBe('in-progress');
    expect(state.phase).toBe('hiding');
    expect([state.hiderId, state.guesserId]).toContain(player1.id);
    expect([state.hiderId, state.guesserId]).toContain(player2.id);
    expect(state.ballPosition).toBeGreaterThanOrEqual(0);
    expect(state.ballPosition).toBeLessThan(3);
    expect(state.guess).toBeNull();
  });

  it('should allow the guesser to make a move', () => {
    let state = game.createGame(players, stakes);
    const guesserId = state.guesserId;
    const move: BallInCupMove = { playerId: guesserId, cupIndex: 1 };
    state = game.makeMove(state, move);
    expect(state.guess).toBe(1);
    expect(state.phase).toBe('revealed');
    expect(state.status).toBe('completed');
  });

  it('should throw an error if the hider tries to move', () => {
    const state = game.createGame(players, stakes);
    const hiderId = state.hiderId;
    const move: BallInCupMove = { playerId: hiderId, cupIndex: 1 };
    expect(() => game.makeMove(state, move)).toThrow('Only the guesser can make a move.');
  });

  it('should determine the guesser as winner for a correct guess', () => {
    let state = game.createGame(players, stakes);
    const guesserId = state.guesserId;
    const correctGuess = state.ballPosition;
    const move: BallInCupMove = { playerId: guesserId, cupIndex: correctGuess };
    state = game.makeMove(state, move);
    expect(state.winnerId).toBe(guesserId);
  });

  it('should determine the hider as winner for an incorrect guess', () => {
    let state = game.createGame(players, stakes);
    const guesserId = state.guesserId;
    const hiderId = state.hiderId;
    const incorrectGuess = (state.ballPosition + 1) % 3;
    const move: BallInCupMove = { playerId: guesserId, cupIndex: incorrectGuess };
    state = game.makeMove(state, move);
    expect(state.winnerId).toBe(hiderId);
  });

  it('should sanitize the state, hiding ball position before reveal', () => {
    const state = game.createGame(players, stakes);
    const sanitized = game.getSanitizedState(state, state.guesserId);
    expect((sanitized as any).ballPosition).toBeUndefined();
  });

  it('should reveal ball position in sanitized state after game is over', () => {
    let state = game.createGame(players, stakes);
    const move: BallInCupMove = { playerId: state.guesserId, cupIndex: 0 };
    state = game.makeMove(state, move);
    const sanitized = game.getSanitizedState(state, state.guesserId);
    expect(sanitized.ballPosition).toBe(state.ballPosition);
  });
});
