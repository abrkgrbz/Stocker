'use client';

import React from 'react';
import { Badge } from 'antd';

export interface LiveBadgeProps {
  /**
   * Whether the data is currently live/real-time
   */
  isLive?: boolean;

  /**
   * Text to display when live
   */
  liveText?: string;

  /**
   * Text to display when not live
   */
  staticText?: string;

  /**
   * Show text alongside the badge
   */
  showText?: boolean;

  /**
   * Size of the badge
   */
  size?: 'small' | 'default';

  className?: string;
}

export default function LiveBadge({
  isLive = true,
  liveText = 'Canlı',
  staticText = 'Statik',
  showText = true,
  size = 'default',
  className = '',
}: LiveBadgeProps) {
  if (!showText) {
    return (
      <Badge
        status={isLive ? 'processing' : 'default'}
        className={className}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="relative flex items-center">
        {/* Pulsing dot */}
        <span
          className={`flex h-2 w-2 relative ${isLive ? '' : 'opacity-40'}`}
        >
          {isLive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isLive ? 'bg-red-500' : 'bg-gray-400'
            }`}
          ></span>
        </span>
      </div>

      <span
        className={`font-medium ${
          size === 'small' ? 'text-xs' : 'text-sm'
        } ${
          isLive
            ? 'text-red-600'
            : 'text-gray-500'
        }`}
      >
        {isLive ? liveText : staticText}
      </span>
    </div>
  );
}
