'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { AttendanceDto } from '@/lib/api/services/hr.types';
import { AttendanceStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface AttendanceTableProps {
  attendances: AttendanceDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
}

const getStatusConfig = (status?: AttendanceStatus) => {
  const statusMap: Record<number, { color: string; text: string }> = {
    [AttendanceStatus.Present]: { color: 'green', text: 'Mevcut' },
    [AttendanceStatus.Absent]: { color: 'red', text: 'Yok' },
    [AttendanceStatus.Late]: { color: 'orange', text: 'Geç' },
    [AttendanceStatus.HalfDay]: { color: 'blue', text: 'Yarım Gün' },
    [AttendanceStatus.OnLeave]: { color: 'purple', text: 'İzinli' },
    [AttendanceStatus.EarlyDeparture]: { color: 'cyan', text: 'Erken Ayrılış' },
    [AttendanceStatus.Holiday]: { color: 'gold', text: 'Tatil' },
    [AttendanceStatus.Weekend]: { color: 'default', text: 'Hafta Sonu' },
    [AttendanceStatus.RemoteWork]: { color: 'geekblue', text: 'Uzaktan Çalışma' },
    [AttendanceStatus.Overtime]: { color: 'lime', text: 'Fazla Mesai' },
    [AttendanceStatus.Training]: { color: 'magenta', text: 'Eğitim' },
    [AttendanceStatus.FieldWork]: { color: 'volcano', text: 'Saha Çalışması' },
  };
  const defaultConfig = { color: 'default', text: '-' };
  if (status === undefined || status === null) return defaultConfig;
  return statusMap[status] || defaultConfig;
};

const formatTime = (time?: string) => {
  if (!time) return '-';
  return time.substring(0, 5);
};

export function AttendanceTable({
  attendances,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
}: AttendanceTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<AttendanceDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#8b5cf615' }}
          >
            <UserIcon className="w-5 h-5" style={{ color: '#8b5cf6' }} />
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
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Giriş',
      dataIndex: 'checkInTime',
      key: 'checkIn',
      width: 100,
      render: (time: string) => (
        <span className="text-sm text-slate-600">{formatTime(time)}</span>
      ),
    },
    {
      title: 'Çıkış',
      dataIndex: 'checkOutTime',
      key: 'checkOut',
      width: 100,
      render: (time: string) => (
        <span className="text-sm text-slate-600">{formatTime(time)}</span>
      ),
    },
    {
      title: 'Çalışma Süresi',
      dataIndex: 'workedHours',
      key: 'workedHours',
      width: 130,
      render: (hours: number) => (
        <span className="text-sm text-slate-600">{hours ? `${hours.toFixed(1)} saat` : '-'}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Mevcut', value: AttendanceStatus.Present },
        { text: 'Yok', value: AttendanceStatus.Absent },
        { text: 'Geç', value: AttendanceStatus.Late },
        { text: 'Yarım Gün', value: AttendanceStatus.HalfDay },
        { text: 'İzinli', value: AttendanceStatus.OnLeave },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: AttendanceStatus) => {
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
      dataSource={attendances}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 900 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-gray-50',
      })}
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Kayıt Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun yoklama kaydı bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
