'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Dropdown,
  Tag,
  Empty,
} from 'antd';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { useBillOfMaterials, useDeleteBillOfMaterial, useApproveBillOfMaterial, useActivateBillOfMaterial } from '@/lib/api/hooks/useManufacturing';
import type { BillOfMaterialListDto, BomStatus } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// BOM status configuration - monochrome palette
const bomStatusConfig: Record<BomStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak', icon: <ClockIcon className="w-3 h-3" /> },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Active: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Aktif', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Obsolete: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Geçersiz', icon: <ArchiveBoxIcon className="w-3 h-3" /> },
};

// Filter state interface
interface FilterState {
  searchText: string;
  status?: BomStatus;
  isDefault?: boolean;
}

const defaultFilters: FilterState = {
  searchText: '',
  status: undefined,
  isDefault: undefined,
};

export default function BillOfMaterialsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  // API Hooks
  const { data: boms = [], isLoading, refetch } = useBillOfMaterials({
    status: filters.status,
    defaultOnly: filters.isDefault,
  });
  const deleteBom = useDeleteBillOfMaterial();
  const approveBom = useApproveBillOfMaterial();
  const activateBom = useActivateBillOfMaterial();

  // Filter BOMs
  const filteredBoms = useMemo(() => {
    return boms.filter((bom) => {
      const matchesSearch = !debouncedSearch ||
        bom.bomNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        bom.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        bom.productCode.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [boms, debouncedSearch]);

  // Stats
  const stats = useMemo(() => ({
    total: boms.length,
    active: boms.filter(b => b.status === 'Active').length,
    draft: boms.filter(b => b.status === 'Draft').length,
    approved: boms.filter(b => b.status === 'Approved').length,
  }), [boms]);

  // Check if filters are modified
  const hasActiveFilters = useMemo(() => {
    return filters.searchText !== '' || filters.status !== undefined || filters.isDefault !== undefined;
  }, [filters]);

  // Filter handlers
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Action handlers
  const handleView = (id: string) => {
    router.push(`/manufacturing/bom/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/manufacturing/bom/${id}/edit`);
  };

  const handleDelete = async (bom: BillOfMaterialListDto) => {
    const confirmed = await confirmDelete('Ürün Reçetesi', bom.bomNumber);
    if (confirmed) {
      try {
        await deleteBom.mutateAsync(bom.id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleApprove = async (bom: BillOfMaterialListDto) => {
    if (bom.status !== 'Draft') return;
    try {
      await approveBom.mutateAsync(bom.id);
    } catch {
      // Error handled by hook
    }
  };

  const handleActivate = async (bom: BillOfMaterialListDto) => {
    if (bom.status !== 'Approved') return;
    try {
      await activateBom.mutateAsync(bom.id);
    } catch {
      // Error handled by hook
    }
  };

  // Table columns
  const columns: ColumnsType<BillOfMaterialListDto> = [
    {
      title: 'Reçete No',
      key: 'bomNumber',
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {record.bomNumber}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">v{record.version}</span>
            {record.isDefault && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-900 text-white">
                Varsayılan
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: BomStatus) => {
        const config = bomStatusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: status, icon: null };
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Malzeme Sayısı',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold">
          {count}
        </span>
      ),
    },
    {
      title: 'Geçerlilik Tarihi',
      key: 'effectiveDate',
      width: 180,
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-slate-900">{dayjs(record.effectiveDate).format('DD.MM.YYYY')}</div>
          {record.expiryDate && (
            <div className="text-xs text-slate-500">
              Bitiş: {dayjs(record.expiryDate).format('DD.MM.YYYY')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <span className="text-sm text-slate-600">
          {dayjs(date).format('DD.MM.YYYY')}
        </span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
          },
          { type: 'divider' as const },
        ];

        if (record.status === 'Draft') {
          menuItems.push({
            key: 'approve',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Onayla',
            onClick: () => handleApprove(record),
          });
        }

        if (record.status === 'Approved') {
          menuItems.push({
            key: 'activate',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Aktifleştir',
            onClick: () => handleActivate(record),
          });
        }

        menuItems.push({ type: 'divider' as const });
        menuItems.push({
          key: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record),
        });

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
              className="text-slate-600 hover:text-slate-900"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ürün Reçeteleri (BOM)</h1>
          <p className="text-slate-500 mt-1">Ürün yapılarını ve malzeme listelerini yönetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/manufacturing/bom/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Reçete
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Reçete</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.approved}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onaylı</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.draft}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Taslak</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Reçete no, ürün adı veya kodu ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            allowClear
            style={{ width: 300 }}
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            allowClear
            style={{ width: 150 }}
            options={[
              { value: 'Draft', label: 'Taslak' },
              { value: 'Approved', label: 'Onaylı' },
              { value: 'Active', label: 'Aktif' },
              { value: 'Obsolete', label: 'Geçersiz' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Varsayılan"
            value={filters.isDefault}
            onChange={(v) => updateFilter('isDefault', v)}
            allowClear
            style={{ width: 150 }}
            options={[
              { value: true, label: 'Varsayılan' },
              { value: false, label: 'Diğerleri' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              icon={<XMarkIcon className="w-4 h-4" />}
              className="!border-slate-300 ml-auto"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredBoms}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredBoms.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} reçete`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Ürün reçetesi bulunamadı"
              />
            ),
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
