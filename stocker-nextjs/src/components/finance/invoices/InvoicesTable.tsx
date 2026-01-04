'use client';

import React from 'react';
import { Table, Dropdown, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import type { InvoiceSummaryDto } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

interface InvoicesTableProps {
  invoices: InvoiceSummaryDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (invoice: InvoiceSummaryDto) => void;
  onView: (invoiceId: number) => void;
  onDelete: (invoiceId: number) => Promise<void>;
}

export function InvoicesTable({
  invoices,
  loading = false,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onEdit,
  onView,
  onDelete,
}: InvoicesTableProps) {
  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const getInvoiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Sales: 'Satış',
      Purchase: 'Alış',
      Return: 'İade',
      Proforma: 'Proforma',
    };
    return labels[type] || type;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      Draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Taslak' },
      Pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Beklemede' },
      Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı' },
      Paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ödendi' },
      PartiallyPaid: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Kısmi Ödeme' },
      Overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vadesi Geçti' },
      Cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', label: 'İptal' },
    };
    return configs[status] || configs.Draft;
  };

  const handleDeleteClick = (invoice: InvoiceSummaryDto) => {
    Modal.confirm({
      title: 'Faturayı Sil',
      content: `${invoice.invoiceNumber || 'Bu fatura'} silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await onDelete(invoice.id);
      },
    });
  };

  const columns: ColumnsType<InvoiceSummaryDto> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text || 'Taslak'}</div>
          <div className="text-xs text-slate-500">
            {record.invoiceDate ? dayjs(record.invoiceDate).format('DD MMM YYYY') : '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'Müşteri/Tedarikçi',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text || record.vendorName || '-'}</div>
          <div className="text-xs text-slate-500">{getInvoiceTypeLabel(record.invoiceType)}</div>
        </div>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount, record) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            {formatCurrency(amount || 0, record.currency || 'TRY')}
          </div>
          {record.paidAmount !== undefined && record.paidAmount > 0 && (
            <div className="text-xs text-emerald-600">
              Ödenen: {formatCurrency(record.paidAmount, record.currency || 'TRY')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vade',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => {
        if (!date) return <span className="text-sm text-slate-400">-</span>;
        const dueDate = dayjs(date);
        const isOverdue = dueDate.isBefore(dayjs()) && record.status !== 'Paid';
        return (
          <div>
            <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
              {dueDate.format('DD MMM YYYY')}
            </div>
            {isOverdue && (
              <div className="text-xs text-red-500">
                {Math.abs(dueDate.diff(dayjs(), 'day'))} gün gecikmiş
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => onView(record.id),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => onEdit(record),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDeleteClick(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-1 rounded hover:bg-slate-100 transition-colors">
            <EllipsisVerticalIcon className="w-5 h-5 text-slate-400" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={invoices}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalCount,
        showSizeChanger: true,
        showTotal: (total) => `Toplam ${total} fatura`,
        onChange: onPageChange,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-slate-50',
      })}
      className="enterprise-table"
    />
  );
}
