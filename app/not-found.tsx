"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import OnboardingCard from "@/components/OnboardingCard";

const PageNotFound = () => {
  const { data: session, status } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (session && !session.user?.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [session, status]);

  const handleGoHome = () => {
    if (session && !session.user?.onboardingCompleted) {
      setShowOnboarding(true);
    } else {
      window.location.href = "/";
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Reload page to update session
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center space-y-6 relative">
      {/* Onboarding Modal Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowOnboarding(false)}
          />
          
          {/* Onboarding Card */}
          <div className="relative z-10 w-full max-w-md">
            <OnboardingCard onComplete={handleOnboardingComplete} {...{}} />
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-400">404</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-white">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. Try searching
          again or check the URL for any typos.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
        >
          Go Home
        </button>
        <Link
          href="/search"
          className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Search Content
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
