'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, Clock, Users, Play, UserPlus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useWalletStore } from '@/store/walletStore';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GameImage from '@/components/games/GameImages';

interface GameLobbyProps {
  gameType?: string;
}

function GameLobbyInner({ gameType: propGameType }: GameLobbyProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameType = propGameType || searchParams?.get('game') || '';

  const { availableGames, setMatchmaking } = useGameStore();
  const { balance } = useWalletStore();

  const [selectedGame, setSelectedGame] = useState(gameType);
  const [stakeAmount, setStakeAmount] = useState('1000');
  const [inviteMode, setInviteMode] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (gameType) {
      setSelectedGame(gameType);
    }
  }, [gameType]);

  const getSelectedGameInfo = () => {
    return availableGames.find(game => game.type === selectedGame);
  };

  const handlePlayNow = async () => {
    const gameInfo = getSelectedGameInfo();
    if (!gameInfo) return;

    const stake = parseInt(stakeAmount);

    // Validate stake
    if (stake < gameInfo.min_stake) {
      return;
    }

    if (stake > gameInfo.max_stake) {
      return;
    }

    if (stake > balance) {
      return;
    }

    setIsSearching(true);
    setMatchmaking(true);

    // Simulate matchmaking (in real app, this would connect to backend)
    setTimeout(() => {
      setIsSearching(false);
      setMatchmaking(false);
      // Navigate to game room
      router.push(`/dashboard/game-room?game=${selectedGame}&stake=${stake}`);
    }, 3000);
  };

  const handleInviteFriend = () => {
    const gameInfo = getSelectedGameInfo();
    if (!gameInfo) return;

    const stake = parseInt(stakeAmount);

    // Same validation
    if (stake < gameInfo.min_stake || stake > gameInfo.max_stake || stake > balance) {
      return;
    }

    if (!invitePhone) {
      return;
    }

    // Handle friend invitation (in real app, send notification to friend)
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-6">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
              Game Lobby
            </h1>
            <p className="text-gray-300 text-lg">
              Choose your battle and challenge worthy opponents
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Select Your Battle
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {availableGames.map((game) => (
                    <motion.button
                      key={game.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedGame(game.type)}
                      className={`p-6 rounded-xl border-2 transition-all backdrop-blur-sm ${
                        selectedGame === game.type
                          ? 'border-purple-500 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white shadow-lg shadow-purple-500/25'
                          : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10 text-white'
                      }`}
                    >
                      <div className="text-4xl mb-3 text-center">
                        {game.type === 'rock_paper_scissors' && '✊'}
                        {game.type === 'ball_in_cup' && '🏆'}
                        {game.type === 'tic_tac_toe' && '⭕'}
                        {game.type === 'penalty_take' && '⚽'}
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2">
                        {game.name}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {game.description}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {/* Stake Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    Stake Amount
                  </label>
                  <Input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min="500"
                    max="50000"
                    step="500"
                    placeholder="Enter stake amount"
                    helperText={`Min: ${formatCurrency(500)}, Max: ${formatCurrency(50000)}`}
                  />
                  <div className="mt-3 flex gap-2">
                    {[1000, 2000, 5000, 10000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setStakeAmount(amount.toString())}
                        className="text-xs border-white/20 text-white hover:bg-white/10"
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Play Options */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setInviteMode(false)}
                      variant={!inviteMode ? 'primary' : 'outline'}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                    <Button
                      onClick={() => setInviteMode(true)}
                      variant={inviteMode ? 'primary' : 'outline'}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Friend
                    </Button>
                  </div>

                  {!inviteMode ? (
                    <Button
                      onClick={handlePlayNow}
                      fullWidth
                      loading={isSearching}
                      disabled={!selectedGame || !stakeAmount}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                    >
                      {isSearching ? 'Finding Opponent...' : 'Start Matchmaking'}
                    </Button>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                      <Input
                        type="tel"
                        placeholder="Friend's phone number"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        label="Invite Friend"
                      />
                      <Button
                        onClick={handleInviteFriend}
                        fullWidth
                        className="mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                        disabled={!invitePhone}
                      >
                        Send Invitation
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Rules */}
              {selectedGame && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    How to Play {getSelectedGameInfo()?.name}
                  </h3>
                  <div className="text-gray-300 space-y-2">
                    {selectedGame === 'rock_paper_scissors' && (
                      <>
                        <p>• Choose rock, paper, or scissors</p>
                        <p>• Rock beats scissors, scissors beats paper, paper beats rock</p>
                        <p>• First to win the round takes the pot</p>
                      </>
                    )}
                    {selectedGame === 'ball_in_cup' && (
                      <>
                        <p>• Watch the ball get placed under a cup</p>
                        <p>• Cups will shuffle around</p>
                        <p>• Pick the correct cup to win</p>
                      </>
                    )}
                    {selectedGame === 'tic_tac_toe' && (
                      <>
                        <p>• Take turns placing X's on a 3x3 grid</p>
                        <p>• Get 3 in a row (horizontal, vertical, or diagonal) to win</p>
                        <p>• Block your opponent from getting 3 in a row</p>
                      </>
                    )}
                    {selectedGame === 'penalty_take' && (
                      <>
                        <p>• Take 5 penalty shots each</p>
                        <p>• Aim for the goal and choose shot power</p>
                        <p>• Score more goals than your opponent to win</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm">Win Rate</span>
                    </div>
                    <span className="font-semibold text-white">0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Games Played</span>
                    </div>
                    <span className="font-semibold text-white">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Active Players</span>
                    </div>
                    <span className="font-semibold text-white">247</span>
                  </div>
                </div>
              </div>

              {/* Your Balance */}
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white border border-purple-500/30">
                <h3 className="text-lg font-semibold mb-2">Your Balance</h3>
                <div className="text-2xl font-bold mb-4">{formatCurrency(balance)}</div>
                <Button
                  size="sm"
                  onClick={() => router.push('/dashboard/wallet')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Add Funds
                </Button>
              </div>

              {/* Active Matches */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Active Matches
                </h3>
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-3">
                    <Users className="w-12 h-12 mx-auto opacity-50" />
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    3 matches in progress
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30"
                    onClick={() => setSelectedGame(availableGames[0]?.type || '')}
                  >
                    View Matches
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GameLobby(props: GameLobbyProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <GameLobbyInner {...props} />
    </Suspense>
  );
}