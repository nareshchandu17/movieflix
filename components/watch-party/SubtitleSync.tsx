"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Subtitles, 
  Settings, 
  Globe, 
  Volume2, 
  Clock,
  Check,
  X,
  Download,
  Upload
} from "lucide-react";
import VideoSyncManager, { type SubtitleTrack } from "@/lib/videoSync";

interface SubtitleSyncProps {
  videoElement: HTMLVideoElement | null;
  currentTime: number;
  isPlaying: boolean;
  availableTracks: SubtitleTrack[];
  currentTrack: string | null;
  onTrackChange: (trackId: string | null) => void;
  onSyncOffset: (offset: number) => void;
  syncManager: VideoSyncManager;
  className?: string;
}

export default function SubtitleSync({
  videoElement,
  currentTime,
  isPlaying,
  availableTracks,
  currentTrack,
  onTrackChange,
  onSyncOffset,
  syncManager,
  className = ""
}: SubtitleSyncProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [subtitlePosition, setSubtitlePosition] = useState<'bottom' | 'center'>('bottom');
  const [backgroundColor, setBackgroundColor] = useState('rgba(0, 0, 0, 0.8)');
  const [textColor, setTextColor] = useState('white');
  const [activeCues, setActiveCues] = useState<Array<{ start: number; end: number; text: string }>>([]);
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'out-of-sync'>('synced');
  
  const subtitleContainerRef = useRef<HTMLDivElement>(null);

  // Update active cues based on current time
  useEffect(() => {
    if (!currentTrack || !availableTracks.length) {
      setActiveCues([]);
      return;
    }

    const track = availableTracks.find(t => t.id === currentTrack);
    if (!track) {
      setActiveCues([]);
      return;
    }

    const cues = track.cues.filter(
      cue => currentTime >= cue.start + syncOffset && currentTime <= cue.end + syncOffset
    );

    setActiveCues(cues);

    // Sync with manager
    syncManager.syncSubtitles(track, currentTime + syncOffset);
  }, [currentTime, currentTrack, availableTracks, syncOffset, syncManager]);

  // Monitor sync status
  useEffect(() => {
    const unsubscribe = syncManager.onSubtitleSync((cues) => {
      setSyncStatus('synced');
      setShowSyncIndicator(true);
      setTimeout(() => setShowSyncIndicator(false), 2000);
    });

    return unsubscribe;
  }, [syncManager]);

  // Handle subtitle file upload
  const handleSubtitleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsedTrack = parseSubtitleFile(content, file.name);
      if (parsedTrack) {
        // This would add the track to available tracks
        console.log('Subtitle track uploaded:', parsedTrack);
      }
    };
    reader.readAsText(file);
  };

  // Parse subtitle file (SRT format)
  const parseSubtitleFile = (content: string, fileName: string): SubtitleTrack | null => {
    try {
      const lines = content.split('\n');
      const cues: Array<{ start: number; end: number; text: string }> = [];
      
      let i = 0;
      while (i < lines.length) {
        // Skip empty lines
        if (!lines[i].trim()) {
          i++;
          continue;
        }

        // Parse subtitle number
        const index = parseInt(lines[i]);
        if (isNaN(index)) {
          i++;
          continue;
        }
        i++;

        // Parse timestamp
        if (i >= lines.length) break;
        const timestamp = lines[i];
        const timeMatch = timestamp.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        
        if (!timeMatch) {
          i++;
          continue;
        }

        const startTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
        const endTime = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
        i++;

        // Parse subtitle text
        let text = '';
        while (i < lines.length && lines[i].trim()) {
          text += lines[i] + '\n';
          i++;
        }

        cues.push({
          start: startTime,
          end: endTime,
          text: text.trim()
        });
      }

      return {
        id: `custom-${Date.now()}`,
        language: 'custom',
        label: fileName.replace(/\.[^/.]+$/, ''),
        cues
      };
    } catch (error) {
      console.error('Error parsing subtitle file:', error);
      return null;
    }
  };

  // Adjust sync offset
  const adjustSyncOffset = (adjustment: number) => {
    const newOffset = syncOffset + adjustment;
    setSyncOffset(newOffset);
    onSyncOffset(newOffset);
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('synced'), 1000);
  };

  return (
    <div className={`subtitle-sync ${className}`}>
      {/* Subtitle Display */}
      <div
        ref={subtitleContainerRef}
        className="relative w-full pointer-events-none"
        style={{
          position: 'absolute',
          bottom: subtitlePosition === 'bottom' ? '80px' : '50%',
          left: '50%',
          transform: subtitlePosition === 'bottom' ? 'translateX(-50%)' : 'translate(-50%, -50%)',
          zIndex: 10
        }}
      >
        <AnimatePresence mode="wait">
          {activeCues.map((cue, index) => (
            <motion.div
              key={`${cue.start}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div
                className="inline-block px-4 py-2 rounded-lg max-w-[80%]"
                style={{
                  backgroundColor,
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.4,
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {cue.text.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex}>{line}</div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sync Status Indicator */}
      <AnimatePresence>
        {showSyncIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              syncStatus === 'synced' ? 'bg-green-500/20 text-green-400' :
              syncStatus === 'syncing' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {syncStatus === 'synced' && <Check className="w-4 h-4" />}
              {syncStatus === 'syncing' && <Clock className="w-4 h-4 animate-spin" />}
              {syncStatus === 'out-of-sync' && <X className="w-4 h-4" />}
              <span>
                {syncStatus === 'synced' ? 'Subtitles Synced' :
                 syncStatus === 'syncing' ? 'Syncing...' :
                 'Out of Sync'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtitle Controls */}
      <div className="fixed bottom-4 left-4 z-20">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-lg transition-colors ${
            currentTrack 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          <Subtitles className="w-5 h-5" />
        </button>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute bottom-full left-0 mb-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 w-80"
            >
              <div className="p-4">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Subtitle Settings
                </h3>

                {/* Track Selection */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">Subtitle Track</label>
                  <select
                    value={currentTrack || ''}
                    onChange={(e) => onTrackChange(e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    <option value="">No Subtitles</option>
                    {availableTracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.label} ({track.language})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sync Offset */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Sync Offset: {syncOffset.toFixed(1)}s
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => adjustSyncOffset(-0.1)}
                      className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                    >
                      -0.1s
                    </button>
                    <button
                      onClick={() => adjustSyncOffset(-0.5)}
                      className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                    >
                      -0.5s
                    </button>
                    <button
                      onClick={() => setSyncOffset(0)}
                      className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => adjustSyncOffset(0.5)}
                      className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                    >
                      +0.5s
                    </button>
                    <button
                      onClick={() => adjustSyncOffset(0.1)}
                      className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                    >
                      +0.1s
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Position */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">Position</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSubtitlePosition('bottom')}
                      className={`flex-1 py-2 rounded text-sm ${
                        subtitlePosition === 'bottom'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Bottom
                    </button>
                    <button
                      onClick={() => setSubtitlePosition('center')}
                      className={`flex-1 py-2 rounded text-sm ${
                        subtitlePosition === 'center'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Center
                    </button>
                  </div>
                </div>

                {/* Colors */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">Appearance</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Background</label>
                      <select
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      >
                        <option value="rgba(0, 0, 0, 0.8)">Black</option>
                        <option value="rgba(0, 0, 0, 0.5)">Transparent</option>
                        <option value="rgba(255, 255, 255, 0.9)">White</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Text</label>
                      <select
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      >
                        <option value="white">White</option>
                        <option value="yellow">Yellow</option>
                        <option value="cyan">Cyan</option>
                        <option value="lime">Lime</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Upload Custom Subtitles */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                    <Upload className="w-3 h-3" />
                    Custom Subtitles
                  </label>
                  <input
                    type="file"
                    accept=".srt,.vtt"
                    onChange={handleSubtitleUpload}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>

                {/* Sync Status */}
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <span className="text-sm text-gray-400">Sync Status</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      syncStatus === 'synced' ? 'bg-green-400' :
                      syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                      'bg-red-400'
                    }`} />
                    <span className="text-xs text-white capitalize">{syncStatus.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
