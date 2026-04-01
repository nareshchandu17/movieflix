import { motion } from 'framer-motion';

export function BufferingSpinner({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100] bg-black/20">
      <div className="relative">
        {/* Netflix-style spinner */}
        <div className="w-12 h-12 relative">
          <motion.div
            className="absolute inset-0 border-[3px] border-transparent border-t-red-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute inset-0 border-[3px] border-transparent border-t-white/40 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute inset-0 border-[3px] border-transparent border-t-white/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "linear"
            }}
          />
        </div>
        
        {/* Loading text */}
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        >
          Loading...
        </motion.div>
      </div>
    </div>
  );
}
