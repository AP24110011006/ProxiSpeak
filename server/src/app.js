import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import officeRoutes from './routes/officeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import spatialChatRoutes from './routes/spatialChatRoutes.js';
import moderationRoutes from './routes/moderationRoutes.js';
import meshDiagnosticsRoutes from './routes/meshDiagnosticsRoutes.js';
import screenShareRoutes from './routes/screenShareRoutes.js';
import { getSystemHealth } from './services/healthService.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientOrigin, 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Diagnostics
app.get('/api/health', (req, res) => {
  const health = getSystemHealth();
  res.json(health);
});

// Core Enterprise Routes
app.use('/api/auth', authRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', meetingRoutes);
app.use('/api/metrics', metricsRoutes);

// Week 4 Collaboration, Telemetry & Moderation Routes
app.use('/api/chat', spatialChatRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/mesh', meshDiagnosticsRoutes);
app.use('/api/screenshare', screenShareRoutes);

// Central Error Handler
app.use(errorHandler);

export default app;
