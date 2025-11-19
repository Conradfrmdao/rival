import { calculatePayouts } from '../payout';
import { GameResult, GameState, Player, Stakes } from '../../types';

describe('calculatePayouts', () => {
  const player1: Player = { id: 'player1', name: 'Alice' };
  const player2: Player = { id: 'player2', name: 'Bob' };
  const player3: Player = { id: 'player3', name: 'Charlie' };
  const player4: Player = { id: 'player4', name: 'Dave' };

  it('should correctly calculate payouts for a 2-player game with a winner', () => {
    const stakes: Stakes = { amount: 100, currency: 'USD' };
    const finalState: GameState = {
      gameId: 'test-game',
      gameType: 'test',
      players: [player1, player2],
      stakes,
      status: 'completed',
      winnerId: 'player1',
      createdAt: 0,
      updatedAt: 0,
    };

    const result = calculatePayouts(finalState);

    const expectedWinnerPayout = 180; // (100 * 2) * 0.9
    const expectedPlatformFee = 20; // (100 * 2) * 0.1

    expect(result.payouts[player1.id].amount).toBe(expectedWinnerPayout);
    expect(result.payouts[player2.id].amount).toBe(0);
    expect(result.platformFee.amount).toBe(expectedPlatformFee);
    expect(result.payouts[player1.id].currency).toBe('USD');
  });

  it('should correctly calculate payouts for a 2-player draw', () => {
    const stakes: Stakes = { amount: 100, currency: 'USD' };
    const finalState: GameState = {
      gameId: 'test-game',
      gameType: 'test',
      players: [player1, player2],
      stakes,
      status: 'draw',
      winnerId: null,
      createdAt: 0,
      updatedAt: 0,
    };

    const result = calculatePayouts(finalState);

    expect(result.payouts[player1.id].amount).toBe(100); // Stake returned
    expect(result.payouts[player2.id].amount).toBe(100); // Stake returned
    expect(result.platformFee.amount).toBe(0);
  });

    it('should correctly calculate payouts for a 4-player game with a single winner', () => {
        const stakes: Stakes = { amount: 50, currency: 'EUR' };
        const finalState: GameState = {
            gameId: '4-player-game',
            gameType: 'clover-chess',
            players: [player1, player2, player3, player4],
            stakes,
            status: 'completed',
            winnerId: player3.id,
            createdAt: 0,
            updatedAt: 0,
        };

        const result = calculatePayouts(finalState);

        const totalPot = 50 * 4; // 200
        const expectedWinnerPayout = totalPot * 0.9; // 180
        const expectedPlatformFee = totalPot * 0.1; // 20

        expect(result.payouts[player1.id].amount).toBe(0);
        expect(result.payouts[player2.id].amount).toBe(0);
        expect(result.payouts[player3.id].amount).toBe(expectedWinnerPayout);
        expect(result.payouts[player4.id].amount).toBe(0);
        expect(result.platformFee.amount).toBe(expectedPlatformFee);
        expect(result.platformFee.currency).toBe('EUR');
    });

  it('should handle zero-stake games correctly', () => {
    const stakes: Stakes = { amount: 0, currency: 'USD' };
    const finalState: GameState = {
      gameId: 'free-game',
      gameType: 'test',
      players: [player1, player2],
      stakes,
      status: 'completed',
      winnerId: player1.id,
      createdAt: 0,
      updatedAt: 0,
    };

    const result = calculatePayouts(finalState);

    expect(result.payouts[player1.id].amount).toBe(0);
    expect(result.payouts[player2.id].amount).toBe(0);
    expect(result.platformFee.amount).toBe(0);
  });

    it('should throw an error if the game is still in progress', () => {
        const stakes: Stakes = { amount: 100, currency: 'USD' };
        const finalState: GameState = {
            gameId: 'test-game',
            gameType: 'test',
            players: [player1, player2],
            stakes,
            status: 'in-progress',
            winnerId: null,
            createdAt: 0,
            updatedAt: 0,
        };

        expect(() => calculatePayouts(finalState)).toThrow("Cannot calculate payouts for a game with status: 'in-progress'");
    });
});
