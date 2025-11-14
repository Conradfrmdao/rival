'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Users, Clock, Volume2, VolumeX, Settings, Trophy, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { useSocketStore } from '@/store/socketStore';
import { useSocket } from '@/hooks/useSocket';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface GameRoomProps {
  onLeaveGame: () => void;
  onReadyToggle: (isReady: boolean) => void;
}

interface Opponent {
  id: string;
  username: string;
  avatar_url?: string;
  winRate: number;
  gamesPlayed: number;
}

interface GameSettings {
  gameType: string;
  stakeAmount: number;
  totalRounds: number;
}

export default function GameRoom({ onLeaveGame, onReadyToggle }: GameRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { setMatchmaking } = useGameStore();
  const {
    isConnected,
    isSearching,
    isInMatch,
    opponent,
    gameSettings,
    countdown,
    voiceChat,
    addNotification,
    clearMatch,
  } = useSocketStore();

  const {
    socket,
    joinMatchmaking,
    leaveMatchmaking,
    playerReady,
    leaveGame,
    joinVoiceChat,
    toggleVoiceMute,
  } = useSocket();

  const gameType = searchParams?.get('game') || '';
  const stakeAmount = parseInt(searchParams?.get('stake') || '0');

  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);
  const [isMuted, setIsMuted] = useState(voiceChat.isMuted);

  // Start matchmaking when component mounts
  useEffect(() => {
    if (isConnected && gameType && stakeAmount > 0) {
      setMatchmaking(true);
      joinMatchmaking(gameType, stakeAmount);
    }
  }, [isConnected, gameType, stakeAmount, setMatchmaking, joinMatchmaking]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('opponentReady', () => {
      setOpponentReady(true);
      addNotification('info', 'Opponent is ready!');
    });

    socket.on('gameStarting', (data: { countdown: number }) => {
      setGameStarting(true);
      setCountdown(data.countdown);
    });

    socket.on('opponentLeft', () => {
      addNotification('warning', 'Opponent left the game');
      handleLeaveGame(false);
    });

    return () => {
      socket.off('opponentReady');
      socket.off('gameStarting');
      socket.off('opponentLeft');
    };
  }, [socket, addNotification]);

  // Handle voice chat
  useEffect(() => {
    if (isInMatch && voiceChat.agoraChannel) {
      // Voice chat is ready
      setIsMuted(voiceChat.isMuted);
    }
  }, [isInMatch, voiceChat]);

  const handleReadyToggle = useCallback(() => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    onReadyToggle(newReadyState);

    if (socket) {
      playerReady(newReadyState);
    }

    if (newReadyState) {
      addNotification('success', 'You are ready to play!');
    } else {
      addNotification('info', 'You are no longer ready');
    }
  }, [isReady, socket, playerReady, onReadyToggle, addNotification]);

  const startGame = () => {
    if (isInMatch) {
      // Navigate to actual game with match parameters
      router.push(`/dashboard/game-play?game=${gameType}&stake=${stakeAmount}&match=${opponent?.id}`);
    }
  };

  const handleLeaveGame = useCallback((showConfirmation = true) => {
    const shouldLeave = showConfirmation
      ? confirm('Are you sure you want to leave the game? You may lose your stake.')
      : true;

    if (shouldLeave) {
      if (socket) {
        leaveGame();
        leaveMatchmaking();
      }
      clearMatch();
      setMatchmaking(false);
      onLeaveGame();
      router.push('/dashboard/games');
    }
  }, [socket, leaveGame, leaveMatchmaking, clearMatch, setMatchmaking, onLeaveGame]);

  const handleVoiceChatToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (socket && isInMatch) {
      toggleVoiceMute(newMutedState);
    }

    // Update local voice chat state
    const { setVoiceChat } = useSocketStore.getState();
    setVoiceChat({ isMuted: newMutedState });
  };

  const getGameDisplayName = () => {
    switch (gameType) {
      case 'rock_paper_scissors': return 'Rock Paper Scissors';
      case 'ball_in_cup': return 'Ball in Cup';
      case 'tic_tac_toe': return 'Tic Tac Toe';
      case 'penalty_take': return 'Penalty Take';
      default: return 'Unknown Game';
    }
  };

  const bothPlayersReady = isReady && opponentReady && opponent;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleLeaveGame}
            className="text-white hover:text-red-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Game
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">{getGameDisplayName()}</h1>
            <p className="text-gray-400">Stake: {formatCurrency(stakeAmount)}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleVoiceChatToggle}
              className="text-white hover:text-purple-400"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:text-purple-400"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Game Status */}
          <div className="text-center mb-8">
            {gameStarting || countdown > 0 ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-6xl font-bold text-green-400">
                  {countdown > 0 ? countdown : 'GO!'}
                </div>
                <p className="text-xl">Game Starting!</p>
              </motion.div>
            ) : isSearching ? (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                  <p className="text-lg">Finding opponent...</p>
                </div>
                <p className="text-sm text-gray-400">
                  {isConnected ? 'Connected to matchmaking' : 'Connecting...'}
                </p>
              </div>
            ) : opponent ? (
              <div className="space-y-2">
                <p className="text-lg">Opponent Found! Get ready to play.</p>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Waiting for both players to be ready</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg">Connecting to game server...</p>
                <div className="inline-flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                  <p className="text-red-400">Connection Failed</p>
                </div>
              </div>
            )}
          </div>

          {/* Players */}
          {opponent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Player */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">You</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white/20">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user?.username || 'You'}</p>
                    <p className="text-sm text-gray-400">Ready to play</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium ${isReady ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isReady ? 'Ready' : 'Not Ready'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white">1</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleReadyToggle}
                    variant={isReady ? 'secondary' : 'primary'}
                    fullWidth
                    disabled={gameStarting}
                    className={isReady ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {isReady ? 'Cancel Ready' : 'I\'m Ready'}
                  </Button>
                </div>
              </div>

              {/* Opponent */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Opponent</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center border-2 border-white/20">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{opponent.username}</p>
                    <p className="text-sm text-gray-400">Found opponent</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium ${opponentReady ? 'text-green-400' : 'text-yellow-400'}`}>
                      {opponentReady ? 'Ready' : 'Getting Ready...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-white">{opponent.winRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Games:</span>
                    <span className="text-white">{opponent.gamesPlayed || 0}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`w-full py-3 px-4 rounded-lg text-center font-medium ${
                    opponentReady ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {opponentReady ? 'Opponent Ready!' : 'Waiting for opponent...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Settings */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-400 mb-2">{getGameDisplayName()}</p>
                <p className="text-sm text-gray-400">Game Type</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400 mb-2">
                  {formatCurrency(gameSettings?.stakeAmount || stakeAmount)}
                </p>
                <p className="text-sm text-gray-400">Stake Amount</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400 mb-2">Best of 3</p>
                <p className="text-sm text-gray-400">Game Mode</p>
              </div>
            </div>
          </div>

          {/* Voice Chat Status */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-purple-400" />
                <span className="text-white">Voice Chat</span>
                {!isConnected && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Offline</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  opponent && voiceChat.isActive ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-400">
                  {opponent && voiceChat.isActive ? 'Connected' : 'Waiting...'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceChatToggle}
                  className="text-gray-400 hover:text-white"
                  disabled={!opponent}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {useSocketStore.getState().notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`p-4 rounded-lg text-sm font-medium ${
                  notification.type === 'success'
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                    : notification.type === 'error'
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : notification.type === 'warning'
                    ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                } backdrop-blur-xl`}
              >
                {notification.message}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}