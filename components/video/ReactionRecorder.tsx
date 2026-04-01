"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Video, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionRecorderProps {
  playerRef: React.RefObject<any>;
  contentId: string;
  isRecording: boolean;
  onClipGenerated: (blob: Blob, timestamp: number) => void;
}

export default function ReactionRecorder({ playerRef, contentId, isRecording, onClipGenerated }: ReactionRecorderProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewEnabled, setPreviewEnabled] = useState(true);

  // Request camera access
  useEffect(() => {
    async function getCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        setHasPermission(true);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    getCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Handle Recording Logic
  useEffect(() => {
    if (isRecording && stream) {
      startRecording();
    } else if (!isRecording && mediaRecorderRef.current?.state === "recording") {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const currentTimestamp = playerRef.current?.getCurrentTime() || 0;
      onClipGenerated(blob, currentTimestamp);
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  if (!hasPermission) return null;

  return (
    <div className="fixed bottom-24 right-8 z-[100]">
      <AnimatePresence>
        {previewEnabled && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative w-48 aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black group"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1]" 
            />
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-red-500 rounded-full animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">REC</span>
              </div>
            )}

            {/* Privacy Shield Overlay */}
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setPreviewEnabled(!previewEnabled)}
        className="absolute -top-3 -right-3 p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full text-white/40 hover:text-white transition-colors"
      >
        {previewEnabled ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
