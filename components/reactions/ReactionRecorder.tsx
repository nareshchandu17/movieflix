"use client";

import React, { useState, useRef, useEffect, useCallback, useReducer } from "react";
import { X, Camera, Square, RefreshCcw, Loader2, AlertTriangle, Video, Mic, MicOff, CameraOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ReactionPreviewModal } from "./ReactionPreviewModal";

// --- Types ---
type RecordingState = 'idle' | 'initializing' | 'ready' | 'countdown' | 'recording' | 'processing' | 'error';
type DevicePermissionState = 'prompt' | 'granted' | 'denied' | 'unknown';

interface RecordingMetrics {
  startTime: number;
  duration: number;
  blobSize: number;
}

interface ReactionRecorderProps {
  movieId: string;
  movieTitle: string;
  movieTimestamp: number;
  isOpen: boolean;
  onClose: () => void;
  maxRecordingDuration?: number;
}

// --- Constants ---
const DEFAULT_MAX_DURATION = 15; // 15 seconds is perfect for reactions
const COUNTDOWN_SECONDS = 3;
const MIN_RECORDING_DURATION = 2; // Prevent empty/corrupt files

export function ReactionRecorder({
  movieId,
  movieTitle,
  movieTimestamp,
  isOpen,
  onClose,
  maxRecordingDuration = DEFAULT_MAX_DURATION,
}: ReactionRecorderProps) {
  // --- State ---
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Camera Initialization ---
  const startCamera = useCallback(async () => {
    try {
      setRecordingState('initializing');
      setError(null);

      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 30 }
        },
        audio: true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setRecordingState('ready');
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError(err.name === 'NotAllowedError' ? "Camera permission denied" : "Failed to access camera");
      setRecordingState('error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setRecordingState('idle');
  }, [stream]);

  // --- Recording Logic ---
  const startRecording = useCallback(() => {
    if (recordingState !== 'ready') return;

    // Start Countdown
    setRecordingState('countdown');
    setCountdown(COUNTDOWN_SECONDS);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Actually start MediaRecorder
          executeStartRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [recordingState]);

  const executeStartRecording = () => {
    if (!stream) return;

    try {
      chunksRef.current = [];
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      
      // Fallback if vp8 isn't supported
      const mimeType = MediaRecorder.isTypeSupported(options.mimeType) 
        ? options.mimeType 
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log(`[Recorder] Recording finished. Size: ${blob.size} bytes`);
        
        if (blob.size < 100) { // Safety check
            toast.error("Recording failed to capture data. Please try again.");
            setRecordingState('ready');
            return;
        }

        setRecordedBlob(blob);
        setShowPreview(true);
        setRecordingState('processing');
      };

      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxRecordingDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      toast.error("Recording failed to start");
      setRecordingState('ready');
    }
  };

  const stopRecording = useCallback(() => {
    // Prevent accidental double-clicks or stopping too early
    if (recordingState !== 'recording' || recordingTime < MIN_RECORDING_DURATION) return;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [recordingState, recordingTime]);

  // --- Effects ---
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setRecordedBlob(null);
      setShowPreview(false);
    }
    return () => stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
      {/* Cinematic Glass Recorder Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-[360px] aspect-[3/4] bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border-2 border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
      >
        {/* Camera Feed */}
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-700 ${recordingState === 'initializing' ? 'opacity-0' : 'opacity-100'}`}
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        {/* Header Information */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
              {recordingState === 'recording' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              {recordingState === 'recording' ? 'Live Recording' : 'Reaction Mode'}
            </span>
            <h3 className="text-white font-bold text-sm truncate max-w-[180px]">{movieTitle}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all border border-white/5"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Central HUD (Countdown/Errors) */}
        <AnimatePresence>
          {recordingState === 'countdown' && (
            <motion.div 
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <span className="text-8xl font-black text-white drop-shadow-2xl">{countdown}</span>
            </motion.div>
          )}

          {recordingState === 'initializing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Waking up lens...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-8 text-center gap-4 bg-black/60 backdrop-blur-md">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <p className="text-white font-medium">{error}</p>
              <button onClick={startCamera} className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm">Retry Access</button>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-6 z-10 px-8">
          
          {/* Progress Indicator */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-white/60 mb-[-12px]">
            <span>0:{recordingTime.toString().padStart(2, '0')}</span>
            <span>0:{maxRecordingDuration}</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-red-600"
              initial={{ width: 0 }}
              animate={{ width: `${(recordingTime / maxRecordingDuration) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-8">
            {recordingState === 'ready' && (
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform active:scale-95 group"
              >
                <div className="w-12 h-12 rounded-full border-2 border-black/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-black" />
                </div>
              </button>
            )}

            {recordingState === 'recording' && (
              <button
                onClick={stopRecording}
                className={`w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all active:scale-95 ${recordingTime < MIN_RECORDING_DURATION ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}
              >
                <Square className="w-6 h-6 text-white fill-white" />
              </button>
            )}

            {recordingState === 'processing' && (
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">
            {recordingState === 'ready' ? 'Tap to Capture' : recordingState === 'recording' ? 'Recording Live' : 'Initializing'}
          </p>
        </div>
      </motion.div>

      {/* Preview Modal Integration */}
      <AnimatePresence>
        {showPreview && recordedBlob && (
          <ReactionPreviewModal
            blob={recordedBlob}
            movieId={movieId}
            movieTitle={movieTitle}
            movieTimestamp={movieTimestamp}
            onRetake={() => {
              setRecordedBlob(null);
              setShowPreview(false);
              startCamera();
            }}
            onClose={() => {
              onClose();
              setShowPreview(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
