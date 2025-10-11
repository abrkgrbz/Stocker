'use client';

import React from 'react';
import { Badge } from 'antd';

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
  return (
    <Badge
      count={count}
      overflowCount={maxCount}
      showZero={showZero}
      className="cursor-pointer"
    >
      {children}
    </Badge>
  );
}
