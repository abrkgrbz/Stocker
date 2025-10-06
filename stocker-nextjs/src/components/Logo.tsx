import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'gradient' | 'white'
  className?: string
}

export default function Logo({ size = 'md', showText = true, variant = 'gradient', className = '' }: LogoProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-lg' },
    md: { container: 'w-10 h-10', text: 'text-2xl' },
    lg: { container: 'w-12 h-12', text: 'text-3xl' }
  }

  const isWhite = variant === 'white'

  return (
    <div className={`inline-flex items-center space-x-3 ${className}`}>
      {/* 3D Cube Icon */}
      <div className={`${sizes[size].container} relative`}>
        <svg viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id={`logoGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {isWhite ? (
                <>
                  <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#f0f0f0', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
                </>
              ) : (
                <>
                  <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Background glow */}
          <circle cx="38" cy="38" r="38" fill={`url(#logoGradient-${variant})`} opacity={isWhite ? '0.2' : '0.15'}/>

          {/* 3D Cube - Front face */}
          <path d="M 38 20 L 58 30 L 58 50 L 38 60 Z"
                fill={`url(#logoGradient-${variant})`}
                opacity="0.9"/>

          {/* 3D Cube - Top face */}
          <path d="M 38 20 L 58 30 L 38 40 L 18 30 Z"
                fill={`url(#logoGradient-${variant})`}
                opacity="1"/>

          {/* 3D Cube - Left face */}
          <path d="M 38 20 L 18 30 L 18 50 L 38 60 Z"
                fill={`url(#logoGradient-${variant})`}
                opacity="0.7"/>

          {/* Energy lines */}
          <line x1="38" y1="15" x2="38" y2="5" stroke={isWhite ? '#ffffff' : '#ec4899'} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
          <line x1="63" y1="28" x2="70" y2="25" stroke={isWhite ? '#ffffff' : '#ec4899'} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
          <line x1="13" y1="28" x2="6" y2="25" stroke={isWhite ? '#ffffff' : '#6366f1'} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>

          {/* Center glow point */}
          <circle cx="38" cy="40" r="4" fill="#ffffff" opacity={isWhite ? '1' : '0.9'}/>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span className={`${sizes[size].text} font-bold ${isWhite ? 'text-white' : 'text-gray-900'}`}>
          Stoocker
        </span>
      )}
    </div>
  )
}
