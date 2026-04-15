'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface DNAHelixProps {
  barCount?: number;
  colorScheme?: 'cyan' | 'lime' | 'violet' | 'mixed';
  className?: string;
}

const DNAHelix: React.FC<DNAHelixProps> = ({ 
  barCount = 20, 
  colorScheme = 'mixed',
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const bars = containerRef.current.querySelectorAll('.dna-bar');
    const nodes = containerRef.current.querySelectorAll('.dna-node');

    bars.forEach((bar, i) => {
      const delay = i * 0.1;
      
      // Animate the bar (connecting line)
      gsap.to(bar, {
        scaleY: 0,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay,
      });

      // Animate nodes (base pairs)
      const topNode = nodes[i * 2];
      const bottomNode = nodes[i * 2 + 1];

      gsap.to(topNode, {
        y: 60,
        zIndex: (i) => (Math.sin(i) > 0 ? 10 : -10),
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay,
      });

      gsap.to(bottomNode, {
        y: -60,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay,
      });
    });
  }, [barCount]);

  const getColors = (index: number) => {
    if (colorScheme === 'cyan') return ['#29D7FF', '#00E5FF'];
    if (colorScheme === 'lime') return ['#C7FF3D', '#A5FF00'];
    if (colorScheme === 'violet') return ['#7B4DFF', '#9D7BFF'];
    
    // Mixed logic
    const schemes = [
      ['#29D7FF', '#00E5FF'],
      ['#C7FF3D', '#A5FF00'],
      ['#7B4DFF', '#9D7BFF']
    ];
    return schemes[index % 3];
  };

  return (
    <div ref={containerRef} className={`flex items-center justify-between w-full h-40 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        const [c1, c2] = getColors(i);
        return (
          <div key={i} className="relative flex flex-col items-center justify-center flex-1 h-full">
            {/* Connecting Bar */}
            <div 
              className="dna-bar w-[2px] h-32 opacity-20" 
              style={{ background: `linear-gradient(to bottom, ${c1}, ${c2})` }}
            />
            
            {/* Top Node */}
            <div 
              className="dna-node absolute w-3 h-3 rounded-full blur-[1px] shadow-lg shadow-current"
              style={{ 
                backgroundColor: c1,
                top: '15%',
                boxShadow: `0 0 10px ${c1}`
              }}
            />
            
            {/* Bottom Node */}
            <div 
              className="dna-node absolute w-3 h-3 rounded-full blur-[1px] shadow-lg shadow-current"
              style={{ 
                backgroundColor: c2,
                bottom: '15%',
                boxShadow: `0 0 10px ${c2}`
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DNAHelix;
