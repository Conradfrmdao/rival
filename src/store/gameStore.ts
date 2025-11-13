import { create } from 'zustand';

interface User {
  id: string;
  phone: string;
  username: string;
  avatar_url?: string;
}

interface Game {
  id: string;
  name: string;
  type: string;
  description: string;
  min_stake: number;
  max_stake: number;
  icon_url?: string;
}

interface GameSession {
  id: string;
  match_id: string;
  game_type: string;
  stake_amount: number;
  status: 'matchmaking' | 'active' | 'completed' | 'cancelled';
  opponent?: User;
  game_data?: any;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  winner_id?: string;
}

interface GameResult {
  id: string;
  game_type: string;
  opponent: string;
  stake_amount: number;
  result: 'win' | 'loss' | 'draw';
  winnings: number;
  created_at: string;
}

interface GameState {
  currentGame: GameSession | null;
  matchmaking: boolean;
  opponent: User | null;
  gameHistory: GameResult[];
  availableGames: Game[];
  voiceChatEnabled: boolean;
  agoraChannel: string | null;
  isLoading: boolean;
  error: string | null;
}

interface GameActions {
  setCurrentGame: (game: GameSession | null) => void;
  setMatchmaking: (matchmaking: boolean) => void;
  setOpponent: (opponent: User | null) => void;
  setGameHistory: (history: GameResult[]) => void;
  addGameResult: (result: GameResult) => void;
  setAvailableGames: (games: Game[]) => void;
  setVoiceChatEnabled: (enabled: boolean) => void;
  setAgoraChannel: (channel: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateCurrentGame: (updates: Partial<GameSession>) => void;
  clearCurrentGame: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  // Initial state
  currentGame: null,
  matchmaking: false,
  opponent: null,
  gameHistory: [],
  availableGames: [],
  voiceChatEnabled: false,
  agoraChannel: null,
  isLoading: false,
  error: null,

  // Actions
  setCurrentGame: (currentGame) => {
    set({ currentGame });
  },

  setMatchmaking: (matchmaking) => {
    set({ matchmaking });
  },

  setOpponent: (opponent) => {
    set({ opponent });
  },

  setGameHistory: (gameHistory) => {
    set({ gameHistory });
  },

  addGameResult: (result) => {
    const currentHistory = get().gameHistory;
    set({
      gameHistory: [result, ...currentHistory]
    });
  },

  setAvailableGames: (availableGames) => {
    set({ availableGames });
  },

  setVoiceChatEnabled: (voiceChatEnabled) => {
    set({ voiceChatEnabled });
  },

  setAgoraChannel: (agoraChannel) => {
    set({ agoraChannel });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  updateCurrentGame: (updates) => {
    const currentGame = get().currentGame;
    if (currentGame) {
      set({
        currentGame: { ...currentGame, ...updates }
      });
    }
  },

  clearCurrentGame: () => {
    set({
      currentGame: null,
      opponent: null,
      voiceChatEnabled: false,
      agoraChannel: null
    });
  }
}));