import React from 'react';

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm animate-pulse"
        >
          {/* Cover image skeleton */}
          <div className="aspect-video bg-muted" />

          {/* Body content skeleton */}
          <div className="p-5 space-y-4 flex-1">
            <div className="h-3 bg-muted rounded w-1/4" />
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
            <div className="pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
