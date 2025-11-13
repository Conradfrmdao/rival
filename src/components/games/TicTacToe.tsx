'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TicTacToeProps {
  onMove: (position: number) => void;
  board: (string | null)[];
  currentPlayer: 'X' | 'O';
  result?: 'win' | 'lose' | 'draw' | null;
  winningLine?: number[] | null;
  timeLeft: number;
  disabled: boolean;
  isPlayerTurn: boolean;
}

export default function TicTacToe({
  onMove,
  board,
  currentPlayer,
  result,
  winningLine,
  timeLeft,
  disabled,
  isPlayerTurn,
}: TicTacToeProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (result) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }, [result]);

  const handleCellClick = (index: number) => {
    if (disabled || board[index] || !isPlayerTurn) return;
    onMove(index);
  };

  const getCellContent = (index: number) => {
    if (board[index]) {
      return (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`text-6xl font-bold ${
            board[index] === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {board[index]}
        </motion.div>
      );
    }

    if (hoveredCell === index && !disabled && isPlayerTurn && !result) {
      return (
        <div className={`text-6xl font-bold opacity-30 ${
          currentPlayer === 'X' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {currentPlayer}
        </div>
      );
    }

    return null;
  };

  const isWinningCell = (index: number) => {
    return winningLine?.includes(index);
  };

  const getResultMessage = () => {
    if (!result) return '';

    switch (result) {
      case 'win':
        return 'You Win! 🎉';
      case 'lose':
        return 'You Lose! 😔';
      case 'draw':
        return "It's a Draw! 🤝";
      default:
        return '';
    }
  };

  const getResultColor = () => {
    switch (result) {
      case 'win': return 'text-green-600 dark:text-green-400';
      case 'lose': return 'text-red-600 dark:text-red-400';
      case 'draw': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Timer */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
          timeLeft <= 5 ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
          timeLeft <= 10 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
          'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {timeLeft}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isPlayerTurn ? 'Your turn' : "Opponent's turn"}
        </p>
      </div>

      {/* Game Board */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: !cell && !disabled && isPlayerTurn && !result ? 1.05 : 1 }}
                whileTap={{ scale: !cell && !disabled && isPlayerTurn && !result ? 0.95 : 1 }}
                onClick={() => handleCellClick(index)}
                onMouseEnter={() => setHoveredCell(index)}
                onMouseLeave={() => setHoveredCell(null)}
                disabled={disabled || !!cell || !isPlayerTurn}
                className={`aspect-square flex items-center justify-center rounded-lg transition-all ${
                  isWinningCell(index)
                    ? 'bg-green-100 dark:bg-green-900/20 border-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } ${!cell && !disabled && isPlayerTurn && !result ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                {getCellContent(index)}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 text-lg">
          <div className={`flex items-center gap-2 ${currentPlayer === 'X' && !result ? 'font-bold' : ''}`}>
            <span className="text-blue-600 dark:text-blue-400 text-2xl">X</span>
            <span className="text-gray-700 dark:text-gray-300">You</span>
          </div>
          <div className="text-gray-400 dark:text-gray-600">VS</div>
          <div className={`flex items-center gap-2 ${currentPlayer === 'O' && !result ? 'font-bold' : ''}`}>
            <span className="text-red-600 dark:text-red-400 text-2xl">O</span>
            <span className="text-gray-700 dark:text-gray-300">Opponent</span>
          </div>
        </div>
      </div>

      {/* Result */}
      {showResult && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className={`text-2xl font-bold mb-4 ${getResultColor()}`}>
            {getResultMessage()}
          </div>

          {result === 'win' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
          )}

          {result === 'lose' && (
            <motion.div
              animate={{ x: [-10, 10, -10, 10, 0] }}
              className="text-6xl mb-4"
            >
              😔
            </motion.div>
          )}

          {result === 'draw' && (
            <div className="text-6xl mb-4">🤝</div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {disabled && !showResult && !isPlayerTurn && (
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Waiting for opponent's move...</p>
        </div>
      )}

      {/* Instructions */}
      {!result && isPlayerTurn && (
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Click on any empty cell to make your move
        </div>
      )}
    </div>
  );
}