'use client';

import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';

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
    small: 'text-[10px]',
    default: 'text-xs',
    large: 'text-sm',
  };

  // Color classes
  const colorClasses = isPositive
    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    : isNegative
    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
    : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';

  // Icon component
  const Icon = trendDirection === 'up' ? ArrowUpOutlined : trendDirection === 'down' ? ArrowDownOutlined : MinusOutlined;

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
