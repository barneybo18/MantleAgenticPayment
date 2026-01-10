"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef, useCallback } from "react";
import { ParticleNetwork, ParticleNetworkRef } from "@/components/ParticleNetwork";

export default function Home() {
  const particleRef = useRef<ParticleNetworkRef>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (buttonRef.current && particleRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      // Ring radius = button width + some padding
      const radius = Math.max(rect.width, rect.height) / 2 + 60;
      particleRef.current.setRingTarget(centerX, centerY, radius);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (particleRef.current) {
      particleRef.current.clearRingTarget();
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-hidden">
      {/* Particle Network Background */}
      <ParticleNetwork ref={particleRef} />

      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 max-w-2xl px-6">
        <div className="flex items-center justify-center">
          <div className="size-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg shadow-primary/20">
            AP
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-linear-to-tr from-foreground to-muted-foreground">
          AgentPay
        </h1>
        <p className="text-xl text-muted-foreground">
          Autonomous agents for your decentralized payments. Schedule, automate, and relax on Mantle Network.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button
            size="lg"
            className="rounded-full shadow-xl shadow-primary/20 relative z-20"
            asChild
          >
            <Link
              ref={buttonRef}
              href="/dashboard"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              Launch App <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full relative z-20" asChild>
            <a href="https://docs.mantle.xyz" target="_blank" rel="noopener noreferrer">
              Learn about Mantle
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
