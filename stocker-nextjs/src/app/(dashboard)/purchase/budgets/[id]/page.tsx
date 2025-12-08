'use client';

import React from 'react';
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Spin,
  Dropdown,
  Modal,
  Progress,
  Statistic,
  Table,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import {
  usePurchaseBudget,
  useDeletePurchaseBudget,
  useSubmitPurchaseBudget,
  useApprovePurchaseBudget,
  useActivatePurchaseBudget,
  useFreezePurchaseBudget,
  useClosePurchaseBudget,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseBudgetStatus, BudgetTransactionDto } from '@/lib/api/services/purchase.types';

const { Title, Text, Paragraph } = Typography;

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

const budgetTypeLabels: Record<string, string> = {
  Department: 'Departman',
  Category: 'Kategori',
  Project: 'Proje',
  CostCenter: 'Maliyet Merkezi',
  General: 'Genel',
};

export default function PurchaseBudgetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: budget, isLoading } = usePurchaseBudget(id);
  const deleteMutation = useDeletePurchaseBudget();
  const submitMutation = useSubmitPurchaseBudget();
  const approveMutation = useApprovePurchaseBudget();
  const activateMutation = useActivatePurchaseBudget();
  const freezeMutation = useFreezePurchaseBudget();
  const closeMutation = useClosePurchaseBudget();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="p-6">
        <Text type="danger">Bütçe bulunamadı</Text>
      </div>
    );
  }

  const status = statusConfig[budget.status];
  const usedPercent = budget.totalAmount > 0 ? (budget.usedAmount / budget.totalAmount) * 100 : 0;
  const isOverThreshold = usedPercent >= (budget.alertThreshold || 80);

  const handleDelete = () => {
    Modal.confirm({
      title: 'Bütçe Silinecek',
      icon: <ExclamationCircleOutlined />,
      content: 'Bu bütçeyi silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
        router.push('/purchase/budgets');
      },
    });
  };

  const handleSubmit = () => {
    Modal.confirm({
      title: 'Onaya Gönder',
      content: 'Bu bütçeyi onaya göndermek istediğinize emin misiniz?',
      onOk: () => submitMutation.mutate(id),
    });
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Bütçeyi Onayla',
      content: 'Bu bütçeyi onaylamak istediğinize emin misiniz?',
      onOk: () => approveMutation.mutate({ id }),
    });
  };

  const handleActivate = () => {
    Modal.confirm({
      title: 'Bütçeyi Aktifleştir',
      content: 'Bu bütçeyi aktifleştirmek istediğinize emin misiniz?',
      onOk: () => activateMutation.mutate(id),
    });
  };

  const handleFreeze = () => {
    Modal.confirm({
      title: 'Bütçeyi Dondur',
      content: 'Bu bütçeyi dondurmak istediğinize emin misiniz?',
      okType: 'danger',
      onOk: () => freezeMutation.mutate({ id, reason: 'Manuel dondurma' }),
    });
  };

  const handleClose = () => {
    Modal.confirm({
      title: 'Bütçeyi Kapat',
      content: 'Bu bütçeyi kapatmak istediğinize emin misiniz?',
      okType: 'danger',
      onOk: () => closeMutation.mutate(id),
    });
  };

  const transactionColumns = [
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'Tip',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 120,
      render: (type: string) => {
        const typeConfig: Record<string, { color: string; text: string }> = {
          Allocation: { color: 'blue', text: 'Tahsis' },
          Commitment: { color: 'orange', text: 'Rezervasyon' },
          Expenditure: { color: 'red', text: 'Harcama' },
          Release: { color: 'green', text: 'Serbest Bırakma' },
          Adjustment: { color: 'purple', text: 'Düzeltme' },
        };
        const config = typeConfig[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right' as const,
      render: (amount: number) => (
        <span className={amount > 0 ? 'text-red-600' : 'text-green-600'}>
          {amount > 0 ? '-' : '+'}{Math.abs(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Referans',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} />
          <div>
            <div className="flex items-center gap-3">
              <Title level={3} className="mb-0">{budget.code}</Title>
              <Tag color={status.color} icon={status.icon}>
                {status.text}
              </Tag>
            </div>
            <Text type="secondary">{budget.name}</Text>
          </div>
        </div>

        <Space>
          {budget.status === 'Draft' && (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => router.push(`/purchase/budgets/${id}/edit`)}
              >
                Düzenle
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitMutation.isPending}
              >
                Onaya Gönder
              </Button>
            </>
          )}
          {budget.status === 'PendingApproval' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              loading={approveMutation.isPending}
            >
              Onayla
            </Button>
          )}
          {budget.status === 'Approved' && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleActivate}
              loading={activateMutation.isPending}
            >
              Aktifleştir
            </Button>
          )}
          {budget.status === 'Active' && (
            <Button
              icon={<LockOutlined />}
              onClick={handleFreeze}
              loading={freezeMutation.isPending}
            >
              Dondur
            </Button>
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'close',
                  label: 'Kapat',
                  icon: <CloseCircleOutlined />,
                  disabled: budget.status === 'Closed' || budget.status === 'Draft',
                  onClick: handleClose,
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Sil',
                  icon: <DeleteOutlined />,
                  danger: true,
                  disabled: budget.status !== 'Draft',
                  onClick: handleDelete,
                },
              ],
            }}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Budget Usage */}
          <Card title="Bütçe Kullanımı" bordered={false} className="shadow-sm mb-6">
            <Row gutter={24}>
              <Col span={8}>
                <Statistic
                  title="Toplam Bütçe"
                  value={budget.totalAmount}
                  precision={2}
                  suffix={budget.currency}
                  formatter={(value) => value.toLocaleString('tr-TR')}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Kullanılan"
                  value={budget.usedAmount}
                  precision={2}
                  suffix={budget.currency}
                  valueStyle={{ color: isOverThreshold ? '#cf1322' : '#666' }}
                  formatter={(value) => value.toLocaleString('tr-TR')}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Kalan"
                  value={budget.remainingAmount}
                  precision={2}
                  suffix={budget.currency}
                  valueStyle={{ color: budget.remainingAmount > 0 ? '#3f8600' : '#cf1322' }}
                  formatter={(value) => value.toLocaleString('tr-TR')}
                />
              </Col>
            </Row>
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Kullanım Oranı</span>
                <span className={isOverThreshold ? 'text-red-600 font-medium' : ''}>
                  {usedPercent.toFixed(1)}%
                </span>
              </div>
              <Progress
                percent={Math.min(usedPercent, 100)}
                status={isOverThreshold ? 'exception' : usedPercent > 70 ? 'active' : 'success'}
                strokeWidth={12}
              />
              {isOverThreshold && (
                <div className="mt-2 text-sm text-red-600">
                  <ExclamationCircleOutlined className="mr-1" />
                  Uyarı eşiği ({budget.alertThreshold}%) aşıldı!
                </div>
              )}
            </div>
          </Card>

          {/* Info */}
          <Card title="Bütçe Bilgileri" bordered={false} className="shadow-sm mb-6">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Kod">{budget.code}</Descriptions.Item>
              <Descriptions.Item label="Ad">{budget.name}</Descriptions.Item>
              <Descriptions.Item label="Tip">
                {budgetTypeLabels[budget.budgetType] || budget.budgetType}
              </Descriptions.Item>
              <Descriptions.Item label="Para Birimi">{budget.currency}</Descriptions.Item>
              <Descriptions.Item label="Dönem Başlangıç">
                {new Date(budget.periodStart).toLocaleDateString('tr-TR')}
              </Descriptions.Item>
              <Descriptions.Item label="Dönem Bitiş">
                {new Date(budget.periodEnd).toLocaleDateString('tr-TR')}
              </Descriptions.Item>
              <Descriptions.Item label="Departman">
                {budget.departmentName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">
                {budget.categoryName || '-'}
              </Descriptions.Item>
            </Descriptions>
            {budget.description && (
              <>
                <div className="h-px bg-gray-100 my-4" />
                <Paragraph className="text-gray-600 mb-0">{budget.description}</Paragraph>
              </>
            )}
          </Card>

          {/* Transactions */}
          <Card title="Hareketler" bordered={false} className="shadow-sm">
            <Table
              columns={transactionColumns}
              dataSource={budget.transactions || []}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
              locale={{ emptyText: 'Henüz işlem yok' }}
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Status Card */}
          <Card bordered={false} className="shadow-sm mb-6">
            <div
              style={{
                background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <WalletOutlined style={{ fontSize: '48px', color: 'rgba(255,255,255,0.9)' }} />
              <div className="text-white/90 font-medium mt-2">{budget.code}</div>
              <Tag color={status.color} className="mt-2">{status.text}</Tag>
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Uyarı Eşiği">%{budget.alertThreshold}</Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {budget.createdAt ? new Date(budget.createdAt).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {budget.updatedAt ? new Date(budget.updatedAt).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Notes */}
          {budget.notes && (
            <Card title="Notlar" bordered={false} className="shadow-sm">
              <Paragraph className="text-gray-600 mb-0">{budget.notes}</Paragraph>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
