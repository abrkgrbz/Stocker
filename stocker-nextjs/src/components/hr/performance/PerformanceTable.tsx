'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Rate, Space } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { PerformanceReviewDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface PerformanceTableProps {
  reviews: PerformanceReviewDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (review: PerformanceReviewDto) => Promise<void>;
}

const getStatusConfig = (status?: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    Draft: { color: 'default', text: 'Taslak' },
    InProgress: { color: 'blue', text: 'Devam Ediyor' },
    Completed: { color: 'green', text: 'Tamamlandı' },
    Cancelled: { color: 'red', text: 'İptal' },
  };
  return statusMap[status || ''] || { color: 'default', text: status || '-' };
};

export function PerformanceTable({
  reviews,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: PerformanceTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<PerformanceReviewDto> = [
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
            <TrophyIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.employeeName || `Çalışan #${record.employeeId}`}
            </div>
            <div className="text-xs text-gray-500">
              {record.positionTitle || record.departmentName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Dönem',
      dataIndex: 'reviewPeriod',
      key: 'period',
      width: 150,
      render: (period: string) => (
        <span className="text-sm text-slate-600">{period || '-'}</span>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'reviewDate',
      key: 'date',
      width: 120,
      sorter: (a, b) => dayjs(a.reviewDate).unix() - dayjs(b.reviewDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Puan',
      dataIndex: 'overallScore',
      key: 'score',
      width: 160,
      sorter: (a, b) => (a.overallScore || 0) - (b.overallScore || 0),
      render: (score: number) => (
        <Space>
          <Rate disabled value={(score || 0) / 2} allowHalf style={{ fontSize: 14 }} />
          <span className="text-sm font-medium">({score?.toFixed(1) || '-'})</span>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Taslak', value: 'Draft' },
        { text: 'Devam Ediyor', value: 'InProgress' },
        { text: 'Tamamlandı', value: 'Completed' },
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
                    title: 'Değerlendirmeyi Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu performans değerlendirmesini silmek istediğinize emin misiniz?
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
      dataSource={reviews}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} değerlendirme`,
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
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Değerlendirme Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun performans değerlendirmesi bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
