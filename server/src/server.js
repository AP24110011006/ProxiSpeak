import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDatabase } from './config/database.js';
import { initSocketServer } from './sockets/socketServer.js';
import { officeService } from './services/officeService.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDatabase();

    // 2. Ensure initial default office is seeded
    await officeService.ensureDefaultOffice();

    // 3. Create HTTP Server & Initialize WebSocket
    const httpServer = http.createServer(app);
    const io = initSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`[ProxiSpeak Server] Running on http://localhost:${PORT}`);
      console.log(`[ProxiSpeak WebSocket] Ready for real-time signaling & spatial movements`);
    });
  } catch (error) {
    console.error('[Server Bootstrap Error]', error);
    process.exit(1);
  }
};

startServer();
