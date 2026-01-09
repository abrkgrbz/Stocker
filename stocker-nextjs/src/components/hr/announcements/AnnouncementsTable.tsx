'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BellIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import type { AnnouncementDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface AnnouncementsTableProps {
  announcements: AnnouncementDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (announcement: AnnouncementDto) => Promise<void>;
}

const priorityStyles: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600',
  Normal: 'bg-slate-200 text-slate-700',
  High: 'bg-slate-500 text-white',
  Urgent: 'bg-slate-900 text-white',
};

const priorityLabels: Record<string, string> = {
  Low: 'Dusuk',
  Normal: 'Normal',
  High: 'Yuksek',
  Urgent: 'Acil',
};

export function AnnouncementsTable({
  announcements,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: AnnouncementsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<AnnouncementDto> = [
    {
      title: 'Duyuru',
      key: 'announcement',
      fixed: 'left',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <BellIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate flex items-center gap-2">
              {record.isPinned && <MapPinIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />}
              {record.title}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {record.content?.substring(0, 60)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Yazar',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 150,
      render: (author: string) => (
        <span className="text-sm text-slate-600">{author || '-'}</span>
      ),
    },
    {
      title: 'Oncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      filters: [
        { text: 'Dusuk', value: 'Low' },
        { text: 'Normal', value: 'Normal' },
        { text: 'Yuksek', value: 'High' },
        { text: 'Acil', value: 'Urgent' },
      ],
      onFilter: (value, record) => record.priority === value,
      render: (priority: string) => (
        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${priorityStyles[priority] || 'bg-slate-100 text-slate-600'}`}>
          {priorityLabels[priority] || priority}
        </span>
      ),
    },
    {
      title: 'Yayin Tarihi',
      dataIndex: 'publishDate',
      key: 'publishDate',
      width: 120,
      sorter: (a, b) => dayjs(a.publishDate).unix() - dayjs(b.publishDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Hedef',
      dataIndex: 'targetDepartmentName',
      key: 'target',
      width: 130,
      render: (dept: string) => (
        <span className="text-sm text-slate-600">{dept || 'Tum Sirket'}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Yayinda', value: 'published' },
        { text: 'Taslak', value: 'draft' },
      ],
      onFilter: (value, record) => value === 'published' ? record.isPublished : !record.isPublished,
      render: (_, record) => (
        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
          record.isPublished ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
        }`}>
          {record.isPublished ? 'Yayinda' : 'Taslak'}
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
                    title: 'Duyuruyu Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-700" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.title}" duyurusunu silmek istediginize emin misiniz?
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
      dataSource={announcements}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} duyuru`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1100 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-slate-50',
      })}
      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <BellIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Duyuru Bulunamadi</h3>
            <p className="text-slate-500 text-sm">Arama kriterlerinize uygun duyuru bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
