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

  if (status === 'draw') {
    // In a draw, each player gets their stake back. No fee is taken.
    const payouts: { [playerId: string]: number } = {};
    players.forEach(player => {
      payouts[player.id] = stakes.amount;
    });

    return {
      status: 'draw',
      payouts,
    };
  } else if (status === 'completed') {
    if (!winnerId) {
      throw new Error(`Game status is 'completed' but no winnerId is provided.`);
    }

    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id !== winnerId);

    if (!winner) {
      throw new Error(`Winner with ID '${winnerId}' not found in players array.`);
    }

    const totalPot = stakes.amount * players.length;
    const appFee = totalPot * APP_FEE_PERCENTAGE;
    const winnerPayout = totalPot - appFee;

    const payouts: { [playerId: string]: number } = {};
    payouts[winner.id] = winnerPayout;
    if (loser) {
      payouts[loser.id] = 0;
    }

    return {
      status: 'completed',
      winner,
      loser,
      payouts,
    };
  } else {
    throw new Error(`Cannot calculate payouts for a game with status: '${status}'`);
  }
}
