'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BallInCupProps {
  onMove: (cupIndex: number) => void;
  result?: 'win' | 'lose' | null;
  timeLeft: number;
  disabled: boolean;
  gameState: 'waiting' | 'shuffling' | 'picking' | 'revealed';
}

const CUP_EMOJIS = ['🥛', '🥛', '🥛'];
const BALL_EMOJI = '⚽';

export default function BallInCup({
  onMove,
  result,
  timeLeft,
  disabled,
  gameState,
}: BallInCupProps) {
  const [selectedCup, setSelectedCup] = useState<number | null>(null);
  const [ballPosition, setBallPosition] = useState(0); // 0, 1, or 2
  const [showBall, setShowBall] = useState(false);
  const [shuffling, setShuffling] = useState(false);

  useEffect(() => {
    // Initialize ball position
    setBallPosition(Math.floor(Math.random() * 3));
  }, []);

  useEffect(() => {
    if (gameState === 'shuffling') {
      setShuffling(true);
      setShowBall(false);
      setSelectedCup(null);

      // Simulate shuffling animation
      const shuffleDuration = 3000; // 3 seconds of shuffling
      const interval = setInterval(() => {
        setBallPosition(prev => (prev + 1) % 3);
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setShuffling(false);
      }, shuffleDuration);

      return () => clearInterval(interval);
    } else {
        return;
    }
    }

    if (gameState === 'revealed') {
      setShowBall(true);
    }
  }, [gameState]);

  const handleCupClick = (cupIndex: number) => {
    if (disabled || gameState !== 'picking' || selectedCup !== null) return;
    setSelectedCup(cupIndex);
    onMove(cupIndex);
  };

  const getResultMessage = () => {
    if (!result || selectedCup === null) return '';

    if (result === 'win') {
      return 'You found the ball! 🎉';
    } else {
      return `Wrong cup! The ball was in cup ${ballPosition + 1} 😔`;
    }
  };

  const getResultColor = () => {
    switch (result) {
      case 'win': return 'text-green-600 dark:text-green-400';
      case 'lose': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const canInteract = gameState === 'picking' && !disabled && !selectedCup;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
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
          {gameState === 'shuffling' && 'Shuffling cups...'}
          {gameState === 'picking' && 'Pick a cup!'}
          {gameState === 'revealed' && 'Result revealed'}
          {gameState === 'waiting' && 'Get ready...'}
        </p>
      </div>

      {/* Game Area */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mb-8">
        {/* Instruction */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Find the Hidden Ball
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {gameState === 'shuffling' && 'Watch carefully as the cups shuffle!'}
            {gameState === 'picking' && 'Which cup is hiding the ball?'}
            {gameState === 'revealed' && 'The ball has been revealed!'}
            {gameState === 'waiting' && 'Get ready to find the ball!'}
          </p>
        </div>

        {/* Cups */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-8">
          {CUP_EMOJIS.map((cup, index) => (
            <div key={index} className="text-center">
              <motion.button
                whileHover={canInteract ? { scale: 1.05 } : {}}
                whileTap={canInteract ? { scale: 0.95 } : {}}
                onClick={() => handleCupClick(index)}
                disabled={!canInteract}
                className={`relative w-32 h-32 mx-auto mb-4 rounded-full transition-all ${
                  canInteract ? 'cursor-pointer' : 'cursor-not-allowed'
                } ${selectedCup === index ? 'ring-4 ring-blue-500 ring-offset-4' : ''}`}
              >
                {/* Cup emoji */}
                <motion.div
                  animate={shuffling ? { rotate: [0, 10, -10, 10, -10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="text-6xl"
                >
                  {cup}
                </motion.div>

                {/* Ball (if revealed) */}
                {(showBall || selectedCup === index) && ballPosition === index && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center text-4xl"
                  >
                    {BALL_EMOJI}
                  </motion.div>
                )}

                {/* Selection indicator */}
                {selectedCup === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>

              <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Cup {index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Visual indicator for shuffling */}
        {shuffling && (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="inline-block text-2xl"
            >
              🔄
            </motion.div>
          </div>
        )}
      </div>

      {/* Result */}
      {result && selectedCup !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`text-xl font-bold mb-4 ${getResultColor()}`}>
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
        </motion.div>
      )}

      {/* Instructions */}
      {gameState === 'picking' && !disabled && (
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Click on the cup where you think the ball is hidden
        </div>
      )}

      {/* Loading State */}
      {disabled && gameState === 'picking' && selectedCup === null && (
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Revealing result...</p>
        </div>
      )}
    </div>
  );
}