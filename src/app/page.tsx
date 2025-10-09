'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Particles } from "@/components/magicui/particles";
import { getBalance } from "@/lib/balance";

export default function Home() {
  const [balance, setBalance] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBalance(getBalance());
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <Particles
        className="absolute inset-0"
        quantity={50}
        ease={80}
        color="#64ffda"
        refresh={false}
      />

      <div className="absolute top-4 left-4 text-white text-lg font-semibold">
        Balance: ${mounted ? balance : '...'}
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* PWA Install Notice */}
      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded text-center border border-white/10">
          add to homescreen for a better experience.
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-4">j a w n . h o s t</h1>
      <p className="text-lg mb-8">made by totonchi</p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/ride-the-bus">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
            Ride the Bus
          </Button>
        </Link>
        <Link href="/lunch">
          <Button size="lg">What's for lunch?</Button>
        </Link>
        <Link href="/venos">
          <Button size="lg">Study for Venos</Button>
        </Link>
        <Link href="/clock">
          <Button size="lg">Board Clock</Button>
        </Link>
      </div>
    </div>
  );
}
