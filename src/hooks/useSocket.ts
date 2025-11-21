'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  matchId: string | null;
  opponent: any | null;
  gameSettings: any | null;
}

interface UseSocketReturn extends SocketState {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  joinMatchmaking: (gameType: string, stakeAmount: number) => void;
  leaveMatchmaking: () => void;
  playerReady: (isReady: boolean) => void;
  makeMove: (move: any, gameType: string) => void;
  leaveGame: () => void;
  joinVoiceChat: (matchId: string) => void;
  toggleVoiceMute: (isMuted: boolean) => void;
  requestBalance: () => void;
}

export function useSocket(): UseSocketReturn {
  const { token, user, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    matchId: null,
    opponent: null,
    gameSettings: null,
  });

  const connect = useCallback(() => {
    if (!token || !isAuthenticated || socketRef.current?.connected) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const socket = io('/api/socket', {
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: false,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));

        // Authenticate the socket
        socket.emit('authenticate', {
          token,
          userId: user?.id,
        });
      });

      socket.on('authenticate', (data) => {
        if (!data.success) {
          setState(prev => ({ ...prev, error: data.error || 'Authentication failed' }));
          socket.disconnect();
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setState(prev => ({
          ...prev,
          isConnected: false,
          matchId: null,
          opponent: null,
          gameSettings: null
        }));
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        setState(prev => ({ ...prev, error: error.message || 'Connection error' }));
      });

      // Matchmaking events
      socket.on('searchingForOpponent', () => {
        console.log('Searching for opponent...');
      });

      socket.on('matchFound', (data) => {
        console.log('Match found:', data);
        setState(prev => ({
          ...prev,
          matchId: data.matchId,
          opponent: data.opponent,
          gameSettings: data.gameSettings,
        }));
      });

      socket.on('opponentReady', (data) => {
        console.log('Opponent ready:', data);
        // Could update UI to show opponent status
      });

      socket.on('opponentLeft', () => {
        console.log('Opponent left the game');
        setState(prev => ({
          ...prev,
          matchId: null,
          opponent: null,
          gameSettings: null,
        }));
      });

      socket.on('opponentDisconnected', () => {
        console.log('Opponent disconnected');
        setState(prev => ({
          ...prev,
          matchId: null,
          opponent: null,
          gameSettings: null,
        }));
      });

      // Game events
      socket.on('gameStarting', (data) => {
        console.log('Game starting in:', data.countdown, 'seconds');
      });

      socket.on('gameStarted', (data) => {
        console.log('Game started:', data);
      });

      socket.on('opponentMove', (data) => {
        console.log('Opponent made move:', data);
        // Handle opponent move in game component
      });

      socket.on('gameEnded', (data) => {
        console.log('Game ended:', data);
        // Handle game result
      });

      // Voice chat events
      socket.on('voiceChatJoined', (data) => {
        console.log('Voice chat joined:', data);
      });

      socket.on('voiceChatMuted', (data) => {
        console.log('Voice chat muted:', data);
      });

      // Wallet events
      socket.on('balanceUpdate', (data) => {
        console.log('Balance updated:', data);
        // Update wallet store
      });

      socket.connect();

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, [token, user, isAuthenticated]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      matchId: null,
      opponent: null,
      gameSettings: null,
    });
  }, []);

  const joinMatchmaking = useCallback((gameType: string, stakeAmount: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinMatchmaking', { gameType, stakeAmount });
    }
  }, []);

  const leaveMatchmaking = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveMatchmaking');
    }
  }, []);

  const playerReady = useCallback((isReady: boolean) => {
    if (socketRef.current?.connected && state.matchId) {
      socketRef.current.emit('playerReady', { matchId: state.matchId, isReady });
    }
  }, [state.matchId]);

  const makeMove = useCallback((move: any, gameType: string) => {
    if (socketRef.current?.connected && state.matchId) {
      socketRef.current.emit('gameMove', { matchId: state.matchId, move, gameType });
    }
  }, [state.matchId]);

  const leaveGame = useCallback(() => {
    if (socketRef.current?.connected && state.matchId) {
      socketRef.current.emit('leaveGame', { matchId: state.matchId });
      setState(prev => ({
        ...prev,
        matchId: null,
        opponent: null,
        gameSettings: null,
      }));
    }
  }, [state.matchId]);

  const joinVoiceChat = useCallback((matchId: string) => {
    if (socketRef.current?.connected) {
      const agoraChannel = `channel_${matchId}`;
      socketRef.current.emit('joinVoiceChat', { matchId, agoraChannel });
    }
  }, []);

  const toggleVoiceMute = useCallback((isMuted: boolean) => {
    if (socketRef.current?.connected && state.matchId) {
      socketRef.current.emit('voiceChatMute', { matchId: state.matchId, isMuted });
    }
  }, [state.matchId]);

  const requestBalance = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('requestBalance');
    }
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !socketRef.current) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    ...state,
    connect,
    disconnect,
    joinMatchmaking,
    leaveMatchmaking,
    playerReady,
    makeMove,
    leaveGame,
    joinVoiceChat,
    toggleVoiceMute,
    requestBalance,
  };
}