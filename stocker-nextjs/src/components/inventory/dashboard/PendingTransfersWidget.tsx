'use client';

import React from 'react';
import { Card, Empty, Tag, Table } from 'antd';
import { motion } from 'framer-motion';
import { TruckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

interface PendingTransfer {
  id: number;
  transferNumber: string;
  sourceWarehouse: string;
  destinationWarehouse: string;
  itemCount: number;
  status: 'Pending' | 'InTransit' | 'PartiallyReceived';
  createdAt: string;
}

interface PendingTransfersWidgetProps {
  transfers: PendingTransfer[];
  loading?: boolean;
  maxItems?: number;
  delay?: number;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  Pending: { label: 'Bekliyor', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  InTransit: { label: 'Transfer Edildi', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  PartiallyReceived: { label: 'Kısmi Alındı', color: 'text-purple-700', bgColor: 'bg-purple-50' },
};

export function PendingTransfersWidget({
  transfers,
  loading = false,
  maxItems = 5,
  delay = 0,
}: PendingTransfersWidgetProps) {
  const displayTransfers = transfers.slice(0, maxItems);

  const statusCounts = {
    pending: transfers.filter((t) => t.status === 'Pending').length,
    inTransit: transfers.filter((t) => t.status === 'InTransit').length,
    partial: transfers.filter((t) => t.status === 'PartiallyReceived').length,
  };

  const columns = [
    {
      title: 'Transfer',
      dataIndex: 'transferNumber',
      key: 'transferNumber',
      render: (text: string, record: PendingTransfer) => (
        <Link
          href={`/inventory/stock-transfers/${record.id}`}
          className="text-slate-900 font-medium hover:text-slate-700"
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Güzergah',
      key: 'route',
      render: (_: any, record: PendingTransfer) => (
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-600 truncate max-w-[80px]" title={record.sourceWarehouse}>
            {record.sourceWarehouse}
          </span>
          <ArrowRightIcon className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="text-slate-600 truncate max-w-[80px]" title={record.destinationWarehouse}>
            {record.destinationWarehouse}
          </span>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.Pending;
        return (
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${config.color} ${config.bgColor}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-xs text-slate-500">{dayjs(date).fromNow()}</span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        title={
          <div className="flex items-center gap-2">
            <TruckIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Bekleyen Transferler</span>
            {transfers.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {transfers.length}
              </span>
            )}
          </div>
        }
        extra={
          <Link
            href="/inventory/stock-transfers"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Tümü
          </Link>
        }
        loading={loading}
        className="h-full border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        styles={{ body: { padding: '16px' } }}
      >
        {displayTransfers.length > 0 ? (
          <>
            {/* Status Summary */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 text-center p-2 bg-amber-50 rounded-lg">
                <div className="text-xs text-amber-600">Bekliyor</div>
                <div className="text-lg font-bold text-amber-700">{statusCounts.pending}</div>
              </div>
              <div className="flex-1 text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600">Transferde</div>
                <div className="text-lg font-bold text-blue-700">{statusCounts.inTransit}</div>
              </div>
              <div className="flex-1 text-center p-2 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-600">Kısmi</div>
                <div className="text-lg font-bold text-purple-700">{statusCounts.partial}</div>
              </div>
            </div>

            {/* Table */}
            <Table
              dataSource={displayTransfers}
              columns={columns}
              rowKey="id"
              size="small"
              pagination={false}
              className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-medium [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-tbody>tr>td]:text-sm"
            />
          </>
        ) : (
          <Empty
            image={
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
                <TruckIcon className="w-6 h-6 text-slate-300" />
              </div>
            }
            imageStyle={{ height: 60 }}
            description={
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Bekleyen transfer yok</div>
                <div className="text-xs text-slate-400">Tüm transferler tamamlanmış</div>
              </div>
            }
          />
        )}
      </Card>
    </motion.div>
  );
}
