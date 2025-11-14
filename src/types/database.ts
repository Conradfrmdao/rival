// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          username: string;
          first_name: string;
          last_name: string;
          nin?: string;
          email?: string;
          password_hash?: string;
          avatar_url?: string;
          is_active: boolean;
          last_login?: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          username?: string;
          first_name: string;
          last_name: string;
          nin?: string;
          email?: string;
          password_hash?: string;
          avatar_url?: string;
          is_active?: boolean;
          last_login?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          username?: string;
          first_name?: string;
          last_name?: string;
          nin?: string;
          email?: string;
          password_hash?: string;
          avatar_url?: string;
          is_active?: boolean;
          last_login?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          pending_deposits: number;
          pending_withdrawals: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          pending_deposits?: number;
          pending_withdrawals?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          pending_deposits?: number;
          pending_withdrawals?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          name: string;
          type: string;
          description?: string;
          icon_url?: string;
          min_stake: number;
          max_stake: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          description?: string;
          icon_url?: string;
          min_stake?: number;
          max_stake?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          description?: string;
          icon_url?: string;
          min_stake?: number;
          max_stake?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          game_id: string;
          player1_id: string;
          player2_id?: string;
          stake_amount: number;
          status: 'matchmaking' | 'active' | 'completed' | 'cancelled';
          winner_id?: string;
          game_data: any;
          agora_channel?: string;
          created_at: string;
          started_at?: string;
          completed_at?: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player1_id: string;
          player2_id?: string;
          stake_amount: number;
          status?: 'matchmaking' | 'active' | 'completed' | 'cancelled';
          winner_id?: string;
          game_data?: any;
          agora_channel?: string;
          created_at?: string;
          started_at?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          player1_id?: string;
          player2_id?: string;
          stake_amount?: number;
          status?: 'matchmaking' | 'active' | 'completed' | 'cancelled';
          winner_id?: string;
          game_data?: any;
          agora_channel?: string;
          created_at?: string;
          started_at?: string;
          completed_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'deposit' | 'withdrawal' | 'game_win' | 'game_loss' | 'fee';
          amount: number;
          status: 'pending' | 'completed' | 'failed' | 'cancelled';
          reference?: string;
          description?: string;
          metadata: any;
          created_at: string;
          completed_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'deposit' | 'withdrawal' | 'game_win' | 'game_loss' | 'fee';
          amount: number;
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          reference?: string;
          description?: string;
          metadata?: any;
          created_at?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'deposit' | 'withdrawal' | 'game_win' | 'game_loss' | 'fee';
          amount?: number;
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          reference?: string;
          description?: string;
          metadata?: any;
          created_at?: string;
          completed_at?: string;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          move_data: any;
          is_ready: boolean;
          has_moved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          move_data?: any;
          is_ready?: boolean;
          has_moved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          move_data?: any;
          is_ready?: boolean;
          has_moved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}