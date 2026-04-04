/**
 * Smooth scrolling utility for buttery carousel experience
 * Similar to Netflix/Hotstar scrolling behavior
 */

export interface SmoothScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
}

export const createSmoothScroll = (
  container: HTMLElement,
  direction: "left" | "right",
  scrollAmount: number,
  options: SmoothScrollOptions = {}
) => {
  const {
    duration = 400,
    easing = easeInOutCubic
  } = options;

  if (!container) return;

  const startTime = performance.now();
  const startX = container.scrollLeft;
  const targetX = startX + (direction === "left" ? -scrollAmount : scrollAmount);

  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply easing function
    const easedProgress = easing(progress);
    const currentX = startX + (targetX - startX) * easedProgress;
    
    container.scrollLeft = currentX;
    
    // Continue animation until complete
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

/**
 * Cubic ease-in-out function for smooth acceleration and deceleration
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

/**
 * Enhanced scroll function for React components
 */
export const useSmoothScroll = (
  containerRef: React.RefObject<HTMLElement>,
  cardWidth: number,
  gap: number = 12
) => {
  return (direction: "left" | "right") => {
    if (!containerRef.current) return;
    
    const scrollAmount = cardWidth * 2 + gap;
    createSmoothScroll(containerRef.current, direction, scrollAmount);
  };
};
