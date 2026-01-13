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
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { useQualityInspections } from '@/lib/api/hooks/useManufacturing';
import type { QualityInspectionListDto, InspectionStatus, InspectionType, InspectionResult } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<InspectionStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: '#64748b', bgColor: '#f1f5f9', label: 'Bekliyor', icon: <ClockIcon className="w-3 h-3" /> },
  InProgress: { color: '#334155', bgColor: '#e2e8f0', label: 'Devam Ediyor', icon: <BeakerIcon className="w-3 h-3" /> },
  Completed: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Cancelled: { color: '#94a3b8', bgColor: '#f8fafc', label: 'İptal', icon: <XCircleIcon className="w-3 h-3" /> },
};

const typeLabels: Record<InspectionType, string> = {
  Incoming: 'Giriş',
  InProcess: 'Proses',
  Final: 'Final',
  Random: 'Rastgele',
};

const resultConfig: Record<InspectionResult, { color: string; bgColor: string; label: string }> = {
  Pass: { color: '#166534', bgColor: '#dcfce7', label: 'Geçti' },
  Fail: { color: '#991b1b', bgColor: '#fee2e2', label: 'Kaldı' },
  Conditional: { color: '#92400e', bgColor: '#fef3c7', label: 'Şartlı Geçti' },
};

interface FilterState {
  searchText: string;
  status?: InspectionStatus;
  inspectionType?: InspectionType;
}

const defaultFilters: FilterState = {
  searchText: '',
  status: undefined,
  inspectionType: undefined,
};

export default function QualityInspectionsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  const { data: inspections = [], isLoading, refetch } = useQualityInspections({
    inspectionType: filters.inspectionType,
  });

  const filteredInspections = useMemo(() => {
    return inspections.filter((i) => {
      const matchesSearch = !debouncedSearch ||
        i.inspectionNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        i.productName.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [inspections, debouncedSearch]);

  const stats = useMemo(() => ({
    total: inspections.length,
    pending: inspections.filter(i => i.status === 'Pending').length,
    inProgress: inspections.filter(i => i.status === 'InProgress').length,
    completed: inspections.filter(i => i.status === 'Completed').length,
  }), [inspections]);

  const hasActiveFilters = filters.searchText !== '' || filters.status !== undefined || filters.inspectionType !== undefined;

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(defaultFilters);

  const handleView = (id: string) => router.push(`/manufacturing/quality-inspections/${id}`);

  const columns: ColumnsType<QualityInspectionListDto> = [
    {
      title: 'Kontrol No',
      key: 'inspectionNumber',
      width: 140,
      render: (_, record) => (
        <span className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleView(record.id)}>
          {record.inspectionNumber}
        </span>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      width: 100,
      render: (type: InspectionType) => (
        <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">{typeLabels[type]}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: InspectionStatus) => {
        const config = statusConfig[status];
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: config.bgColor, color: config.color }}>
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Sonuç',
      dataIndex: 'result',
      key: 'result',
      width: 120,
      render: (result: InspectionResult) => {
        const config = resultConfig[result];
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: config.bgColor, color: config.color }}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 180,
      render: (_, record) => {
        const inspected = record.inspectedQuantity || 0;
        const passed = record.passedQuantity || 0;
        const passRate = inspected > 0 ? Math.round((passed / inspected) * 100) : 0;
        return (
          <div>
            <div className="text-xs text-slate-500 mb-1">
              {passed} / {inspected} geçti
            </div>
            <Progress percent={passRate} size="small" strokeColor="#475569" trailColor="#e2e8f0" />
          </div>
        );
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 100,
      render: (date) => <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [{ key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Görüntüle', onClick: () => handleView(record.id) }],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kalite Kontrolleri</h1>
          <p className="text-slate-500 mt-1">Kalite kontrol ve muayene süreçlerini yönetin</p>
        </div>
        <Space>
          <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} loading={isLoading} className="!border-slate-300 !text-slate-700">Yenile</Button>
          <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/manufacturing/quality-inspections/new')} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">Yeni Kontrol</Button>
        </Space>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {[
          { label: 'Toplam', value: stats.total, icon: ClipboardDocumentCheckIcon, bg: 'bg-slate-100' },
          { label: 'Bekliyor', value: stats.pending, icon: ClockIcon, bg: 'bg-slate-200' },
          { label: 'Devam Ediyor', value: stats.inProgress, icon: BeakerIcon, bg: 'bg-slate-300' },
          { label: 'Tamamlandı', value: stats.completed, icon: CheckCircleIcon, bg: 'bg-slate-100' },
        ].map((stat, i) => (
          <div key={i} className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <Input placeholder="Kontrol no veya ürün ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />} value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} allowClear style={{ width: 280 }} className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg" />
          <Select placeholder="Durum" value={filters.status} onChange={(v) => updateFilter('status', v)} allowClear style={{ width: 150 }} options={[{ value: 'Pending', label: 'Bekliyor' }, { value: 'InProgress', label: 'Devam Ediyor' }, { value: 'Completed', label: 'Tamamlandı' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
          <Select placeholder="Tip" value={filters.inspectionType} onChange={(v) => updateFilter('inspectionType', v)} allowClear style={{ width: 120 }} options={[{ value: 'Incoming', label: 'Giriş' }, { value: 'InProcess', label: 'Proses' }, { value: 'Final', label: 'Final' }, { value: 'Random', label: 'Rastgele' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
          {hasActiveFilters && <Button onClick={clearFilters} icon={<XMarkIcon className="w-4 h-4" />} className="!border-slate-300 ml-auto">Filtreleri Temizle</Button>}
        </div>
        <Table columns={columns} dataSource={filteredInspections} rowKey="id" loading={isLoading} scroll={{ x: 1100 }} pagination={{ current: currentPage, pageSize, total: filteredInspections.length, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kontrol`, onChange: (page, size) => { setCurrentPage(page); setPageSize(size); } }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Kalite kontrolü bulunamadı" /> }} className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100" />
      </div>
    </div>
  );
}
