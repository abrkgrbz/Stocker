'use client';

import { useState } from 'react';
import { Card, Select, Space, Statistic } from 'antd';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

type ChartType = 'comparison' | 'profit' | 'cashflow';
type TimeRange = 'monthly' | 'quarterly' | 'yearly';

interface FinancialChartProps {
  className?: string;
}

export function FinancialChart({ className }: FinancialChartProps) {
  const [chartType, setChartType] = useState<ChartType>('comparison');
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  // Revenue vs Expenses (12 months)
  const monthlyComparison = [
    { name: 'Oca', gelir: 285000, gider: 178000 },
    { name: 'Şub', gelir: 312000, gider: 189000 },
    { name: 'Mar', gelir: 298000, gider: 195000 },
    { name: 'Nis', gelir: 335000, gider: 201000 },
    { name: 'May', gelir: 358000, gider: 215000 },
    { name: 'Haz', gelir: 342000, gider: 208000 },
    { name: 'Tem', gelir: 375000, gider: 225000 },
    { name: 'Ağu', gelir: 368000, gider: 218000 },
    { name: 'Eyl', gelir: 392000, gider: 235000 },
    { name: 'Eki', gelir: 385000, gider: 228000 },
    { name: 'Kas', gelir: 412000, gider: 245000 },
    { name: 'Ara', gelir: 428000, gider: 252000 }
  ];

  // Quarterly comparison
  const quarterlyComparison = [
    { name: 'Ç1', gelir: 895000, gider: 562000 },
    { name: 'Ç2', gelir: 1035000, gider: 624000 },
    { name: 'Ç3', gelir: 1135000, gider: 678000 },
    { name: 'Ç4', gelir: 1225000, gider: 725000 }
  ];

  // Profit margin trend
  const profitData = monthlyComparison.map(item => ({
    name: item.name,
    kar: item.gelir - item.gider,
    marj: ((item.gelir - item.gider) / item.gelir * 100).toFixed(1)
  }));

  // Cash flow
  const cashflowData = [
    { name: 'Oca', nakit: 125000 },
    { name: 'Şub', nakit: 148000 },
    { name: 'Mar', nakit: 132000 },
    { name: 'Nis', nakit: 167000 },
    { name: 'May', nakit: 195000 },
    { name: 'Haz', nakit: 212000 },
    { name: 'Tem', nakit: 238000 },
    { name: 'Ağu', nakit: 265000 },
    { name: 'Eyl', nakit: 288000 },
    { name: 'Eki', nakit: 315000 },
    { name: 'Kas', nakit: 342000 },
    { name: 'Ara', nakit: 378000 }
  ];

  const chartTypeOptions = [
    { label: 'Gelir vs Gider', value: 'comparison' },
    { label: 'Kar Marjı', value: 'profit' },
    { label: 'Nakit Akışı', value: 'cashflow' }
  ];

  const comparisonData = timeRange === 'monthly' ? monthlyComparison : quarterlyComparison;

  const renderChart = () => {
    switch (chartType) {
      case 'comparison':
        return (
          <BarChart
            data={comparisonData}
            bars={[
              { dataKey: 'gelir', fill: '#52c41a', name: 'Gelir' },
              { dataKey: 'gider', fill: '#ff4d4f', name: 'Gider' }
            ]}
            height={300}
            showGrid
            showTooltip
            showLegend
            xAxisKey="name"
          />
        );
      case 'profit':
        return (
          <div>
            <BarChart
              data={profitData}
              bars={[{ dataKey: 'kar', fill: '#52c41a', name: 'Kar' }]}
              height={240}
              showGrid
              showTooltip
              xAxisKey="name"
            />
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
              <Statistic
                title="Ortalama Kar"
                value={142}
                prefix="₺"
                suffix="K"
                valueStyle={{ color: '#52c41a' }}
              />
              <Statistic
                title="Ortalama Marj"
                value={35.8}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
                prefix={<ArrowUpOutlined />}
              />
              <Statistic
                title="Trend"
                value={12.5}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
                prefix={<ArrowUpOutlined />}
              />
            </div>
          </div>
        );
      case 'cashflow':
        return (
          <div>
            <LineChart
              data={cashflowData}
              lines={[{ dataKey: 'nakit', stroke: '#3b82f6', name: 'Nakit' }]}
              height={240}
              showGrid
              showTooltip
              xAxisKey="name"
            />
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
              <Statistic
                title="Başlangıç"
                value={125}
                prefix="₺"
                suffix="K"
              />
              <Statistic
                title="Güncel"
                value={378}
                prefix="₺"
                suffix="K"
                valueStyle={{ color: '#1890ff' }}
              />
              <Statistic
                title="Artış"
                value={202}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
                prefix={<ArrowUpOutlined />}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const titles = {
    comparison: 'Gelir vs Gider Karşılaştırması',
    profit: 'Kar Marjı Analizi',
    cashflow: 'Nakit Akışı Trendi'
  };

  return (
    <Card
      className={className}
      title={titles[chartType]}
      extra={
        <Space>
          {chartType === 'comparison' && (
            <Select
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { label: 'Aylık', value: 'monthly' },
                { label: 'Çeyreklik', value: 'quarterly' }
              ]}
              style={{ width: 100 }}
              size="small"
            />
          )}
          <Select
            value={chartType}
            onChange={setChartType}
            options={chartTypeOptions}
            style={{ width: 160 }}
            size="small"
          />
        </Space>
      }
    >
      {renderChart()}
    </Card>
  );
}
