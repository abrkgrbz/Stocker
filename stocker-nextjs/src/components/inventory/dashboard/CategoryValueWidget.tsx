'use client';

import React, { useMemo } from 'react';
import { Card, Empty } from 'antd';
import { motion } from 'framer-motion';
import { TagIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import Link from 'next/link';

interface CategoryData {
  category: string;
  totalValue: number;
  productCount: number;
}

interface CategoryValueWidgetProps {
  data: CategoryData[];
  loading?: boolean;
  maxCategories?: number;
  delay?: number;
}

const COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <p className="font-medium text-slate-900 mb-1">{data.category}</p>
        <p className="text-sm text-slate-600">
          Değer: ₺{data.totalValue.toLocaleString('tr-TR')}
        </p>
        <p className="text-sm text-slate-600">
          Ürün: {data.productCount} adet
        </p>
        <p className="text-sm text-slate-500">
          Oran: %{data.percentage.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {payload?.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function CategoryValueWidget({
  data,
  loading = false,
  maxCategories = 6,
  delay = 0,
}: CategoryValueWidgetProps) {
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.totalValue - a.totalValue);
    const topCategories = sorted.slice(0, maxCategories - 1);
    const otherCategories = sorted.slice(maxCategories - 1);

    const total = data.reduce((sum, item) => sum + item.totalValue, 0);

    const result = topCategories.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.totalValue / total) * 100 : 0,
    }));

    if (otherCategories.length > 0) {
      const otherValue = otherCategories.reduce((sum, item) => sum + item.totalValue, 0);
      const otherCount = otherCategories.reduce((sum, item) => sum + item.productCount, 0);
      result.push({
        category: 'Diğer',
        totalValue: otherValue,
        productCount: otherCount,
        percentage: total > 0 ? (otherValue / total) * 100 : 0,
      });
    }

    return result;
  }, [data, maxCategories]);

  const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);
  const totalProducts = data.reduce((sum, item) => sum + item.productCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        title={
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Kategori Dağılımı</span>
          </div>
        }
        extra={
          <Link
            href="/inventory/products"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Detaylar
          </Link>
        }
        loading={loading}
        className="h-full border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        styles={{ body: { padding: '16px' } }}
      >
        {chartData.length > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">Toplam Değer</div>
                <div className="text-lg font-bold text-slate-900">
                  ₺{totalValue.toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">Kategori</div>
                <div className="text-lg font-bold text-slate-900">{data.length}</div>
              </div>
            </div>

            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="totalValue"
                  nameKey="category"
                  paddingAngle={2}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderCustomLegend} />
              </PieChart>
            </ResponsiveContainer>
          </>
        ) : (
          <Empty
            image={
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
                <RectangleStackIcon className="w-6 h-6 text-slate-300" />
              </div>
            }
            imageStyle={{ height: 60 }}
            description={
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Kategori verisi yok</div>
                <div className="text-xs text-slate-400">Henüz kategori kaydı bulunmuyor</div>
              </div>
            }
          />
        )}
      </Card>
    </motion.div>
  );
}
