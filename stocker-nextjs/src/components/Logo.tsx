import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = false, className = '' }: LogoProps) {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 120, height: 120 }
  }

  const { width, height } = sizes[size]

  // If showText is true, use the full logo with text
  // Otherwise use just the icon portion
  if (showText) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Image
          src="/logo.png"
          alt="Stocker"
          width={width * 3}
          height={height * 3}
          priority
          className="object-contain"
        />
      </div>
    )
  }

  // For icon-only, we'll crop to just the cube portion (65% from top to exclude text)
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div style={{ width, height }} className="relative overflow-hidden">
        <Image
          src="/logo.png"
          alt="Stocker"
          width={width}
          height={width}
          priority
          className="object-cover"
          style={{
            objectPosition: 'center 35%',
          }}
        />
      </div>
    </div>
  )
}
