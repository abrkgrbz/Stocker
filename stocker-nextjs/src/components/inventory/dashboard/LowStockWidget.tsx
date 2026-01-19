'use client';

import React from 'react';
import { Card, Table, Empty, Tag, Button } from 'antd';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';

interface LowStockItem {
  productId: number;
  productName: string;
  productCode: string;
  currentQuantity: number;
  minStockLevel: number;
  shortage: number;
  warehouseName?: string;
}

interface LowStockWidgetProps {
  items: LowStockItem[];
  loading?: boolean;
  maxItems?: number;
  delay?: number;
}

export function LowStockWidget({
  items,
  loading = false,
  maxItems = 5,
  delay = 0,
}: LowStockWidgetProps) {
  const columns: ColumnsType<LowStockItem> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <Link href={`/inventory/products/${record.productId}`}>
          <div>
            <div className="font-medium text-slate-900 hover:text-slate-700">
              {record.productName}
            </div>
            <span className="text-xs text-slate-400">{record.productCode}</span>
          </div>
        </Link>
      ),
    },
    {
      title: 'Mevcut',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      align: 'right' as const,
      width: 70,
      render: (qty: number, record) => (
        <span className={qty <= record.minStockLevel ? 'text-slate-900 font-semibold' : ''}>
          {qty.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Eksik',
      dataIndex: 'shortage',
      key: 'shortage',
      align: 'right' as const,
      width: 70,
      render: (shortage: number) => (
        <Tag color="error" className="font-medium">
          -{shortage.toLocaleString('tr-TR')}
        </Tag>
      ),
    },
  ];

  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card
        title={
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-900">Düşük Stoklu Ürünler</span>
            {items.length > 0 && (
              <Tag className="bg-amber-100 text-amber-700 border-amber-200 text-xs ml-1">
                {items.length}
              </Tag>
            )}
          </div>
        }
        extra={
          <Link
            href="/inventory/products?lowStock=true"
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
            <Table
              columns={columns}
              dataSource={displayItems}
              rowKey="productId"
              pagination={false}
              size="small"
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!py-2 [&_.ant-table-tbody_td]:!py-2"
            />
            {hasMore && (
              <div className="mt-3 text-center">
                <Link href="/inventory/products?lowStock=true">
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
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto">
                <ExclamationTriangleIcon className="w-6 h-6 text-emerald-300" />
              </div>
            }
            imageStyle={{ height: 60 }}
            description={
              <div className="text-center">
                <div className="text-sm text-slate-600 mb-1">Tüm stoklar yeterli</div>
                <div className="text-xs text-slate-400">Düşük stoklu ürün bulunmuyor</div>
              </div>
            }
          />
        )}
      </Card>
    </motion.div>
  );
}
