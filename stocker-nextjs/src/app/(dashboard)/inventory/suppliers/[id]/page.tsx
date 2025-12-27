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
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useSupplier } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = Number(params.id);

  const { data: supplier, isLoading } = useSupplier(supplierId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Tedarikçi bulunamadı" />
      </div>
    );
  }

  const address = [supplier.street, supplier.city, supplier.state, supplier.country, supplier.postalCode]
    .filter(Boolean)
    .join(', ');

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
            <Button type="text" icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <BuildingStorefrontIcon className="w-4 h-4" style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{supplier.name}</h1>
                  {supplier.isPreferred && (
                    <Tag color="gold" icon={<StarIcon className="w-4 h-4" />}>
                      Tercih Edilen
                    </Tag>
                  )}
                  <Tag
                    icon={supplier.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                    color={supplier.isActive ? 'success' : 'default'}
                  >
                    {supplier.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">Kod: {supplier.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/suppliers/${supplierId}/edit`)}
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
              title="Ödeme Vadesi"
              value={supplier.paymentTermDays || 0}
              suffix="gün"
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="Kredi Limiti"
              value={supplier.creditLimit || 0}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="Ürün Sayısı"
              value={supplier.productCount || 0}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Content */}
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Tedarikçi Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Tedarikçi Kodu">{supplier.code}</Descriptions.Item>
              <Descriptions.Item label="Tedarikçi Adı">{supplier.name}</Descriptions.Item>
              <Descriptions.Item label="Vergi Dairesi">
                {supplier.taxOffice || <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Vergi No">
                {supplier.taxNumber || <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={supplier.isActive ? 'success' : 'default'}>
                  {supplier.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tercih Durumu">
                {supplier.isPreferred ? (
                  <Tag color="gold" icon={<StarIcon className="w-4 h-4" />}>
                    Tercih Edilen
                  </Tag>
                ) : (
                  <Text type="secondary">-</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Contact Info */}
          <Card title="İletişim Bilgileri" className="mb-6">
            <Row gutter={[24, 16]}>
              {supplier.contactPerson && (
                <Col xs={24} md={12}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BuildingStorefrontIcon className="w-4 h-4" className="text-blue-500" />
                    </div>
                    <div>
                      <Text type="secondary" className="block text-xs">
                        İletişim Kişisi
                      </Text>
                      <Text strong>{supplier.contactPerson}</Text>
                    </div>
                  </div>
                </Col>
              )}
              {supplier.email && (
                <Col xs={24} md={12}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <EnvelopeIcon className="w-4 h-4" className="text-green-500" />
                    </div>
                    <div>
                      <Text type="secondary" className="block text-xs">
                        E-posta
                      </Text>
                      <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
                    </div>
                  </div>
                </Col>
              )}
              {supplier.phone && (
                <Col xs={24} md={12}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <PhoneIcon className="w-4 h-4" className="text-orange-500" />
                    </div>
                    <div>
                      <Text type="secondary" className="block text-xs">
                        Telefon
                      </Text>
                      <a href={`tel:${supplier.phone}`}>{supplier.phone}</a>
                    </div>
                  </div>
                </Col>
              )}
              {supplier.contactPhone && (
                <Col xs={24} md={12}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                      <PhoneIcon className="w-4 h-4" className="text-cyan-500" />
                    </div>
                    <div>
                      <Text type="secondary" className="block text-xs">
                        İletişim Telefonu
                      </Text>
                      <a href={`tel:${supplier.contactPhone}`}>{supplier.contactPhone}</a>
                    </div>
                  </div>
                </Col>
              )}
              {supplier.website && (
                <Col xs={24} md={12}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <GlobeAltIcon className="w-4 h-4" className="text-purple-500" />
                    </div>
                    <div>
                      <Text type="secondary" className="block text-xs">
                        Web Sitesi
                      </Text>
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                        {supplier.website}
                      </a>
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Card>

          {/* Address */}
          {address && (
            <Card title="Adres Bilgileri">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4" className="text-gray-400 mt-1 text-lg" />
                <div>
                  {supplier.street && <div>{supplier.street}</div>}
                  <div>{[supplier.city, supplier.state].filter(Boolean).join(', ')}</div>
                  <div>{[supplier.postalCode, supplier.country].filter(Boolean).join(' ')}</div>
                </div>
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* Business Terms */}
          <Card title="Ticari Koşullar" className="mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <Text type="secondary">Ödeme Vadesi</Text>
                <Text strong>{supplier.paymentTermDays || 0} gün</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <Text type="secondary">Kredi Limiti</Text>
                <Text strong>
                  {supplier.creditLimit?.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }) || '₺0,00'}
                </Text>
              </div>
            </div>
          </Card>

          {/* Timestamps */}
          <Card title="Kayıt Bilgileri">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text type="secondary">Oluşturulma</Text>
                <Text>{dayjs(supplier.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </div>
              {supplier.updatedAt && (
                <div className="flex justify-between">
                  <Text type="secondary">Güncelleme</Text>
                  <Text>{dayjs(supplier.updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
