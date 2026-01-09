'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Select, Input, Button, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  QrCodeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useBarcodeDefinitions,
  useProducts,
  useDeleteBarcodeDefinition,
} from '@/lib/api/hooks/useInventory';
import type { BarcodeDefinitionDto, BarcodeType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { confirmAction } from '@/lib/utils/sweetalert';

const barcodeTypeConfig: Record<number, { label: string }> = {
  1: { label: 'EAN-13' },
  2: { label: 'EAN-8' },
  3: { label: 'UPC-A' },
  4: { label: 'UPC-E' },
  5: { label: 'Code 128' },
  6: { label: 'Code 39' },
  7: { label: 'QR Code' },
  8: { label: 'Data Matrix' },
  9: { label: 'PDF417' },
  10: { label: 'ITF-14' },
  11: { label: 'Custom' },
};

export default function BarcodeDefinitionsPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: products = [] } = useProducts();
  const { data: barcodes = [], isLoading, refetch } = useBarcodeDefinitions(selectedProduct);
  const deleteBarcode = useDeleteBarcodeDefinition();

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchText) return barcodes;
    const search = searchText.toLowerCase();
    return barcodes.filter(
      (item) =>
        item.barcode.toLowerCase().includes(search) ||
        item.productName?.toLowerCase().includes(search) ||
        item.productCode?.toLowerCase().includes(search)
    );
  }, [barcodes, searchText]);

  // Stats
  const stats = useMemo(() => {
    const total = barcodes.length;
    const primary = barcodes.filter(b => b.isPrimary).length;
    const active = barcodes.filter(b => b.isActive).length;
    const manufacturer = barcodes.filter(b => b.isManufacturerBarcode).length;
    return { total, primary, active, manufacturer };
  }, [barcodes]);

  // Handlers
  const handleDelete = async (barcode: BarcodeDefinitionDto) => {
    const confirmed = await confirmAction(
      'Barkodu Sil',
      `"${barcode.barcode}" barkodunu silmek istediginizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deleteBarcode.mutateAsync(barcode.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  // Table columns
  const columns: ColumnsType<BarcodeDefinitionDto> = [
    {
      title: 'Barkod',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 180,
      render: (text: string, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/inventory/barcode-definitions/${record.id}`);
          }}
          className="text-left"
        >
          <span className="font-mono font-semibold text-slate-900 hover:text-slate-600 transition-colors">{text}</span>
          {record.isPrimary && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-900 text-white">
              <CheckCircleIcon className="w-3 h-3" />
              Birincil
            </span>
          )}
        </button>
      ),
    },
    {
      title: 'Urun',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/inventory/barcode-definitions/${record.id}`);
          }}
          className="text-left"
        >
          <div className="font-medium text-slate-900 hover:text-slate-600 transition-colors">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </button>
      ),
    },
    {
      title: 'Barkod Tipi',
      dataIndex: 'barcodeType',
      key: 'barcodeType',
      width: 120,
      render: (type: BarcodeType) => {
        const config = barcodeTypeConfig[type] || { label: 'Bilinmiyor' };
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Birim Miktar',
      dataIndex: 'quantityPerUnit',
      key: 'quantityPerUnit',
      width: 100,
      render: (value: number) => (
        <span className="text-slate-600">{value || 1}</span>
      ),
    },
    {
      title: 'Uretici',
      key: 'manufacturer',
      width: 120,
      render: (_, record) => (
        record.isManufacturerBarcode ? (
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
              Uretici
            </span>
            {record.manufacturerCode && (
              <div className="text-xs text-slate-500 mt-1">{record.manufacturerCode}</div>
            )}
          </div>
        ) : <span className="text-slate-400">-</span>
      ),
    },
    {
      title: 'GTIN',
      dataIndex: 'gtin',
      key: 'gtin',
      width: 150,
      render: (text: string) => text ? (
        <span className="font-mono text-xs text-slate-600">{text}</span>
      ) : (
        <span className="text-slate-400">-</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            isActive
              ? 'bg-slate-900 text-white'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Goruntule',
                onClick: () => router.push(`/inventory/barcode-definitions/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Duzenle',
                onClick: () => router.push(`/inventory/barcode-definitions/${record.id}/edit`),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
            onClick={(e) => e.stopPropagation()}
            className="text-slate-600 hover:text-slate-900"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <QrCodeIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Barkod Tanimlari</h1>
              <p className="text-slate-500 mt-1">Urunlere ait barkod tanimlarini yonetin</p>
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
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/barcode-definitions/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Barkod
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <QrCodeIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Barkod
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.primary}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Birincil Barkod
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <QrCodeIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Aktif Barkod
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <QrCodeIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.manufacturer}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Uretici Barkodu
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Barkod veya urun ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64 [&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Urune gore filtrele"
            allowClear
            style={{ width: 250 }}
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
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: () => router.push(`/inventory/barcode-definitions/${record.id}`),
            className: 'cursor-pointer hover:bg-slate-50',
          })}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
