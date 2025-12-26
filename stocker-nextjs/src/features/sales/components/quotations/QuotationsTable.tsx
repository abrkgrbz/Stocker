'use client';

/**
 * QuotationsTable Component
 * Displays quotations in a data table with actions
 * Feature-Based Architecture - Smart Component
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, DatePicker, Dropdown, Modal, Skeleton } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  MoreOutlined,
  SendOutlined,
  CopyOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Card, DataTableWrapper, EmptyState } from '@/components/ui/enterprise-page';
import { QuotationStatusBadge, quotationStatusConfig } from './QuotationStatusBadge';
import {
  useQuotations,
  useApproveQuotation,
  useSendQuotation,
  useAcceptQuotation,
  useRejectQuotation,
  useCancelQuotation,
  useConvertQuotationToOrder,
  useDeleteQuotation,
} from '../../hooks';
import { showSuccess, showError, showWarning } from '@/lib/utils/sweetalert';
import type { QuotationListItem, GetQuotationsParams, QuotationStatus } from '../../types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface QuotationsTableProps {
  initialParams?: GetQuotationsParams;
  onParamsChange?: (params: GetQuotationsParams) => void;
  showFilters?: boolean;
}

const statusOptions = Object.entries(quotationStatusConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export function QuotationsTable({
  initialParams = { page: 1, pageSize: 10 },
  onParamsChange,
  showFilters = true,
}: QuotationsTableProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<GetQuotationsParams>(initialParams);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'reject' | 'cancel' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationListItem | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuotations(filters);
  const approveMutation = useApproveQuotation();
  const sendMutation = useSendQuotation();
  const acceptMutation = useAcceptQuotation();
  const rejectMutation = useRejectQuotation();
  const cancelMutation = useCancelQuotation();
  const convertMutation = useConvertQuotationToOrder();
  const deleteMutation = useDeleteQuotation();

  const quotations = data?.items ?? [];

  const updateFilters = (newFilters: Partial<GetQuotationsParams>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onParamsChange?.(updated);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      showSuccess('Başarılı', 'Teklif onaylandı');
    } catch {
      showError('Teklif onaylanamadı');
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendMutation.mutateAsync(id);
      showSuccess('Başarılı', 'Teklif gönderildi');
    } catch {
      showError('Teklif gönderilemedi');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptMutation.mutateAsync(id);
      showSuccess('Başarılı', 'Teklif kabul edildi');
    } catch {
      showError('Teklif kabul edilemedi');
    }
  };

  const handleRejectClick = (quotation: QuotationListItem) => {
    setSelectedQuotation(quotation);
    setActionType('reject');
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleCancelClick = (quotation: QuotationListItem) => {
    setSelectedQuotation(quotation);
    setActionType('cancel');
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedQuotation || !actionReason.trim()) {
      showWarning('Uyarı', 'Sebep girilmelidir');
      return;
    }
    try {
      if (actionType === 'reject') {
        await rejectMutation.mutateAsync({ id: selectedQuotation.id, reason: actionReason });
        showSuccess('Başarılı', 'Teklif reddedildi');
      } else if (actionType === 'cancel') {
        await cancelMutation.mutateAsync({ id: selectedQuotation.id, reason: actionReason });
        showSuccess('Başarılı', 'Teklif iptal edildi');
      }
      setActionModalOpen(false);
      setSelectedQuotation(null);
    } catch {
      showError(actionType === 'reject' ? 'Teklif reddedilemedi' : 'Teklif iptal edilemedi');
    }
  };

  const handleConvertToOrder = async (id: string) => {
    Modal.confirm({
      title: 'Siparişe Dönüştür',
      content: 'Bu teklifi siparişe dönüştürmek istediğinizden emin misiniz?',
      okText: 'Dönüştür',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await convertMutation.mutateAsync(id);
          showSuccess('Başarılı', 'Teklif siparişe dönüştürüldü');
        } catch {
          showError('Teklif siparişe dönüştürülemedi');
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Teklifi Sil',
      content: 'Bu teklifi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          showSuccess('Başarılı', 'Teklif silindi');
        } catch {
          showError('Teklif silinemedi');
        }
      },
    });
  };

  const getActionMenu = (record: QuotationListItem): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/quotations/${record.id}`),
      },
    ];

    if (record.status === 'Draft') {
      items.push(
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/quotations/${record.id}/edit`),
        },
        {
          key: 'approve',
          icon: <CheckOutlined />,
          label: 'Onayla',
          onClick: () => handleApprove(record.id),
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record.id),
        }
      );
    }

    if (record.status === 'Approved') {
      items.push({
        key: 'send',
        icon: <SendOutlined />,
        label: 'Gönder',
        onClick: () => handleSend(record.id),
      });
    }

    if (record.status === 'Sent') {
      items.push(
        {
          key: 'accept',
          icon: <CheckOutlined />,
          label: 'Kabul Et',
          onClick: () => handleAccept(record.id),
        },
        {
          key: 'reject',
          icon: <CloseOutlined />,
          label: 'Reddet',
          danger: true,
          onClick: () => handleRejectClick(record),
        }
      );
    }

    if (record.status === 'Accepted') {
      items.push({
        key: 'convert',
        icon: <ShoppingCartOutlined />,
        label: 'Siparişe Dönüştür',
        onClick: () => handleConvertToOrder(record.id),
      });
    }

    items.push({
      key: 'duplicate',
      icon: <CopyOutlined />,
      label: 'Kopyala',
      onClick: () => router.push(`/sales/quotations/new?copyFrom=${record.id}`),
    });

    if (!['Cancelled', 'ConvertedToOrder', 'Rejected'].includes(record.status)) {
      items.push({
        key: 'cancel',
        icon: <CloseOutlined />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancelClick(record),
      });
    }

    return items;
  };

  const columns: ColumnsType<QuotationListItem> = [
    {
      title: 'Teklif',
      key: 'quotation',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#6366f115' }}
          >
            <FileTextOutlined style={{ color: '#6366f1' }} />
          </div>
          <div>
            <div
              className="text-sm font-medium text-slate-900 cursor-pointer hover:text-indigo-600"
              onClick={() => router.push(`/sales/quotations/${record.id}`)}
            >
              {record.quotationNumber}
            </div>
            <div className="text-xs text-slate-500">{record.customerName}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'quotationDate',
      key: 'quotationDate',
      width: 120,
      render: (date: string) => (
        <div className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</div>
      ),
      sorter: true,
    },
    {
      title: 'Geçerlilik',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      width: 120,
      render: (date: string | null) => (
        <div className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY') : '-'}
        </div>
      ),
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (count: number) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {count}
        </span>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount: number, record) => (
        <div className="text-sm font-medium text-slate-900">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
      render: (status: QuotationStatus) => <QuotationStatusBadge status={status} />,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <MoreOutlined className="text-sm" />
          </button>
        </Dropdown>
      ),
    },
  ];

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    updateFilters({
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: tableFilters.status?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton.Input active style={{ width: 300 }} />
              <Skeleton.Input active style={{ width: 180 }} />
              <Skeleton.Input active style={{ width: 280 }} />
            </div>
          </div>
        )}
        <Card>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton.Avatar active size="large" shape="square" />
                <div className="flex-1 space-y-2">
                  <Skeleton.Input active size="small" block />
                  <Skeleton.Input active size="small" style={{ width: '50%' }} />
                </div>
                <Skeleton.Input active size="small" style={{ width: 100 }} />
              </div>
            ))}
          </div>
        </Card>
      </>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={<FileTextOutlined className="w-6 h-6" />}
          title="Veriler yüklenemedi"
          description={error?.message || 'Teklifler yüklenirken bir hata oluştu'}
          action={{
            label: 'Tekrar Dene',
            onClick: () => refetch(),
          }}
        />
      </Card>
    );
  }

  // Empty state
  if (quotations.length === 0 && !filters.searchTerm && !filters.status) {
    return (
      <Card>
        <EmptyState
          icon={<FileTextOutlined className="w-6 h-6" />}
          title="Henüz teklif yok"
          description="İlk teklifinizi oluşturmak için 'Yeni Teklif' butonuna tıklayın"
          action={{
            label: 'Yeni Teklif Oluştur',
            onClick: () => router.push('/sales/quotations/new'),
          }}
        />
      </Card>
    );
  }

  return (
    <>
      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Teklif ara..."
              prefix={<SearchOutlined className="text-slate-400" />}
              allowClear
              style={{ maxWidth: 300 }}
              onChange={(e) => updateFilters({ searchTerm: e.target.value, page: 1 })}
              className="h-10"
            />
            <Select
              placeholder="Durum seçin"
              allowClear
              style={{ width: 180 }}
              options={statusOptions}
              onChange={(value) => updateFilters({ status: value, page: 1 })}
            />
            <RangePicker
              style={{ width: 280 }}
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={(dates) =>
                updateFilters({
                  fromDate: dates?.[0]?.toISOString(),
                  toDate: dates?.[1]?.toISOString(),
                  page: 1,
                })
              }
            />
          </div>
        </div>
      )}

      {/* Table */}
      <DataTableWrapper>
        <Table
          columns={columns}
          dataSource={quotations}
          rowKey="id"
          onChange={handleTableChange}
          scroll={{ x: 900 }}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} teklif`,
          }}
        />
      </DataTableWrapper>

      {/* Action Modal */}
      <Modal
        title={actionType === 'reject' ? 'Teklifi Reddet' : 'Teklifi İptal Et'}
        open={actionModalOpen}
        onOk={handleActionConfirm}
        onCancel={() => setActionModalOpen(false)}
        okText={actionType === 'reject' ? 'Reddet' : 'İptal Et'}
        okType="danger"
        cancelText="Vazgeç"
        confirmLoading={rejectMutation.isPending || cancelMutation.isPending}
      >
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            <strong className="text-slate-900">{selectedQuotation?.quotationNumber}</strong> numaralı teklifi{' '}
            {actionType === 'reject' ? 'reddetmek' : 'iptal etmek'} üzeresiniz.
          </p>
        </div>
        <Input.TextArea
          placeholder="Sebebi giriniz..."
          rows={4}
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
        />
      </Modal>
    </>
  );
}
