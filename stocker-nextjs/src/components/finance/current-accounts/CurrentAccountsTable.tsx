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
import type { CurrentAccountSummaryDto } from '@/lib/api/services/finance.types';

interface CurrentAccountsTableProps {
  currentAccounts: CurrentAccountSummaryDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (account: CurrentAccountSummaryDto) => void;
  onView: (accountId: number) => void;
  onDelete: (accountId: number) => Promise<void>;
}

export function CurrentAccountsTable({
  currentAccounts,
  loading = false,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onEdit,
  onView,
  onDelete,
}: CurrentAccountsTableProps) {
  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      Customer: { label: 'Müşteri', color: 'blue' },
      Vendor: { label: 'Tedarikçi', color: 'orange' },
      Employee: { label: 'Personel', color: 'purple' },
      Partner: { label: 'Ortak', color: 'cyan' },
      Other: { label: 'Diğer', color: 'default' },
    };
    return labels[type] || { label: type, color: 'default' };
  };

  const handleDeleteClick = (account: CurrentAccountSummaryDto) => {
    Modal.confirm({
      title: 'Cari Hesabı Sil',
      content: `${account.accountName || 'Bu cari hesap'} silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await onDelete(account.id);
      },
    });
  };

  const columns: ColumnsType<CurrentAccountSummaryDto> = [
    {
      title: 'Hesap',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text || record.customerName || record.vendorName || '-'}</div>
          <div className="text-xs text-slate-500">{record.accountCode}</div>
        </div>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'accountType',
      key: 'accountType',
      render: (type) => {
        const config = getAccountTypeLabel(type);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance, record) => {
        const isPositive = balance >= 0;
        return (
          <div className="text-right">
            <div className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(balance || 0, record.currency || 'TRY')}
            </div>
            <div className="text-xs text-slate-500">
              {isPositive ? 'Alacak' : 'Borç'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Kredi Limiti',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      align: 'right',
      render: (limit, record) => (
        <span className="text-sm text-slate-600">
          {limit ? formatCurrency(limit, record.currency || 'TRY') : '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
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
      dataSource={currentAccounts}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalCount,
        showSizeChanger: true,
        showTotal: (total) => `Toplam ${total} cari hesap`,
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
