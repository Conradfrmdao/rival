'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, TrendingUp, Clock, Wallet, Play, Users, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { balance, transactions } = useWalletStore();
  const { gameHistory, availableGames, setAvailableGames } = useGameStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/register');
      return;
    }

    // Fetch available games from backend API
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        const result = await response.json();

        if (result.success && result.data) {
          setAvailableGames(result.data);
        } else {
          // Fallback to default games if API fails
          const defaultGames = [
            {
              id: '1',
              name: 'Rock Paper Scissors',
              type: 'rock_paper_scissors',
              description: 'Classic hand game',
              min_stake: 500,
              max_stake: 50000,
              icon_url: '/games/rps.png'
            },
            {
              id: '2',
              name: 'Ball in Cup',
              type: 'ball_in_cup',
              description: 'Find the hidden ball',
              min_stake: 500,
              max_stake: 50000,
              icon_url: '/games/ball-in-cup.png'
            },
            {
              id: '3',
              name: 'Tic Tac Toe',
              type: 'tic_tac_toe',
              description: 'Three in a row wins',
              min_stake: 500,
              max_stake: 50000,
              icon_url: '/games/tic-tac-toe.png'
            },
            {
              id: '4',
              name: 'Penalty Take',
              type: 'penalty_take',
              description: 'Score against the keeper',
              min_stake: 500,
              max_stake: 50000,
              icon_url: '/games/penalty.png'
            }
          ];
          setAvailableGames(defaultGames);
        }
      } catch (error) {
        console.error('Failed to fetch games:', error);
      }
    };

    fetchGames();
  }, [isAuthenticated, router, setAvailableGames]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handlePlayGame = (gameType: string) => {
    router.push(`/dashboard/games?game=${gameType}`);
  };

  const quickStats = {
    gamesPlayed: gameHistory.length,
    winRate: gameHistory.length > 0
      ? Math.round((gameHistory.filter(g => g.result === 'win').length / gameHistory.length) * 100)
      : 0,
    totalWinnings: gameHistory
      .filter(g => g.result === 'win')
      .reduce((sum, g) => sum + g.winnings, 0),
    recentTransactions: transactions.slice(0, 3)
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black">
      <Header onLogout={handleLogout} currentPage="dashboard" />

      <div className="flex">
        <Navigation />

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>

            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user?.firstName || user?.username || 'Player'}! 👋
              </h1>
              <p className="text-gray-400 mt-2">
                Ready to challenge someone? Choose a game and start playing.
              </p>
            </div>

            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 mb-2">Your Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
                </div>
                <Wallet className="w-12 h-12 text-blue-200" />
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/dashboard/wallet')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/wallet')}
                  className="bg-transparent hover:bg-white/10 text-white border-white/30"
                >
                  Withdraw
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quickStats.gamesPlayed}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Games Played</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quickStats.winRate}%
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Win Rate</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Recent</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(quickStats.totalWinnings)}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Won</p>
              </div>
            </div>

            {/* Available Games */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Available Games
                </h2>
                <Button onClick={() => router.push('/dashboard/games')}>
                  View All Games
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {availableGames.map((game) => (
                  <div key={game.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="text-3xl mb-4 text-center">
                        {game.type === 'rock_paper_scissors' && '✊'}
                        {game.type === 'ball_in_cup' && '🏆'}
                        {game.type === 'tic_tac_toe' && '⭕'}
                        {game.type === 'penalty_take' && '⚽'}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {game.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {game.description}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Min: {formatCurrency(game.min_stake)} - Max: {formatCurrency(game.max_stake)}
                      </div>
                      <Button
                        fullWidth
                        size="sm"
                        onClick={() => handlePlayGame(game.type)}
                        className="flex items-center justify-center gap-2"
                      >
                        <Play className="w-3 h-3" />
                        Play Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Games */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Games
                  </h3>
                  {gameHistory.length > 0 ? (
                    <div className="space-y-3">
                      {gameHistory.slice(0, 3).map((game) => (
                        <div key={game.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {game.game_type.replace('_', ' ').toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              vs {game.opponent}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              game.result === 'win' ? 'text-green-600 dark:text-green-400' :
                              game.result === 'loss' ? 'text-red-600 dark:text-red-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`}>
                              {game.result.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(game.stake_amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No games played yet
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => router.push('/dashboard/games')}
                      >
                        Start Playing
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Transactions
                  </h3>
                  {quickStats.recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {quickStats.recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {transaction.type.replace('_', ' ').toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transaction.type === 'deposit' || transaction.type === 'game_win'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {transaction.type === 'deposit' || transaction.type === 'game_win' ? '+' : '-'}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No transactions yet
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => router.push('/dashboard/wallet')}
                      >
                        Add Funds
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}