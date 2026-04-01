import RedisManager from './redis';
import WebSocketManager from './websocket';
import WatchHistory from './models/WatchHistory';
import Device from './models/Device';

export interface SyncEvent {
  type: string;
  data: any;
  timestamp: number;
  source: string;
  deviceId?: string;
  profileId: string;
}

export interface ProgressUpdate {
  contentId: string;
  progress: number;
  duration: number;
  completed: boolean;
  deviceId: string;
  timestamp: number;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  isOnline: boolean;
  lastActiveAt: Date;
}

export class SyncEngine {
  private static instance: SyncEngine;
  private wsManager: WebSocketManager;
  private syncQueue: Map<string, SyncEvent[]> = new Map();
  private processingQueue: Set<string> = new Set();

  private constructor() {
    this.wsManager = new WebSocketManager();
  }

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  async initialize(): Promise<void> {
    await this.wsManager.initialize();
    console.log('🔄 Sync Engine initialized');
  }

  /**
   * Update watch progress and sync across devices
   */
  async updateProgress(profileId: string, progressUpdate: ProgressUpdate): Promise<void> {
    const { contentId, progress, duration, completed, deviceId, timestamp } = progressUpdate;
    
    try {
      // Update MongoDB
      await WatchHistory.findOneAndUpdate(
        { profileId, contentId },
        {
          progress,
          duration,
          completed,
          lastWatchedAt: new Date(timestamp),
          deviceId,
          $inc: { watchTime: 5 } // Increment watch time
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );

      // Update Redis cache
      await RedisManager.setProgress(profileId, contentId, progress, duration);

      // Create sync event
      const syncEvent: SyncEvent = {
        type: 'progress:update',
        data: {
          contentId,
          progress,
          duration,
          completed,
          timestamp,
          deviceId
        },
        timestamp: Date.now(),
        source: 'sync_engine',
        deviceId,
        profileId
      };

      // Queue for WebSocket emission
      this.queueSyncEvent(profileId, syncEvent);

      // Emit real-time update to all devices
      await this.wsManager.emitToProfile(profileId, 'progress:update', syncEvent.data);

      console.log(`🔄 Progress synced: ${contentId} - ${Math.round((progress / duration) * 100)}%`);

    } catch (error) {
      console.error('❌ Failed to sync progress:', error);
      throw error;
    }
  }

  /**
   * Get current progress for content
   */
  async getProgress(profileId: string, contentId: string): Promise<ProgressUpdate | null> {
    try {
      // Try Redis first (fast)
      const cached = await RedisManager.getProgress(profileId, contentId);
      if (cached) {
        return {
          contentId,
          progress: cached.progress,
          duration: cached.duration,
          completed: cached.completed,
          deviceId: cached.deviceId,
          timestamp: cached.updatedAt
        };
      }

      // Fall back to MongoDB
      const watchHistory = await WatchHistory.findOne({ profileId, contentId });
      if (!watchHistory) return null;

      return {
        contentId,
        progress: watchHistory.progress,
        duration: watchHistory.duration,
        completed: watchHistory.completed,
        deviceId: watchHistory.deviceId || 'unknown',
        timestamp: watchHistory.lastWatchedAt.getTime()
      };

    } catch (error) {
      console.error('❌ Failed to get progress:', error);
      return null;
    }
  }

  /**
   * Get all progress for a profile
   */
  async getProfileProgress(profileId: string): Promise<ProgressUpdate[]> {
    try {
      // Get from Redis (fast)
      const cachedProgress = await RedisManager.getProfileProgress(profileId);
      
      if (cachedProgress.length > 0) {
        return cachedProgress.map(item => ({
          contentId: item.contentId,
          progress: item.progress,
          duration: item.duration,
          completed: false, // Redis doesn't store completion status
          deviceId: item.deviceId,
          timestamp: item.updatedAt
        }));
      }

      // Fall back to MongoDB
      const watchHistory = await WatchHistory.find({ profileId })
        .sort({ lastWatchedAt: -1 })
        .limit(50);

      return watchHistory.map(item => ({
        contentId: item.contentId,
        progress: item.progress,
        duration: item.duration,
        completed: item.completed,
        deviceId: item.deviceId || 'unknown',
        timestamp: item.lastWatchedAt.getTime()
      }));

    } catch (error) {
      console.error('❌ Failed to get profile progress:', error);
      return [];
    }
  }

  /**
   * Sync seek operation across devices
   */
  async syncSeek(profileId: string, contentId: string, newTime: number, deviceId: string): Promise<void> {
    try {
      // Update progress
      await this.updateProgress(profileId, {
        contentId,
        progress: newTime,
        duration: 0, // Will be updated by the actual progress update
        completed: false,
        deviceId,
        timestamp: Date.now()
      });

      // Create seek-specific event
      const syncEvent: SyncEvent = {
        type: 'seek',
        data: {
          contentId,
          newTime,
          deviceId,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        source: 'sync_engine',
        deviceId,
        profileId
      };

      // Emit to other devices
      await this.wsManager.emitToProfile(profileId, 'seek', syncEvent.data);

      console.log(`🔄 Seek synced: ${contentId} - ${newTime}s`);

    } catch (error) {
      console.error('❌ Failed to sync seek:', error);
      throw error;
    }
  }

  /**
   * Sync play/pause state
   */
  async syncPlaybackState(profileId: string, contentId: string, state: 'playing' | 'paused', deviceId: string): Promise<void> {
    try {
      const syncEvent: SyncEvent = {
        type: 'playback',
        data: {
          contentId,
          state,
          deviceId,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        source: 'sync_engine',
        deviceId,
        profileId
      };

      // Emit to other devices
      await this.wsManager.emitToProfile(profileId, 'playback', syncEvent.data);

      console.log(`🔄 Playback synced: ${contentId} - ${state}`);

    } catch (error) {
      console.error('❌ Failed to sync playback state:', error);
      throw error;
    }
  }

  /**
   * Get connected devices for a profile
   */
  async getConnectedDevices(profileId: string): Promise<DeviceInfo[]> {
    try {
      const connectedClients = this.wsManager.getConnectedDevices(profileId);
      
      return connectedClients.map(client => ({
        deviceId: client.deviceId,
        deviceName: client.deviceName,
        deviceType: client.deviceType,
        isOnline: true,
        lastActiveAt: new Date()
      }));

    } catch (error) {
      console.error('❌ Failed to get connected devices:', error);
      return [];
    }
  }

  /**
   * Queue sync event for processing
   */
  private queueSyncEvent(profileId: string, event: SyncEvent): void {
    if (!this.syncQueue.has(profileId)) {
      this.syncQueue.set(profileId, []);
    }
    
    const queue = this.syncQueue.get(profileId)!;
    queue.push(event);
    
    // Process queue if not already processing
    if (!this.processingQueue.has(profileId)) {
      this.processSyncQueue(profileId);
    }
  }

  /**
   * Process sync queue for a profile
   */
  private async processSyncQueue(profileId: string): Promise<void> {
    if (this.processingQueue.has(profileId)) return;
    
    this.processingQueue.add(profileId);
    
    try {
      const queue = this.syncQueue.get(profileId) || [];
      
      while (queue.length > 0) {
        const event = queue.shift();
        
        // Store in Redis for persistence
        await RedisManager.emitSyncEvent(profileId, event.type, event);
        
        // Add small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
    } catch (error) {
      console.error('❌ Error processing sync queue:', error);
    } finally {
      this.processingQueue.delete(profileId);
    }
  }

  /**
   * Handle device disconnection
   */
  async handleDeviceDisconnect(deviceId: string, profileId: string): Promise<void> {
    try {
      // Update device status
      await RedisManager.updateDeviceStatus(deviceId, 'offline');
      
      // Update device in database
      await Device.updateLastSeen(deviceId);
      
      // Notify other devices
      const syncEvent: SyncEvent = {
        type: 'device:disconnected',
        data: {
          deviceId,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        source: 'sync_engine',
        deviceId,
        profileId
      };

      await this.wsManager.emitToProfile(profileId, 'device:disconnected', syncEvent.data);

      console.log(`📱 Device disconnected: ${deviceId}`);

    } catch (error) {
      console.error('❌ Failed to handle device disconnection:', error);
    }
  }

  /**
   * Handle device reconnection
   */
  async handleDeviceReconnect(deviceId: string, profileId: string): Promise<void> {
    try {
      // Update device status
      await RedisManager.updateDeviceStatus(deviceId, 'online');
      
      // Update device in database
      await Device.updateLastSeen(deviceId);
      
      // Notify other devices
      const syncEvent: SyncEvent = {
        type: 'device:connected',
        data: {
          deviceId,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        source: 'sync_engine',
        deviceId,
        profileId
      };

      await this.wsManager.emitToProfile(profileId, 'device:connected', syncEvent.data);

      console.log(`📱 Device reconnected: ${deviceId}`);

    } catch (error) {
      console.error('❌ Failed to handle device reconnection:', error);
    }
  }

  /**
   * Resolve conflicts (latest timestamp wins)
   */
  async resolveConflict(profileId: string, contentId: string, updates: ProgressUpdate[]): Promise<ProgressUpdate> {
    if (updates.length === 0) {
      throw new Error('No updates to resolve');
    }

    // Find the latest update by timestamp
    const latest = updates.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );

    // Update with the latest
    await this.updateProgress(profileId, latest);

    console.log(`🔄 Conflict resolved for ${contentId}: Using update from ${latest.deviceId}`);
    
    return latest;
  }

  /**
   * Get sync statistics
   */
  async getStats(): Promise<any> {
    try {
      const wsStats = this.wsManager.getStats();
      const redisStats = await RedisManager.getStats();
      
      return {
        websocket: wsStats,
        redis: redisStats,
        queueSize: Array.from(this.syncQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
        processingQueues: this.processingQueue.size,
        connectedProfiles: this.profileRooms.size
      };

    } catch (error) {
      console.error('❌ Failed to get sync stats:', error);
      return null;
    }
  }

  /**
   * Cleanup old data
   */
  async cleanup(): Promise<void> {
    try {
      // Clear old sync events from Redis
      const patterns = [
        'sync:*:*',
        'device:*'
      ];
      
      for (const pattern of patterns) {
        await RedisManager.del(pattern);
      }
      
      // Clear sync queue
      this.syncQueue.clear();
      this.processingQueue.clear();
      
      console.log('🧹 Sync engine cleanup completed');

    } catch (error) {
      console.error('❌ Failed to cleanup sync engine:', error);
    }
  }

  /**
   * Shutdown sync engine
   */
  async shutdown(): Promise<void> {
    try {
      await this.cleanup();
      await this.wsManager.shutdown();
      console.log('🔌 Sync engine shutdown');
    } catch (error) {
      console.error('❌ Failed to shutdown sync engine:', error);
    }
  }
}

export default SyncEngine;
