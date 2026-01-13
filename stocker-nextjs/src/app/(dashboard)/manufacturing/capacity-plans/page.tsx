'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Space, Dropdown, Empty, Tag, Progress } from 'antd';
import { ArrowPathIcon, EllipsisHorizontalIcon, EyeIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon, CheckCircleIcon, ClockIcon, ChartBarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useCapacityPlans } from '@/lib/api/hooks/useManufacturing';
import type { CapacityPlanListDto, CapacityPlanStatus, PeriodType } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<CapacityPlanStatus, { color: string; bgColor: string; label: string }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak' },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı' },
  Executed: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Yürütüldü' },
  Cancelled: { color: '#94a3b8', bgColor: '#f8fafc', label: 'İptal' },
};

const periodLabels: Record<PeriodType, string> = { Daily: 'Günlük', Weekly: 'Haftalık', Monthly: 'Aylık' };

interface FilterState { searchText: string; status?: CapacityPlanStatus; }
const defaultFilters: FilterState = { searchText: '', status: undefined };

export default function CapacityPlansPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(filters.searchText); setCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  const { data: plans = [], isLoading, refetch } = useCapacityPlans({ status: filters.status });

  const filteredPlans = useMemo(() => plans.filter((p) => !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase())), [plans, debouncedSearch]);

  const stats = useMemo(() => ({
    total: plans.length,
    executed: plans.filter(p => p.status === 'Executed').length,
    draft: plans.filter(p => p.status === 'Draft').length,
    avgUtilization: plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + (p.utilizationRate || 0), 0) / plans.length) : 0,
  }), [plans]);

  const hasActiveFilters = filters.searchText !== '' || filters.status !== undefined;
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(defaultFilters);
  const handleView = (id: string) => router.push(`/manufacturing/capacity-plans/${id}`);

  const columns: ColumnsType<CapacityPlanListDto> = [
    { title: 'Ad', key: 'name', width: 200, render: (_, record) => <span className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleView(record.id)}>{record.name}</span> },
    { title: 'Durum', dataIndex: 'status', key: 'status', width: 120, render: (status: CapacityPlanStatus) => { const c = statusConfig[status]; return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: c.bgColor, color: c.color }}>{c.label}</span>; } },
    { title: 'Periyot', dataIndex: 'periodType', key: 'periodType', width: 100, render: (type: PeriodType) => <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">{periodLabels[type]}</Tag> },
    { title: 'Dönem', key: 'period', width: 180, render: (_, record) => <div className="text-sm"><span className="text-slate-600">{dayjs(record.planningHorizonStart).format('DD.MM.YYYY')}</span><span className="text-slate-400 mx-2">→</span><span className="text-slate-600">{dayjs(record.planningHorizonEnd).format('DD.MM.YYYY')}</span></div> },
    { title: 'Kullanım', key: 'utilization', width: 150, render: (_, record) => <Progress percent={record.utilizationRate || 0} size="small" strokeColor={(record.utilizationRate || 0) > 90 ? '#ef4444' : '#475569'} trailColor="#e2e8f0" /> },
    { title: 'İş Merkezi', dataIndex: 'workCenterCount', key: 'workCenterCount', width: 100, align: 'center' },
    { title: 'İşlemler', key: 'actions', width: 80, fixed: 'right', render: (_, record) => <Dropdown menu={{ items: [{ key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Görüntüle', onClick: () => handleView(record.id) }] }} trigger={['click']}><Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600" /></Dropdown> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold text-slate-900">Kapasite Planları</h1><p className="text-slate-500 mt-1">Üretim kapasitesi planlaması ve optimizasyonu</p></div>
        <Space><Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} loading={isLoading} className="!border-slate-300 !text-slate-700">Yenile</Button><Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/manufacturing/capacity-plans/new')} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">Yeni Plan</Button></Space>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-8">
        {[{ label: 'Toplam', value: stats.total, icon: CalendarDaysIcon }, { label: 'Yürütüldü', value: stats.executed, icon: CheckCircleIcon }, { label: 'Taslak', value: stats.draft, icon: ClockIcon }, { label: 'Ort. Kullanım', value: `${stats.avgUtilization}%`, icon: ChartBarIcon }].map((s, i) => (
          <div key={i} className="col-span-12 md:col-span-3"><div className="bg-white border border-slate-200 rounded-xl p-5"><div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3"><s.icon className="w-5 h-5 text-slate-600" /></div><div className="text-2xl font-bold text-slate-900">{s.value}</div><div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{s.label}</div></div></div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <Input placeholder="Plan adı ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />} value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} allowClear style={{ width: 280 }} className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg" />
          <Select placeholder="Durum" value={filters.status} onChange={(v) => updateFilter('status', v)} allowClear style={{ width: 140 }} options={[{ value: 'Draft', label: 'Taslak' }, { value: 'Approved', label: 'Onaylı' }, { value: 'Executed', label: 'Yürütüldü' }, { value: 'Cancelled', label: 'İptal' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
          {hasActiveFilters && <Button onClick={clearFilters} icon={<XMarkIcon className="w-4 h-4" />} className="!border-slate-300 ml-auto">Filtreleri Temizle</Button>}
        </div>
        <Table columns={columns} dataSource={filteredPlans} rowKey="id" loading={isLoading} scroll={{ x: 1000 }} pagination={{ current: currentPage, pageSize, total: filteredPlans.length, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} plan`, onChange: (page, size) => { setCurrentPage(page); setPageSize(size); } }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Kapasite planı bulunamadı" /> }} className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100" />
      </div>
    </div>
  );
}
