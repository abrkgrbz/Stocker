'use client';

/**
 * Customers List Page
 * Monochrome design system following inventory/HR patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Dropdown, Tooltip, Spin } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  StopIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  CurrencyDollarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCustomers, useDeleteCustomer } from '@/lib/api/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import { confirmDelete } from '@/lib/utils/sweetalert';
import type { ColumnsType } from 'antd/es/table';
import { ProtectedRoute } from '@/components/auth';

// Monochrome customer type configuration - matches backend enum values
const customerTypeConfig: Record<string | number, { color: string; bgColor: string; label: string }> = {
  // String keys for string enum values
  Individual: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Bireysel' },
  Corporate: { color: '#334155', bgColor: '#f1f5f9', label: 'Kurumsal' },
  // Numeric keys for numeric enum values (backend sends numbers)
  0: { color: '#64748b', bgColor: '#f1f5f9', label: 'Belirtilmemis' },  // Default/unset
  1: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Bireysel' },       // Individual = 1
  2: { color: '#334155', bgColor: '#f1f5f9', label: 'Kurumsal' },       // Corporate = 2
};

// Monochrome customer status configuration - matches backend enum values
const customerStatusConfig: Record<string | number, { color: string; bgColor: string; label: string }> = {
  // String keys for string enum values
  Potential: { color: '#334155', bgColor: '#e2e8f0', label: 'Potansiyel' },
  Active: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Aktif' },
  Inactive: { color: '#64748b', bgColor: '#f1f5f9', label: 'Pasif' },
  // Numeric keys for numeric enum values (backend sends numbers)
  0: { color: '#64748b', bgColor: '#f1f5f9', label: 'Belirtilmemis' },  // Default/unset
  1: { color: '#334155', bgColor: '#e2e8f0', label: 'Potansiyel' },     // Potential = 1
  2: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Aktif' },          // Active = 2
  3: { color: '#64748b', bgColor: '#f1f5f9', label: 'Pasif' },          // Inactive = 3
};

function CustomersPageContent() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

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

  // Map filter values to backend enum names
  const customerTypeMap: Record<string, 'Individual' | 'Corporate'> = {
    '1': 'Individual',
    '2': 'Corporate',
  };
  const statusMap: Record<string, 'Potential' | 'Active' | 'Inactive'> = {
    '1': 'Potential',
    '2': 'Active',
    '3': 'Inactive',
  };

  // API Hooks - send filters to backend
  const { data, isLoading, refetch } = useCustomers({
    pageNumber: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    customerType: selectedType ? customerTypeMap[selectedType] : undefined,
    status: selectedStatus ? statusMap[selectedStatus] : undefined,
  });
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats - convert to string for comparison since backend may send numbers or strings
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => String(c.status) === '2' || String(c.status) === 'Active').length;
    const corporate = customers.filter((c) => String(c.customerType) === '2' || String(c.customerType) === 'Corporate').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
    return { total, active, corporate, totalRevenue };
  }, [customers]);

  // CRUD Handlers
  const handleView = (id: string) => {
    router.push(`/crm/customers/${id}`);
  };

  const handleEdit = (customer: Customer) => {
    router.push(`/crm/customers/${customer.id}/edit`);
  };

  const handleDelete = async (customer: Customer) => {
    const confirmed = await confirmDelete('Musteri', customer.companyName);
    if (confirmed) {
      try {
        await deleteCustomer.mutateAsync(customer.id);
        showSuccess('Musteri basariyla silindi!');
      } catch (err) {
        showApiError(err, 'Musteri silinirken bir hata olustu');
      }
    }
  };

  const handleCreate = () => {
    router.push('/crm/customers/new');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedType(undefined);
    setSelectedStatus(undefined);
  };

  // Table columns
  const columns: ColumnsType<Customer> = [
    {
      title: 'Musteri',
      key: 'customer',
      width: 280,
      render: (_, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {record.companyName}
          </span>
          <div className="text-xs text-slate-500">
            {record.contactPerson && `${record.contactPerson} - `}
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Tur',
      dataIndex: 'customerType',
      key: 'customerType',
      width: 140,
      render: (type: string | number | null | undefined) => {
        // Handle null/undefined and convert to lookup key
        const key = type ?? 0;
        const config = customerTypeConfig[key] || customerTypeConfig[String(key)] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Belirtilmemis' };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone) => <span className="text-slate-600">{phone || '-'}</span>,
    },
    {
      title: 'Sehir',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      render: (city) => <span className="text-slate-600">{city || '-'}</span>,
    },
    {
      title: 'Toplam Satis',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      width: 140,
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-slate-900">
          {value ? `₺${value.toLocaleString('tr-TR')}` : '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string | number | null | undefined) => {
        // Handle null/undefined and convert to lookup key
        const key = status ?? 0;
        const config = customerStatusConfig[key] || customerStatusConfig[String(key)] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Belirtilmemis' };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Goruntule',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Duzenle',
            onClick: () => handleEdit(record),
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
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Musteriler</h1>
            <p className="text-sm text-slate-500">Musteri portfoyunuzu yonetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            onClick={handleCreate}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Musteri Ekle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Musteri</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Musteri</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.corporate}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kurumsal</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">₺{stats.totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Satis</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Musteri ara... (sirket adi, yetkili kisi, e-posta)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Musteri Turu"
            allowClear
            style={{ width: 160 }}
            value={selectedType}
            onChange={(value) => {
              setSelectedType(value);
              setCurrentPage(1);
            }}
            options={[
              { value: '1', label: 'Bireysel' },
              { value: '2', label: 'Kurumsal' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 160 }}
            value={selectedStatus}
            onChange={(value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            }}
            options={[
              { value: '1', label: 'Potansiyel' },
              { value: '2', label: 'Aktif' },
              { value: '3', label: 'Pasif' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Button onClick={clearFilters} className="!border-slate-300 !text-slate-600">
            Temizle
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Results count */}
        <div className="text-sm text-slate-500 mb-4">
          {customers.length} musteri listeleniyor
        </div>

        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} musteri`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <ProtectedRoute permission="CRM.Customers:View">
      <CustomersPageContent />
    </ProtectedRoute>
  );
}
