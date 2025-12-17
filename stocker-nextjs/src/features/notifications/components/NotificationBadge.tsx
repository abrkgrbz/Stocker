'use client';

import React from 'react';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  children: React.ReactNode;
  showZero?: boolean;
}

export default function NotificationBadge({
  count,
  maxCount = 99,
  children,
  showZero = false,
}: NotificationBadgeProps) {
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  const showBadge = count > 0 || showZero;

  return (
    <div className="relative inline-flex">
      {children}
      {showBadge && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full border-2 border-white">
          {displayCount}
        </span>
      )}
    </div>
  );
}
