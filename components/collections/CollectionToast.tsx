"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface CollectionToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

const CollectionToast: React.FC<CollectionToastProps> = ({
  message,
  isOpen,
  onClose,
  duration = 2000,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%", transition: { duration: 0.2 } }}
          className="fixed bottom-8 left-1/2 z-[100] min-w-[200px]"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-3 px-6 shadow-2xl flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </motion.div>
            <span className="text-white font-medium text-sm whitespace-nowrap">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CollectionToast;
