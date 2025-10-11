'use client';

import React from 'react';
import { Card, Progress } from 'antd';

export interface ComparisonItem {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface ComparisonCardProps {
  title: string;
  items: ComparisonItem[];
  total?: number;
  showProgress?: boolean;
  showPercentage?: boolean;
}

export default function ComparisonCard({
  title,
  items,
  total,
  showProgress = true,
  showPercentage = true,
}: ComparisonCardProps) {
  // Calculate total if not provided
  const calculatedTotal = total || items.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentages
  const itemsWithPercentage = items.map((item) => ({
    ...item,
    percentage: item.percentage || (calculatedTotal > 0 ? (item.value / calculatedTotal) * 100 : 0),
  }));

  // Default colors
  const defaultColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <Card title={title} className="h-full">
      <div className="space-y-4">
        {itemsWithPercentage.map((item, index) => {
          const color = item.color || defaultColors[index % defaultColors.length];
          const formattedValue = new Intl.NumberFormat('tr-TR').format(item.value);

          return (
            <div key={item.label} className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formattedValue}
                  </span>
                  {showPercentage && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {showProgress && (
                <Progress
                  percent={item.percentage}
                  strokeColor={color}
                  showInfo={false}
                  size="small"
                />
              )}
            </div>
          );
        })}

        {/* Total */}
        {total !== undefined && (
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Toplam
              </span>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('tr-TR').format(calculatedTotal)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
