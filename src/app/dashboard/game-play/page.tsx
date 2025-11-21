'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useSocketStore } from '@/store/socketStore';

// Dynamically import game components
const RockPaperScissorsUI = React.lazy(() => import('@/components/games/RockPaperScissors'));
const TicTacToeUI = React.lazy(() => import('@/components/games/TicTacToe'));
const BallInCupUI = React.lazy(() => import('@/components/games/BallInCup'));
const PenaltyTakeUI = React.lazy(() => import('@/components/games/PenaltyTake'));
const MatatuUI = React.lazy(() => import('@/components/games/Matatu'));
const CloverChessUI = React.lazy(() => import('@/components/games/CloverChess'));

const GamePlayInner = () => {
  const searchParams = useSearchParams();
  const matchId = searchParams.get('match');
  const { socket } = useSocket();
  const { gameState, error } = useSocketStore();

  useEffect(() => {
    if (socket && matchId) {
      socket.emit('join_match', { matchId });
    }
  }, [socket, matchId]);

  const handleMove = (move: any) => {
    if (socket && matchId) {
      socket.emit('game_move', { matchId, move });
    }
  };

  const renderGameComponent = () => {
    if (!gameState) {
      return <div>Loading game...</div>;
    }

    switch (gameState.gameType) {
      case 'rock-paper-scissors':
        return <RockPaperScissorsUI gameState={gameState} onMove={handleMove} />;
      case 'tic-tac-toe':
        return <TicTacToeUI gameState={gameState} onMove={handleMove} />;
      case 'ball-in-cup':
        return <BallInCupUI gameState={gameState} onMove={handleMove} />;
      case 'penalty-take':
          return <PenaltyTakeUI gameState={gameState} onMove={handleMove} />;
      case 'matatu':
          return <MatatuUI gameState={gameState} onMove={handleMove} />;
      case 'clover-chess':
          return <CloverChessUI gameState={gameState} onMove={handleMove} />;
      default:
        return <div>Unknown game type: {gameState.gameType}</div>;
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Game Play</h1>
        <p className="mb-4">Match ID: {matchId}</p>
        <Suspense fallback={<div>Loading Game UI...</div>}>
            {renderGameComponent()}
        </Suspense>
    </div>
  );
};

const GamePlayPage = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <GamePlayInner />
    </Suspense>
);

export default GamePlayPage;
