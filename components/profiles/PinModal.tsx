"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Loader2, X, ShieldAlert } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  profileName: string;
  profileId?: string;
}

export default function PinModal({ isOpen, onClose, onSuccess, profileName, profileId }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(null);
      setShake(false);
      setAttemptsRemaining(null);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockedUntil) {
      setLockCountdown(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil.getTime() - Date.now()) / 1000));
      setLockCountdown(remaining);

      if (remaining <= 0) {
        setLockedUntil(null);
        setError(null);
        setAttemptsRemaining(null);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  const handleVerify = useCallback(async (submittedPin: string) => {
    if (!profileId) {
      setError("Profile ID required for validation.");
      return;
    }

    if (lockedUntil && lockedUntil.getTime() > Date.now()) {
      return; // Still locked
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/profiles/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, pin: submittedPin }),
      });
      const data = await res.json();

      if (data.success) {
        // Success — pass the verified PIN back to parent
        onSuccess(submittedPin);
      } else if (data.locked) {
        // Locked out
        const lockTime = data.lockedUntil ? new Date(data.lockedUntil) : new Date(Date.now() + (data.remainingSeconds || 30) * 1000);
        setLockedUntil(lockTime);
        setError(data.error || "Too many attempts. Profile locked.");
        setPin("");
        triggerShake();
      } else {
        // Wrong PIN
        setError(data.error || "Incorrect PIN. Try again.");
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        setPin("");
        triggerShake();
      }
    } catch {
      setError("Connection error. Please try again.");
      setPin("");
    } finally {
      setIsVerifying(false);
    }
  }, [profileId, lockedUntil, onSuccess, triggerShake]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length === 4) {
      handleVerify(pin);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const onDigitClick = useCallback((digit: string) => {
    if (lockedUntil && lockedUntil.getTime() > Date.now()) return;
    if (isVerifying) return;

    setPin(prev => {
      if (prev.length >= 4) return prev;
      const newPin = prev + digit;
      if (newPin.length === 4) {
        // Use setTimeout to let state update visually before verifying
        setTimeout(() => handleVerify(newPin), 200);
      }
      return newPin;
    });
  }, [lockedUntil, isVerifying, handleVerify]);

  const onBackspace = useCallback(() => {
    if (isVerifying) return;
    setPin(prev => prev.slice(0, -1));
  }, [isVerifying]);

  const isLocked = lockCountdown > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-[420px] bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-white/[0.08] rounded-2xl p-8 flex flex-col items-center gap-5 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#666] hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
              aria-label="Close PIN modal"
              id="pin-modal-close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lock icon */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isLocked
                  ? "bg-red-500/10 border border-red-500/20"
                  : "bg-[#E50914]/10 border border-[#E50914]/20"
              }`}
            >
              {isLocked ? (
                <ShieldAlert className="w-8 h-8 text-red-400" />
              ) : (
                <Lock className="w-8 h-8 text-[#E50914]" />
              )}
            </motion.div>

            {/* Title */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1.5">
                {isLocked ? "Profile Locked" : "Profile Lock"}
              </h3>
              <p className="text-[#888] text-sm leading-relaxed">
                {isLocked ? (
                  <>Too many attempts.</>
                ) : (
                  <>
                    Enter PIN to access{" "}
                    <span className="text-white font-semibold">{profileName}</span>
                  </>
                )}
              </p>
            </div>

            {/* PIN dots with shake animation */}
            <motion.div
              className="flex gap-4 my-2"
              animate={shake ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className={`w-[14px] h-[14px] rounded-full border-2 transition-all duration-200 ${
                    pin[i]
                      ? isLocked
                        ? "bg-red-400 border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.4)]"
                        : "bg-white border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                      : "border-[#444] bg-transparent"
                  }`}
                  animate={pin[i] ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.15 }}
                />
              ))}
            </motion.div>

            {/* Error / Status area */}
            <div className="h-10 flex flex-col items-center justify-center">
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-1"
                >
                  <p className="text-red-400 text-sm font-medium">
                    Try again in {lockCountdown}s
                  </p>
                  {/* Lockout progress bar */}
                  <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500/60 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: lockCountdown, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              )}

              {!isLocked && error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm font-medium text-center"
                >
                  {error}
                </motion.p>
              )}

              {!isLocked && attemptsRemaining !== null && attemptsRemaining <= 2 && !error && (
                <p className="text-amber-400/80 text-xs">
                  {attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} remaining
                </p>
              )}

              {isVerifying && (
                <Loader2 className="w-5 h-5 text-[#E50914] animate-spin" />
              )}
            </div>

            {/* Hidden keyboard input */}
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                if (isLocked || isVerifying) return;
                const val = e.target.value.replace(/[^0-9]/g, "");
                setPin(val);
                if (val.length === 4) {
                  setTimeout(() => handleVerify(val), 200);
                }
              }}
              onKeyDown={handleKeyDown}
              className="absolute opacity-0 pointer-events-none"
              aria-label="Enter PIN"
              id="pin-modal-input"
            />

            {/* Numeric Keypad */}
            <div className={`grid grid-cols-3 gap-2.5 w-full max-w-[260px] ${isLocked ? "opacity-30 pointer-events-none" : ""}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <motion.button
                  key={num}
                  type="button"
                  onClick={() => onDigitClick(num.toString())}
                  whileTap={{ scale: 0.9 }}
                  disabled={isLocked || isVerifying}
                  className="w-full aspect-square bg-white/[0.04] border border-white/[0.08] rounded-xl text-xl font-semibold text-white hover:bg-white/[0.08] active:bg-[#E50914]/80 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  id={`pin-key-${num}`}
                >
                  {num}
                </motion.button>
              ))}
              {/* Empty spacer */}
              <div />
              {/* Zero */}
              <motion.button
                type="button"
                onClick={() => onDigitClick("0")}
                whileTap={{ scale: 0.9 }}
                disabled={isLocked || isVerifying}
                className="w-full aspect-square bg-white/[0.04] border border-white/[0.08] rounded-xl text-xl font-semibold text-white hover:bg-white/[0.08] active:bg-[#E50914]/80 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                id="pin-key-0"
              >
                0
              </motion.button>
              {/* Backspace */}
              <motion.button
                type="button"
                onClick={onBackspace}
                whileTap={{ scale: 0.9 }}
                disabled={isLocked || isVerifying}
                className="w-full aspect-square bg-white/[0.04] border border-white/[0.08] rounded-xl text-xl font-semibold text-white hover:bg-white/[0.08] active:bg-white/10 transition-all duration-150 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                id="pin-key-backspace"
                aria-label="Backspace"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </motion.button>
            </div>

            {/* Cancel button */}
            <button
              onClick={onClose}
              className="text-[#555] text-[11px] font-bold uppercase tracking-[2px] hover:text-white transition-colors mt-1"
              id="pin-modal-cancel"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
