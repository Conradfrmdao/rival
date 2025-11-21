import { TicTacToeGame } from '../games/tic-tac-toe';
import { Player, Stakes } from '../../types';
import { TicTacToeMove } from '../games/tic-tac-toe/types';

describe('TicTacToeGame', () => {
  const game = new TicTacToeGame();
  const player1: Player = { id: 'p1', name: 'Alice' };
  const player2: Player = { id: 'p2', name: 'Bob' };
  const stakes: Stakes = { amount: 10, currency: 'USD' };

  it('should create a new game correctly', () => {
    const state = game.createGame([player1, player2], stakes);
    expect(state.gameType).toBe('tic-tac-toe');
    expect(state.players.length).toBe(2);
    expect(state.status).toBe('in-progress');
    expect(state.board).toEqual(Array(9).fill(null));
    expect(state.marks['p1']).toBe('X');
    expect(state.marks['p2']).toBe('O');
  });

  it('should allow a player to make a valid move', () => {
    let state = game.createGame([player1, player2], stakes);
    const firstPlayer = state.currentPlayerId;
    const move: TicTacToeMove = { playerId: firstPlayer!, position: 0 };
    state = game.makeMove(state, move);
    expect(state.board[0]).toBe(firstPlayer);
    const secondPlayer = (firstPlayer === 'p1') ? 'p2' : 'p1';
    expect(state.currentPlayerId).toBe(secondPlayer);
  });

  it('should throw an error if a player moves to an occupied cell', () => {
    let state = game.createGame([player1, player2], stakes);
    const firstPlayer = state.currentPlayerId!;
    const secondPlayer = (firstPlayer === 'p1') ? 'p2' : 'p1';
    state = game.makeMove(state, { playerId: firstPlayer, position: 0 });
    expect(() => game.makeMove(state, { playerId: secondPlayer, position: 0 })).toThrow('This cell is already occupied.');
  });

  it('should throw an error if a player moves out of turn', () => {
    const state = game.createGame([player1, player2], stakes);
    const secondPlayer = (state.currentPlayerId === 'p1') ? 'p2' : 'p1';
    expect(() => game.makeMove(state, { playerId: secondPlayer, position: 0 })).toThrow("It's not your turn.");
  });

  it('should determine a winner by row', () => {
    let state = game.createGame([player1, player2], stakes);
    const firstPlayer = state.currentPlayerId!;
    const secondPlayer = (firstPlayer === 'p1') ? 'p2' : 'p1';

    state = game.makeMove(state, { playerId: firstPlayer, position: 0 });
    state = game.makeMove(state, { playerId: secondPlayer, position: 3 });
    state = game.makeMove(state, { playerId: firstPlayer, position: 1 });
    state = game.makeMove(state, { playerId: secondPlayer, position: 4 });
    state = game.makeMove(state, { playerId: firstPlayer, position: 2 });
    expect(state.status).toBe('completed');
    expect(state.winnerId).toBe(firstPlayer);
  });

  it('should determine a draw', () => {
    let state = game.createGame([player1, player2], stakes);
    const firstPlayer = state.currentPlayerId!;
    const secondPlayer = (firstPlayer === 'p1') ? 'p2' : 'p1';
    // A known draw sequence
    const moves = [0, 4, 1, 2, 6, 3, 5, 8, 7];
    moves.forEach((pos, i) => {
        const currentPlayer = i % 2 === 0 ? firstPlayer : secondPlayer;
        if(state.status !== 'completed' && state.status !== 'draw'){
          state = game.makeMove(state, { playerId: currentPlayer, position: pos });
        }
    });
    expect(state.status).toBe('draw');
    expect(state.winnerId).toBeNull();
  });

  it('should return the same state for getSanitizedState', () => {
    const state = game.createGame([player1, player2], stakes);
    const sanitized = game.getSanitizedState(state, 'p1');
    // In TicTacToe, all state is public
    expect(sanitized).toEqual(state);
  });
});
