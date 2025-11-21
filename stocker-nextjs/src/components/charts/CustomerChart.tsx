'use client';

import { useState } from 'react';
import { Card, Select } from 'antd';
import LineChart from './LineChart';
import PieChart from './PieChart';
import BarChart from './BarChart';

type ChartType = 'growth' | 'segments' | 'geography';

interface CustomerChartProps {
  className?: string;
}

export function CustomerChart({ className }: CustomerChartProps) {
  const [chartType, setChartType] = useState<ChartType>('growth');

  // New customers trend (12 months)
  const growthData = [
    { name: 'Oca', value: 45 },
    { name: 'Şub', value: 52 },
    { name: 'Mar', value: 61 },
    { name: 'Nis', value: 58 },
    { name: 'May', value: 73 },
    { name: 'Haz', value: 68 },
    { name: 'Tem', value: 82 },
    { name: 'Ağu', value: 79 },
    { name: 'Eyl', value: 91 },
    { name: 'Eki', value: 88 },
    { name: 'Kas', value: 95 },
    { name: 'Ara', value: 102 }
  ];

  // Customer segments
  const segmentsData = [
    { name: 'Premium', value: 125, color: '#722ed1' },
    { name: 'Kurumsal', value: 89, color: '#1890ff' },
    { name: 'Bireysel', value: 456, color: '#52c41a' },
    { name: 'Bayi', value: 67, color: '#faad14' },
    { name: 'Diğer', value: 34, color: '#eb2f96' }
  ];

  // Geographic distribution
  const geographyData = [
    { name: 'İstanbul', value: 285 },
    { name: 'Ankara', value: 142 },
    { name: 'İzmir', value: 128 },
    { name: 'Bursa', value: 95 },
    { name: 'Antalya', value: 78 },
    { name: 'Diğer', value: 143 }
  ];

  const chartTypeOptions = [
    { label: 'Müşteri Artışı', value: 'growth' },
    { label: 'Müşteri Segmentleri', value: 'segments' },
    { label: 'Coğrafi Dağılım', value: 'geography' }
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'growth':
        return (
          <LineChart
            data={growthData}
            lines={[{ dataKey: 'value', stroke: '#8b5cf6', name: 'Müşteriler' }]}
            height={300}
            showGrid
            showTooltip
            xAxisKey="name"
          />
        );
      case 'segments':
        return (
          <PieChart
            data={segmentsData}
            height={300}
            showLegend
            showTooltip
          />
        );
      case 'geography':
        return (
          <BarChart
            data={geographyData}
            bars={[{ dataKey: 'value', fill: '#3b82f6', name: 'Müşteriler' }]}
            height={300}
            showGrid
            showTooltip
            xAxisKey="name"
          />
        );
      default:
        return null;
    }
  };

  const titles = {
    growth: 'Yeni Müşteri Trendi (12 Ay)',
    segments: 'Müşteri Segmentleri',
    geography: 'Coğrafi Dağılım'
  };

  return (
    <Card
      className={className}
      title={titles[chartType]}
      extra={
        <Select
          value={chartType}
          onChange={setChartType}
          options={chartTypeOptions}
          style={{ width: 180 }}
          size="small"
        />
      }
    >
      {renderChart()}
    </Card>
  );
}
