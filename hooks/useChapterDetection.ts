import { useEffect } from 'react';
import { usePlayerState } from './usePlayerState';
import { Chapter } from '@/types/player.types';

// Example Mock Data - In a real app this would come from an API
const MOCK_CHAPTERS: Chapter[] = [
  { id: 'c1', title: 'Opening Scene', startTime: 0, endTime: 120, thumbnailUrl: '/chapters/1.jpg' },
  { id: 'c2', title: 'The Call to Action', startTime: 120, endTime: 300, thumbnailUrl: '/chapters/2.jpg' },
  { id: 'c3', title: 'Training Montage', startTime: 300, endTime: 600, thumbnailUrl: '/chapters/3.jpg' },
  { id: 'c4', title: 'Final Battle', startTime: 600, endTime: 900, thumbnailUrl: '/chapters/4.jpg' },
  { id: 'c5', title: 'Credits', startTime: 900, endTime: 1000, thumbnailUrl: '/chapters/5.jpg' },
];

export function useChapterDetection(contentId: string) {
  const { setChapters, currentTime, currentChapter } = usePlayerState();

  useEffect(() => {
    // In a real app, fetch chapters based on contentId
    // For this implementation, we use mock chapters
    setChapters(MOCK_CHAPTERS);
  }, [contentId, setChapters]);

  // The logic for detecting currentChapter is already handled inside the 
  // setCurrentTime action in the Zustand store for better performance,
  // but this hook could also export specific chapter utilities if needed.
  
  return { currentChapter };
}
