"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CollectionItemProps {
  name: string;
  isSaved: boolean;
  onToggle: () => void;
  isUpdating?: boolean;
}

const CollectionItem: React.FC<CollectionItemProps> = ({
  name,
  isSaved,
  onToggle,
  isUpdating = false,
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={isUpdating}
      className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between group rounded-lg ${
        isSaved ? "bg-white/5" : ""
      }`}
    >
      <span className={`text-sm font-medium ${isSaved ? "text-primary" : "text-gray-300 group-hover:text-white"}`}>
        {name}
      </span>
      <div className="flex items-center justify-center w-5 h-5">
        {isUpdating ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : (
          <AnimatePresence>
            {isSaved && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="w-5 h-5 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </button>
  );
};

export default CollectionItem;
