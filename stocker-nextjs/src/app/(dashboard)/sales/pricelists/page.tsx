'use client';

/**
 * Price Lists Page
 * Fiyat listelerini yonetin - Monochrome Design System
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Table, Dropdown, Spin, Switch, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { usePriceLists } from '@/features/sales';
import type { PriceListListDto, PriceListQueryParams } from '@/features/sales';

dayjs.locale('tr');

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Promotional: 'Promosyon',
  Contract: 'Sözleşme',
  Wholesale: 'Toptan',
  Retail: 'Perakende',
};

export default function PriceListsPage() {
  const router = useRouter();
  const [params, setParams] = useState<PriceListQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = usePriceLists(params);
  const priceLists = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const activeCount = priceLists.filter((p) => p.isActive).length;
  const expiredCount = priceLists.filter((p) => p.validTo && dayjs(p.validTo).isBefore(dayjs())).length;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const columns: ColumnsType<PriceListListDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <span className="font-mono text-sm text-slate-700">{code}</span>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <div className="font-medium text-slate-900">{name}</div>
          <div className="text-xs text-slate-500">{typeLabels[record.type] || record.type}</div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {typeLabels[type] || type}
        </span>
      ),
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currencyCode',
      key: 'currencyCode',
      width: 100,
      render: (currency: string) => (
        <span className="text-sm font-medium text-slate-700">{currency}</span>
      ),
    },
    {
      title: 'Gecerlilik',
      key: 'validity',
      width: 200,
      render: (_, record) => {
        const from = dayjs(record.validFrom).format('DD MMM YYYY');
        const to = record.validTo ? dayjs(record.validTo).format('DD MMM YYYY') : 'Suresiz';
        const isExpired = record.validTo && dayjs(record.validTo).isBefore(dayjs());
        return (
          <div className="flex items-center gap-1.5">
            <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
            <span className={`text-sm ${isExpired ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
              {from} - {to}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Urun Sayisi',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 110,
      align: 'center',
      render: (count: number) => (
        <span className="text-sm font-medium text-slate-700">
          {count.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
            isActive
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {isActive ? (
            <>
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Aktif
            </>
          ) : (
            <>
              <XCircleIcon className="w-3.5 h-3.5" />
              Pasif
            </>
          )}
        </span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => router.push(`/sales/pricelists/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Duzenle',
                icon: <PencilIcon className="w-4 h-4" />,
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Fiyat Listeleri</h1>
              <p className="text-sm text-slate-500">
                Fiyatlandirma kurallarinizi yonetin
              </p>
            </div>
          </div>
          <Link
            href="/sales/pricelists/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Fiyat Listesi
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Toplam</p>
                <p className="text-xl font-bold text-slate-900">{totalCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Aktif</p>
                <p className="text-xl font-bold text-slate-900">{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Suresi Dolmus</p>
                <p className="text-xl font-bold text-slate-900">{expiredCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tipler</p>
                <p className="text-xl font-bold text-slate-900">
                  {new Set(priceLists.map((p) => p.type)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Kod veya ad ile ara..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
            <Select
              placeholder="Tip"
              allowClear
              className="min-w-[140px]"
              onChange={(value) => setParams((prev) => ({ ...prev, type: value, page: 1 }))}
              options={[
                { value: 'Standard', label: 'Standart' },
                { value: 'Promotional', label: 'Promosyon' },
                { value: 'Contract', label: 'Sozlesme' },
                { value: 'Wholesale', label: 'Toptan' },
                { value: 'Retail', label: 'Perakende' },
              ]}
            />
            <Select
              placeholder="Durum"
              allowClear
              className="min-w-[120px]"
              onChange={(value) => setParams((prev) => ({ ...prev, isActive: value, page: 1 }))}
              options={[
                { value: true, label: 'Aktif' },
                { value: false, label: 'Pasif' },
              ]}
            />
            <Select
              placeholder="Para Birimi"
              allowClear
              className="min-w-[130px]"
              onChange={(value) => setParams((prev) => ({ ...prev, currencyCode: value, page: 1 }))}
              options={[
                { value: 'TRY', label: 'TRY' },
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <Table
            className="enterprise-table"
            columns={columns}
            dataSource={priceLists}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: params.page,
              pageSize: params.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayit`,
              onChange: (page, pageSize) => setParams((prev) => ({ ...prev, page, pageSize })),
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/sales/pricelists/${record.id}`),
              className: 'cursor-pointer hover:bg-slate-50',
            })}
          />
        </div>
      </div>
    </div>
  );
}
