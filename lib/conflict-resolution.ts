import RedisManager from './redis';
import SyncEngine, { ProgressUpdate } from './sync-engine';

export interface ConflictResolutionStrategy {
  name: string;
  description: string;
  resolve: (updates: ProgressUpdate[]) => Promise<ProgressUpdate>;
}

export interface SyncStrategy {
  name: string;
  description: string;
  priority: number;
  conflictResolution: ConflictResolutionStrategy;
}

export class ConflictResolver {
  private static strategies: Map<string, ConflictResolutionStrategy> = new Map([
    ['latest_timestamp', {
      name: 'Latest Timestamp',
      description: 'Use the most recent update (default strategy)',
      resolve: async (updates: ProgressUpdate[]) => {
        const latest = updates.reduce((latest, current) => 
          current.timestamp > latest.timestamp ? current : latest
        );
        return latest;
      }
    }],
    ['longest_watch_time', {
      name: 'Longest Watch Time',
      description: 'Use the update with the most total watch time',
      resolve: async (updates: ProgressUpdate[]) => {
        const longest = updates.reduce((longest, current) => 
          current.progress > longest.progress ? current : longest
        );
        return longest;
      }
    }],
    ['highest_completion', {
      name: 'Highest Completion',
      description: 'Use the update closest to completion',
      resolve: async (updates: ProgressUpdate[]) => {
        const highest = updates.reduce((highest, current) => {
          const currentCompletion = current.duration > 0 ? current.progress / current.duration : 0;
          const highestCompletion = highest.duration > 0 ? highest.progress / highest.duration : 0;
          return currentCompletion > highestCompletion ? current : highest;
        });
        return highest;
      }
    }],
    ['first_update', {
      name: 'First Update',
      description: 'Use the first update received',
      resolve: async (updates: ProgressUpdate[]) => {
        return updates[0];
      }
    }],
    ['majority_vote', {
      name: 'Majority Vote',
      description: 'Use the most common progress value',
      resolve: async (updates: ProgressUpdate[]) => {
        // Group by progress ranges (e.g., 0-25%, 25-50%, 50-75%, 75-100%)
        const ranges = [
          { min: 0, max: 0.25, count: 0 },
          { min: 0.25, max: 0.5, count: 0 },
          { min: 0.5, max: 0.75, count: 0 },
          { min: 0.75, max: 1.0, count: 0 }
        ];
        
        updates.forEach(update => {
          const progress = update.duration > 0 ? update.progress / update.duration : 0;
          ranges.forEach(range => {
            if (progress >= range.min && progress < range.max) {
              range.count++;
            }
          });
        });
        
        const majorityRange = ranges.reduce((majority, current) => 
          current.count > majority.count ? current : majority
        );
        
        // Find an update in the majority range
        const targetProgress = (majorityRange.min + majorityRange.max) / 2;
        const closest = updates.reduce((closest, current) => {
          const currentProgress = current.duration > 0 ? current.progress / current.duration : 0;
          const closestProgress = closest.duration > 0 ? closest.progress / closest.duration : 0;
          return Math.abs(currentProgress - targetProgress) < Math.abs(closestProgress - targetProgress) ? current : closest;
        });
        
        return closest;
      }
    }]
  ]);

  private static syncStrategies: Map<string, SyncStrategy> = new Map([
    ['real_time', {
      name: 'Real-Time',
      description: 'Sync changes immediately (default)',
      priority: 1,
      conflictResolution: this.strategies.get('latest_timestamp')!
    }],
    ['batched', {
      name: 'Batched',
      description: 'Batch sync every 5 seconds',
      priority: 2,
      conflictResolution: this.strategies.get('latest_timestamp')!
    }],
    ['eventual', {
      name: 'Eventual',
      description: 'Sync on user action or page load',
      priority: 3,
      conflictResolution: this.strategies.get('latest_timestamp')!
    }],
    ['on_demand', {
      name: 'On-Demand',
      description: 'Sync only when explicitly requested',
      priority: 4,
      conflictResolution: this.getStrategyForContent('default')!
    }]
  ]);

  /**
   * Get conflict resolution strategy by name
   */
  static getStrategy(name: string): ConflictResolutionStrategy | null {
    return this.strategies.get(name) || null;
  }

  /**
   * Get conflict resolution strategy for content type
   */
  static getStrategyForContent(contentType: string): ConflictResolutionStrategy {
    // Different content types might prefer different strategies
    switch (contentType) {
      case 'movie':
        return this.strategies.get('highest_completion')!;
      case 'series':
        return this.strategies.get('longest_watch_time')!;
      case 'episode':
        return this.strategies.get('latest_timestamp')!;
      default:
        return this.strategies.get('latest_timestamp')!;
    }
  }

  /**
   * Get sync strategy by name
   */
  static getSyncStrategy(name: string): SyncStrategy | null {
    return this.syncStrategies.get(name) || null;
  }

  /**
   * Get default sync strategy
   */
  static getDefaultSyncStrategy(): SyncStrategy {
    return this.syncStrategies.get('real_time')!;
  }

  /**
   * Resolve conflicts using the specified strategy
   */
  async resolveConflicts(
    profileId: string, 
    contentId: string, 
    updates: ProgressUpdate[],
    strategyName?: string
  ): Promise<ProgressUpdate> {
    const strategy = strategyName 
      ? ConflictResolver.getStrategy(strategyName) 
      : ConflictResolver.getStrategyForContent('default');

    if (!strategy) {
      throw new Error(`Unknown conflict resolution strategy: ${strategyName}`);
    }

    try {
      console.log(`🔧 Resolving conflicts for ${contentId} using ${strategy.name} strategy`);
      
      // Store conflict event in Redis for debugging
      await RedisManager.emitSyncEvent(profileId, 'conflict', {
        contentId,
        updates: updates.map(u => ({
          deviceId: u.deviceId,
          progress: u.progress,
          timestamp: u.timestamp
        })),
        resolvedBy: strategy.name,
        timestamp: Date.now()
      });

      const resolved = await strategy.resolve(updates);
      
      // Update with resolved progress
      await SyncEngine.getInstance().updateProgress(profileId, resolved);
      
      console.log(`✅ Conflict resolved: ${contentId} - Using ${strategy.name} strategy`);
      
      return resolved;

    } catch (error) {
      console.error('❌ Failed to resolve conflicts:', error);
      throw error;
    }
  }

  /**
   * Detect potential conflicts
   */
  detectConflicts(updates: ProgressUpdate[]): boolean {
    if (updates.length < 2) return false;
    
    // Check if multiple devices updated within a short time window (5 seconds)
    const timestamps = updates.map(u => u.timestamp).sort((a, b) => b - a);
    const timeWindow = 5000; // 5 seconds
    
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[0] < timeWindow) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Analyze conflict patterns
   */
  analyzeConflictPattern(updates: ProgressUpdate[]): {
    totalUpdates: number;
    uniqueDevices: number;
    timeSpan: number;
    progressVariance: number;
    deviceDistribution: Record<string, number>;
    conflictType: string;
  } {
    const analysis = {
      totalUpdates: updates.length,
      uniqueDevices: new Set(updates.map(u => u.deviceId)).size,
      timeSpan: updates.length > 0 ? 
        Math.max(...updates.map(u => u.timestamp)) - Math.min(...updates.map(u => u.timestamp)) : 0,
      progressVariance: this.calculateProgressVariance(updates),
      deviceDistribution: this.getDeviceDistribution(updates),
      conflictType: '' as string
    };

    // Identify conflict type
    if (analysis.uniqueDevices === 1 && analysis.timeSpan < 1000) {
      analysis.conflictType = 'rapid_updates';
    } else if (analysis.uniqueDevices > 1 && analysis.timeSpan < 10000) {
      analysis.conflictType = 'simultaneous_updates';
    } else if (analysis.progressVariance > 0.5) {
      analysis.conflictType = 'progress_variance';
    } else {
      analysis.conflictType = 'sequential_updates';
    }

    return analysis;
  }

  /**
   * Calculate progress variance
   */
  private calculateProgressVariance(updates: ProgressUpdate[]): number {
    if (updates.length < 2) return 0;
    
    const progressValues = updates.map(u => 
      u.duration > 0 ? u.progress / u.duration : 0
    );
    
    const mean = progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length;
    const variance = progressValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / progressValues.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get device distribution
   */
  private getDeviceDistribution(updates: ProgressUpdate[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    updates.forEach(update => {
      distribution[update.deviceId] = (distribution[update.deviceId] || 0) + 1;
    });
    
    return distribution;
  }

  /**
   * Get conflict resolution recommendations
   */
  getRecommendations(conflictAnalysis: {
    conflictType: string;
    progressVariance: number;
    deviceDistribution?: Record<string, number>;
  }): string[] {
    const recommendations: string[] = [];
    
    if (conflictAnalysis.conflictType === 'rapid_updates') {
      recommendations.push('Consider adding debouncing to prevent rapid updates');
      recommendations.push('Use batched sync strategy for frequent updates');
    } else if (conflictAnalysis.conflictType === 'simultaneous_updates') {
      recommendations.push('Implement device priority system');
      recommendations.push('Use latest timestamp strategy for real-time conflicts');
    } else if (conflictAnalysis.progressVariance > 0.5) {
      recommendations.push('Use highest completion strategy for inconsistent progress');
      recommendations.push('Consider user preference-based conflict resolution');
    } else if (conflictAnalysis.deviceDistribution && 
               Object.keys(conflictAnalysis.deviceDistribution).length > 3) {
      recommendations.push('Consider device limit enforcement');
      recommendations.push('Use device-specific sync preferences');
    }

    return recommendations;
  }

  /**
   * Validate sync data integrity
   */
  validateSyncData(update: ProgressUpdate): boolean {
    // Basic validation
    if (!update.contentId || update.progress < 0 || update.duration < 0) {
      return false;
    }

    // Check for reasonable progress values
    if (update.progress > update.duration) {
      return false;
    }

    // Check timestamp is reasonable (not in future)
    if (update.timestamp > Date.now()) {
      return false;
    }

    // Check timestamp is not too old (older than 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (update.timestamp < thirtyDaysAgo) {
      return false;
    }

    return true;
  }

  /**
   * Sanitize sync data
   */
  sanitizeSyncData(update: ProgressUpdate): ProgressUpdate {
    return {
      ...update,
      progress: Math.max(0, Math.min(update.progress, update.duration || Infinity)),
      duration: Math.max(1, update.duration),
      timestamp: Math.min(Date.now(), Math.max(0, update.timestamp)),
      deviceId: update.deviceId || 'unknown'
    };
  }

  /**
   * Merge conflicting updates
   */
  mergeUpdates(base: ProgressUpdate, update: ProgressUpdate): ProgressUpdate {
    return {
      ...base,
      progress: update.progress,
      duration: Math.max(base.duration, update.duration),
      completed: update.completed || base.completed,
      deviceId: update.deviceId || base.deviceId,
      timestamp: update.timestamp
    };
  }

  /**
   * Get sync statistics
   */
  static async getStats(): Promise<{
    totalConflicts: number;
    resolvedConflicts: number;
    resolutionRate: number;
    availableStrategies: string[];
    defaultStrategy: string;
  } | null> {
    try {
      const patterns = [
        'conflict:*',
        'sync:*:*'
      ];
      
      let totalConflicts = 0;
      let resolvedConflicts = 0;
      
      for (const pattern of patterns) {
        const keys = await RedisManager.keys(pattern);
        totalConflicts += keys.length;
        
        for (const key of keys) {
          const event = await RedisManager.get(key);
          if (event && event.resolvedBy) {
            resolvedConflicts++;
          }
        }
      }

      return {
        totalConflicts,
        resolvedConflicts,
        resolutionRate: totalConflicts > 0 ? (resolvedConflicts / totalConflicts) * 100 : 0,
        availableStrategies: Array.from(this.strategies.keys()),
        defaultStrategy: this.getDefaultSyncStrategy().name
      };

    } catch (error) {
      console.error('❌ Failed to get conflict resolution stats:', error);
      return null;
    }
  }

  /**
   * Test conflict resolution
   */
  static async testConflictResolution(): Promise<void> {
    const testUpdates: ProgressUpdate[] = [
      {
        contentId: 'test-movie-1',
        progress: 600,
        duration: 3600,
        completed: false,
        deviceId: 'device-1',
        timestamp: Date.now() - 1000
      },
      {
        contentId: 'test-movie-1',
        progress: 1200,
        duration: 3600,
        completed: false,
        deviceId: 'device-2',
        timestamp: Date.now() - 500
      },
      {
        contentId: 'test-movie-1',
        progress: 900,
        duration: 3600,
        completed: false,
        deviceId: 'device-3',
        timestamp: Date.now()
      }
    ];

    const resolver = new ConflictResolver();
    const analysis = resolver.analyzeConflictPattern(testUpdates);
    console.log('🧪 Conflict Analysis:', analysis);

    try {
      const resolved = await resolver.resolveConflicts('profile-1', 'test-movie-1', testUpdates, 'latest_timestamp');
      console.log('✅ Test conflict resolution successful:', resolved);
    } catch (error) {
      console.error('❌ Test conflict resolution failed:', error);
    }
  }
}

export default ConflictResolver;
