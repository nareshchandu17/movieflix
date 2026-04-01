"use client";

import { useEffect, useState, forwardRef } from "react";
import ReactPlayer, { ReactPlayerProps } from "react-player";

// Dynamic wrapper for ReactPlayer to avoid SSR hydration mismatch
// and solve some complex type conflicts in Next 15 App Router
const ClientPlayer = forwardRef<ReactPlayer, ReactPlayerProps>((props, ref) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="w-full h-full bg-black/50 animate-pulse" />;
  }

  // @ts-ignore - Ignore exact type mismatch that causes strict TS compiler issues in Next 15
  return <ReactPlayer ref={ref} {...props} />;
});

ClientPlayer.displayName = "ClientPlayer";

export default ClientPlayer;
