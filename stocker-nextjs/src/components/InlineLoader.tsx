import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface InlineLoaderProps {
  text?: string;
  size?: 'small' | 'default' | 'large';
}

export default function InlineLoader({
  text,
  size = 'default'
}: InlineLoaderProps) {
  const fontSize = size === 'large' ? 24 : size === 'default' ? 16 : 12;

  return (
    <div className="inline-flex items-center gap-2">
      <Spin
        indicator={<LoadingOutlined style={{ fontSize }} spin />}
        size={size}
      />
      {text && <span className="text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );
}
