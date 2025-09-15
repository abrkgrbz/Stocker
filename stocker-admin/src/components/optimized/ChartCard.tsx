import React, { memo, useMemo } from 'react';
import { Card } from 'antd';
import { Line, Column, Area, Pie } from '@ant-design/charts';

interface ChartCardProps {
  title: string;
  type: 'line' | 'column' | 'area' | 'pie';
  data: any[];
  config?: any;
  loading?: boolean;
  height?: number;
}

// Memoized chart component with useMemo for config
export const ChartCard = memo<ChartCardProps>(({ 
  title, 
  type, 
  data, 
  config = {}, 
  loading = false,
  height = 300 
}) => {
  // Memoize chart configuration to prevent unnecessary re-renders
  const chartConfig = useMemo(() => ({
    data,
    height,
    autoFit: true,
    padding: 'auto',
    ...config,
  }), [data, height, config]);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line {...chartConfig} />;
      case 'column':
        return <Column {...chartConfig} />;
      case 'area':
        return <Area {...chartConfig} />;
      case 'pie':
        return <Pie {...chartConfig} />;
      default:
        return null;
    }
  };

  return (
    <Card title={title} loading={loading}>
      {renderChart()}
    </Card>
  );
});

ChartCard.displayName = 'ChartCard';