'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Space, Dropdown, Empty, Tag, Statistic, Card, Row, Col } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useCapas } from '@/lib/api/hooks/useManufacturing';
import type { CapaStatus, CapaType, CorrectivePreventiveActionListDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<CapaStatus, { color: string; bgColor: string; label: string }> = {
  Draft: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Taslak' },
  Open: { color: '#64748b', bgColor: '#f1f5f9', label: 'Açık' },
  Planning: { color: '#475569', bgColor: '#e2e8f0', label: 'Planlama' },
  Implementation: { color: '#334155', bgColor: '#cbd5e1', label: 'Uygulama' },
  Verification: { color: '#1e293b', bgColor: '#94a3b8', label: 'Doğrulama' },
  EffectivenessReview: { color: '#475569', bgColor: '#cbd5e1', label: 'Etkinlik Değ.' },
  Closed: { color: '#16a34a', bgColor: '#dcfce7', label: 'Kapatıldı' },
  Cancelled: { color: '#ef4444', bgColor: '#fee2e2', label: 'İptal' },
};

const typeConfig: Record<CapaType, { color: string; label: string }> = {
  Corrective: { color: 'orange', label: 'Düzeltici' },
  Preventive: { color: 'blue', label: 'Önleyici' },
};

interface FilterState {
  searchText: string;
  status?: CapaStatus;
  type?: CapaType;
}

const defaultFilters: FilterState = { searchText: '' };

export default function CapaListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: capas = [], isLoading } = useCapas();

  const filteredCapas = useMemo(() => {
    return capas.filter((capa) => {
      const matchesSearch = !filters.searchText ||
        capa.capaNumber.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        capa.title.toLowerCase().includes(filters.searchText.toLowerCase());
      const matchesStatus = !filters.status || capa.status === filters.status;
      const matchesType = !filters.type || capa.type === filters.type;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [capas, filters]);

  const stats = useMemo(() => ({
    total: capas.length,
    open: capas.filter(c => c.status === 'Open' || c.status === 'Planning' || c.status === 'Implementation').length,
    overdue: capas.filter(c => c.dueDate && dayjs(c.dueDate).isBefore(dayjs()) && c.status !== 'Closed' && c.status !== 'Cancelled').length,
    closed: capas.filter(c => c.status === 'Closed').length,
  }), [capas]);

  const hasActiveFilters = filters.searchText !== '' || filters.status !== undefined || filters.type !== undefined;
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(defaultFilters);
  const handleView = (id: string) => router.push(`/manufacturing/quality-management/capa/${id}`);

  const columns: ColumnsType<CorrectivePreventiveActionListDto> = [
    {
      title: 'CAPA No',
      key: 'capaNumber',
      width: 140,
      render: (_, record) => (
        <span className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleView(record.id)}>
          {record.capaNumber}
        </span>
      ),
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Tip',
      dataIndex: 'capaType',
      key: 'capaType',
      width: 110,
      render: (type: CapaType) => {
        const config = typeConfig[type];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: CapaStatus) => {
        const config = statusConfig[status];
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Sorumlu',
      dataIndex: 'responsibleUserName',
      key: 'responsibleUserName',
      width: 150,
    },
    {
      title: 'Bitiş Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date, record) => {
        const isOverdue = date && dayjs(date).isBefore(dayjs()) && record.status !== 'Closed' && record.status !== 'Cancelled';
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
            {dayjs(date).format('DD.MM.YYYY')}
          </span>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Görüntüle', onClick: () => handleView(record.id) },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 m-0">CAPA Yönetimi</h1>
            <p className="text-sm text-slate-400 m-0">Düzeltici ve Önleyici Aksiyonlar</p>
          </div>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/manufacturing/quality-management/capa/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni CAPA
          </Button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Row gutter={24} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic title="Toplam CAPA" value={stats.total} prefix={<ClipboardDocumentListIcon className="w-5 h-5 text-slate-400" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Açık" value={stats.open} valueStyle={{ color: '#334155' }} prefix={<ExclamationCircleIcon className="w-5 h-5 text-slate-400" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Geciken" value={stats.overdue} valueStyle={{ color: stats.overdue > 0 ? '#dc2626' : '#16a34a' }} prefix={<ClockIcon className="w-5 h-5" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Kapatılan" value={stats.closed} valueStyle={{ color: '#16a34a' }} prefix={<CheckCircleIcon className="w-5 h-5 text-green-500" />} />
            </Card>
          </Col>
        </Row>

        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="CAPA no veya başlık ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            className="max-w-xs [&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            allowClear
          />
          <Select
            placeholder="Durum"
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            allowClear
            style={{ width: 150 }}
            options={Object.entries(statusConfig).map(([value, config]) => ({ value, label: config.label }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Tip"
            value={filters.type}
            onChange={(v) => updateFilter('type', v)}
            allowClear
            style={{ width: 130 }}
            options={Object.entries(typeConfig).map(([value, config]) => ({ value, label: config.label }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          {hasActiveFilters && (
            <Button onClick={clearFilters} icon={<XMarkIcon className="w-4 h-4" />} className="!border-slate-300 ml-auto">
              Filtreleri Temizle
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={filteredCapas}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredCapas.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} CAPA`,
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
          }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="CAPA bulunamadı" /> }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
        />
      </div>
    </div>
  );
}
