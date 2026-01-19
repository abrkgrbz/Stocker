'use client';

import React from 'react';
import { Card, Table, Empty, Tag } from 'antd';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface ExpiringStockItem {
  stockId: number;
  productId: number;
  productName: string;
  lotNumber?: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
}

interface ExpiringStockWidgetProps {
  items: ExpiringStockItem[];
  loading?: boolean;
  maxItems?: number;
  delay?: number;
}

const getSeverityColor = (days: number) => {
  if (days <= 7) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
  if (days <= 14) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
  if (days <= 30) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
  return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
};

export function ExpiringStockWidget({
  items,
  loading = false,
  maxItems = 5,
  delay = 0,
}: ExpiringStockWidgetProps) {
  const columns: ColumnsType<ExpiringStockItem> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <Link href={`/inventory/lot-batches/${record.stockId}`}>
          <div>
            <div className="font-medium text-slate-900 hover:text-slate-700">
              {record.productName}
            </div>
            {record.lotNumber && (
              <span className="text-xs text-slate-400">Lot: {record.lotNumber}</span>
            )}
          </div>
        </Link>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      width: 70,
      render: (qty: number) => qty.toLocaleString('tr-TR'),
    },
    {
      title: 'Kalan',
      dataIndex: 'daysUntilExpiry',
      key: 'daysUntilExpiry',
      align: 'right' as const,
      width: 80,
      render: (days: number) => {
        const severity = getSeverityColor(days);
        return (
          <Tag className={`${severity.bg} ${severity.text} ${severity.border} text-xs font-medium`}>
            {days} gün
          </Tag>
        );
      },
    },
  ];

  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  // Calculate urgency stats
  const criticalCount = items.filter((i) => i.daysUntilExpiry <= 7).length;
  const warningCount = items.filter((i) => i.daysUntilExpiry > 7 && i.daysUntilExpiry <= 14).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        title={
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">SKT Yaklaşan Ürünler</span>
            {items.length > 0 && (
              <Tag className="bg-slate-100 text-slate-700 border-slate-200 text-xs ml-1">
                {items.length}
              </Tag>
            )}
          </div>
        }
        extra={
          <Link
            href="/inventory/stock?expiring=true"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Tümü
          </Link>
        }
        loading={loading}
        className="h-full border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        styles={{ body: { padding: '12px' } }}
      >
        {displayItems.length > 0 ? (
          <>
            {/* Urgency Summary */}
            {(criticalCount > 0 || warningCount > 0) && (
              <div className="flex gap-2 mb-3">
                {criticalCount > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-700">{criticalCount} kritik (7 gün)</span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded text-xs">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-orange-700">{warningCount} uyarı (14 gün)</span>
                  </div>
                )}
              </div>
            )}

            <Table
              columns={columns}
              dataSource={displayItems}
              rowKey="stockId"
              pagination={false}
              size="small"
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!py-2 [&_.ant-table-tbody_td]:!py-2"
            />
            {hasMore && (
              <div className="mt-3 text-center">
                <Link href="/inventory/stock?expiring=true">
                  <span className="text-xs text-slate-500 hover:text-slate-700">
                    +{items.length - maxItems} ürün daha
                  </span>
                </Link>
              </div>
            )}
          </>
        ) : (
          <Empty
            image={
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
                <ClockIcon className="w-6 h-6 text-slate-300" />
              </div>
            }
            imageStyle={{ height: 60 }}
            description={
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">SKT yaklaşan ürün yok</div>
                <div className="text-xs text-slate-400">30 gün içinde sona erecek stok bulunmuyor</div>
              </div>
            }
          />
        )}
      </Card>
    </motion.div>
  );
}
