'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Space } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { WorkScheduleDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface WorkSchedulesTableProps {
  schedules: WorkScheduleDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (schedule: WorkScheduleDto) => Promise<void>;
}

export function WorkSchedulesTable({
  schedules,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: WorkSchedulesTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<WorkScheduleDto> = [
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
            <CalendarIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.employeeName || `Çalışan #${record.employeeId}`}
            </div>
            <div className="text-xs text-gray-500">
              {dayjs(record.date).format('DD.MM.YYYY')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vardiya',
      dataIndex: 'shiftName',
      key: 'shiftName',
      width: 150,
      render: (name: string) => (
        <Space>
          <ClockIcon className="w-4 h-4 text-violet-500" />
          <span className="text-sm text-slate-600">{name || '-'}</span>
        </Space>
      ),
    },
    {
      title: 'Çalışma Günü',
      dataIndex: 'isWorkDay',
      key: 'isWorkDay',
      width: 120,
      filters: [
        { text: 'Evet', value: true },
        { text: 'Hayır', value: false },
      ],
      onFilter: (value, record) => record.isWorkDay === value,
      render: (isWorkDay: boolean) => (
        <Tag color={isWorkDay ? 'green' : 'default'}>{isWorkDay ? 'Evet' : 'Hayır'}</Tag>
      ),
    },
    {
      title: 'Tatil',
      dataIndex: 'isHoliday',
      key: 'isHoliday',
      width: 150,
      render: (isHoliday: boolean, record) =>
        isHoliday ? (
          <Tag color="red">{record.holidayName || 'Tatil'}</Tag>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        ),
    },
    {
      title: 'Özel Saatler',
      key: 'customTime',
      width: 150,
      render: (_, record) =>
        record.customStartTime || record.customEndTime ? (
          <span className="text-sm text-slate-600">
            {record.customStartTime?.substring(0, 5)} - {record.customEndTime?.substring(0, 5)}
          </span>
        ) : (
          <span className="text-sm text-slate-400">-</span>
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
                    title: 'Çalışma Programını Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu çalışma programı kaydını silmek istediğinize emin misiniz?
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
      dataSource={schedules}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} program`,
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
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Program Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun çalışma programı bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
