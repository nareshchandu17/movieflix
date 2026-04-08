"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Clock, 
  Film, 
  AlertTriangle,
  Check,
  X,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface ParentalControlsProps {
  onClose: () => void;
  onSave: (settings: ParentalSettings) => void;
}

interface ParentalSettings {
  enabled: boolean;
  maturityRating: 'ALL' | 'PG' | 'PG-13' | 'R' | 'TV-MA';
  pin?: string;
  blockViolentContent: boolean;
  blockSexualContent: boolean;
  blockSubstanceUse: boolean;
  maxWatchTime: number; // minutes per day
  allowedTimeSlots: {
    start: string;
    end: string;
  }[];
}

const RATING_DESCRIPTIONS = {
  'ALL': { label: 'All Content', description: 'No restrictions', color: 'green' },
  'G': { label: 'G - General', description: 'All ages', color: 'blue' },
  'PG': { label: 'PG - Parental Guidance', description: 'Some material may not be suitable for children', color: 'yellow' },
  'PG-13': { label: 'PG-13', description: 'Some material may be inappropriate for children under 13', color: 'orange' },
  'R': { label: 'R - Restricted', description: 'Under 17 requires accompanying parent or adult guardian', color: 'red' },
  'TV-MA': { label: 'TV-MA', description: 'Mature audience only', color: 'red' }
};

export default function ParentalControls({ onClose, onSave }: ParentalControlsProps) {
  const [settings, setSettings] = useState<ParentalSettings>({
    enabled: false,
    maturityRating: 'TV-MA',
    blockViolentContent: false,
    blockSexualContent: false,
    blockSubstanceUse: false,
    maxWatchTime: 240, // 4 hours default
    allowedTimeSlots: []
  });
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinChange, setShowPinChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await fetch('/api/profiles/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings({
          enabled: data.data.parentalControls?.enabled || false,
          maturityRating: data.data.parentalControls?.maturityRating || 'TV-MA',
          blockViolentContent: false,
          blockSexualContent: false,
          blockSubstanceUse: false,
          maxWatchTime: 240,
          allowedTimeSlots: []
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profiles/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'parentalControls',
          data: settings
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Parental controls updated successfully');
        onSave(settings);
        onClose();
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = async () => {
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    try {
      const response = await fetch('/api/profiles/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'parentalControls',
          data: {
            ...settings,
            pin: newPin,
            currentPin: currentPin
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('PIN updated successfully');
        setShowPinChange(false);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        toast.error(data.error || 'Failed to update PIN');
      }
    } catch (error) {
      toast.error('Failed to update PIN');
    }
  };

  const addTimeSlot = () => {
    setSettings(prev => ({
      ...prev,
      allowedTimeSlots: [...prev.allowedTimeSlots, { start: '09:00', end: '21:00' }]
    }));
  };

  const removeTimeSlot = (index: number) => {
    setSettings(prev => ({
      ...prev,
      allowedTimeSlots: prev.allowedTimeSlots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index: number, field: 'start' | 'end', value: string) => {
    setSettings(prev => ({
      ...prev,
      allowedTimeSlots: prev.allowedTimeSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Parental Controls</h2>
              <p className="text-sm text-gray-400">Manage content restrictions and viewing limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Enable Parental Controls</h3>
                <p className="text-sm text-gray-400">Restrict content based on age and preferences</p>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative w-14 h-8 rounded-full transition-colors duration-200 focus:outline-none ${
                settings.enabled ? 'bg-red-500' : 'bg-gray-600'
              }`}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ left: settings.enabled ? 7 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <AnimatePresence>
          {settings.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Maturity Rating */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-blue-400" />
                  Maturity Rating Limit
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(RATING_DESCRIPTIONS).map(([rating, info]) => (
                    <button
                      key={rating}
                      onClick={() => setSettings(prev => ({ ...prev, maturityRating: rating as any }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.maturityRating === rating
                          ? `border-${info.color}-500 bg-${info.color}-500/20`
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold text-white">{info.label}</div>
                        <div className="text-xs text-gray-400 mt-1">{info.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Filters */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-orange-400" />
                  Content Filters
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <div>
                        <span className="text-white font-medium">Block Violent Content</span>
                        <span className="text-xs text-gray-400 block">Action, Crime, Horror, War</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.blockViolentContent}
                      onChange={(e) => setSettings(prev => ({ ...prev, blockViolentContent: e.target.checked }))}
                      className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-pink-400" />
                      <div>
                        <span className="text-white font-medium">Block Sexual Content</span>
                        <span className="text-xs text-gray-400 block">Romance, certain Drama</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.blockSexualContent}
                      onChange={(e) => setSettings(prev => ({ ...prev, blockSexualContent: e.target.checked }))}
                      className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded" />
                      <div>
                        <span className="text-white font-medium">Block Substance Use</span>
                        <span className="text-xs text-gray-400 block">Drugs, Alcohol, Smoking</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.blockSubstanceUse}
                      onChange={(e) => setSettings(prev => ({ ...prev, blockSubstanceUse: e.target.checked }))}
                      className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Time Limits */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  Daily Time Limit
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum watch time per day (minutes)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="480"
                      value={settings.maxWatchTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxWatchTime: parseInt(e.target.value) || 240 }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="mt-1 text-xs text-gray-400">
                      Current: {Math.floor(settings.maxWatchTime / 60)}h {settings.maxWatchTime % 60}m
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-300">Allowed Time Slots</label>
                      <button
                        onClick={addTimeSlot}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add Slot
                      </button>
                    </div>
                    
                    {settings.allowedTimeSlots.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No time restrictions - 24/7 access</p>
                    ) : (
                      <div className="space-y-2">
                        {settings.allowedTimeSlots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                              className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                              className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                            />
                            <button
                              onClick={() => removeTimeSlot(index)}
                              className="ml-2 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PIN Management */}
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-yellow-400" />
                    PIN Management
                  </h3>
                  <button
                    onClick={() => setShowPinChange(!showPinChange)}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-3 h-3" />
                    Change PIN
                  </button>
                </div>

                <AnimatePresence>
                  {showPinChange && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Current PIN</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={currentPin}
                          onChange={(e) => setCurrentPin(e.target.value)}
                          placeholder="Enter current PIN"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New PIN</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="Enter 4-digit PIN"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New PIN</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                          placeholder="Confirm new PIN"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowPinChange(false);
                            setCurrentPin('');
                            setNewPin('');
                            setConfirmPin('');
                          }}
                          className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePinChange}
                          disabled={newPin !== confirmPin || newPin.length !== 4}
                          className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          Update PIN
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent border-r-transparent border-b-transparent animate-spin rounded-full"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
