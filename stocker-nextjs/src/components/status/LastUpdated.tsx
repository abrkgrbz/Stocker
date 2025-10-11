'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';

export interface LastUpdatedProps {
  /**
   * The timestamp of the last update
   */
  timestamp: Date | string;

  /**
   * Auto-refresh interval in milliseconds (0 to disable)
   */
  refreshInterval?: number;

  /**
   * Show refresh icon
   */
  showIcon?: boolean;

  /**
   * Prefix text before the timestamp
   */
  prefix?: string;

  /**
   * Size variant
   */
  size?: 'small' | 'default';

  /**
   * Optional callback when refresh interval triggers
   */
  onRefresh?: () => void;

  className?: string;
}

export default function LastUpdated({
  timestamp,
  refreshInterval = 60000, // 1 minute default
  showIcon = true,
  prefix = 'Son güncelleme',
  size = 'default',
  onRefresh,
  className = '',
}: LastUpdatedProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');

  useEffect(() => {
    const updateRelativeTime = () => {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const formatted = formatDistanceToNow(date, {
        addSuffix: true,
        locale: tr,
      });
      setRelativeTime(formatted);

      if (onRefresh) {
        onRefresh();
      }
    };

    // Initial update
    updateRelativeTime();

    // Set up interval if enabled
    if (refreshInterval > 0) {
      const interval = setInterval(updateRelativeTime, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [timestamp, refreshInterval, onRefresh]);

  const iconSize = size === 'small' ? 'text-xs' : 'text-sm';
  const textSize = size === 'small' ? 'text-xs' : 'text-sm';

  return (
    <div className={`inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 ${className}`}>
      {showIcon && <ClockCircleOutlined className={iconSize} />}
      <span className={textSize}>
        {prefix}: {relativeTime}
      </span>
      {refreshInterval > 0 && (
        <ReloadOutlined
          className={`${iconSize} opacity-50`}
          title="Otomatik yenileniyor"
        />
      )}
    </div>
  );
}
