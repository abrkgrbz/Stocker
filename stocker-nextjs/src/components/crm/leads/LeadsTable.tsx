'use client';

import React from 'react';
import { Table, Tag, Dropdown, Button, Avatar } from 'antd';
import {
  MoreOutlined,
  MailOutlined,
  PhoneOutlined,
  StarOutlined,
  SwapOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Lead } from '@/lib/api/services/crm.service';
import { CRM_COLORS, CRM_STATUS_LABELS } from '@/lib/crm/constants';
import { formatDate } from '@/lib/crm/formatters';

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView?: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string, lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onQualify?: (lead: Lead) => void;
  onDisqualify?: (lead: Lead) => void;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (selectedRowKeys: React.Key[]) => void;
}

// Source colors mapping
const sourceColors: Record<string, string> = {
  Website: 'blue',
  Referral: 'green',
  SocialMedia: 'cyan',
  Event: 'orange',
  Other: 'default',
};

// Lead status mapping (string enum to Turkish labels)
const leadStatusMap: Record<string, { label: string; color: string }> = {
  'New': { label: 'Yeni', color: 'blue' },
  'Contacted': { label: 'İletişime Geçildi', color: 'cyan' },
  'Working': { label: 'Çalışılıyor', color: 'geekblue' },
  'Qualified': { label: 'Nitelikli', color: 'green' },
  'Unqualified': { label: 'Niteliksiz', color: 'red' },
  'Converted': { label: 'Dönüştürüldü', color: 'purple' },
  'Lost': { label: 'Kayıp', color: 'default' },
};

export function LeadsTable({
  leads,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onConvert,
  onQualify,
  onDisqualify,
  selectedRowKeys = [],
  onSelectionChange,
}: LeadsTableProps) {
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-6">
        {/* Modern thin-stroke icon - Gray */}
        <svg
          className="w-20 h-20 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        Henüz potansiyel müşteri eklenmemiş
      </h3>
      <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
        İlk potansiyel müşterinizi ekleyerek satış hunisini oluşturmaya başlayın
      </p>
      {/* Black button - Matching header button */}
      <button
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        onClick={() => {
          const createButton = document.querySelector('[data-action="create-lead"]') as HTMLElement;
          createButton?.click();
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Yeni Potansiyel Müşteri Ekle
      </button>
    </div>
  );
  const columns: ColumnsType<Lead> = [
    {
      title: 'İsim',
      key: 'name',
      sorter: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr'),
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {/* Monochrome Avatar */}
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600 flex-shrink-0">
            {record.firstName.charAt(0)}{record.lastName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {`${record.firstName} ${record.lastName}`}
            </div>
            {record.companyName && (
              <div className="text-xs text-slate-500 truncate">{record.companyName}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-2 text-slate-700">
            <MailOutlined className="text-slate-400" />
            <span className="truncate">{record.email}</span>
          </div>
          {record.phone && (
            <div className="text-xs flex items-center gap-2 text-slate-500">
              <PhoneOutlined className="text-slate-400" />
              <span>{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      filters: [
        { text: 'Web Sitesi', value: 'Website' },
        { text: 'Referans', value: 'Referral' },
        { text: 'Sosyal Medya', value: 'SocialMedia' },
        { text: 'Etkinlik', value: 'Event' },
        { text: 'Diğer', value: 'Other' },
      ],
      onFilter: (value, record) => record.source === value,
      render: (source: string | null) => {
        if (!source) return <Tag color="default">-</Tag>;
        return (
          <Tag className="rounded-full px-3 py-1 font-medium border-0" color={sourceColors[source] || 'default'}>
            {source}
          </Tag>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Yeni', value: 'New' },
        { text: 'İletişime Geçildi', value: 'Contacted' },
        { text: 'Çalışılıyor', value: 'Working' },
        { text: 'Nitelikli', value: 'Qualified' },
        { text: 'Niteliksiz', value: 'Unqualified' },
        { text: 'Dönüştürüldü', value: 'Converted' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: Lead['status']) => {
        const statusInfo = leadStatusMap[status] || { label: 'Bilinmiyor', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: 'Puan',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => a.score - b.score,
      render: (score: number) => (
        <div className="flex items-center gap-1">
          <StarOutlined className={score >= 70 ? 'text-slate-900' : 'text-slate-300'} />
          <span className={score >= 70 ? 'font-medium text-slate-900' : 'text-slate-500'}>{score}</span>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => formatDate(date),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              ...(onView
                ? [
                    {
                      key: 'view',
                      label: 'Görüntüle',
                      icon: <EyeOutlined />,
                      onClick: () => onView(record),
                    },
                  ]
                : []),
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => onEdit(record),
              },
              ...(record.status !== 'Qualified' && record.status !== 'Converted' && onQualify
                ? [
                    {
                      key: 'qualify',
                      label: 'Nitelikli İşaretle',
                      icon: <CheckCircleOutlined />,
                      onClick: () => onQualify(record),
                    },
                  ]
                : []),
              ...(record.status !== 'Unqualified' && record.status !== 'Converted' && onDisqualify
                ? [
                    {
                      key: 'disqualify',
                      label: 'Niteliksiz İşaretle',
                      icon: <StopOutlined />,
                      onClick: () => onDisqualify(record),
                    },
                  ]
                : []),
              {
                key: 'convert',
                label: 'Müşteriye Dönüştür',
                icon: <SwapOutlined />,
                disabled: record.status === 'Converted',
                onClick: () => onConvert(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => onDelete(record.id, record),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} className="hover:bg-slate-100" />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = onSelectionChange
    ? {
        selectedRowKeys,
        onChange: onSelectionChange,
        preserveSelectedRowKeys: true,
      }
    : undefined;

  return (
    <Table
      columns={columns}
      dataSource={leads}
      rowKey="id"
      rowSelection={rowSelection}
      pagination={{
        current: currentPage,
        pageSize,
        total: totalCount,
        showSizeChanger: true,
        showTotal: (total) => `Toplam ${total} potansiyel müşteri`,
        onChange: onPageChange,
      }}
      loading={loading}
      locale={{
        emptyText: <EmptyState />,
        filterConfirm: 'Tamam',
        filterReset: 'Sıfırla',
        filterTitle: 'Filtrele',
      }}
      className="rounded-lg overflow-hidden crm-enterprise-table"
      rowClassName="hover:bg-slate-50 transition-colors cursor-pointer"
    />
  );
}
