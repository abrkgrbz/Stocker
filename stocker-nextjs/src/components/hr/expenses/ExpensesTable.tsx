'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { ExpenseDto } from '@/lib/api/services/hr.types';
import { ExpenseStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface ExpensesTableProps {
  expenses: ExpenseDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (expense: ExpenseDto) => Promise<void>;
  onApprove?: (expense: ExpenseDto) => Promise<void>;
  onReject?: (expense: ExpenseDto) => Promise<void>;
}

const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const getStatusConfig = (status?: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    Pending: { color: 'orange', text: 'Beklemede' },
    Approved: { color: 'green', text: 'Onaylandı' },
    Rejected: { color: 'red', text: 'Reddedildi' },
    Paid: { color: 'blue', text: 'Ödendi' },
  };
  return statusMap[status || ''] || { color: 'default', text: status || '-' };
};

export function ExpensesTable({
  expenses,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: ExpensesTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<ExpenseDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <UserIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.employeeName || `Çalışan #${record.employeeId}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (desc: string) => (
        <span className="text-sm text-slate-600">{desc || '-'}</span>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat: string) => (
        <span className="text-sm text-slate-600">{cat || '-'}</span>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'expenseDate',
      key: 'date',
      width: 110,
      sorter: (a, b) => dayjs(a.expenseDate).unix() - dayjs(b.expenseDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (value: number) => (
        <strong className="text-green-600">{formatCurrency(value)}</strong>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Beklemede', value: 'Pending' },
        { text: 'Onaylandı', value: 'Approved' },
        { text: 'Reddedildi', value: 'Rejected' },
        { text: 'Ödendi', value: 'Paid' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Eylemler',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => {
        const isPending = record.status === ExpenseStatus.Pending;

        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: 'Görüntüle',
                  icon: <EyeIcon className="w-4 h-4" />,
                  onClick: () => onView(record.id),
                },
                {
                  key: 'edit',
                  label: 'Düzenle',
                  icon: <PencilIcon className="w-4 h-4" />,
                  onClick: () => onEdit(record.id),
                  disabled: !isPending,
                },
                { type: 'divider' },
                ...(isPending
                  ? [
                      {
                        key: 'approve',
                        label: 'Onayla',
                        icon: <CheckCircleIcon className="w-4 h-4" />,
                        onClick: () => onApprove?.(record),
                      },
                      {
                        key: 'reject',
                        label: 'Reddet',
                        icon: <XCircleIcon className="w-4 h-4" />,
                        onClick: () => onReject?.(record),
                      },
                      { type: 'divider' as const },
                    ]
                  : []),
                {
                  key: 'delete',
                  label: 'Sil',
                  icon: <TrashIcon className="w-4 h-4" />,
                  danger: true,
                  onClick: (e: { domEvent: { stopPropagation: () => void } }) => {
                    e.domEvent.stopPropagation();
                    Modal.confirm({
                      title: 'Harcamayı Sil',
                      icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                      content: (
                        <div>
                          <p className="text-slate-600">
                            Bu harcama kaydını silmek istediğinize emin misiniz?
                          </p>
                          <p className="text-sm text-slate-500 mt-2">Bu işlem geri alınamaz.</p>
                        </div>
                      ),
                      okText: 'Sil',
                      okButtonProps: { danger: true },
                      cancelText: 'İptal',
                      onOk: async () => {
                        if (onDelete) {
                          await onDelete(record);
                        }
                      },
                    });
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <button
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <Table
      columns={columns}
      dataSource={expenses}
      rowKey="id"
      loading={loading}
      rowSelection={rowSelection}
      pagination={{
        current: currentPage,
        pageSize,
        total: totalCount,
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} harcama`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1000 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-gray-50',
      })}
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Harcama Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun harcama kaydı bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
