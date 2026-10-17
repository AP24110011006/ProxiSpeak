import mongoose from 'mongoose';
import { presenceService } from './presenceService.js';
import { proximityService } from './proximityService.js';

/**
 * HealthService: Diagnostics and system health monitor for ProxiSpeak backend
 */
export const getSystemHealth = () => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbReadyState = mongoose.connection.readyState;
  const isDbConnected = dbReadyState === 1;

  // Aggregate active users across all offices
  let totalActiveUsers = 0;
  let totalActiveOffices = 0;

  if (presenceService && presenceService.offices) {
    totalActiveOffices = presenceService.offices.size;
    for (const [, userMap] of presenceService.offices) {
      totalActiveUsers += userMap.size;
    }
  }

  const memoryUsage = process.memoryUsage();

  return {
    success: true,
    status: isDbConnected ? 'healthy' : 'degraded',
    service: 'ProxiSpeak Geospatial Signaling Server',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStateMap[dbReadyState] || 'unknown',
      connected: isDbConnected,
      host: mongoose.connection.host || 'local',
      name: mongoose.connection.name || 'proxispeak',
    },
    presence: {
      activeOffices: totalActiveOffices,
      activeUsers: totalActiveUsers,
    },
    geospatialEngine: {
      status: 'active',
      defaultRadius: proximityService?.defaultRadius || 100,
      bufferRadius: proximityService?.buffer || 15,
      indexType: '2dsphere',
    },
    memory: {
      heapUsedMB: Number((memoryUsage.heapUsed / 1024 / 1024).toFixed(2)),
      heapTotalMB: Number((memoryUsage.heapTotal / 1024 / 1024).toFixed(2)),
      rssMB: Number((memoryUsage.rss / 1024 / 1024).toFixed(2)),
    },
  };
};
