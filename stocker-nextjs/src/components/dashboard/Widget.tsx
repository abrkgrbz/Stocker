'use client';

import { ReactNode } from 'react';
import { Card } from 'antd';

export interface WidgetProps {
  id: string;
  title: ReactNode;
  children: ReactNode;
  extra?: ReactNode;
  className?: string;
  bodyStyle?: React.CSSProperties;
}

export function Widget({
  title,
  children,
  extra,
  className,
  bodyStyle
}: WidgetProps) {
  return (
    <Card
      title={title}
      extra={extra}
      className={className}
      bodyStyle={bodyStyle}
      styles={{
        header: {
          borderBottom: '1px solid var(--ant-color-border)',
          minHeight: 48
        },
        body: {
          height: 'calc(100% - 48px)',
          overflow: 'auto'
        }
      }}
      style={{ height: '100%' }}
    >
      {children}
    </Card>
  );
}
