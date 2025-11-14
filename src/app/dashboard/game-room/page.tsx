'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import GameRoom from '@/components/lobby/GameRoom';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import Link from 'next/link';

export default function GameRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuthStore();
  const { setMatchmaking } = useGameStore();

  const gameType = searchParams?.get('game') || '';
  const stakeAmount = parseInt(searchParams?.get('stake') || '0');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleLeaveGame = () => {
    setMatchmaking(false);
    // Navigate back to games
    router.push('/dashboard/games');
  };

  const handleReadyToggle = (isReady: boolean) => {
    // In a real implementation, this would send WebSocket events
    console.log('Ready state changed:', isReady);
  };

  // Validate game parameters
  useEffect(() => {
    if (!gameType || stakeAmount <= 0) {
      router.push('/dashboard/games');
    }
  }, [gameType, stakeAmount, router]);

  return (
    <div className="min-h-screen bg-black">
      <Header onLogout={handleLogout} currentPage="game-room" />
      <div className="flex">
        <Navigation />
        <main className="flex-1">
          <div className="p-0">
            <GameRoom
              onLeaveGame={handleLeaveGame}
              onReadyToggle={handleReadyToggle}
            />
          </div>
        </main>
      </div>
    </div>
  );
}