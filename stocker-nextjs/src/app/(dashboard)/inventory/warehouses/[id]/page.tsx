'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Descriptions,
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  Tabs,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  HomeOutlined,
  EditOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  AppstoreOutlined,
  DollarOutlined,
  StarFilled,
} from '@ant-design/icons';
import {
  useWarehouse,
  useLocations,
} from '@/lib/api/hooks/useInventory';
import type { LocationDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function WarehouseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: warehouse, isLoading, error } = useWarehouse(id);
  const { data: locations = [] } = useLocations(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <Alert
        message="Hata"
        description="Depo bilgileri yüklenemedi"
        type="error"
        showIcon
        action={<Button onClick={() => router.back()}>Geri Dön</Button>}
      />
    );
  }

  const locationColumns: ColumnsType<LocationDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <Text strong>{code}</Text>,
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Konum',
      key: 'position',
      width: 200,
      render: (_, record) => (
        <Text type="secondary">
          {[record.aisle, record.shelf, record.bin].filter(Boolean).join(' / ') || '-'}
        </Text>
      ),
    },
    {
      title: 'Kapasite',
      key: 'capacity',
      width: 180,
      render: (_, record) => {
        if (!record.capacity) return <Text type="secondary">-</Text>;
        const usedPercent = Math.round((record.usedCapacity / record.capacity) * 100);
        return (
          <div style={{ width: 120 }}>
            <Progress
              percent={usedPercent}
              size="small"
              status={usedPercent > 90 ? 'exception' : usedPercent > 70 ? 'normal' : 'success'}
              format={() => `${record.usedCapacity}/${record.capacity}`}
            />
          </div>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      align: 'center',
      render: (active) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => router.push(`/inventory/locations/${record.id}/edit`)}
        />
      ),
    },
  ];

  const address = [
    warehouse.street,
    warehouse.city,
    warehouse.state,
    warehouse.country,
    warehouse.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const activeLocations = locations.filter((l) => l.isActive).length;
  const totalCapacity = locations.reduce((sum, l) => sum + (l.capacity || 0), 0);
  const usedCapacitySum = locations.reduce((sum, l) => sum + (l.usedCapacity || 0), 0);
  const capacityPercent = totalCapacity > 0 ? Math.round((usedCapacitySum / totalCapacity) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto">
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
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <HomeOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{warehouse.name}</h1>
                  {warehouse.isDefault && (
                    <Tag color="gold" icon={<StarFilled />}>Varsayılan</Tag>
                  )}
                  <Tag color={warehouse.isActive ? 'success' : 'default'}>
                    {warehouse.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">Kod: {warehouse.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/warehouses/${id}/edit`)}
            >
              Düzenle
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push(`/inventory/locations/new?warehouseId=${id}`)}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Lokasyon Ekle
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Lokasyon"
              value={warehouse.locationCount}
              prefix={<EnvironmentOutlined className="text-blue-500" />}
              suffix={
                <Text type="secondary" className="text-sm ml-2">
                  ({activeLocations} aktif)
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Ürün Çeşidi"
              value={warehouse.productCount}
              prefix={<AppstoreOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Stok Değeri"
              value={warehouse.totalStockValue}
              prefix={<DollarOutlined className="text-green-500" />}
              precision={2}
              suffix="₺"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div className="flex justify-between items-center">
              <Statistic title="Kapasite Kullanımı" value={capacityPercent} suffix="%" />
            </div>
            <Progress
              percent={capacityPercent}
              showInfo={false}
              size="small"
              status={capacityPercent > 90 ? 'exception' : capacityPercent > 70 ? 'normal' : 'success'}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left Column - Info */}
        <Col xs={24} lg={8}>
          <Card title="Depo Bilgileri" className="mb-6">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Kod">{warehouse.code}</Descriptions.Item>
              <Descriptions.Item label="Ad">{warehouse.name}</Descriptions.Item>
              {warehouse.description && (
                <Descriptions.Item label="Açıklama">{warehouse.description}</Descriptions.Item>
              )}
              {warehouse.manager && (
                <Descriptions.Item label="Yönetici">
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-gray-400" />
                    {warehouse.manager}
                  </div>
                </Descriptions.Item>
              )}
              {warehouse.phone && (
                <Descriptions.Item label="Telefon">
                  <div className="flex items-center gap-2">
                    <PhoneOutlined className="text-gray-400" />
                    {warehouse.phone}
                  </div>
                </Descriptions.Item>
              )}
              {warehouse.totalArea > 0 && (
                <Descriptions.Item label="Alan">
                  {warehouse.totalArea.toLocaleString()} m²
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Oluşturulma">
                {dayjs(warehouse.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {address && (
            <Card title="Adres Bilgileri">
              <div className="flex items-start gap-3">
                <EnvironmentOutlined className="text-gray-400 mt-1" />
                <div>
                  {warehouse.street && <div>{warehouse.street}</div>}
                  <div>
                    {[warehouse.city, warehouse.state].filter(Boolean).join(', ')}
                  </div>
                  <div>
                    {[warehouse.postalCode, warehouse.country].filter(Boolean).join(' ')}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </Col>

        {/* Right Column - Locations */}
        <Col xs={24} lg={16}>
          <Card
            title={`Lokasyonlar (${locations.length})`}
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => router.push(`/inventory/locations/new?warehouseId=${id}`)}
              >
                Yeni Lokasyon
              </Button>
            }
          >
            {locations.length > 0 ? (
              <Table
                columns={locationColumns}
                dataSource={locations}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Toplam ${total} lokasyon`,
                }}
                size="small"
              />
            ) : (
              <Empty
                description="Bu depoda henüz lokasyon tanımlanmamış"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push(`/inventory/locations/new?warehouseId=${id}`)}
                >
                  Lokasyon Ekle
                </Button>
              </Empty>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
