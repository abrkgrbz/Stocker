'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Space, Dropdown, Empty, Tag } from 'antd';
import { ArrowPathIcon, EllipsisHorizontalIcon, EyeIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon, CurrencyDollarIcon, DocumentChartBarIcon, CalculatorIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { useProductCosts } from '@/lib/api/hooks/useManufacturing';
import type { ProductCostListDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface FilterState { searchText: string; }
const defaultFilters: FilterState = { searchText: '' };

export default function CostAccountingPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(filters.searchText); setCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  const { data: costs = [], isLoading, refetch } = useProductCosts({});

  const filteredCosts = useMemo(() => costs.filter((c) => !debouncedSearch || c.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) || c.productCode.toLowerCase().includes(debouncedSearch.toLowerCase())), [costs, debouncedSearch]);

  const stats = useMemo(() => ({
    total: costs.length,
    totalCost: costs.reduce((sum, c) => sum + c.totalCost, 0),
    avgMaterial: costs.length > 0 ? costs.reduce((sum, c) => sum + c.materialCost, 0) / costs.length : 0,
    avgLabor: costs.length > 0 ? costs.reduce((sum, c) => sum + c.laborCost, 0) / costs.length : 0,
  }), [costs]);

  const hasActiveFilters = filters.searchText !== '';
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(defaultFilters);
  const handleView = (id: string) => router.push(`/manufacturing/cost-accounting/${id}`);

  const formatCurrency = (val: number) => `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

  const columns: ColumnsType<ProductCostListDto> = [
    { title: 'Ürün', key: 'product', width: 250, render: (_, record) => <div><div className="font-medium text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleView(record.productId)}>{record.productName}</div><div className="text-xs text-slate-500">{record.productCode}</div></div> },
    { title: 'Malzeme', dataIndex: 'materialCost', key: 'materialCost', width: 130, align: 'right', render: (val) => <span className="font-medium text-slate-700">{formatCurrency(val)}</span> },
    { title: 'İşçilik', dataIndex: 'laborCost', key: 'laborCost', width: 130, align: 'right', render: (val) => <span className="font-medium text-slate-700">{formatCurrency(val)}</span> },
    { title: 'Genel Gider', dataIndex: 'overheadCost', key: 'overheadCost', width: 130, align: 'right', render: (val) => <span className="font-medium text-slate-700">{formatCurrency(val)}</span> },
    { title: 'Toplam Maliyet', dataIndex: 'totalCost', key: 'totalCost', width: 150, align: 'right', render: (val) => <span className="font-bold text-slate-900">{formatCurrency(val)}</span> },
    { title: 'Hesaplama', dataIndex: 'lastCalculatedAt', key: 'lastCalculatedAt', width: 120, render: (date) => <span className="text-sm text-slate-500">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span> },
    { title: 'İşlemler', key: 'actions', width: 80, fixed: 'right', render: (_, record) => <Dropdown menu={{ items: [{ key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Detay', onClick: () => handleView(record.productId) }] }} trigger={['click']}><Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600" /></Dropdown> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold text-slate-900">Maliyet Muhasebesi</h1><p className="text-slate-500 mt-1">Ürün maliyetleri ve maliyet analizi</p></div>
        <Space><Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} loading={isLoading} className="!border-slate-300 !text-slate-700">Yenile</Button><Button type="primary" icon={<CalculatorIcon className="w-4 h-4" />} onClick={() => router.push('/manufacturing/cost-accounting/calculate')} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">Maliyet Hesapla</Button></Space>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-8">
        {[{ label: 'Ürün Sayısı', value: stats.total, icon: DocumentChartBarIcon }, { label: 'Toplam Maliyet', value: formatCurrency(stats.totalCost), icon: CurrencyDollarIcon }, { label: 'Ort. Malzeme', value: formatCurrency(stats.avgMaterial), icon: ChartPieIcon }, { label: 'Ort. İşçilik', value: formatCurrency(stats.avgLabor), icon: ChartPieIcon }].map((s, i) => (
          <div key={i} className="col-span-12 md:col-span-3"><div className="bg-white border border-slate-200 rounded-xl p-5"><div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3"><s.icon className="w-5 h-5 text-slate-600" /></div><div className="text-2xl font-bold text-slate-900">{s.value}</div><div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{s.label}</div></div></div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <Input placeholder="Ürün ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />} value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)} allowClear style={{ width: 280 }} className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg" />
          {hasActiveFilters && <Button onClick={clearFilters} icon={<XMarkIcon className="w-4 h-4" />} className="!border-slate-300 ml-auto">Filtreleri Temizle</Button>}
        </div>
        <Table columns={columns} dataSource={filteredCosts} rowKey="productId" loading={isLoading} scroll={{ x: 1000 }} pagination={{ current: currentPage, pageSize, total: filteredCosts.length, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} ürün`, onChange: (page, size) => { setCurrentPage(page); setPageSize(size); } }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Maliyet kaydı bulunamadı" /> }} className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100" />
      </div>
    </div>
  );
}
