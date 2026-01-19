'use client';

import React from 'react';
import { Card, Empty } from 'antd';
import { motion } from 'framer-motion';
import { ChartBarIcon, CubeIcon } from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import Link from 'next/link';

interface TopProductItem {
  id: number;
  name: string;
  totalValue: number;
  quantity: number;
}

interface TopProductsWidgetProps {
  items: TopProductItem[];
  loading?: boolean;
  maxItems?: number;
  delay?: number;
}

const COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <p className="font-medium text-slate-900 mb-1 text-sm">{label}</p>
        <p className="text-sm text-slate-600">
          Değer: ₺{payload[0].value.toLocaleString('tr-TR')}
        </p>
      </div>
    );
  }
  return null;
};

export function TopProductsWidget({
  items,
  loading = false,
  maxItems = 5,
  delay = 0,
}: TopProductsWidgetProps) {
  const displayItems = items.slice(0, maxItems);
  const chartData = displayItems.map((item) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    value: item.totalValue,
    quantity: item.quantity,
  }));

  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        title={
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">En Değerli Ürünler</span>
          </div>
        }
        extra={
          <Link
            href="/inventory/products"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Tümü
          </Link>
        }
        loading={loading}
        className="h-full border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        styles={{ body: { padding: '16px' } }}
      >
        {displayItems.length > 0 ? (
          <>
            {/* Summary */}
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Toplam Stok Değeri</div>
              <div className="text-xl font-bold text-slate-900">
                ₺{totalValue.toLocaleString('tr-TR')}
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <Empty
            image={
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
                <CubeIcon className="w-6 h-6 text-slate-300" />
              </div>
            }
            imageStyle={{ height: 60 }}
            description={
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Ürün verisi yok</div>
                <div className="text-xs text-slate-400">Henüz ürün kaydı bulunmuyor</div>
              </div>
            }
          />
        )}
      </Card>
    </motion.div>
  );
}
