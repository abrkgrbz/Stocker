'use client';

import React from 'react';
import { Badge } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons';

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
    icon: CheckCircleOutlined,
    text: 'Bağlı',
    badgeStatus: 'success' as const,
  },
  disconnected: {
    color: 'default',
    icon: CloseCircleOutlined,
    text: 'Bağlantı Kesildi',
    badgeStatus: 'default' as const,
  },
  connecting: {
    color: 'processing',
    icon: LoadingOutlined,
    text: 'Bağlanıyor...',
    badgeStatus: 'processing' as const,
  },
  reconnecting: {
    color: 'warning',
    icon: LoadingOutlined,
    text: 'Yeniden Bağlanıyor...',
    badgeStatus: 'warning' as const,
  },
  error: {
    color: 'error',
    icon: WarningOutlined,
    text: 'Bağlantı Hatası',
    badgeStatus: 'error' as const,
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
        className={`${size === 'small' ? 'text-sm' : 'text-base'}`}
        style={{
          color: config.color === 'success' ? '#52c41a' :
                 config.color === 'error' ? '#ff4d4f' :
                 config.color === 'warning' ? '#faad14' :
                 config.color === 'processing' ? '#1890ff' : '#d9d9d9'
        }}
        spin={state === 'connecting' || state === 'reconnecting'}
      />
      {showText && (
        <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
          {config.text}
        </span>
      )}
    </div>
  );
}
