'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Space, Dropdown, Empty, Tag, Progress } from 'antd';
import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  TruckIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useSubcontractOrders } from '@/lib/api/hooks/useManufacturing';
import type { SubcontractOrderListDto, SubcontractOrderStatus } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<SubcontractOrderStatus, { color: string; bgColor: string; label: string }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak' },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı' },
  Shipped: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Gönderildi' },
  Received: { color: '#475569', bgColor: '#e2e8f0', label: 'Teslim Alındı' },
  Completed: { color: '#1e293b', bgColor: '#f8fafc', label: 'Tamamlandı' },
  Closed: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Kapatıldı' },
  Cancelled: { color: '#dc2626', bgColor: '#fee2e2', label: 'İptal' },
};

interface FilterState { searchText: string; status?: SubcontractOrderStatus; }
const defaultFilters: FilterState = { searchText: '', status: undefined };

export default function SubcontractOrdersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(filters.searchText); setCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  const { data: orders = [], isLoading, refetch } = useSubcontractOrders({ status: filters.status });

  const filteredOrders = useMemo(() => orders.filter((o) => !debouncedSearch || o.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) || o.subcontractorName.toLowerCase().includes(debouncedSearch.toLowerCase())), [orders, debouncedSearch]);

  const stats = useMemo(() => ({
    total: orders.length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    received: orders.filter(o => o.status === 'Received').length,
    totalValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  }), [orders]);

  const hasActiveFilters = filters.searchText !== '' || filters.status !== undefined;
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(defaultFilters);
  const handleView = (id: string) => router.push(`/manufacturing/subcontract-orders/${id}`);

  const formatCurrency = (val: number) => `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

  const columns: ColumnsType<SubcontractOrderListDto> = [
    { title: 'Siparis No', key: 'orderNumber', width: 140, render: (_, record) => <span className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleView(record.id)}>{record.orderNumber}</span> },
    { title: 'Fasoncü', dataIndex: 'subcontractorName', key: 'subcontractorName', width: 180 },
    { title: 'Durum', dataIndex: 'status', key: 'status', width: 130, render: (status: SubcontractOrderStatus) => { const c = statusConfig[status]; return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: c.bgColor, color: c.color }}>{c.label}</span>; } },
    { title: 'Urun', key: 'product', width: 180, render: (_, record) => <div><div className="font-medium text-slate-900">{record.productName}</div><div className="text-xs text-slate-500">{record.productCode}</div></div> },
    { title: 'Miktar', key: 'quantity', width: 150, render: (_, record) => { const pct = record.orderedQuantity > 0 ? Math.round((record.receivedQuantity / record.orderedQuantity) * 100) : 0; return <div><div className="text-xs text-slate-500 mb-1">{record.receivedQuantity} / {record.orderedQuantity}</div><Progress percent={pct} size="small" strokeColor="#475569" trailColor="#e2e8f0" /></div>; } },
    { title: 'Tutar', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, align: 'right', render: (val) => <span className="font-medium text-slate-700">{formatCurrency(val)}</span> },
    { title: 'Teslim Tarihi', dataIndex: 'expectedDeliveryDate', key: 'expectedDeliveryDate', width: 110, render: (date) => <span className={`text-sm ${dayjs(date).isBefore(dayjs()) ? 'text-red-600 font-medium' : 'text-slate-600'}`}>{dayjs(date).format('DD.MM.YYYY')}</span> },
    { title: 'Islemler', key: 'actions', width: 80, fixed: 'right', render: (_, record) => <Dropdown menu={{ items: [{ key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Goruntule', onClick: () => handleView(record.id) }] }} trigger={['click']}><Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600" /></Dropdown> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold text-slate-900">Fason Siparisler</h1><p className="text-slate-500 mt-1">Dis kaynak uretim siparisleri</p></div>
        <Space><Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} loading={isLoading} className="!border-slate-300 !text-slate-700">Yenile</Button><Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/manufacturing/subcontract-orders/new')} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">Yeni Siparis</Button></Space>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-8">
        {[{ label: 'Toplam', value: stats.total, icon: DocumentTextIcon }, { label: 'Gönderildi', value: stats.shipped, icon: TruckIcon }, { label: 'Teslim Alındı', value: stats.received, icon: BuildingOfficeIcon }, { label: 'Toplam Tutar', value: formatCurrency(stats.totalValue), icon: CurrencyDollarIcon }].map((s, i) => (
          <div key={i} className="col-span-12 md:col-span-3"><div className="bg-white border border-slate-200 rounded-xl p-5"><div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3"><s.icon className="w-5 h-5 text-slate-600" /></div><div className="text-2xl font-bold text-slate-900">{s.value}</div><div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{s.label}</div></div></div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <Input placeholder="Siparis no veya fasoncu ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />} value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} allowClear style={{ width: 280 }} className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg" />
          <Select placeholder="Durum" value={filters.status} onChange={(v) => updateFilter('status', v)} allowClear style={{ width: 150 }} options={[{ value: 'Draft', label: 'Taslak' }, { value: 'Approved', label: 'Onaylı' }, { value: 'Shipped', label: 'Gönderildi' }, { value: 'Received', label: 'Teslim Alındı' }, { value: 'Completed', label: 'Tamamlandı' }, { value: 'Closed', label: 'Kapatıldı' }, { value: 'Cancelled', label: 'İptal' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
          {hasActiveFilters && <Button onClick={clearFilters} icon={<XMarkIcon className="w-4 h-4" />} className="!border-slate-300 ml-auto">Filtreleri Temizle</Button>}
        </div>
        <Table columns={columns} dataSource={filteredOrders} rowKey="id" loading={isLoading} scroll={{ x: 1100 }} pagination={{ current: currentPage, pageSize, total: filteredOrders.length, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} siparis`, onChange: (page, size) => { setCurrentPage(page); setPageSize(size); } }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Fason siparisi bulunamadi" /> }} className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100" />
      </div>
    </div>
  );
}
