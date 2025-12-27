'use client';

import React from 'react';
import { Button, ButtonProps } from 'antd';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({
  loading = false,
  children,
  disabled,
  icon,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      icon={loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : icon}
    >
      {children}
    </Button>
  );
}
