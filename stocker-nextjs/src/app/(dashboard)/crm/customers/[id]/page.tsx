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
  Row,
  Col,
  Alert,
  Skeleton,
  Modal,
  message,
  Avatar,
  Dropdown,
  Progress,
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
  ShoppingCartOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  MoreOutlined,
  ShopOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCustomer, useDeleteCustomer } from '@/hooks/useCRM';
import Link from 'next/link';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

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
      <div className="p-6">
        <Skeleton active />
        <Skeleton active className="mt-4" />
        <Skeleton active className="mt-4" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6">
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
      </div>
    );
  }

  // Calculate stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const creditUsage = customer.creditLimit > 0 ? (customer.totalPurchases / customer.creditLimit) * 100 : 0;

  const stats = [
    {
      title: 'Toplam Sipariş',
      value: totalOrders.toString(),
      icon: ShoppingCartOutlined,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: '+12%',
      subtitle: 'Son 30 gün',
    },
    {
      title: 'Toplam Harcama',
      value: `₺${totalSpent.toLocaleString('tr-TR')}`,
      icon: DollarOutlined,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: '+24%',
      subtitle: 'Tüm zamanlar',
    },
    {
      title: 'Ortalama Sipariş',
      value: `₺${avgOrderValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
      icon: TrophyOutlined,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      change: '+8%',
      subtitle: 'Sipariş başına',
    },
    {
      title: 'Kredi Kullanımı',
      value: `${creditUsage.toFixed(0)}%`,
      icon: RiseOutlined,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      change: creditUsage > 80 ? 'Yüksek' : 'Normal',
      subtitle: `₺${customer.creditLimit.toLocaleString('tr-TR')} limit`,
    },
  ];

  const tabs = [
    { key: 'overview', label: 'Genel Bilgiler', icon: <ShopOutlined /> },
    { key: 'orders', label: `Siparişler (${orders.length})`, icon: <ShoppingCartOutlined /> },
    { key: 'activities', label: `Aktiviteler (${activities.length})`, icon: <ClockCircleOutlined /> },
    { key: 'documents', label: `Dosyalar (${documents.length})`, icon: <FolderOutlined /> },
  ];

  return (
    <div className="p-6">
      {/* Modern Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <ShopOutlined className="text-[200px] absolute -right-10 -bottom-10" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/crm/customers">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    size="large"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  />
                </Link>
                <Avatar
                  size={80}
                  className="bg-white/20 text-white border-4 border-white/30"
                  icon={<ShopOutlined />}
                >
                  {customer.companyName.charAt(0)}
                </Avatar>
                <div>
                  <Title level={2} className="!text-white !mb-1">
                    {customer.companyName}
                  </Title>
                  <div className="flex items-center gap-3">
                    <Text className="text-white/90 text-base">
                      <UserOutlined className="mr-1" />
                      {customer.contactPerson}
                    </Text>
                    <Tag
                      color={customer.status === 'Active' ? 'success' : customer.status === 'Potential' ? 'warning' : 'default'}
                      className="!text-sm"
                    >
                      {customer.status === 'Active' ? 'Aktif' : customer.status === 'Potential' ? 'Potansiyel' : 'Pasif'}
                    </Tag>
                    <Tag color={customer.customerType === 'Corporate' ? 'blue' : 'green'} className="!text-sm">
                      {customer.customerType === 'Corporate' ? 'Kurumsal' : 'Bireysel'}
                    </Tag>
                  </div>
                </div>
              </div>

              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'edit',
                      label: 'Düzenle',
                      icon: <EditOutlined />,
                    },
                    { type: 'divider' },
                    {
                      key: 'delete',
                      label: 'Sil',
                      icon: <DeleteOutlined />,
                      danger: true,
                      onClick: handleDelete,
                      disabled: deleteCustomer.isPending,
                    },
                  ],
                }}
                trigger={['click']}
              >
                <Button
                  icon={<MoreOutlined />}
                  size="large"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                />
              </Dropdown>
            </div>

            {/* Quick Contact Info */}
            <div className="flex gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MailOutlined />
                <a href={`mailto:${customer.email}`} className="text-white hover:text-white/80">
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <PhoneOutlined />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.website && (
                <div className="flex items-center gap-2">
                  <GlobalOutlined />
                  <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80">
                    {customer.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modern Stats Cards */}
      <Row gutter={16} className="mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.bgGradient} p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100`}>
                  <div className="absolute top-4 right-4 opacity-10">
                    <Icon className="text-6xl" />
                  </div>

                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.gradient} mb-4 shadow-md`}>
                      <Icon className="text-2xl text-white" />
                    </div>

                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {stat.change}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {stat.subtitle}
                    </div>
                  </div>

                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 hover:opacity-5 transition-opacity duration-300`} />
                </div>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      {/* Modern Tabs */}
      <Card className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabs.map(tab => ({
            key: tab.key,
            label: (
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            ),
            children: (
              <div className="pt-4">
                {tab.key === 'overview' && (
                  <Row gutter={16}>
                    <Col xs={24} lg={12}>
                      <Card title="İletişim Bilgileri" className="mb-4 shadow-sm">
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

                      <Card title="Finansal Bilgiler" className="shadow-sm">
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
                          <Descriptions.Item label="Kredi Kullanım Oranı">
                            <div>
                              <Progress
                                percent={creditUsage}
                                status={creditUsage > 80 ? 'exception' : creditUsage > 50 ? 'normal' : 'success'}
                                format={(percent) => `${percent?.toFixed(0)}%`}
                              />
                            </div>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card title="Müşteri Detayları" className="mb-4 shadow-sm">
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

                      <Card title="Notlar" className="shadow-sm">
                        <Paragraph>
                          {customer.notes || 'Henüz not eklenmemiş.'}
                        </Paragraph>
                        <Button type="link" className="p-0">Not Ekle</Button>
                      </Card>
                    </Col>
                  </Row>
                )}

                {tab.key === 'orders' && (
                  <Table
                    columns={orderColumns}
                    dataSource={orders}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                )}

                {tab.key === 'activities' && (
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
                )}

                {tab.key === 'documents' && (
                  <Table
                    columns={documentColumns}
                    dataSource={documents}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                )}
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
