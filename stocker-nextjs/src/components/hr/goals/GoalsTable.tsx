'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Progress } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CursorArrowRaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { PerformanceGoalDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface GoalsTableProps {
  goals: PerformanceGoalDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (goal: PerformanceGoalDto) => Promise<void>;
}

const getStatusConfig = (status?: string, isOverdue?: boolean) => {
  if (isOverdue && status !== 'Completed' && status !== 'Cancelled') {
    return { color: 'red', text: 'Gecikmiş', icon: <ExclamationCircleIcon className="w-4 h-4" /> };
  }
  const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
    NotStarted: { color: 'default', text: 'Başlamadı', icon: <ClockIcon className="w-4 h-4" /> },
    InProgress: { color: 'blue', text: 'Devam Ediyor', icon: <ClockIcon className="w-4 h-4" /> },
    Completed: { color: 'green', text: 'Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
    Cancelled: { color: 'red', text: 'İptal', icon: <ExclamationCircleIcon className="w-4 h-4" /> },
  };
  return statusMap[status || ''] || { color: 'default', text: status || '-', icon: null };
};

export function GoalsTable({
  goals,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: GoalsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<PerformanceGoalDto> = [
    {
      title: 'Hedef',
      key: 'goal',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <CursorArrowRaysIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.title}
            </div>
            <div className="text-xs text-gray-500">
              {record.employeeName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <span className="text-sm text-slate-600">{category || '-'}</span>
      ),
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 180,
      render: (_, record) => (
        <Progress
          percent={record.progressPercentage || 0}
          size="small"
          status={record.isOverdue ? 'exception' : undefined}
        />
      ),
    },
    {
      title: 'Hedef Tarihi',
      dataIndex: 'targetDate',
      key: 'targetDate',
      width: 120,
      sorter: (a, b) => dayjs(a.targetDate).unix() - dayjs(b.targetDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Başlamadı', value: 'NotStarted' },
        { text: 'Devam Ediyor', value: 'InProgress' },
        { text: 'Tamamlandı', value: 'Completed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const config = getStatusConfig(record.status, record.isOverdue);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
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
                disabled: record.status === 'Completed',
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: (e: { domEvent: { stopPropagation: () => void } }) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: 'Hedefi Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.title}" hedefini silmek istediğinize emin misiniz?
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
      dataSource={goals}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} hedef`,
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
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Hedef Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun performans hedefi bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
