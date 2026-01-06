'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { PayrollDto } from '@/lib/api/services/hr.types';
import { PayrollStatus } from '@/lib/api/services/hr.types';

interface PayrollTableProps {
  payrolls: PayrollDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onApprove?: (payroll: PayrollDto) => Promise<void>;
  onMarkPaid?: (payroll: PayrollDto) => Promise<void>;
  onCancel?: (payroll: PayrollDto) => Promise<void>;
}

const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const getStatusConfig = (status?: PayrollStatus) => {
  const statusMap: Record<number, { color: string; text: string }> = {
    [PayrollStatus.Draft]: { color: 'default', text: 'Taslak' },
    [PayrollStatus.Calculated]: { color: 'processing', text: 'Hesaplandı' },
    [PayrollStatus.PendingApproval]: { color: 'orange', text: 'Onay Bekliyor' },
    [PayrollStatus.Approved]: { color: 'blue', text: 'Onaylandı' },
    [PayrollStatus.Paid]: { color: 'green', text: 'Ödendi' },
    [PayrollStatus.Cancelled]: { color: 'red', text: 'İptal' },
    [PayrollStatus.Rejected]: { color: 'volcano', text: 'Reddedildi' },
  };
  const defaultConfig = { color: 'default', text: '-' };
  if (status === undefined || status === null) return defaultConfig;
  return statusMap[status] || defaultConfig;
};

export function PayrollTable({
  payrolls,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onApprove,
  onMarkPaid,
  onCancel,
}: PayrollTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<PayrollDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      fixed: 'left',
      width: 220,
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
      title: 'Dönem',
      key: 'period',
      width: 100,
      render: (_, record) => (
        <span className="text-sm text-slate-600">{record.month}/{record.year}</span>
      ),
    },
    {
      title: 'Brüt Maaş',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      width: 130,
      render: (value: number) => (
        <span className="text-sm text-slate-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Kesintiler',
      dataIndex: 'totalDeductions',
      key: 'deductions',
      width: 120,
      render: (value: number) => (
        <span className="text-sm text-red-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Net Maaş',
      dataIndex: 'netSalary',
      key: 'netSalary',
      width: 130,
      render: (value: number) => (
        <strong className="text-green-600">{formatCurrency(value)}</strong>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Taslak', value: PayrollStatus.Draft },
        { text: 'Hesaplandı', value: PayrollStatus.Calculated },
        { text: 'Onay Bekliyor', value: PayrollStatus.PendingApproval },
        { text: 'Onaylandı', value: PayrollStatus.Approved },
        { text: 'Ödendi', value: PayrollStatus.Paid },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: PayrollStatus) => {
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
        const canApprove =
          record.status === PayrollStatus.PendingApproval ||
          record.status === PayrollStatus.Draft ||
          record.status === PayrollStatus.Calculated;
        const canMarkPaid = record.status === PayrollStatus.Approved;
        const canCancel =
          record.status !== PayrollStatus.Paid && record.status !== PayrollStatus.Cancelled;

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
                  disabled: record.status === PayrollStatus.Paid,
                },
                { type: 'divider' },
                ...(canApprove
                  ? [
                      {
                        key: 'approve',
                        label: 'Onayla',
                        icon: <CheckCircleIcon className="w-4 h-4" />,
                        onClick: () => onApprove?.(record),
                      },
                    ]
                  : []),
                ...(canMarkPaid
                  ? [
                      {
                        key: 'markPaid',
                        label: 'Öde',
                        icon: <PaperAirplaneIcon className="w-4 h-4" />,
                        onClick: () => onMarkPaid?.(record),
                      },
                    ]
                  : []),
                { type: 'divider' as const },
                {
                  key: 'cancel',
                  label: 'İptal Et',
                  icon: <XCircleIcon className="w-4 h-4" />,
                  danger: true,
                  disabled: !canCancel,
                  onClick: (e: { domEvent: { stopPropagation: () => void } }) => {
                    e.domEvent.stopPropagation();
                    Modal.confirm({
                      title: 'Bordro İptal Et',
                      icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                      content: (
                        <div>
                          <p className="text-slate-600">
                            Bu bordro kaydını iptal etmek istediğinize emin misiniz?
                          </p>
                          <p className="text-sm text-slate-500 mt-2">Bu işlem geri alınamaz.</p>
                        </div>
                      ),
                      okText: 'İptal Et',
                      okButtonProps: { danger: true },
                      cancelText: 'Vazgeç',
                      onOk: async () => {
                        if (onCancel) {
                          await onCancel(record);
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
      dataSource={payrolls}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bordro`,
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
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Bordro Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun bordro kaydı bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
