'use client';

/**
 * Departments List Page
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
  Spin,
  Segmented,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  StopOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import {
  useDepartments,
  useDeleteDepartment,
  useActivateDepartment,
  useDeactivateDepartment,
} from '@/lib/api/hooks/useHR';
import type { DepartmentDto } from '@/lib/api/services/hr.types';
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';
import { DepartmentTree } from '@/components/hr/departments/DepartmentTree';

type ViewMode = 'table' | 'tree';

export default function DepartmentsPage() {
  const router = useRouter();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
  const { data: departments = [], isLoading, refetch } = useDepartments(includeInactive);
  const deleteDepartment = useDeleteDepartment();
  const activateDepartment = useActivateDepartment();
  const deactivateDepartment = useDeactivateDepartment();

  // Filter departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        !debouncedSearch ||
        dept.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (dept.code && dept.code.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (dept.description && dept.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [departments, debouncedSearch]);

  // Calculate stats
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d) => d.isActive).length;
  const totalEmployees = departments.reduce((sum, d) => sum + (d.employeeCount || 0), 0);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/departments/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/departments/${id}/edit`);
  };

  const handleDelete = (dept: DepartmentDto) => {
    Modal.confirm({
      title: 'Departmanı Sil',
      content: `"${dept.name}" departmanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteDepartment.mutateAsync(dept.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async (dept: DepartmentDto) => {
    try {
      if (dept.isActive) {
        await deactivateDepartment.mutateAsync(dept.id);
      } else {
        await activateDepartment.mutateAsync(dept.id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setIncludeInactive(false);
  };

  // Table columns
  const columns: ColumnsType<DepartmentDto> = [
    {
      title: 'Departman',
      key: 'department',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#7c3aed15' }}>
            <ApartmentOutlined style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{record.name}</div>
            <div className="text-xs text-slate-500">{record.code || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc) => <span className="text-sm text-slate-600">{desc || <span className="text-slate-400">-</span>}</span>,
    },
    {
      title: 'Yönetici',
      dataIndex: 'managerName',
      key: 'manager',
      width: 150,
      render: (name) => <span className="text-sm text-slate-600">{name || <span className="text-slate-400">-</span>}</span>,
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeCount',
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
            icon: <EyeOutlined />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
          },
          { type: 'divider' as const },
          {
            key: 'toggle',
            icon: record.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
            label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
            onClick: () => handleToggleActive(record),
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <MoreOutlined className="text-sm" />
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
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Departman</span>
              <div className="text-2xl font-semibold text-slate-900">{totalDepartments}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#7c3aed15' }}>
              <ApartmentOutlined style={{ color: '#7c3aed' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Departman</span>
              <div className="text-2xl font-semibold text-slate-900">{activeDepartments}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
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
              <TeamOutlined style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ApartmentOutlined />}
        iconColor="#7c3aed"
        title="Departmanlar"
        description="Tüm departmanları görüntüle ve yönet"
        itemCount={filteredDepartments.length}
        primaryAction={{
          label: 'Yeni Departman',
          onClick: () => router.push('/hr/departments/new'),
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1 flex-wrap">
            <Input
              placeholder="Departman adı, kod veya açıklama ara..."
              prefix={<SearchOutlined className="text-slate-400" />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-10 max-w-xs"
            />
            <Select
              className="h-10 w-40"
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
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={[
              {
                label: (
                  <div className="flex items-center gap-2 px-1">
                    <UnorderedListOutlined />
                    <span>Liste</span>
                  </div>
                ),
                value: 'table',
              },
              {
                label: (
                  <div className="flex items-center gap-2 px-1">
                    <PartitionOutlined />
                    <span>Ağaç</span>
                  </div>
                ),
                value: 'tree',
              },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : viewMode === 'tree' ? (
        <Card>
          <DepartmentTree
            departments={filteredDepartments}
            loading={isLoading}
            onView={handleView}
          />
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredDepartments}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 900 }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredDepartments.length,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} departman`,
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
