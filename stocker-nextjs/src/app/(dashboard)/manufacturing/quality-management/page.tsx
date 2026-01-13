'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Space, Dropdown, Empty, Tag, Tabs } from 'antd';
import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useNCRs, useCAPAs } from '@/lib/api/hooks/useManufacturing';
import type { NCRListDto, CAPAListDto, NCRStatus, NCRCategory, CAPAStatus, CAPAType, NcrStatus, NcrSource, CapaStatus, CapaType } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const ncrStatusConfig: Record<NCRStatus, { color: string; bgColor: string; label: string }> = {
  Open: { color: '#64748b', bgColor: '#f1f5f9', label: 'Acik' },
  UnderReview: { color: '#334155', bgColor: '#e2e8f0', label: 'Incelemede' },
  Resolved: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Cozuldu' },
  Closed: { color: '#475569', bgColor: '#f8fafc', label: 'Kapandi' },
};

const ncrCategoryLabels: Record<NCRCategory, string> = {
  Material: 'Malzeme',
  Process: 'Proses',
  Product: 'Urun',
  Supplier: 'Tedarikci',
  Customer: 'Musteri',
};

const capaStatusConfig: Record<CAPAStatus, { color: string; bgColor: string; label: string }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak' },
  Open: { color: '#334155', bgColor: '#e2e8f0', label: 'Acik' },
  InProgress: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Devam Ediyor' },
  PendingVerification: { color: '#475569', bgColor: '#e2e8f0', label: 'Dogrulama Bekliyor' },
  Closed: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Kapandi' },
};

const capaTypeLabels: Record<CAPAType, string> = { Corrective: 'Duzeltici', Preventive: 'Onleyici' };

interface NCRFilterState { searchText: string; status?: NCRStatus; category?: NCRCategory; }
interface CAPAFilterState { searchText: string; status?: CAPAStatus; type?: CAPAType; }

const defaultNCRFilters: NCRFilterState = { searchText: '', status: undefined, category: undefined };
const defaultCAPAFilters: CAPAFilterState = { searchText: '', status: undefined, type: undefined };

export default function QualityManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ncr');

  // NCR State
  const [ncrFilters, setNcrFilters] = useState<NCRFilterState>(defaultNCRFilters);
  const [ncrDebouncedSearch, setNcrDebouncedSearch] = useState('');
  const [ncrCurrentPage, setNcrCurrentPage] = useState(1);
  const [ncrPageSize, setNcrPageSize] = useState(10);

  // CAPA State
  const [capaFilters, setCapaFilters] = useState<CAPAFilterState>(defaultCAPAFilters);
  const [capaDebouncedSearch, setCapaDebouncedSearch] = useState('');
  const [capaCurrentPage, setCapaCurrentPage] = useState(1);
  const [capaPageSize, setCapaPageSize] = useState(10);

  // NCR Debounce
  React.useEffect(() => {
    const timer = setTimeout(() => { setNcrDebouncedSearch(ncrFilters.searchText); setNcrCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [ncrFilters.searchText]);

  // CAPA Debounce
  React.useEffect(() => {
    const timer = setTimeout(() => { setCapaDebouncedSearch(capaFilters.searchText); setCapaCurrentPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [capaFilters.searchText]);

  const { data: ncrs = [], isLoading: ncrLoading, refetch: refetchNCRs } = useNCRs({ status: ncrFilters.status as NcrStatus | undefined, category: ncrFilters.category as NcrSource | undefined });
  const { data: capas = [], isLoading: capaLoading, refetch: refetchCAPAs } = useCAPAs({ status: capaFilters.status as CapaStatus | undefined, type: capaFilters.type as CapaType | undefined });

  const filteredNCRs = useMemo(() => ncrs.filter((n) => !ncrDebouncedSearch || n.ncrNumber.toLowerCase().includes(ncrDebouncedSearch.toLowerCase()) || n.title.toLowerCase().includes(ncrDebouncedSearch.toLowerCase())), [ncrs, ncrDebouncedSearch]);
  const filteredCAPAs = useMemo(() => capas.filter((c) => !capaDebouncedSearch || c.capaNumber.toLowerCase().includes(capaDebouncedSearch.toLowerCase()) || c.title.toLowerCase().includes(capaDebouncedSearch.toLowerCase())), [capas, capaDebouncedSearch]);

  const ncrStats = useMemo(() => ({
    total: ncrs.length,
    open: ncrs.filter(n => n.status === 'Open').length,
    underReview: ncrs.filter(n => n.status === 'UnderReview').length,
    resolved: ncrs.filter(n => n.status === 'Resolved').length,
  }), [ncrs]);

  const capaStats = useMemo(() => ({
    total: capas.length,
    open: capas.filter(c => c.status === 'Open').length,
    inProgress: capas.filter(c => c.status === 'InProgress').length,
    pending: capas.filter(c => c.status === 'PendingVerification').length,
  }), [capas]);

  const ncrHasActiveFilters = ncrFilters.searchText !== '' || ncrFilters.status !== undefined || ncrFilters.category !== undefined;
  const capaHasActiveFilters = capaFilters.searchText !== '' || capaFilters.status !== undefined || capaFilters.type !== undefined;

  const handleViewNCR = (id: string) => router.push(`/manufacturing/quality-management/ncr/${id}`);
  const handleViewCAPA = (id: string) => router.push(`/manufacturing/quality-management/capa/${id}`);

  const ncrColumns: ColumnsType<NCRListDto> = [
    { title: 'NCR No', key: 'ncrNumber', width: 130, render: (_, record) => <span className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleViewNCR(record.id)}>{record.ncrNumber}</span> },
    { title: 'Baslik', dataIndex: 'title', key: 'title', width: 200, ellipsis: true },
    { title: 'Kategori', dataIndex: 'category', key: 'category', width: 110, render: (cat: NCRCategory) => <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">{ncrCategoryLabels[cat]}</Tag> },
    { title: 'Durum', dataIndex: 'status', key: 'status', width: 130, render: (status: NCRStatus) => { const c = ncrStatusConfig[status]; return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: c.bgColor, color: c.color }}>{c.label}</span>; } },
    { title: 'Onem', dataIndex: 'severity', key: 'severity', width: 100, render: (sev: string) => <span className={`text-xs font-medium ${sev === 'Critical' ? 'text-red-600' : sev === 'Major' ? 'text-orange-600' : 'text-slate-600'}`}>{sev === 'Critical' ? 'Kritik' : sev === 'Major' ? 'Buyuk' : 'Kucuk'}</span> },
    { title: 'Tarih', dataIndex: 'reportedDate', key: 'reportedDate', width: 100, render: (date) => <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span> },
    { title: 'Islemler', key: 'actions', width: 80, fixed: 'right', render: (_, record) => <Dropdown menu={{ items: [{ key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Goruntule', onClick: () => handleViewNCR(record.id) }] }} trigger={['click']}><Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600" /></Dropdown> },
  ];

  const capaColumns: ColumnsType<CAPAListDto> = [
    { title: 'CAPA No', key: 'capaNumber', width: 130, render: (_, record) => <span className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleViewCAPA(record.id)}>{record.capaNumber}</span> },
    { title: 'Baslik', dataIndex: 'title', key: 'title', width: 200, ellipsis: true },
    { title: 'Tip', dataIndex: 'type', key: 'type', width: 100, render: (type: CAPAType) => <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">{capaTypeLabels[type]}</Tag> },
    { title: 'Durum', dataIndex: 'status', key: 'status', width: 140, render: (status: CAPAStatus) => { const c = capaStatusConfig[status]; return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: c.bgColor, color: c.color }}>{c.label}</span>; } },
    { title: 'Hedef Tarih', dataIndex: 'targetDate', key: 'targetDate', width: 110, render: (date) => <span className={`text-sm ${dayjs(date).isBefore(dayjs()) ? 'text-red-600 font-medium' : 'text-slate-600'}`}>{dayjs(date).format('DD.MM.YYYY')}</span> },
    { title: 'Ilerleme', dataIndex: 'completionRate', key: 'completionRate', width: 100, render: (rate: number) => <span className="text-sm font-medium text-slate-700">%{rate}</span> },
    { title: 'Islemler', key: 'actions', width: 80, fixed: 'right', render: (_, record) => <Dropdown menu={{ items: [{ key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Goruntule', onClick: () => handleViewCAPA(record.id) }] }} trigger={['click']}><Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600" /></Dropdown> },
  ];

  const tabItems = [
    {
      key: 'ncr',
      label: (
        <span className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4" />
          Uygunsuzluklar (NCR)
        </span>
      ),
      children: (
        <>
          <div className="grid grid-cols-12 gap-6 mb-8">
            {[
              { label: 'Toplam', value: ncrStats.total, icon: DocumentTextIcon },
              { label: 'Acik', value: ncrStats.open, icon: ExclamationTriangleIcon },
              { label: 'Incelemede', value: ncrStats.underReview, icon: ClockIcon },
              { label: 'Cozuldu', value: ncrStats.resolved, icon: CheckBadgeIcon },
            ].map((s, i) => (
              <div key={i} className="col-span-12 md:col-span-3">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                    <s.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              <Input placeholder="NCR no veya baslik ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />} value={ncrFilters.searchText} onChange={(e) => setNcrFilters(prev => ({ ...prev, searchText: e.target.value }))} allowClear style={{ width: 280 }} className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg" />
              <Select placeholder="Durum" value={ncrFilters.status} onChange={(v) => setNcrFilters(prev => ({ ...prev, status: v }))} allowClear style={{ width: 140 }} options={[{ value: 'Open', label: 'Acik' }, { value: 'UnderReview', label: 'Incelemede' }, { value: 'Resolved', label: 'Cozuldu' }, { value: 'Closed', label: 'Kapandi' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
              <Select placeholder="Kategori" value={ncrFilters.category} onChange={(v) => setNcrFilters(prev => ({ ...prev, category: v }))} allowClear style={{ width: 130 }} options={[{ value: 'Material', label: 'Malzeme' }, { value: 'Process', label: 'Proses' }, { value: 'Product', label: 'Urun' }, { value: 'Supplier', label: 'Tedarikci' }, { value: 'Customer', label: 'Musteri' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
              {ncrHasActiveFilters && <Button onClick={() => setNcrFilters(defaultNCRFilters)} icon={<XMarkIcon className="w-4 h-4" />} className="!border-slate-300 ml-auto">Filtreleri Temizle</Button>}
            </div>
            <Table columns={ncrColumns} dataSource={filteredNCRs} rowKey="id" loading={ncrLoading} scroll={{ x: 900 }} pagination={{ current: ncrCurrentPage, pageSize: ncrPageSize, total: filteredNCRs.length, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} NCR`, onChange: (page, size) => { setNcrCurrentPage(page); setNcrPageSize(size); } }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="NCR bulunamadi" /> }} className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100" />
          </div>
        </>
      ),
    },
    {
      key: 'capa',
      label: (
        <span className="flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4" />
          Duzeltici/Onleyici Faaliyetler (CAPA)
        </span>
      ),
      children: (
        <>
          <div className="grid grid-cols-12 gap-6 mb-8">
            {[
              { label: 'Toplam', value: capaStats.total, icon: ShieldCheckIcon },
              { label: 'Acik', value: capaStats.open, icon: DocumentTextIcon },
              { label: 'Devam Ediyor', value: capaStats.inProgress, icon: ClockIcon },
              { label: 'Dogrulama Bekliyor', value: capaStats.pending, icon: CheckBadgeIcon },
            ].map((s, i) => (
              <div key={i} className="col-span-12 md:col-span-3">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                    <s.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              <Input placeholder="CAPA no veya baslik ara..." prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />} value={capaFilters.searchText} onChange={(e) => setCapaFilters(prev => ({ ...prev, searchText: e.target.value }))} allowClear style={{ width: 280 }} className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg" />
              <Select placeholder="Durum" value={capaFilters.status} onChange={(v) => setCapaFilters(prev => ({ ...prev, status: v }))} allowClear style={{ width: 150 }} options={[{ value: 'Draft', label: 'Taslak' }, { value: 'Open', label: 'Acik' }, { value: 'InProgress', label: 'Devam Ediyor' }, { value: 'PendingVerification', label: 'Dogrulama Bekliyor' }, { value: 'Closed', label: 'Kapandi' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
              <Select placeholder="Tip" value={capaFilters.type} onChange={(v) => setCapaFilters(prev => ({ ...prev, type: v }))} allowClear style={{ width: 120 }} options={[{ value: 'Corrective', label: 'Duzeltici' }, { value: 'Preventive', label: 'Onleyici' }]} className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg" />
              {capaHasActiveFilters && <Button onClick={() => setCapaFilters(defaultCAPAFilters)} icon={<XMarkIcon className="w-4 h-4" />} className="!border-slate-300 ml-auto">Filtreleri Temizle</Button>}
            </div>
            <Table columns={capaColumns} dataSource={filteredCAPAs} rowKey="id" loading={capaLoading} scroll={{ x: 900 }} pagination={{ current: capaCurrentPage, pageSize: capaPageSize, total: filteredCAPAs.length, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} CAPA`, onChange: (page, size) => { setCapaCurrentPage(page); setCapaPageSize(size); } }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="CAPA bulunamadi" /> }} className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100" />
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kalite Yonetimi</h1>
          <p className="text-slate-500 mt-1">Uygunsuzluklar ve duzeltici/onleyici faaliyetler</p>
        </div>
        <Space>
          <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => { refetchNCRs(); refetchCAPAs(); }} loading={ncrLoading || capaLoading} className="!border-slate-300 !text-slate-700">Yenile</Button>
          {activeTab === 'ncr' ? (
            <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/manufacturing/quality-management/ncr/new')} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">Yeni NCR</Button>
          ) : (
            <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/manufacturing/quality-management/capa/new')} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">Yeni CAPA</Button>
          )}
        </Space>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="[&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900" />
    </div>
  );
}
