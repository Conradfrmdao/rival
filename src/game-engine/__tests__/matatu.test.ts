import { MatatuGame } from '../games/matatu';
import { Player, Stakes } from '../../types';
import { MatatuMove } from '../games/matatu/types';

describe('MatatuGame', () => {
  const game = new MatatuGame();
  const player1: Player = { id: 'p1', name: 'Alice' };
  const player2: Player = { id: 'p2', name: 'Bob' };
  const players = [player1, player2];
  const stakes: Stakes = { amount: 10, currency: 'USD' };

  it('should create a new game correctly', () => {
    const state = game.createGame(players, stakes);
    expect(state.gameType).toBe('matatu');
    expect(state.players.length).toBe(2);
    expect(state.status).toBe('in-progress');
    expect(state.playerHands.p1.length).toBe(7);
    expect(state.playerHands.p2.length).toBe(7);
    expect(state.drawPile.length).toBe(52 - 14 - 1);
    expect(state.discardPile.length).toBe(1);
  });

  it('should allow a player to draw a card', () => {
    let state = game.createGame(players, stakes);
    const initialHandSize = state.playerHands.p1.length;
    state = game.makeMove(state, { playerId: 'p1', action: 'drawCard' });
    expect(state.playerHands.p1.length).toBe(initialHandSize + 1);
    expect(state.currentPlayerId).toBe('p2');
  });

  it('should allow a player to play a valid card (matching rank)', () => {
    let state = game.createGame(players, stakes);
    const topDiscard = state.discardPile[0];
    const cardToPlay = state.playerHands.p1.find(c => c.rank === topDiscard.rank);
    if (cardToPlay) {
      const move: MatatuMove = { playerId: 'p1', action: 'playCard', card: cardToPlay };
      state = game.makeMove(state, move);
      expect(state.discardPile[state.discardPile.length - 1]).toEqual(cardToPlay);
    }
  });

  it('should allow a player to play a valid card (matching suit)', () => {
    let state = game.createGame(players, stakes);
    const topDiscard = state.discardPile[0];
    const cardToPlay = state.playerHands.p1.find(c => c.suit === topDiscard.suit);
    if (cardToPlay) {
      const move: MatatuMove = { playerId: 'p1', action: 'playCard', card: cardToPlay };
      state = game.makeMove(state, move);
      expect(state.discardPile[state.discardPile.length - 1]).toEqual(cardToPlay);
    }
  });

  it('should throw an error for an invalid card play', () => {
    let state = game.createGame(players, stakes);
    const topDiscard = state.discardPile[0];
    // Find a card that matches neither rank nor suit
    const invalidCard = state.playerHands.p1.find(c => c.rank !== topDiscard.rank && c.suit !== topDiscard.suit);
    if (invalidCard) {
      const move: MatatuMove = { playerId: 'p1', action: 'playCard', card: invalidCard };
      expect(() => game.makeMove(state, move)).toThrow('Card must match the rank or suit of the top discard card.');
    }
  });

  it('should declare a winner when a player runs out of cards', () => {
    let state = game.createGame(players, stakes);
    state.playerHands.p1 = [state.discardPile[0]]; // Give p1 a winning card
    const move: MatatuMove = { playerId: 'p1', action: 'playCard', card: state.playerHands.p1[0] };
    state = game.makeMove(state, move);
    expect(state.status).toBe('completed');
    expect(state.winnerId).toBe('p1');
  });
});
