import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';

export const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  reconnectOnError: (err) => {
    console.error('Redis connection error:', err);
    return true; // try to reconnect
  }
});

connection.on('error', (err) => {
  console.error('Redis client error:', err);
});

export const paperQueue = new Queue('paper-generation', { connection });
