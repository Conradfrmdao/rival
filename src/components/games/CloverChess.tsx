'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

const CloverChessUI = ({ gameState, onMove }) => {
  const { user } = useAuthStore();
  const { board, playerColors, currentPlayerId, status, winnerId, capturedPieces } = gameState;
  const myPlayerId = user?.id;
  const myColor = myPlayerId ? playerColors[myPlayerId] : null;

  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);

  const handleSquareClick = (row: number, col: number) => {
    if (status !== 'in-progress') return;

    if (selectedPiece) {
      // This is the destination square
      onMove({ from: selectedPiece, to: { row, col } });
      setSelectedPiece(null);
    } else {
      // This is the piece to move
      const piece = board[row][col];
      if (piece && piece.color === myColor && myPlayerId === currentPlayerId) {
        setSelectedPiece({ row, col });
      }
    }
  };

  const renderPiece = (piece) => {
    if (!piece) return null;
    const pieceMap = {
      king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙',
    };
    const colorClass = `text-${piece.color}-400`;
    return <span className={`text-4xl ${colorClass}`}>{pieceMap[piece.type]}</span>;
  };

  const renderResult = () => {
      if (status !== 'completed') return null;
      if (winnerId === myPlayerId) {
          return <h2 className="text-3xl font-bold text-green-400">You Win!</h2>;
      } else if (winnerId) {
          return <h2 className="text-3xl font-bold text-red-400">You Lose!</h2>;
      }
  };

  return (
    <div className="flex flex-col items-center p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Clover Chess</h1>
        <div className="mb-4">{renderResult()}</div>
        <div className="grid grid-cols-16 gap-0">
            {board.map((row, r) =>
                row.map((piece, c) => {
                    const isPlayable = piece !== undefined;
                    const isSelected = selectedPiece && selectedPiece.row === r && selectedPiece.col === c;
                    return (
                        <motion.div
                            key={`${r}-${c}`}
                            onClick={() => isPlayable && handleSquareClick(r, c)}
                            className={`w-12 h-12 flex items-center justify-center
                                ${isPlayable ? ((r + c) % 2 === 0 ? 'bg-gray-700' : 'bg-gray-600') : 'bg-black'}
                                ${isSelected ? 'ring-2 ring-yellow-400' : ''}`
                            }
                        >
                            {isPlayable && renderPiece(piece)}
                        </motion.div>
                    );
                })
            )}
        </div>
        <div className="mt-4 text-xl">
            {status === 'in-progress' && (
                <p>Turn: {currentPlayerId === myPlayerId ? 'Your turn' : "Opponent's turn"}</p>
            )}
        </div>
    </div>
  );
};

export default CloverChessUI;
