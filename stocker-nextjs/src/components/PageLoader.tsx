import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface PageLoaderProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
}

export default function PageLoader({
  tip = 'Loading...',
  size = 'large',
  fullScreen = true
}: PageLoaderProps) {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'default' ? 32 : 24 }} spin />}
        tip={tip}
        size={size}
      />
    </div>
  );
}
