'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Typography,
  Space,
  Button,
  Tabs,
  Tag,
  Table,
  Timeline,
  Statistic,
  Row,
  Col,
  Alert,
  Skeleton,
  Modal,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCustomer, useDeleteCustomer } from '@/hooks/useCRM';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = parseInt(params.id as string);

  const [activeTab, setActiveTab] = useState('overview');

  // Fetch customer data
  const { data: customer, isLoading, error } = useCustomer(customerId);
  const deleteCustomer = useDeleteCustomer();

  // Handle delete customer
  const handleDelete = () => {
    Modal.confirm({
      title: 'Müşteriyi Sil',
      icon: <ExclamationCircleOutlined />,
      content: `${customer?.companyName} müşterisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Evet, Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteCustomer.mutateAsync(customerId);
          message.success('Müşteri başarıyla silindi');
          router.push('/crm/customers');
        } catch (error) {
          // Error handled by mutation
        }
      },
    });
  };

  // Mock data for related records
  const orders = [
    { id: 1, orderNumber: 'ORD-2025-001', date: '2025-01-15', amount: 15000, status: 'Completed' },
    { id: 2, orderNumber: 'ORD-2025-002', date: '2025-02-10', amount: 22500, status: 'Processing' },
    { id: 3, orderNumber: 'ORD-2025-003', date: '2025-03-05', amount: 18000, status: 'Shipped' },
  ];

  const activities = [
    { id: 1, type: 'call', title: 'Telefon görüşmesi yapıldı', date: '2025-03-20 14:30', user: 'Ahmet Yılmaz' },
    { id: 2, type: 'email', title: 'Teklif maili gönderildi', date: '2025-03-18 10:15', user: 'Ayşe Demir' },
    { id: 3, type: 'meeting', title: 'Ofiste toplantı yapıldı', date: '2025-03-15 15:00', user: 'Mehmet Kaya' },
    { id: 4, type: 'note', title: 'Müşteri geri bildirim notu eklendi', date: '2025-03-10 09:00', user: 'Zeynep Şahin' },
  ];

  const documents = [
    { id: 1, name: 'Sözleşme_2025.pdf', type: 'Contract', date: '2025-01-10', size: '2.5 MB' },
    { id: 2, name: 'Fiyat_Teklifi_Q1.pdf', type: 'Quote', date: '2025-02-15', size: '1.2 MB' },
    { id: 3, name: 'Ürün_Katalogu.pdf', type: 'Catalog', date: '2025-03-01', size: '5.8 MB' },
  ];

  // Table columns
  const orderColumns: ColumnsType<any> = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <Link href={`/orders/${text}`}><Text strong className="text-blue-600">{text}</Text></Link>,
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₺${amount.toLocaleString('tr-TR')}`,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors: Record<string, string> = {
          Completed: 'success',
          Processing: 'processing',
          Shipped: 'warning',
        };
        const labels: Record<string, string> = {
          Completed: 'Tamamlandı',
          Processing: 'İşleniyor',
          Shipped: 'Kargoya Verildi',
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
  ];

  const documentColumns: ColumnsType<any> = [
    {
      title: 'Dosya Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type}</Tag>,
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'Boyut',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small">İndir</Button>
          <Button type="link" size="small">Görüntüle</Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <Skeleton active />
        <Skeleton active className="mt-4" />
        <Skeleton active className="mt-4" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <Alert
        message="Müşteri Bulunamadı"
        description="Aradığınız müşteri bulunamadı veya erişim izniniz yok."
        type="error"
        showIcon
        action={
          <Link href="/crm/customers">
            <Button size="small">Müşteriler Listesine Dön</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/crm/customers">
            <Button icon={<ArrowLeftOutlined />} />
          </Link>
          <div className="flex-1">
            <Title level={2} style={{ margin: 0 }}>
              {customer.companyName}
            </Title>
            <Text type="secondary">{customer.contactPerson}</Text>
          </div>
          <Space>
            <Button icon={<EditOutlined />} type="primary">
              Düzenle
            </Button>
            <Button icon={<DeleteOutlined />} danger onClick={handleDelete} loading={deleteCustomer.isPending}>
              Sil
            </Button>
          </Space>
        </div>

        {/* Quick Stats */}
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Toplam Sipariş"
                value={orders.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Toplam Harcama"
                value={customer.totalPurchases}
                prefix="₺"
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Kredi Limiti"
                value={customer.creditLimit}
                prefix="₺"
                precision={2}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Overview Tab */}
        <TabPane tab="Genel Bilgiler" key="overview">
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card title="İletişim Bilgileri" className="mb-4">
                <Descriptions column={1}>
                  <Descriptions.Item label={<><MailOutlined /> E-posta</>}>
                    <a href={`mailto:${customer.email}`}>{customer.email}</a>
                  </Descriptions.Item>
                  <Descriptions.Item label={<><PhoneOutlined /> Telefon</>}>
                    {customer.phone || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><GlobalOutlined /> Website</>}>
                    {customer.website ? <a href={customer.website} target="_blank" rel="noopener noreferrer">{customer.website}</a> : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<><EnvironmentOutlined /> Adres</>}>
                    <Paragraph style={{ marginBottom: 0 }}>
                      {customer.address || '-'}<br />
                      {customer.city && customer.state && `${customer.city}, ${customer.state}`}<br />
                      {customer.country} {customer.postalCode}
                    </Paragraph>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Finansal Bilgiler">
                <Descriptions column={1}>
                  <Descriptions.Item label="Vergi Numarası">
                    {customer.taxId || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ödeme Koşulları">
                    {customer.paymentTerms || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kredi Limiti">
                    ₺{customer.creditLimit.toLocaleString('tr-TR')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Toplam Alışveriş">
                    ₺{customer.totalPurchases.toLocaleString('tr-TR')}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Müşteri Detayları" className="mb-4">
                <Descriptions column={1}>
                  <Descriptions.Item label="Müşteri Tipi">
                    <Tag color={customer.customerType === 'Corporate' ? 'blue' : 'green'}>
                      {customer.customerType === 'Corporate' ? 'Kurumsal' : 'Bireysel'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Durum">
                    <Tag color={customer.status === 'Active' ? 'success' : customer.status === 'Potential' ? 'warning' : 'default'}>
                      {customer.status === 'Active' ? 'Aktif' : customer.status === 'Potential' ? 'Potansiyel' : 'Pasif'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kayıt Tarihi">
                    {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Son Güncelleme">
                    {new Date(customer.updatedAt).toLocaleDateString('tr-TR')}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Notlar">
                <Paragraph>
                  {customer.notes || 'Henüz not eklenmemiş.'}
                </Paragraph>
                <Button type="link" className="p-0">Not Ekle</Button>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Orders Tab */}
        <TabPane tab={`Siparişler (${orders.length})`} key="orders">
          <Card>
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Activities Tab */}
        <TabPane tab={`Aktiviteler (${activities.length})`} key="activities">
          <Card>
            <Timeline
              items={activities.map(activity => ({
                color: activity.type === 'call' ? 'blue' : activity.type === 'email' ? 'green' : activity.type === 'meeting' ? 'orange' : 'gray',
                children: (
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-gray-500">
                      {activity.date} - {activity.user}
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </TabPane>

        {/* Documents Tab */}
        <TabPane tab={`Dosyalar (${documents.length})`} key="documents">
          <Card>
            <Table
              columns={documentColumns}
              dataSource={documents}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}
