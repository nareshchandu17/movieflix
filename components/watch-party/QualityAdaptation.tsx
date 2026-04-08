"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Monitor, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Activity,
  Zap,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import VideoSyncManager, { type SyncMetrics } from "@/lib/videoSync";

interface QualityAdaptationProps {
  syncManager: VideoSyncManager;
  videoElement: HTMLVideoElement | null;
  onQualityChange: (quality: string) => void;
  className?: string;
}

interface QualityOption {
  label: string;
  value: string;
  resolution: { width: number; height: number };
  bitrate: number;
  frameRate: number;
  icon: React.ReactNode;
  recommended?: boolean;
}

export default function QualityAdaptation({
  syncManager,
  videoElement,
  onQualityChange,
  className = ""
}: QualityAdaptationProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [isAdaptive, setIsAdaptive] = useState(true);
  const [qualityHistory, setQualityHistory] = useState<Array<{ time: number; quality: string; reason: string }>>([]);
  const [bandwidthTrend, setBandwidthTrend] = useState<'stable' | 'improving' | 'declining'>('stable');

  const qualityOptions: QualityOption[] = [
    {
      label: 'Auto (Recommended)',
      value: 'auto',
      resolution: { width: 854, height: 480 },
      bitrate: 1000,
      frameRate: 30,
      icon: <Gauge className="w-4 h-4" />,
      recommended: true
    },
    {
      label: 'High (1080p)',
      value: 'high',
      resolution: { width: 1280, height: 720 },
      bitrate: 2000,
      frameRate: 30,
      icon: <Monitor className="w-4 h-4" />
    },
    {
      label: 'Medium (480p)',
      value: 'medium',
      resolution: { width: 640, height: 360 },
      bitrate: 800,
      frameRate: 25,
      icon: <Monitor className="w-4 h-4" />
    },
    {
      label: 'Low (240p)',
      value: 'low',
      resolution: { width: 426, height: 240 },
      bitrate: 300,
      frameRate: 15,
      icon: <Smartphone className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    // Subscribe to sync metrics
    const unsubscribeMetrics = syncManager.onSyncStateChange((state) => {
      setMetrics(syncManager.getSyncMetrics());
      setCurrentQuality(state.quality);
    });

    // Subscribe to quality adaptation
    const unsubscribeQuality = syncManager.onQualityAdaptation((quality) => {
      setCurrentQuality(quality);
      onQualityChange(quality);
      
      // Add to quality history
      setQualityHistory(prev => [
        ...prev.slice(-9), // Keep last 10 changes
        {
          time: Date.now(),
          quality,
          reason: 'Automatic adaptation'
        }
      ]);
    });

    return () => {
      unsubscribeMetrics();
      unsubscribeQuality();
    };
  }, [syncManager, onQualityChange]);

  useEffect(() => {
    // Monitor bandwidth trend
    const interval = setInterval(() => {
      const currentMetrics = syncManager.getSyncMetrics();
      if (currentMetrics.bandwidth > 0) {
        setBandwidthTrend(prev => {
          // Simple trend detection
          if (currentMetrics.bandwidth > 5) return 'improving';
          if (currentMetrics.bandwidth < 1) return 'declining';
          return 'stable';
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [syncManager]);

  const handleQualityChange = (quality: string) => {
    setCurrentQuality(quality);
    onQualityChange(quality);
    setIsAdaptive(quality === 'auto');
    
    // Update sync manager
    syncManager.updateLocalState({ quality });
    
    // Add to history
    setQualityHistory(prev => [
      ...prev.slice(-9),
      {
        time: Date.now(),
        quality,
        reason: 'Manual selection'
      }
    ]);
  };

  const getBandwidthStatus = () => {
    if (!metrics) return { status: 'unknown', color: 'text-gray-400', icon: <WifiOff className="w-4 h-4" /> };
    
    if (metrics.bandwidth === 0) return { status: 'unknown', color: 'text-gray-400', icon: <WifiOff className="w-4 h-4" /> };
    if (metrics.bandwidth < 1) return { status: 'poor', color: 'text-red-400', icon: <WifiOff className="w-4 h-4" /> };
    if (metrics.bandwidth < 3) return { status: 'fair', color: 'text-yellow-400', icon: <Wifi className="w-4 h-4" /> };
    if (metrics.bandwidth < 6) return { status: 'good', color: 'text-blue-400', icon: <Wifi className="w-4 h-4" /> };
    return { status: 'excellent', color: 'text-green-400', icon: <Wifi className="w-4 h-4" /> };
  };

  const getLatencyStatus = () => {
    if (!metrics) return { status: 'unknown', color: 'text-gray-400' };
    
    if (metrics.latency === 0) return { status: 'unknown', color: 'text-gray-400' };
    if (metrics.latency > 500) return { status: 'poor', color: 'text-red-400' };
    if (metrics.latency > 200) return { status: 'fair', color: 'text-yellow-400' };
    if (metrics.latency > 100) return { status: 'good', color: 'text-blue-400' };
    return { status: 'excellent', color: 'text-green-400' };
  };

  const bandwidthStatus = getBandwidthStatus();
  const latencyStatus = getLatencyStatus();

  return (
    <div className={`quality-adaptation ${className}`}>
      {/* Quality Indicator */}
      <div className="fixed top-4 left-4 z-20">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-lg transition-colors flex items-center gap-2 ${
            isAdaptive 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {isAdaptive ? <Zap className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {qualityOptions.find(q => q.value === currentQuality)?.label || 'Auto'}
          </span>
        </button>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 mt-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 w-96"
            >
              <div className="p-4">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Video Quality Settings
                </h3>

                {/* Current Status */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {bandwidthStatus.icon}
                      <span className="text-xs text-gray-400">Bandwidth</span>
                    </div>
                    <div className={`text-sm font-medium ${bandwidthStatus.color}`}>
                      {metrics ? `${metrics.bandwidth.toFixed(1)} Mbps` : 'Unknown'}
                    </div>
                    <div className={`text-xs ${bandwidthStatus.color} capitalize`}>
                      {bandwidthStatus.status}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-gray-400">Latency</span>
                    </div>
                    <div className={`text-sm font-medium ${latencyStatus.color}`}>
                      {metrics ? `${metrics.latency} ms` : 'Unknown'}
                    </div>
                    <div className={`text-xs ${latencyStatus.color} capitalize`}>
                      {latencyStatus.status}
                    </div>
                  </div>
                </div>

                {/* Quality Options */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">Video Quality</label>
                    <div className="flex items-center gap-1">
                      {isAdaptive && (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>Adaptive</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {qualityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleQualityChange(option.value)}
                        className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                          currentQuality === option.value
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {option.icon}
                          <div className="text-left">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs opacity-75">
                              {option.resolution.width}×{option.resolution.height} 
                              {' '}
                              {option.bitrate} kbps
                              {' '}
                              {option.frameRate} fps
                            </div>
                          </div>
                        </div>
                        {option.recommended && (
                          <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            Recommended
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                {metrics && (
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-400 mb-2">Performance Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Resolution:</span>
                        <span className="text-white">
                          {metrics.resolution.width}×{metrics.resolution.height}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Frame Rate:</span>
                        <span className="text-white">{metrics.frameRate} fps</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Bitrate:</span>
                        <span className="text-white">{metrics.bitrate} kbps</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Packet Loss:</span>
                        <span className={`${metrics.packetLoss > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {metrics.packetLoss}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bandwidth Trend */}
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-2">Network Trend</h4>
                  <div className="flex items-center gap-2">
                    {bandwidthTrend === 'improving' && (
                      <div className="flex items-center gap-1 text-green-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Improving</span>
                      </div>
                    )}
                    {bandwidthTrend === 'declining' && (
                      <div className="flex items-center gap-1 text-red-400">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm">Declining</span>
                      </div>
                    )}
                    {bandwidthTrend === 'stable' && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">Stable</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Changes */}
                {qualityHistory.length > 0 && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Recent Changes</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {qualityHistory.slice(-5).reverse().map((change, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">
                            {qualityOptions.find(q => q.value === change.quality)?.label}
                          </span>
                          <span className="text-gray-500">
                            {new Date(change.time).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Force Resync */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => syncManager.forceResync()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Force Resync
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Network Warning */}
      {metrics && (metrics.bandwidth < 1 || metrics.latency > 500) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 max-w-xs"
        >
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">
              {metrics.bandwidth < 1 ? 'Low bandwidth detected' : 'High latency detected'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Video quality automatically adjusted for optimal performance.
          </p>
        </motion.div>
      )}
    </div>
  );
}
