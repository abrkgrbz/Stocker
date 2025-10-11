'use client';

import { Widget } from './Widget';
import { WidgetHeader } from './WidgetHeader';
import { ReactNode } from 'react';

export interface KPIWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  onRefresh?: () => void;
  onDelete?: () => void;
}

export function KPIWidget({
  id,
  title,
  children,
  onRefresh,
  onDelete,
}: KPIWidgetProps) {
  return (
    <Widget
      id={id}
      title={
        <WidgetHeader
          title={title}
          onRefresh={onRefresh}
          onDelete={onDelete}
          showFullscreen={false}
          showSettings={false}
        />
      }
      bodyStyle={{ padding: 24 }}
    >
      {children}
    </Widget>
  );
}
