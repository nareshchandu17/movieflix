"use client";

import { motion } from "framer-motion";

interface ArcPoint {
  x: number;
  y: number;
  emotion: string;
  stability: number;
  power: number;
}

interface InflectionMarker {
  x: number;
  y: number;
  type: string;
  description: string;
}

interface ArcChartProps {
  points: ArcPoint[];
  inflections: InflectionMarker[];
  activePoint?: number;
  onPointHover: (index: number | null) => void;
}

export default function ArcChart({ points, inflections, activePoint, onPointHover }: ArcChartProps) {
  // SVG Bounds: 0-100 for X, -10 to 10 for Y
  // We map Y from [-10, 10] to [90, 10] in SVG space
  const mapY = (y: number) => 50 - (y * 4); // Center at 50, range 10 to 90

  const pathData = points.length > 0 
    ? `M ${points[0].x} ${mapY(points[0].y)} ` + 
      points.slice(1).map(p => `L ${p.x} ${mapY(p.y)}`).join(" ")
    : "";

  return (
    <div className="relative w-full aspect-[21/9] bg-black/40 rounded-3xl border border-white/5 p-8 overflow-hidden">
      {/* Grid Lines */}
      <div className="absolute inset-x-8 inset-y-8 flex flex-col justify-between pointer-events-none opacity-10">
        {[2, 1, 0, -1, -2].map(v => (
          <div key={v} className="h-px w-full bg-white flex items-center">
            <span className="text-[10px] ml-[-24px] uppercase font-bold">{v > 0 ? `+${v}` : v}</span>
          </div>
        ))}
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {/* Main Arc Path */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d={pathData}
          fill="none"
          stroke="url(#arcGradient)"
          strokeWidth="1.5"
          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />

        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Inflection Points */}
        {inflections.map((inf, i) => (
          <g key={i} className="cursor-help group">
            <circle
              cx={inf.x}
              cy={mapY(inf.y)}
              r="1.2"
              className="fill-white stroke-blue-500 stroke-[0.3]"
            />
            <circle
              cx={inf.x}
              cy={mapY(inf.y)}
              r="3"
              className="fill-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </g>
        ))}

        {/* Interactive Hover Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={mapY(p.y)}
            r="4"
            className="fill-transparent cursor-pointer"
            onMouseEnter={() => onPointHover(i)}
            onMouseLeave={() => onPointHover(null)}
          />
        ))}

        {/* Active Indicator */}
        {activePoint !== null && activePoint !== undefined && (
          <motion.circle
            cx={points[activePoint].x}
            cy={mapY(points[activePoint].y)}
            r="1.5"
            className="fill-white shadow-xl"
            layoutId="activeCircle"
          />
        )}
      </svg>
      
      {/* Legend */}
      <div className="absolute top-4 right-8 flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[10px] uppercase font-bold text-white/40">Moral Alignment</span>
        </div>
      </div>
    </div>
  );
}
