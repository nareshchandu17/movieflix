import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface RecorderState {
  status: 'idle' | 'recording' | 'previewing';
  stream: MediaStream | null;
  recordedBlob: Blob | null;
  error: string | null;
}

export function useReactionRecorder(maxDurationMs = 30000) {
  const [state, setState] = useState<RecorderState>({
    status: 'idle',
    stream: null,
    recordedBlob: null,
    error: null,
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // 1. Request permissions and get stream
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { aspectRatio: 9/16, facingMode: 'user' }, // Try to get portrait optimized 
        audio: true
      });
      
      setState(prev => ({ ...prev, stream: ms, error: null }));
      chunks.current = [];

      // 2. Setup recorder with widespread MIME types
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      const recorder = new MediaRecorder(ms, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      
      recorder.onstop = () => {
        // Collect blob on stop
        const blob = new Blob(chunks.current, { type: 'video/webm' });
        
        // Stop all tracks to release camera light
        ms.getTracks().forEach(track => track.stop());
        
        setState({
          status: 'previewing',
          stream: null, // released
          recordedBlob: blob,
          error: null
        });
      };

      mediaRecorder.current = recorder;
      recorder.start(1000); // collect chunks every second
      
      setState(prev => ({ ...prev, status: 'recording' }));

      // 3. Auto-stop logic
      timer.current = setTimeout(() => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
          mediaRecorder.current.stop();
          toast.info('Maximum 30s limit reached.');
        }
      }, maxDurationMs);

    } catch (err: any) {
      console.error('Microphone/Camera permission denied or unsupported.', err);
      setState(prev => ({ ...prev, error: 'Camera permissions denied or unavailable.' }));
      toast.error('Camera permissions denied');
    }
  }, [maxDurationMs]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const resetRecorder = useCallback(() => {
    // Release any active tracks just in case
    if (state.stream) {
      state.stream.getTracks().forEach(t => t.stop());
    }
    setState({
      status: 'idle',
      stream: null,
      recordedBlob: null,
      error: null
    });
  }, [state.stream]);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecorder
  };
}
