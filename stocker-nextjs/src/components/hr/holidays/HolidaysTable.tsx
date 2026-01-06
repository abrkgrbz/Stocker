'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  GiftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { HolidayDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface HolidaysTableProps {
  holidays: HolidayDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (holiday: HolidayDto) => Promise<void>;
}

export function HolidaysTable({
  holidays,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: HolidaysTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<HolidayDto> = [
    {
      title: 'Tatil',
      key: 'holiday',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <GiftIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{record.name}</div>
            <div className="text-xs text-gray-500 truncate">
              {dayjs(record.date).format('DD MMMM YYYY')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Gün',
      dataIndex: 'date',
      key: 'dayOfWeek',
      width: 120,
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('dddd')}</span>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'isRecurring',
      key: 'type',
      width: 120,
      filters: [
        { text: 'Yıllık', value: true },
        { text: 'Tek Seferlik', value: false },
      ],
      onFilter: (value, record) => record.isRecurring === value,
      render: (isRecurring: boolean) => (
        <Tag color={isRecurring ? 'blue' : 'default'}>
          {isRecurring ? 'Yıllık' : 'Tek Seferlik'}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const isPassed = dayjs(record.date).isBefore(dayjs(), 'day');
        const isToday = dayjs(record.date).isSame(dayjs(), 'day');
        return (
          <Tag color={isToday ? 'green' : isPassed ? 'default' : 'blue'}>
            {isToday ? 'Bugün' : isPassed ? 'Geçti' : 'Yaklaşan'}
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
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: 'Tatil Gününü Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          <strong>{record.name}</strong> tatil gününü silmek istediğinize emin
                          misiniz?
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
      dataSource={holidays}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} tatil`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 700 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-gray-50',
      })}
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Tatil Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun tatil günü bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
