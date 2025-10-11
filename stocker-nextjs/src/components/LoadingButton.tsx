'use client';

import React from 'react';
import { Button, ButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

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
      icon={loading ? <LoadingOutlined spin /> : icon}
    >
      {children}
    </Button>
  );
}
