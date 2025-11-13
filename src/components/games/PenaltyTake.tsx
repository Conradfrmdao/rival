'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PenaltyTakeProps {
  onMove: (shot: { zone: number; power: number }) => void;
  result?: 'goal' | 'miss' | null;
  playerScore: number;
  opponentScore: number;
  currentShot: number;
  totalShots: number;
  timeLeft: number;
  disabled: boolean;
  isPlayerTurn: boolean;
}

const GOAL_ZONES = [
  { id: 0, x: 0, y: 0, label: 'Top Left' },
  { id: 1, x: 50, y: 0, label: 'Top Center' },
  { id: 2, x: 100, y: 0, label: 'Top Right' },
  { id: 3, x: 0, y: 50, label: 'Middle Left' },
  { id: 4, x: 50, y: 50, label: 'Middle Center' },
  { id: 5, x: 100, y: 50, label: 'Middle Right' },
  { id: 6, x: 0, y: 100, label: 'Bottom Left' },
  { id: 7, x: 50, y: 100, label: 'Bottom Center' },
  { id: 8, x: 100, y: 100, label: 'Bottom Right' },
];

const POWER_LEVELS = [0.3, 0.5, 0.7, 0.9, 1.0];

export default function PenaltyTake({
  onMove,
  result,
  playerScore,
  opponentScore,
  currentShot,
  totalShots,
  timeLeft,
  disabled,
  isPlayerTurn,
}: PenaltyTakeProps) {
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [power, setPower] = useState(0.5);
  const [isPowerIncreasing, setIsPowerIncreasing] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [keeperPosition, setKeeperPosition] = useState<number | null>(null);
  const [shotResult, setShotResult] = useState<{ zone: number; power: number } | null>(null);

  // Power meter animation
  useEffect(() => {
    if (disabled || !isPlayerTurn || selectedZone !== null) return;

    const interval = setInterval(() => {
      setPower(prevPower => {
        const newPower = isPowerIncreasing ? prevPower + 0.02 : prevPower - 0.02;

        if (newPower >= 1.0) {
          setIsPowerIncreasing(false);
          return 1.0;
        } else if (newPower <= 0.3) {
          setIsPowerIncreasing(true);
          return 0.3;
        }

        return newPower;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [disabled, isPlayerTurn, selectedZone, isPowerIncreasing]);

  // Handle result display
  useEffect(() => {
    if (result) {
      setShowResult(true);

      // Simulate keeper position (random for demo)
      if (result === 'miss') {
        setKeeperPosition(Math.floor(Math.random() * 9));
      }
    } else {
      setShowResult(false);
      setKeeperPosition(null);
    }
  }, [result]);

  const handleZoneClick = useCallback((zoneId: number) => {
    if (disabled || !isPlayerTurn || selectedZone !== null) return;

    const shot = { zone: zoneId, power };
    setSelectedZone(zoneId);
    setShotResult(shot);
    onMove(shot);
  }, [disabled, isPlayerTurn, selectedZone, power, onMove]);

  const getResultMessage = () => {
    if (!result) return '';

    if (result === 'goal') {
      return 'GOAL! Amazing shot!';
    } else {
      return 'SAVED! Great keeper!';
    }
  };

  const getResultColor = () => {
    switch (result) {
      case 'goal': return 'text-green-600 dark:text-green-400';
      case 'miss': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPowerColor = () => {
    if (power <= 0.4) return 'bg-green-500';
    if (power <= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPowerLabel = () => {
    if (power <= 0.4) return 'Light';
    if (power <= 0.7) return 'Medium';
    return 'Powerful';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Timer and Score */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
            timeLeft <= 5 ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
            timeLeft <= 10 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
            'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
          }`}>
            {timeLeft}
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Score</div>
            <div className="flex items-center gap-4 text-xl font-bold">
              <span className="text-blue-600 dark:text-blue-400">You: {playerScore}</span>
              <span className="text-gray-400">-</span>
              <span className="text-red-600 dark:text-red-400">Opponent: {opponentScore}</span>
            </div>
          </div>
        </div>

        <div className="text-gray-600 dark:text-gray-400">
          {isPlayerTurn ? 'Your turn to shoot' : "Opponent's turn"} - Shot {currentShot} of {totalShots}
        </div>
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Goal */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Penalty Area
          </h3>

          <div className="relative bg-green-100 dark:bg-green-900/20 rounded-lg p-4 mb-4">
            {/* Goal */}
            <div className="relative bg-white dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-600 rounded-lg h-64 mb-4">
              {/* Goal zones */}
              <div className="grid grid-cols-3 gap-1 h-full p-1">
                {GOAL_ZONES.map((zone) => (
                  <motion.button
                    key={zone.id}
                    whileHover={!disabled && isPlayerTurn && selectedZone === null ? { scale: 1.05 } : {}}
                    whileTap={!disabled && isPlayerTurn && selectedZone === null ? { scale: 0.95 } : {}}
                    onClick={() => handleZoneClick(zone.id)}
                    disabled={disabled || !isPlayerTurn || selectedZone !== null}
                    className={`relative border border-gray-200 dark:border-gray-600 rounded transition-all ${
                      !disabled && isPlayerTurn && selectedZone === null ? 'hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer' : 'cursor-not-allowed'
                    } ${selectedZone === zone.id ? 'ring-2 ring-blue-500' : ''} ${
                      keeperPosition === zone.id && result === 'miss' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    {/* Zone indicator */}
                    {selectedZone === zone.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg"
                      >
                        ⚽
                      </motion.div>
                    )}

                    {/* Keeper */}
                    {keeperPosition === zone.id && result === 'miss' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center text-2xl"
                      >
                        🧤
                      </motion.div>
                    )}

                    {/* Shot animation */}
                    {shotResult && shotResult.zone === zone.id && result === 'goal' && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center text-3xl z-10"
                      >
                        ⚽
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Goal labels */}
            <div className="grid grid-cols-3 gap-1 text-xs text-gray-600 dark:text-gray-400 text-center">
              <div>Left</div>
              <div>Center</div>
              <div>Right</div>
            </div>
          </div>

          {/* Zone hints */}
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {isPlayerTurn && selectedZone === null && 'Click a zone to aim your shot'}
            {selectedZone !== null && 'Shot taken!'}
            {!isPlayerTurn && 'Opponent is shooting...'}
          </div>
        </div>

        {/* Power Meter and Controls */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Shot Power
          </h3>

          {/* Power Meter */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Power</span>
              <span>{getPowerLabel()}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <motion.div
                animate={{ width: `${power * 100}%` }}
                transition={{ duration: 0.1 }}
                className={`h-full ${getPowerColor()}`}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Light</span>
              <span>Medium</span>
              <span>Powerful</span>
            </div>
          </div>

          {/* Shot Information */}
          {selectedZone !== null && shotResult && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Shot</h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>Target: {GOAL_ZONES.find(z => z.id === shotResult.zone)?.label}</div>
                <div>Power: {getPowerLabel()}</div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">🎯 How to play:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Wait for the power meter to reach your desired level</li>
              <li>Click on a zone in the goal to shoot</li>
              <li>Higher power = faster shot but less accuracy</li>
              <li>Lower power = more accurate but easier to save</li>
            </ul>
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
          <div className={`text-3xl font-bold mb-4 ${getResultColor()}`}>
            {getResultMessage()}
          </div>

          {result === 'goal' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
          )}

          {result === 'miss' && (
            <motion.div
              animate={{ x: [-10, 10, -10, 10, 0] }}
              className="text-6xl mb-4"
            >
              😔
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {disabled && !showResult && !isPlayerTurn && (
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Opponent taking their shot...</p>
        </div>
      )}
    </div>
  );
}