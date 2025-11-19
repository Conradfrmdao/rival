import { registerGame } from '../manager';
import { RockPaperScissorsGame } from './rock-paper-scissors';
import { TicTacToeGame } from './tic-tac-toe';

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

  console.log('[GameRegistry] All games initialized.');
}
