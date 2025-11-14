import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface SocketGameState {
  isConnected: boolean;
  isSearching: boolean;
  isInMatch: boolean;
  isGameActive: boolean;
  isMyTurn: boolean;
  timeLeft: number;
  matchId: string | null;
  opponent: {
    id: string;
    username: string;
    avatar_url?: string;
    winRate?: number;
    gamesPlayed?: number;
  } | null;
  gameSettings: {
    gameType: string;
    stakeAmount: number;
    totalRounds?: number;
  } | null;
  currentGame: {
    type: string;
    state: any;
    moveHistory: any[];
  } | null;
  lastMove: {
    playerId: string;
    move: any;
    timestamp: number;
  } | null;
  countdown: number;
  voiceChat: {
    isActive: boolean;
    isMuted: boolean;
    agoraChannel?: string;
    agoraToken?: string;
  };
  error: string | null;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }>;
}

interface SocketGameActions {
  setConnected: (connected: boolean) => void;
  setSearching: (searching: boolean) => void;
  setInMatch: (inMatch: boolean) => void;
  setGameActive: (active: boolean) => void;
  setMyTurn: (myTurn: boolean) => void;
  setTimeLeft: (timeLeft: number) => void;
  setMatch: (matchId: string, opponent: any, gameSettings: any) => void;
  clearMatch: () => void;
  setOpponent: (opponent: any) => void;
  setGameSettings: (settings: any) => void;
  setCurrentGame: (type: string, state: any) => void;
  updateGameState: (state: any) => void;
  addMoveToHistory: (move: any) => void;
  setLastMove: (move: any) => void;
  setCountdown: (countdown: number) => void;
  setVoiceChat: (voiceChat: Partial<SocketGameState['voiceChat']>) => void;
  setError: (error: string | null) => void;
  addNotification: (type: SocketGameActions['addNotification']['0'], message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  reset: () => void;
}

export const useSocketStore = create<SocketGameState & SocketGameActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isConnected: false,
    isSearching: false,
    isInMatch: false,
    isGameActive: false,
    isMyTurn: true,
    timeLeft: 30,
    matchId: null,
    opponent: null,
    gameSettings: null,
    currentGame: null,
    lastMove: null,
    countdown: 0,
    voiceChat: {
      isActive: false,
      isMuted: false,
    },
    error: null,
    notifications: [],

    // Actions
    setConnected: (connected) => set({ isConnected: connected }),

    setSearching: (searching) => set({ isSearching: searching }),

    setInMatch: (inMatch) => set({ isInMatch: inMatch }),

    setGameActive: (active) => set({ isGameActive: active }),

    setMyTurn: (myTurn) => set({ isMyTurn: myTurn }),

    setTimeLeft: (timeLeft) => set({ timeLeft }),

    setMatch: (matchId, opponent, gameSettings) => set({
      matchId,
      opponent,
      gameSettings,
      isInMatch: true,
      isSearching: false,
    }),

    clearMatch: () => set({
      matchId: null,
      opponent: null,
      gameSettings: null,
      currentGame: null,
      lastMove: null,
      isInMatch: false,
      isGameActive: false,
      countdown: 0,
    }),

    setOpponent: (opponent) => set({ opponent }),

    setGameSettings: (settings) => set({ gameSettings: settings }),

    setCurrentGame: (type, state) => set({
      currentGame: {
        type,
        state,
        moveHistory: [],
      }
    }),

    updateGameState: (state) => set((prev) => ({
      currentGame: prev.currentGame ? {
        ...prev.currentGame,
        state: { ...prev.currentGame.state, ...state },
      } : null,
    })),

    addMoveToHistory: (move) => set((prev) => ({
      currentGame: prev.currentGame ? {
        ...prev.currentGame,
        moveHistory: [...prev.currentGame.moveHistory, move],
      } : null,
    })),

    setLastMove: (move) => set({ lastMove: move }),

    setCountdown: (countdown) => set({ countdown }),

    setVoiceChat: (voiceChat) => set((prev) => ({
      voiceChat: { ...prev.voiceChat, ...voiceChat },
    })),

    setError: (error) => set({ error }),

    addNotification: (type, message) => {
      const id = Date.now().toString();
      const notification = {
        id,
        type,
        message,
        timestamp: Date.now(),
      };

      set((prev) => ({
        notifications: [...prev.notifications.slice(-4), notification], // Keep last 5 notifications
      }));

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        get().removeNotification(id);
      }, 5000);
    },

    removeNotification: (id) => set((prev) => ({
      notifications: prev.notifications.filter(n => n.id !== id),
    })),

    clearNotifications: () => set({ notifications: [] }),

    reset: () => set({
      isConnected: false,
      isSearching: false,
      isInMatch: false,
      isGameActive: false,
      isMyTurn: true,
      timeLeft: 30,
      matchId: null,
      opponent: null,
      gameSettings: null,
      currentGame: null,
      lastMove: null,
      countdown: 0,
      voiceChat: {
        isActive: false,
        isMuted: false,
      },
      error: null,
      notifications: [],
    }),
  }))
);