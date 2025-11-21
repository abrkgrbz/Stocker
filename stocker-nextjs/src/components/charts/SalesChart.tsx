'use client';

import { useState } from 'react';
import { Card, Select, Radio } from 'antd';
import AreaChart from './AreaChart';
import { generateDemoData } from './chart-utils';

type TimeRange = 'daily' | 'weekly' | 'monthly';
type DataType = 'revenue' | 'orders' | 'average';

interface SalesChartProps {
  className?: string;
}

export function SalesChart({ className }: SalesChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [dataType, setDataType] = useState<DataType>('revenue');

  // Generate demo data based on time range
  const getData = () => {
    const counts = {
      daily: 7,
      weekly: 4,
      monthly: 12
    };

    const labels = {
      daily: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      weekly: ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'],
      monthly: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    };

    const ranges = {
      revenue: { daily: [15000, 45000], weekly: [80000, 150000], monthly: [200000, 500000] },
      orders: { daily: [30, 80], weekly: [150, 400], monthly: [800, 2000] },
      average: { daily: [300, 800], weekly: [400, 900], monthly: [450, 950] }
    };

    const count = counts[timeRange];
    const data = generateDemoData(count, ['value'], ranges[dataType][timeRange] as [number, number]);

    return data.map((item, index) => ({
      name: labels[timeRange][index] || `${index + 1}`,
      value: item.value
    }));
  };

  const chartData = getData();

  const dataTypeOptions = [
    { label: 'Gelir', value: 'revenue' },
    { label: 'Sipariş Sayısı', value: 'orders' },
    { label: 'Ortalama Sepet', value: 'average' }
  ];

  const titles = {
    revenue: 'Satış Geliri',
    orders: 'Sipariş Sayısı',
    average: 'Ortalama Sipariş Değeri'
  };

  const valueFormatters = {
    revenue: (value: number) => `₺${value.toLocaleString('tr-TR')}`,
    orders: (value: number) => value.toLocaleString('tr-TR'),
    average: (value: number) => `₺${value.toLocaleString('tr-TR')}`
  };

  return (
    <Card
      className={className}
      title={
        <div className="flex items-center justify-between">
          <span>{titles[dataType]}</span>
          <div className="flex gap-3">
            <Radio.Group
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              size="small"
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="daily">Günlük</Radio.Button>
              <Radio.Button value="weekly">Haftalık</Radio.Button>
              <Radio.Button value="monthly">Aylık</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      }
      extra={
        <Select
          value={dataType}
          onChange={setDataType}
          options={dataTypeOptions}
          style={{ width: 180 }}
          size="small"
        />
      }
    >
      <AreaChart
        data={chartData}
        areas={[{ dataKey: 'value', stroke: '#3b82f6', name: titles[dataType] }]}
        xAxisKey="name"
        height={300}
        showGrid
        showTooltip
      />
    </Card>
  );
}
