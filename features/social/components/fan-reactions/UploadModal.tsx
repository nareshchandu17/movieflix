"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, Video, Loader2 } from 'lucide-react';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { toast } from 'sonner';
import { validateReactionUpload } from '@/lib/fan-reactions/validation';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newReaction: any) => void;
  defaultMovieId?: number;
}

export function UploadModal({ isOpen, onClose, onSuccess, defaultMovieId }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [movieId, setMovieId] = useState(defaultMovieId?.toString() || '');
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validation = validateReactionUpload({ file: selected, movieId, caption });
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const handleUpload = async () => {
    const validation = validateReactionUpload({ file, movieId, caption });
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('video', file!);
      formData.append('movieId', movieId.trim());
      formData.append('movieTimestamp', "0");
      formData.append('moodEmoji', "🍿");
      formData.append('visibility', "public");
      formData.append('caption', caption.trim());

      const response = await fetch('/api/reactions/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Upload failed');
      }

      toast.success("Reaction posted to feed!");

      const result = {
        ...data.reaction,
        likes: data.reaction.likesCount || 0,
        views: data.reaction.viewsCount || 0,
      };

      if (onSuccess) onSuccess(result);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error uploading video. Please try again.");
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
                <span className="text-xs text-zinc-500 mt-1">Max 20MB</span>
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
                onChange={(e) => setMovieId(e.target.value.replace(/\D/g, ''))}
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
              onChange={(e) => setCaption(e.target.value.slice(0, 140))}
              placeholder="What did you think of this movie?"
              className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-zinc-800 border-zinc-700 text-white resize-none"
              rows={3}
            />
            <p className="text-xs text-zinc-500">{caption.length}/140 characters</p>
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
