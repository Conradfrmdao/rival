'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import GameLobby from '@/components/lobby/GameLobby';
import { useAuthStore } from '@/store/authStore';

export default function GamesPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onLogout={handleLogout} currentPage="games" />
      <div className="flex">
        <main className="flex-1">
          <GameLobby />
        </main>
      </div>
    </div>
  );
}