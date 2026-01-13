'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Space, Dropdown, Empty, Tag, Modal, message } from 'antd';
import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useKpiDefinitions, useDeleteKpiDefinition } from '@/lib/api/hooks/useManufacturing';
import type { KpiDefinitionListDto } from '@/lib/api/services/manufacturing.types';
import { KpiCategory } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';

const categoryConfig: Record<KpiCategory, { color: string; label: string }> = {
  [KpiCategory.Efficiency]: { color: 'blue', label: 'Verimlilik' },
  [KpiCategory.Quality]: { color: 'green', label: 'Kalite' },
  [KpiCategory.Delivery]: { color: 'orange', label: 'Teslimat' },
  [KpiCategory.Cost]: { color: 'purple', label: 'Maliyet' },
  [KpiCategory.Safety]: { color: 'red', label: 'Güvenlik' },
};

interface FilterState {
  searchText: string;
  category?: KpiCategory;
}
const defaultFilters: FilterState = { searchText: '' };

export default function KpiDefinitionsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: definitions = [], isLoading, refetch } = useKpiDefinitions();
  const deleteDefinition = useDeleteKpiDefinition();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  const filteredDefinitions = useMemo(() => {
    return definitions.filter((d) => {
      const matchesSearch = !debouncedSearch ||
        d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.code.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = !filters.category || d.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }, [definitions, debouncedSearch, filters.category]);

  const hasActiveFilters = filters.searchText !== '' || filters.category !== undefined;
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(defaultFilters);

  const handleView = (id: string) => router.push(`/manufacturing/kpi-dashboard/definitions/${id}`);
  const handleEdit = (id: string) => router.push(`/manufacturing/kpi-dashboard/definitions/${id}/edit`);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDefinition.mutateAsync(deleteId);
      message.success('KPI tanımı silindi');
      setDeleteId(null);
    } catch {
      message.error('Silme işlemi başarısız');
    }
  };

  const columns: ColumnsType<KpiDefinitionListDto> = [
    {
      title: 'KPI',
      key: 'name',
      width: 250,
      render: (_, record) => (
        <div>
          <div
            className="font-medium text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {record.name}
          </div>
          <div className="text-xs text-slate-500">{record.code}</div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (cat: KpiCategory) => {
        const cfg = categoryConfig[cat];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (unit) => <span className="text-slate-600">{unit}</span>,
    },
    {
      title: 'Hedef Değer',
      dataIndex: 'targetValue',
      key: 'targetValue',
      width: 120,
      align: 'right',
      render: (val, record) => val !== undefined ? (
        <span className="font-medium text-slate-900">
          {val.toLocaleString('tr-TR')} {record.unit}
        </span>
      ) : '-',
    },
    {
      title: 'Uyarı Eşiği',
      dataIndex: 'warningThreshold',
      key: 'warningThreshold',
      width: 120,
      align: 'right',
      render: (val, record) => val !== undefined ? (
        <span className="text-orange-600">
          {val.toLocaleString('tr-TR')} {record.unit}
        </span>
      ) : '-',
    },
    {
      title: 'Kritik Eşik',
      dataIndex: 'criticalThreshold',
      key: 'criticalThreshold',
      width: 120,
      align: 'right',
      render: (val, record) => val !== undefined ? (
        <span className="text-red-600">
          {val.toLocaleString('tr-TR')} {record.unit}
        </span>
      ) : '-',
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
              { key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Detay', onClick: () => handleView(record.id) },
              { key: 'edit', icon: <PencilIcon className="w-4 h-4" />, label: 'Düzenle', onClick: () => handleEdit(record.id) },
              { type: 'divider' },
              { key: 'delete', icon: <TrashIcon className="w-4 h-4" />, label: 'Sil', danger: true, onClick: () => setDeleteId(record.id) },
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => router.push('/manufacturing/kpi-dashboard')}
            type="text"
            className="text-slate-500 hover:text-slate-800"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">KPI Tanımları</h1>
            <p className="text-slate-500 mt-1">Anahtar performans göstergesi tanımlarını yönetin</p>
          </div>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
            className="!border-slate-300 !text-slate-700"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/manufacturing/kpi-dashboard/definitions/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni KPI
          </Button>
        </Space>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="KPI ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            allowClear
            style={{ width: 280 }}
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Kategori"
            allowClear
            value={filters.category}
            onChange={(val) => updateFilter('category', val)}
            options={[
              { value: KpiCategory.Efficiency, label: 'Verimlilik' },
              { value: KpiCategory.Quality, label: 'Kalite' },
              { value: KpiCategory.Delivery, label: 'Teslimat' },
              { value: KpiCategory.Cost, label: 'Maliyet' },
              { value: KpiCategory.Safety, label: 'Güvenlik' },
            ]}
            style={{ width: 150 }}
          />
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              icon={<XMarkIcon className="w-4 h-4" />}
              className="!border-slate-300 ml-auto"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={filteredDefinitions}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredDefinitions.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} KPI`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="KPI tanımı bulunamadı" /> }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
        />
      </div>

      <Modal
        title="KPI Tanımını Sil"
        open={deleteId !== null}
        onOk={handleDelete}
        onCancel={() => setDeleteId(null)}
        okText="Sil"
        cancelText="Vazgeç"
        okButtonProps={{ danger: true, loading: deleteDefinition.isPending }}
      >
        <p>Bu KPI tanımını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
      </Modal>
    </div>
  );
}
