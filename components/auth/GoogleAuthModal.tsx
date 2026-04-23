"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ShieldCheck, Film, Heart, Zap } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// MovieFlix bold "M" logo
function NetflixNLogo() {
  return (
    <svg
      width="56"
      height="52"
      viewBox="0 0 140 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0h32L70 96 108 0h32v190h-31V80l-34 88h-10L31 80v110H0V0z"
        fill="#E50914"
      />
    </svg>
  );
}

// Google "G" logo
function GoogleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const features = [
  { icon: Film,  label: "Watch anywhere" },
  { icon: Heart, label: "Your watchlist" },
  { icon: Zap,   label: "Personalized for you" },
];

function ModalContent({ onClose, isLoading, onSignIn }: {
  onClose: () => void;
  isLoading: boolean;
  onSignIn: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-[90vw] max-w-[420px] z-10"
      >
        {/* Red glow border */}
        <div className="absolute -inset-[1.5px] rounded-[22px] bg-gradient-to-b from-red-600/70 via-red-700/30 to-transparent pointer-events-none" />

        {/* Card body */}
        <div className="relative rounded-[20px] bg-[#111111] border border-red-900/40 shadow-[0_0_80px_rgba(229,9,20,0.2)] px-8 pt-8 pb-7 flex flex-col items-center">

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 text-white/50 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Netflix N logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 280 }}
            className="mb-5"
          >
            <NetflixNLogo />
          </motion.div>

          {/* Title */}
          <h2 className="text-[22px] font-bold text-white text-center mb-2 leading-snug">
            Welcome to <span className="text-[#E50914]">MovieFlix</span>
          </h2>

          {/* Subtitle */}
          <p className="text-[13px] text-white/50 text-center leading-relaxed mb-6 max-w-[290px]">
            Sign in with your Google account to track history, watch movies, and continue seamlessly.
          </p>

          {/* Google CTA button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-[14px] px-5 rounded-xl
              bg-white hover:bg-gray-100 active:bg-gray-200
              text-gray-900 font-semibold text-[15px]
              shadow-[0_2px_18px_rgba(0,0,0,0.5)]
              transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            ) : (
              <>
                <GoogleLogo />
                <span>Continue with Google</span>
              </>
            )}
          </motion.button>

          {/* Secure label */}
          <div className="flex items-center gap-1.5 mt-3 mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span className="text-[11px] text-white/35">Secure sign-in powered by Google</span>
          </div>

          {/* OR divider */}
          <div className="w-full flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-white/30 font-medium">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Terms */}
          <p className="text-[11px] text-white/35 text-center leading-relaxed mb-6">
            By continuing, you agree to MovieFlix's{" "}
            <a href="/terms" className="text-[#E50914] hover:text-red-400 transition-colors">
              Terms of Service
            </a>
            {" • "}
            <a href="/privacy" className="text-[#E50914] hover:text-red-400 transition-colors">
              Privacy Policy
            </a>
          </p>

          {/* Thin separator */}
          <div className="w-full h-px bg-white/8 mb-5" />

          {/* Feature icons */}
          <div className="w-full flex items-start justify-between px-1">
            {features.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex flex-col items-center gap-2 max-w-[100px]">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-[18px] h-[18px] text-[#E50914]" strokeWidth={2} />
                </div>
                <span className="text-[10.5px] text-white/40 text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure portal only runs client-side
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: window.location.href });
    } catch (error) {
      console.error("Google sign-in error", error);
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <ModalContent
          onClose={onClose}
          isLoading={isLoading}
          onSignIn={handleGoogleSignIn}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}
