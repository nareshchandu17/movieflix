import React from "react";

interface TextSegment {
  text: string;
  isPrimary?: boolean;
  className?: string;
}

interface PageTitleProps {
  segments: TextSegment[];
  subtitle?: string;
  className?: string;
}

const PageTitle = ({ segments, subtitle, className = "" }: PageTitleProps) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 py-8 px-4 ${className}`}>
      <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-bold tracking-tight">
        {segments.map((segment, index) => (
          <span 
            key={index} 
            className={segment.className || (segment.isPrimary ? "text-primary" : "")}
          >
            {segment.text}
          </span>
        ))}
      </h1>
      {subtitle && (
        <p className="text-gray-400 text-base sm:text-lg md:text-xl text-center max-w-2xl font-medium animate-in fade-in slide-in-from-bottom-2 duration-700">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageTitle;
