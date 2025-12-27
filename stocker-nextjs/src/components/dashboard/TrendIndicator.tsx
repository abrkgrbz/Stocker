'use client';

import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface TrendIndicatorProps {
  value: number;
  percentage: number;
  direction?: TrendDirection;
  showPercentage?: boolean;
  size?: 'small' | 'default' | 'large';
  reverseColors?: boolean; // For cases where down is good (e.g., costs)
}

export default function TrendIndicator({
  value,
  percentage,
  direction,
  showPercentage = true,
  size = 'default',
  reverseColors = false,
}: TrendIndicatorProps) {
  // Auto-detect direction if not provided
  const trendDirection: TrendDirection = direction || (value > 0 ? 'up' : value < 0 ? 'down' : 'neutral');

  // Determine if this is a positive trend
  const isPositive = reverseColors
    ? trendDirection === 'down'
    : trendDirection === 'up';

  const isNegative = reverseColors
    ? trendDirection === 'up'
    : trendDirection === 'down';

  // Size variants
  const sizeClasses = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base',
  };

  const iconSizeClasses = {
    small: 'w-2.5 h-2.5',
    default: 'w-3 h-3',
    large: 'w-4 h-4',
  };

  // Color classes
  const colorClasses = isPositive
    ? 'text-green-600 bg-green-50'
    : isNegative
    ? 'text-red-600 bg-red-50'
    : 'text-gray-600 bg-gray-50';

  // Icon component
  const Icon = trendDirection === 'up' ? ArrowUpIcon : trendDirection === 'down' ? ArrowDownIcon : MinusIcon;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${colorClasses} ${sizeClasses[size]} font-medium`}
    >
      <Icon className={iconSizeClasses[size]} />
      {showPercentage && (
        <span>{Math.abs(percentage).toFixed(1)}%</span>
      )}
    </div>
  );
}
