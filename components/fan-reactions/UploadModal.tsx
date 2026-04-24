"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMovieId?: number;
}

export function UploadModal({ isOpen, onClose, defaultMovieId }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [movieId, setMovieId] = useState(defaultMovieId?.toString() || '');
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 20 * 1024 * 1024) {
        alert("Video must be less than 20MB");
        return;
      }
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreview(url);
    }
  };

  const handleUpload = async () => {
    if (!file || !movieId) return;

    try {
      setIsUploading(true);

      // 1. Get Signature
      const sigRes = await fetch('/api/upload-signature', { method: 'POST' });
      const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('upload_preset', 'fan_reactions');

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: 'POST', body: formData }
      );
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Upload failed');

      // 3. Save to our DB
      // Duration from cloudinary upload response
      const duration = uploadData.duration || (videoRef.current?.duration || 0);
      const thumbnailUrl = uploadData.secure_url.replace(/\.[^/.]+$/, ".jpg").replace('/upload/', '/upload/so_2/');

      const dbRes = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          videoUrl: uploadData.secure_url,
          thumbnailUrl,
          caption,
          duration,
        }),
      });

      if (!dbRes.ok) throw new Error('Failed to save reaction');

      alert("Uploaded successfully!");
      onClose();
      // Optional: trigger refresh
    } catch (error) {
      console.error(error);
      alert("Error uploading video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md relative border border-zinc-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6">Upload Fan Reaction</h2>

        <div className="space-y-4">
          {!preview ? (
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:bg-zinc-800/50 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                <Video className="w-10 h-10 text-zinc-500 mb-2" />
                <span className="text-sm font-medium text-zinc-300">Select Video</span>
                <span className="text-xs text-zinc-500 mt-1">Max 30s, up to 20MB</span>
              </label>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] max-h-[300px] mx-auto">
              <video 
                ref={videoRef}
                src={preview} 
                className="w-full h-full object-cover" 
                controls 
              />
              <button 
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-black/60 p-1 rounded-full hover:bg-black"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {!defaultMovieId && (
            <div className="space-y-2">
              <Label htmlFor="movieId" className="text-zinc-300">Movie ID (TMDB)</Label>
              <Input
                id="movieId"
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                placeholder="e.g. 550"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="caption" className="text-zinc-300">Caption (Optional)</Label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What did you think of this movie?"
              className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-800 border-zinc-700 text-white resize-none"
              rows={3}
            />
          </div>

          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleUpload}
            disabled={!file || !movieId || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Share Reaction
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
