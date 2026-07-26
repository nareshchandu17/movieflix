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
  onSuccess?: (newReaction: any) => void;
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
  onSuccess,
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const movieVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
      console.warn("Camera access error:", err);
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

    // Find the movie video element in the player
    const movieVideo = document.querySelector('.react-player video') as HTMLVideoElement;
    if (movieVideo) {
      movieVideoRef.current = movieVideo;
    }

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
    if (!stream || !videoRef.current) return;

    try {
      chunksRef.current = [];
      
      // 1. Setup Compositing Canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Vertical Split Layout: 720x1280 (Standard mobile-friendly aspect)
      canvas.width = 720;
      canvas.height = 1280;

      const drawFrames = () => {
        if (recordingState !== 'recording' && recordingState !== 'countdown') return;

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // A. Draw Movie (Top 45%)
        if (movieVideoRef.current) {
          const movieH = canvas.height * 0.45;
          const movieW = canvas.width;
          ctx.drawImage(movieVideoRef.current, 0, 0, movieW, movieH);
        }

        // B. Draw Webcam (Bottom 55%)
        if (videoRef.current) {
          const camH = canvas.height * 0.55;
          const camW = canvas.width;
          const camY = canvas.height * 0.45;
          
          // Mirror the webcam for natural feel
          ctx.save();
          ctx.translate(camW, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, camY, camW, camH);
          ctx.restore();
        }

        animationFrameRef.current = requestAnimationFrame(drawFrames);
      };

      // Start the drawing loop
      drawFrames();

      // 2. Capture Stream from Canvas
      const canvasStream = canvas.captureStream(30); // 30 FPS
      
      // Add audio from webcam to the canvas stream
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      }

      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      const mimeType = MediaRecorder.isTypeSupported(options.mimeType) ? options.mimeType : 'video/webm';

      const mediaRecorder = new MediaRecorder(canvasStream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        const blob = new Blob(chunksRef.current, { type: mimeType });
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
          
          {/* Hidden Canvas for Compositing */}
          <canvas ref={canvasRef} className="hidden" />
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
            onSuccess={onSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
