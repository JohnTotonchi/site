'use client';

import { useState, useEffect } from 'react';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { Particles } from '@/components/magicui/particles';
import { Button } from '@/components/ui/button';

export default function ClockPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAll, setShowAll] = useState(false);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert 24-hour to 12-hour format
  const get12HourFormat = (hour: number): number => {
    if (hour === 0) return 12;
    if (hour <= 12) return hour;
    return hour - 12;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={30}
        ease={60}
        color="#ff6b6b"
        refresh={false}
      />
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 opacity-50 hover:opacity-100"
        onClick={() => setShowAll(!showAll)}
      >
        👁
      </Button>
      <div className="text-center">
        <div className="text-9xl font-mono select-none">
          <div className="flex items-center justify-center gap-2">
            <SlidingNumber value={get12HourFormat(currentTime.getHours())} padStart={true} showAll={showAll} maxValue={12} />
            <span className="text-muted-foreground animate-pulse">:</span>
            <SlidingNumber value={currentTime.getMinutes()} padStart={true} showAll={showAll} maxValue={59} />
            <span className="text-muted-foreground animate-pulse">:</span>
            <SlidingNumber value={currentTime.getSeconds()} padStart={true} showAll={showAll} maxValue={59} />
            <span className="text-5xl ml-6 text-muted-foreground font-light">
              {currentTime.getHours() >= 12 ? 'PM' : 'AM'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
