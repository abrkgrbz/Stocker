'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal } from 'antd';
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

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Active: { bg: 'bg-slate-900', text: 'text-white', label: 'Aktif' },
  Pending: { bg: 'bg-slate-400', text: 'text-white', label: 'Beklemede' },
  Expired: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Suresi Doldu' },
  Cancelled: { bg: 'bg-slate-200', text: 'text-slate-600', label: 'Iptal' },
  Suspended: { bg: 'bg-slate-500', text: 'text-white', label: 'Askida' },
};

const benefitTypeLabels: Record<string, string> = {
  HealthInsurance: 'Saglik Sigortasi',
  LifeInsurance: 'Hayat Sigortasi',
  DentalInsurance: 'Dis Sigortasi',
  VisionInsurance: 'Goz Sigortasi',
  RetirementPlan: 'Emeklilik Plani',
  MealCard: 'Yemek Karti',
  TransportAllowance: 'Ulasim Yardimi',
  CompanyCar: 'Sirket Araci',
  FuelCard: 'Akaryakit Karti',
  GymMembership: 'Spor Salonu',
  EducationSupport: 'Egitim Destegi',
  ChildcareSupport: 'Cocuk Bakimi',
  HousingAllowance: 'Konut Yardimi',
  PhoneAllowance: 'Telefon Yardimi',
  Other: 'Diger',
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
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <GiftIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {record.benefitName}
            </div>
            <div className="text-xs text-slate-500">
              {benefitTypeLabels[record.benefitType] || record.benefitType}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Calisan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150,
      sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''),
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name || '-'}</span>
      ),
    },
    {
      title: 'Deger',
      key: 'value',
      width: 120,
      render: (_, record) => (
        <span className="text-sm text-slate-700 font-medium">
          {record.amount ? `${record.amount.toLocaleString('tr-TR')} ${record.currency || 'TRY'}` : '-'}
        </span>
      ),
    },
    {
      title: 'Baslangic',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span>
      ),
    },
    {
      title: 'Bitis',
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
      filters: Object.entries(statusConfig).map(([value, config]) => ({ text: config.label, value })),
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const config = statusConfig[record.status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: record.status };
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
                    title: 'Yan Hakki Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-900" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.benefitName}" yan hakkini silmek istediginize emin misiniz?
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
        className: 'cursor-pointer hover:bg-slate-50',
      })}
      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200"
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <GiftIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Yan Hak Bulunamadi</h3>
            <p className="text-slate-500">Arama kriterlerinize uygun yan hak bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
