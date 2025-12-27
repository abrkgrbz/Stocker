'use client';

import React, { useState } from 'react';
import { Table, Input, Select, Dropdown, Modal, Spin } from 'antd';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import { useQuotations, useDeleteQuotation, useCancelQuotation } from '@/lib/api/hooks/usePurchase';
import type { QuotationListDto, QuotationStatus } from '@/lib/api/services/purchase.types';

const statusConfig: Record<QuotationStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  Sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Gönderildi' },
  PartiallyResponded: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Kısmi Yanıt' },
  FullyResponded: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Tam Yanıt' },
  UnderReview: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'İnceleniyor' },
  Evaluated: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Değerlendirildi' },
  SupplierSelected: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Tedarikçi Seçildi' },
  Awarded: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Kazanan Belirlendi' },
  Converted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Siparişe Dönüştü' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'İptal' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Kapatıldı' },
  Expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Süresi Doldu' },
};

export default function QuotationsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuotations({
    page: currentPage,
    pageSize,
    searchTerm: searchText || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeleteQuotation();
  const cancelMutation = useCancelQuotation();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Teklif Talebi Silinecek',
      content: 'Bu teklif talebini silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const handleCancel = (id: string) => {
    Modal.confirm({
      title: 'Teklif Talebi İptal Edilecek',
      content: 'Bu teklif talebini iptal etmek istediğinize emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelMutation.mutateAsync({ id, reason: 'Kullanıcı tarafından iptal edildi' }),
    });
  };

  const columns: ColumnsType<QuotationListDto> = [
    {
      title: 'Teklif No',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
      width: 140,
      render: (text, record) => (
        <button
          onClick={() => router.push(`/purchase/quotations/${record.id}`)}
          className="text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text) => <span className="text-sm font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: QuotationStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierCount',
      key: 'supplierCount',
      width: 100,
      align: 'center',
      render: (count) => <span className="text-sm text-slate-600">{count}</span>,
    },
    {
      title: 'Ürün',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (count) => <span className="text-sm text-slate-600">{count}</span>,
    },
    {
      title: 'Son Teklif',
      dataIndex: 'responseDeadline',
      key: 'responseDeadline',
      width: 120,
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? new Date(date).toLocaleDateString('tr-TR') : '-'}
        </span>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (date) => (
        <span className="text-sm text-slate-500">{new Date(date).toLocaleDateString('tr-TR')}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Görüntüle',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => router.push(`/purchase/quotations/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                disabled: record.status !== 'Draft',
                onClick: () => router.push(`/purchase/quotations/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'cancel',
                label: 'İptal Et',
                icon: <XCircleIcon className="w-4 h-4" />,
                danger: true,
                disabled: record.status === 'Cancelled' || record.status === 'Closed',
                onClick: () => handleCancel(record.id),
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                disabled: record.status !== 'Draft',
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-1 hover:bg-slate-100 rounded transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5 text-slate-400" />
          </button>
        </Dropdown>
      ),
    },
  ];

  const stats = {
    total: data?.totalCount || 0,
    draft: data?.items?.filter(i => i.status === 'Draft').length || 0,
    sent: data?.items?.filter(i => i.status === 'Sent').length || 0,
    awarded: data?.items?.filter(i => i.status === 'Awarded').length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Teklif Talepleri (RFQ)</h1>
              <p className="text-sm text-slate-500 mt-1">Tedarikçilerden teklif isteklerini yönetin</p>
            </div>
            <Link href="/purchase/quotations/new">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                <PlusIcon className="w-4 h-4" />
                Yeni Teklif Talebi
              </button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/purchase/quotations">
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <DocumentTextIcon className="w-4 h-4 text-slate-500" />
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">{stats.total}</div>
              <div className="text-sm text-slate-500">Toplam Talep</div>
            </div>
          </Link>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Taslak</span>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{stats.draft}</div>
            <div className="text-sm text-slate-500">Bekleyen</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gönderildi</span>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{stats.sent}</div>
            <div className="text-sm text-slate-500">Yanıt Beklenen</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Kazanan</span>
            </div>
            <div className="text-2xl font-semibold text-emerald-600">{stats.awarded}</div>
            <div className="text-sm text-slate-500">Belirlendi</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Teklif no veya başlık ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-72"
              allowClear
            />
            <Select
              placeholder="Durum"
              className="w-44"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(statusConfig).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <Table
            columns={columns}
            dataSource={data?.items || []}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize,
              total: data?.totalCount || 0,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayıt`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            scroll={{ x: 1000 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wide"
          />
        </div>
      </div>
    </div>
  );
}
