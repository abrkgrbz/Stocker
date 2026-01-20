'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Table,
  Space,
  Input,
  Modal,
  Dropdown,
  Tabs,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  StopCircleIcon,
  TrashIcon,
  TagIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import {
  usePriceLists,
  useDeletePriceList,
  useActivatePriceList,
  useDeactivatePriceList,
  useSetDefaultPriceList,
} from '@/lib/api/hooks/useInventory';
import type { PriceListListDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { TableEmptyState } from '@/components/primitives';
import dayjs from 'dayjs';

export default function PriceListsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const showInactive = activeTab === 'all';
  const { data: priceLists = [], isLoading, refetch } = usePriceLists(!showInactive);
  const deletePriceList = useDeletePriceList();
  const activatePriceList = useActivatePriceList();
  const deactivatePriceList = useDeactivatePriceList();
  const setDefaultPriceList = useSetDefaultPriceList();

  const handleDelete = async (id: number, name: string) => {
    Modal.confirm({
      title: 'Fiyat Listesini Sil',
      content: `"${name}" fiyat listesini silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deletePriceList.mutateAsync(id);
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  const handleActivate = async (id: number) => {
    try {
      await activatePriceList.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivatePriceList.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultPriceList.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const filteredPriceLists = priceLists.filter((priceList) =>
    priceList.name.toLowerCase().includes(searchText.toLowerCase()) ||
    priceList.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Stats calculations
  const stats = {
    total: priceLists.length,
    active: priceLists.filter((p) => p.isActive).length,
    defaults: priceLists.filter((p) => p.isDefault).length,
    withDiscount: priceLists.filter((p) => p.globalDiscountPercentage && p.globalDiscountPercentage > 0).length,
    withMarkup: priceLists.filter((p) => p.globalMarkupPercentage && p.globalMarkupPercentage > 0).length,
    totalItems: priceLists.reduce((sum, p) => sum + (p.itemCount || 0), 0),
  };

  const getActionMenu = (record: PriceListListDto): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <PencilIcon className="w-4 h-4" />,
      label: 'Düzenle',
      onClick: () => router.push(`/inventory/price-lists/${record.id}/edit`),
    },
    {
      key: 'default',
      icon: <StarIcon className="w-4 h-4" />,
      label: record.isDefault ? 'Varsayılan' : 'Varsayılan Yap',
      disabled: record.isDefault,
      onClick: () => handleSetDefault(record.id),
    },
    {
      type: 'divider',
    },
    {
      key: 'toggle',
      icon: record.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
      label: record.isActive ? 'Pasif Yap' : 'Aktif Yap',
      onClick: () => record.isActive ? handleDeactivate(record.id) : handleActivate(record.id),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      disabled: record.isDefault,
      onClick: () => handleDelete(record.id, record.name),
    },
  ];

  const columns: ColumnsType<PriceListListDto> = [
    {
      title: 'Fiyat Listesi',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            {record.isDefault ? (
              <StarIcon className="w-5 h-5 text-slate-700" />
            ) : (
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            )}
          </div>
          <div>
            <div className="font-medium text-slate-900 flex items-center gap-2">
              {name}
              {record.isDefault && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-white">
                  Varsayilan
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Kod: {record.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      align: 'center',
      width: 120,
      render: (currency: string) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {currency}
        </span>
      ),
    },
    {
      title: 'Indirim/Markup',
      key: 'discount',
      align: 'center',
      width: 140,
      render: (_, record) => (
        <div className="text-sm">
          {record.globalDiscountPercentage ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
              -%{record.globalDiscountPercentage}
            </span>
          ) : record.globalMarkupPercentage ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-300 text-slate-800">
              +%{record.globalMarkupPercentage}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      title: 'Geçerlilik',
      key: 'validity',
      width: 200,
      render: (_, record) => {
        if (!record.validFrom && !record.validTo) {
          return <span className="text-slate-500">Sürekli</span>;
        }
        return (
          <div className="text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <CalendarIcon className="w-4 h-4" />
              {record.validFrom ? dayjs(record.validFrom).format('DD.MM.YYYY') : '-'}
              {' - '}
              {record.validTo ? dayjs(record.validTo).format('DD.MM.YYYY') : '-'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'itemCount',
      key: 'itemCount',
      align: 'center',
      width: 120,
      render: (count: number) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Oncelik',
      dataIndex: 'priority',
      key: 'priority',
      align: 'center',
      width: 100,
      render: (priority: number) => (
        <span className="text-slate-600">{priority || 0}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      width: 100,
      render: (isActive: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
          isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      align: 'right',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button
            type="text"
            icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
            className="text-slate-600 hover:text-slate-900"
          />
        </Dropdown>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'active',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          Aktif
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.active}
          </span>
        </span>
      ),
    },
    {
      key: 'all',
      label: (
        <span className="flex items-center gap-2">
          <InboxIcon className="w-4 h-4" />
          Tumu
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.total}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-white" />
            </div>
            Fiyat Listeleri
          </h1>
          <p className="text-slate-500 mt-1">Ürün fiyat listelerini yönetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/price-lists/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Fiyat Listesi
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <InboxIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Liste
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Aktif Liste
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <StarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.defaults}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Varsayilan
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.withDiscount}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Indirimli
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.withMarkup}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Markup'li
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <InboxIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalItems}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Ürün
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-6 [&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Fiyat listesi ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredPriceLists}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: <TableEmptyState
              icon={CurrencyDollarIcon}
              title="Fiyat listesi bulunamadi"
              description="Henuz fiyat listesi eklenmemis veya filtrelere uygun kayit yok."
            />
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
