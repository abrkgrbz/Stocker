'use client';

import React, { useState } from 'react';
import { Table, Input, Select, Dropdown, Modal, Spin, Button, Tooltip } from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
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
  Sent: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Gönderildi' },
  PartiallyResponded: { bg: 'bg-slate-300', text: 'text-slate-800', label: 'Kısmi Yanıt' },
  FullyResponded: { bg: 'bg-slate-400', text: 'text-white', label: 'Tam Yanıt' },
  UnderReview: { bg: 'bg-slate-500', text: 'text-white', label: 'İnceleniyor' },
  Evaluated: { bg: 'bg-slate-600', text: 'text-white', label: 'Değerlendirildi' },
  SupplierSelected: { bg: 'bg-slate-700', text: 'text-white', label: 'Tedarikçi Seçildi' },
  Awarded: { bg: 'bg-slate-900', text: 'text-white', label: 'Kazanan Belirlendi' },
  Converted: { bg: 'bg-slate-400', text: 'text-white', label: 'Siparişe Dönüştü' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'İptal' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Kapatıldı' },
  Expired: { bg: 'bg-slate-700', text: 'text-white', label: 'Süresi Doldu' },
};

export default function QuotationsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = useQuotations({
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
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
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
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
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
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-4 h-4" />
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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Teklif Talepleri (RFQ)</h1>
              <p className="text-sm text-slate-500">Tedarikçilerden teklif isteklerini yönetin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip title="Dışa Aktar">
              <Button
                icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
              />
            </Tooltip>
            <Tooltip title="Yenile">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                onClick={() => refetch()}
                loading={isLoading}
              />
            </Tooltip>
            <Link href="/purchase/quotations/new">
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Yeni Teklif Talebi
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam Talep</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Taslak</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.draft}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <PencilIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Gönderildi</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.sent}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Kazanan</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.awarded}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={data?.items || []}
            rowKey="id"
            loading={isLoading}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-200"
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
          />
        </div>
      </Spin>
    </div>
  );
}
