'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

const BallInCupUI = ({ gameState, onMove }) => {
  const { user } = useAuthStore();
  const { status, phase, guesserId, winnerId, ballPosition, guess } = gameState;
  const myPlayerId = user?.id;
  const isGuesser = myPlayerId === guesserId;

  const handleCupClick = (cupIndex: number) => {
    if (isGuesser && phase === 'guessing' && status === 'in-progress') {
      onMove({ cupIndex });
    }
  };

  const renderResult = () => {
    if (status !== 'completed' && status !== 'draw') return null;

    if (winnerId === myPlayerId) {
      return <h2 className="text-3xl font-bold text-green-400">You Win!</h2>;
    } else {
      return <h2 className="text-3xl font-bold text-red-400">You Lose!</h2>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">Ball in the Cup</h1>

      <div className="mb-8">
        {renderResult()}
      </div>

      <div className="flex gap-8 mb-8">
        {[0, 1, 2].map(cupIndex => (
          <motion.div key={cupIndex} className="flex flex-col items-center">
            <motion.button
              whileHover={{ scale: isGuesser && phase === 'guessing' ? 1.05 : 1 }}
              whileTap={{ scale: isGuesser && phase === 'guessing' ? 0.95 : 1 }}
              onClick={() => handleCupClick(cupIndex)}
              disabled={!isGuesser || phase !== 'guessing' || status !== 'in-progress'}
              className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-5xl relative disabled:opacity-50"
            >
              <span>🥛</span>
              {phase === 'revealed' && ballPosition === cupIndex && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute text-4xl"
                >
                  ⚽
                </motion.div>
              )}
            </motion.button>
            {guess === cupIndex && <div className="mt-2 text-xl">Your Guess</div>}
          </motion.div>
        ))}
      </div>

      <div className="text-xl">
        {phase === 'hiding' && <p>The hider is placing the ball...</p>}
        {isGuesser && phase === 'guessing' && <p>Your turn to guess!</p>}
        {!isGuesser && phase === 'guessing' && <p>Waiting for the guesser...</p>}
      </div>
    </div>
  );
};

export default BallInCupUI;
