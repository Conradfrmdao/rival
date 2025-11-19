'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

const MatatuUI = ({ gameState, onMove }) => {
  const { user } = useAuthStore();
  const { playerHands, discardPile, currentPlayerId, winnerId, status } = gameState;
  const myPlayerId = user?.id;
  const myHand = myPlayerId ? playerHands[myPlayerId] : [];

  const handlePlayCard = (card) => {
    if (myPlayerId === currentPlayerId && status === 'in-progress') {
      onMove({ action: 'playCard', card });
    }
  };

  const handleDrawCard = () => {
    if (myPlayerId === currentPlayerId && status === 'in-progress') {
      onMove({ action: 'drawCard' });
    }
  };

  const renderCard = (card, isPlayable = false) => (
    <motion.div
      key={`${card.suit}-${card.rank}`}
      whileHover={{ scale: isPlayable ? 1.05 : 1 }}
      onClick={() => isPlayable && handlePlayCard(card)}
      className={`w-20 h-28 bg-white text-black rounded-lg p-2 flex flex-col justify-between ${isPlayable ? 'cursor-pointer' : ''}`}
    >
      <span className="text-xl font-bold">{card.rank}</span>
      <span className="text-2xl">{card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}</span>
    </motion.div>
  );

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

  const topDiscard = discardPile[discardPile.length - 1];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">Matatu</h1>

      <div className="mb-8">
        {renderResult()}
      </div>

      <div className="flex justify-around w-full max-w-4xl mb-8">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-2">Discard Pile</h2>
          {topDiscard ? renderCard(topDiscard) : <div className="w-20 h-28 bg-gray-800 rounded-lg"></div>}
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-2">Draw Pile</h2>
          <div className="w-20 h-28 bg-blue-800 rounded-lg cursor-pointer" onClick={handleDrawCard}></div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Hand</h2>
        <div className="flex gap-2">
          {myHand.map(card => renderCard(card, myPlayerId === currentPlayerId))}
        </div>
      </div>

      <div className="mt-8 text-xl">
        {status === 'in-progress' && (
            <p>Turn: {currentPlayerId === myPlayerId ? 'Your turn' : "Opponent's turn"}</p>
        )}
      </div>
    </div>
  );
};

export default MatatuUI;
