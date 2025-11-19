'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

const TicTacToeUI = ({ gameState, onMove }) => {
  const { user } = useAuthStore();
  const { board, marks, currentPlayerId, winnerId, status } = gameState;
  const myPlayerId = user?.id;

  const handleCellClick = (index: number) => {
    if (board[index] || myPlayerId !== currentPlayerId || status !== 'in-progress') {
      return;
    }
    onMove({ position: index });
  };

  const getCellContent = (index: number) => {
    const playerId = board[index];
    if (!playerId) return null;
    return marks[playerId];
  };

  const renderResult = () => {
    if (status !== 'completed' && status !== 'draw') return null;

    if (winnerId === myPlayerId) {
      return <h2 className="text-3xl font-bold text-green-400">You Win!</h2>;
    } else if (winnerId) {
      return <h2 className="text-3xl font-bold text-red-400">You Lose!</h2>;
    } else {
      return <h2 className="text-3xl font-bold text-yellow-400">It's a Draw!</h2>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-white">
        <h1 className="text-4xl font-bold mb-8">Tic Tac Toe</h1>
        <div className="mb-4">
            {renderResult()}
        </div>
        <div className="grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
                <motion.button
                    key={index}
                    whileHover={{ scale: !cell ? 1.05 : 1 }}
                    whileTap={{ scale: !cell ? 0.95 : 1 }}
                    onClick={() => handleCellClick(index)}
                    className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center text-4xl font-bold"
                    disabled={!!cell || myPlayerId !== currentPlayerId || status !== 'in-progress'}
                >
                    {getCellContent(index)}
                </motion.button>
            ))}
        </div>
        <div className="mt-4 text-xl">
            {status === 'in-progress' && (
                <p>Turn: {currentPlayerId === myPlayerId ? 'Your turn' : "Opponent's turn"}</p>
            )}
        </div>
    </div>
  );
};

export default TicTacToeUI;
