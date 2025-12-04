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
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useLocation, useWarehouse } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function LocationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = Number(params.id);

  const { data: location, isLoading } = useLocation(locationId);
  const { data: warehouse } = useWarehouse(location?.warehouseId || 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Lokasyon bulunamadı" />
      </div>
    );
  }

  const capacityPercent = location.capacity
    ? Math.round((location.usedCapacity / location.capacity) * 100)
    : 0;

  const positionPath = [location.aisle, location.shelf, location.bin].filter(Boolean).join(' / ');

  return (
    <div className="max-w-4xl mx-auto">
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
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                <EnvironmentOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{location.name}</h1>
                  <Tag
                    icon={location.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={location.isActive ? 'success' : 'default'}
                  >
                    {location.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">Kod: {location.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/locations/${locationId}/edit`)}
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="Kapasite"
              value={location.capacity || 0}
              suffix="birim"
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="Kullanılan"
              value={location.usedCapacity || 0}
              suffix="birim"
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="Kullanım Oranı"
              value={capacityPercent}
              suffix="%"
              valueStyle={{
                color: capacityPercent > 90 ? '#ef4444' : capacityPercent > 70 ? '#f59e0b' : '#10b981',
              }}
            />
            <Progress
              percent={capacityPercent}
              showInfo={false}
              size="small"
              status={capacityPercent > 90 ? 'exception' : capacityPercent > 70 ? 'normal' : 'success'}
            />
          </Card>
        </Col>
      </Row>

      {/* Content */}
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Lokasyon Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Lokasyon Kodu">{location.code}</Descriptions.Item>
              <Descriptions.Item label="Lokasyon Adı">{location.name}</Descriptions.Item>
              <Descriptions.Item label="Depo">
                {warehouse ? (
                  <Button
                    type="link"
                    size="small"
                    className="p-0"
                    onClick={() => router.push(`/inventory/warehouses/${warehouse.id}`)}
                  >
                    <HomeOutlined className="mr-1" />
                    {warehouse.name}
                  </Button>
                ) : (
                  <Text type="secondary">-</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={location.isActive ? 'success' : 'default'}>
                  {location.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
              {positionPath && (
                <Descriptions.Item label="Konum" span={2}>
                  <Tag color="blue">{positionPath}</Tag>
                </Descriptions.Item>
              )}
              {location.description && (
                <Descriptions.Item label="Açıklama" span={2}>
                  {location.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Position Details */}
          <Card title="Konum Detayları">
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Text type="secondary" className="block text-xs mb-1">
                    Koridor
                  </Text>
                  <Text strong className="text-lg">
                    {location.aisle || '-'}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Text type="secondary" className="block text-xs mb-1">
                    Raf
                  </Text>
                  <Text strong className="text-lg">
                    {location.shelf || '-'}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Text type="secondary" className="block text-xs mb-1">
                    Bölme
                  </Text>
                  <Text strong className="text-lg">
                    {location.bin || '-'}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Capacity */}
          <Card title="Kapasite Durumu" className="mb-6">
            <div className="text-center mb-4">
              <Progress
                type="circle"
                percent={capacityPercent}
                status={capacityPercent > 90 ? 'exception' : capacityPercent > 70 ? 'normal' : 'success'}
                format={(percent) => `${percent}%`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text type="secondary">Toplam Kapasite</Text>
                <Text strong>{location.capacity || 0} birim</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Kullanılan</Text>
                <Text strong>{location.usedCapacity || 0} birim</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Boş</Text>
                <Text strong className="text-green-600">
                  {(location.capacity || 0) - (location.usedCapacity || 0)} birim
                </Text>
              </div>
            </div>
          </Card>

          {/* Timestamps */}
          <Card title="Kayıt Bilgileri">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Oluşturulma</Text>
                <Text>{dayjs(location.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </div>
              {location.updatedAt && (
                <div className="flex justify-between">
                  <Text type="secondary">Güncelleme</Text>
                  <Text>{dayjs(location.updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
