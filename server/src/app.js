import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import officeRoutes from './routes/officeRoutes.js';
import userRoutes from './routes/userRoutes.js';
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

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/users', userRoutes);

// Central Error Handler
app.use(errorHandler);

export default app;
