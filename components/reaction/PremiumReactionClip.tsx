import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Video, Play, Pause, RotateCw, Lock, Unlock, Send, Eye, EyeOff, Clock, Film, User, Sparkles, Zap, TrendingUp, CheckCircle, Upload, MessageCircle, Heart, Share2 } from 'lucide-react';
// import { useReactions } from '@/contexts/ReactionContext'; // Commented out to avoid context error

interface ReactionClip {
  id: string;
  videoUrl: string;
  thumbnail: string;
  movieTitle: string;
  movieScene: string;
  timestamp: string;
  duration: number;
  emotionTags: string[];
  isPublic: boolean;
  caption: string;
  createdAt: Date;
}

interface MovieScene {
  id: string;
  title: string;
  scene: string;
  timestamp: string;
  videoUrl: string;
  thumbnail: string;
}

const emotionOptions = [
  { id: 'mind-blown', emoji: '🤯', label: 'Mind Blown', color: 'from-purple-500 to-pink-500' },
  { id: 'funny', emoji: '😂', label: 'Funny', color: 'from-yellow-500 to-orange-500' },
  { id: 'epic', emoji: '🔥', label: 'Epic', color: 'from-red-500 to-orange-500' },
  { id: 'emotional', emoji: '😭', label: 'Emotional', color: 'from-blue-500 to-cyan-500' },
  { id: 'plot-twist', emoji: '😱', label: 'Plot Twist', color: 'from-purple-600 to-indigo-600' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: 'from-green-500 to-teal-500' }
];

const aiCaptions = [
  "Bro that twist was insane 🔥",
  "I did NOT see that coming 🤯",
  "This scene hits different every time 😭",
  "Goosebumps every single time 🔥",
  "My jaw is literally on the floor 😮",
  "This is cinema at its finest ✨",
  "I need a minute to process this 🤯",
  "Absolutely legendary moment 🔥"
];

export default function PremiumReactionClip() {
  // const { addReaction } = useReactions(); // Commented out to avoid context error
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedClip, setRecordedClip] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postedSuccessfully, setPostedSuccessfully] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'split'>('split');
  const [currentScene] = useState({
    id: '1',
    title: 'Dune: Part Two',
    scene: 'Epic Sandworm Arrival',
    timestamp: '1:23:45',
    videoUrl: '/api/placeholder/dune-scene',
    thumbnail: '/api/placeholder/dune-thumbnail'
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (postedSuccessfully) {
      const timer = setTimeout(() => {
        setPostedSuccessfully(false);
        setIsModalOpen(false);
        resetRecording();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [postedSuccessfully]);

  const startRecording = async () => {
    try {
      // Clean up any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute to avoid echo
      }
      
      // Check for supported MIME types
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedClip(url);
        setIsRecording(false);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Show user-friendly error message
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    // Clean up stream (handled in onstop callback)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const resetRecording = () => {
    setRecordedClip(null);
    setSelectedEmotions([]);
    setCaption('');
    setPostedSuccessfully(false);
    setIsPosting(false);
    setUploadProgress(0);
  };

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotionId) 
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    );
  };

  const generateAICaption = () => {
    const randomCaption = aiCaptions[Math.floor(Math.random() * aiCaptions.length)];
    setCaption(randomCaption);
  };

  const postToFeed = async () => {
    if (!recordedClip) return;
    
    setIsPosting(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      // Create reaction data
      const reactionData = {
        videoUrl: recordedClip,
        thumbnail: recordedClip, // In production, generate actual thumbnail
        movieTitle: currentScene.title,
        movieScene: currentScene.scene,
        timestamp: currentScene.timestamp,
        duration: 15, // Default duration
        emotionTags: selectedEmotions,
        isPublic: isPublic,
        caption: caption,
        user: {
          name: 'Current User', // In production, get from auth context
          avatar: 'CU',
          id: 'current-user'
        }
      };
      
      // Add reaction to context
      // await addReaction(reactionData); // Commented out to avoid context error
      
      setIsPosting(false);
      setPostedSuccessfully(true);
      
    } catch (error) {
      console.error('Error posting reaction:', error);
      setIsPosting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isModalOpen) {
    return (
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white p-4 rounded-full shadow-2xl hover:shadow-red-500/25 transition-all duration-300 group z-50"
      >
        <Video className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-orange-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
        {/* Animated glow effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      {/* Main Modal */}
      <div className="relative bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30">
                <Camera className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Record Reaction</h2>
                <p className="text-sm text-gray-400">React to: {currentScene.title}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetRecording();
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Reaction Context */}
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Film className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-red-400">Reacting to:</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden">
                <img src={currentScene.thumbnail} alt={currentScene.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-white font-medium">{currentScene.title}</h3>
                <p className="text-gray-400 text-sm">{currentScene.scene}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{currentScene.timestamp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Recording Area */}
          <div className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">View Mode:</span>
              <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('single')}
                  className={`px-3 py-1.5 rounded text-sm transition-all ${
                    viewMode === 'single' 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded text-sm transition-all ${
                    viewMode === 'split' 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Split Screen
                </button>
              </div>
            </div>

            {/* Video Display */}
            <div className={`grid ${viewMode === 'split' ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}>
              {/* Movie Scene */}
              <div className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden border border-gray-700/50 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-orange-900/20" />
                <img 
                  src={currentScene.thumbnail} 
                  alt={currentScene.title}
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <span className="text-xs text-white">{currentScene.timestamp}</span>
                </div>
                <div className="absolute top-2 right-2 bg-red-500/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <span className="text-xs text-red-400 font-medium">Movie Scene</span>
                </div>
              </div>

              {/* Recording/Preview */}
              <div className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden border border-gray-700/50 shadow-lg">
                {recordedClip ? (
                  <>
                    <video
                      ref={videoRef}
                      src={recordedClip}
                      className="w-full h-full object-cover"
                      controls={false}
                      loop
                    />
                    <div className="absolute top-2 right-2 bg-blue-500/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <span className="text-xs text-blue-400 font-medium">Your Reaction</span>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <span className="text-xs text-white">0:07 / 0:15</span>
                    </div>
                    <div className="absolute inset-0 border border-blue-500/30 rounded-2xl pointer-events-none" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                    {isRecording ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-500">Camera preview will appear here</p>
                        </div>
                      </div>
                    )}
                    {isRecording && (
                      <div className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs text-white font-medium">REC</span>
                      </div>
                    )}
                    <div className="absolute inset-0 border border-blue-500/30 rounded-2xl pointer-events-none" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!recordedClip ? (
              <>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-red-500/25 transition-all duration-300 flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Start Recording
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors"
                    >
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
                    >
                      <div className="w-3 h-3 bg-white rounded-full" />
                      Stop Recording
                    </button>
                  </>
                )}
              </>
            ) : (
              <button
                onClick={() => setRecordedClip(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
              >
                <RotateCw className="w-5 h-5" />
                Retake
              </button>
            )}
          </div>

          {/* Emotion Tags */}
          {recordedClip && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">How did this make you feel?</span>
                <button
                  onClick={generateAICaption}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Suggest
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {emotionOptions.map((emotion) => (
                  <button
                    key={emotion.id}
                    onClick={() => toggleEmotion(emotion.id)}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      selectedEmotions.includes(emotion.id)
                        ? `bg-gradient-to-r ${emotion.color} border-transparent text-white shadow-lg`
                        : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{emotion.emoji}</span>
                      <span className="text-sm font-medium">{emotion.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caption Input */}
          {recordedClip && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Add a caption (optional)</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                rows={3}
              />
            </div>
          )}

          {/* Privacy Toggle */}
          {recordedClip && (
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-3">
                {isPublic ? <Eye className="w-5 h-5 text-gray-400" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                <div>
                  <p className="text-white font-medium">{isPublic ? 'Public' : 'Private'}</p>
                  <p className="text-xs text-gray-500">
                    {isPublic ? 'Anyone can see your reaction' : 'Only you can see this reaction'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-red-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Post Button */}
          {recordedClip && (
            <div className="space-y-3">
              {!postedSuccessfully ? (
                <>
                  {isPosting && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Uploading...</span>
                        <span className="text-red-400">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={postToFeed}
                    disabled={isPosting}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-red-500/25 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    {isPosting ? (
                      <>
                        <Upload className="w-5 h-5 animate-pulse" />
                        Posting to Feed...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Post to Feed
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-400 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Posted to Feed Successfully!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
