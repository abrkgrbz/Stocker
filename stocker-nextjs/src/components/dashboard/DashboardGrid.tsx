'use client';

import { ReactNode, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface DashboardGridProps {
  children: ReactNode;
  layouts?: Layouts;
  onLayoutChange?: (layout: Layout[], layouts: Layouts) => void;
  isDraggable?: boolean;
  isResizable?: boolean;
  className?: string;
}

export function DashboardGrid({
  children,
  layouts,
  onLayoutChange,
  isDraggable = true,
  isResizable = true,
  className = '',
}: DashboardGridProps) {
  const defaultLayouts = useMemo(() => layouts || {
    lg: [],
    md: [],
    sm: [],
    xs: [],
    xxs: []
  }, [layouts]);

  const handleLayoutChange = useCallback((layout: Layout[], allLayouts: Layouts) => {
    if (onLayoutChange) {
      onLayoutChange(layout, allLayouts);
    }
  }, [onLayoutChange]);

  return (
    <ResponsiveGridLayout
      className={`dashboard-grid ${className}`}
      layouts={defaultLayouts}
      onLayoutChange={handleLayoutChange}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={60}
      isDraggable={isDraggable}
      isResizable={isResizable}
      compactType="vertical"
      preventCollision={false}
      margin={[16, 16]}
      containerPadding={[0, 0]}
      draggableHandle=".widget-drag-handle"
    >
      {children}
    </ResponsiveGridLayout>
  );
}
