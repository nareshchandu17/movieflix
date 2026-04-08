"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Gauge,
  Cpu,
  HardDrive,
  Monitor,
  Settings,
  RefreshCw,
  Info,
  BarChart3
} from "lucide-react";

interface PerformanceMetrics {
  // Network Metrics
  bandwidth: {
    current: number; // Mbps
    average: number; // Mbps
    trend: 'improving' | 'stable' | 'declining';
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  
  // Latency Metrics
  latency: {
    current: number; // ms
    average: number; // ms
    jitter: number; // ms
    packetLoss: number; // percentage
  };
  
  // Connection Metrics
  connection: {
    type: string; // 'wifi', 'cellular', 'ethernet'
    effectiveType: string; // '4g', '3g', '2g', 'slow-2g'
    downlink: number; // Mbps
    rtt: number; // ms
    saveData: boolean;
  };
  
  // System Metrics
  system: {
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    batteryLevel?: number; // percentage
    thermalState?: 'nominal' | 'fair' | 'serious' | 'critical';
  };
  
  // Video Metrics
  video: {
    resolution: { width: number; height: number };
    frameRate: number;
    bitrate: number; // kbps
    droppedFrames: number;
    totalFrames: number;
    quality: 'auto' | 'low' | 'medium' | 'high';
  };
}

interface PerformanceOptimizationProps {
  onOptimizationChange: (settings: OptimizationSettings) => void;
  onQualityChange: (quality: string) => void;
  className?: string;
}

interface OptimizationSettings {
  autoQuality: boolean;
  adaptiveBitrate: boolean;
  bandwidthLimit: number; // Mbps
  maxResolution: string;
  maxFrameRate: number;
  enableHardwareAcceleration: boolean;
  reduceLatency: boolean;
  optimizeForMobile: boolean;
}

export default function PerformanceOptimization({
  onOptimizationChange,
  onQualityChange,
  className = ""
}: PerformanceOptimizationProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [settings, setSettings] = useState<OptimizationSettings>({
    autoQuality: true,
    adaptiveBitrate: true,
    bandwidthLimit: 0, // 0 = unlimited
    maxResolution: '1080p',
    maxFrameRate: 30,
    enableHardwareAcceleration: true,
    reduceLatency: true,
    optimizeForMobile: true
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  
  const metricsInterval = useRef<NodeJS.Timeout>();
  const networkMonitorInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    startPerformanceMonitoring();
    return () => {
      if (metricsInterval.current) clearInterval(metricsInterval.current);
      if (networkMonitorInterval.current) clearInterval(networkMonitorInterval.current);
    };
  }, []);

  const startPerformanceMonitoring = () => {
    // Initial metrics collection
    collectMetrics();
    
    // Regular metrics collection
    metricsInterval.current = setInterval(collectMetrics, 2000);
    
    // Network monitoring
    networkMonitorInterval.current = setInterval(monitorNetwork, 5000);
  };

  const collectMetrics = useCallback(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) return;

    const newMetrics: PerformanceMetrics = {
      bandwidth: {
        current: connection.downlink || 0,
        average: calculateBandwidthAverage(),
        trend: calculateBandwidthTrend(),
        quality: getBandwidthQuality(connection.downlink || 0)
      },
      latency: {
        current: connection.rtt || 0,
        average: calculateLatencyAverage(),
        jitter: calculateJitter(),
        packetLoss: calculatePacketLoss()
      },
      connection: {
        type: getConnectionType(connection),
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      },
      system: {
        cpuUsage: estimateCPUUsage(),
        memoryUsage: estimateMemoryUsage(),
        batteryLevel: getBatteryLevel(),
        thermalState: getThermalState()
      },
      video: {
        resolution: settings.maxResolution === '4k' ? { width: 3840, height: 2160 } :
                   settings.maxResolution === '1080p' ? { width: 1920, height: 1080 } :
                   settings.maxResolution === '720p' ? { width: 1280, height: 720 } :
                   { width: 854, height: 480 },
        frameRate: settings.maxFrameRate,
        bitrate: calculateOptimalBitrate(),
        droppedFrames: getDroppedFrames(),
        totalFrames: getTotalFrames(),
        quality: settings.autoQuality ? 'auto' : 
                settings.maxResolution === '4k' ? 'high' :
                settings.maxResolution === '1080p' ? 'high' :
                settings.maxResolution === '720p' ? 'medium' : 'low'
      }
    };

    setMetrics(newMetrics);
    applyAutomaticOptimizations(newMetrics);
  }, [settings]);

  const monitorNetwork = () => {
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', collectMetrics);
    }
  };

  const calculateBandwidthAverage = (): number => {
    // Simulate bandwidth averaging over time
    return metrics?.bandwidth.average || 5.0;
  };

  const calculateBandwidthTrend = (): 'improving' | 'stable' | 'declining' => {
    // Simulate trend calculation
    const random = Math.random();
    if (random > 0.7) return 'improving';
    if (random < 0.3) return 'declining';
    return 'stable';
  };

  const getBandwidthQuality = (bandwidth: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (bandwidth >= 10) return 'excellent';
    if (bandwidth >= 5) return 'good';
    if (bandwidth >= 2) return 'fair';
    return 'poor';
  };

  const calculateLatencyAverage = (): number => {
    return metrics?.latency.average || 50;
  };

  const calculateJitter = (): number => {
    return Math.random() * 10; // Simulate jitter
  };

  const calculatePacketLoss = (): number => {
    return Math.random() * 2; // Simulate packet loss percentage
  };

  const getConnectionType = (connection: any): string => {
    if (connection.type) return connection.type;
    return 'unknown';
  };

  const estimateCPUUsage = (): number => {
    // Simulate CPU usage estimation
    return Math.random() * 30 + 10; // 10-40%
  };

  const estimateMemoryUsage = (): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    }
    return Math.random() * 40 + 20; // 20-60%
  };

  const getBatteryLevel = (): number | undefined => {
    if ('getBattery' in navigator) {
      return undefined; // Would implement actual battery API
    }
    return undefined;
  };

  const getThermalState = (): 'nominal' | 'fair' | 'serious' | 'critical' | undefined => {
    return 'nominal'; // Would implement thermal monitoring
  };

  const calculateOptimalBitrate = (): number => {
    const bandwidth = metrics?.bandwidth.current || 5;
    const resolution = settings.maxResolution;
    
    let baseBitrate = 1000; // kbps
    
    if (resolution === '4k') baseBitrate = 8000;
    else if (resolution === '1080p') baseBitrate = 5000;
    else if (resolution === '720p') baseBitrate = 2500;
    
    return Math.min(baseBitrate, bandwidth * 800); // Cap at 80% of available bandwidth
  };

  const getDroppedFrames = (): number => {
    return Math.floor(Math.random() * 5); // Simulate dropped frames
  };

  const getTotalFrames = (): number => {
    return 1800; // Simulate 60 seconds at 30fps
  };

  const applyAutomaticOptimizations = (currentMetrics: PerformanceMetrics) => {
    if (!settings.autoQuality) return;

    const { bandwidth, latency } = currentMetrics;
    
    // Auto-adjust quality based on bandwidth
    if (bandwidth.current < 2) {
      onQualityChange('low');
    } else if (bandwidth.current < 5) {
      onQualityChange('medium');
    } else if (bandwidth.current < 10) {
      onQualityChange('high');
    } else {
      onQualityChange('auto');
    }

    // Adjust for high latency
    if (latency.current > 200 && settings.reduceLatency) {
      // Would apply latency reduction techniques
      console.log('Applying latency reduction techniques');
    }
  };

  const runPerformanceTest = async () => {
    setIsOptimizing(true);
    try {
      // Simulate performance test
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const results = {
        downloadSpeed: Math.random() * 50 + 10, // Mbps
        uploadSpeed: Math.random() * 20 + 5, // Mbps
        latency: Math.random() * 100 + 20, // ms
        jitter: Math.random() * 10, // ms
        packetLoss: Math.random() * 2, // %
        score: Math.floor(Math.random() * 40 + 60) // 60-100
      };
      
      setTestResults(results);
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSettingChange = (key: keyof OptimizationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onOptimizationChange(newSettings);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className={`performance-optimization bg-gray-900 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gauge className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Performance Optimization</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={runPerformanceTest}
              disabled={isOptimizing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isOptimizing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              {isOptimizing ? 'Testing...' : 'Run Test'}
            </button>
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Bandwidth */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Bandwidth
                </h3>
                {getTrendIcon(metrics.bandwidth.trend)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current:</span>
                  <span className="text-white">{metrics.bandwidth.current.toFixed(1)} Mbps</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Average:</span>
                  <span className="text-white">{metrics.bandwidth.average.toFixed(1)} Mbps</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Quality:</span>
                  <span className={getQualityColor(metrics.bandwidth.quality)}>
                    {metrics.bandwidth.quality.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Latency */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Latency
                </h3>
                <div className={`w-3 h-3 rounded-full ${
                  metrics.latency.current < 50 ? 'bg-green-400' :
                  metrics.latency.current < 100 ? 'bg-yellow-400' :
                  'bg-red-400'
                }`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current:</span>
                  <span className="text-white">{metrics.latency.current} ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Average:</span>
                  <span className="text-white">{metrics.latency.average} ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Jitter:</span>
                  <span className="text-white">{metrics.latency.jitter.toFixed(1)} ms</span>
                </div>
              </div>
            </div>

            {/* System */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  System
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">CPU:</span>
                  <span className={`${
                    metrics.system.cpuUsage < 50 ? 'text-green-400' :
                    metrics.system.cpuUsage < 80 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {metrics.system.cpuUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Memory:</span>
                  <span className={`${
                    metrics.system.memoryUsage < 50 ? 'text-green-400' :
                    metrics.system.memoryUsage < 80 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {metrics.system.memoryUsage.toFixed(1)}%
                  </span>
                </div>
                {metrics.system.batteryLevel !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Battery:</span>
                    <span className={`${
                      metrics.system.batteryLevel > 50 ? 'text-green-400' :
                      metrics.system.batteryLevel > 20 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {metrics.system.batteryLevel}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Video */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Video
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Resolution:</span>
                  <span className="text-white">
                    {metrics.video.resolution.width}×{metrics.video.resolution.height}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Frame Rate:</span>
                  <span className="text-white">{metrics.video.frameRate} fps</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bitrate:</span>
                  <span className="text-white">{metrics.video.bitrate} kbps</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Dropped:</span>
                  <span className={`${
                    metrics.video.droppedFrames === 0 ? 'text-green-400' :
                    metrics.video.droppedFrames < 5 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {metrics.video.droppedFrames} frames
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <AnimatePresence>
            {testResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-800 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Performance Test Results</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Score:</span>
                    <span className={`text-lg font-bold ${
                      testResults.score > 80 ? 'text-green-400' :
                      testResults.score > 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {testResults.score}/100
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Download:</span>
                    <span className="text-white">{testResults.downloadSpeed.toFixed(1)} Mbps</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Upload:</span>
                    <span className="text-white">{testResults.uploadSpeed.toFixed(1)} Mbps</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Latency:</span>
                    <span className="text-white">{testResults.latency.toFixed(0)} ms</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Packet Loss:</span>
                    <span className="text-white">{testResults.packetLoss.toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      

      {/* Advanced Settings */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-800 overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-white font-medium mb-4">Advanced Optimization Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-white text-sm">Auto Quality</label>
                    <button
                      onClick={() => handleSettingChange('autoQuality', !settings.autoQuality)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoQuality ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoQuality ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-white text-sm">Adaptive Bitrate</label>
                    <button
                      onClick={() => handleSettingChange('adaptiveBitrate', !settings.adaptiveBitrate)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.adaptiveBitrate ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.adaptiveBitrate ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-white text-sm">Hardware Acceleration</label>
                    <button
                      onClick={() => handleSettingChange('enableHardwareAcceleration', !settings.enableHardwareAcceleration)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.enableHardwareAcceleration ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.enableHardwareAcceleration ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-white text-sm">Reduce Latency</label>
                    <button
                      onClick={() => handleSettingChange('reduceLatency', !settings.reduceLatency)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.reduceLatency ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.reduceLatency ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm block mb-2">Max Resolution</label>
                    <select
                      value={settings.maxResolution}
                      onChange={(e) => handleSettingChange('maxResolution', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="4k">4K (2160p)</option>
                      <option value="1080p">Full HD (1080p)</option>
                      <option value="720p">HD (720p)</option>
                      <option value="480p">SD (480p)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white text-sm block mb-2">Max Frame Rate</label>
                    <select
                      value={settings.maxFrameRate}
                      onChange={(e) => handleSettingChange('maxFrameRate', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value={60}>60 fps</option>
                      <option value={30}>30 fps</option>
                      <option value={24}>24 fps</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-white text-sm block mb-2">Bandwidth Limit (Mbps)</label>
                    <input
                      type="number"
                      value={settings.bandwidthLimit}
                      onChange={(e) => handleSettingChange('bandwidthLimit', parseFloat(e.target.value))}
                      placeholder="0 = unlimited"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-white text-sm">Optimize for Mobile</label>
                    <button
                      onClick={() => handleSettingChange('optimizeForMobile', !settings.optimizeForMobile)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.optimizeForMobile ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.optimizeForMobile ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
