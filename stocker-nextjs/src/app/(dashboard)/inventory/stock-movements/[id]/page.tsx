'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Descriptions,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Divider,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  RetweetOutlined,
  RollbackOutlined,
  ArrowRightOutlined,
  ToolOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  InboxOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  PrinterOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useStockMovement } from '@/lib/api/hooks/useInventory';
import { StockMovementType } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Text } = Typography;

// Movement type labels and colors
const movementTypeConfig: Record<
  StockMovementType,
  { label: string; color: string; icon: React.ReactNode; direction: 'in' | 'out' | 'neutral' }
> = {
  [StockMovementType.Purchase]: {
    label: 'Satın Alma',
    color: 'green',
    icon: <ShoppingCartOutlined />,
    direction: 'in',
  },
  [StockMovementType.Sales]: {
    label: 'Satış',
    color: 'blue',
    icon: <ShoppingOutlined />,
    direction: 'out',
  },
  [StockMovementType.PurchaseReturn]: {
    label: 'Satın Alma İade',
    color: 'orange',
    icon: <RollbackOutlined />,
    direction: 'out',
  },
  [StockMovementType.SalesReturn]: {
    label: 'Satış İade',
    color: 'cyan',
    icon: <RetweetOutlined />,
    direction: 'in',
  },
  [StockMovementType.Transfer]: {
    label: 'Transfer',
    color: 'purple',
    icon: <SwapOutlined />,
    direction: 'neutral',
  },
  [StockMovementType.Production]: {
    label: 'Üretim',
    color: 'geekblue',
    icon: <ToolOutlined />,
    direction: 'in',
  },
  [StockMovementType.Consumption]: {
    label: 'Tüketim',
    color: 'volcano',
    icon: <MinusCircleOutlined />,
    direction: 'out',
  },
  [StockMovementType.AdjustmentIncrease]: {
    label: 'Düzeltme (+)',
    color: 'lime',
    icon: <PlusCircleOutlined />,
    direction: 'in',
  },
  [StockMovementType.AdjustmentDecrease]: {
    label: 'Düzeltme (-)',
    color: 'red',
    icon: <MinusCircleOutlined />,
    direction: 'out',
  },
  [StockMovementType.Opening]: {
    label: 'Açılış',
    color: 'gold',
    icon: <InboxOutlined />,
    direction: 'in',
  },
  [StockMovementType.Counting]: {
    label: 'Sayım',
    color: 'magenta',
    icon: <SyncOutlined />,
    direction: 'neutral',
  },
  [StockMovementType.Damage]: {
    label: 'Hasar',
    color: 'red',
    icon: <WarningOutlined />,
    direction: 'out',
  },
  [StockMovementType.Loss]: {
    label: 'Kayıp',
    color: 'red',
    icon: <CloseCircleOutlined />,
    direction: 'out',
  },
  [StockMovementType.Found]: {
    label: 'Bulunan',
    color: 'green',
    icon: <SearchOutlined />,
    direction: 'in',
  },
};

export default function StockMovementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const movementId = Number(params.id);

  const { data: movement, isLoading } = useStockMovement(movementId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Stok hareketi bulunamadı" />
      </div>
    );
  }

  const config = movementTypeConfig[movement.movementType] || {
    label: movement.movementType,
    color: 'default',
    icon: <QuestionCircleOutlined />,
    direction: 'neutral',
  };

  const getDirectionIcon = () => {
    switch (config.direction) {
      case 'in':
        return <PlusCircleOutlined style={{ color: '#52c41a' }} />;
      case 'out':
        return <MinusCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <SwapOutlined style={{ color: '#722ed1' }} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                <SwapOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{movement.documentNumber}</h1>
                  <Tag color={config.color} icon={config.icon}>
                    {config.label}
                  </Tag>
                  {movement.isReversed && (
                    <Tag color="error" icon={<RollbackOutlined />}>
                      İptal Edildi
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-gray-500 m-0">
                  {dayjs(movement.movementDate).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button icon={<PrinterOutlined />}>Yazdır</Button>
          </Space>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Miktar"
              value={movement.quantity}
              prefix={getDirectionIcon()}
              valueStyle={{
                color: config.direction === 'in' ? '#52c41a' : config.direction === 'out' ? '#ff4d4f' : '#722ed1',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Birim Maliyet"
              value={movement.unitCost}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Toplam Maliyet"
              value={movement.totalCost}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="İşlem Tarihi"
              value={dayjs(movement.movementDate).format('DD/MM/YYYY')}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Content */}
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* Movement Details */}
          <Card title="Hareket Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Belge Numarası">{movement.documentNumber}</Descriptions.Item>
              <Descriptions.Item label="Hareket Türü">
                <Tag color={config.color} icon={config.icon}>
                  {config.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Hareket Tarihi">
                {dayjs(movement.movementDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                {movement.isReversed ? (
                  <Tag color="error" icon={<RollbackOutlined />}>
                    İptal Edildi
                  </Tag>
                ) : (
                  <Tag color="success">Aktif</Tag>
                )}
              </Descriptions.Item>
              {movement.reversedMovementId && (
                <Descriptions.Item label="İptal Referansı" span={2}>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => router.push(`/inventory/stock-movements/${movement.reversedMovementId}`)}
                  >
                    #{movement.reversedMovementId}
                  </Button>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Product Info */}
          <Card title="Ürün Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Ürün Kodu">{movement.productCode}</Descriptions.Item>
              <Descriptions.Item label="Ürün Adı">
                <Button
                  type="link"
                  size="small"
                  className="p-0"
                  onClick={() => router.push(`/inventory/products/${movement.productId}`)}
                >
                  {movement.productName}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="Miktar">
                <span
                  style={{
                    color:
                      config.direction === 'in' ? '#52c41a' : config.direction === 'out' ? '#ff4d4f' : '#722ed1',
                    fontWeight: 600,
                  }}
                >
                  {config.direction === 'in' ? '+' : config.direction === 'out' ? '-' : ''}
                  {movement.quantity}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Birim Maliyet">
                {movement.unitCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Maliyet" span={2}>
                <Text strong>
                  {movement.totalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </Text>
              </Descriptions.Item>
              {movement.serialNumber && (
                <Descriptions.Item label="Seri Numarası">{movement.serialNumber}</Descriptions.Item>
              )}
              {movement.lotNumber && (
                <Descriptions.Item label="Lot Numarası">{movement.lotNumber}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Location Info */}
          <Card title="Lokasyon Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Depo" span={2}>
                <div className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-blue-500" />
                  <Button
                    type="link"
                    size="small"
                    className="p-0"
                    onClick={() => router.push(`/inventory/warehouses/${movement.warehouseId}`)}
                  >
                    {movement.warehouseName}
                  </Button>
                </div>
              </Descriptions.Item>
              {movement.fromLocationName && (
                <Descriptions.Item label="Kaynak Lokasyon">{movement.fromLocationName}</Descriptions.Item>
              )}
              {movement.toLocationName && (
                <Descriptions.Item label="Hedef Lokasyon">{movement.toLocationName}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Reference Document */}
          {(movement.referenceDocumentType || movement.referenceDocumentNumber) && (
            <Card title="Referans Belge">
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                {movement.referenceDocumentType && (
                  <Descriptions.Item label="Belge Türü">{movement.referenceDocumentType}</Descriptions.Item>
                )}
                {movement.referenceDocumentNumber && (
                  <Descriptions.Item label="Belge Numarası">{movement.referenceDocumentNumber}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* Description */}
          {movement.description && (
            <Card title="Açıklama" className="mb-6">
              <Text>{movement.description}</Text>
            </Card>
          )}

          {/* Timeline Info */}
          <Card title="Kayıt Bilgileri">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Oluşturulma</Text>
                <Text>{dayjs(movement.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <Text type="secondary">Kullanıcı ID</Text>
                <Text>{movement.userId}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
