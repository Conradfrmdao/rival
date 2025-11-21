'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Hand, Paper, Scissors } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const RockPaperScissorsUI = ({ gameState, onMove }) => {
  const { user } = useAuthStore();
  const { status, moves, winnerId, players } = gameState;

  const myPlayerId = user?.id;
  const opponent = players.find(p => p.id !== myPlayerId);

  const myMove = moves ? moves[myPlayerId] : null;
  const opponentMove = opponent && moves ? moves[opponent.id] : null;

  const choices = ['rock', 'paper', 'scissors'];

  const getIcon = (move) => {
    if (!move) return <span className="text-gray-400">?</span>;
    switch (move) {
      case 'rock': return <Hand className="w-16 h-16" />;
      case 'paper': return <Paper className="w-16 h-16" />;
      case 'scissors': return <Scissors className="w-16 h-16" />;
      default: return null;
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
      <h1 className="text-4xl font-bold mb-8">Rock, Paper, Scissors</h1>

      <div className="flex justify-around w-full max-w-2xl mb-8">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">You</h2>
          <div className="w-40 h-40 bg-blue-600/20 rounded-full flex items-center justify-center">
            {getIcon(myMove)}
          </div>
        </div>
        <div className="flex items-center text-4xl font-bold">VS</div>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4">Opponent</h2>
          <div className="w-40 h-40 bg-red-600/20 rounded-full flex items-center justify-center">
            {getIcon(opponentMove)}
          </div>
        </div>
      </div>

      <div className="mb-8">
        {renderResult()}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Choose your move:</h3>
        <div className="flex gap-4">
          {choices.map(choice => (
            <motion.button
              key={choice}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMove({ move: choice })}
              disabled={!!myMove || status !== 'in-progress'}
              className="p-4 bg-gray-700 rounded-lg disabled:opacity-50"
            >
              {getIcon(choice)}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissorsUI;
