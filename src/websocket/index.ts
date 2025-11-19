import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '@/lib/database';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Interface for socket data
interface SocketData {
  userId: string;
  username: string;
  currentMatch?: string;
}

// Game state interface
interface GameState {
  matchId: string;
  players: {
    player1: { id: string; username: string; socketId: string };
    player2?: { id: string; username: string; socketId: string };
  };
  gameType: string;
  gameState: any;
  currentTurn: string | null;
  status: 'waiting' | 'active' | 'finished';
  createdAt: number;
}

// Store active game states
const activeGames = new Map<string, GameState>();

// Store user socket mappings
const userSockets = new Map<string, Socket>();

class WebSocketService {
  private io: SocketIOServer;
  private httpServer: HTTPServer;

  constructor(httpServer: HTTPServer) {
    this.httpServer = httpServer;

    // Initialize Socket.IO with CORS configuration
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type !== 'access') {
          return next(new Error('Invalid token type'));
        }

        // Verify user exists and is active
        const supabase = getSupabaseClient();
        const { data: user } = await (supabase as any)
          .from('users')
          .select('id, username, is_active')
          .eq('id', decoded.userId)
          .eq('is_active', true)
          .single();

        if (!user) {
          return next(new Error('User not found or inactive'));
        }

        // Attach user data to socket
        socket.data = {
          userId: user.id,
          username: user.username
        } as SocketData;

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      const username = socket.data.username;

      console.log(`User ${username} (${userId}) connected via WebSocket`);

      // Store user socket mapping
      userSockets.set(userId, socket);

      // Handle joining a match room
      socket.on('join_match', async (data: { matchId: string }) => {
        try {
          const { matchId } = data;

          // Verify user is part of this match
          const supabase = getSupabaseClient();
          const { data: match, error } = await (supabase as any)
            .from('matches')
            .select(`
              *,
              player1:users(id, username),
              player2:users(id, username),
              games(type, name)
            `)
            .eq('id', matchId)
            .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
            .single();

          if (error || !match) {
            socket.emit('error', { message: 'Match not found or access denied' });
            return;
          }

          // Join socket room for the match
          socket.join(`match_${matchId}`);
          socket.data.currentMatch = matchId;

          // Initialize or update game state
          let gameState = activeGames.get(matchId);
          if (!gameState) {
            gameState = {
              matchId,
              players: {
                player1: {
                  id: match.player1.id,
                  username: match.player1.username,
                  socketId: ''
                }
              },
              gameType: match.games.type,
              gameState: match.game_data || {},
              currentTurn: match.game_data?.currentTurn || null,
              status: match.status === 'active' ? 'active' : 'waiting',
              createdAt: Date.now()
            };
            activeGames.set(matchId, gameState);
          }

          // Add player2 if they exist
          if (match.player2 && !gameState.players.player2) {
            gameState.players.player2 = {
              id: match.player2.id,
              username: match.player2.username,
              socketId: ''
            };
          }

          // Update socket ID for the current player
          if (gameState.players.player1.id === userId) {
            gameState.players.player1.socketId = socket.id;
          } else if (gameState.players.player2 && gameState.players.player2.id === userId) {
            gameState.players.player2.socketId = socket.id;
          }

          // Notify player about current game state
          socket.emit('game_state', {
            matchId,
            gameType: gameState.gameType,
            gameState: gameState.gameState,
            currentTurn: gameState.currentTurn,
            players: gameState.players,
            status: gameState.status
          });

          // Notify other players in the match
          socket.to(`match_${matchId}`).emit('player_joined', {
            player: {
              id: userId,
              username: username
            }
          });

          console.log(`User ${username} joined match ${matchId}`);

        } catch (error) {
          console.error('Error joining match:', error);
          socket.emit('error', { message: 'Failed to join match' });
        }
      });

      // Handle game moves
      socket.on('game_move', async (data: { matchId: string; move: any; action: string }) => {
        try {
          const { matchId, move, action } = data;

          // Verify user is in this match
          if (socket.data.currentMatch !== matchId) {
            socket.emit('error', { message: 'Not in this match' });
            return;
          }

          const gameState = activeGames.get(matchId);
          if (!gameState) {
            socket.emit('error', { message: 'Game not found' });
            return;
          }

          // Validate turn (for turn-based games)
          if (gameState.currentTurn && gameState.currentTurn !== userId) {
            socket.emit('error', { message: 'Not your turn' });
            return;
          }

          // Broadcast move to all players in the match
          socket.to(`match_${matchId}`).emit('opponent_move', {
            move,
            action,
            player: {
              id: userId,
              username: username
            },
            timestamp: Date.now()
          });

          // Update game state (this would typically sync with database)
          if (action === 'make_move') {
            // Update current turn for turn-based games
            if (gameState.gameType === 'tic_tac_toe' && gameState.players.player2) {
              gameState.currentTurn = gameState.players.player1.id === userId
                ? gameState.players.player2.id || null
                : gameState.players.player1.id;
            }
          }

          console.log(`Game move in match ${matchId} by ${username}:`, action);

        } catch (error) {
          console.error('Error handling game move:', error);
          socket.emit('error', { message: 'Failed to process move' });
        }
      });

      // Handle voice chat (Agora signaling)
      socket.on('voice_chat', async (data: { matchId: string; action: string; payload: any }) => {
        try {
          const { matchId, action, payload } = data;

          // Verify user is in the match
          if (socket.data.currentMatch !== matchId) {
            return;
          }

          // Relay voice chat events to other players
          socket.to(`match_${matchId}`).emit('voice_chat', {
            action,
            payload,
            from: {
              id: userId,
              username: username
            },
            timestamp: Date.now()
          });

        } catch (error) {
          console.error('Error handling voice chat:', error);
        }
      });

      // Handle game chat
      socket.on('chat_message', async (data: { matchId: string; message: string }) => {
        try {
          const { matchId, message } = data;

          // Verify user is in the match
          if (socket.data.currentMatch !== matchId) {
            socket.emit('error', { message: 'Not in this match' });
            return;
          }

          // Broadcast chat message to all players in the match
          this.io.to(`match_${matchId}`).emit('chat_message', {
            message,
            from: {
              id: userId,
              username: username
            },
            timestamp: Date.now()
          });

          console.log(`Chat message in match ${matchId} from ${username}: ${message}`);

        } catch (error) {
          console.error('Error handling chat message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`User ${username} (${userId}) disconnected: ${reason}`);

        // Remove from user sockets mapping
        userSockets.delete(userId);

        // Handle disconnection from active matches
        if (socket.data.currentMatch) {
          const matchId = socket.data.currentMatch;
          const gameState = activeGames.get(matchId);

          if (gameState) {
            // Notify other players about disconnection
            socket.to(`match_${matchId}`).emit('player_disconnected', {
              player: {
                id: userId,
                username: username
              },
              reason: reason
            });

            // Mark player as disconnected
            if (gameState.players.player1.id === userId) {
              gameState.players.player1.socketId = '';
            } else if (gameState.players.player2 && gameState.players.player2.id === userId) {
              gameState.players.player2.socketId = '';
            }
          }
        }
      });

      // Handle leaving a match
      socket.on('leave_match', (data: { matchId: string }) => {
        try {
          const { matchId } = data;

          socket.leave(`match_${matchId}`);

          // Notify other players
          socket.to(`match_${matchId}`).emit('player_left', {
            player: {
              id: userId,
              username: username
            }
          });

          // Clear current match
          socket.data.currentMatch = undefined;

          console.log(`User ${username} left match ${matchId}`);

        } catch (error) {
          console.error('Error leaving match:', error);
        }
      });

      // Handle reconnection
      socket.on('reconnect_to_match', async (data: { matchId: string }) => {
        try {
          const { matchId } = data;

          // Verify user is part of this match
          const supabase = getSupabaseClient();
          const { data: match, error } = await (supabase as any)
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
            .single();

          if (error || !match) {
            socket.emit('error', { message: 'Match not found or access denied' });
            return;
          }

          // Rejoin the match room
          socket.join(`match_${matchId}`);
          socket.data.currentMatch = matchId;

          // Update socket ID in game state
          const gameState = activeGames.get(matchId);
          if (gameState) {
            if (gameState.players.player1.id === userId) {
              gameState.players.player1.socketId = socket.id;
            } else if (gameState.players.player2?.id === userId) {
              gameState.players.player2.socketId = socket.id;
            }

            // Send current game state
            socket.emit('game_state', {
              matchId,
              gameType: gameState.gameType,
              gameState: gameState.gameState,
              currentTurn: gameState.currentTurn,
              players: gameState.players,
              status: gameState.status
            });
          }

          // Notify other players about reconnection
          socket.to(`match_${matchId}`).emit('player_reconnected', {
            player: {
              id: userId,
              username: username
            }
          });

          console.log(`User ${username} reconnected to match ${matchId}`);

        } catch (error) {
          console.error('Error reconnecting to match:', error);
          socket.emit('error', { message: 'Failed to reconnect to match' });
        }
      });
    });
  }

  // Public methods for external use
  public notifyMatchUpdate(matchId: string, updateType: string, data: any) {
    this.io.to(`match_${matchId}`).emit('match_update', {
      type: updateType,
      data,
      timestamp: Date.now()
    });
  }

  public notifyUser(userId: string, eventType: string, data: any) {
    const socket = userSockets.get(userId);
    if (socket) {
      socket.emit(eventType, data);
    }
  }

  public getActiveGames(): Map<string, GameState> {
    return activeGames;
  }

  public getConnectedUsers(): number {
    return userSockets.size;
  }

  public close() {
    this.io.close();
  }
}

export default WebSocketService;