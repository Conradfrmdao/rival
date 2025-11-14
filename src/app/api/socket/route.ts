import { NextRequest, NextResponse } from 'next/server';
import { Server as NetServer } from 'net';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SocketServer {
  io: ServerIO | null;
}

const SocketServer = SocketServer as { io: ServerIO | null } & { io: ServerIO | null };

const resMap = new WeakMap<NextApiResponse, { socket: any; }>();

export async function GET(req: NextRequest, res: NextApiResponse) {
  if (!SocketServer.io) {
    console.log('Initializing Socket.IO server...');

    // Use dynamic import for socket.io
    const { Server } = await import('socket.io');

    const httpServer: NetServer = await new Promise<NetServer>((resolve) => {
      // Create a simple server for Socket.IO
      const { createServer } = require('http');
      const httpServer = createServer();
      resolve(httpServer);
    });

    SocketServer.io = new Server(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? ['https://yourdomain.com']
          : ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['polling', 'websocket'],
    });

    // Socket.IO event handlers
    SocketServer.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', (data: { token: string; userId: string }) => {
        try {
          // Verify JWT token
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET!);

          if (decoded.userId === data.userId) {
            socket.data.userId = data.userId;
            socket.data.authenticated = true;
            socket.join(`user_${data.userId}`);

            socket.emit('authenticated', { success: true, userId: data.userId });
            console.log('User authenticated:', data.userId);
          } else {
            socket.emit('authenticated', { success: false, error: 'Invalid token' });
          }
        } catch (error) {
          socket.emit('authenticated', { success: false, error: 'Authentication failed' });
        }
      });

      // Handle matchmaking
      socket.on('joinMatchmaking', (data: { gameType: string; stakeAmount: number }) => {
        if (!socket.data.authenticated) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        socket.data.gameType = data.gameType;
        socket.data.stakeAmount = data.stakeAmount;
        socket.data.matchmaking = true;
        socket.join(`matchmaking_${data.gameType}_${data.stakeAmount}`);

        // Find existing opponent in matchmaking
        const clients = SocketServer.io?.sockets.sockets;
        if (clients) {
          for (const [id, clientSocket] of clients.entries()) {
            if (id !== socket.id &&
                clientSocket.data.authenticated &&
                clientSocket.data.matchmaking &&
                clientSocket.data.gameType === data.gameType &&
                clientSocket.data.stakeAmount === data.stakeAmount) {

              // Found opponent, create match
              const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

              // Create rooms for the match
              socket.join(matchId);
              clientSocket.join(matchId);

              // Clear matchmaking state
              socket.data.matchmaking = false;
              clientSocket.data.matchmaking = false;
              socket.data.matchId = matchId;
              clientSocket.data.matchId = matchId;

              // Notify both players
              socket.emit('matchFound', {
                matchId,
                opponent: {
                  id: clientSocket.data.userId,
                  username: `Player_${clientSocket.data.userId?.slice(-4)}`,
                  // Add more opponent details from database in real implementation
                },
                gameSettings: {
                  gameType: data.gameType,
                  stakeAmount: data.stakeAmount,
                },
              });

              clientSocket.emit('matchFound', {
                matchId,
                opponent: {
                  id: socket.data.userId,
                  username: `Player_${socket.data.userId?.slice(-4)}`,
                  // Add more opponent details from database in real implementation
                },
                gameSettings: {
                  gameType: data.gameType,
                  stakeAmount: data.stakeAmount,
                },
              });

              console.log('Match created:', matchId);
              return;
            }
          }
        }

        // No opponent found, add to queue
        socket.emit('searchingForOpponent');
        console.log('User added to matchmaking queue:', socket.data.userId);
      });

      // Handle ready state
      socket.on('playerReady', (data: { matchId: string; isReady: boolean }) => {
        const { matchId, isReady } = data;

        if (!socket.data.authenticated) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        socket.data.isReady = isReady;
        socket.to(matchId).emit('opponentReady', { isReady });

        // Check if both players are ready
        const clients = SocketServer.io?.sockets.sockets;
        if (clients) {
          const matchPlayers = Array.from(clients.values()).filter(
            client => client.data.matchId === matchId
          );

          if (matchPlayers.length === 2 &&
              matchPlayers.every(player => player.data.isReady)) {

            // Start game countdown
            const countdown = 3;
            matchPlayers.forEach(player => {
              player.emit('gameStarting', { countdown });
            });

            // Start game after countdown
            setTimeout(() => {
              matchPlayers.forEach(player => {
                player.emit('gameStarted', {
                  matchId,
                  firstPlayer: matchPlayers[0].id,
                });
              });
            }, countdown * 1000);
          }
        }
      });

      // Handle game moves
      socket.on('gameMove', (data: { matchId: string; move: any; gameType: string }) => {
        const { matchId, move, gameType } = data;

        if (!socket.data.authenticated || socket.data.matchId !== matchId) {
          socket.emit('error', { message: 'Invalid match' });
          return;
        }

        // Broadcast move to opponent
        socket.to(matchId).emit('opponentMove', {
          move,
          gameType,
          timestamp: Date.now(),
        });
      });

      // Handle game results
      socket.on('gameResult', (data: { matchId: string; result: 'win' | 'lose' | 'draw'; details?: any }) => {
        const { matchId, result, details } = data;

        if (!socket.data.authenticated || socket.data.matchId !== matchId) {
          socket.emit('error', { message: 'Invalid match' });
          return;
        }

        // Determine opponent's result
        let opponentResult: 'win' | 'lose' | 'draw';
        if (result === 'draw') {
          opponentResult = 'draw';
        } else {
          opponentResult = result === 'win' ? 'lose' : 'win';
        }

        // Notify both players
        socket.to(matchId).emit('gameEnded', {
          result: opponentResult,
          opponentMove: details,
        });

        socket.emit('gameEnded', {
          result,
          yourMove: details,
        });

        // Clean up match after a delay
        setTimeout(() => {
          socket.leave(matchId);
          socket.data.matchId = null;
          socket.data.isReady = false;
        }, 5000);
      });

      // Handle leaving game
      socket.on('leaveGame', (data: { matchId: string }) => {
        const { matchId } = data;

        if (!socket.data.authenticated) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        socket.leave(matchId);
        socket.to(matchId).emit('opponentLeft');

        // Clean up
        socket.data.matchId = null;
        socket.data.matchmaking = false;
        socket.data.isReady = false;
      });

      // Handle voice chat events
      socket.on('joinVoiceChat', (data: { matchId: string; agoraChannel: string }) => {
        const { matchId, agoraChannel } = data;

        if (!socket.data.authenticated || socket.data.matchId !== matchId) {
          socket.emit('error', { message: 'Invalid match' });
          return;
        }

        socket.join(`voice_${matchId}`);

        // In real implementation, generate Agora tokens here
        socket.emit('voiceChatJoined', {
          matchId,
          agoraChannel,
          agoraToken: 'mock_agora_token', // Replace with real token generation
        });
      });

      socket.on('voiceChatMute', (data: { matchId: string; isMuted: boolean }) => {
        const { matchId, isMuted } = data;
        socket.to(matchId).emit('voiceChatMuted', { isMuted, userId: socket.data.userId });
      });

      // Handle wallet balance updates
      socket.on('requestBalance', () => {
        if (!socket.data.authenticated) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // In real implementation, fetch from database
        socket.emit('balanceUpdate', {
          balance: 10000, // Mock balance
          pendingDeposits: 0,
          pendingWithdrawals: 0,
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Handle opponent disconnection in matches
        if (socket.data.matchId) {
          socket.to(socket.data.matchId).emit('opponentDisconnected');
        }

        // Remove from matchmaking if applicable
        if (socket.data.matchmaking) {
          const matchmakingRoom = `matchmaking_${socket.data.gameType}_${socket.data.stakeAmount}`;
          socket.leave(matchmakingRoom);
        }
      });
    });

    console.log('Socket.IO server initialized');
  }

  return res.status(200).json({ message: 'Socket.IO server initialized' });
}