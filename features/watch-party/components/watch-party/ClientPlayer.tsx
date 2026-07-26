"use client";

import { forwardRef } from "react";
import dynamic from "next/dynamic";
import { ReactPlayerProps } from "react-player";

// Dynamic import with SSR disabled to avoid hydration mismatch and reduce initial bundle size
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black/50 animate-pulse" />
});

// Wrapper for ReactPlayer to pass refs correctly and solve strict TS conflicts
const ClientPlayer = forwardRef<any, ReactPlayerProps>((props, ref) => {
  // @ts-ignore - Ignore exact type mismatch that causes strict TS compiler issues in Next 15
  return <ReactPlayer ref={ref} {...props} />;
});

ClientPlayer.displayName = "ClientPlayer";

export default ClientPlayer;
