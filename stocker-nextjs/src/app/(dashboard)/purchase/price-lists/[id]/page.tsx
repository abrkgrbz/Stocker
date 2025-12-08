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
  Table,
  Space,
  Spin,
  Dropdown,
  Modal,
  Switch,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  DollarOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import {
  usePriceList,
  useDeletePriceList,
  useActivatePriceList,
  useDeactivatePriceList,
} from '@/lib/api/hooks/usePurchase';
import type { PriceListStatus, PriceListItemDto } from '@/lib/api/services/purchase.types';

const { Title, Text, Paragraph } = Typography;

const statusConfig: Record<PriceListStatus, { color: string; text: string }> = {
  Draft: { color: 'default', text: 'Taslak' },
  PendingApproval: { color: 'orange', text: 'Onay Bekliyor' },
  Approved: { color: 'blue', text: 'Onaylandı' },
  Active: { color: 'green', text: 'Aktif' },
  Inactive: { color: 'gray', text: 'Pasif' },
  Expired: { color: 'red', text: 'Süresi Doldu' },
  Superseded: { color: 'purple', text: 'Yenilendi' },
  Rejected: { color: 'volcano', text: 'Reddedildi' },
};

export default function PriceListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: priceList, isLoading } = usePriceList(id);
  const deleteMutation = useDeletePriceList();
  const activateMutation = useActivatePriceList();
  const deactivateMutation = useDeactivatePriceList();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!priceList) {
    return (
      <div className="p-6">
        <Text type="danger">Fiyat listesi bulunamadı</Text>
      </div>
    );
  }

  const status = statusConfig[priceList.status as PriceListStatus] || statusConfig.Draft;

  const handleDelete = () => {
    Modal.confirm({
      title: 'Fiyat Listesi Silinecek',
      icon: <ExclamationCircleOutlined />,
      content: 'Bu fiyat listesini silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
        router.push('/purchase/price-lists');
      },
    });
  };

  const handleToggleStatus = () => {
    if (priceList.status === 'Active') {
      deactivateMutation.mutate(id);
    } else {
      activateMutation.mutate(id);
    }
  };

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: PriceListItemDto) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-400">{record.productSku}</div>
        </div>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 140,
      align: 'right' as const,
      render: (price: number) => (
        <span className="font-medium">
          {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {priceList.currency}
        </span>
      ),
    },
    {
      title: 'Min. Miktar',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'İndirim',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      align: 'center' as const,
      render: (discount: number | null) =>
        discount ? <Tag color="green">%{discount}</Tag> : '-',
    },
    {
      title: 'Net Fiyat',
      key: 'netPrice',
      width: 140,
      align: 'right' as const,
      render: (_: any, record: PriceListItemDto) => {
        const discount = record.discountPercentage || 0;
        const netPrice = record.basePrice * (1 - discount / 100);
        return (
          <span className="font-semibold text-green-600">
            {netPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {priceList.currency}
          </span>
        );
      },
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
              <Title level={3} className="mb-0">{priceList.code}</Title>
              <Tag color={status.color}>{status.text}</Tag>
              {priceList.isDefault && <Tag color="blue">Varsayılan</Tag>}
            </div>
            <Text type="secondary">{priceList.name}</Text>
          </div>
        </div>

        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/purchase/price-lists/${id}/edit`)}
          >
            Düzenle
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'delete',
                  label: 'Sil',
                  icon: <DeleteOutlined />,
                  danger: true,
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
          {/* Info Card */}
          <Card title="Liste Bilgileri" bordered={false} className="shadow-sm mb-6">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Kod">{priceList.code}</Descriptions.Item>
              <Descriptions.Item label="Ad">{priceList.name}</Descriptions.Item>
              <Descriptions.Item label="Tedarikçi">
                {priceList.supplierName ? (
                  <Space>
                    <ShopOutlined />
                    {priceList.supplierName}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Para Birimi">{priceList.currency}</Descriptions.Item>
              <Descriptions.Item label="Başlangıç">
                {priceList.effectiveFrom
                  ? new Date(priceList.effectiveFrom).toLocaleDateString('tr-TR')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Bitiş">
                {priceList.effectiveTo
                  ? new Date(priceList.effectiveTo).toLocaleDateString('tr-TR')
                  : 'Süresiz'}
              </Descriptions.Item>
            </Descriptions>
            {priceList.description && (
              <>
                <div className="h-px bg-gray-100 my-4" />
                <Paragraph className="text-gray-600 mb-0">{priceList.description}</Paragraph>
              </>
            )}
          </Card>

          {/* Items */}
          <Card title="Fiyat Kalemleri" bordered={false} className="shadow-sm">
            <Table
              columns={itemColumns}
              dataSource={priceList.items || []}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Status Card */}
          <Card bordered={false} className="shadow-sm mb-6">
            <div
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <DollarOutlined style={{ fontSize: '48px', color: 'rgba(255,255,255,0.9)' }} />
              <div className="text-white/90 font-medium mt-2">{priceList.code}</div>
              <Tag color={status.color} className="mt-2">{status.text}</Tag>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
              <div>
                <Text strong>Durum</Text>
                <div className="text-xs text-gray-400">
                  {priceList.status === 'Active' ? 'Aktif' : 'Pasif'}
                </div>
              </div>
              <Switch
                checked={priceList.status === 'Active'}
                onChange={handleToggleStatus}
                loading={activateMutation.isPending || deactivateMutation.isPending}
                disabled={priceList.status === 'Expired'}
              />
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Ürün Sayısı">
                <Tag color="blue">{priceList.items?.length || 0} ürün</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {priceList.createdAt ? new Date(priceList.createdAt).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {priceList.updatedAt ? new Date(priceList.updatedAt).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Notes */}
          {priceList.notes && (
            <Card title="Notlar" bordered={false} className="shadow-sm">
              <Paragraph className="text-gray-600 mb-0">{priceList.notes}</Paragraph>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
