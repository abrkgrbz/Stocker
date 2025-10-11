'use client';

import { ReactNode } from 'react';
import { Card } from 'antd';
import { WidgetHeader } from './WidgetHeader';

export interface ChartWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  onDelete?: () => void;
  extra?: ReactNode;
}

export function ChartWidget({
  id,
  title,
  children,
  onRefresh,
  onFullscreen,
  onDelete,
  extra,
}: ChartWidgetProps) {
  return (
    <Card
      className="widget-drag-handle"
      title={
        <WidgetHeader
          title={title}
          onRefresh={onRefresh}
          onFullscreen={onFullscreen}
          onDelete={onDelete}
          showSettings={false}
        />
      }
      extra={extra}
      bodyStyle={{ padding: 0 }}
      style={{ height: '100%', cursor: 'move' }}
    >
      {children}
    </Card>
  );
}
