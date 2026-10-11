import { Server } from 'socket.io';
import { socketAuthenticate } from '../middleware/authenticate.js';
import { registerPresenceHandlers } from './presenceHandler.js';
import { registerMovementHandlers } from './movementHandler.js';
import { registerSignalingHandlers } from './signalingHandler.js';
import { initRedis } from '../config/redis.js';

export const initSocketServer = (httpServer) => {
  const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

  const io = new Server(httpServer, {
    cors: {
      origin: [clientOrigin, 'http://localhost:3000', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // Optional Redis Pub/Sub adapter integration for multi-instance scaling
  const { isRedisAvailable } = initRedis();
  if (isRedisAvailable) {
    console.log('[SocketServer] Redis Pub/Sub adapter active for multi-node clustering.');
  }

  // Socket authentication middleware
  io.use(socketAuthenticate);

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user?.displayName || socket.user?.username} (${socket.id})`);

    // Register event handlers
    registerPresenceHandlers(io, socket);
    registerMovementHandlers(io, socket);
    registerSignalingHandlers(io, socket);

    socket.on('error', (err) => {
      console.error(`[Socket Error] ${socket.id}:`, err);
    });
  });

  return io;
};
