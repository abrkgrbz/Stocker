'use client';

import React, { ReactNode } from 'react';
import { Card } from 'antd';
import TrendIndicator from './TrendIndicator';
import { LiveBadge } from '@/components/status';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    percentage: number;
    label?: string;
  };
  prefix?: string;
  suffix?: string;
  isLive?: boolean;
  loading?: boolean;
  color?: string;
  reverseColors?: boolean;
  footer?: ReactNode;
  onClick?: () => void;
}

export default function KPICard({
  title,
  value,
  icon,
  trend,
  prefix,
  suffix,
  isLive = false,
  loading = false,
  color = '#8b5cf6',
  reverseColors = false,
  footer,
  onClick,
}: KPICardProps) {
  const formattedValue = typeof value === 'number'
    ? new Intl.NumberFormat('tr-TR').format(value)
    : value;

  return (
    <Card
      loading={loading}
      hoverable={!!onClick}
      onClick={onClick}
      className="h-full"
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">
              {title}
            </span>
            {isLive && <LiveBadge isLive showText={false} size="small" />}
          </div>
          {icon && (
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{
                backgroundColor: `${color}20`,
                color: color
              }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          {prefix && (
            <span className="text-xl font-semibold text-gray-500">
              {prefix}
            </span>
          )}
          <span
            className="text-3xl font-bold"
            style={{ color: color }}
          >
            {formattedValue}
          </span>
          {suffix && (
            <span className="text-xl font-semibold text-gray-500">
              {suffix}
            </span>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2">
            <TrendIndicator
              value={trend.value}
              percentage={trend.percentage}
              size="small"
              reverseColors={reverseColors}
            />
            {trend.label && (
              <span className="text-xs text-gray-500">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="pt-3 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </Card>
  );
}
