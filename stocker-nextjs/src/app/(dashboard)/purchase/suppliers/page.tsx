'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Tag, Dropdown, Select } from 'antd';
import { Spinner } from '@/components/primitives';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  StarIcon,
  TableCellsIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useSuppliers,
  useDeleteSupplier,
  useActivateSupplier,
  useDeactivateSupplier,
  useBlockSupplier,
} from '@/lib/api/hooks/usePurchase';
import type { SupplierListDto, SupplierStatus, SupplierType } from '@/lib/api/services/purchase.types';
import { exportToExcel, type ExportColumn } from '@/lib/utils/export';
import { confirmDelete, showSuccess, showError, showWarning, confirmAction } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

const statusConfig: Record<SupplierStatus, { color: string; label: string; bgColor: string; tagColor: string }> = {
  Active: { color: '#10b981', label: 'Aktif', bgColor: '#10b98115', tagColor: 'green' },
  Inactive: { color: '#64748b', label: 'Pasif', bgColor: '#64748b15', tagColor: 'default' },
  Pending: { color: '#f59e0b', label: 'Onay Bekliyor', bgColor: '#f59e0b15', tagColor: 'orange' },
  Blacklisted: { color: '#ef4444', label: 'Bloklu', bgColor: '#ef444415', tagColor: 'red' },
  OnHold: { color: '#eab308', label: 'Beklemede', bgColor: '#eab30815', tagColor: 'gold' },
};

const typeLabels: Record<SupplierType, string> = {
  Manufacturer: 'Üretici',
  Wholesaler: 'Toptancı',
  Distributor: 'Distribütör',
  Importer: 'İthalatçı',
  Retailer: 'Perakendeci',
  ServiceProvider: 'Hizmet Sağlayıcı',
  Other: 'Diğer',
};

export default function SuppliersPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<SupplierType | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data: suppliersData, isLoading, refetch } = useSuppliers({
    searchTerm: searchText || undefined,
    status: statusFilter,
    type: typeFilter,
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteSupplier = useDeleteSupplier();
  const activateSupplier = useActivateSupplier();
  const deactivateSupplier = useDeactivateSupplier();
  const blockSupplier = useBlockSupplier();

  const suppliers = suppliersData?.items || [];
  const totalCount = suppliersData?.totalCount || 0;

  // Statistics
  const stats = useMemo(() => {
    const all = suppliers;
    return {
      total: totalCount,
      active: all.filter(s => s.status === 'Active').length,
      inactive: all.filter(s => s.status === 'Inactive').length,
      blocked: all.filter(s => s.status === 'Blacklisted').length,
    };
  }, [suppliers, totalCount]);

  const handleDelete = async (record: SupplierListDto) => {
    const confirmed = await confirmDelete('Tedarikçi', record.name, 'Bu işlem geri alınamaz!');
    if (confirmed) {
      try {
        await deleteSupplier.mutateAsync(record.id);
        showSuccess('Başarılı', 'Tedarikçi silindi');
      } catch {
        showError('Tedarikçi silinemedi');
      }
    }
  };

  const handleStatusChange = async (record: SupplierListDto, newStatus: 'activate' | 'deactivate' | 'block') => {
    try {
      if (newStatus === 'activate') {
        await activateSupplier.mutateAsync(record.id);
        showSuccess('Başarılı', 'Tedarikçi aktifleştirildi');
      } else if (newStatus === 'deactivate') {
        await deactivateSupplier.mutateAsync(record.id);
        showSuccess('Başarılı', 'Tedarikçi pasifleştirildi');
      } else if (newStatus === 'block') {
        const confirmed = await confirmAction('Tedarikçiyi Blokla', 'Bu tedarikçiyi bloklamak istediğinizden emin misiniz?', 'Blokla');
        if (confirmed) {
          await blockSupplier.mutateAsync({ id: record.id, reason: 'Manual block' });
          showSuccess('Başarılı', 'Tedarikçi bloklandı');
        }
      }
    } catch {
      showError('İşlem başarısız oldu');
    }
  };

  // Bulk Actions
  const selectedSuppliers = suppliers.filter(s => selectedRowKeys.includes(s.id));

  const handleBulkActivate = async () => {
    const inactiveSuppliers = selectedSuppliers.filter(s => s.status !== 'Active');
    if (inactiveSuppliers.length === 0) {
      showWarning('Uyarı', 'Seçili tedarikçiler arasında aktifleştirilecek tedarikçi yok');
      return;
    }
    setBulkLoading(true);
    try {
      await Promise.all(inactiveSuppliers.map(s => activateSupplier.mutateAsync(s.id)));
      showSuccess('Başarılı', `${inactiveSuppliers.length} tedarikçi aktifleştirildi`);
      setSelectedRowKeys([]);
      refetch();
    } catch {
      showError('Bazı tedarikçiler aktifleştirilemedi');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    const activeSuppliers = selectedSuppliers.filter(s => s.status === 'Active');
    if (activeSuppliers.length === 0) {
      showWarning('Uyarı', 'Seçili tedarikçiler arasında pasifleştirilecek tedarikçi yok');
      return;
    }
    setBulkLoading(true);
    try {
      await Promise.all(activeSuppliers.map(s => deactivateSupplier.mutateAsync(s.id)));
      showSuccess('Başarılı', `${activeSuppliers.length} tedarikçi pasifleştirildi`);
      setSelectedRowKeys([]);
      refetch();
    } catch {
      showError('Bazı tedarikçiler pasifleştirilemedi');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkBlock = async () => {
    const blockableSuppliers = selectedSuppliers.filter(s => s.status !== 'Blacklisted');
    if (blockableSuppliers.length === 0) {
      showWarning('Uyarı', 'Seçili tedarikçiler arasında bloklanacak tedarikçi yok');
      return;
    }
    const confirmed = await confirmAction('Toplu Blokla', `${blockableSuppliers.length} tedarikçiyi bloklamak istediğinizden emin misiniz?`, 'Blokla');
    if (confirmed) {
      setBulkLoading(true);
      try {
        await Promise.all(blockableSuppliers.map(s => blockSupplier.mutateAsync({ id: s.id, reason: 'Bulk block' })));
        showSuccess('Başarılı', `${blockableSuppliers.length} tedarikçi bloklandı`);
        setSelectedRowKeys([]);
        refetch();
      } catch {
        showError('Bazı tedarikçiler bloklanamadı');
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSuppliers.length === 0) return;
    const confirmed = await confirmDelete('tedarikçi', `${selectedSuppliers.length} adet`, 'Bu işlem geri alınamaz!');
    if (confirmed) {
      setBulkLoading(true);
      try {
        await Promise.all(selectedSuppliers.map(s => deleteSupplier.mutateAsync(s.id)));
        showSuccess('Başarılı', `${selectedSuppliers.length} tedarikçi silindi`);
        setSelectedRowKeys([]);
        refetch();
      } catch {
        showError('Bazı tedarikçiler silinemedi');
      } finally {
        setBulkLoading(false);
      }
    }
  };

  // Export Functions
  const exportColumns: ExportColumn<SupplierListDto>[] = [
    { key: 'code', title: 'Tedarikçi Kodu' },
    { key: 'name', title: 'Tedarikçi Adı' },
    { key: 'type', title: 'Tip', render: (v) => typeLabels[v as SupplierType] || v },
    { key: 'email', title: 'E-posta' },
    { key: 'phone', title: 'Telefon' },
    { key: 'city', title: 'Şehir' },
    { key: 'currentBalance', title: 'Bakiye', render: (v, r) => `${(v || 0).toLocaleString('tr-TR')} ${r.currency || 'TRY'}` },
    { key: 'rating', title: 'Puan', render: (v) => v?.toFixed(1) || '-' },
    { key: 'status', title: 'Durum', render: (v) => statusConfig[v as SupplierStatus]?.label || v },
  ];

  const handleExportExcel = async () => {
    const dataToExport = selectedRowKeys.length > 0 ? selectedSuppliers : suppliers;
    await exportToExcel(dataToExport, exportColumns, `tedarikciler-${dayjs().format('YYYY-MM-DD')}`, 'Tedarikçiler');
    showSuccess('Başarılı', 'Excel dosyası indirildi');
  };

  // Row Selection
  const rowSelection: TableProps<SupplierListDto>['rowSelection'] = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  };

  const columns: ColumnsType<SupplierListDto> = [
    {
      title: 'Tedarikçi',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: statusConfig[record.status as SupplierStatus]?.bgColor || '#64748b15' }}
          >
            <BuildingStorefrontIcon className="w-5 h-5" style={{ color: statusConfig[record.status as SupplierStatus]?.color || '#64748b' }} />
          </div>
          <div>
            <div
              className="text-sm font-medium text-slate-900 cursor-pointer hover:text-indigo-600"
              onClick={(e) => { e.stopPropagation(); router.push(`/purchase/suppliers/${record.id}`); }}
            >
              {record.name}
            </div>
            <div className="text-xs text-slate-500">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (type: string) => (
        <span className="text-sm text-slate-600">{typeLabels[type as SupplierType] || type}</span>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          {record.email && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <EnvelopeIcon className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[150px]">{record.email}</span>
            </div>
          )}
          {record.phone && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <PhoneIcon className="w-3 h-3 text-slate-400" />
              <span>{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Şehir',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      render: (city) => <span className="text-sm text-slate-600">{city || '-'}</span>,
    },
    {
      title: 'Bakiye',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      width: 130,
      align: 'right',
      render: (balance, record) => (
        <span className={`text-sm font-medium ${balance > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
          {(balance || 0).toLocaleString('tr-TR')} {record.currency}
        </span>
      ),
    },
    {
      title: 'Puan',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      align: 'center',
      render: (rating) => (
        <div className="flex items-center justify-center gap-1">
          <StarIcon className="w-3 h-3 text-amber-400" />
          <span className="font-medium text-slate-700">{rating?.toFixed(1) || '-'}</span>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: SupplierStatus) => {
        const config = statusConfig[status] || statusConfig.Inactive;
        return <Tag color={config.tagColor}>{config.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 50,
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          { key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Görüntüle', onClick: () => router.push(`/purchase/suppliers/${record.id}`) },
          { key: 'edit', icon: <PencilIcon className="w-4 h-4" />, label: 'Düzenle', onClick: () => router.push(`/purchase/suppliers/${record.id}/edit`) },
          { type: 'divider' },
          ...(record.status !== 'Active' ? [{ key: 'activate', icon: <CheckCircleIcon className="w-4 h-4" />, label: 'Aktifleştir', onClick: () => handleStatusChange(record, 'activate') }] : []),
          ...(record.status === 'Active' ? [{ key: 'deactivate', icon: <NoSymbolIcon className="w-4 h-4" />, label: 'Devre Dışı Bırak', onClick: () => handleStatusChange(record, 'deactivate') }] : []),
          ...(record.status !== 'Blacklisted' ? [{ key: 'block', icon: <NoSymbolIcon className="w-4 h-4" />, label: 'Blokla', danger: true, onClick: () => handleStatusChange(record, 'block') }] : []),
          { type: 'divider' },
          { key: 'delete', icon: <TrashIcon className="w-4 h-4" />, label: 'Sil', danger: true, onClick: () => handleDelete(record) },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
              <EllipsisVerticalIcon className="w-4 h-4 text-slate-400" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ListPageHeader
        title="Tedarikçiler"
        description="Tedarikçi firmalarınızı yönetin"
        icon={<BuildingStorefrontIcon className="w-5 h-5 text-purple-600" />}
        primaryAction={{
          label: 'Yeni Tedarikçi',
          icon: <PlusIcon className="w-4 h-4" />,
          onClick: () => router.push('/purchase/suppliers/new'),
        }}
        secondaryActions={
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            <TableCellsIcon className="w-4 h-4" />
            Excel İndir
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6366f115' }}>
              <BuildingStorefrontIcon className="w-6 h-6" style={{ color: '#6366f1' }} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-500">Toplam Tedarikçi</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-6 h-6" style={{ color: '#10b981' }} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.active}</div>
              <div className="text-sm text-slate-500">Aktif</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#64748b15' }}>
              <NoSymbolIcon className="w-6 h-6" style={{ color: '#64748b' }} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.inactive}</div>
              <div className="text-sm text-slate-500">Pasif</div>
            </div>
          </div>
        </Card>
        <Card className="bg-white border border-slate-200">
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ef444415' }}>
              <CurrencyDollarIcon className="w-6 h-6" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stats.blocked}</div>
              <div className="text-sm text-slate-500">Bloklu</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-slate-200 mb-6">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Tedarikçi ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-72"
              allowClear
            />
            <Select
              placeholder="Durum"
              allowClear
              className="w-40"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'Active', label: 'Aktif' },
                { value: 'Inactive', label: 'Pasif' },
                { value: 'Blacklisted', label: 'Bloklu' },
                { value: 'Pending', label: 'Onay Bekliyor' },
                { value: 'OnHold', label: 'Beklemede' },
              ]}
            />
            <Select
              placeholder="Tip"
              allowClear
              className="w-40"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'Manufacturer', label: 'Üretici' },
                { value: 'Distributor', label: 'Distribütör' },
                { value: 'Wholesaler', label: 'Toptancı' },
                { value: 'Retailer', label: 'Perakendeci' },
                { value: 'ServiceProvider', label: 'Hizmet Sağlayıcı' },
                { value: 'Importer', label: 'İthalatçı' },
                { value: 'Other', label: 'Diğer' },
              ]}
            />
          </div>

          {/* Bulk Actions Bar */}
          {selectedRowKeys.length > 0 && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700">
                {selectedRowKeys.length} tedarikçi seçildi
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={handleBulkActivate}
                  disabled={bulkLoading}
                >
                  <CheckCircleIcon className="w-3 h-3" />
                  Aktifleştir
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={handleBulkDeactivate}
                  disabled={bulkLoading}
                >
                  <NoSymbolIcon className="w-3 h-3" />
                  Pasifleştir
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={handleBulkBlock}
                  disabled={bulkLoading}
                >
                  <NoSymbolIcon className="w-3 h-3" />
                  Blokla
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                >
                  <TrashIcon className="w-3 h-3" />
                  Sil
                </button>
                <button
                  className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  onClick={() => setSelectedRowKeys([])}
                >
                  Temizle
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <DataTableWrapper>
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          loading={isLoading || bulkLoading}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => <span className="text-sm text-slate-500">Toplam {total} tedarikçi</span>,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase/suppliers/${record.id}`),
            className: 'cursor-pointer',
          })}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
