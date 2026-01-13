'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Space, Dropdown, Empty, Tag } from 'antd';
import { ArrowPathIcon, EllipsisHorizontalIcon, EyeIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon, WrenchScrewdriverIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useMaintenanceOrders } from '@/lib/api/hooks/useManufacturing';
import type { MaintenanceRecordStatus, MaintenanceType } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

// Hook'un döndürdüğü tip
interface MaintenanceOrderItem {
  id: string;
  orderNumber: string;
  workCenterId: string;
  workCenterName: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceRecordStatus;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
}

const statusConfig: Record<MaintenanceRecordStatus, { color: string; bgColor: string; label: string }> = {
  Pending: { color: '#64748b', bgColor: '#f1f5f9', label: 'Beklemede' },
  InProgress: { color: '#334155', bgColor: '#e2e8f0', label: 'Devam Ediyor' },
  Completed: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Tamamlandı' },
  Cancelled: { color: '#94a3b8', bgColor: '#f8fafc', label: 'İptal' },
};

const typeLabels: Record<MaintenanceType, string> = { Preventive: 'Önleyici', Corrective: 'Düzeltici', Predictive: 'Tahminsel', Breakdown: 'Arıza' };

interface FilterState { searchText: string; status?: MaintenanceRecordStatus; maintenanceType?: MaintenanceType; }
const defaultFilters: FilterState = { searchText: '', status: undefined, maintenanceType: undefined };

export default function MaintenancePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(filters.searchText); setCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  const { data: orders = [], isLoading, refetch } = useMaintenanceOrders({ status: filters.status, maintenanceType: filters.maintenanceType });

  const filteredOrders = useMemo(() => orders.filter((o) => !debouncedSearch || o.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) || o.workCenterName.toLowerCase().includes(debouncedSearch.toLowerCase())), [orders, debouncedSearch]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    inProgress: orders.filter(o => o.status === 'InProgress').length,
    overdue: orders.filter(o => o.status === 'Pending' && o.scheduledDate && dayjs(o.scheduledDate).isBefore(dayjs())).length,
  }), [orders]);

  const hasActiveFilters = filters.searchText !== '' || filters.status !== undefined || filters.maintenanceType !== undefined;
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(defaultFilters);
  const handleView = (id: string) => router.push(`/manufacturing/maintenance/${id}`);

  const columns: ColumnsType<MaintenanceOrderItem> = [
    { title: 'Emir No', key: 'orderNumber', width: 140, render: (_, record) => <span className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleView(record.id)}>{record.orderNumber}</span> },
    { title: 'İş Merkezi', dataIndex: 'workCenterName', key: 'workCenterName', width: 180 },
    { title: 'Tip', dataIndex: 'maintenanceType', key: 'maintenanceType', width: 110, render: (type: MaintenanceType) => <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">{typeLabels[type]}</Tag> },
    { title: 'Durum', dataIndex: 'status', key: 'status', width: 130, render: (status: MaintenanceRecordStatus) => { const c = statusConfig[status]; return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: c.bgColor, color: c.color }}>{c.label}</span>; } },
    { title: 'Açıklama', dataIndex: 'description', key: 'description', width: 200, ellipsis: true },
    { title: 'Planlanan Tarih', dataIndex: 'scheduledDate', key: 'scheduledDate', width: 120, render: (date) => <span className={`text-sm ${dayjs(date).isBefore(dayjs()) ? 'text-red-600 font-medium' : 'text-slate-600'}`}>{dayjs(date).format('DD.MM.YYYY')}</span> },
    { title: 'İşlemler', key: 'actions', width: 80, fixed: 'right', render: (_, record) => <Dropdown menu={{ items: [{ key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Görüntüle', onClick: () => handleView(record.id) }] }} trigger={['click']}><Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600" /></Dropdown> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold text-slate-900">Bakım Yönetimi</h1><p className="text-slate-500 mt-1">Ekipman bakım emirleri ve planlaması</p></div>
        <Space><Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} loading={isLoading} className="!border-slate-300 !text-slate-700">Yenile</Button><Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/manufacturing/maintenance/new')} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">Yeni Emir</Button></Space>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-8">
        {[{ label: 'Toplam', value: stats.total, icon: WrenchScrewdriverIcon, color: 'text-slate-600' }, { label: 'Beklemede', value: stats.pending, icon: ClockIcon, color: 'text-slate-700' }, { label: 'Devam Ediyor', value: stats.inProgress, icon: Cog6ToothIcon, color: 'text-slate-800' }, { label: 'Gecikmiş', value: stats.overdue, icon: ExclamationTriangleIcon, color: 'text-red-600' }].map((s, i) => (
          <div key={i} className="col-span-12 md:col-span-3"><div className="bg-white border border-slate-200 rounded-xl p-5"><div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3"><s.icon className={`w-5 h-5 ${s.color}`} /></div><div className={`text-2xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{s.label}</div></div></div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <Input placeholder="Emir no veya iş merkezi ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />} value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} allowClear style={{ width: 280 }} className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg" />
          <Select placeholder="Durum" value={filters.status} onChange={(v) => updateFilter('status', v)} allowClear style={{ width: 150 }} options={[{ value: 'Pending', label: 'Beklemede' }, { value: 'InProgress', label: 'Devam Ediyor' }, { value: 'Completed', label: 'Tamamlandı' }, { value: 'Cancelled', label: 'İptal' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
          <Select placeholder="Tip" value={filters.maintenanceType} onChange={(v) => updateFilter('maintenanceType', v)} allowClear style={{ width: 130 }} options={[{ value: 'Preventive', label: 'Önleyici' }, { value: 'Corrective', label: 'Düzeltici' }, { value: 'Predictive', label: 'Tahminsel' }, { value: 'Breakdown', label: 'Arıza' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
          {hasActiveFilters && <Button onClick={clearFilters} icon={<XMarkIcon className="w-4 h-4" />} className="!border-slate-300 ml-auto">Filtreleri Temizle</Button>}
        </div>
        <Table columns={columns} dataSource={filteredOrders} rowKey="id" loading={isLoading} scroll={{ x: 1000 }} pagination={{ current: currentPage, pageSize, total: filteredOrders.length, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} emir`, onChange: (page, size) => { setCurrentPage(page); setPageSize(size); } }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bakım emri bulunamadı" /> }} className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100" />
      </div>
    </div>
  );
}
