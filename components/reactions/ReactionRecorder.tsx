"use client";

import React, { useState, useRef, useEffect, useCallback, useReducer } from "react";
import { X, Camera, Square, RefreshCcw, Check, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ReactionPreviewModal } from "./ReactionPreviewModal";

// Types and Interfaces
type RecordingState = 'idle' | 'initializing' | 'ready' | 'recording' | 'processing' | 'error';
type DevicePermissionState = 'prompt' | 'granted' | 'denied' | 'unknown';

interface MediaDevices {
  video: MediaDeviceInfo[];
  audio: MediaDeviceInfo[];
}

interface RecordingMetrics {
  startTime: number;
  duration: number;
  blobSize: number;
  resolution: { width: number; height: number };
}

interface ReactionRecorderProps {
  movieId: string;
  movieTitle: string;
  movieTimestamp: number;
  isOpen: boolean;
  onClose: () => void;
  maxRecordingDuration?: number;
  onRecordingComplete?: (blob: Blob, metrics: RecordingMetrics) => void;
  onError?: (error: Error) => void;
}

interface ComponentState {
  recordingState: RecordingState;
  recordingTime: number;
  recordedBlob: Blob | null;
  stream: MediaStream | null;
  showPreview: boolean;
  mimeType: string;
  devices: MediaDevices | null;
  permissionState: DevicePermissionState;
  error: Error | null;
  metrics: RecordingMetrics | null;
}

type ComponentAction = 
  | { type: 'SET_RECORDING_STATE'; payload: RecordingState }
  | { type: 'SET_RECORDING_TIME'; payload: number }
  | { type: 'SET_RECORDED_BLOB'; payload: Blob | null }
  | { type: 'SET_STREAM'; payload: MediaStream | null }
  | { type: 'SET_SHOW_PREVIEW'; payload: boolean }
  | { type: 'SET_MIME_TYPE'; payload: string }
  | { type: 'SET_DEVICES'; payload: MediaDevices | null }
  | { type: 'SET_PERMISSION_STATE'; payload: DevicePermissionState }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_METRICS'; payload: RecordingMetrics | null }
  | { type: 'RESET_RECORDING' };

const initialState: ComponentState = {
  recordingState: 'idle',
  recordingTime: 0,
  recordedBlob: null,
  stream: null,
  showPreview: false,
  mimeType: 'video/webm',
  devices: null,
  permissionState: 'unknown',
  error: null,
  metrics: null,
};

function reducer(state: ComponentState, action: ComponentAction): ComponentState {
  switch (action.type) {
    case 'SET_RECORDING_STATE':
      return { ...state, recordingState: action.payload };
    case 'SET_RECORDING_TIME':
      return { ...state, recordingTime: action.payload };
    case 'SET_RECORDED_BLOB':
      return { ...state, recordedBlob: action.payload };
    case 'SET_STREAM':
      return { ...state, stream: action.payload };
    case 'SET_SHOW_PREVIEW':
      return { ...state, showPreview: action.payload };
    case 'SET_MIME_TYPE':
      return { ...state, mimeType: action.payload };
    case 'SET_DEVICES':
      return { ...state, devices: action.payload };
    case 'SET_PERMISSION_STATE':
      return { ...state, permissionState: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'RESET_RECORDING':
      return {
        ...state,
        recordingState: 'idle',
        recordingTime: 0,
        recordedBlob: null,
        showPreview: false,
        error: null,
        metrics: null,
      };
    default:
      return state;
  }
}

// Constants
const DEFAULT_MAX_RECORDING_DURATION = 45;
const CHUNK_INTERVAL = 1000;
const CAMERA_TIMEOUT = 15000;
const VIDEO_LOADING_TIMEOUT = 10000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// MIME Type Detection
const getSupportedMimeType = (): string => {
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  
  throw new Error('No supported video MIME type found');
};

// Error Handling
const getErrorMessage = (error: Error): string => {
  switch (error.name) {
    case 'NotAllowedError':
      return 'Camera and microphone access denied. Please allow permissions in your browser and refresh the page.';
    case 'NotFoundError':
      return 'No camera or microphone found. Please connect a device and refresh.';
    case 'NotReadableError':
      return 'Camera is already in use by another application.';
    case 'OverconstrainedError':
      return 'Camera constraints not satisfied. Try closing other camera applications.';
    case 'TypeError':
      return 'Camera API not available. Please use a modern browser like Chrome, Firefox, or Edge.';
    default:
      return error.message || 'An unknown error occurred while accessing the camera.';
  }
};

export function ReactionRecorder({
  movieId,
  movieTitle,
  movieTimestamp,
  isOpen,
  onClose,
  maxRecordingDuration = DEFAULT_MAX_RECORDING_DURATION,
  onRecordingComplete,
  onError,
}: ReactionRecorderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [retryCount, setRetryCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamCleanupRef = useRef<(() => void) | null>(null);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

  // Cleanup resources
  const cleanupResources = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (streamCleanupRef.current) {
      streamCleanupRef.current();
      streamCleanupRef.current = null;
    }
    
    if (mediaRecorderRef.current && state.recordingState === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.warn('Error stopping MediaRecorder:', error);
      }
      mediaRecorderRef.current = null;
    }
    
    chunksRef.current = [];
  }, [state.recordingState]);

  // Device detection and enumeration
  const enumerateDevices = useCallback(async (): Promise<MediaDevices> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      return { video: videoDevices, audio: audioDevices };
    } catch (error) {
      throw new Error('Failed to enumerate media devices');
    }
  }, []);

  // Start camera with retry mechanism
  const startCamera = useCallback(async (attempt = 1): Promise<void> => {
    try {
      dispatch({ type: 'SET_RECORDING_STATE', payload: 'initializing' });
      console.log(`Requesting camera access (attempt ${attempt})...`);
      
      // Check MediaRecorder support
      if (typeof window.MediaRecorder === 'undefined') {
        throw new Error('Recording not supported in this browser');
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser');
      }

      // Enumerate available devices
      const devices = await enumerateDevices();
      dispatch({ type: 'SET_DEVICES', payload: devices });
      
      if (devices.video.length === 0) {
        throw new Error('No camera devices found');
      }
      
      if (devices.audio.length === 0) {
        throw new Error('No microphone devices found');
      }
      
      console.log(`Found ${devices.video.length} video devices and ${devices.audio.length} audio devices`);
      
      // Get supported MIME type
      const supportedMimeType = getSupportedMimeType();
      dispatch({ type: 'SET_MIME_TYPE', payload: supportedMimeType });
      console.log('Using MIME type:', supportedMimeType);
      
      // Define media constraints with fallback options for better compatibility
      const constraints = {
        video: {
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          facingMode: 'user',
          frameRate: { min: 15, ideal: 30, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 44100, max: 48000 }
        }
      };

      console.log('Using constraints:', constraints);
      
      // Get media stream with timeout and fallback constraints
      let mediaStream: MediaStream;
      
      try {
        mediaStream = await Promise.race([
          navigator.mediaDevices.getUserMedia(constraints),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Camera access timeout')), CAMERA_TIMEOUT)
          )
        ]);
      } catch (initialError) {
        console.warn('Initial constraints failed, trying fallback:', initialError);
        
        // Try with more lenient constraints
        const fallbackConstraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: true
        };
        
        try {
          mediaStream = await Promise.race([
            navigator.mediaDevices.getUserMedia(fallbackConstraints),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Camera access timeout (fallback)')), CAMERA_TIMEOUT)
            )
          ]);
          console.log('Fallback constraints succeeded');
        } catch (fallbackError) {
          console.error('Both initial and fallback constraints failed');
          throw new Error(`Camera access failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
        }
      }
      
      console.log('Camera access granted, stream tracks:', mediaStream.getTracks().length);
      dispatch({ type: 'SET_STREAM', payload: mediaStream });
      dispatch({ type: 'SET_PERMISSION_STATE', payload: 'granted' });
      
      // Setup cleanup function
      streamCleanupRef.current = () => {
        mediaStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind, track.label);
        });
      };
      
      // Setup video element
      if (videoRef.current) {
        await setupVideoElement(mediaStream);
      }
      
      dispatch({ type: 'SET_RECORDING_STATE', payload: 'ready' });
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      console.error(`Camera error (attempt ${attempt}):`, err);
      
      const error = err instanceof Error ? err : new Error('Unknown camera error');
      dispatch({ type: 'SET_ERROR', payload: error });
      dispatch({ type: 'SET_PERMISSION_STATE', payload: 'denied' });
      
      // Retry mechanism
      if (attempt < RETRY_ATTEMPTS && error.name !== 'NotAllowedError') {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        setTimeout(() => startCamera(attempt + 1), RETRY_DELAY);
        return;
      }
      
      // Show error to user
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      onError?.(error);
      
      dispatch({ type: 'SET_RECORDING_STATE', payload: 'error' });
    }
  }, [enumerateDevices, onError]);

  // Setup video element with proper error handling
  const setupVideoElement = async (mediaStream: MediaStream): Promise<void> => {
    if (!videoRef.current) {
      throw new Error('Video element not found');
    }
    
    const video = videoRef.current;
    
    // Clear any existing src and event listeners
    video.srcObject = null;
    video.onloadedmetadata = null;
    video.oncanplay = null;
    video.onerror = null;
    
    // Assign new stream
    video.srcObject = mediaStream;
    
    console.log('Stream assigned to video element');
    
    // Wait for video to be ready with multiple fallback strategies
    await new Promise<void>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      let resolved = false;
      let metadataLoaded = false;
      
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        video.onloadedmetadata = null;
        video.oncanplay = null;
        video.onerror = null;
        video.onloadeddata = null;
      };
      
      // Extended timeout for video loading
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          console.warn('Video loading timeout, but stream may still be working');
          // Don't reject immediately - try to resolve anyway
          resolve();
        }
      }, VIDEO_LOADING_TIMEOUT * 2); // Double the timeout
      
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        metadataLoaded = true;
        
        // If we have metadata, try to resolve quickly
        if (!resolved) {
          resolved = true;
          cleanup();
          console.log('Video ready with metadata');
          resolve();
        }
      };
      
      video.onloadeddata = () => {
        console.log('Video data loaded');
        // Alternative success condition
        if (!resolved && metadataLoaded) {
          resolved = true;
          cleanup();
          console.log('Video ready with data');
          resolve();
        }
      };
      
      video.oncanplay = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          console.log('Video can play successfully');
          resolve();
        }
      };
      
      video.onerror = (e) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          const error = new Error(`Video element failed: ${e}`);
          console.error('Video element error:', e);
          reject(error);
        }
      };
      
      // Additional check for stream state
      const checkStreamState = () => {
        if (!resolved && mediaStream.active) {
          const videoTrack = mediaStream.getVideoTracks()[0];
          if (videoTrack && videoTrack.readyState === 'live') {
            console.log('Stream is live, resolving video setup');
            if (!resolved) {
              resolved = true;
              cleanup();
              resolve();
            }
          }
        }
      };
      
      // Check stream state after a short delay
      setTimeout(checkStreamState, 1000);
    });
  };

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    cleanupResources();
    dispatch({ type: 'SET_STREAM', payload: null });
    dispatch({ type: 'SET_RECORDING_STATE', payload: 'idle' });
  }, [cleanupResources]);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    // Cleanup on unmount
    return () => {
      cleanupResources();
    };
  }, [isOpen, startCamera, stopCamera, cleanupResources]);

  // Start recording with proper state management
  const startRecording = useCallback(() => {
    if (!state.stream || state.recordingState !== 'ready') {
      console.warn('Cannot start recording: stream not ready or invalid state');
      return;
    }
    
    try {
      chunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(state.stream, { mimeType: state.mimeType });
      mediaRecorderRef.current = mediaRecorder;
      
      const startTime = Date.now();
      const videoTrack = state.stream.getVideoTracks()[0];
      const settings = videoTrack?.getSettings();
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        const error = new Error('Recording failed. Please try again.');
        dispatch({ type: 'SET_ERROR', payload: error });
        toast.error(error.message);
        dispatch({ type: 'SET_RECORDING_STATE', payload: 'error' });
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: state.mimeType });
        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000);
        
        const metrics: RecordingMetrics = {
          startTime,
          duration,
          blobSize: blob.size,
          resolution: {
            width: settings?.width || 0,
            height: settings?.height || 0,
          },
        };
        
        dispatch({ type: 'SET_RECORDED_BLOB', payload: blob });
        dispatch({ type: 'SET_METRICS', payload: metrics });
        dispatch({ type: 'SET_SHOW_PREVIEW', payload: true });
        dispatch({ type: 'SET_RECORDING_STATE', payload: 'processing' });
        
        onRecordingComplete?.(blob, metrics);
        console.log('Recording completed:', metrics);
      };

      mediaRecorder.start(CHUNK_INTERVAL);
      dispatch({ type: 'SET_RECORDING_STATE', payload: 'recording' });
      dispatch({ type: 'SET_RECORDING_TIME', payload: 0 });
      
      // Start timer – use a local counter to avoid stale closure
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed++;
        dispatch({ type: 'SET_RECORDING_TIME', payload: elapsed });
        
        // Auto-stop when max duration reached
        if (elapsed >= maxRecordingDuration) {
          stopRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      const err = error instanceof Error ? error : new Error('Failed to start recording');
      dispatch({ type: 'SET_ERROR', payload: err });
      toast.error(err.message);
      dispatch({ type: 'SET_RECORDING_STATE', payload: 'error' });
    }
  }, [state.stream, state.recordingState, state.mimeType, maxRecordingDuration, onRecordingComplete]);

  // Stop recording with proper cleanup
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.recordingState === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.warn('Error stopping MediaRecorder:', error);
      }
      mediaRecorderRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    dispatch({ type: 'SET_RECORDING_STATE', payload: 'processing' });
    
    // Stop camera to save battery
    setTimeout(() => {
      if (state.recordingState !== 'recording') {
        cleanupResources();
      }
    }, 1000);
  }, [state.recordingState, cleanupResources]);

  // Handle retake with proper state reset
  const handleRetake = useCallback(() => {
    if (state.recordingState === 'recording') {
      console.warn('Cannot retake while recording');
      return;
    }
    
    stopRecording();
    dispatch({ type: 'RESET_RECORDING' });
    startCamera();
  }, [state.recordingState, stopRecording, startCamera]);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get status color for recording indicator
  const getStatusColor = useCallback(() => {
    switch (state.recordingState) {
      case 'recording':
        return 'bg-red-500 animate-pulse';
      case 'ready':
        return 'bg-green-500';
      case 'initializing':
        return 'bg-yellow-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-white/20';
    }
  }, [state.recordingState]);

  // Get status text
  const getStatusText = useCallback(() => {
    switch (state.recordingState) {
      case 'initializing':
        return 'Initializing camera...';
      case 'ready':
        return 'Ready to record';
      case 'recording':
        return 'Recording...';
      case 'processing':
        return 'Processing...';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  }, [state.recordingState]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dragConstraintsRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recorder-title"
      aria-describedby="recorder-description"
    >
      <motion.div 
        drag
        dragConstraints={dragConstraintsRef}
        dragElastic={0.05}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        style={{ position: 'absolute', top: 40, right: 40 }}
        className="w-full max-w-[320px] bg-black/80 border-2 border-white/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl pointer-events-auto cursor-grab active:cursor-grabbing"
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-white/60 hover:text-white bg-black/60 rounded-full transition-colors z-20 focus:outline-none"
          aria-label="Close recording modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-4 flex flex-col items-center">
          {/* Header - Minimalised */}
          <div className="w-full mb-3 flex items-center justify-between">
            <h2 id="recorder-title" className="text-sm font-bold text-white uppercase tracking-widest pl-2">
              React Mode
            </h2>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 group">
            {/* Video Element */}
            <video 
              ref={videoRef}
              autoPlay
              muted 
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
              aria-label="Camera preview"
              onLoad={() => console.log('Video element loaded')}
              onError={(e) => {
                console.error('Video element error:', e);
                dispatch({ 
                  type: 'SET_ERROR', 
                  payload: new Error('Video preview failed to load') 
                });
              }}
            />
            
            {/* Error Overlay */}
            {state.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="text-center p-6">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-white/80 mb-2">{state.error.message}</p>
                  <button
                    onClick={() => {
                      dispatch({ type: 'SET_ERROR', payload: null });
                      startCamera();
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Retry camera access"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {/* Loading Overlay */}
            {state.recordingState === 'initializing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-white/60 animate-spin mx-auto mb-2" />
                  <p className="text-white/60 text-sm">{getStatusText()}</p>
                </div>
              </div>
            )}
            
            {/* Recording HUD */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10">
              <div 
                className={`w-2 h-2 rounded-full ${getStatusColor()}`}
                aria-hidden="true"
              />
              <span className="text-xs font-mono text-white/90" aria-live="polite">
                {formatTime(state.recordingTime)} / {formatTime(maxRecordingDuration)}
              </span>
            </div>

            {/* Status Indicator */}
            {state.recordingState !== 'ready' && state.recordingState !== 'recording' && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10">
                <span className="text-xs text-white/80">{getStatusText()}</span>
              </div>
            )}

            {/* Recording Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
              {state.recordingState === 'ready' && (
                <button
                  onClick={startRecording}
                  onPointerDown={(e) => e.stopPropagation()} // Prevent drag triggering here
                  className="w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-full shadow-lg shadow-red-500/30 transition-all hover:scale-110 active:scale-95 group/btn border-2 border-white/20"
                  aria-label="Start recording"
                >
                  <Camera className="w-5 h-5 text-white transition-transform" />
                </button>
              )}
              
              {state.recordingState === 'recording' && (
                <button
                  onClick={stopRecording}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-12 h-12 flex items-center justify-center bg-white hover:bg-white/90 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 group/btn"
                  aria-label="Stop recording"
                >
                  <Square className="w-5 h-5 text-black fill-black" />
                </button>
              )}
              
              {state.recordingState === 'processing' && (
                <div className="w-12 h-12 flex items-center justify-center bg-black/60 rounded-full">
                  <Loader2 className="w-6 h-6 text-white/80 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {state.showPreview && state.recordedBlob && (
          <ReactionPreviewModal
            blob={state.recordedBlob}
            movieId={movieId}
            movieTitle={movieTitle}
            movieTimestamp={movieTimestamp}
            onRetake={handleRetake}
            onClose={() => {
              onClose();
              dispatch({ type: 'SET_SHOW_PREVIEW', payload: false });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
