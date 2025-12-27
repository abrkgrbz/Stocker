'use client';

/**
 * Units List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Popconfirm,
  Tooltip,
  Spin,
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
import { useUnits, useDeleteUnit } from '@/lib/api/hooks/useInventory';
import type { UnitDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';

export default function UnitsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { data: units = [], isLoading, refetch } = useUnits();
  const deleteUnit = useDeleteUnit();

  const handleDelete = async (unit: UnitDto) => {
    const confirmed = await confirmDelete('Birim', unit.name);
    if (confirmed) {
      try {
        await deleteUnit.mutateAsync(unit.id);
        showDeleteSuccess('birim');
      } catch (error) {
        showError('Silme işlemi başarısız');
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

  // Calculate stats
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
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: record.baseUnitId ? '#6366f115' : '#10b98115' }}
          >
            <ScaleIcon className="w-5 h-5" style={{ color: record.baseUnitId ? '#6366f1' : '#10b981' }} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{name}</div>
            <div className="text-xs text-slate-500">
              Kod: {record.code}
              {record.symbol && ` • Sembol: ${record.symbol}`}
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
            <Tag color="blue">Temel Birim</Tag>
          </Tooltip>
        )
      ),
    },
    {
      title: 'Dönüşüm Faktörü',
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
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
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
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Birim</span>
              <div className="text-2xl font-semibold text-slate-900">{totalUnits}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <ScaleIcon className="w-5 h-5" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Birim</span>
              <div className="text-2xl font-semibold text-slate-900">{activeUnits}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <CheckCircleIcon className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Temel Birim</span>
              <div className="text-2xl font-semibold text-slate-900">{baseUnits}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <LinkIcon className="w-4 h-4 text-violet-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Türetilmiş Birim</span>
              <div className="text-2xl font-semibold text-slate-900">{derivedUnits}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <ArrowsRightLeftIcon className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ScaleIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Birimler"
        description="Ürün ölçü birimlerini yönetin"
        itemCount={filteredUnits.length}
        primaryAction={{
          label: 'Yeni Birim',
          onClick: () => router.push('/inventory/units/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Birim ara... (ad, kod, sembol)"
          prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
          className="h-10"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredUnits}
            rowKey="id"
            loading={isLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} birim`,
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
