'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeDocumentDto } from '@/lib/api/services/hr.types';
import { DocumentType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface DocumentsTableProps {
  documents: EmployeeDocumentDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (document: EmployeeDocumentDto) => Promise<void>;
}

const documentTypeLabels: Record<number, string> = {
  [DocumentType.IdentityCard]: 'Kimlik Karti',
  [DocumentType.Passport]: 'Pasaport',
  [DocumentType.DrivingLicense]: 'Ehliyet',
  [DocumentType.Diploma]: 'Diploma',
  [DocumentType.Certificate]: 'Sertifika',
  [DocumentType.Resume]: 'Ozgecmis',
  [DocumentType.EmploymentContract]: 'Is Sozlesmesi',
  [DocumentType.MedicalReport]: 'Saglik Raporu',
  [DocumentType.CriminalRecord]: 'Sabika Kaydi',
  [DocumentType.AddressProof]: 'Adres Belgesi',
  [DocumentType.ReferenceLetter]: 'Referans Mektubu',
  [DocumentType.SocialSecurityDocument]: 'SGK Belgesi',
  [DocumentType.BankInformation]: 'Banka Bilgileri',
  [DocumentType.FamilyRegister]: 'Aile Kayit Belgesi',
  [DocumentType.MilitaryDocument]: 'Askerlik Belgesi',
  [DocumentType.Photo]: 'Fotograf',
  [DocumentType.Other]: 'Diger',
};

export function DocumentsTable({
  documents,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: DocumentsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<EmployeeDocumentDto> = [
    {
      title: 'Belge',
      key: 'document',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <DocumentIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {record.title}
            </div>
            <div className="text-xs text-slate-400">
              {record.documentNumber || 'Belge No: -'}
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
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name}</span>
      ),
    },
    {
      title: 'Tur',
      dataIndex: 'documentType',
      key: 'documentType',
      width: 140,
      render: (type: DocumentType) => (
        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600">
          {documentTypeLabels[type] || 'Bilinmiyor'}
        </span>
      ),
    },
    {
      title: 'Son Gecerlilik',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 130,
      sorter: (a, b) => {
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix();
      },
      render: (date: string | undefined, record: EmployeeDocumentDto) => {
        if (!date) return <span className="text-slate-400">-</span>;
        const style = record.isExpired
          ? 'bg-slate-900 text-white'
          : record.isExpiringSoon
            ? 'bg-slate-300 text-slate-700'
            : 'bg-slate-100 text-slate-600';
        return (
          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${style}`}>
            {dayjs(date).format('DD.MM.YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Dogrulama',
      key: 'verification',
      width: 120,
      filters: [
        { text: 'Dogrulandi', value: true },
        { text: 'Bekliyor', value: false },
      ],
      onFilter: (value, record) => record.isVerified === value,
      render: (_, record) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${
          record.isVerified ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
        }`}>
          {record.isVerified ? (
            <CheckCircleIcon className="w-3 h-3" />
          ) : (
            <ClockIcon className="w-3 h-3" />
          )}
          {record.isVerified ? 'Dogrulandi' : 'Bekliyor'}
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
                    title: 'Belgeyi Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-700" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.title}" belgesini silmek istediginize emin misiniz?
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
      dataSource={documents}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} belge`,
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
              <DocumentIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Belge Bulunamadi</h3>
            <p className="text-slate-500 text-sm">Arama kriterlerinize uygun belge bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
