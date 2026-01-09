'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal, Rate } from 'antd';
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

const statusStyles: Record<string, string> = {
  Scheduled: 'bg-slate-200 text-slate-700',
  Confirmed: 'bg-slate-300 text-slate-700',
  InProgress: 'bg-slate-500 text-white',
  Completed: 'bg-slate-900 text-white',
  Cancelled: 'bg-slate-200 text-slate-500',
  NoShow: 'bg-slate-100 text-slate-400',
  Rescheduled: 'bg-slate-300 text-slate-600',
};

const statusLabels: Record<string, string> = {
  Scheduled: 'Planlandi',
  Confirmed: 'Onaylandi',
  InProgress: 'Devam Ediyor',
  Completed: 'Tamamlandi',
  Cancelled: 'Iptal Edildi',
  NoShow: 'Gelmedi',
  Rescheduled: 'Yeniden Planlandi',
};

const interviewTypeLabels: Record<string, string> = {
  Phone: 'Telefon',
  Video: 'Video',
  InPerson: 'Yuz Yuze',
  Panel: 'Panel',
  Technical: 'Teknik',
  HR: 'IK',
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
      title: 'Mulakat',
      key: 'interview',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <UserGroupIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {record.candidateName}
            </div>
            <div className="text-xs text-slate-400">
              {interviewTypeLabels[record.interviewType] || record.interviewType}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Gorusmeci',
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
          <div className="text-xs text-slate-400">{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Puan',
      dataIndex: 'overallRating',
      key: 'overallRating',
      width: 120,
      render: (rating: number) => (
        rating ? <Rate disabled value={rating / 2} allowHalf /> : <span className="text-slate-400">-</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      filters: Object.entries(statusLabels).map(([value, label]) => ({ text: label, value })),
      onFilter: (value, record) => record.status === value,
      render: (_, record) => (
        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${statusStyles[record.status] || 'bg-slate-100 text-slate-600'}`}>
          {statusLabels[record.status] || record.status}
        </span>
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
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => onView(record.id),
              },
              {
                key: 'edit',
                label: 'Duzenle',
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
                    title: 'Mulakati Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-700" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu mulakati silmek istediginize emin misiniz?
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} mulakat`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1000 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-slate-50',
      })}
      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <UserGroupIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Mulakat Bulunamadi</h3>
            <p className="text-slate-500 text-sm">Arama kriterlerinize uygun mulakat bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
