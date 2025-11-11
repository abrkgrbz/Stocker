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
        <svg
          className="w-24 h-24 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Henüz potansiyel müşteri eklenmemiş
      </h3>
      <p className="text-sm text-gray-500 text-center mb-6 max-w-sm">
        İlk potansiyel müşterinizi ekleyerek satış hunisini oluşturmaya başlayın
      </p>
      <Button
        type="primary"
        size="large"
        icon={<UserOutlined />}
        className="bg-purple-600 hover:bg-purple-700"
        onClick={() => {
          // This will be handled by the parent component through context
          const createButton = document.querySelector('[data-action="create-lead"]') as HTMLElement;
          createButton?.click();
        }}
      >
        + Yeni Potansiyel Müşteri Ekle
      </Button>
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
          <Avatar
            size={40}
            className="bg-gradient-to-br from-purple-500 to-purple-600 flex-shrink-0"
            icon={<UserOutlined />}
          >
            {record.firstName.charAt(0)}{record.lastName.charAt(0)}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {`${record.firstName} ${record.lastName}`}
            </div>
            {record.companyName && (
              <div className="text-xs text-gray-500 truncate">{record.companyName}</div>
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
          <div className="text-sm flex items-center gap-2 text-gray-700">
            <MailOutlined className="text-blue-500" />
            <span className="truncate">{record.email}</span>
          </div>
          {record.phone && (
            <div className="text-xs flex items-center gap-2 text-gray-500">
              <PhoneOutlined className="text-green-500" />
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
          <StarOutlined className={score >= 70 ? 'text-yellow-500' : 'text-gray-400'} />
          <span className={score >= 70 ? 'font-medium' : ''}>{score}</span>
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
          <Button type="text" icon={<MoreOutlined />} className="hover:bg-gray-100" />
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
      className="rounded-lg overflow-hidden"
      rowClassName="hover:bg-purple-50 transition-colors cursor-pointer"
    />
  );
}
