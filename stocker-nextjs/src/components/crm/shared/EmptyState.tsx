'use client';

import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon className="text-6xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <Text type="secondary" className="mb-6 text-center">
        {description}
      </Text>
      {action}
    </div>
  );
}
