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

// Monochrome customer type configuration
const customerTypeConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Individual: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Bireysel' },
  Corporate: { color: '#334155', bgColor: '#f1f5f9', label: 'Kurumsal' },
  Government: { color: '#475569', bgColor: '#e2e8f0', label: 'Kamu' },
  NonProfit: { color: '#64748b', bgColor: '#f1f5f9', label: 'Kar Amaci Gütmeyen' },
};

// Monochrome customer status configuration
const customerStatusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Active: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Aktif' },
  Inactive: { color: '#64748b', bgColor: '#f1f5f9', label: 'Pasif' },
  Prospect: { color: '#334155', bgColor: '#e2e8f0', label: 'Aday' },
  Suspended: { color: '#475569', bgColor: '#cbd5e1', label: 'Askiya Alinmis' },
};

export default function CustomersPage() {
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

  // API Hooks
  const { data, isLoading, refetch } = useCustomers({
    pageNumber: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesType = !selectedType || customer.customerType === selectedType;
      const matchesStatus = !selectedStatus || customer.status === selectedStatus;
      return matchesType && matchesStatus;
    });
  }, [customers, selectedType, selectedStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === 'Active').length;
    const corporate = customers.filter((c) => c.customerType === 'Corporate').length;
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
      render: (type: string) => {
        const config = customerTypeConfig[type] || { color: '#64748b', bgColor: '#f1f5f9', label: type };
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
      render: (status: string) => {
        const config = customerStatusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: status };
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
            onChange={setSelectedType}
            options={Object.entries(customerTypeConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 160 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={Object.entries(customerStatusConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
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
          {filteredCustomers.length} musteri listeleniyor
        </div>

        <Table
          columns={columns}
          dataSource={filteredCustomers}
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
