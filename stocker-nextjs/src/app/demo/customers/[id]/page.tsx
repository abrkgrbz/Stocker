'use client';

import React, { useState } from 'react';
import { Card, Avatar, Tag, Button, Tabs, Timeline, Progress, Statistic, Row, Col, Badge, Descriptions, Empty, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RiseOutlined,
  FileTextOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  EditOutlined,
  BarChartOutlined,
  TeamOutlined,
  GlobalOutlined,
  BankOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MOCK_CUSTOMERS } from '@/lib/data/mock-customers';

interface CustomerDetailProps {
  params: {
    id: string;
  };
}

export default function CustomerDetailPage({ params }: CustomerDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Find customer by ID
  const customer = MOCK_CUSTOMERS.find((c) => c.id === parseInt(params.id));

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Müşteri Bulunamadı</h3>
          <p className="text-gray-500 mb-6">Aradığınız müşteri sistemde kayıtlı değil</p>
          <Button type="primary" size="large" onClick={() => router.push('/demo/customers')}>
            Müşteri Listesine Dön
          </Button>
        </Card>
      </div>
    );
  }

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Active':
        return { color: 'green', icon: <CheckCircleOutlined />, text: '✓ Aktif', badge: 'success' };
      case 'Pending':
        return { color: 'gold', icon: <SyncOutlined spin />, text: '⏳ Beklemede', badge: 'processing' };
      case 'Inactive':
        return { color: 'default', icon: <ExclamationCircleOutlined />, text: '✕ Pasif', badge: 'default' };
      default:
        return { color: 'default', icon: <ClockCircleOutlined />, text: status, badge: 'default' };
    }
  };

  const statusConfig = getStatusConfig(customer.status);

  // Calculate metrics
  const creditUsagePercentage = ((customer.totalPurchases / customer.creditLimit) * 100).toFixed(1);
  const availableCredit = customer.creditLimit - customer.totalPurchases;
  const averageOrderValue = customer.totalOrders > 0 ? customer.totalPurchases / customer.totalOrders : 0;

  // Industry color
  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      Teknoloji: 'blue',
      Gıda: 'green',
      Tekstil: 'purple',
      Otomotiv: 'orange',
      İnşaat: 'cyan',
      Mobilya: 'magenta',
      Elektronik: 'geekblue',
      Tarım: 'lime',
      Turizm: 'gold',
      Enerji: 'volcano',
    };
    return colors[industry] || 'default';
  };

  // Mock timeline data
  const timelineData = [
    {
      color: 'green',
      icon: <CheckCircleOutlined />,
      title: 'Sipariş Tamamlandı',
      description: 'SIP-2024-0156 numaralı sipariş teslim edildi',
      time: '2 gün önce',
    },
    {
      color: 'blue',
      icon: <ShoppingOutlined />,
      title: 'Yeni Sipariş',
      description: '₺45,600 tutarında yeni sipariş oluşturuldu',
      time: '5 gün önce',
    },
    {
      color: 'purple',
      icon: <FileTextOutlined />,
      title: 'Teklif Gönderildi',
      description: 'TEK-2024-0892 numaralı teklif müşteriye iletildi',
      time: '1 hafta önce',
    },
    {
      color: 'orange',
      icon: <PhoneOutlined />,
      title: 'Görüşme Yapıldı',
      description: 'Ürün portföyü hakkında detaylı görüşme',
      time: '2 hafta önce',
    },
    {
      color: 'cyan',
      icon: <TeamOutlined />,
      title: 'İlk Temas',
      description: 'Müşteri kaydı oluşturuldu ve ilk görüşme yapıldı',
      time: '1 ay önce',
    },
  ];

  // Mock orders data
  const mockOrders = [
    { id: 'SIP-2024-0156', date: '2024-10-24', amount: 52400, status: 'Teslim Edildi', statusColor: 'success' },
    { id: 'SIP-2024-0142', date: '2024-10-21', amount: 45600, status: 'Hazırlanıyor', statusColor: 'processing' },
    { id: 'SIP-2024-0128', date: '2024-10-18', amount: 38200, status: 'Teslim Edildi', statusColor: 'success' },
    { id: 'SIP-2024-0115', date: '2024-10-15', amount: 67800, status: 'Teslim Edildi', statusColor: 'success' },
    { id: 'SIP-2024-0098', date: '2024-10-10', amount: 41500, status: 'İptal Edildi', statusColor: 'error' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button
          type="text"
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/demo/customers')}
          className="hover:bg-white/50"
        >
          Müşteri Listesine Dön
        </Button>
      </motion.div>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="shadow-xl border-0 mb-6 overflow-hidden">
          {/* Background Gradient */}
          <div
            className="absolute top-0 left-0 right-0 h-32 -z-10"
            style={{
              background: customer.status === 'Active'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : customer.status === 'Pending'
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            }}
          />

          <div className="pt-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Avatar
                    size={120}
                    icon={<ShopOutlined />}
                    className={`border-8 border-white shadow-2xl ${
                      customer.status === 'Active'
                        ? 'bg-gradient-to-br from-green-400 to-blue-500'
                        : customer.status === 'Pending'
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                        : 'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}
                  />
                  <div
                    className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg ${
                      customer.status === 'Active'
                        ? 'bg-green-500'
                        : customer.status === 'Pending'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-grow">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{customer.companyName}</h1>
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <span className="text-gray-600 flex items-center gap-2">
                        <UserOutlined className="text-blue-500" />
                        <span className="font-medium">{customer.contactPerson}</span>
                      </span>
                      {customer.industry && (
                        <Tag color={getIndustryColor(customer.industry)} icon={<ShopOutlined />} className="text-sm">
                          {customer.industry}
                        </Tag>
                      )}
                      <Tag color={customer.customerType === 'Corporate' ? 'purple' : 'green'} className="text-sm">
                        {customer.customerType === 'Corporate' ? '🏢 Kurumsal' : '👤 Bireysel'}
                      </Tag>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-gray-600 flex items-center gap-2">
                        <MailOutlined className="text-blue-500" />
                        {customer.email}
                      </span>
                      <span className="text-gray-600 flex items-center gap-2">
                        <PhoneOutlined className="text-green-500" />
                        {customer.phone}
                      </span>
                      <span className="text-gray-600 flex items-center gap-2">
                        <EnvironmentOutlined className="text-red-500" />
                        {customer.city}, {customer.district}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Badge status={statusConfig.badge as any} text={statusConfig.text} className="mr-4" />
                    <Button type="primary" icon={<EditOutlined />} size="large">
                      Düzenle
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg border-0 h-full bg-gradient-to-br from-blue-500 to-blue-600">
              <Statistic
                title={<span className="text-white/90 flex items-center gap-2"><DollarOutlined /> Kredi Limiti</span>}
                value={customer.creditLimit}
                prefix="₺"
                valueStyle={{ color: 'white', fontWeight: 'bold' }}
                suffix={
                  <div className="text-xs text-white/80 mt-1">
                    Kullanılabilir: ₺{availableCredit.toLocaleString('tr-TR')}
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg border-0 h-full bg-gradient-to-br from-green-500 to-green-600">
              <Statistic
                title={<span className="text-white/90 flex items-center gap-2"><ShoppingOutlined /> Toplam Ciro</span>}
                value={customer.totalPurchases}
                prefix="₺"
                valueStyle={{ color: 'white', fontWeight: 'bold' }}
                suffix={
                  <div className="text-xs text-white/80 mt-1">
                    {customer.totalOrders} sipariş
                  </div>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg border-0 h-full bg-gradient-to-br from-purple-500 to-purple-600">
              <Statistic
                title={<span className="text-white/90 flex items-center gap-2"><RiseOutlined /> Kullanım Oranı</span>}
                value={parseFloat(creditUsagePercentage)}
                suffix="%"
                valueStyle={{ color: 'white', fontWeight: 'bold' }}
              />
              <Progress
                percent={parseFloat(creditUsagePercentage)}
                strokeColor={{ '0%': '#fff', '100%': '#fff' }}
                trailColor="rgba(255,255,255,0.3)"
                showInfo={false}
                className="mt-2"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-lg border-0 h-full bg-gradient-to-br from-orange-500 to-orange-600">
              <Statistic
                title={<span className="text-white/90 flex items-center gap-2"><BarChartOutlined /> Ort. Sipariş</span>}
                value={averageOrderValue}
                prefix="₺"
                valueStyle={{ color: 'white', fontWeight: 'bold' }}
                suffix={
                  <div className="text-xs text-white/80 mt-1">
                    Son: {new Date(customer.lastPurchaseDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Tabs Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="shadow-xl border-0">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            items={[
              {
                key: 'overview',
                label: (
                  <span className="flex items-center gap-2">
                    <FileTextOutlined />
                    Genel Bakış
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <Row gutter={[24, 24]}>
                      {/* Company Details */}
                      <Col xs={24} lg={12}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <BankOutlined className="text-blue-500" />
                          Firma Bilgileri
                        </h3>
                        <Descriptions bordered column={1} size="small">
                          <Descriptions.Item label="Firma Adı">{customer.companyName}</Descriptions.Item>
                          <Descriptions.Item label="Yetkili Kişi">{customer.contactPerson}</Descriptions.Item>
                          <Descriptions.Item label="Müşteri Tipi">
                            <Tag color={customer.customerType === 'Corporate' ? 'purple' : 'green'}>
                              {customer.customerType === 'Corporate' ? '🏢 Kurumsal' : '👤 Bireysel'}
                            </Tag>
                          </Descriptions.Item>
                          {customer.industry && (
                            <Descriptions.Item label="Sektör">
                              <Tag color={getIndustryColor(customer.industry)}>{customer.industry}</Tag>
                            </Descriptions.Item>
                          )}
                          <Descriptions.Item label="Durum">
                            <Badge status={statusConfig.badge as any} text={statusConfig.text} />
                          </Descriptions.Item>
                          {customer.taxNumber && (
                            <Descriptions.Item label="Vergi No">{customer.taxNumber}</Descriptions.Item>
                          )}
                        </Descriptions>
                      </Col>

                      {/* Contact & Address */}
                      <Col xs={24} lg={12}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <GlobalOutlined className="text-green-500" />
                          İletişim & Adres
                        </h3>
                        <Descriptions bordered column={1} size="small">
                          <Descriptions.Item label={<><MailOutlined /> Email</>}>
                            {customer.email}
                          </Descriptions.Item>
                          <Descriptions.Item label={<><PhoneOutlined /> Telefon</>}>
                            {customer.phone}
                          </Descriptions.Item>
                          <Descriptions.Item label={<><EnvironmentOutlined /> Şehir</>}>
                            {customer.city}
                          </Descriptions.Item>
                          <Descriptions.Item label="İlçe">{customer.district}</Descriptions.Item>
                          <Descriptions.Item label="Adres">{customer.address}</Descriptions.Item>
                          <Descriptions.Item label="Posta Kodu">{customer.postalCode}</Descriptions.Item>
                        </Descriptions>
                      </Col>

                      {/* Financial Info */}
                      <Col xs={24}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <CreditCardOutlined className="text-purple-500" />
                          Finansal Bilgiler
                        </h3>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} md={8}>
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                              <Statistic
                                title="Kredi Limiti"
                                value={customer.creditLimit}
                                prefix="₺"
                                valueStyle={{ color: '#1890ff' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} md={8}>
                            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                              <Statistic
                                title="Kullanılan Kredi"
                                value={customer.totalPurchases}
                                prefix="₺"
                                valueStyle={{ color: '#52c41a' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} md={8}>
                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                              <Statistic
                                title="Kalan Kredi"
                                value={availableCredit}
                                prefix="₺"
                                valueStyle={{ color: '#722ed1' }}
                              />
                            </Card>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: 'orders',
                label: (
                  <span className="flex items-center gap-2">
                    <ShoppingOutlined />
                    Siparişler
                    <Badge count={mockOrders.length} showZero style={{ backgroundColor: '#52c41a' }} />
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <div className="space-y-4">
                      {mockOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="flex-grow">
                                <h4 className="text-lg font-bold text-gray-800 mb-2">{order.id}</h4>
                                <div className="flex items-center gap-4 flex-wrap">
                                  <span className="text-gray-600 flex items-center gap-1">
                                    <CalendarOutlined className="text-blue-500" />
                                    {new Date(order.date).toLocaleDateString('tr-TR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  <span className="text-lg font-bold text-green-600">
                                    ₺{order.amount.toLocaleString('tr-TR')}
                                  </span>
                                </div>
                              </div>
                              <Badge status={order.statusColor as any} text={order.status} />
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                key: 'activities',
                label: (
                  <span className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    Aktiviteler
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <Timeline
                      items={timelineData.map((item) => ({
                        color: item.color,
                        dot: item.icon,
                        children: (
                          <div>
                            <p className="font-semibold text-gray-800">{item.title}</p>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                            <p className="text-gray-400 text-xs mt-1">{item.time}</p>
                          </div>
                        ),
                      }))}
                    />
                  </div>
                ),
              },
              {
                key: 'documents',
                label: (
                  <span className="flex items-center gap-2">
                    <FileTextOutlined />
                    Dökümanlar
                  </span>
                ),
                children: (
                  <div className="py-16">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-gray-500">
                          Henüz döküman bulunmuyor
                        </span>
                      }
                    >
                      <Button type="primary" icon={<FileTextOutlined />}>
                        Döküman Ekle
                      </Button>
                    </Empty>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </motion.div>
    </div>
  );
}
