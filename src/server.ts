import { createServer } from 'http';
import app from './app';
import WebSocketService from './websocket';

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket service
const webSocketService = new WebSocketService(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Rival Gaming Server running on port ${PORT}`);
  console.log(`📡 WebSocket server initialized`);
  console.log(`👥 Currently serving ${webSocketService.getConnectedUsers()} connected users`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  webSocketService.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  webSocketService.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { server, webSocketService };