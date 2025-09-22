'use client';

import { useState, useEffect } from 'react';
import { SlidingNumber } from '@/components/ui/sliding-number';

export default function ClockPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-9xl font-mono select-none">
          <div className="flex items-center justify-center gap-2">
            <SlidingNumber value={currentTime.getHours()} padStart={true} />
            <span className="text-muted-foreground animate-pulse">:</span>
            <SlidingNumber value={currentTime.getMinutes()} padStart={true} />
            <span className="text-muted-foreground animate-pulse">:</span>
            <SlidingNumber value={currentTime.getSeconds()} padStart={true} />
            <span className="text-5xl ml-6 text-muted-foreground font-light">
              {currentTime.getHours() >= 12 ? 'PM' : 'AM'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
