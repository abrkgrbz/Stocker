'use client';

import React from 'react';
import { Table, Dropdown, Modal, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import type { ExpenseSummaryDto } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

interface ExpensesTableProps {
  expenses: ExpenseSummaryDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (expense: ExpenseSummaryDto) => void;
  onView: (expenseId: number) => void;
  onDelete: (expenseId: number) => Promise<void>;
}

export function ExpensesTable({
  expenses,
  loading = false,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onEdit,
  onView,
  onDelete,
}: ExpensesTableProps) {
  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      Rent: { label: 'Kira', color: 'purple' },
      Utilities: { label: 'Faturalar', color: 'blue' },
      Salaries: { label: 'Maaşlar', color: 'green' },
      Marketing: { label: 'Pazarlama', color: 'magenta' },
      Travel: { label: 'Seyahat', color: 'cyan' },
      Office: { label: 'Ofis', color: 'orange' },
      IT: { label: 'Bilişim', color: 'geekblue' },
      Legal: { label: 'Hukuki', color: 'volcano' },
      Insurance: { label: 'Sigorta', color: 'gold' },
      Maintenance: { label: 'Bakım', color: 'lime' },
      Other: { label: 'Diğer', color: 'default' },
    };
    return labels[category] || { label: category, color: 'default' };
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      Draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Taslak' },
      Pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Onay Bekliyor' },
      Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı' },
      Paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ödendi' },
      Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi' },
      Cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', label: 'İptal' },
    };
    return configs[status] || configs.Draft;
  };

  const handleDeleteClick = (expense: ExpenseSummaryDto) => {
    Modal.confirm({
      title: 'Gideri Sil',
      content: `${expense.description || 'Bu gider'} silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await onDelete(expense.id);
      },
    });
  };

  const columns: ColumnsType<ExpenseSummaryDto> = [
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text || 'İsimsiz Gider'}</div>
          <div className="text-xs text-slate-500">{record.vendorName || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category, record) => {
        const config = getCategoryLabel(category);
        return <Tag color={config.color}>{record.categoryName || config.label}</Tag>;
      },
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            {formatCurrency(amount || 0, record.currency || 'TRY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD MMM YYYY') : '-'}
        </span>
      ),
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
      dataSource={expenses}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalCount,
        showSizeChanger: true,
        showTotal: (total) => `Toplam ${total} gider`,
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
