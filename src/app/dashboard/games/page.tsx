'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import GameLobby from '@/components/lobby/GameLobby';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

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
        <Navigation />
        <main className="flex-1">
          <div className="p-6">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            <GameLobby />
          </div>
        </main>
      </div>
    </div>
  );
}