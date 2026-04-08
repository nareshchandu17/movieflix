/**
 * Enhanced video synchronization for Watch Party
 * Features: Quality sync, subtitle sync, bandwidth detection, latency compensation
 */

export interface SyncMetrics {
  latency: number;
  bandwidth: number;
  packetLoss: number;
  quality: 'auto' | 'low' | 'medium' | 'high';
  resolution: { width: number; height: number };
  frameRate: number;
  bitrate: number;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url?: string;
  cues: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface SyncState {
  currentTime: number;
  playbackRate: number;
  quality: string;
  subtitleTrack: string | null;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  lastSyncTime: number;
  latencyOffset: number;
}

class VideoSyncManager {
  private localState: SyncState;
  private peerStates: Map<string, SyncState> = new Map();
  private syncCallbacks: ((state: SyncState) => void)[] = [];
  private qualityAdaptationCallbacks: ((quality: string) => void)[] = [];
  private subtitleSyncCallbacks: ((cues: any[]) => void)[] = [];
  
  private metrics: SyncMetrics;
  private syncInterval: NodeJS.Timeout | null = null;
  private bandwidthMonitorInterval: NodeJS.Timeout | null = null;
  private latencyHistory: number[] = [];
  private qualityHistory: string[] = [];
  
  private readonly MAX_LATENCY_HISTORY = 10;
  private readonly SYNC_INTERVAL = 1000; // 1 second
  private readonly BANDWIDTH_CHECK_INTERVAL = 5000; // 5 seconds
  private readonly TARGET_LATENCY = 200; // ms
  private readonly MAX_LATENCY_VARIANCE = 100; // ms

  constructor() {
    this.localState = this.initializeState();
    this.metrics = this.initializeMetrics();
    this.startSyncMonitoring();
    this.startBandwidthMonitoring();
  }

  private initializeState(): SyncState {
    return {
      currentTime: 0,
      playbackRate: 1.0,
      quality: 'auto',
      subtitleTrack: null,
      volume: 1.0,
      isMuted: false,
      isPlaying: false,
      lastSyncTime: Date.now(),
      latencyOffset: 0
    };
  }

  private initializeMetrics(): SyncMetrics {
    return {
      latency: 0,
      bandwidth: 0,
      packetLoss: 0,
      quality: 'auto',
      resolution: { width: 1280, height: 720 },
      frameRate: 30,
      bitrate: 1000
    };
  }

  /**
   * Update local video state
   */
  updateLocalState(state: Partial<SyncState>): void {
    this.localState = { ...this.localState, ...state, lastSyncTime: Date.now() };
    
    // Notify callbacks
    this.syncCallbacks.forEach(callback => callback(this.localState));
    
    // Adapt quality if needed
    this.adaptQuality();
    
    // Sync with peers
    this.syncWithPeers();
  }

  /**
   * Update peer state
   */
  updatePeerState(peerId: string, state: SyncState): void {
    this.peerStates.set(peerId, state);
    
    // Calculate latency compensation
    this.calculateLatencyCompensation(peerId, state);
  }

  /**
   * Remove peer state
   */
  removePeerState(peerId: string): void {
    this.peerStates.delete(peerId);
  }

  /**
   * Get current sync state
   */
  getSyncState(): SyncState {
    return { ...this.localState };
  }

  /**
   * Get sync metrics
   */
  getSyncMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  /**
   * Start sync monitoring
   */
  private startSyncMonitoring(): void {
    this.syncInterval = setInterval(() => {
      this.performSyncCheck();
    }, this.SYNC_INTERVAL);
  }

  /**
   * Start bandwidth monitoring
   */
  private startBandwidthMonitoring(): void {
    this.bandwidthMonitorInterval = setInterval(() => {
      this.measureBandwidth();
    }, this.BANDWIDTH_CHECK_INTERVAL);
  }

  /**
   * Perform sync check and compensation
   */
  private performSyncCheck(): void {
    if (this.peerStates.size === 0) return;

    const peerStates = Array.from(this.peerStates.values());
    const avgLatency = this.calculateAverageLatency();
    const timeVariance = this.calculateTimeVariance(peerStates);

    // Apply latency compensation if needed
    if (timeVariance > this.MAX_LATENCY_VARIANCE) {
      this.applyLatencyCompensation(avgLatency);
    }

    // Detect and compensate for drift
    this.detectAndCompensateDrift(peerStates);
  }

  /**
   * Calculate average latency
   */
  private calculateAverageLatency(): number {
    if (this.latencyHistory.length === 0) return 0;
    
    const sum = this.latencyHistory.reduce((acc, latency) => acc + latency, 0);
    return sum / this.latencyHistory.length;
  }

  /**
   * Calculate time variance between peers
   */
  private calculateTimeVariance(peerStates: SyncState[]): number {
    if (peerStates.length === 0) return 0;

    const times = peerStates.map(state => state.currentTime);
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    const variance = times.reduce((sum, time) => {
      return sum + Math.pow(time - avgTime, 2);
    }, 0) / times.length;

    return Math.sqrt(variance) * 1000; // Convert to milliseconds
  }

  /**
   * Calculate latency compensation for a specific peer
   */
  private calculateLatencyCompensation(peerId: string, peerState: SyncState): void {
    const now = Date.now();
    const latency = now - peerState.lastSyncTime;
    
    // Update latency history
    this.latencyHistory.push(latency);
    if (this.latencyHistory.length > this.MAX_LATENCY_HISTORY) {
      this.latencyHistory.shift();
    }

    // Update metrics
    this.metrics.latency = this.calculateAverageLatency();
  }

  /**
   * Apply latency compensation
   */
  private applyLatencyCompensation(avgLatency: number): void {
    const compensation = avgLatency - this.TARGET_LATENCY;
    this.localState.latencyOffset = compensation / 1000; // Convert to seconds
    
    // Notify about compensation
    this.syncCallbacks.forEach(callback => callback(this.localState));
  }

  /**
   * Detect and compensate for playback drift
   */
  private detectAndCompensateDrift(peerStates: SyncState[]): void {
    if (peerStates.length === 0) return;

    const localTime = this.localState.currentTime;
    const peerTimes = peerStates.map(state => state.currentTime);
    const avgPeerTime = peerTimes.reduce((sum, time) => sum + time, 0) / peerTimes.length;
    
    const drift = localTime - avgPeerTime;
    
    // Apply drift compensation if significant
    if (Math.abs(drift) > 0.5) { // 0.5 seconds threshold
      this.localState.latencyOffset -= drift * 0.1; // Gradual compensation
      this.syncCallbacks.forEach(callback => callback(this.localState));
    }
  }

  /**
   * Measure bandwidth and adapt quality
   */
  private measureBandwidth(): void {
    // Simulate bandwidth measurement
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      this.metrics.bandwidth = connection.downlink || 0;
      this.metrics.latency = connection.rtt || 0;
    } else {
      // Fallback measurement using WebRTC stats if available
      this.measureWebRTCBandwidth();
    }

    // Adapt quality based on bandwidth
    this.adaptQuality();
  }

  /**
   * Measure WebRTC bandwidth
   */
  private measureWebRTCBandwidth(): void {
    // This would integrate with WebRTC stats API
    // For now, using simulated values
    this.metrics.bandwidth = Math.random() * 10 + 1; // 1-11 Mbps
    this.metrics.latency = Math.random() * 200 + 50; // 50-250 ms
  }

  /**
   * Adapt video quality based on metrics
   */
  private adaptQuality(): void {
    const { bandwidth, latency } = this.metrics;
    let newQuality: string;

    // Quality adaptation logic
    if (bandwidth < 1 || latency > 500) {
      newQuality = 'low';
    } else if (bandwidth < 3 || latency > 200) {
      newQuality = 'medium';
    } else if (bandwidth < 6 || latency > 100) {
      newQuality = 'high';
    } else {
      newQuality = 'auto';
    }

    if (newQuality !== this.localState.quality) {
      this.localState.quality = newQuality;
      this.updateQualitySettings(newQuality);
      this.qualityAdaptationCallbacks.forEach(callback => callback(newQuality));
    }
  }

  /**
   * Update quality settings
   */
  private updateQualitySettings(quality: string): void {
    switch (quality) {
      case 'low':
        this.metrics.resolution = { width: 426, height: 240 };
        this.metrics.frameRate = 15;
        this.metrics.bitrate = 300;
        break;
      case 'medium':
        this.metrics.resolution = { width: 640, height: 360 };
        this.metrics.frameRate = 25;
        this.metrics.bitrate = 800;
        break;
      case 'high':
        this.metrics.resolution = { width: 1280, height: 720 };
        this.metrics.frameRate = 30;
        this.metrics.bitrate = 2000;
        break;
      case 'auto':
        this.metrics.resolution = { width: 854, height: 480 };
        this.metrics.frameRate = 30;
        this.metrics.bitrate = 1000;
        break;
    }

    this.metrics.quality = quality as any;
  }

  /**
   * Sync subtitles across peers
   */
  syncSubtitles(subtitleTrack: SubtitleTrack, currentTime: number): void {
    const activeCues = subtitleTrack.cues.filter(
      cue => currentTime >= cue.start && currentTime <= cue.end
    );

    this.subtitleSyncCallbacks.forEach(callback => callback(activeCues));
  }

  /**
   * Sync with all peers
   */
  private syncWithPeers(): void {
    // This would send sync state to all peers via WebSocket
    console.log('Syncing with peers:', this.localState);
  }

  /**
   * Subscribe to sync state changes
   */
  onSyncStateChange(callback: (state: SyncState) => void): () => void {
    this.syncCallbacks.push(callback);
    
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to quality adaptation
   */
  onQualityAdaptation(callback: (quality: string) => void): () => void {
    this.qualityAdaptationCallbacks.push(callback);
    
    return () => {
      const index = this.qualityAdaptationCallbacks.indexOf(callback);
      if (index > -1) {
        this.qualityAdaptationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to subtitle sync
   */
  onSubtitleSync(callback: (cues: any[]) => void): () => void {
    this.subtitleSyncCallbacks.push(callback);
    
    return () => {
      const index = this.subtitleSyncCallbacks.indexOf(callback);
      if (index > -1) {
        this.subtitleSyncCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get sync statistics
   */
  getSyncStatistics(): {
    averageLatency: number;
    packetLossRate: number;
    qualityChanges: number;
    syncAccuracy: number;
  } {
    const averageLatency = this.calculateAverageLatency();
    const qualityChanges = this.qualityHistory.length;
    const syncAccuracy = Math.max(0, 100 - (averageLatency / this.TARGET_LATENCY) * 100);

    return {
      averageLatency,
      packetLossRate: this.metrics.packetLoss,
      qualityChanges,
      syncAccuracy
    };
  }

  /**
   * Force resync with all peers
   */
  forceResync(): void {
    this.localState.lastSyncTime = Date.now();
    this.localState.latencyOffset = 0;
    this.syncWithPeers();
    this.syncCallbacks.forEach(callback => callback(this.localState));
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.bandwidthMonitorInterval) {
      clearInterval(this.bandwidthMonitorInterval);
      this.bandwidthMonitorInterval = null;
    }
    
    this.syncCallbacks = [];
    this.qualityAdaptationCallbacks = [];
    this.subtitleSyncCallbacks = [];
    this.peerStates.clear();
    this.latencyHistory = [];
    this.qualityHistory = [];
  }
}

export default VideoSyncManager;
