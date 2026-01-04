'use client';

import React, { useState, useMemo } from 'react';
import { Table, Tag, Select, Progress, Alert, Input, DatePicker } from 'antd';
import {
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useLotBatches, useProducts } from '@/lib/api/hooks/useInventory';
import type { LotBatchListDto, LotBatchFilterDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PageContainer, ListPageHeader, Card } from '@/components/patterns';

export default function ShelfLifePage() {
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [expiringWithinDays, setExpiringWithinDays] = useState<number>(30);
  const [searchText, setSearchText] = useState('');

  // Build filter
  const filter: LotBatchFilterDto = useMemo(() => ({
    productId: selectedProduct,
    expiringWithinDays: expiringWithinDays,
  }), [selectedProduct, expiringWithinDays]);

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: lotBatches = [], isLoading, refetch } = useLotBatches(filter);

  // Filter by search text
  const filteredData = useMemo(() => {
    if (!searchText) return lotBatches;
    const search = searchText.toLowerCase();
    return lotBatches.filter(
      (item) =>
        item.lotNumber.toLowerCase().includes(search) ||
        item.productName?.toLowerCase().includes(search) ||
        item.productCode?.toLowerCase().includes(search)
    );
  }, [lotBatches, searchText]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredData.length;
    const expired = filteredData.filter(b => b.isExpired).length;
    const expiringSoon = filteredData.filter(b => b.daysUntilExpiry !== undefined && b.daysUntilExpiry <= 7 && b.daysUntilExpiry > 0).length;
    const expiringMonth = filteredData.filter(b => b.daysUntilExpiry !== undefined && b.daysUntilExpiry <= 30 && b.daysUntilExpiry > 7).length;
    return { total, expired, expiringSoon, expiringMonth };
  }, [filteredData]);

  // Table columns
  const columns: ColumnsType<LotBatchListDto> = [
    {
      title: 'Lot Numarası',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 150,
      render: (text: string, record) => (
        <div>
          <span className="font-semibold text-slate-900">{text}</span>
          {record.isExpired && (
            <Tag color="red" className="ml-2">Süresi Doldu</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 120,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-900">{record.currentQuantity.toLocaleString('tr-TR')}</div>
          <div className="text-xs text-slate-500">Kullanılabilir: {record.availableQuantity.toLocaleString('tr-TR')}</div>
        </div>
      ),
    },
    {
      title: 'Son Kullanma Tarihi',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 150,
      sorter: (a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix();
      },
      render: (date: string | undefined) => {
        if (!date) return <span className="text-slate-400">-</span>;
        return <span className="text-slate-900">{dayjs(date).format('DD.MM.YYYY')}</span>;
      },
    },
    {
      title: 'Kalan Gün',
      key: 'daysLeft',
      width: 120,
      sorter: (a, b) => (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999),
      render: (_, record) => {
        if (record.isExpired) {
          return <Tag color="red">Süresi Doldu</Tag>;
        }
        if (record.daysUntilExpiry === undefined) {
          return <span className="text-slate-400">-</span>;
        }
        let color = 'green';
        if (record.daysUntilExpiry <= 7) color = 'red';
        else if (record.daysUntilExpiry <= 30) color = 'orange';
        else if (record.daysUntilExpiry <= 60) color = 'gold';

        return <Tag color={color}>{record.daysUntilExpiry} gün</Tag>;
      },
    },
    {
      title: 'Kalan Raf Ömrü',
      key: 'shelfLife',
      width: 180,
      render: (_, record) => {
        if (record.remainingShelfLifePercentage === undefined) {
          return <span className="text-slate-400">-</span>;
        }
        const percent = Math.round(record.remainingShelfLifePercentage);
        let status: 'success' | 'normal' | 'exception' = 'success';
        if (percent < 20) status = 'exception';
        else if (percent < 50) status = 'normal';

        return (
          <Progress
            percent={percent}
            size="small"
            status={status}
            strokeColor={percent < 20 ? '#ef4444' : percent < 50 ? '#f59e0b' : '#10b981'}
          />
        );
      },
    },
  ];

  return (
    <PageContainer>
      <ListPageHeader
        icon={<ClockIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Raf Ömrü Takibi"
        description="Ürün lotlarının son kullanma tarihlerini ve kalan raf ömürlerini takip edin"
        itemCount={stats.total}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500">Toplam Lot</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-xs text-slate-500">Süresi Dolan</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
              <div className="text-xs text-slate-500">7 Gün İçinde</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.expiringMonth}</div>
              <div className="text-xs text-slate-500">30 Gün İçinde</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {stats.expired > 0 && (
        <Alert
          type="error"
          showIcon
          message={`${stats.expired} adet lot/partinin son kullanma tarihi geçmiş!`}
          description="Bu lotları kontrol edin ve gerekli aksiyonları alın."
          className="mb-6"
        />
      )}
      {stats.expiringSoon > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`${stats.expiringSoon} adet lot/parti 7 gün içinde sona erecek!`}
          className="mb-6"
        />
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 p-4">
          <Input
            placeholder="Lot veya ürün ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64"
          />
          <Select
            placeholder="Ürün seçin"
            allowClear
            style={{ width: 200 }}
            value={selectedProduct}
            onChange={setSelectedProduct}
            showSearch
            optionFilterProp="children"
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Süre filtresi"
            style={{ width: 150 }}
            value={expiringWithinDays}
            onChange={setExpiringWithinDays}
          >
            <Select.Option value={7}>7 gün içinde</Select.Option>
            <Select.Option value={14}>14 gün içinde</Select.Option>
            <Select.Option value={30}>30 gün içinde</Select.Option>
            <Select.Option value={60}>60 gün içinde</Select.Option>
            <Select.Option value={90}>90 gün içinde</Select.Option>
            <Select.Option value={180}>180 gün içinde</Select.Option>
            <Select.Option value={365}>1 yıl içinde</Select.Option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: filteredData.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </PageContainer>
  );
}
