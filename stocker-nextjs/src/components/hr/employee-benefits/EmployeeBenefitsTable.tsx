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
import type { EmployeeBenefitDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface EmployeeBenefitsTableProps {
  benefits: EmployeeBenefitDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (benefit: EmployeeBenefitDto) => Promise<void>;
}

const statusColors: Record<string, string> = {
  Active: 'success',
  Pending: 'processing',
  Expired: 'default',
  Cancelled: 'error',
  Suspended: 'warning',
};

const statusLabels: Record<string, string> = {
  Active: 'Aktif',
  Pending: 'Beklemede',
  Expired: 'Süresi Doldu',
  Cancelled: 'İptal',
  Suspended: 'Askıda',
};

const benefitTypeLabels: Record<string, string> = {
  HealthInsurance: 'Sağlık Sigortası',
  LifeInsurance: 'Hayat Sigortası',
  DentalInsurance: 'Diş Sigortası',
  VisionInsurance: 'Göz Sigortası',
  RetirementPlan: 'Emeklilik Planı',
  MealCard: 'Yemek Kartı',
  TransportAllowance: 'Ulaşım Yardımı',
  CompanyCar: 'Şirket Aracı',
  FuelCard: 'Akaryakıt Kartı',
  GymMembership: 'Spor Salonu',
  EducationSupport: 'Eğitim Desteği',
  ChildcareSupport: 'Çocuk Bakımı',
  HousingAllowance: 'Konut Yardımı',
  PhoneAllowance: 'Telefon Yardımı',
  Other: 'Diğer',
};

export function EmployeeBenefitsTable({
  benefits,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: EmployeeBenefitsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<EmployeeBenefitDto> = [
    {
      title: 'Yan Hak',
      key: 'benefit',
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
            <div className="font-semibold text-gray-900 truncate">
              {record.benefitName}
            </div>
            <div className="text-xs text-gray-500">
              {benefitTypeLabels[record.benefitType] || record.benefitType}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150,
      sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''),
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name || '-'}</span>
      ),
    },
    {
      title: 'Değer',
      key: 'value',
      width: 120,
      render: (_, record) => (
        <span className="text-sm text-slate-700 font-medium">
          {record.amount ? `${record.amount.toLocaleString('tr-TR')} ${record.currency || 'TRY'}` : '-'}
        </span>
      ),
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span>
      ),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 110,
      render: (date: string) => (
        <span className="text-sm text-slate-600">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 110,
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
                    title: 'Yan Hakkı Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.benefitName}" yan hakkını silmek istediğinize emin misiniz?
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
      dataSource={benefits}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} yan hak`,
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
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Yan Hak Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun yan hak bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
