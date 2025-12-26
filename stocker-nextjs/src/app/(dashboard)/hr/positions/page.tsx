'use client';

/**
 * Positions List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Select,
  Dropdown,
  Modal,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  usePositions,
  useDepartments,
  useDeletePosition,
  useActivatePosition,
  useDeactivatePosition,
} from '@/lib/api/hooks/useHR';
import type { PositionDto } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

export default function PositionsPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>();
  const [includeInactive, setIncludeInactive] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data: positions = [], isLoading, refetch } = usePositions(selectedDepartment, includeInactive);
  const { data: departments = [] } = useDepartments();
  const deletePosition = useDeletePosition();
  const activatePosition = useActivatePosition();
  const deactivatePosition = useDeactivatePosition();

  // Filter positions
  const filteredPositions = useMemo(() => {
    return positions.filter((pos) => {
      const matchesSearch =
        !debouncedSearch ||
        pos.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (pos.code && pos.code.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (pos.description && pos.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [positions, debouncedSearch]);

  // Calculate stats
  const totalPositions = positions.length;
  const activePositions = positions.filter((p) => p.isActive).length;
  const totalEmployees = positions.reduce((sum, p) => sum + (p.filledPositions || 0), 0);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/positions/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/positions/${id}/edit`);
  };

  const handleDelete = (pos: PositionDto) => {
    Modal.confirm({
      title: 'Pozisyonu Sil',
      content: `"${pos.title}" pozisyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deletePosition.mutateAsync(pos.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async (pos: PositionDto) => {
    try {
      if (pos.isActive) {
        await deactivatePosition.mutateAsync(pos.id);
      } else {
        await activatePosition.mutateAsync(pos.id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment(undefined);
    setIncludeInactive(false);
  };

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  // Table columns
  const columns: ColumnsType<PositionDto> = [
    {
      title: 'Pozisyon',
      key: 'position',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
            <ShieldCheckIcon className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{record.title}</div>
            <div className="text-xs text-slate-500">{record.code || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Departman',
      dataIndex: 'departmentName',
      key: 'department',
      width: 150,
      render: (name) => <span className="text-sm text-slate-600">{name || <span className="text-slate-400">-</span>}</span>,
    },
    {
      title: 'Maaş Aralığı',
      key: 'salary',
      width: 200,
      render: (_, record) => {
        if (!record.minSalary && !record.maxSalary) return <span className="text-slate-400">-</span>;
        return (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <CurrencyDollarIcon className="w-3 h-3 text-slate-400" />
            <span>{formatCurrency(record.minSalary)} - {formatCurrency(record.maxSalary)}</span>
          </div>
        );
      },
    },
    {
      title: 'Çalışan',
      dataIndex: 'filledPositions',
      key: 'employees',
      width: 100,
      align: 'center',
      render: (count) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
          },
          { type: 'divider' as const },
          {
            key: 'toggle',
            icon: record.isActive ? <NoSymbolIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
            label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
            onClick: () => handleToggleActive(record),
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Pozisyon</span>
              <div className="text-2xl font-semibold text-slate-900">{totalPositions}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <ShieldCheckIcon className="w-6 h-6" style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Pozisyon</span>
              <div className="text-2xl font-semibold text-slate-900">{activePositions}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-6 h-6" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Çalışan</span>
              <div className="text-2xl font-semibold text-slate-900">{totalEmployees}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <UsersIcon className="w-6 h-6" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ShieldCheckIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Pozisyonlar"
        description="Tüm pozisyonları görüntüle ve yönet"
        itemCount={filteredPositions.length}
        primaryAction={{
          label: 'Yeni Pozisyon',
          onClick: () => router.push('/hr/positions/new'),
          icon: <PlusIcon className="w-5 h-5" />,
        }}
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

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Pozisyon adı, kod veya açıklama ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-10"
            />
          </div>
          <Select
            placeholder="Departman"
            allowClear
            className="h-10"
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
          />
          <Select
            className="h-10"
            value={includeInactive}
            onChange={setIncludeInactive}
            options={[
              { value: false, label: 'Sadece Aktifler' },
              { value: true, label: 'Tümü' },
            ]}
          />
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredPositions}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1000 }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredPositions.length,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} pozisyon`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
