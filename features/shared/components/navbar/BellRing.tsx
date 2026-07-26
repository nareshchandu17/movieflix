"use client";

import { motion, useAnimation } from "motion/react";
import type { Variants } from "motion/react";
import { useEffect } from "react";

interface BellRingProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
  className?: string;
  isAnimating?: boolean;
}

const bellVariants: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [-10, 10, -10],
    transition: {
      duration: 0.5,
      repeat: 2,
      repeatType: "reverse",
    },
  },
};

const ringVariants: Variants = {
  normal: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const BellRing = ({
  width = 20,
  height = 20,
  strokeWidth = 2,
  stroke = "currentColor",
  className = "",
  isAnimating = false,
  ...props
}: BellRingProps) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isAnimating) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isAnimating, controls]);

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className={className}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <motion.path
          d="M10.268 21a2 2 0 0 0 3.464 0"
          variants={bellVariants}
          animate={controls}
          initial="normal"
        />
        <motion.g variants={ringVariants} animate={controls} initial="normal">
          <path d="M22 8c0-2.3-.8-4.3-2-6" />
          <path d="M4 2C2.8 3.7 2 5.7 2 8" />
        </motion.g>
        <motion.path
          d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
          variants={bellVariants}
          animate={controls}
          initial="normal"
        />
      </svg>
    </div>
  );
};

export { BellRing };
