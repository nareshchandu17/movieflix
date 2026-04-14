import Redis from 'ioredis';

// Parse REDIS_URL if available
const redisUrl = process.env.REDIS_URL;
let connectionOptions: any = {};

if (redisUrl) {
  try {
    const parsed = new URL(redisUrl);
    connectionOptions = {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || process.env.REDIS_PASSWORD || undefined,
      username: parsed.username || undefined,
    };
  } catch (e) {
    console.warn('⚠️ Failed to parse REDIS_URL, falling back to individual variables');
  }
}

// Redis configuration
export const redisConfig = {
  port: connectionOptions.port || (process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379),
  host: connectionOptions.host || process.env.REDIS_HOST || 'localhost',
  password: connectionOptions.password || process.env.REDIS_PASSWORD || undefined,
  username: connectionOptions.username || process.env.REDIS_USERNAME || undefined,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
  maxRetriesPerRequest: null, 
  lazyConnect: true,
  retryStrategy(times: number) {
    if (times > 10) {
      console.warn('❌ Redis: Max retries reached. Stopping reconnection attempts.');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 1000, 5000);
    return delay;
  },
  keepAlive: 30000,
  family: 4,
  keyPrefix: 'MovieFlix:',
  connectTimeout: 10000,
};

export const redis = new Redis(redisConfig);

// Redis connection status
let isConnected = false;
let lastErrorTime = 0;

redis.on('connect', () => {
  isConnected = true;
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  const now = Date.now();
  // Only log error once every 5 seconds to prevent spam
  if (now - lastErrorTime > 5000) {
    console.error('❌ Redis connection error:', err.message || err);
    lastErrorTime = now;
  }
  isConnected = false;
});

redis.on('close', () => {
  isConnected = false;
  console.log('🔌 Disconnected from Redis');
});

// Redis utility functions
export class RedisManager {
  static async connect(): Promise<void> {
    try {
      if (!isConnected) {
        await redis.connect();
      }
    } catch (error) {
      // If max retries reached, ioredis emits error and retryStrategy returns null.
      // We log but don't throw to allow API routes to fall back to DB.
      if (Date.now() - lastErrorTime > 30000) {
        console.warn('⚠️ Redis: Connection unavailable. Operating in DB-only mode.');
        lastErrorTime = Date.now();
      }
    }
  }

  static async disconnect(): Promise<void> {
    try {
      if (isConnected) {
        await redis.quit();
      }
    } catch (error) {
      console.warn('⚠️ Redis: Graceful disconnect failed:', error);
      isConnected = false;
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.connect();
      
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl) {
        await redis.setex(key, ttl, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
    } catch (error) {
      console.error(`❌ Redis: set failed for key ${key}:`, error);
    }
  }

  static async get(key: string): Promise<any> {
    try {
      await this.connect();
      
      const value = await redis.get(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`❌ Redis: get failed for key ${key}:`, error);
      return null;
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await this.connect();
      await redis.del(key);
    } catch (error) {
      console.error(`❌ Redis: del failed for key ${key}:`, error);
    }
  }

  static async exists(key: string): Promise<boolean> {
    await this.connect();
    const result = await redis.exists(key);
    return result === 1;
  }

  static async expire(key: string, ttl: number): Promise<void> {
    await this.connect();
    await redis.expire(key, ttl);
  }

  static async ttl(key: string): Promise<number> {
    await this.connect();
    return await redis.ttl(key);
  }

  static async increment(key: string, amount: number = 1): Promise<number> {
    await this.connect();
    return await redis.incrby(key, amount);
  }

  static async hset(key: string, field: string, value: any): Promise<void> {
    await this.connect();
    await redis.hset(key, field, value);
  }

  static async hget(key: string, field: string): Promise<any> {
    await this.connect();
    return await redis.hget(key, field);
  }

  static async hgetall(key: string): Promise<any> {
    await this.connect();
    return redis.hgetall(key);
  }

  static async hdel(key: string, field: string): Promise<void> {
    await this.connect();
    await redis.hdel(key, field);
  }

  static async keys(pattern: string): Promise<string[]> {
    await this.connect();
    return redis.keys(pattern);
  }

  static async flushdb(): Promise<void> {
    await this.connect();
    await redis.flushdb();
  }

  // Watch history specific Redis operations
  static async setProgress(profileId: string, contentId: string, progress: number, duration: number): Promise<void> {
    const key = `progress:${profileId}:${contentId}`;
    const data = {
      progress,
      duration,
      updatedAt: Date.now(),
      deviceId: 'current' // Will be updated by actual device
    };
    
    await this.set(key, data, 7 * 24 * 60 * 60); // 7 days TTL
  }

  static async getProgress(profileId: string, contentId: string): Promise<any> {
    const key = `progress:${profileId}:${contentId}`;
    return await this.get(key);
  }

  static async deleteProgress(profileId: string, contentId: string): Promise<void> {
    const key = `progress:${profileId}:${contentId}`;
    await this.del(key);
  }

  static async getProfileProgress(profileId: string): Promise<any[]> {
    const pattern = `progress:${profileId}:*`;
    const keys = await this.keys(pattern);
    
    if (keys.length === 0) return [];
    
    const pipeline = redis.pipeline();
    
    keys.forEach(key => {
      pipeline.get(key);
    });
    
    const results = await pipeline.exec();
    
    if (!results) return [];
    
    return results.map(([err, value], index) => {
      if (err || !value) return null;
      
      try {
        const data = JSON.parse(value as string);
        const keyStr = keys[index];
        const [, , , contentId] = keyStr.split(':');
        return { contentId, ...data };
      } catch {
        return null;
      }
    }).filter(Boolean);
  }

  // Session management
  static async setSession(userId: string, deviceId: string, sessionData: any): Promise<void> {
    const key = `session:${userId}:${deviceId}`;
    await this.set(key, sessionData, 24 * 60 * 60); // 24 hours TTL
  }

  static async getSession(userId: string, deviceId: string): Promise<any> {
    const key = `session:${userId}:${deviceId}`;
    return await this.get(key);
  }

  static async deleteSession(userId: string, deviceId: string): Promise<void> {
    const key = `session:${userId}:${deviceId}`;
    await this.del(key);
  }

  // Device tracking
  static async updateDeviceStatus(deviceId: string, status: 'online' | 'offline'): Promise<void> {
    const key = `device:${deviceId}`;
    const data = {
      status,
      lastSeen: Date.now()
    };
    
    await this.set(key, data, 5 * 60); // 5 minutes TTL
  }

  static async getDeviceStatus(deviceId: string): Promise<any> {
    const key = `device:${deviceId}`;
    return await this.get(key);
  }

  // Real-time sync events
  static async emitSyncEvent(profileId: string, event: string, data: any): Promise<void> {
    const key = `sync:${profileId}:${event}`;
    const eventData = {
      event,
      data,
      timestamp: Date.now(),
      source: 'server'
    };
    
    await this.set(key, eventData, 30); // 30 seconds TTL
  }

  static async getSyncEvents(profileId: string, event?: string): Promise<any[]> {
    const pattern = event 
      ? `sync:${profileId}:${event}`
      : `sync:${profileId}:*`;
    
    const keys = await this.keys(pattern);
    
    if (keys.length === 0) return [];
    
    const pipeline = redis.pipeline();
    
    keys.forEach(key => {
      pipeline.get(key);
    });
    
    const results = await pipeline.exec();
    
    if (!results) return [];
    
    return results.map(([err, value], index) => {
      if (err || !value) return null;
      
      try {
        const data = JSON.parse(value as string);
        const keyStr = keys[index];
        const [, , , , eventName] = keyStr.split(':');
        return { event: eventName, ...data };
      } catch {
        return null;
      }
    }).filter(Boolean);
  }

  // Cache management
  static async invalidateProfileCache(profileId: string): Promise<void> {
    const patterns = [
      `progress:${profileId}:*`,
      `sync:${profileId}:*`,
      `session:${profileId}:*`
    ];
    
    const pipeline = redis.pipeline();
    
    patterns.forEach(pattern => {
      pipeline.del(pattern);
    });
    
    await pipeline.exec();
  }

  // Cleanup old data
  static async cleanup(): Promise<void> {
    const patterns = [
      'progress:*:*',
      'sync:*:*',
      'session:*:*',
      'device:*'
    ];
    
    const pipeline = redis.pipeline();
    
    patterns.forEach(pattern => {
      pipeline.del(pattern);
    });
    
    await pipeline.exec();
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; redis: boolean; error?: string }> {
    try {
      await this.connect();
      await redis.ping();
      
      return {
        status: 'connected',
        redis: true
      };
    } catch (error) {
      return {
        status: 'disconnected',
        redis: false,
        error: error.message
      };
    }
  }

  // Analytics
  static async getStats(): Promise<any> {
    await this.connect();
    
    const info = await redis.info();
    const keys = await redis.dbsize();
    
    return {
      status: isConnected ? 'connected' : 'disconnected',
      memory: info,
      keys: keys,
      uptime: info,
      version: info
    };
  }
}

export default RedisManager;
