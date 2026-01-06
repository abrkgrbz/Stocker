'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PrinterIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { PayslipDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface PayslipsTableProps {
  payslips: PayslipDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onPrint?: (id: number) => void;
  onDelete?: (payslip: PayslipDto) => Promise<void>;
}

const statusColors: Record<string, string> = {
  Draft: 'default',
  Pending: 'processing',
  Approved: 'success',
  Paid: 'blue',
  Cancelled: 'error',
};

const statusLabels: Record<string, string> = {
  Draft: 'Taslak',
  Pending: 'Bekliyor',
  Approved: 'Onaylandı',
  Paid: 'Ödendi',
  Cancelled: 'İptal',
};

export function PayslipsTable({
  payslips,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onPrint,
  onDelete,
}: PayslipsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value || 0);

  const columns: TableColumnsType<PayslipDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#10b98115' }}
          >
            <CurrencyDollarIcon className="w-5 h-5" style={{ color: '#10b981' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.employeeName}
            </div>
            <div className="text-xs text-gray-500">
              {record.payslipNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Dönem',
      key: 'period',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-700">{record.period}</div>
          <div className="text-xs text-gray-400">
            {dayjs(record.periodStart).format('DD.MM')} - {dayjs(record.periodEnd).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Brüt Maaş',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.grossSalary - b.grossSalary,
      render: (val: number) => (
        <span className="text-sm text-slate-700 font-medium">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Kesintiler',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      width: 120,
      align: 'right',
      render: (val: number) => (
        <span className="text-sm text-red-600">-{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Net Maaş',
      dataIndex: 'netSalary',
      key: 'netSalary',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.netSalary - b.netSalary,
      render: (val: number) => (
        <span className="text-sm text-green-600 font-bold">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Ödeme Tarihi',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      sorter: (a, b) => dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-700">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
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
                key: 'print',
                label: 'Yazdır',
                icon: <PrinterIcon className="w-4 h-4" />,
                onClick: () => onPrint?.(record.id),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                disabled: record.status === 'Paid',
                onClick: (e: { domEvent: { stopPropagation: () => void } }) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: 'Bordroyu Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu bordroyu silmek istediğinize emin misiniz?
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
      dataSource={payslips}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bordro`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1200 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-gray-50',
      })}
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Bordro Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun bordro bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
