'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Fixed particle positions to avoid hydration mismatch
const particlePositions = [
  { left: 10, top: 20, delay: 0 },
  { left: 25, top: 45, delay: 0.5 },
  { left: 40, top: 15, delay: 1 },
  { left: 55, top: 70, delay: 1.5 },
  { left: 70, top: 30, delay: 2 },
  { left: 85, top: 60, delay: 2.5 },
  { left: 15, top: 80, delay: 3 },
  { left: 45, top: 90, delay: 3.5 },
  { left: 75, top: 50, delay: 4 },
  { left: 90, top: 25, delay: 4.5 },
  { left: 5, top: 55, delay: 0.3 },
  { left: 35, top: 35, delay: 0.8 },
  { left: 60, top: 10, delay: 1.3 },
  { left: 80, top: 85, delay: 1.8 },
  { left: 20, top: 65, delay: 2.3 },
  { left: 50, top: 25, delay: 2.8 },
  { left: 65, top: 75, delay: 3.3 },
  { left: 30, top: 95, delay: 3.8 },
  { left: 95, top: 40, delay: 4.3 },
  { left: 12, top: 8, delay: 4.8 },
];

export default function AnimatedBackground() {
  // Delay animations until after hydration to prevent flicker
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth initial render
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Static gradient orbs - always visible */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-500/30 rounded-full blur-3xl" />
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/25 rounded-full blur-3xl" />

      {/* Animated overlays - only after mount to prevent flicker */}
      {isMounted && (
        <>
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gray-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/25 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />

          {/* Floating Particles */}
          {particlePositions.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gray-400/40 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              initial={{ opacity: 0 }}
              animate={{
                y: [0, -100, 0],
                x: [0, (i % 2 === 0 ? 20 : -20), 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 5 + (i % 3) * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: particle.delay,
              }}
            />
          ))}
        </>
      )}

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Radial Gradient Overlay - Using inline style for radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(17, 24, 39, 0.5) 50%, rgb(17, 24, 39) 100%)'
        }}
      />
    </div>
  );
}
