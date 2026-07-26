"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Loader2, Check, X, ShieldCheck } from "lucide-react";

interface PinSettingsProps {
  profileId: string;
  profileName: string;
  pinEnabled: boolean;
  onPinChanged: () => void; // callback to refresh profiles
}

type Step = "idle" | "setting" | "confirming" | "removing";

export default function PinSettings({
  profileId,
  profileName,
  pinEnabled,
  onPinChanged,
}: PinSettingsProps) {
  const [step, setStep] = useState<Step>("idle");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState(""); // for removal
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== "idle") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [step]);

  const reset = useCallback(() => {
    setStep("idle");
    setPin("");
    setConfirmPin("");
    setCurrentPin("");
    setError(null);
  }, []);

  const handleSetPin = useCallback(async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      setConfirmPin("");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/profiles/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, pin }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("PIN set successfully!");
        setTimeout(() => {
          setSuccess(null);
          reset();
          onPinChanged();
        }, 1500);
      } else {
        setError(data.error || "Failed to set PIN");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pin, confirmPin, profileId, onPinChanged, reset]);

  const handleRemovePin = useCallback(async () => {
    if (!currentPin || currentPin.length !== 4) {
      setError("Enter your current 4-digit PIN");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/profiles/remove-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, currentPin }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("PIN removed successfully!");
        setTimeout(() => {
          setSuccess(null);
          reset();
          onPinChanged();
        }, 1500);
      } else {
        setError(data.error || "Failed to remove PIN");
        setCurrentPin("");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPin, profileId, onPinChanged, reset]);

  const renderPinInput = (
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    onSubmit?: () => void
  ) => (
    <div className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            onChange(val);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.length === 4 && onSubmit) {
              onSubmit();
            }
            if (e.key === "Escape") reset();
          }}
          placeholder={placeholder}
          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-center text-lg tracking-[0.5em] font-mono placeholder:tracking-normal placeholder:text-[#555] placeholder:text-sm focus:outline-none focus:border-[#E50914]/40 focus:bg-white/[0.06] transition-all"
        />
        {/* PIN dots overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none">
          {value.length > 0 && (
            <div className="flex gap-3">
              {Array.from(value).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-white"
                />
              ))}
              {Array.from({ length: 4 - value.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-3 h-3 rounded-full border border-[#444]"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Current PIN status */}
      <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            pinEnabled
              ? "bg-[#E50914]/10 border border-[#E50914]/20"
              : "bg-white/[0.04] border border-white/[0.08]"
          }`}>
            {pinEnabled ? (
              <Lock className="w-5 h-5 text-[#E50914]" />
            ) : (
              <Unlock className="w-5 h-5 text-[#666]" />
            )}
          </div>
          <div>
            <p className="text-white text-sm font-medium">Profile PIN Lock</p>
            <p className="text-[#666] text-xs">
              {pinEnabled ? "PIN protection is active" : "No PIN set"}
            </p>
          </div>
        </div>

        {step === "idle" && !success && (
          <button
            onClick={() => {
              setError(null);
              if (pinEnabled) {
                setStep("removing");
              } else {
                setStep("setting");
              }
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              pinEnabled
                ? "bg-white/[0.06] text-red-400 hover:bg-red-500/10 border border-white/[0.08]"
                : "bg-[#E50914] text-white hover:bg-[#f40612]"
            }`}
            id="pin-settings-toggle"
          >
            {pinEnabled ? "Remove" : "Set PIN"}
          </button>
        )}
      </div>

      {/* Expanded PIN entry */}
      <AnimatePresence>
        {step !== "idle" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {/* Set PIN flow */}
              {step === "setting" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-[#888] text-xs">Enter a 4-digit PIN for <span className="text-white">{profileName}</span></p>
                  {renderPinInput(pin, setPin, "Enter new PIN", () => {
                    if (pin.length === 4) setStep("confirming");
                  })}
                  {pin.length === 4 && (
                    <button
                      onClick={() => setStep("confirming")}
                      className="w-full py-2.5 bg-[#E50914] text-white rounded-lg text-sm font-bold hover:bg-[#f40612] transition-colors"
                    >
                      Continue
                    </button>
                  )}
                </motion.div>
              )}

              {/* Confirm PIN flow */}
              {step === "confirming" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-[#888] text-xs">Confirm your PIN</p>
                  {renderPinInput(confirmPin, setConfirmPin, "Re-enter PIN", handleSetPin)}
                  {confirmPin.length === 4 && (
                    <button
                      onClick={handleSetPin}
                      disabled={loading}
                      className="w-full py-2.5 bg-[#E50914] text-white rounded-lg text-sm font-bold hover:bg-[#f40612] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Set PIN
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              )}

              {/* Remove PIN flow */}
              {step === "removing" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-[#888] text-xs">Enter current PIN to remove</p>
                  {renderPinInput(currentPin, setCurrentPin, "Current PIN", handleRemovePin)}
                  {currentPin.length === 4 && (
                    <button
                      onClick={handleRemovePin}
                      disabled={loading}
                      className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Remove PIN"
                      )}
                    </button>
                  )}
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-xs text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Success */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 text-emerald-400 text-sm"
                >
                  <Check className="w-4 h-4" />
                  {success}
                </motion.div>
              )}

              {/* Cancel */}
              {!success && (
                <button
                  onClick={reset}
                  className="w-full text-center text-[#666] text-xs hover:text-white transition-colors py-1"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
