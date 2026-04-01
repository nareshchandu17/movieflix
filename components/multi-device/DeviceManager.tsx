"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Tv, 
  Laptop, 
  Wifi, 
  WifiOff, 
  MoreHorizontal, 
  LogOut,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchHistory } from '@/contexts/WatchHistoryContext';

interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'web' | 'tv' | 'desktop';
  isOnline: boolean;
  lastActiveAt: string;
  createdAt: string;
  lastSeenAt: string;
  isActive: boolean;
  isCurrentDevice: boolean;
  capabilities: {
    supports4K: boolean;
    supportsHDR: boolean;
    maxBitrate: string;
  };
  preferences: {
    autoplay: boolean;
    subtitles: boolean;
    language: string;
    quality: string;
  };
}

interface DeviceManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeviceManager({ isOpen, onClose }: DeviceManagerProps) {
  const router = useRouter();
  const { refreshHistory } = useWatchHistory();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  // Mock user ID for demo purposes since auth is removed
  const mockUserId = 'demo-user';
  const mockToken = 'demo-token';

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/devices', {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
      } else {
        console.error('Failed to fetch devices:', data.error);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateDevice = async (deviceId: string) => {
    try {
      setDeactivating(deviceId);
      
      const response = await fetch(`/api/v1/devices?deviceId=${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove device from list
        setDevices(prev => prev.filter(device => device.deviceId !== deviceId));
        
        // If current device is deactivated, just refresh the page
        const currentDevice = devices.find(device => device.deviceId === deviceId);
        if (currentDevice?.isCurrentDevice) {
          // This will trigger a page refresh
          window.location.reload();
        }
      } else {
        console.error('Failed to deactivate device:', data.error);
      }
    } catch (error) {
      console.error('Error deactivating device:', error);
    } finally {
      setDeactivating(null);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'tv':
        return <Tv className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  const getDeviceTypeLabel = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return 'Mobile';
      case 'tablet': return 'Tablet';
      case 'tv': return 'TV';
      case 'desktop': return 'Desktop';
      default: return 'Web';
    }
  };

  const formatLastActive = (lastActiveAt: string) => {
    const date = new Date(lastActiveAt);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const getQualityBadge = (maxBitrate: string) => {
    switch (maxBitrate) {
      case '4k':
        return <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full">4K</span>;
      case '1080p':
        return <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">1080p</span>;
      case '720p':
        return <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">720p</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded-full">Auto</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-white">Device Management</h2>
              <p className="text-sm text-gray-400 mt-1">
                Manage your connected devices and streaming preferences
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>

          {/* Device List */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
                        <div className="space-y-1">
                          <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
                          <div className="w-16 h-3 bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No devices connected</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start watching on any device to see it here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div
                    key={device.deviceId}
                    className={`bg-gray-800 rounded-lg p-4 border ${
                      device.isCurrentDevice 
                        ? 'border-blue-500' 
                        : device.isOnline 
                          ? 'border-green-500' 
                          : 'border-gray-600'
                    } transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Device Icon */}
                        <div className={`p-2 rounded-lg ${
                          device.isOnline 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {getDeviceIcon(device.deviceType)}
                        </div>

                        {/* Device Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-white">
                              {device.deviceName}
                            </h3>
                            {device.isCurrentDevice && (
                              <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-400">
                            <span>{getDeviceTypeLabel(device.deviceType)}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              {device.isOnline ? (
                                <>
                                  <Wifi className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400">Online</span>
                                </>
                              ) : (
                                <>
                                  <WifiOff className="w-3 h-3 text-gray-500" />
                                  <span className="text-gray-500">Offline</span>
                                </>
                              )}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatLastActive(device.lastActiveAt)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {/* Quality Badge */}
                        {getQualityBadge(device.capabilities.maxBitrate)}
                        
                        {/* Capabilities */}
                        <div className="flex items-center space-x-1">
                          {device.capabilities.supports4K && (
                            <span className="w-2 h-2 bg-purple-500 rounded-full" title="4K Support" />
                          )}
                          {device.capabilities.supportsHDR && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full" title="HDR Support" />
                          )}
                        </div>

                        {/* Deactivate Button */}
                        {!device.isCurrentDevice && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivateDevice(device.deviceId)}
                            disabled={deactivating === device.deviceId}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            {deactivating === device.deviceId ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent animate-spin" />
                              ) : (
                                <LogOut className="w-4 h-4" />
                              )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Autoplay:</span>
                          <span className={device.preferences.autoplay ? 'text-green-400' : 'text-gray-500'}>
                            {device.preferences.autoplay ? 'On' : 'Off'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Subtitles:</span>
                          <span className={device.preferences.subtitles ? 'text-green-400' : 'text-gray-500'}>
                            {device.preferences.subtitles ? 'On' : 'Off'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Quality:</span>
                          <span className="text-gray-500">
                            {device.preferences.quality}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Language:</span>
                          <span className="text-gray-500">
                            {device.preferences.language}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-400">
                {devices.length} devices connected
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Real-time sync enabled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400">Auto-sync active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
