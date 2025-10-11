'use client';

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export interface AreaChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface AreaChartProps {
  data: AreaChartDataPoint[];
  areas: {
    dataKey: string;
    stroke?: string;
    fill?: string;
    name?: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisKey?: string;
  stacked?: boolean;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
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

export default function AreaChart({
  data,
  areas,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisKey = 'name',
  stacked = false,
}: AreaChartProps) {
  const defaultColors = [
    { stroke: '#8b5cf6', fill: '#8b5cf620' },
    { stroke: '#ec4899', fill: '#ec489920' },
    { stroke: '#06b6d4', fill: '#06b6d420' },
    { stroke: '#10b981', fill: '#10b98120' },
    { stroke: '#f59e0b', fill: '#f59e0b20' },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {areas.map((area, index) => {
            const colors = defaultColors[index % defaultColors.length];
            const fillColor = area.fill || colors.fill;
            return (
              <linearGradient key={area.dataKey} id={`color${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.stroke || colors.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={area.stroke || colors.stroke} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />}
        <XAxis
          dataKey={xAxisKey}
          className="text-xs text-gray-600 dark:text-gray-400"
          stroke="currentColor"
        />
        <YAxis
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
        {areas.map((area, index) => {
          const colors = defaultColors[index % defaultColors.length];
          return (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              stroke={area.stroke || colors.stroke}
              fill={`url(#color${area.dataKey})`}
              name={area.name || area.dataKey}
              stackId={stacked ? '1' : undefined}
              strokeWidth={2}
            />
          );
        })}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
