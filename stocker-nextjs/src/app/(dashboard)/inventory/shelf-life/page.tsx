'use client';

import React, { useState, useMemo } from 'react';
import { Table, Select, Progress, Alert, Input } from 'antd';
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
      title: 'Lot Numarasi',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 150,
      render: (text: string, record) => (
        <div>
          <span className="font-semibold text-slate-900">{text}</span>
          {record.isExpired && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-400 text-white">
              <ExclamationTriangleIcon className="w-3 h-3" />
              Suresi Doldu
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Urun',
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
          <div className="text-xs text-slate-500">Kullanilabilir: {record.availableQuantity.toLocaleString('tr-TR')}</div>
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
      title: 'Kalan Gun',
      key: 'daysLeft',
      width: 120,
      sorter: (a, b) => (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999),
      render: (_, record) => {
        if (record.isExpired) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-400 text-white">
              Suresi Doldu
            </span>
          );
        }
        if (record.daysUntilExpiry === undefined) {
          return <span className="text-slate-400">-</span>;
        }

        // Monochrome intensity based on urgency
        let bgColor = '#f1f5f9'; // slate-100
        let textColor = '#64748b'; // slate-500

        if (record.daysUntilExpiry <= 7) {
          bgColor = '#475569'; // slate-600
          textColor = '#ffffff';
        } else if (record.daysUntilExpiry <= 30) {
          bgColor = '#cbd5e1'; // slate-300
          textColor = '#1e293b';
        } else if (record.daysUntilExpiry <= 60) {
          bgColor = '#e2e8f0'; // slate-200
          textColor = '#334155';
        }

        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            {record.daysUntilExpiry} gun
          </span>
        );
      },
    },
    {
      title: 'Kalan Raf Omru',
      key: 'shelfLife',
      width: 180,
      render: (_, record) => {
        if (record.remainingShelfLifePercentage === undefined) {
          return <span className="text-slate-400">-</span>;
        }
        const percent = Math.round(record.remainingShelfLifePercentage);

        // Monochrome progress colors
        let strokeColor = '#475569'; // slate-600
        if (percent < 20) strokeColor = '#334155'; // slate-700
        else if (percent < 50) strokeColor = '#64748b'; // slate-500

        return (
          <Progress
            percent={percent}
            size="small"
            strokeColor={strokeColor}
            trailColor="#e2e8f0"
          />
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Raf Omru Takibi</h1>
              <p className="text-slate-500 mt-1">Urun lotlarinin son kullanma tarihlerini ve kalan raf omurlerini takip edin</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Lot
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.expired}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Suresi Dolan
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.expiringSoon}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              7 Gun Icinde
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.expiringMonth}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              30 Gun Icinde
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.expired > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationTriangleIcon className="w-4 h-4" />}
          message={`${stats.expired} adet lot/partinin son kullanma tarihi gecmis!`}
          description="Bu lotlari kontrol edin ve gerekli aksiyonlari alin."
          className="mb-6 !border-slate-300 !bg-slate-100 [&_.ant-alert-message]:!text-slate-900 [&_.ant-alert-description]:!text-slate-600"
        />
      )}
      {stats.expiringSoon > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<ClockIcon className="w-4 h-4" />}
          message={`${stats.expiringSoon} adet lot/parti 7 gun icinde sona erecek!`}
          className="mb-6 !border-slate-300 !bg-slate-50 [&_.ant-alert-message]:!text-slate-900"
        />
      )}

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Lot veya urun ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64 [&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Urun secin"
            allowClear
            style={{ width: 200 }}
            value={selectedProduct}
            onChange={setSelectedProduct}
            showSearch
            optionFilterProp="children"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          >
            {products.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Sure filtresi"
            style={{ width: 150 }}
            value={expiringWithinDays}
            onChange={setExpiringWithinDays}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          >
            <Select.Option value={7}>7 gun icinde</Select.Option>
            <Select.Option value={14}>14 gun icinde</Select.Option>
            <Select.Option value={30}>30 gun icinde</Select.Option>
            <Select.Option value={60}>60 gun icinde</Select.Option>
            <Select.Option value={90}>90 gun icinde</Select.Option>
            <Select.Option value={180}>180 gun icinde</Select.Option>
            <Select.Option value={365}>1 yil icinde</Select.Option>
          </Select>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: filteredData.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
          }}
          scroll={{ x: 1000 }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
