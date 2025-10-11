'use client';

import { Widget } from './Widget';
import { WidgetHeader } from './WidgetHeader';
import { ReactNode } from 'react';

export interface TableWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  onDelete?: () => void;
  extra?: ReactNode;
}

export function TableWidget({
  id,
  title,
  children,
  onRefresh,
  onFullscreen,
  onDelete,
  extra,
}: TableWidgetProps) {
  return (
    <Widget
      id={id}
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
    >
      {children}
    </Widget>
  );
}
