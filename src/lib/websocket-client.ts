import { io, Socket } from 'socket.io-client';

// WebSocket event types
export interface GameMoveData {
  matchId: string;
  move: any;
  action: string;
}

export interface VoiceChatData {
  matchId: string;
  action: string;
  payload: any;
}

export interface ChatMessageData {
  matchId: string;
  message: string;
}

export interface GameStateData {
  matchId: string;
  gameType: string;
  gameState: any;
  currentTurn: string | null;
  players: any;
  status: 'waiting' | 'active' | 'finished';
}

export interface PlayerData {
  player: {
    id: string;
    username: string;
  };
}

export interface ChatMessageEvent {
  message: string;
  from: {
    id: string;
    username: string;
  };
  timestamp: number;
}

export interface GameMoveEvent {
  move: any;
  action: string;
  player: {
    id: string;
    username: string;
  };
  timestamp: number;
}

// WebSocket client class
class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001';

      this.socket = io(serverUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);

        if (reason === 'io server disconnect') {
          // Server initiated disconnect, need to reconnect manually
          this.socket?.connect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected to WebSocket server after ${attemptNumber} attempts`);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('WebSocket reconnection error:', error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Match management
  joinMatch(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_match', { matchId });
    }
  }

  leaveMatch(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_match', { matchId });
    }
  }

  reconnectToMatch(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('reconnect_to_match', { matchId });
    }
  }

  // Game interactions
  makeMove(matchId: string, move: any, action: string): void {
    if (this.socket?.connected) {
      this.socket.emit('game_move', { matchId, move, action });
    }
  }

  // Voice chat
  sendVoiceChat(matchId: string, action: string, payload: any): void {
    if (this.socket?.connected) {
      this.socket.emit('voice_chat', { matchId, action, payload });
    }
  }

  // Text chat
  sendChatMessage(matchId: string, message: string): void {
    if (this.socket?.connected) {
      this.socket.emit('chat_message', { matchId, message });
    }
  }

  // Event listeners
  onGameState(callback: (data: GameStateData) => void): void {
    this.socket?.on('game_state', callback);
  }

  onOpponentMove(callback: (data: GameMoveEvent) => void): void {
    this.socket?.on('opponent_move', callback);
  }

  onPlayerJoined(callback: (data: PlayerData) => void): void {
    this.socket?.on('player_joined', callback);
  }

  onPlayerLeft(callback: (data: PlayerData) => void): void {
    this.socket?.on('player_left', callback);
  }

  onPlayerDisconnected(callback: (data: PlayerData & { reason: string }) => void): void {
    this.socket?.on('player_disconnected', callback);
  }

  onPlayerReconnected(callback: (data: PlayerData) => void): void {
    this.socket?.on('player_reconnected', callback);
  }

  onChatMessage(callback: (data: ChatMessageEvent) => void): void {
    this.socket?.on('chat_message', callback);
  }

  onVoiceChat(callback: (data: any) => void): void {
    this.socket?.on('voice_chat', callback);
  }

  onMatchUpdate(callback: (data: any) => void): void {
    this.socket?.on('match_update', callback);
  }

  onError(callback: (error: { message: string }) => void): void {
    this.socket?.on('error', callback);
  }

  // Remove event listeners
  off(event: string, callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // Get socket instance for advanced usage
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
const websocketClient = new WebSocketClient();

export default websocketClient;