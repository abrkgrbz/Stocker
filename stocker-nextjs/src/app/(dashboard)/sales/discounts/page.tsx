'use client';

import React, { useState } from 'react';
import {
  Table,
  Input,
  Select,
  Dropdown,
  Modal,
  message,
} from 'antd';
import {
  ArrowPathIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StopIcon,
  TrashIcon,
  TagIcon,
  PercentBadgeIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import {
  useDiscounts,
  useActivateDiscount,
  useDeactivateDiscount,
  useDeleteDiscount,
} from '@/lib/api/hooks/useSales';
import type { DiscountListItem, DiscountType, GetDiscountsParams } from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const typeConfig: Record<DiscountType, { label: string; bgColor: string; textColor: string }> = {
  Percentage: { label: 'Yüzde', bgColor: 'bg-slate-700', textColor: 'text-white' },
  FixedAmount: { label: 'Sabit Tutar', bgColor: 'bg-slate-600', textColor: 'text-white' },
  BuyXGetY: { label: 'X Al Y Öde', bgColor: 'bg-slate-500', textColor: 'text-white' },
  Tiered: { label: 'Kademeli', bgColor: 'bg-slate-400', textColor: 'text-slate-800' },
};

const typeOptions = Object.entries(typeConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export default function DiscountsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetDiscountsParams>({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, refetch } = useDiscounts(filters);
  const activateMutation = useActivateDiscount();
  const deactivateMutation = useDeactivateDiscount();
  const deleteMutation = useDeleteDiscount();

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        await deactivateMutation.mutateAsync(id);
        message.success('İndirim pasifleştirildi');
      } else {
        await activateMutation.mutateAsync(id);
        message.success('İndirim aktifleştirildi');
      }
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'İndirimi Sil',
      content: 'Bu indirimi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('İndirim silindi');
        } catch {
          message.error('İndirim silinemedi');
        }
      },
    });
  };

  const discounts = data?.items ?? [];

  const getActionMenu = (record: DiscountListItem): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeIcon className="w-4 h-4" />,
      label: 'Görüntüle',
      onClick: () => router.push(`/sales/discounts/${record.id}`),
    },
    {
      key: 'edit',
      icon: <PencilIcon className="w-4 h-4" />,
      label: 'Düzenle',
      onClick: () => router.push(`/sales/discounts/${record.id}/edit`),
    },
    {
      key: 'toggle',
      icon: record.isActive ? <StopIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />,
      label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
      onClick: () => handleToggleActive(record.id, record.isActive),
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns: ColumnsType<DiscountListItem> = [
    {
      title: 'İndirim Kodu',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, record) => (
        <button
          onClick={() => router.push(`/sales/discounts/${record.id}`)}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </button>
      ),
      sorter: true,
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: DiscountType) => {
        const config = typeConfig[type];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
      filters: typeOptions.map((t) => ({ text: t.label, value: t.value })),
    },
    {
      title: 'Değer',
      key: 'value',
      render: (_, record) => {
        if (record.type === 'Percentage') {
          return `%${record.percentage}`;
        }
        if (record.type === 'FixedAmount') {
          return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(record.amount || 0);
        }
        return '-';
      },
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: true,
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string | null) => (date ? dayjs(date).format('DD.MM.YYYY') : 'Süresiz'),
    },
    {
      title: 'Kullanım',
      key: 'usage',
      render: (_, record) => {
        if (record.maxUsageCount) {
          return `${record.usageCount || 0} / ${record.maxUsageCount}`;
        }
        return record.usageCount || 0;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisVerticalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      type: tableFilters.type?.[0],
      isActive: tableFilters.isActive?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    }));
  };

  // Calculate stats
  const totalDiscounts = data?.totalCount ?? 0;
  const activeDiscounts = discounts.filter(d => d.isActive).length;
  const percentageDiscounts = discounts.filter(d => d.type === 'Percentage').length;
  const fixedDiscounts = discounts.filter(d => d.type === 'FixedAmount').length;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <TagIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">İndirimler</h1>
            <p className="text-sm text-slate-500">İndirim kampanyalarını yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/sales/discounts/new')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni İndirim
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam İndirim</p>
              <p className="text-xl font-semibold text-slate-900">{totalDiscounts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Aktif</p>
              <p className="text-xl font-semibold text-slate-900">{activeDiscounts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <PercentBadgeIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Yüzde İndirim</p>
              <p className="text-xl font-semibold text-slate-900">{percentageDiscounts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Sabit Tutar</p>
              <p className="text-xl font-semibold text-slate-900">{fixedDiscounts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Kod veya ad ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            allowClear
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))
            }
            className="h-10"
          />
          <Select
            placeholder="Tür"
            allowClear
            style={{ width: '100%' }}
            options={typeOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, type: value, page: 1 }))}
            className="h-10"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: '100%' }}
            options={[
              { value: true, label: 'Aktif' },
              { value: false, label: 'Pasif' },
            ]}
            onChange={(value) => setFilters((prev) => ({ ...prev, isActive: value, page: 1 }))}
            className="h-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={discounts}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} indirim`,
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
