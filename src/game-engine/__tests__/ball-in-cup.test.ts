import { BallInCupGame } from '../games/ball-in-cup';
import { Player, Stakes } from '../../types';
import { BallInCupMove } from '../games/ball-in-cup/types';

describe('BallInCupGame', () => {
  const game = new BallInCupGame();
  const player1: Player = { id: 'p1', name: 'Alice' };
  const stakes: Stakes = { amount: 10, currency: 'USD' };

  it('should create a new game correctly', () => {
    const state = game.createGame([player1], stakes);
    expect(state.gameType).toBe('ball-in-cup');
    expect(state.players.length).toBe(1);
    expect(state.status).toBe('in-progress');
    expect(state.ballPosition).toBeGreaterThanOrEqual(0);
    expect(state.ballPosition).toBeLessThan(3);
    expect(state.playerGuess).toBeNull();
  });

  it('should allow a player to make a valid move', () => {
    let state = game.createGame([player1], stakes);
    const move: BallInCupMove = { playerId: 'p1', cupIndex: 1 };
    state = game.makeMove(state, move);
    expect(state.playerGuess).toBe(1);
    expect(state.status).not.toBe('in-progress'); // Game should end after one move
  });

  it('should determine a winner if the guess is correct', () => {
    let state = game.createGame([player1], stakes);
    // Force the ball position for a deterministic test
    const winningPosition = state.ballPosition;
    const move: BallInCupMove = { playerId: 'p1', cupIndex: winningPosition };
    state = game.makeMove(state, move);

    expect(state.status).toBe('completed');
    expect(state.winnerId).toBe('p1');
  });

  it('should determine a loser if the guess is incorrect', () => {
    let state = game.createGame([player1], stakes);
    // Force an incorrect guess
    const winningPosition = state.ballPosition;
    const losingPosition = (winningPosition + 1) % 3;
    const move: BallInCupMove = { playerId: 'p1', cupIndex: losingPosition };
    state = game.makeMove(state, move);

    expect(state.status).toBe('completed');
    expect(state.winnerId).toBe('house'); // 'house' wins when the player loses
  });

  it('should throw an error for an invalid cup index', () => {
    const state = game.createGame([player1], stakes);
    const move: BallInCupMove = { playerId: 'p1', cupIndex: 5 };
    expect(() => game.makeMove(state, move)).toThrow('Invalid move. Cup index must be 0, 1, or 2.');
  });

  it('should sanitize the state, hiding the ball position during the game', () => {
    const state = game.createGame([player1], stakes);
    const sanitized = game.getSanitizedState(state, 'p1');

    expect((sanitized as any).ballPosition).toBeUndefined();
    expect(sanitized.status).toBe('in-progress');
  });

  it('should reveal the ball position in the sanitized state after the game is over', () => {
    let state = game.createGame([player1], stakes);
    const move: BallInCupMove = { playerId: 'p1', cupIndex: 0 };
    state = game.makeMove(state, move);
    const sanitized = game.getSanitizedState(state, 'p1');

    expect(sanitized.ballPosition).toBeDefined();
    expect(sanitized.ballPosition).toBe(state.ballPosition);
  });
});
