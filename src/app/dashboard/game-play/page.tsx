'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import { useAuthStore } from '@/store/authStore';
import RockPaperScissors from '@/components/games/RockPaperScissors';
import TicTacToe from '@/components/games/TicTacToe';
import BallInCup from '@/components/games/BallInCup';
import PenaltyTake from '@/components/games/PenaltyTake';
import Link from 'next/link';

export default function GamePlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuthStore();

  const gameType = searchParams?.get('game') || '';
  const stakeAmount = parseInt(searchParams?.get('stake') || '0');

  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [playerMove, setPlayerMove] = useState<any>(null);
  const [opponentMove, setOpponentMove] = useState<any>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [currentShot, setCurrentShot] = useState(1);
  const [totalShots] = useState(5);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handlePlayerMove = (move: any) => {
    if (gameState !== 'playing') return;

    setPlayerMove(move);
    setTimeLeft(30);

    // Simulate opponent move after delay
    setTimeout(() => {
      simulateOpponentMove(move);
    }, 1500 + Math.random() * 1500);
  };

  const simulateOpponentMove = (playerMoveData: any) => {
    // Simulate opponent move based on game type
    let opponentMoveData: any;

    switch (gameType) {
      case 'rock_paper_scissors':
        const moves = ['rock', 'paper', 'scissors'];
        opponentMoveData = moves[Math.floor(Math.random() * moves.length)];
        break;

      case 'tic_tac_toe':
        // Simple AI for Tic Tac Toe
        const availableSpots = board.map((cell, index) => cell === null ? index : null).filter(i => i !== null);
        if (availableSpots.length > 0) {
          opponentMoveData = availableSpots[Math.floor(Math.random() * availableSpots.length)];
          // Update board for Tic Tac Toe
          const newBoard = [...board];
          newBoard[opponentMoveData] = 'O';
          setBoard(newBoard);
        }
        break;

      case 'ball_in_cup':
        opponentMoveData = Math.floor(Math.random() * 3);
        break;

      case 'penalty_take':
        opponentMoveData = { zone: Math.floor(Math.random() * 9), power: 0.5 + Math.random() * 0.5 };
        break;

      default:
        opponentMoveData = null;
    }

    setOpponentMove(opponentMoveData);
    setCurrentTurn('player');

    // Determine result
    setTimeout(() => {
      determineGameResult(playerMoveData, opponentMoveData);
    }, 1000);
  };

  const determineGameResult = (playerData: any, opponentData: any) => {
    let gameResult: 'win' | 'lose' | 'draw';

    switch (gameType) {
      case 'rock_paper_scissors':
        if (playerData === opponentData) {
          gameResult = 'draw';
        } else if (
          (playerData === 'rock' && opponentData === 'scissors') ||
          (playerData === 'paper' && opponentData === 'rock') ||
          (playerData === 'scissors' && opponentData === 'paper')
        ) {
          gameResult = 'win';
        } else {
          gameResult = 'lose';
        }
        break;

      case 'ball_in_cup':
        // Simulate ball position (random)
        const ballPosition = Math.floor(Math.random() * 3);
        gameResult = playerData === ballPosition ? 'win' : 'lose';
        break;

      case 'tic_tac_toe':
        // Simplified - just make it a draw for demo
        gameResult = 'draw';
        break;

      case 'penalty_take':
        // Simulate penalty result
        const isGoal = Math.random() > 0.5;
        if (isGoal) {
          setPlayerScore(prev => prev + 1);
        }
        gameResult = isGoal ? 'win' : 'lose';
        break;

      default:
        gameResult = 'draw';
    }

    setResult(gameResult);
    setGameState('finished');
  };

  const resetGame = () => {
    setGameState('playing');
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
    setTimeLeft(30);
    setCurrentTurn('player');
    if (gameType === 'tic_tac_toe') {
      setBoard(Array(9).fill(null));
    }
    if (gameType === 'penalty_take') {
      setCurrentShot(prev => prev + 1);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && gameState === 'playing' && currentTurn === 'player') {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      // Auto lose if time runs out
      setResult('lose');
      setGameState('finished');
    }
  }, [timeLeft, gameState, currentTurn]);

  const renderGame = () => {
    const commonProps = {
      timeLeft,
      disabled: gameState !== 'playing' || currentTurn !== 'player',
      result: gameState === 'finished' ? result : null,
    };

    switch (gameType) {
      case 'rock_paper_scissors':
        return (
          <RockPaperScissors
            {...commonProps}
            onMove={handlePlayerMove}
            opponentMove={opponentMove}
          />
        );

      case 'tic_tac_toe':
        return (
          <TicTacToe
            {...commonProps}
            onMove={handlePlayerMove}
            board={board}
            currentPlayer={'X'}
            isPlayerTurn={currentTurn === 'player'}
            winningLine={null}
          />
        );

      case 'ball_in_cup':
        return (
          <BallInCup
            {...commonProps}
            onMove={handlePlayerMove}
            gameState={gameState === 'playing' ? 'picking' : 'revealed'}
          />
        );

      case 'penalty_take':
        return (
          <PenaltyTake
            {...commonProps}
            onMove={handlePlayerMove}
            playerScore={playerScore}
            opponentScore={opponentScore}
            currentShot={currentShot}
            totalShots={totalShots}
            isPlayerTurn={currentTurn === 'player'}
            result={result as 'goal' | 'miss' | null}
          />
        );

      default:
        return (
          <div className="text-center text-white">
            <p>Game not implemented yet</p>
          </div>
        );
    }
  };

  const getGameTitle = () => {
    switch (gameType) {
      case 'rock_paper_scissors': return 'Rock Paper Scissors';
      case 'tic_tac_toe': return 'Tic Tac Toe';
      case 'ball_in_cup': return 'Ball in Cup';
      case 'penalty_take': return 'Penalty Take';
      default: return 'Unknown Game';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onLogout={handleLogout} currentPage="game-play" />
      <div className="flex">
        <Navigation />
        <main className="flex-1">
          <div className="p-6">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/games" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                ← Back to Games
              </Link>
            </div>

            {/* Game Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{getGameTitle()}</h1>
              <p className="text-gray-400">Stake: {stakeAmount.toLocaleString()} UGX</p>
              {gameState === 'finished' && (
                <div className="mt-4 space-x-4">
                  <button
                    onClick={resetGame}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                  >
                    Play Again
                  </button>
                  <Link
                    href="/dashboard/games"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg inline-block"
                  >
                    Back to Lobby
                  </Link>
                </div>
              )}
            </div>

            {/* Game Component */}
            <div className="flex items-center justify-center min-h-[400px]">
              {renderGame()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}