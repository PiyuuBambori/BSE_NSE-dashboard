import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center border-b border-gray-50"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="col-span-6 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg animate-shimmer flex-shrink-0" />
            <div className="h-4 rounded animate-shimmer flex-1 max-w-[320px]" />
          </div>
          <div className="col-span-2">
            <div className="h-5 w-14 rounded-md animate-shimmer" />
          </div>
          <div className="col-span-2">
            <div className="h-4 w-24 rounded animate-shimmer" />
          </div>
          <div className="col-span-2 flex justify-end">
            <div className="h-4 w-12 rounded animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};
export default LoadingSkeleton;
