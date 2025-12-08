'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  Progress,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import { usePurchaseBudgets, useDeletePurchaseBudget } from '@/lib/api/hooks/usePurchase';
import type { PurchaseBudgetListDto, PurchaseBudgetStatus } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;

const statusConfig: Record<PurchaseBudgetStatus, { color: string; text: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', text: 'Taslak', icon: <EditOutlined /> },
  PendingApproval: { color: 'orange', text: 'Onay Bekliyor', icon: <PauseCircleOutlined /> },
  Approved: { color: 'blue', text: 'Onaylandı', icon: <CheckCircleOutlined /> },
  Active: { color: 'green', text: 'Aktif', icon: <CheckCircleOutlined /> },
  Frozen: { color: 'cyan', text: 'Donduruldu', icon: <LockOutlined /> },
  Exhausted: { color: 'red', text: 'Tükendi', icon: <ExclamationCircleOutlined /> },
  Closed: { color: 'gray', text: 'Kapatıldı', icon: <CloseCircleOutlined /> },
  Rejected: { color: 'volcano', text: 'Reddedildi', icon: <CloseCircleOutlined /> },
  Cancelled: { color: 'magenta', text: 'İptal Edildi', icon: <CloseCircleOutlined /> },
};

export default function PurchaseBudgetsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseBudgetStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = usePurchaseBudgets({
    page: currentPage,
    pageSize,
    search: searchText || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeletePurchaseBudget();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Bütçe Silinecek',
      icon: <ExclamationCircleOutlined />,
      content: 'Bu bütçeyi silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const columns: ColumnsType<PurchaseBudgetListDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => router.push(`/purchase/budgets/${record.id}`)}
          className="p-0 font-medium"
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Bütçe Adı',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: PurchaseBudgetStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Toplam Bütçe',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (amount, record) => (
        <span className="font-medium">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Kullanılan',
      key: 'usage',
      width: 200,
      render: (_, record) => {
        const usedPercent = record.totalAmount > 0
          ? (record.usedAmount / record.totalAmount) * 100
          : 0;
        const statusColor = usedPercent > 90 ? 'exception' : usedPercent > 70 ? 'active' : 'success';
        return (
          <div>
            <Progress
              percent={Math.min(usedPercent, 100)}
              size="small"
              status={statusColor}
              format={() => `${usedPercent.toFixed(0)}%`}
            />
            <div className="text-xs text-gray-500">
              {record.usedAmount.toLocaleString('tr-TR')} / {record.totalAmount.toLocaleString('tr-TR')}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Kalan',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 130,
      align: 'right',
      render: (amount, record) => (
        <span className={amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Dönem',
      key: 'period',
      width: 160,
      render: (_, record) => (
        <div className="text-sm">
          <div>{new Date(record.periodStart).toLocaleDateString('tr-TR')}</div>
          <div className="text-gray-400">{new Date(record.periodEnd).toLocaleDateString('tr-TR')}</div>
        </div>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Görüntüle',
                icon: <EyeOutlined />,
                onClick: () => router.push(`/purchase/budgets/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                disabled: record.status !== 'Draft',
                onClick: () => router.push(`/purchase/budgets/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                disabled: record.status !== 'Draft',
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Calculate total stats
  const totalBudget = data?.items?.reduce((sum, item) => sum + item.totalAmount, 0) || 0;
  const totalUsed = data?.items?.reduce((sum, item) => sum + item.usedAmount, 0) || 0;
  const totalRemaining = data?.items?.reduce((sum, item) => sum + item.remainingAmount, 0) || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="mb-1">Satın Alma Bütçeleri</Title>
          <Text type="secondary">Departman ve kategori bazlı bütçeleri yönetin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => router.push('/purchase/budgets/new')}
        >
          Yeni Bütçe
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Toplam Bütçe"
              value={totalBudget}
              precision={2}
              prefix={<WalletOutlined className="text-blue-500" />}
              suffix="₺"
              formatter={(value) => value.toLocaleString('tr-TR')}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Kullanılan"
              value={totalUsed}
              precision={2}
              prefix={<ExclamationCircleOutlined className="text-orange-500" />}
              suffix="₺"
              formatter={(value) => value.toLocaleString('tr-TR')}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Kalan"
              value={totalRemaining}
              precision={2}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              suffix="₺"
              formatter={(value) => value.toLocaleString('tr-TR')}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Aktif Bütçe"
              value={data?.items?.filter(i => i.status === 'Active').length || 0}
              prefix={<WalletOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card bordered={false} className="shadow-sm mb-6">
        <Space wrap size="middle">
          <Input
            placeholder="Kod veya ad ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Durum"
            style={{ width: 160 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.text,
            }))}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} className="shadow-sm">
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
