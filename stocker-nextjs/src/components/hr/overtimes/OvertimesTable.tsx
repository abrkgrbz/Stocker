'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Space } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { OvertimeDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface OvertimesTableProps {
  overtimes: OvertimeDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (overtime: OvertimeDto) => Promise<void>;
  onApprove?: (overtime: OvertimeDto) => Promise<void>;
  onReject?: (overtime: OvertimeDto) => Promise<void>;
}

const overtimeTypeOptions = [
  { value: 'Regular', label: 'Normal Mesai' },
  { value: 'Weekend', label: 'Hafta Sonu' },
  { value: 'Holiday', label: 'Tatil Günü' },
  { value: 'Night', label: 'Gece Mesaisi' },
  { value: 'Emergency', label: 'Acil Durum' },
  { value: 'Project', label: 'Proje Bazlı' },
];

const statusOptions = [
  { value: 'Pending', label: 'Beklemede', color: 'orange' },
  { value: 'Approved', label: 'Onaylandı', color: 'green' },
  { value: 'Rejected', label: 'Reddedildi', color: 'red' },
  { value: 'Completed', label: 'Tamamlandı', color: 'blue' },
  { value: 'Cancelled', label: 'İptal Edildi', color: 'default' },
];

const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const formatTime = (time?: string) => {
  if (!time) return '-';
  return time.substring(0, 5);
};

export function OvertimesTable({
  overtimes,
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
}: OvertimesTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<OvertimeDto> = [
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
            <ClockIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
              {record.employeeName || `Çalışan #${record.employeeId}`}
              {record.isEmergency && (
                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-xs text-gray-500">
              {dayjs(record.date).format('DD.MM.YYYY')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Saat Aralığı',
      key: 'time',
      width: 120,
      render: (_, record) => (
        <span className="text-sm text-slate-600">
          {formatTime(record.startTime)} - {formatTime(record.endTime)}
        </span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'overtimeType',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeOption = overtimeTypeOptions.find((t) => t.value === type);
        return <Tag>{typeOption?.label || type}</Tag>;
      },
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true,
      render: (reason: string) => (
        <span className="text-sm text-slate-600">{reason || '-'}</span>
      ),
    },
    {
      title: 'Süre',
      key: 'hours',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size={0} className="text-center">
          <span className="font-semibold text-gray-900">
            {record.actualHours || record.plannedHours} saat
          </span>
          <span className="text-xs text-gray-500">x{record.payMultiplier}</span>
        </Space>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'calculatedAmount',
      key: 'amount',
      width: 120,
      render: (amount: number, record) => {
        if (record.isCompensatoryTimeOff) {
          return <Tag color="purple">Telafi İzni</Tag>;
        }
        return <strong className="text-green-600">{formatCurrency(amount)}</strong>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const statusOption = statusOptions.find((s) => s.value === status);
        return <Tag color={statusOption?.color || 'default'}>{statusOption?.label || status}</Tag>;
      },
    },
    {
      title: 'Eylemler',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => {
        const isPending = record.status === 'Pending';

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
                      title: 'Mesai Kaydını Sil',
                      icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                      content: (
                        <div>
                          <p className="text-slate-600">
                            Bu mesai kaydını silmek istediğinize emin misiniz?
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
      dataSource={overtimes}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} mesai`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1200 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-gray-50',
      })}
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Mesai Kaydı Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun mesai kaydı bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
