"use client";

import React from 'react';
import ReactionFeed from '@/components/reaction/ReactionFeed';
import { ReactionProvider } from '@/contexts/ReactionContext';

export default function ReactionsPage() {
  return (
    <ReactionProvider>
      <div className="min-h-screen bg-black">
        <ReactionFeed />
      </div>
    </ReactionProvider>
  );
}
