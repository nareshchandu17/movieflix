import Redis from 'ioredis';

// Redis configuration
const redis = new Redis({
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 18823,
  host: process.env.REDIS_HOST || 'redis-18823.crce295.us-east-1-1.ec2.cloud.redislabs.com',
  password: process.env.REDIS_PASSWORD || 'lKhZRJdKmdFJf4J4z8M9ToqWquSMZKsd',
  username: process.env.REDIS_USERNAME || 'default',
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  keyPrefix: 'MovieFlix:',
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Redis connection status
let isConnected = false;

redis.on('connect', () => {
  isConnected = true;
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
  isConnected = false;
});

redis.on('close', () => {
  isConnected = false;
  console.log('🔌 Disconnected from Redis');
});

// Redis utility functions
export class RedisManager {
  static async connect(): Promise<void> {
    if (!isConnected) {
      await redis.connect();
    }
  }

  static async disconnect(): Promise<void> {
    if (isConnected) {
      await redis.quit();
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.connect();
    
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttl) {
      await redis.setex(key, ttl, stringValue);
    } else {
      await redis.set(key, stringValue);
    }
  }

  static async get(key: string): Promise<any> {
    await this.connect();
    
    const value = await redis.get(key);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  static async del(key: string): Promise<void> {
    await this.connect();
    await redis.del(key);
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
