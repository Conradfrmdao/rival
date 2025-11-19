import { v4 as uuidv4 } from 'uuid';
import { IGame, Player, Stakes, GameResult } from '../../../types';
import { MatatuGameState, MatatuMove, Card, suits, ranks } from './types';
import { calculatePayouts } from '../../payout';

const INITIAL_HAND_SIZE = 7;

export class MatatuGame implements IGame<MatatuGameState, MatatuMove> {
  createGame(players: Player[], stakes: Stakes): MatatuGameState {
    if (players.length !== 2) {
      throw new Error('Matatu requires exactly 2 players.');
    }

    const deck = this.createDeck();
    this.shuffleDeck(deck);

    const playerHands: { [playerId: string]: Card[] } = {};
    playerHands[players[0].id] = deck.splice(0, INITIAL_HAND_SIZE);
    playerHands[players[1].id] = deck.splice(0, INITIAL_HAND_SIZE);

    const discardPile = deck.splice(0, 1);

    return {
      gameId: uuidv4(),
      gameType: 'matatu',
      players,
      stakes,
      status: 'in-progress',
      playerHands,
      drawPile: deck,
      discardPile,
      currentPlayerId: players[0].id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  makeMove(currentState: MatatuGameState, move: MatatuMove): MatatuGameState {
    const { playerId, action, card } = move;

    if (playerId !== currentState.currentPlayerId) {
      throw new Error("It's not your turn.");
    }

    const newState = JSON.parse(JSON.stringify(currentState)); // Deep copy for immutability

    if (action === 'drawCard') {
      if (newState.drawPile.length === 0) {
        throw new Error('Draw pile is empty. Cannot draw.');
      }
      const drawnCard = newState.drawPile.shift()!;
      newState.playerHands[playerId].push(drawnCard);
    } else if (action === 'playCard') {
      if (!card) throw new Error('A card must be provided to play.');

      const playerHand = newState.playerHands[playerId];
      const cardIndex = playerHand.findIndex(c => c.rank === card.rank && c.suit === card.suit);

      if (cardIndex === -1) {
        throw new Error('Player does not have this card.');
      }

      const topDiscard = newState.discardPile[newState.discardPile.length - 1];
      if (card.rank !== topDiscard.rank && card.suit !== topDiscard.suit) {
        throw new Error('Card must match the rank or suit of the top discard card.');
      }

      // Move card from hand to discard pile
      playerHand.splice(cardIndex, 1);
      newState.discardPile.push(card);
    }

    // Switch to the next player
    const nextPlayer = newState.players.find(p => p.id !== playerId)!;
    newState.currentPlayerId = nextPlayer.id;
    newState.updatedAt = Date.now();

    const winnerId = this.checkWinner(newState);
    if (winnerId) {
      newState.status = winnerId === 'draw' ? 'draw' : 'completed';
      newState.winnerId = winnerId === 'draw' ? null : winnerId;
      newState.currentPlayerId = null; // No more moves
    }

    return newState;
  }

  checkWinner(state: MatatuGameState): string | 'draw' | null {
    for (const player of state.players) {
      if (state.playerHands[player.id].length === 0) {
        return player.id; // Player with no cards left wins
      }
    }

    // Check for a draw (empty draw pile and no one can play)
    if (state.drawPile.length === 0) {
        const currentPlayerHand = state.playerHands[state.currentPlayerId!];
        const topDiscard = state.discardPile[state.discardPile.length - 1];
        const canPlay = currentPlayerHand.some(c => c.rank === topDiscard.rank || c.suit === topDiscard.suit);
        if(!canPlay) return 'draw';
    }

    return null; // Game continues
  }

  endGame(finalState: MatatuGameState): GameResult {
    if (finalState.status !== 'completed' && finalState.status !== 'draw') {
      throw new Error('Game cannot be ended before it is completed or drawn.');
    }
    return calculatePayouts(finalState);
  }

  getSanitizedState(state: MatatuGameState, perspectivePlayerId?: string): Partial<MatatuGameState> {
    const sanitizedState: Partial<MatatuGameState> = {
        gameId: state.gameId,
        gameType: state.gameType,
        players: state.players,
        stakes: state.stakes,
        status: state.status,
        discardPile: state.discardPile,
        currentPlayerId: state.currentPlayerId,
        winnerId: state.winnerId,
        // Provide counts instead of the full hands/piles for privacy
        drawPileCount: state.drawPile.length,
        playerHandCounts: {},
    };

    for(const player of state.players) {
        (sanitizedState.playerHandCounts as any)[player.id] = state.playerHands[player.id].length;
    }

    // The requesting player gets to see their own hand
    if (perspectivePlayerId) {
        (sanitizedState as any).myHand = state.playerHands[perspectivePlayerId];
    }

    return sanitizedState;
  }

  // --- Private Helper Methods ---

  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
    return deck;
  }

  private shuffleDeck(deck: Card[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
}
