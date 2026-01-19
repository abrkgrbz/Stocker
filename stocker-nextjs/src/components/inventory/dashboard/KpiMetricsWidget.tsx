'use client';

import React from 'react';
import { Card, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface KpiMetric {
  key: string;
  label: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  tooltip?: string;
}

interface KpiMetricsWidgetProps {
  metrics: KpiMetric[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  delay?: number;
}

const defaultMetrics: KpiMetric[] = [
  {
    key: 'turnover',
    label: 'Stok Devir Hızı',
    value: 0,
    suffix: 'x',
    tooltip: 'Yıllık stok devir oranı',
  },
  {
    key: 'gmroi',
    label: 'GMROI',
    value: 0,
    suffix: '%',
    tooltip: 'Brüt Kar Yatırım Getirisi',
  },
  {
    key: 'stockout',
    label: 'Stok Tükenmesi',
    value: 0,
    suffix: '%',
    tooltip: 'Stok tükenmesi oranı',
  },
  {
    key: 'accuracy',
    label: 'Envanter Doğruluğu',
    value: 0,
    suffix: '%',
    tooltip: 'Fiziksel ve kayıtlı stok uyumu',
  },
];

export function KpiMetricsWidget({
  metrics = defaultMetrics,
  loading = false,
  columns = 4,
  delay = 0,
}: KpiMetricsWidgetProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  const formatValue = (metric: KpiMetric) => {
    const value = typeof metric.value === 'number'
      ? metric.value.toLocaleString('tr-TR')
      : metric.value;
    return `${metric.prefix || ''}${value}${metric.suffix || ''}`;
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />;
    }
    if (trend === 'down') {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-slate-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        title={
          <div className="flex items-center gap-2">
            <ChartPieIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Performans Metrikleri</span>
          </div>
        }
        loading={loading}
        className="border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        styles={{ body: { padding: '16px' } }}
      >
        <div className={`grid ${gridCols[columns]} gap-4`}>
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: delay + index * 0.05 }}
              className="p-4 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{metric.label}</span>
                {metric.tooltip && (
                  <Tooltip title={metric.tooltip}>
                    <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </Tooltip>
                )}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {formatValue(metric)}
                </span>
                {metric.trend && metric.trendValue && (
                  <div className={`flex items-center gap-1 mb-1 ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                    <span className="text-xs font-medium">{metric.trendValue}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
