'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RockPaperScissorsProps {
  onMove: (move: 'rock' | 'paper' | 'scissors') => void;
  opponentMove?: 'rock' | 'paper' | 'scissors' | null;
  result?: 'win' | 'lose' | 'draw' | null;
  timeLeft: number;
  disabled: boolean;
}

const CHOICES = [
  { value: 'rock' as const, emoji: '✊', label: 'Rock' },
  { value: 'paper' as const, emoji: '✋', label: 'Paper' },
  { value: 'scissors' as const, emoji: '✌️', label: 'Scissors' },
];

const CHOICE_EMOJIS = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};

export default function RockPaperScissors({
  onMove,
  opponentMove,
  result,
  timeLeft,
  disabled,
}: RockPaperScissorsProps) {
  const [selectedMove, setSelectedMove] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (result) {
      setShowResult(true);
    } else {
      setShowResult(false);
      setSelectedMove(null);
    }
  }, [result]);

  const handleChoice = (choice: 'rock' | 'paper' | 'scissors') => {
    if (disabled) return;
    setSelectedMove(choice);
    onMove(choice);
  };

  const getResultMessage = () => {
    if (!result || !opponentMove) return '';

    switch (result) {
      case 'win':
        return `You Win! ${CHOICE_EMOJIS[selectedMove || 'rock']} beats ${CHOICE_EMOJIS[opponentMove]}`;
      case 'lose':
        return `You Lose! ${CHOICE_EMOJIS[opponentMove]} beats ${CHOICE_EMOJIS[selectedMove || 'rock']}`;
      case 'draw':
        return `It's a Draw! Both chose ${CHOICE_EMOJIS[selectedMove || 'rock']}`;
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
        <p className="text-gray-600 dark:text-gray-400 mt-2">seconds remaining</p>
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Player Side */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Move</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            {selectedMove ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-4"
              >
                {CHOICE_EMOJIS[selectedMove]}
              </motion.div>
            ) : (
              <div className="text-6xl mb-4 opacity-30">❓</div>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              {selectedMove ? CHOICES.find(c => c.value === selectedMove)?.label : 'Choose your move'}
            </p>
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{
                scale: showResult ? [1, 1.2, 1] : 1,
              }}
              className="text-2xl font-bold text-gray-400 dark:text-gray-600"
            >
              VS
            </motion.div>
          </div>
        </div>

        {/* Opponent Side */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Opponent's Move</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            {opponentMove ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-4"
              >
                {CHOICE_EMOJIS[opponentMove]}
              </motion.div>
            ) : (
              <div className="text-6xl mb-4 opacity-30">❓</div>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              {opponentMove ? CHOICES.find(c => c.value === opponentMove)?.label : 'Waiting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Choices */}
      {!disabled && !selectedMove && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Choose Your Move
          </h3>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {CHOICES.map((choice) => (
              <motion.button
                key={choice.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChoice(choice.value)}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-2">{choice.emoji}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {choice.label}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {showResult && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className={`text-xl font-bold mb-4 ${getResultColor()}`}>
            {getResultMessage()}
          </div>

          {result === 'win' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              className="text-4xl mb-4"
            >
              🎉
            </motion.div>
          )}

          {result === 'lose' && (
            <motion.div
              animate={{ x: [-10, 10, -10, 10, 0] }}
              className="text-4xl mb-4"
            >
              😔
            </motion.div>
          )}

          {result === 'draw' && (
            <div className="text-4xl mb-4">🤝</div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {disabled && !showResult && (
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Waiting for opponent...</p>
        </div>
      )}
    </div>
  );
}