import React from "react";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: boolean; // For search results that need min-h-screen
}

const ResponsiveGrid = ({
  children,
  className = "",
  minHeight = false,
}: ResponsiveGridProps) => {
  const baseClasses =
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 py-4 px-4 md:px-8";
  const heightClass = minHeight ? "min-h-screen" : "";

  return (
    <div className={`${baseClasses} ${heightClass} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
