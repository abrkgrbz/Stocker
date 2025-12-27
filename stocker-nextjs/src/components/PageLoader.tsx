import React from 'react';
import { Spin } from 'antd';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

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
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <Spin
        indicator={<ArrowPathIcon className="animate-spin" style={{ width: size === 'large' ? 48 : size === 'default' ? 32 : 24, height: size === 'large' ? 48 : size === 'default' ? 32 : 24 }} />}
        tip={tip}
        size={size}
      />
    </div>
  );
}
