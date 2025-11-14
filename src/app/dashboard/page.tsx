'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, TrendingUp, Clock, Wallet, Play, Users, ArrowLeft } from 'lucide-react';
import StakeLayout from '@/components/layout/StakeLayout';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
    <StakeLayout showSidebar={true}>
      <div className="p-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 border-b border-gray-800">
          {['Popular', 'Games', 'Wallet', 'Stats', 'History'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                tab === 'Popular'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-4">
                Welcome back, {user?.firstName || user?.username || 'Player'}! 🎮
              </h1>
              <p className="text-blue-100 mb-6 text-lg">
                Ready to dominate? Your next victory is just one game away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm text-blue-100 mb-1">Current Balance</div>
                  <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/games')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
                >
                  Play Now →
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/wallet')}
                  className="border-white text-white hover:bg-white/10"
                >
                  Deposit
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#1e2130] border-gray-800 hover:scale-105 transition-transform">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <span className="text-xs text-gray-400">TOTAL</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{quickStats.gamesPlayed}</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
          </Card>

          <Card className="bg-[#1e2130] border-gray-800 hover:scale-105 transition-transform">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-xs text-gray-400">RATE</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{quickStats.winRate}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </Card>

          <Card className="bg-[#1e2130] border-gray-800 hover:scale-105 transition-transform">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="w-8 h-8 text-blue-400" />
                <span className="text-xs text-gray-400">BALANCE</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{formatCurrency(balance)}</div>
              <div className="text-sm text-gray-400">Available</div>
            </div>
          </Card>

          <Card className="bg-[#1e2130] border-gray-800 hover:scale-105 transition-transform">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-purple-400" />
                <span className="text-xs text-gray-400">WON</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{formatCurrency(quickStats.totalWinnings)}</div>
              <div className="text-sm text-gray-400">Total Won</div>
            </div>
          </Card>
        </div>

        {/* Games Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Choose Your Battle</h2>
            <Button onClick={() => router.push('/dashboard/games')}>
              View All Games
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableGames.map((game) => (
              <Card key={game.id} className="bg-[#1e2130] border-gray-800 hover:scale-105 transition-all duration-200 cursor-pointer group">
                <div className="p-6">
                  <div className="text-4xl mb-4 text-center group-hover:scale-125 transition-transform">
                    {game.type === 'rock_paper_scissors' && '✊'}
                    {game.type === 'ball_in_cup' && '🏆'}
                    {game.type === 'tic_tac_toe' && '⭕'}
                    {game.type === 'penalty_take' && '⚽'}
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-center">{game.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 text-center">{game.description}</p>
                  <div className="text-center text-xs text-gray-500 mb-4">
                    Min: {formatCurrency(game.min_stake)} - Max: {formatCurrency(game.max_stake)}
                  </div>
                  <Button
                    fullWidth
                    onClick={() => handlePlayGame(game.type)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Games */}
          <Card className="bg-[#1e2130] border-gray-800">
            <div className="p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Recent Games
              </h3>
              {gameHistory.length > 0 ? (
                <div className="space-y-3">
                  {gameHistory.slice(0, 3).map((game) => (
                    <div key={game.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                      <div>
                        <div className="font-medium text-white">
                          {game.game_type.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-400">vs {game.opponent}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          game.result === 'win' ? 'text-green-400' :
                          game.result === 'loss' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {game.result.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-400">{formatCurrency(game.stake_amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-3">No games played yet</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/games')}
                    className="border-gray-600 text-gray-300 hover:bg-white/10"
                  >
                    Start Playing
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-[#1e2130] border-gray-800">
            <div className="p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-green-400" />
                Recent Transactions
              </h3>
              {quickStats.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {quickStats.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                      <div>
                        <div className="font-medium text-white">
                          {transaction.type.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-400">{transaction.description}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.type === 'deposit' || transaction.type === 'game_win'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'game_win' ? '+' : '-'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </div>
                        <div className="text-sm text-gray-400">{transaction.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-3">No transactions yet</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/wallet')}
                    className="border-gray-600 text-gray-300 hover:bg-white/10"
                  >
                    Add Funds
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </StakeLayout>
  );
}