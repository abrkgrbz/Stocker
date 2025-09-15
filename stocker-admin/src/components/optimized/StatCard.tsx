import React, { memo } from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: number;
  loading?: boolean;
  precision?: number;
}

// Memoized stat card component - only re-renders when props change
export const StatCard = memo<StatCardProps>(({ 
  title, 
  value, 
  prefix, 
  suffix, 
  trend, 
  loading = false,
  precision = 0 
}) => {
  const isPositive = trend && trend > 0;
  
  return (
    <Card loading={loading}>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        valueStyle={{ 
          color: trend ? (isPositive ? '#3f8600' : '#cf1322') : undefined 
        }}
        prefix={prefix}
        suffix={
          <span>
            {suffix}
            {trend && (
              <>
                {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                <span style={{ fontSize: '14px', marginLeft: '4px' }}>
                  {Math.abs(trend)}%
                </span>
              </>
            )}
          </span>
        }
      />
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.trend === nextProps.trend &&
    prevProps.loading === nextProps.loading
  );
});

StatCard.displayName = 'StatCard';