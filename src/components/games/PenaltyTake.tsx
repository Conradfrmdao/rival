'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

const PenaltyTakeUI = ({ gameState, onMove }) => {
  const { user } = useAuthStore();
  const { roles, score, currentRound, shots, status, winnerId } = gameState;
  const myPlayerId = user?.id;
  const myRole = myPlayerId ? roles[myPlayerId] : null;

  const lastShot = shots.length > 0 ? shots[shots.length - 1] : null;

  const handleAction = (position: number) => {
    if (myRole === 'striker') {
      // In a real UI, you'd have a power meter, but for simplicity we'll use a fixed power.
      onMove({ action: 'striker', position, power: 80 });
    } else if (myRole === 'keeper') {
      onMove({ action: 'keeper', position });
    }
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
      <h1 className="text-4xl font-bold mb-4">Penalty Take</h1>
      <p className="text-xl mb-4">Round: {currentRound}</p>
      <p className="text-xl mb-8">Score: You {score[myPlayerId] || 0} - Opponent {score[Object.keys(score).find(id => id !== myPlayerId)] || 0}</p>

      <div className="mb-8">
          {renderResult()}
      </div>

      <div className="w-full max-w-md bg-green-800/20 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                  <motion.button
                      key={i}
                      onClick={() => handleAction(i)}
                      disabled={status !== 'in-progress' || (myRole === 'striker' && lastShot?.shot) || (myRole === 'keeper' && lastShot?.dive)}
                      className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center text-xl font-bold disabled:opacity-50"
                  >
                      {myRole === 'striker' ? 'SHOOT' : 'DIVE'}
                  </motion.button>
              ))}
          </div>
      </div>

      <div className="mt-4 text-xl">
        <p>Your role: {myRole}</p>
      </div>

    </div>
  );
};

export default PenaltyTakeUI;
