"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Loader2, X } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profileName: string;
}

export default function PinModal({ isOpen, onClose, onSuccess, profileName }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleVerify = async (submittedPin: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/account/pin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: submittedPin }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Incorrect PIN. Try again.");
        setPin("");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length === 4) {
      handleVerify(pin);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const onDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        handleVerify(newPin);
      }
    }
  };

  const onBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-[400px] bg-[#141414] border border-[#333] rounded-2xl p-8 flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#888] hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-[#E50914]" />
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Profile Lock is On</h3>
              <p className="text-[#888] text-sm leading-relaxed">
                Enter your 4-digit PIN to access <span className="text-white font-semibold">{profileName}</span>.
              </p>
            </div>

            {/* PIN Display Dots */}
            <div className="flex gap-4 my-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    pin[i]
                      ? "bg-white border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      : "border-[#333] bg-transparent"
                  }`}
                />
              ))}
            </div>

            {/* Error Message */}
            <div className="h-6 flex items-center">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm font-medium"
                >
                  {error}
                </motion.p>
              )}
              {isVerifying && (
                <Loader2 className="w-5 h-5 text-[#E50914] animate-spin" />
              )}
            </div>

            {/* Hidden Input for Keyboard support */}
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setPin(val);
                if (val.length === 4) handleVerify(val);
              }}
              onKeyDown={handleKeyDown}
              className="absolute opacity-0 pointer-events-none"
            />

            {/* Numerical Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => onDigitClick(num.toString())}
                  className="w-full aspect-square bg-[#1f1f1f] border border-[#333] rounded-xl text-xl font-bold text-white hover:bg-[#333] active:bg-[#e50914] transition-all"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                onClick={() => onDigitClick("0")}
                className="w-full aspect-square bg-[#1f1f1f] border border-[#333] rounded-xl text-xl font-bold text-white hover:bg-[#333] active:bg-[#e50914] transition-all"
              >
                0
              </button>
              <button
                onClick={onBackspace}
                className="w-full aspect-square bg-[#1f1f1f] border border-[#333] rounded-xl text-xl font-bold text-white hover:bg-[#333] active:bg-white/10 transition-all flex items-center justify-center"
              >
                <div className="w-6 h-1 bg-white/50 rounded-full" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-[#666] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
