'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal, Progress } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CursorArrowRaysIcon,
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
    return { bg: 'bg-slate-900', text: 'text-white', label: 'Geckmis' };
  }
  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    NotStarted: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Baslamadi' },
    InProgress: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Devam Ediyor' },
    Completed: { bg: 'bg-slate-900', text: 'text-white', label: 'Tamamlandi' },
    Cancelled: { bg: 'bg-slate-300', text: 'text-slate-600', label: 'Iptal' },
  };
  return statusMap[status || ''] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status || '-' };
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
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <CursorArrowRaysIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {record.title}
            </div>
            <div className="text-xs text-slate-500">
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
      title: 'Ilerleme',
      key: 'progress',
      width: 180,
      render: (_, record) => (
        <Progress
          percent={record.progressPercentage || 0}
          size="small"
          strokeColor="#1e293b"
          trailColor="#e2e8f0"
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
        { text: 'Baslamadi', value: 'NotStarted' },
        { text: 'Devam Ediyor', value: 'InProgress' },
        { text: 'Tamamlandi', value: 'Completed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const config = getStatusConfig(record.status, record.isOverdue);
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
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
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => onView(record.id),
              },
              {
                key: 'edit',
                label: 'Duzenle',
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
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-900" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.title}" hedefini silmek istediginize emin misiniz?
                        </p>
                        <p className="text-sm text-slate-500 mt-2">Bu islem geri alinamaz.</p>
                      </div>
                    ),
                    okText: 'Sil',
                    okButtonProps: { danger: true },
                    cancelText: 'Iptal',
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
        className: 'cursor-pointer hover:bg-slate-50',
      })}
      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200"
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <CursorArrowRaysIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Hedef Bulunamadi</h3>
            <p className="text-slate-500">Arama kriterlerinize uygun performans hedefi bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
