'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Typography,
  Spin,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Table,
  Empty,
  Dropdown,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  BankOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import {
  useSupplier,
  useActivateSupplier,
  useDeactivateSupplier,
  useBlockSupplier,
  useUnblockSupplier,
} from '@/lib/api/hooks/usePurchase';
import type { SupplierStatus, SupplierType } from '@/lib/api/services/purchase.types';
import type { MenuProps } from 'antd';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<SupplierStatus, string> = {
  Active: 'green',
  Inactive: 'default',
  Pending: 'orange',
  Blacklisted: 'red',
  OnHold: 'yellow',
};

const statusLabels: Record<SupplierStatus, string> = {
  Active: 'Aktif',
  Inactive: 'Pasif',
  Pending: 'Onay Bekliyor',
  Blacklisted: 'Bloklu',
  OnHold: 'Beklemede',
};

const typeLabels: Record<SupplierType, string> = {
  Manufacturer: 'Üretici',
  Wholesaler: 'Toptancı',
  Distributor: 'Distribütör',
  Importer: 'İthalatçı',
  Retailer: 'Perakendeci',
  ServiceProvider: 'Hizmet Sağlayıcı',
  Other: 'Diğer',
};

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const { data: supplier, isLoading } = useSupplier(supplierId);
  const activateSupplier = useActivateSupplier();
  const deactivateSupplier = useDeactivateSupplier();
  const blockSupplier = useBlockSupplier();
  const unblockSupplier = useUnblockSupplier();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-8">
        <Empty description="Tedarikçi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/suppliers')}>
            Tedarikçilere Dön
          </Button>
        </div>
      </div>
    );
  }

  const actionMenuItems = [
    supplier.status !== 'Active' && {
      key: 'activate',
      icon: <CheckCircleOutlined />,
      label: 'Aktifleştir',
      onClick: () => activateSupplier.mutate(supplierId),
    },
    supplier.status === 'Active' && {
      key: 'deactivate',
      icon: <StopOutlined />,
      label: 'Devre Dışı Bırak',
      onClick: () => deactivateSupplier.mutate(supplierId),
    },
    supplier.status !== 'Blacklisted' && {
      key: 'block',
      icon: <StopOutlined />,
      label: 'Blokla',
      danger: true,
      onClick: () => blockSupplier.mutate({ id: supplierId, reason: 'Manual block' }),
    },
    supplier.status === 'Blacklisted' && {
      key: 'unblock',
      icon: <CheckCircleOutlined />,
      label: 'Bloğu Kaldır',
      onClick: () => unblockSupplier.mutate(supplierId),
    },
  ].filter(Boolean) as MenuProps['items'];

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/purchase/suppliers')}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {supplier.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0 flex items-center gap-2">
                  {supplier.name}
                  <Tag color={statusColors[supplier.status as SupplierStatus]}>
                    {statusLabels[supplier.status as SupplierStatus]}
                  </Tag>
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {supplier.code} • {typeLabels[supplier.type as SupplierType]}
                </p>
              </div>
            </div>
          </div>

          <Space>
            <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
              <Button icon={<MoreOutlined />}>İşlemler</Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/purchase/suppliers/${supplierId}/edit`)}
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Kredi Limiti"
                value={supplier.creditLimit || 0}
                precision={2}
                suffix={supplier.currency}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Güncel Bakiye"
                value={supplier.currentBalance || 0}
                precision={2}
                suffix={supplier.currency}
                valueStyle={{ color: supplier.currentBalance > 0 ? '#faad14' : '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="İndirim Oranı"
                value={supplier.discountRate || 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Puan"
                value={supplier.rating || 0}
                precision={1}
                suffix="/5"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: (
                  <span>
                    <ShopOutlined className="mr-1" />
                    Genel Bilgiler
                  </span>
                ),
                children: (
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Descriptions
                        title="Firma Bilgileri"
                        column={1}
                        size="small"
                        bordered
                      >
                        <Descriptions.Item label="Tedarikçi Adı">
                          {supplier.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kod">
                          {supplier.code}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tip">
                          {typeLabels[supplier.type as SupplierType]}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vergi No">
                          {supplier.taxNumber || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vergi Dairesi">
                          {supplier.taxOffice || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Puan">
                          <span className="text-yellow-600 font-medium">
                            {supplier.rating?.toFixed(1) || '-'}
                          </span>
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col xs={24} md={12}>
                      <Descriptions
                        title="İletişim Bilgileri"
                        column={1}
                        size="small"
                        bordered
                      >
                        <Descriptions.Item label={<><PhoneOutlined className="mr-1" /> Telefon</>}>
                          {supplier.phone || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label={<><MailOutlined className="mr-1" /> E-posta</>}>
                          {supplier.email || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Faks">
                          {supplier.fax || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label={<><GlobalOutlined className="mr-1" /> Web Sitesi</>}>
                          {supplier.website ? (
                            <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                              {supplier.website}
                            </a>
                          ) : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="İlgili Kişi">
                          {supplier.contacts?.find(c => c.isPrimary)?.name || supplier.contacts?.[0]?.name || '-'}
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'address',
                label: (
                  <span>
                    <EnvironmentOutlined className="mr-1" />
                    Adres
                  </span>
                ),
                children: (
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="Adres" span={2}>
                      {supplier.address || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="İlçe">
                      {supplier.district || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Şehir">
                      {supplier.city || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Posta Kodu">
                      {supplier.postalCode || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ülke">
                      {supplier.country || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'financial',
                label: (
                  <span>
                    <BankOutlined className="mr-1" />
                    Finansal Bilgiler
                  </span>
                ),
                children: (
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="Ödeme Vadesi">
                      {supplier.paymentTerms || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Para Birimi">
                      {supplier.currency || 'TRY'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kredi Limiti">
                      {(supplier.creditLimit || 0).toLocaleString('tr-TR')} {supplier.currency}
                    </Descriptions.Item>
                    <Descriptions.Item label="İndirim Oranı">
                      %{supplier.discountRate || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Banka" span={2}>
                      {supplier.bankName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hesap No">
                      {supplier.bankAccountNumber || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="IBAN">
                      {supplier.iban || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'notes',
                label: (
                  <span>
                    <FileTextOutlined className="mr-1" />
                    Notlar
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    <div>
                      <Text strong className="block mb-2">Genel Notlar</Text>
                      <Paragraph className="text-gray-600 whitespace-pre-wrap">
                        {supplier.notes || 'Not bulunmuyor.'}
                      </Paragraph>
                    </div>
                  </div>
                ),
              },
              {
                key: 'orders',
                label: (
                  <span>
                    <ShoppingCartOutlined className="mr-1" />
                    Siparişler
                  </span>
                ),
                children: (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Text type="secondary">Son siparişler</Text>
                      <Button
                        type="link"
                        onClick={() => router.push(`/purchase/orders?supplierId=${supplierId}`)}
                      >
                        Tüm Siparişleri Gör
                      </Button>
                    </div>
                    <Empty description="Sipariş bulunamadı" />
                  </div>
                ),
              },
              {
                key: 'contacts',
                label: 'İletişim Kişileri',
                children: (
                  <div>
                    {supplier.contacts && supplier.contacts.length > 0 ? (
                      <Table
                        dataSource={supplier.contacts}
                        rowKey="id"
                        pagination={false}
                        columns={[
                          { title: 'Ad Soyad', dataIndex: 'name', key: 'name' },
                          { title: 'Ünvan', dataIndex: 'title', key: 'title' },
                          { title: 'E-posta', dataIndex: 'email', key: 'email' },
                          { title: 'Telefon', dataIndex: 'phone', key: 'phone' },
                          {
                            title: 'Birincil',
                            dataIndex: 'isPrimary',
                            key: 'isPrimary',
                            render: (isPrimary) => isPrimary ? <Tag color="blue">Birincil</Tag> : null,
                          },
                        ]}
                      />
                    ) : (
                      <Empty description="İletişim kişisi bulunmuyor" />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
