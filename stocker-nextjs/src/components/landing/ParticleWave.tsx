'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

interface ParticleFieldProps {
  count: number;
  mousePosition: React.MutableRefObject<{ x: number; y: number }>;
}

function ParticleField({ count, mousePosition }: ParticleFieldProps) {
  const mesh = useRef<THREE.Points>(null);
  const noise3D = useMemo(() => createNoise3D(), []);
  const { viewport } = useThree();

  // Generate initial positions
  const [positions, originalPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const origPos = new Float32Array(count * 3);

    // Create a grid-like distribution with some randomness
    const cols = Math.ceil(Math.sqrt(count * (viewport.width / viewport.height)));
    const rows = Math.ceil(count / cols);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Spread across viewport with slight randomness
      const x = ((col / cols) - 0.5) * viewport.width * 1.5 + (Math.random() - 0.5) * 0.3;
      const y = ((row / rows) - 0.5) * viewport.height * 1.5 + (Math.random() - 0.5) * 0.3;
      const z = (Math.random() - 0.5) * 2;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      origPos[i * 3] = x;
      origPos[i * 3 + 1] = y;
      origPos[i * 3 + 2] = z;
    }

    return [pos, origPos];
  }, [count, viewport.width, viewport.height]);

  // Animate particles
  useFrame(({ clock }) => {
    if (!mesh.current) return;

    const time = clock.getElapsedTime() * 0.15; // Slow movement
    const positionAttribute = mesh.current.geometry.attributes.position;
    const posArray = positionAttribute.array as Float32Array;

    // Convert mouse position to world coordinates
    const mouseX = (mousePosition.current.x - 0.5) * viewport.width;
    const mouseY = -(mousePosition.current.y - 0.5) * viewport.height;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const origX = originalPositions[i3];
      const origY = originalPositions[i3 + 1];
      const origZ = originalPositions[i3 + 2];

      // Simplex noise based wave motion
      const noiseScale = 0.3;
      const noiseX = noise3D(origX * noiseScale, origY * noiseScale, time);
      const noiseY = noise3D(origX * noiseScale + 100, origY * noiseScale + 100, time);

      // Wave effect
      const waveAmplitude = 0.15;
      const waveX = noiseX * waveAmplitude;
      const waveY = noiseY * waveAmplitude;

      // Mouse interaction - subtle repulsion
      const dx = origX - mouseX;
      const dy = origY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mouseRadius = 2.5;
      const mouseStrength = 0.3;

      let mouseOffsetX = 0;
      let mouseOffsetY = 0;

      if (dist < mouseRadius) {
        const force = (1 - dist / mouseRadius) * mouseStrength;
        mouseOffsetX = (dx / dist) * force;
        mouseOffsetY = (dy / dist) * force;
      }

      // Apply all transformations
      posArray[i3] = origX + waveX + mouseOffsetX;
      posArray[i3 + 1] = origY + waveY + mouseOffsetY;
      posArray[i3 + 2] = origZ + noise3D(origX * noiseScale, origY * noiseScale, time + 50) * 0.1;
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#94a3b8" // slate-400
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

interface ParticleWaveProps {
  className?: string;
}

export default function ParticleWave({ className = '' }: ParticleWaveProps) {
  const [isMobile, setIsMobile] = useState(false);
  const mousePosition = useRef({ x: 0.5, y: 0.5 });

  // Detect mobile for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particle count based on device
  const particleCount = isMobile ? 800 : 2000;

  return (
    <div className={`absolute inset-0 ${className}`} style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
      >
        <ParticleField count={particleCount} mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
