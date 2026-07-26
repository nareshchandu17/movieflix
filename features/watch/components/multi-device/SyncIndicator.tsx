"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Users, CheckCircle, AlertTriangle } from 'lucide-react';

interface SyncIndicatorProps {
  profileId: string;
  contentId?: string;
  className?: string;
}

interface ConnectedDevice {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  isOnline: boolean;
  lastActiveAt: string;
}

interface SyncStatus {
  isOnline: boolean;
  connectedDevices: number;
  lastSync: number;
  isSyncing: boolean;
  hasConflict: boolean;
}

export default function SyncIndicator({ profileId, contentId, className }: SyncIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    connectedDevices: 0,
    lastSync: 0,
    isSyncing: false,
    hasConflict: false
  });

  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);

  useEffect(() => {
    if (!profileId) return;

    // Simulate WebSocket connection status
    const checkConnectionStatus = () => {
      // In a real implementation, this would check WebSocket connection
      const wsConnected = Math.random() > 0.1; // 90% chance of being connected
      
      setSyncStatus(prev => ({
        ...prev,
        isOnline: wsConnected,
        lastSync: wsConnected ? Date.now() : prev.lastSync
      }));

      if (wsConnected) {
        // Simulate connected devices
        const mockDevices: ConnectedDevice[] = [
          {
            deviceId: 'device-1',
            deviceName: 'iPhone 13 Pro',
            deviceType: 'mobile',
            isOnline: true,
            lastActiveAt: new Date().toISOString()
          },
          {
            deviceId: 'device-2',
            deviceName: 'MacBook Pro',
            deviceType: 'desktop',
            isOnline: Math.random() > 0.3,
            lastActiveAt: new Date(Date.now() - Math.random() * 3600000).toISOString()
          },
          {
            deviceId: 'device-3',
            deviceName: 'Samsung TV',
            deviceType: 'tv',
            isOnline: Math.random() > 0.5,
            lastActiveAt: new Date(Date.now() - Math.random() * 7200000).toISOString()
          }
        ];
        
        setConnectedDevices(mockDevices.filter(d => d.isOnline));
        setSyncStatus(prev => ({
          ...prev,
          connectedDevices: mockDevices.filter(d => d.isOnline).length
        }));
      } else {
        setConnectedDevices([]);
        setSyncStatus(prev => ({
          ...prev,
          connectedDevices: 0
        }));
      }
    };

    // Check connection status every 5 seconds
    const interval = setInterval(checkConnectionStatus, 5000);
    checkConnectionStatus();

    return () => clearInterval(interval);
  }, [profileId]);

  // Simulate sync events
  useEffect(() => {
    if (!syncStatus.isOnline || !contentId) return;

    const simulateSync = () => {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      
      setTimeout(() => {
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          lastSync: Date.now()
        }));
      }, 1000);
    };

    const syncInterval = setInterval(simulateSync, 10000);
    simulateSync();

    return () => clearInterval(syncInterval);
  }, [syncStatus.isOnline, contentId]);

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 1000) {
      return 'Just now';
    } else if (diff < 60000) {
      return `${Math.floor(diff / 1000)}s ago`;
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else {
      return `${Math.floor(diff / 3600000)}h ago`;
    }
  };

  const getSyncIcon = () => {
    if (syncStatus.isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-yellow-400" />;
    } else if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-400" />;
    } else if (syncStatus.hasConflict) {
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getSyncMessage = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing...';
    } else if (!syncStatus.isOnline) {
      return 'Offline';
    } else if (syncStatus.hasConflict) {
      return 'Conflict detected';
    } else if (syncStatus.connectedDevices > 1) {
      return `${syncStatus.connectedDevices} devices connected`;
    } else {
      return 'Synced';
    }
  };

  const getSyncColor = () => {
    if (syncStatus.isSyncing) {
      return 'text-yellow-400';
    } else if (!syncStatus.isOnline) {
      return 'text-red-400';
    } else if (syncStatus.hasConflict) {
      return 'text-orange-400';
    } else {
      return 'text-green-400';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`flex items-center space-x-2 ${className || ''}`}
      >
        {/* Sync Status Icon */}
        <div className={`flex items-center ${getSyncColor()}`}>
          {getSyncIcon()}
        </div>

        {/* Sync Status Message */}
        <div className={`text-xs font-medium ${getSyncColor()}`}>
          {getSyncMessage()}
        </div>

        {/* Connected Devices Indicator */}
        {syncStatus.isOnline && syncStatus.connectedDevices > 1 && (
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400">
              {syncStatus.connectedDevices}
            </span>
          </div>
        )}

        {/* Last Sync Time */}
        {syncStatus.isOnline && syncStatus.lastSync > 0 && (
          <div className="text-xs text-gray-400">
            {formatTimeAgo(syncStatus.lastSync)}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
