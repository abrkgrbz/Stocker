'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Avatar, Modal } from 'antd';
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
import type { LeaveDto } from '@/lib/api/services/hr.types';
import { LeaveStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

// Leave status configuration
const leaveStatusConfig: Record<number, { color: string; label: string }> = {
  [LeaveStatus.Pending]: { color: 'orange', label: 'Beklemede' },
  [LeaveStatus.Approved]: { color: 'green', label: 'Onaylandı' },
  [LeaveStatus.Rejected]: { color: 'red', label: 'Reddedildi' },
  [LeaveStatus.Cancelled]: { color: 'default', label: 'İptal Edildi' },
  [LeaveStatus.Taken]: { color: 'blue', label: 'Kullanıldı' },
  [LeaveStatus.PartiallyTaken]: { color: 'cyan', label: 'Kısmen Kullanıldı' },
};

interface LeavesTableProps {
  leaves: LeaveDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (leave: LeaveDto) => Promise<void>;
  onApprove?: (leave: LeaveDto) => Promise<void>;
  onReject?: (leave: LeaveDto) => Promise<void>;
}

export function LeavesTable({
  leaves,
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
}: LeavesTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<LeaveDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<UserIcon className="w-5 h-5" />}
            style={{ backgroundColor: '#7c3aed' }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{record.employeeName}</div>
            <div className="text-xs text-gray-500 truncate">{record.employeeCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'İzin Türü',
      dataIndex: 'leaveTypeName',
      key: 'leaveType',
      width: 140,
      render: (name, record) =>
        name ? (
          <Tag color={record.leaveTypeColor || 'blue'} className="m-0">
            {name}
          </Tag>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (date) =>
        date ? (
          <span className="text-gray-600">{dayjs(date).format('DD.MM.YYYY')}</span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 110,
      render: (date) =>
        date ? (
          <span className="text-gray-600">{dayjs(date).format('DD.MM.YYYY')}</span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'Gün',
      dataIndex: 'totalDays',
      key: 'days',
      width: 80,
      render: (days, record) => (
        <span className="text-gray-600">
          {days} {record.isHalfDay && '(Y)'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: Object.entries(leaveStatusConfig).map(([value, config]) => ({
        text: config.label,
        value: Number(value),
      })),
      onFilter: (value, record) => record.status === value,
      render: (status: LeaveStatus) => {
        const config = leaveStatusConfig[status];
        return config ? (
          <Tag color={config.color} className="m-0">
            {config.label}
          </Tag>
        ) : (
          <Tag>{status}</Tag>
        );
      },
    },
    {
      title: 'Eylemler',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
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
                disabled: record.status !== LeaveStatus.Pending,
              },
              {
                type: 'divider',
              },
              ...(record.status === LeaveStatus.Pending
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
                      onClick: () => {
                        Modal.confirm({
                          title: 'İzin Talebini Reddet',
                          icon: <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />,
                          content: (
                            <div>
                              <p className="text-slate-600">
                                <strong>{record.employeeName}</strong> çalışanının izin talebini
                                reddetmek istediğinize emin misiniz?
                              </p>
                            </div>
                          ),
                          okText: 'Reddet',
                          okButtonProps: { danger: true },
                          cancelText: 'İptal',
                          onOk: async () => {
                            if (onReject) {
                              await onReject(record);
                            }
                          },
                        });
                      },
                    },
                    { type: 'divider' as const },
                  ]
                : []),
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: 'İzin Talebini Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          <strong>{record.employeeName}</strong> çalışanının izin talebini silmek
                          istediğinize emin misiniz?
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
      ),
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
      dataSource={leaves}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} izin talebi`,
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
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">İzin Talebi Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun izin talebi bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
