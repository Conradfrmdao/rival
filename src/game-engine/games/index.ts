import { registerGame } from '../manager';
import { RockPaperScissorsGame } from './rock-paper-scissors';
import { TicTacToeGame } from './tic-tac-toe';
import { BallInCupGame } from './ball-in-cup';
import { PenaltyTakeGame } from './penalty-take';
import { MatatuGame } from './matatu';
import { CloverChessGame } from './clover-chess';

/**
 * This file is the central registry for all games in the Rival platform.
 * When a new game is implemented, it must be imported and registered here.
 */
export function initializeGames() {
  console.log('[GameRegistry] Initializing all games...');

  // Register Rock Paper Scissors
  registerGame('rock-paper-scissors', new RockPaperScissorsGame());

  // Register Tic Tac Toe
  registerGame('tic-tac-toe', new TicTacToeGame());

  // Register Ball in the Cup
  registerGame('ball-in-cup', new BallInCupGame());

  // Register Penalty Take
  registerGame('penalty-take', new PenaltyTakeGame());

  // Register Matatu
  registerGame('matatu', new MatatuGame());

  // Register Clover Chess
  registerGame('clover-chess', new CloverChessGame());

  console.log('[GameRegistry] All games initialized.');
}
