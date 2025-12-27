'use client';

import { useState } from 'react';
import { Card, Select, Space, Badge } from 'antd';
import LineChart from './LineChart';
import PieChart from './PieChart';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type ChartType = 'levels' | 'distribution' | 'alerts';

interface InventoryChartProps {
  className?: string;
}

export function InventoryChart({ className }: InventoryChartProps) {
  const [chartType, setChartType] = useState<ChartType>('levels');

  // Stock levels over time (7 days)
  const stockLevelsData = [
    { name: 'Pzt', stock: 1250 },
    { name: 'Sal', stock: 1180 },
    { name: 'Çar', stock: 1320 },
    { name: 'Per', stock: 1150 },
    { name: 'Cum', stock: 1280 },
    { name: 'Cmt', stock: 1420 },
    { name: 'Paz', stock: 1380 }
  ];

  // Category distribution
  const distributionData = [
    { name: 'Elektronik', value: 450, color: '#1890ff' },
    { name: 'Giyim', value: 320, color: '#52c41a' },
    { name: 'Gıda', value: 280, color: '#faad14' },
    { name: 'Ev & Yaşam', value: 210, color: '#722ed1' },
    { name: 'Diğer', value: 120, color: '#eb2f96' }
  ];

  // Low stock alerts
  const alertsData = [
    { name: 'Kritik (< 10)', value: 15, color: '#ff4d4f' },
    { name: 'Düşük (10-50)', value: 32, color: '#faad14' },
    { name: 'Normal (> 50)', value: 245, color: '#52c41a' }
  ];

  const chartTypeOptions = [
    { label: 'Stok Seviyeleri', value: 'levels' },
    { label: 'Kategori Dağılımı', value: 'distribution' },
    { label: 'Stok Uyarıları', value: 'alerts' }
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'levels':
        return (
          <LineChart
            data={stockLevelsData}
            lines={[{ dataKey: 'stock', stroke: '#10b981', name: 'Stok' }]}
            xAxisKey="name"
            height={300}
            showGrid
            showTooltip
          />
        );
      case 'distribution':
        return (
          <PieChart
            data={distributionData}
            height={300}
            showLegend
            showTooltip
          />
        );
      case 'alerts':
        return (
          <div>
            <PieChart
              data={alertsData}
              height={240}
              showLegend
              showTooltip
            />
            <div className="mt-4 pt-4 border-t">
              <Space direction="vertical" size="small" className="w-full">
                <div className="flex items-center justify-between">
                  <Space>
                    <Badge status="error" />
                    <span className="text-sm">Kritik Seviye</span>
                  </Space>
                  <span className="font-semibold text-red-600">15 ürün</span>
                </div>
                <div className="flex items-center justify-between">
                  <Space>
                    <Badge status="warning" />
                    <span className="text-sm">Düşük Stok</span>
                  </Space>
                  <span className="font-semibold text-orange-600">32 ürün</span>
                </div>
                <div className="flex items-center justify-between">
                  <Space>
                    <Badge status="success" />
                    <span className="text-sm">Normal Seviye</span>
                  </Space>
                  <span className="font-semibold text-green-600">245 ürün</span>
                </div>
              </Space>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const showWarning = chartType === 'alerts';

  return (
    <Card
      className={className}
      title={
        <Space>
          <span>Stok Yönetimi</span>
          {showWarning && (
            <Badge count={47} className="ml-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            </Badge>
          )}
        </Space>
      }
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
