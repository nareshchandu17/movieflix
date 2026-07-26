"use client";

import React from 'react';
import ReactionFeed from '@/features/social/components/reaction/ReactionFeed';
import { ReactionProvider } from '@/features/social/components/ReactionContext';

export default function ReactionsPage() {
  return (
    <ReactionProvider>
      <div className="min-h-screen bg-black">
        <ReactionFeed />
      </div>
    </ReactionProvider>
  );
}
