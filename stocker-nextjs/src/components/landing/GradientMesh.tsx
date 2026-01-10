'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// GLSL Vertex Shader
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// GLSL Fragment Shader - Organic Gradient Mesh with Metaballs
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;

  varying vec2 vUv;

  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.4; // Faster animation

    // Background base color (dark)
    vec3 bgColor = vec3(0.047, 0.059, 0.102); // #0c0f1a

    // Create organic blob shapes using noise
    float blob1 = snoise(vec3(uv * 2.0 + vec2(time * 0.3, time * 0.2), time * 0.1));
    float blob2 = snoise(vec3(uv * 1.5 + vec2(-time * 0.2, time * 0.3), time * 0.15 + 10.0));
    float blob3 = snoise(vec3(uv * 2.5 + vec2(time * 0.25, -time * 0.15), time * 0.12 + 20.0));
    float blob4 = snoise(vec3(uv * 1.8 + vec2(-time * 0.15, -time * 0.25), time * 0.18 + 30.0));
    float blob5 = snoise(vec3(uv * 3.0 + vec2(time * 0.1, time * 0.1), time * 0.08 + 40.0));

    // Mouse influence
    vec2 mouseOffset = (uMouse - 0.5) * 0.3;
    float mouseDist = length(uv - 0.5 - mouseOffset);
    float mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * 0.3;

    // Combine blobs with different weights
    float combinedBlob =
      blob1 * 0.35 +
      blob2 * 0.25 +
      blob3 * 0.2 +
      blob4 * 0.15 +
      blob5 * 0.1;

    // Add mouse influence
    combinedBlob += mouseInfluence;

    // Remap to 0-1 range with smooth transition
    combinedBlob = smoothstep(-0.3, 0.6, combinedBlob);

    // Create color gradients based on blob positions
    vec3 color1 = uColor1; // Deep teal
    vec3 color2 = uColor2; // Ocean blue
    vec3 color3 = uColor3; // Indigo
    vec3 color4 = uColor4; // Purple
    vec3 color5 = uColor5; // Violet accent

    // Position-based color mixing
    float colorMix1 = smoothstep(-0.2, 0.5, blob1) * smoothstep(0.0, 1.0, uv.x);
    float colorMix2 = smoothstep(-0.2, 0.5, blob2) * smoothstep(0.0, 1.0, 1.0 - uv.x);
    float colorMix3 = smoothstep(-0.2, 0.5, blob3) * smoothstep(0.0, 1.0, uv.y);
    float colorMix4 = smoothstep(-0.2, 0.5, blob4) * smoothstep(0.0, 1.0, 1.0 - uv.y);
    float colorMix5 = smoothstep(-0.1, 0.4, blob5) * (1.0 - length(uv - 0.5));

    // Mix colors
    vec3 blobColor = bgColor;
    blobColor = mix(blobColor, color1, colorMix1 * 0.7);
    blobColor = mix(blobColor, color2, colorMix2 * 0.6);
    blobColor = mix(blobColor, color3, colorMix3 * 0.5);
    blobColor = mix(blobColor, color4, colorMix4 * 0.5);
    blobColor = mix(blobColor, color5, colorMix5 * 0.4);

    // Add glow effect at blob peaks
    float glowIntensity = pow(combinedBlob, 2.0) * 0.5;
    vec3 glowColor = mix(color2, color5, sin(time * 2.0) * 0.5 + 0.5);
    blobColor += glowColor * glowIntensity;

    // Subtle noise texture
    float noise = snoise(vec3(uv * 50.0, time * 0.5)) * 0.02;
    blobColor += noise;

    // Vignette effect (subtle darkening at edges)
    float vignette = 1.0 - length((uv - 0.5) * 1.4);
    vignette = smoothstep(0.0, 0.8, vignette);
    blobColor *= 0.7 + vignette * 0.3;

    // Final output
    gl_FragColor = vec4(blobColor, 1.0);
  }
`;

interface GradientMeshPlaneProps {
  mousePosition: React.MutableRefObject<{ x: number; y: number }>;
}

function GradientMeshPlane({ mousePosition }: GradientMeshPlaneProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Create uniforms only once - stable reference
  const uniforms = useRef({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    // Brighter, more visible colors for animation
    uColor1: { value: new THREE.Color('#1a7a9e') }, // Bright Teal
    uColor2: { value: new THREE.Color('#2980b9') }, // Bright Ocean blue
    uColor3: { value: new THREE.Color('#6c3483') }, // Bright purple
    uColor4: { value: new THREE.Color('#2471a3') }, // Bright Navy blue
    uColor5: { value: new THREE.Color('#9b59b6') }, // Bright Violet
  }).current;

  // Update resolution when viewport changes
  useEffect(() => {
    uniforms.uResolution.value.set(viewport.width, viewport.height);
  }, [viewport.width, viewport.height, uniforms]);

  // Smooth mouse following
  const targetMouse = useRef({ x: 0.5, y: 0.5 });

  useFrame(({ clock }) => {
    if (!mesh.current) return;

    // Update time uniform directly
    uniforms.uTime.value = clock.getElapsedTime();

    // Smooth mouse interpolation
    targetMouse.current.x += (mousePosition.current.x - targetMouse.current.x) * 0.03;
    targetMouse.current.y += (mousePosition.current.y - targetMouse.current.y) * 0.03;

    uniforms.uMouse.value.set(targetMouse.current.x, targetMouse.current.y);
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

interface GradientMeshProps {
  className?: string;
}

export default function GradientMesh({ className = '' }: GradientMeshProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const mousePosition = useRef({ x: 0.5, y: 0.5 });

  // Mount check for SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect mobile and WebGL support
  useEffect(() => {
    if (!isMounted) return;

    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);

      // Check WebGL support
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        setWebGLSupported(!!gl);
      } catch {
        setWebGLSupported(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [isMounted]);

  // Track mouse position
  useEffect(() => {
    if (!isMounted || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: e.clientX / window.innerWidth,
        y: 1 - e.clientY / window.innerHeight,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMounted, isMobile]);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (!isMounted) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [isMounted]);

  // Don't render anything during SSR
  if (!isMounted) {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{ background: '#0c0f1a' }}
      />
    );
  }

  // CSS Fallback for unsupported browsers or reduced motion
  if (!webGLSupported || prefersReducedMotion) {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{
          background: 'linear-gradient(135deg, #0c0f1a 0%, #0d4f6e 25%, #1a5276 50%, #4a235a 75%, #0c0f1a 100%)',
          backgroundSize: '400% 400%',
          animation: prefersReducedMotion ? 'none' : 'gradient-shift-slow 15s ease infinite',
        }}
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        zIndex: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        gl={{
          alpha: false,
          antialias: !isMobile,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        dpr={isMobile ? [1, 1] : [1, 2]}
      >
        <GradientMeshPlane mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
