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
  Alert,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  TagOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useBrand } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function BrandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = Number(params.id);

  const { data: brand, isLoading, error } = useBrand(brandId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Marka bulunamadı" />
      </div>
    );
  }

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
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)' }}
              >
                <TagOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{brand.name}</h1>
                  <Tag
                    icon={brand.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={brand.isActive ? 'success' : 'default'}
                  >
                    {brand.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">Kod: {brand.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/brands/${brandId}/edit`)}
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Marka Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Marka Kodu">{brand.code}</Descriptions.Item>
              <Descriptions.Item label="Marka Adı">{brand.name}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={brand.isActive ? 'success' : 'default'}>
                  {brand.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(brand.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              {brand.description && (
                <Descriptions.Item label="Açıklama" span={2}>
                  {brand.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Logo */}
          {brand.logoUrl && (
            <Card title="Logo" className="mb-6">
              <div className="flex justify-center">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-w-full max-h-48 object-contain"
                />
              </div>
            </Card>
          )}

          {/* Website */}
          {brand.website && (
            <Card title="Web Sitesi" className="mb-6">
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
              >
                <GlobalOutlined />
                {brand.website}
              </a>
            </Card>
          )}

          {/* Timestamps */}
          <Card title="Kayıt Bilgileri">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Oluşturulma</Text>
                <Text>{dayjs(brand.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </div>
              {brand.updatedAt && (
                <div className="flex justify-between">
                  <Text type="secondary">Güncelleme</Text>
                  <Text>{dayjs(brand.updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
