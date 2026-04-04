import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Bookmark } from "lucide-react";
import CollectionItem from "./CollectionItem";
import CreateCollectionForm from "./CreateCollectionForm";
import CollectionToast from "./CollectionToast";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";

interface Collection {
  _id: string;
  name: string;
  itemCount: number;
}

interface CollectionPopupProps {
  media: TMDBMovie | TMDBTVShow;
  onClose: () => void;
  anchorRect?: DOMRect;
}

const CollectionPopup: React.FC<CollectionPopupProps> = ({
  media,
  onClose,
  anchorRect,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedCollectionIds, setSavedCollectionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; isOpen: boolean }>({
    message: "",
    isOpen: false,
  });
  
  const popupRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch collections and check if item is saved
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/collections");
        const data = await response.json();
        
        if (data.success) {
          setCollections(data.collections);
          
          const checkResponse = await fetch(`/api/collections/check?tmdbId=${media.id}`);
          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            if (checkData.success) {
              setSavedCollectionIds(checkData.ids);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [media.id]);

  const handleToggle = async (collectionId: string, collectionName: string) => {
    const isSaved = savedCollectionIds.includes(collectionId);
    setUpdatingId(collectionId);

    try {
      if (isSaved) {
        const response = await fetch("/api/collections/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectionId, tmdbId: media.id }),
        });
        
        if (response.ok) {
          setSavedCollectionIds(prev => prev.filter(id => id !== collectionId));
          showToast(`Removed from ${collectionName}`);
        }
      } else {
        const response = await fetch("/api/collections/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collectionIds: [collectionId],
            tmdbId: media.id,
            mediaType: "title" in media ? "movie" : "series",
            title: "title" in media ? media.title : (media as any).name,
            posterPath: media.poster_path,
            backdropPath: media.backdrop_path,
            overview: media.overview,
            releaseDate: "release_date" in media ? media.release_date : (media as any).first_air_date,
            voteAverage: media.vote_average,
          }),
        });
        
        if (response.ok) {
          setSavedCollectionIds(prev => [...prev, collectionId]);
          showToast(`Added to ${collectionName}`);
        }
      }
    } catch (error) {
      console.error("Error toggling collection:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCollectionCreated = async (newCollection: Collection) => {
    setCollections(prev => [newCollection, ...prev]);
    setIsCreating(false);
    await handleToggle(newCollection._id, newCollection.name);
  };

  const showToast = (message: string) => {
    setToast({ message, isOpen: true });
  };

  // Improved positioning logic
  const getStyle = useCallback(() => {
    if (!anchorRect) return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

    const POPUP_WIDTH = 300;
    const MARGIN = 16;
    
    let left = anchorRect.left - POPUP_WIDTH / 2 + anchorRect.width / 2;
    let top = anchorRect.bottom + 12;

    // Viewport constraints
    if (typeof window !== "undefined") {
      if (left < MARGIN) left = MARGIN;
      if (left + POPUP_WIDTH > window.innerWidth - MARGIN) {
        left = window.innerWidth - POPUP_WIDTH - MARGIN;
      }
      
      // If there isn't enough space below, show above
      if (top + 300 > window.innerHeight && anchorRect.top > 300) {
        return { 
          left, 
          bottom: window.innerHeight - anchorRect.top + 12,
          transform: "none",
          transformOrigin: "bottom" 
        };
      }
    }

    return { 
      left, 
      top, 
      transform: "none",
      transformOrigin: "top"
    };
  }, [anchorRect]);

  if (!mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Click-outside Overlay - pointer-events-auto */}
      <div 
        className="absolute inset-0 bg-black/5 pointer-events-auto" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      
      <motion.div
        ref={popupRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute pointer-events-auto w-[300px] bg-gray-950 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/20"
        style={getStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
            <Bookmark className="w-4 h-4 text-blue-500 fill-blue-500" />
            Save to Collection
          </h2>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto scrollbar-hide p-2 bg-black/40">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-gray-400 text-sm">Synchronizing collections...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {collections.map((col) => (
                <CollectionItem
                  key={col._id}
                  name={col.name}
                  isSaved={savedCollectionIds.includes(col._id)}
                  onToggle={() => handleToggle(col._id, col.name)}
                  isUpdating={updatingId === col._id}
                />
              ))}
              
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 text-blue-400 group rounded-lg mt-1"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Create New Collection</span>
                </button>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {isCreating && (
            <CreateCollectionForm
              onCancel={() => setIsCreating(false)}
              onCreated={handleCollectionCreated}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <div className="fixed bottom-6 right-6 md:right-12 z-[10000] pointer-events-auto">
        <CollectionToast
          message={toast.message}
          isOpen={toast.isOpen}
          onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};

export default CollectionPopup;
