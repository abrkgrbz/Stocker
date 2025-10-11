'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export interface BarChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  bars: {
    dataKey: string;
    fill?: string;
    name?: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisKey?: string;
  layout?: 'horizontal' | 'vertical';
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
            <span className="font-medium text-gray-900 dark:text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarChart({
  data,
  bars,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisKey = 'name',
  layout = 'horizontal',
}: BarChartProps) {
  const defaultColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />}
        <XAxis
          dataKey={layout === 'horizontal' ? xAxisKey : undefined}
          type={layout === 'horizontal' ? 'category' : 'number'}
          className="text-xs text-gray-600 dark:text-gray-400"
          stroke="currentColor"
        />
        <YAxis
          dataKey={layout === 'vertical' ? xAxisKey : undefined}
          type={layout === 'horizontal' ? 'number' : 'category'}
          className="text-xs text-gray-600 dark:text-gray-400"
          stroke="currentColor"
        />
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && (
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
            }}
          />
        )}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill || defaultColors[index % defaultColors.length]}
            name={bar.name || bar.dataKey}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
