'use client';

/**
 * Units List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Popconfirm,
  Tooltip,
  Spin,
  Button,
  Space,
} from 'antd';
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  ScaleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { TableEmptyState } from '@/components/primitives';
import { useUnits, useDeleteUnit } from '@/lib/api/hooks/useInventory';
import type { UnitDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';

export default function UnitsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);

  const { data: units = [], isLoading, refetch } = useUnits(includeInactive);
  const deleteUnit = useDeleteUnit();

  const handleDelete = async (unit: UnitDto) => {
    const confirmed = await confirmDelete('Birim', unit.name);
    if (confirmed) {
      try {
        await deleteUnit.mutateAsync(unit.id);
        showDeleteSuccess('birim');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const filteredUnits = useMemo(() => {
    if (!searchText) return units;
    return units.filter((unit) =>
      unit.name.toLowerCase().includes(searchText.toLowerCase()) ||
      unit.code.toLowerCase().includes(searchText.toLowerCase()) ||
      unit.symbol?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [units, searchText]);

  const totalUnits = units.length;
  const activeUnits = units.filter((u) => u.isActive).length;
  const baseUnits = units.filter((u) => !u.baseUnitId).length;
  const derivedUnits = units.filter((u) => u.baseUnitId).length;

  const columns: ColumnsType<UnitDto> = [
    {
      title: 'Birim',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ScaleIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{name}</div>
            <div className="text-xs text-slate-500">
              Kod: {record.code}
              {record.symbol && ` - Sembol: ${record.symbol}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Temel Birim',
      dataIndex: 'baseUnitName',
      key: 'baseUnitName',
      width: 200,
      render: (baseUnitName: string, record) => (
        baseUnitName ? (
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-slate-400" />
            <div>
              <div className="text-sm text-slate-700">{baseUnitName}</div>
              <div className="text-xs text-slate-500">
                1 {record.name} = {record.conversionFactor} {baseUnitName}
              </div>
            </div>
          </div>
        ) : (
          <Tooltip title="Bu bir temel birimdir">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
              Temel Birim
            </span>
          </Tooltip>
        )
      ),
    },
    {
      title: 'Donusum Faktoru',
      dataIndex: 'conversionFactor',
      key: 'conversionFactor',
      width: 150,
      align: 'center',
      render: (factor: number) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium bg-slate-100 text-slate-700 rounded">
          {factor}
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
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => router.push(`/inventory/units/${record.id}/edit`)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <Popconfirm
            title="Birimi silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record)}
            okText="Evet"
            cancelText="Hayır"
            okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
            cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
          >
            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Birimler</h1>
          <p className="text-slate-500 mt-1">Ürün ölçü birimlerini yönetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/units/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Birim
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ScaleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalUnits}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Birim</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeUnits}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Birim</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{baseUnits}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Temel Birim</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{derivedUnits}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Turetilmis Birim</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Birim ara... (ad, kod, sembol)"
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
              allowClear
              className="!rounded-lg !border-slate-300"
            />
            <div className="flex-1" />
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              Pasif birimleri göster
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUnits}
            rowKey="id"
            loading={isLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            }}
            locale={{
              emptyText: <TableEmptyState
                icon={ScaleIcon}
                title="Birim bulunamadi"
                description="Henuz birim eklenmemis veya filtrelere uygun kayit yok."
              />
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}
