import Redis from 'ioredis';

let pubClient = null;
let subClient = null;
let isRedisAvailable = false;

export const initRedis = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('[Redis] No REDIS_URL provided; operating in standalone in-memory mode.');
    return { isRedisAvailable: false, pubClient: null, subClient: null };
  }

  try {
    pubClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 2000)),
      lazyConnect: true,
    });

    pubClient.on('connect', () => {
      console.log('[Redis] Connected to Redis Pub/Sub instance');
      isRedisAvailable = true;
    });

    pubClient.on('error', (err) => {
      console.warn(`[Redis] Redis connection notice: ${err.message}. Falling back to in-memory coordination.`);
      isRedisAvailable = false;
    });

    subClient = pubClient.duplicate();

    return { isRedisAvailable, pubClient, subClient };
  } catch (err) {
    console.warn(`[Redis] Init error: ${err.message}. Using in-memory adapter.`);
    return { isRedisAvailable: false, pubClient: null, subClient: null };
  }
};

export const getRedisStatus = () => ({ isRedisAvailable, pubClient, subClient });
