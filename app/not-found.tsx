"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const PageNotFound = () => {
  const { data: session } = useSession();

  const handleGoHome = () => {
    if (session && !session.user?.onboardingCompleted) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center space-y-6 relative">
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
