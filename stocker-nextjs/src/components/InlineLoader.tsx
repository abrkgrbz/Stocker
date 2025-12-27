import React from 'react';
import { Spin } from 'antd';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

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
        indicator={<ArrowPathIcon className="animate-spin" style={{ width: fontSize, height: fontSize }} />}
        size={size}
      />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
}
