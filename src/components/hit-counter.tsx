'use client';

import { useEffect, useState } from 'react';
import { SlidingNumber } from '@/components/ui/sliding-number';

export function HitCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize counter from localStorage or start at 0
    const storedCount = localStorage.getItem('hit-counter');
    const initialCount = storedCount ? parseInt(storedCount, 10) : 0;
    setCount(initialCount);
    setIsLoading(false);

    // Increment counter
    const newCount = initialCount + 1;
    setCount(newCount);
    localStorage.setItem('hit-counter', newCount.toString());
  }, []);

  if (isLoading || count === null) {
    return (
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-white/10">
          <div className="w-8 h-4 bg-white/10 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-white/10">
        <div className="flex items-center gap-1">
          <span className="text-white/70">hits:</span>
          <SlidingNumber
            value={count}
            padStart={true}
          />
        </div>
      </div>
    </div>
  );
}
