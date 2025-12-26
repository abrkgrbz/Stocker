'use client';

import React from 'react';

export type PulseColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';

export interface PulseIndicatorProps {
  /**
   * Color variant of the pulse
   */
  color?: PulseColor;

  /**
   * Size of the pulse indicator
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';

  /**
   * Whether to animate the pulse
   */
  animate?: boolean;

  /**
   * Optional label text
   */
  label?: string;

  className?: string;
}

const colorMap: Record<PulseColor, { bg: string; ping: string }> = {
  blue: { bg: 'bg-blue-500', ping: 'bg-blue-400' },
  green: { bg: 'bg-green-500', ping: 'bg-green-400' },
  red: { bg: 'bg-red-500', ping: 'bg-red-400' },
  yellow: { bg: 'bg-yellow-500', ping: 'bg-yellow-400' },
  purple: { bg: 'bg-purple-500', ping: 'bg-purple-400' },
  gray: { bg: 'bg-gray-500', ping: 'bg-gray-400' },
};

const sizeMap = {
  xs: { dot: 'h-1.5 w-1.5', text: 'text-xs' },
  sm: { dot: 'h-2 w-2', text: 'text-sm' },
  md: { dot: 'h-3 w-3', text: 'text-base' },
  lg: { dot: 'h-4 w-4', text: 'text-lg' },
};

export default function PulseIndicator({
  color = 'blue',
  size = 'sm',
  animate = true,
  label,
  className = '',
}: PulseIndicatorProps) {
  const colors = colorMap[color];
  const sizes = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`flex relative ${sizes.dot}`}>
        {animate && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors.ping} opacity-75`}
          ></span>
        )}
        <span
          className={`relative inline-flex rounded-full ${sizes.dot} ${colors.bg}`}
        ></span>
      </span>

      {label && (
        <span className={`${sizes.text} text-gray-700`}>
          {label}
        </span>
      )}
    </div>
  );
}
