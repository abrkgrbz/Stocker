'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
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
import type { TimeSheetDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface TimeSheetsTableProps {
  timeSheets: TimeSheetDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (timeSheet: TimeSheetDto) => Promise<void>;
  onApprove?: (timeSheet: TimeSheetDto) => Promise<void>;
  onReject?: (timeSheet: TimeSheetDto) => Promise<void>;
}

const statusOptions = [
  { value: 'Draft', label: 'Taslak', color: 'default' },
  { value: 'Submitted', label: 'Gönderildi', color: 'processing' },
  { value: 'Approved', label: 'Onaylandı', color: 'success' },
  { value: 'Rejected', label: 'Reddedildi', color: 'error' },
  { value: 'Paid', label: 'Ödendi', color: 'blue' },
];

export function TimeSheetsTable({
  timeSheets,
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
}: TimeSheetsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<TimeSheetDto> = [
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
      width: 180,
      render: (_, record) => (
        <span className="text-sm text-slate-600">
          {dayjs(record.periodStart).format('DD.MM.YYYY')} - {dayjs(record.periodEnd).format('DD.MM.YYYY')}
        </span>
      ),
    },
    {
      title: 'Normal Saat',
      dataIndex: 'regularHours',
      key: 'regularHours',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span className="text-sm text-slate-600">{val ? `${val} saat` : '-'}</span>
      ),
    },
    {
      title: 'Fazla Mesai',
      dataIndex: 'overtimeHours',
      key: 'overtimeHours',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span className="text-sm text-orange-600">{val ? `${val} saat` : '-'}</span>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'totalWorkHours',
      key: 'totalWorkHours',
      width: 100,
      align: 'right',
      render: (val: number) => (
        <strong className="text-green-600">{val ? `${val} saat` : '-'}</strong>
      ),
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
        const canApprove = record.status === 'Submitted';
        const canEdit = record.status === 'Draft';

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
                  disabled: !canEdit,
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
                  disabled: record.isLocked,
                  onClick: (e: { domEvent: { stopPropagation: () => void } }) => {
                    e.domEvent.stopPropagation();
                    Modal.confirm({
                      title: 'Puantaj Kaydını Sil',
                      icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                      content: (
                        <div>
                          <p className="text-slate-600">
                            Bu puantaj kaydını silmek istediğinize emin misiniz?
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
      dataSource={timeSheets}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} puantaj`,
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
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Puantaj Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun puantaj kaydı bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
