'use client';

/**
 * Customer Contracts Table Component
 * Enterprise-grade design following Linear/Stripe/Vercel principles
 */

import React from 'react';
import { Table, Dropdown, Button } from 'antd';
import { MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import type { CustomerContractListDto, ContractStatus, ContractType } from '@/lib/api/services/sales.service';
import { Badge } from '@/components/ui/enterprise-page';
import dayjs from 'dayjs';

interface ContractsTableProps {
  contracts: CustomerContractListDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onActivate?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onTerminate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig: Record<ContractStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  Draft: { label: 'Taslak', variant: 'default' },
  Active: { label: 'Aktif', variant: 'success' },
  Suspended: { label: 'Askıda', variant: 'warning' },
  Terminated: { label: 'Feshedildi', variant: 'error' },
  Expired: { label: 'Süresi Doldu', variant: 'default' },
  PendingApproval: { label: 'Onay Bekliyor', variant: 'info' },
};

const typeLabels: Record<ContractType, string> = {
  Standard: 'Standart',
  Premium: 'Premium',
  Enterprise: 'Kurumsal',
  Custom: 'Özel',
  Framework: 'Çerçeve',
  ServiceLevel: 'SLA',
};

export function ContractsTable({
  contracts,
  loading = false,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onActivate,
  onSuspend,
  onTerminate,
  onDelete,
}: ContractsTableProps) {
  const router = useRouter();

  const handleView = (id: string) => {
    router.push(`/sales/contracts/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/sales/contracts/${id}/edit`);
  };

  const getActionMenu = (record: CustomerContractListDto): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => handleView(record.id),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Düzenle',
        onClick: () => handleEdit(record.id),
      },
    ];

    // Status actions
    if (record.status === 'Draft' && onActivate) {
      items.push({
        key: 'activate',
        icon: <CheckCircleOutlined />,
        label: 'Aktifleştir',
        onClick: () => onActivate(record.id),
      });
    }

    if (record.status === 'Active' && onSuspend) {
      items.push({
        key: 'suspend',
        icon: <PauseCircleOutlined />,
        label: 'Askıya Al',
        onClick: () => onSuspend(record.id),
      });
    }

    if ((record.status === 'Active' || record.status === 'Suspended') && onTerminate) {
      items.push({
        key: 'terminate',
        icon: <StopOutlined />,
        label: 'Feshet',
        onClick: () => onTerminate(record.id),
      });
    }

    if (record.status === 'Draft' && onDelete) {
      items.push(
        { type: 'divider' },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Sil',
          danger: true,
          onClick: () => onDelete(record.id),
        }
      );
    }

    return items;
  };

  const columns: ColumnsType<CustomerContractListDto> = [
    {
      title: 'Sözleşme No',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (text: string, record) => (
        <button
          onClick={() => handleView(record.id)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => (
        <span className="text-slate-900 font-medium">{text}</span>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'contractType',
      key: 'contractType',
      render: (type: ContractType) => (
        <span className="text-slate-600">{typeLabels[type] || type}</span>
      ),
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => (
        <span className="text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => (
        <span className="text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Kredi Limiti',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      render: (limit: { amount: number; currency: string } | null) => (
        <span className="text-slate-600">
          {limit
            ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: limit.currency }).format(limit.amount)
            : '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: ContractStatus) => {
        const config = statusConfig[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} className="text-slate-400 hover:text-slate-600" />
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={contracts}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalCount,
        showSizeChanger: true,
        showTotal: (total) => `Toplam ${total} sözleşme`,
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      className="enterprise-table"
    />
  );
}
