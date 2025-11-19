import { GameState, GameResult, Player } from './types';

// The platform's fee percentage for all games.
const APP_FEE_PERCENTAGE = 0.10; // 10%

/**
 * Calculates the final payouts for a completed game based on its final state.
 *
 * @param finalState - The game state after a winner has been determined or a draw has occurred.
 * @returns A GameResult object containing the final status and the calculated payouts for each player.
 * @throws Error if the game status is not 'completed' or 'draw', or if a winnerId is missing on completion.
 */
export function calculatePayouts(finalState: GameState): GameResult {
  const { status, players, stakes, winnerId } = finalState;

  const payouts: { [playerId: string]: { amount: number; currency: string } } = {};

  if (status === 'draw') {
    // In a draw, each player gets their stake back. No fee is taken.
    players.forEach(player => {
      payouts[player.id] = { amount: stakes.amount, currency: stakes.currency };
    });

    return {
      status: 'draw',
      payouts,
      platformFee: { amount: 0, currency: stakes.currency },
    };
  } else if (status === 'completed') {
    if (!winnerId) {
      throw new Error(`Game status is 'completed' but no winnerId is provided.`);
    }

    const totalPot = stakes.amount * players.length;
    const appFee = totalPot * APP_FEE_PERCENTAGE;
    const winnerPayout = totalPot - appFee;

    // Initialize all players with a zero payout
    players.forEach(player => {
        payouts[player.id] = { amount: 0, currency: stakes.currency };
    });

    // Set the winner's payout
    payouts[winnerId] = { amount: winnerPayout, currency: stakes.currency };

    return {
      status: 'completed',
      winnerId,
      payouts,
      platformFee: { amount: appFee, currency: stakes.currency },
    };
  } else {
    throw new Error(`Cannot calculate payouts for a game with status: '${status}'`);
  }
}
