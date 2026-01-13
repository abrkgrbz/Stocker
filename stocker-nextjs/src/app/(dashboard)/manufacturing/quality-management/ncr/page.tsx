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
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useNcrs } from '@/lib/api/hooks/useManufacturing';
import type { NcrStatus, NcrSeverity, NonConformanceReportListDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<NcrStatus, { color: string; bgColor: string; label: string }> = {
  Open: { color: '#64748b', bgColor: '#f1f5f9', label: 'Açık' },
  UnderInvestigation: { color: '#334155', bgColor: '#e2e8f0', label: 'Araştırılıyor' },
  PendingDisposition: { color: '#475569', bgColor: '#cbd5e1', label: 'Değerlendirme Bekliyor' },
  Closed: { color: '#16a34a', bgColor: '#dcfce7', label: 'Kapatıldı' },
  Cancelled: { color: '#ef4444', bgColor: '#fee2e2', label: 'İptal' },
};

const severityConfig: Record<NcrSeverity, { color: string; label: string }> = {
  Minor: { color: 'default', label: 'Düşük' },
  Major: { color: 'warning', label: 'Orta' },
  Critical: { color: 'error', label: 'Kritik' },
};

interface FilterState {
  searchText: string;
  status?: NcrStatus;
  severity?: NcrSeverity;
}

const defaultFilters: FilterState = { searchText: '' };

export default function NcrListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: ncrs = [], isLoading } = useNcrs();

  const filteredNcrs = useMemo(() => {
    return ncrs.filter((ncr) => {
      const matchesSearch = !filters.searchText ||
        ncr.ncrNumber.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        ncr.title.toLowerCase().includes(filters.searchText.toLowerCase());
      const matchesStatus = !filters.status || ncr.status === filters.status;
      const matchesSeverity = !filters.severity || ncr.severity === filters.severity;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [ncrs, filters]);

  const stats = useMemo(() => ({
    total: ncrs.length,
    open: ncrs.filter(n => n.status === 'Open' || n.status === 'UnderInvestigation').length,
    critical: ncrs.filter(n => n.severity === 'Critical' && n.status !== 'Closed' && n.status !== 'Cancelled').length,
    closed: ncrs.filter(n => n.status === 'Closed').length,
  }), [ncrs]);

  const hasActiveFilters = filters.searchText !== '' || filters.status !== undefined || filters.severity !== undefined;
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(defaultFilters);
  const handleView = (id: string) => router.push(`/manufacturing/quality-management/ncr/${id}`);

  const columns: ColumnsType<NonConformanceReportListDto> = [
    {
      title: 'NCR No',
      key: 'ncrNumber',
      width: 140,
      render: (_, record) => (
        <span className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleView(record.id)}>
          {record.ncrNumber}
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
      title: 'Ciddiyet',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: NcrSeverity) => {
        const config = severityConfig[severity];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: NcrStatus) => {
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
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      render: (name) => name || '-',
    },
    {
      title: 'Bildirim Tarihi',
      dataIndex: 'reportedDate',
      key: 'reportedDate',
      width: 120,
      render: (date) => dayjs(date).format('DD.MM.YYYY'),
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
            <h1 className="text-xl font-semibold text-slate-900 m-0">NCR Yönetimi</h1>
            <p className="text-sm text-slate-400 m-0">Uygunsuzluk Raporları</p>
          </div>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/manufacturing/quality-management/ncr/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni NCR
          </Button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Row gutter={24} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic title="Toplam NCR" value={stats.total} prefix={<ExclamationTriangleIcon className="w-5 h-5 text-slate-400" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Açık" value={stats.open} valueStyle={{ color: '#334155' }} prefix={<ExclamationCircleIcon className="w-5 h-5 text-slate-400" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Kritik" value={stats.critical} valueStyle={{ color: stats.critical > 0 ? '#dc2626' : '#16a34a' }} prefix={<ClockIcon className="w-5 h-5" />} />
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
            placeholder="NCR no veya başlık ara..."
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
            style={{ width: 180 }}
            options={Object.entries(statusConfig).map(([value, config]) => ({ value, label: config.label }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Ciddiyet"
            value={filters.severity}
            onChange={(v) => updateFilter('severity', v)}
            allowClear
            style={{ width: 130 }}
            options={Object.entries(severityConfig).map(([value, config]) => ({ value, label: config.label }))}
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
          dataSource={filteredNcrs}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredNcrs.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} NCR`,
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
          }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="NCR bulunamadı" /> }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
        />
      </div>
    </div>
  );
}
