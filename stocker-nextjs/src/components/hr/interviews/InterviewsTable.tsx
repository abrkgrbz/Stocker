'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Rate } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { InterviewDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface InterviewsTableProps {
  interviews: InterviewDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (interview: InterviewDto) => Promise<void>;
}

const statusColors: Record<string, string> = {
  Scheduled: 'processing',
  Confirmed: 'cyan',
  InProgress: 'blue',
  Completed: 'success',
  Cancelled: 'error',
  NoShow: 'default',
  Rescheduled: 'warning',
};

const statusLabels: Record<string, string> = {
  Scheduled: 'Planlandı',
  Confirmed: 'Onaylandı',
  InProgress: 'Devam Ediyor',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal Edildi',
  NoShow: 'Gelmedi',
  Rescheduled: 'Yeniden Planlandı',
};

const interviewTypeLabels: Record<string, string> = {
  Phone: 'Telefon',
  Video: 'Video',
  InPerson: 'Yüz Yüze',
  Panel: 'Panel',
  Technical: 'Teknik',
  HR: 'İK',
  Final: 'Final',
  Group: 'Grup',
};

export function InterviewsTable({
  interviews,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: InterviewsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<InterviewDto> = [
    {
      title: 'Mülakat',
      key: 'interview',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <UserGroupIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.candidateName}
            </div>
            <div className="text-xs text-gray-500">
              {interviewTypeLabels[record.interviewType] || record.interviewType}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Görüşmeci',
      dataIndex: 'interviewerName',
      key: 'interviewerName',
      width: 150,
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name || '-'}</span>
      ),
    },
    {
      title: 'Tarih/Saat',
      dataIndex: 'scheduledDateTime',
      key: 'scheduledDateTime',
      width: 150,
      sorter: (a, b) => dayjs(a.scheduledDateTime).unix() - dayjs(b.scheduledDateTime).unix(),
      render: (date: string) => (
        <div>
          <div className="text-sm text-slate-700">{dayjs(date).format('DD.MM.YYYY')}</div>
          <div className="text-xs text-gray-400">{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Puan',
      dataIndex: 'overallRating',
      key: 'overallRating',
      width: 120,
      render: (rating: number) => (
        rating ? <Rate disabled value={rating / 2} allowHalf /> : <span className="text-gray-400">-</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      filters: Object.entries(statusLabels).map(([value, label]) => ({ text: label, value })),
      onFilter: (value, record) => record.status === value,
      render: (_, record) => (
        <Tag color={statusColors[record.status] || 'default'}>
          {statusLabels[record.status] || record.status}
        </Tag>
      ),
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
                    title: 'Mülakatı Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu mülakatı silmek istediğinize emin misiniz?
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
      dataSource={interviews}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} mülakat`,
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
            <div className="text-6xl mb-4">🎤</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Mülakat Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun mülakat bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
