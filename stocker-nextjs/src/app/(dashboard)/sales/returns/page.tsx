'use client';

import React, { useState } from 'react';
import {
  Table,
  Input,
  Select,
  DatePicker,
  Dropdown,
  Modal,
  message,
} from 'antd';
import {
  ArrowPathIcon,
  CheckIcon,
  CurrencyDollarIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import {
  useSalesReturns,
  useApproveSalesReturn,
  useRejectSalesReturn,
  useReceiveSalesReturn,
  useCancelSalesReturn,
  useDeleteSalesReturn,
} from '@/lib/api/hooks/useSales';
import type {
  SalesReturnListItem,
  SalesReturnStatus,
  SalesReturnReason,
  GetSalesReturnsParams,
} from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const statusConfig: Record<SalesReturnStatus, { label: string; bgColor: string; textColor: string }> = {
  Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
  Submitted: { label: 'Gönderildi', bgColor: 'bg-slate-200', textColor: 'text-slate-800' },
  Approved: { label: 'Onaylandı', bgColor: 'bg-slate-700', textColor: 'text-white' },
  Rejected: { label: 'Reddedildi', bgColor: 'bg-slate-900', textColor: 'text-white' },
  Received: { label: 'Teslim Alındı', bgColor: 'bg-slate-600', textColor: 'text-white' },
  Processing: { label: 'İşleniyor', bgColor: 'bg-slate-500', textColor: 'text-white' },
  Completed: { label: 'Tamamlandı', bgColor: 'bg-slate-800', textColor: 'text-white' },
  Cancelled: { label: 'İptal', bgColor: 'bg-slate-300', textColor: 'text-slate-700' },
};

const reasonLabels: Record<SalesReturnReason, string> = {
  Defective: 'Arızalı',
  WrongItem: 'Yanlış Ürün',
  NotAsDescribed: 'Tanımlandığı Gibi Değil',
  DamagedInTransit: 'Taşıma Hasarı',
  ChangedMind: 'Vazgeçme',
  Other: 'Diğer',
};

const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

const reasonOptions = Object.entries(reasonLabels).map(([value, label]) => ({
  value,
  label,
}));

export default function SalesReturnsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetSalesReturnsParams>({
    page: 1,
    pageSize: 10,
  });
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'reject' | 'cancel' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<SalesReturnListItem | null>(null);

  const { data, isLoading, refetch } = useSalesReturns(filters);
  const approveMutation = useApproveSalesReturn();
  const rejectMutation = useRejectSalesReturn();
  const receiveMutation = useReceiveSalesReturn();
  const cancelMutation = useCancelSalesReturn();
  const deleteMutation = useDeleteSalesReturn();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('İade onaylandı');
    } catch {
      message.error('İade onaylanamadı');
    }
  };

  const handleReceive = async (id: string) => {
    try {
      await receiveMutation.mutateAsync(id);
      message.success('Ürünler teslim alındı');
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  const handleRejectClick = (returnItem: SalesReturnListItem) => {
    setSelectedReturn(returnItem);
    setActionType('reject');
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleCancelClick = (returnItem: SalesReturnListItem) => {
    setSelectedReturn(returnItem);
    setActionType('cancel');
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedReturn || !actionReason.trim()) {
      message.error('Sebep girilmelidir');
      return;
    }
    try {
      if (actionType === 'reject') {
        await rejectMutation.mutateAsync({ id: selectedReturn.id, reason: actionReason });
        message.success('İade reddedildi');
      } else if (actionType === 'cancel') {
        await cancelMutation.mutateAsync({ id: selectedReturn.id, reason: actionReason });
        message.success('İade iptal edildi');
      }
      setActionModalOpen(false);
      setSelectedReturn(null);
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'İadeyi Sil',
      content: 'Bu iadeyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('İade silindi');
        } catch {
          message.error('İade silinemedi');
        }
      },
    });
  };

  const returns = data?.items ?? [];

  const getActionMenu = (record: SalesReturnListItem): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/returns/${record.id}`),
      },
    ];

    if (record.status === 'Draft') {
      items.push(
        {
          key: 'edit',
          icon: <PencilIcon className="w-4 h-4" />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/returns/${record.id}/edit`),
        },
        {
          key: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record.id),
        }
      );
    }

    if (record.status === 'Submitted') {
      items.push(
        {
          key: 'approve',
          icon: <CheckIcon className="w-4 h-4" />,
          label: 'Onayla',
          onClick: () => handleApprove(record.id),
        },
        {
          key: 'reject',
          icon: <XMarkIcon className="w-4 h-4" />,
          label: 'Reddet',
          danger: true,
          onClick: () => handleRejectClick(record),
        }
      );
    }

    if (record.status === 'Approved') {
      items.push({
        key: 'receive',
        icon: <InboxIcon className="w-4 h-4" />,
        label: 'Teslim Al',
        onClick: () => handleReceive(record.id),
      });
    }

    if (!['Cancelled', 'Completed', 'Rejected'].includes(record.status)) {
      items.push({
        key: 'cancel',
        icon: <XMarkIcon className="w-4 h-4" />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancelClick(record),
      });
    }

    return items;
  };

  const columns: ColumnsType<SalesReturnListItem> = [
    {
      title: 'İade No',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      render: (text: string, record) => (
        <button
          onClick={() => router.push(`/sales/returns/${record.id}`)}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </button>
      ),
      sorter: true,
    },
    {
      title: 'Sipariş',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string, record) => (
        <button
          onClick={() => router.push(`/sales/orders/${record.orderId}`)}
          className="text-slate-600 hover:text-slate-900"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tarih',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: true,
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: SalesReturnReason) => reasonLabels[reason],
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      align: 'center',
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number, record) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency || 'TRY' }).format(amount),
      sorter: true,
      align: 'right',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: SalesReturnStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
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
      status: tableFilters.status?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    }));
  };

  // Calculate stats
  const totalReturns = data?.totalCount ?? 0;
  const pendingReturns = returns.filter(r => ['Draft', 'Submitted'].includes(r.status)).length;
  const approvedReturns = returns.filter(r => r.status === 'Approved').length;
  const completedReturns = returns.filter(r => r.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Satış İadeleri</h1>
            <p className="text-sm text-slate-500">Müşteri iadelerini yönetin</p>
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
            onClick={() => router.push('/sales/returns/new')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni İade
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam İade</p>
              <p className="text-xl font-semibold text-slate-900">{totalReturns}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <InboxIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bekleyen</p>
              <p className="text-xl font-semibold text-slate-900">{pendingReturns}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Onaylandı</p>
              <p className="text-xl font-semibold text-slate-900">{approvedReturns}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tamamlandı</p>
              <p className="text-xl font-semibold text-slate-900">{completedReturns}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            allowClear
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))
            }
            className="h-10"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: '100%' }}
            options={statusOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
            className="h-10"
          />
          <Select
            placeholder="Sebep"
            allowClear
            style={{ width: '100%' }}
            options={reasonOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, reason: value, page: 1 }))}
            className="h-10"
          />
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['Başlangıç', 'Bitiş']}
            onChange={(dates) =>
              setFilters((prev) => ({
                ...prev,
                fromDate: dates?.[0]?.toISOString(),
                toDate: dates?.[1]?.toISOString(),
                page: 1,
              }))
            }
            className="h-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={returns}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} iade`,
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>

      {/* Action Modal */}
      <Modal
        title={actionType === 'reject' ? 'İadeyi Reddet' : 'İadeyi İptal Et'}
        open={actionModalOpen}
        onOk={handleActionConfirm}
        onCancel={() => setActionModalOpen(false)}
        okText={actionType === 'reject' ? 'Reddet' : 'İptal Et'}
        okType="danger"
        cancelText="Vazgeç"
        confirmLoading={rejectMutation.isPending || cancelMutation.isPending}
      >
        <div className="mb-4">
          <p className="text-slate-600">
            <strong>{selectedReturn?.returnNumber}</strong> numaralı iadeyi {actionType === 'reject' ? 'reddetmek' : 'iptal etmek'} üzeresiniz.
          </p>
        </div>
        <Input.TextArea
          placeholder="Sebebi giriniz..."
          rows={4}
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
