'use client';

import React, { useMemo } from 'react';
import { Card, Empty, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { ChartPieIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import Link from 'next/link';

interface StockHealthData {
  name: string;
  value: number;
  color: string;
}

interface StockHealthWidgetProps {
  products: Array<{
    id: number;
    totalStockQuantity: number;
    minStockLevel: number;
  }>;
  loading?: boolean;
  delay?: number;
}

const MONOCHROME_COLORS = {
  healthy: '#1e293b',
  warning: '#64748b',
  critical: '#94a3b8',
  outOfStock: '#cbd5e1',
};

export function StockHealthWidget({ products, loading = false, delay = 0 }: StockHealthWidgetProps) {
  const healthData = useMemo(() => {
    let healthy = 0;
    let warning = 0;
    let critical = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      if (p.totalStockQuantity === 0) {
        outOfStock++;
      } else if (p.totalStockQuantity < p.minStockLevel) {
        critical++;
      } else if (p.totalStockQuantity < p.minStockLevel * 1.5) {
        warning++;
      } else {
        healthy++;
      }
    });

    return [
      { name: 'Sağlıklı', value: healthy, color: MONOCHROME_COLORS.healthy },
      { name: 'Uyarı', value: warning, color: MONOCHROME_COLORS.warning },
      { name: 'Kritik', value: critical, color: MONOCHROME_COLORS.critical },
      { name: 'Stok Yok', value: outOfStock, color: MONOCHROME_COLORS.outOfStock },
    ];
  }, [products]);

  const hasData = healthData.some((d) => d.value > 0);
  const total = healthData.reduce((sum, d) => sum + d.value, 0);
  const healthyPercentage = total > 0 ? ((healthData[0].value / total) * 100).toFixed(0) : 0;

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
            <span className="text-sm font-semibold text-slate-900">Stok Sağlığı</span>
          </div>
        }
        extra={
          <Link href="/inventory/analysis" className="text-xs text-slate-500 hover:text-slate-700">
            Detaylar
          </Link>
        }
        loading={loading}
        className="h-full border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        styles={{ body: { padding: '16px' } }}
      >
        {hasData ? (
          <>
            <div className="flex items-center justify-center mb-3">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [`${value} ürün`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-slate-900">{healthyPercentage}%</div>
              <div className="text-xs text-slate-500">Sağlıklı Stok Oranı</div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {healthData.map((item) => (
                <Tooltip key={item.name} title={`${item.value} ürün`}>
                  <div className="flex items-center gap-1.5 text-xs cursor-default">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}:</span>
                    <span className="font-medium text-slate-900">{item.value}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </>
        ) : (
          <Empty
            image={
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-6 h-6 text-slate-300" />
              </div>
            }
            imageStyle={{ height: 60 }}
            description={
              <span className="text-sm text-slate-500">Henüz ürün eklenmemiş</span>
            }
          />
        )}
      </Card>
    </motion.div>
  );
}
