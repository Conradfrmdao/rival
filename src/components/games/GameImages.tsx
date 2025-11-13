'use client';

import React from 'react';

interface GameImageProps {
  gameType: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GameImage: React.FC<GameImageProps> = ({ gameType, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const renderGameImage = () => {
    switch (gameType) {
      case 'Penalty Take':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800 rounded-xl relative overflow-hidden shadow-lg">
              {/* Goal */}
              <div className="absolute bottom-0 w-full h-3/4 bg-white/20 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-1 p-2">
                  <div className="bg-white/30 rounded"></div>
                  <div className="bg-white/30 rounded"></div>
                  <div className="bg-white/30 rounded"></div>
                </div>
              </div>

              {/* Ball */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-white rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-br from-white to-gray-200 rounded-full"></div>
              </div>

              {/* Player silhouette */}
              <div className="absolute bottom-0 left-1/3 w-6 h-8 bg-blue-600/50 rounded-t-full"></div>
              <div className="absolute bottom-6 left-1/3 w-6 h-1 bg-blue-800/50 rounded"></div>

              {/* Animated effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        );

      case 'Ball in Cup':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl relative overflow-hidden shadow-lg">
              {/* Cups */}
              <div className="flex justify-center items-end h-full pb-2 gap-2">
                {/* Cup 1 - empty */}
                <div className="relative">
                  <div className="w-5 h-6 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-b-lg shadow-md border border-yellow-700"></div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-yellow-700 rounded-full"></div>
                </div>

                {/* Cup 2 - with ball */}
                <div className="relative">
                  <div className="w-5 h-6 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-b-lg shadow-md border border-yellow-700 relative">
                    {/* Ball slightly visible */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-lg animate-bounce"></div>
                  </div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-yellow-700 rounded-full"></div>
                </div>
              </div>

              {/* Magical sparkles */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-4 left-3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        );

      case 'Rock Paper Scissors':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-red-600 rounded-xl relative overflow-hidden shadow-lg">
              {/* Rock */}
              <div className="absolute bottom-2 left-2 w-5 h-5 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg shadow-md flex items-center justify-center">
                <span className="text-xs text-white font-bold">✊</span>
              </div>

              {/* Paper */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-gradient-to-br from-white to-gray-200 rounded-lg shadow-md flex items-center justify-center transform rotate-12">
                <span className="text-xs text-gray-700 font-bold">✋</span>
              </div>

              {/* Scissors */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg shadow-md flex items-center justify-center">
                <span className="text-xs text-white font-bold">✌️</span>
              </div>

              {/* VS text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-black bg-black/30 px-2 py-1 rounded">VS</span>
              </div>

              {/* Animated duel effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        );

      case 'Tic Tac Toe':
        return (
          <div className={`${sizeClasses[size]} ${className} relative`}>
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl relative overflow-hidden shadow-lg">
              {/* Game board */}
              <div className="absolute inset-2 grid grid-cols-3 gap-1">
                {/* Grid lines */}
                <div className="col-span-3 h-px bg-white/50"></div>
                <div className="col-span-3 h-px bg-white/50"></div>
                <div className="row-span-3 w-px bg-white/50 absolute top-0 left-1/3 h-full"></div>
                <div className="row-span-3 w-px bg-white/50 absolute top-0 right-1/3 h-full"></div>

                {/* X */}
                <div className="flex items-center justify-center text-white font-bold text-xs">✕</div>
                <div className="flex items-center justify-center"></div>
                <div className="flex items-center justify-center text-white font-bold text-xs">○</div>
                <div className="flex items-center justify-center"></div>
                <div className="flex items-center justify-center text-white font-bold text-xs">✕</div>
                <div className="flex items-center justify-center text-white font-bold text-xs">○</div>
                <div className="flex items-center justify-center"></div>
                <div className="flex items-center justify-center"></div>
              </div>

              {/* Winning line animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
              </div>

              {/* Sparkle effects */
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-lg`}>
            <span className="text-white/50 text-2xl">🎮</span>
          </div>
        );
    }
  };

  return renderGameImage();
};

export default GameImage;