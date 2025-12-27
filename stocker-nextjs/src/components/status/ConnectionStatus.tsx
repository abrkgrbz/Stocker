'use client';

import React from 'react';
import { Badge } from 'antd';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | 'error';

export interface ConnectionStatusProps {
  state: ConnectionState;
  showText?: boolean;
  size?: 'small' | 'default';
  className?: string;
}

const statusConfig = {
  connected: {
    color: 'success',
    icon: CheckCircleIcon,
    text: 'Bağlı',
    badgeStatus: 'success' as const,
    colorClass: 'text-green-500',
  },
  disconnected: {
    color: 'default',
    icon: XCircleIcon,
    text: 'Bağlantı Kesildi',
    badgeStatus: 'default' as const,
    colorClass: 'text-gray-400',
  },
  connecting: {
    color: 'processing',
    icon: ArrowPathIcon,
    text: 'Bağlanıyor...',
    badgeStatus: 'processing' as const,
    colorClass: 'text-blue-500',
  },
  reconnecting: {
    color: 'warning',
    icon: ArrowPathIcon,
    text: 'Yeniden Bağlanıyor...',
    badgeStatus: 'warning' as const,
    colorClass: 'text-yellow-500',
  },
  error: {
    color: 'error',
    icon: ExclamationTriangleIcon,
    text: 'Bağlantı Hatası',
    badgeStatus: 'error' as const,
    colorClass: 'text-red-500',
  },
};

export default function ConnectionStatus({
  state,
  showText = true,
  size = 'default',
  className = ''
}: ConnectionStatusProps) {
  const config = statusConfig[state];
  const Icon = config.icon;
  const isSpinning = state === 'connecting' || state === 'reconnecting';

  if (!showText) {
    return (
      <Badge
        status={config.badgeStatus}
        className={className}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon
        className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} ${config.colorClass} ${isSpinning ? 'animate-spin' : ''}`}
      />
      {showText && (
        <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-gray-600`}>
          {config.text}
        </span>
      )}
    </div>
  );
}
