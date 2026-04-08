"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Gauge,
  Monitor,
  Smartphone
} from "lucide-react";

interface PerformanceMetrics {
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  bandwidthUsage: {
    total: number;
    video: number;
    audio: number;
    unit: 'MB' | 'GB';
  };
  latency: number;
  packetLoss: number;
  frameRate: number;
  resolution: { width: number; height: number };
  deviceType: 'mobile' | 'tablet' | 'desktop';
  batteryLevel?: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onOptimizationToggle?: (enabled: boolean) => void;
  className?: string;
}

export default function PerformanceMonitor({ 
  isVisible = false, 
  onOptimizationToggle,
  className = "" 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    connectionQuality: 'good',
    bandwidthUsage: { total: 0, video: 0, audio: 0, unit: 'MB' },
    latency: 0,
    packetLoss: 0,
    frameRate: 30,
    resolution: { width: 1280, height: 720 },
    deviceType: 'desktop'
  });

  const [isOptimized, setIsOptimized] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Detect device type
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      
      if (width <= 768) {
        deviceType = 'mobile';
      } else if (width <= 1024) {
        deviceType = 'tablet';
      }

      setMetrics(prev => ({ ...prev, deviceType }));
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Monitor connection quality
  useEffect(() => {
    const monitorConnection = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        const effectiveType = connection.effectiveType;
        let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';

        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            quality = 'poor';
            break;
          case '3g':
            quality = 'fair';
            break;
          case '4g':
            quality = 'good';
            break;
          default:
            quality = 'excellent';
        }

        setMetrics(prev => ({ ...prev, connectionQuality: quality }));
      }
    };

    monitorConnection();
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', monitorConnection);
      return () => connection.removeEventListener('change', monitorConnection);
    }
  }, []);

  // Monitor battery level
  useEffect(() => {
    const monitorBattery = async () => {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        setMetrics(prev => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100)
        }));

        battery.addEventListener('levelchange', () => {
          setMetrics(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100)
          }));
        });
      }
    };

    monitorBattery();
  }, []);

  // Simulate bandwidth usage tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const increment = isOptimized ? 0.1 : 0.5; // Lower usage when optimized
        const newTotal = prev.bandwidthUsage.total + increment;
        
        return {
          ...prev,
          bandwidthUsage: {
            total: newTotal,
            video: newTotal * 0.8,
            audio: newTotal * 0.2,
            unit: newTotal > 1024 ? 'GB' : 'MB'
          }
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isOptimized]);

  const toggleOptimization = useCallback(() => {
    const newOptimized = !isOptimized;
    setIsOptimized(newOptimized);
    onOptimizationToggle?.(newOptimized);
  }, [isOptimized, onOptimizationToggle]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'fair':
        return <AlertTriangle className="w-4 h-4" />;
      case 'poor':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatBandwidth = (value: number, unit: string) => {
    if (unit === 'GB') {
      return `${(value / 1024).toFixed(2)} GB`;
    }
    return `${value.toFixed(1)} MB`;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`performance-monitor bg-black/80 backdrop-blur rounded-lg p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">Performance</span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Connection Quality */}
        <div className="flex items-center gap-2">
          {metrics.connectionQuality === 'excellent' || metrics.connectionQuality === 'good' ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <div>
            <div className={`text-xs capitalize ${getQualityColor(metrics.connectionQuality)}`}>
              {metrics.connectionQuality}
            </div>
            <div className="text-xs text-gray-400">Connection</div>
          </div>
        </div>

        {/* Bandwidth Usage */}
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-xs text-white">
              {formatBandwidth(metrics.bandwidthUsage.total, metrics.bandwidthUsage.unit)}
            </div>
            <div className="text-xs text-gray-400">Used</div>
          </div>
        </div>

        {/* Device Type */}
        <div className="flex items-center gap-2">
          {metrics.deviceType === 'mobile' ? (
            <Smartphone className="w-4 h-4 text-purple-400" />
          ) : metrics.deviceType === 'tablet' ? (
            <Monitor className="w-4 h-4 text-orange-400" />
          ) : (
            <Monitor className="w-4 h-4 text-gray-400" />
          )}
          <div>
            <div className="text-xs text-white capitalize">{metrics.deviceType}</div>
            <div className="text-xs text-gray-400">Device</div>
          </div>
        </div>

        {/* Battery Level */}
        {metrics.batteryLevel !== undefined && (
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${
              metrics.batteryLevel > 50 ? 'bg-green-400' : 
              metrics.batteryLevel > 20 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <div>
              <div className="text-xs text-white">{metrics.batteryLevel}%</div>
              <div className="text-xs text-gray-400">Battery</div>
            </div>
          </div>
        )}
      </div>

      {/* Optimization Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
        <div>
          <div className="text-sm text-white font-medium">Bandwidth Optimization</div>
          <div className="text-xs text-gray-400">
            {isOptimized ? 'Reduced quality for better performance' : 'Maximum quality'}
          </div>
        </div>
        <button
          onClick={toggleOptimization}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isOptimized 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
          }`}
        >
          {isOptimized ? 'Optimized' : 'Standard'}
        </button>
      </div>

      {/* Detailed Metrics */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Video Metrics */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Video</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Resolution:</span>
                    <span className="text-white">
                      {metrics.resolution.width}×{metrics.resolution.height}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Frame Rate:</span>
                    <span className="text-white">{metrics.frameRate} fps</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Video Bandwidth:</span>
                    <span className="text-white">
                      {formatBandwidth(metrics.bandwidthUsage.video, metrics.bandwidthUsage.unit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Network Metrics */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Network</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Latency:</span>
                    <span className="text-white">{metrics.latency} ms</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Packet Loss:</span>
                    <span className="text-white">{metrics.packetLoss}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Audio Bandwidth:</span>
                    <span className="text-white">
                      {formatBandwidth(metrics.bandwidthUsage.audio, metrics.bandwidthUsage.unit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
