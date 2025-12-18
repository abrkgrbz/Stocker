import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  variant?: 'black' | 'white' | 'auto'
  className?: string
}

export default function Logo({ size = 'md', variant = 'black', className = '' }: LogoProps) {
  const sizes = {
    sm: { width: 100, height: 32 },
    md: { width: 120, height: 40 },
    lg: { width: 140, height: 46 },
    xl: { width: 160, height: 52 },
    '2xl': { width: 180, height: 58 },
    '3xl': { width: 200, height: 65 }
  }

  const { width, height } = sizes[size]

  // Select logo based on variant
  const logoSrc = variant === 'white' ? '/stoocker_white.png' : '/stoocker_black.png'

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Image
        src={logoSrc}
        alt="Stoocker"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  )
}
