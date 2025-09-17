import React, { lazy, Suspense } from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

interface BaseChartConfig {
  data: Record<string, unknown>[];
  width?: number;
  height?: number;
  autoFit?: boolean;
  padding?: number | number[] | 'auto';
  theme?: string | object;
  pixelRatio?: number;
  locale?: string;
}

interface CartesianChartConfig extends BaseChartConfig {
  xField: string;
  yField: string;
  seriesField?: string;
  isGroup?: boolean;
  isStack?: boolean;
  isPercent?: boolean;
  label?: object | false;
  tooltip?: object | false;
  legend?: object | false;
  xAxis?: object | false;
  yAxis?: object | false;
  meta?: Record<string, object>;
  color?: string | string[] | ((datum: any) => string);
}

interface PieChartConfig extends BaseChartConfig {
  angleField: string;
  colorField: string;
  radius?: number;
  innerRadius?: number;
  label?: object | false;
  tooltip?: object | false;
  legend?: object | false;
  statistic?: object | false;
  color?: string | string[] | ((datum: any) => string);
}

interface GaugeChartConfig extends BaseChartConfig {
  percent: number;
  radius?: number;
  innerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  range?: {
    ticks?: number[];
    color?: string | string[];
  };
  indicator?: object | false;
  statistic?: object | false;
  axis?: object | false;
}

interface RadarChartConfig extends BaseChartConfig {
  xField: string;
  yField: string;
  seriesField?: string;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  smooth?: boolean;
  point?: object | false;
  area?: object | false;
  line?: object | false;
  xAxis?: object | false;
  yAxis?: object | false;
  meta?: Record<string, object>;
}

interface FunnelChartConfig extends BaseChartConfig {
  xField: string;
  yField: string;
  compareField?: string;
  isTransposed?: boolean;
  shape?: 'funnel' | 'pyramid';
  label?: object | false;
  tooltip?: object | false;
  legend?: object | false;
  conversionTag?: object | false;
}

interface HeatmapChartConfig extends BaseChartConfig {
  xField: string;
  yField: string;
  colorField: string;
  sizeField?: string;
  shape?: string;
  sizeRatio?: number;
  color?: string | string[] | ((datum: any) => string);
  label?: object | false;
  tooltip?: object | false;
  xAxis?: object | false;
  yAxis?: object | false;
  meta?: Record<string, object>;
}

// Lazy load chart components
const LazyLine = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Line })));
const LazyColumn = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Column })));
const LazyBar = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Bar })));
const LazyArea = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Area })));
const LazyPie = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Pie })));
const LazyRadar = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Radar })));
const LazyGauge = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Gauge })));
const LazyScatter = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Scatter })));
const LazyRing = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Ring })));
const LazyWaterfall = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Waterfall })));
const LazyFunnel = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Funnel })));
const LazyHeatmap = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Heatmap })));

// Chart loading component
const ChartLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '300px',
    width: '100%'
  }}>
    <Spin 
      indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      tip="Loading chart..."
    />
  </div>
);

// Export wrapped chart components
export const Line = (props: CartesianChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyLine {...props} />
  </Suspense>
);

export const Column = (props: CartesianChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyColumn {...props} />
  </Suspense>
);

export const Bar = (props: CartesianChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyBar {...props} />
  </Suspense>
);

export const Area = (props: CartesianChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyArea {...props} />
  </Suspense>
);

export const Pie = (props: PieChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyPie {...props} />
  </Suspense>
);

export const Radar = (props: RadarChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyRadar {...props} />
  </Suspense>
);

export const Gauge = (props: GaugeChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyGauge {...props} />
  </Suspense>
);

export const Scatter = (props: CartesianChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyScatter {...props} />
  </Suspense>
);

export const Ring = (props: PieChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyRing {...props} />
  </Suspense>
);

export const Waterfall = (props: CartesianChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyWaterfall {...props} />
  </Suspense>
);

export const Funnel = (props: FunnelChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyFunnel {...props} />
  </Suspense>
);

export const Heatmap = (props: HeatmapChartConfig) => (
  <Suspense fallback={<ChartLoader />}>
    <LazyHeatmap {...props} />
  </Suspense>
);

// Export types for external use
export type {
  BaseChartConfig,
  CartesianChartConfig,
  PieChartConfig,
  GaugeChartConfig,
  RadarChartConfig,
  FunnelChartConfig,
  HeatmapChartConfig
};

// Recharts support has been removed - use @ant-design/charts components above