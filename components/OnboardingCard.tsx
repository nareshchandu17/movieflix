"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import StepProfile from "./StepProfile";
import StepGenres from "./StepGenres";
import StepMood from "./StepMood";

interface OnboardingData {
  username: string;
  dob: string;
  phone: string;
  interests: string[];
  moods: string[];
}

interface OnboardingCardProps {
  onComplete?: () => void;
}

export default function OnboardingCard({ onComplete }: OnboardingCardProps) {
  const router = useRouter();
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    username: "",
    dob: "",
    phone: "",
    interests: [],
    moods: [],
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboardingData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Welcome to CineWorld! 🎬");
        
        // Update the session to reflect onboarding completion
        await update();
        
        if (onComplete) {
          onComplete();
        } else {
          router.push("/");
        }
      } else {
        toast.error(data.message || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Onboarding submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.username.trim() !== "" && onboardingData.dob !== "";
      case 2:
        return onboardingData.interests.length >= 3;
      case 3:
        return true; // Mood is optional
      default:
        return false;
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    if (newDirection > 0 && !isStepValid()) return;
    setPage([page + newDirection, newDirection]);
    setCurrentStep(currentStep + newDirection);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  currentStep >= step
                    ? "bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-lg shadow-red-500/25"
                    : "bg-white/10 text-white/40 border border-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {step}
              </motion.div>
              {step < 3 && (
                <motion.div
                  className={`w-12 h-0.5 mx-2 transition-all duration-500 ${
                    currentStep > step
                      ? "bg-gradient-to-br from-red-500 via-red-600 to-red-800"
                      : "bg-white/20"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: currentStep > step ? 48 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <h2 className="text-white/60 text-sm">
            Step {currentStep} of 3
          </h2>
        </div>
      </div>

      {/* Onboarding Card */}
      <motion.div
        className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ 
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          borderColor: "rgba(255, 255, 255, 0.2)"
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-600/10 to-red-800/10 opacity-50" />
        
        {/* Content */}
        <div className="relative z-10 p-8">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="min-h-[400px]"
            >
              {currentStep === 1 && (
                <StepProfile
                  data={onboardingData}
                  updateData={updateData}
                />
              )}
              {currentStep === 2 && (
                <StepGenres
                  data={onboardingData}
                  updateData={updateData}
                />
              )}
              {currentStep === 3 && (
                <StepMood
                  data={onboardingData}
                  updateData={updateData}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <motion.button
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentStep === 1
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
              whileHover={currentStep > 1 ? { scale: 1.02 } : {}}
              whileTap={currentStep > 1 ? { scale: 0.98 } : {}}
            >
              ← Back
            </motion.button>

            <motion.button
              onClick={currentStep === 3 ? handleSubmit : () => paginate(1)}
              disabled={!isStepValid() || isSubmitting}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isStepValid() && !isSubmitting
                  ? "bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:scale-105"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
              whileHover={isStepValid() && !isSubmitting ? { scale: 1.02 } : {}}
              whileTap={isStepValid() && !isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  <span>Processing...</span>
                </div>
              ) : currentStep === 3 ? (
                "Finish Setup →"
              ) : (
                "Continue →"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Skip for development - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/")}
            className="text-white/30 hover:text-white/50 text-sm underline"
          >
            Skip onboarding (dev only)
          </button>
        </div>
      )}
    </div>
  );
}
