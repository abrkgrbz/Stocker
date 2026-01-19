'use client';

import React, { useMemo } from 'react';
import { Card, Empty, Select } from 'antd';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, InboxIcon } from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import Link from 'next/link';
import dayjs from 'dayjs';

interface MovementTrendData {
  date: string;
  inbound: number;
  outbound: number;
  netChange?: number;
}

interface MovementTrendWidgetProps {
  data: MovementTrendData[];
  loading?: boolean;
  trendDays?: number;
  onTrendDaysChange?: (days: number) => void;
  delay?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <p className="font-medium text-slate-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-slate-600">
            {entry.name}: {entry.value.toLocaleString('tr-TR')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MovementTrendWidget({
  data,
  loading = false,
  trendDays = 30,
  onTrendDaysChange,
  delay = 0,
}: MovementTrendWidgetProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: dayjs(item.date).format('DD/MM'),
      giren: item.inbound,
      cikan: item.outbound,
      net: item.netChange ?? item.inbound - item.outbound,
    }));
  }, [data]);

  const hasData = chartData.length > 0 && chartData.some((d) => d.giren > 0 || d.cikan > 0);

  // Calculate summary stats
  const totalInbound = chartData.reduce((sum, d) => sum + d.giren, 0);
  const totalOutbound = chartData.reduce((sum, d) => sum + d.cikan, 0);
  const netChange = totalInbound - totalOutbound;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        title={
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Stok Hareket Trendi</span>
          </div>
        }
        extra={
          <div className="flex items-center gap-2">
            {onTrendDaysChange && (
              <Select
                value={trendDays}
                onChange={onTrendDaysChange}
                size="small"
                className="w-20"
                options={[
                  { value: 7, label: '7 Gün' },
                  { value: 14, label: '14 Gün' },
                  { value: 30, label: '30 Gün' },
                ]}
              />
            )}
            <Link
              href="/inventory/stock-movements"
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Detaylar
            </Link>
          </div>
        }
        loading={loading}
        className="h-full border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        styles={{ body: { padding: '16px' } }}
      >
        {hasData ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">Giren</div>
                <div className="text-lg font-bold text-slate-900">
                  {totalInbound.toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">Çıkan</div>
                <div className="text-lg font-bold text-slate-900">
                  {totalOutbound.toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-500">Net</div>
                <div
                  className={`text-lg font-bold ${
                    netChange >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {netChange >= 0 ? '+' : ''}
                  {netChange.toLocaleString('tr-TR')}
                </div>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="giren"
                  name="Giren"
                  stackId="1"
                  stroke="#1e293b"
                  fill="#1e293b"
                  fillOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="cikan"
                  name="Çıkan"
                  stackId="2"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        ) : (
          <Empty
            image={
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
                <InboxIcon className="w-6 h-6 text-slate-300" />
              </div>
            }
            imageStyle={{ height: 60 }}
            description={
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Hareket verisi yok</div>
                <div className="text-xs text-slate-400">Henüz stok hareketi oluşmadı</div>
              </div>
            }
          />
        )}
      </Card>
    </motion.div>
  );
}
