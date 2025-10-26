'use client';

import React, { useState } from 'react';
import { Card, Avatar, Tag, Button, Tabs, Timeline, Progress, Statistic, Row, Col, Badge, Descriptions, Empty, Divider, Tooltip, Space, Alert, FloatButton } from 'antd';
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
  FireOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  CustomerServiceOutlined,
  BellOutlined,
  MessageOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EyeOutlined,
  LineChartOutlined,
  GiftOutlined,
  SafetyOutlined,
  WarningOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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

  // Calculate health score (0-100)
  const healthScore = Math.min(100, Math.round(
    (parseFloat(creditUsagePercentage) < 80 ? 30 : 10) + // Credit usage health
    (customer.status === 'Active' ? 40 : 20) + // Status health
    (customer.totalOrders > 10 ? 30 : 15) // Order frequency health
  ));

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

  // Generate insights
  const generateInsights = () => {
    const insights = [];

    if (parseFloat(creditUsagePercentage) > 80) {
      insights.push({
        type: 'warning',
        icon: <WarningOutlined />,
        title: 'Kredi Limiti Uyarısı',
        description: `Müşteri kredi limitinin %${creditUsagePercentage}'ını kullanmış durumda. Limit artırımı değerlendirilebilir.`,
      });
    } else if (parseFloat(creditUsagePercentage) < 30) {
      insights.push({
        type: 'success',
        icon: <SafetyOutlined />,
        title: 'Sağlıklı Kredi Kullanımı',
        description: 'Müşteri kredi limitini dengeli kullanıyor. Finansal durumu istikrarlı görünüyor.',
      });
    }

    if (customer.totalOrders > 15) {
      insights.push({
        type: 'success',
        icon: <FireOutlined />,
        title: 'Sadık Müşteri',
        description: `${customer.totalOrders} sipariş ile düzenli alışveriş yapıyor. Sadakat programı sunulabilir.`,
      });
    }

    if (customer.status === 'Active') {
      insights.push({
        type: 'info',
        icon: <SmileOutlined />,
        title: 'Aktif İlişki',
        description: 'Müşteri aktif durumda. Düzenli iletişim ve takip önerilir.',
      });
    }

    // Calculate days since last purchase
    const daysSinceLastPurchase = Math.floor(
      (new Date().getTime() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPurchase > 30) {
      insights.push({
        type: 'warning',
        icon: <ClockCircleOutlined />,
        title: 'Uzun Süredir Alışveriş Yok',
        description: `Son alışverişin üzerinden ${daysSinceLastPurchase} gün geçti. İletişime geçilmesi önerilir.`,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  // Mock timeline data
  const timelineData = [
    {
      color: 'green',
      icon: <CheckCircleOutlined />,
      title: 'Sipariş Tamamlandı',
      description: 'SIP-2024-0156 numaralı sipariş teslim edildi',
      time: '2 gün önce',
      amount: '₺52,400',
    },
    {
      color: 'blue',
      icon: <ShoppingOutlined />,
      title: 'Yeni Sipariş',
      description: '₺45,600 tutarında yeni sipariş oluşturuldu',
      time: '5 gün önce',
      amount: '₺45,600',
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
    { id: 'SIP-2024-0156', date: '2024-10-24', amount: 52400, status: 'Teslim Edildi', statusColor: 'success', items: 12 },
    { id: 'SIP-2024-0142', date: '2024-10-21', amount: 45600, status: 'Hazırlanıyor', statusColor: 'processing', items: 8 },
    { id: 'SIP-2024-0128', date: '2024-10-18', amount: 38200, status: 'Teslim Edildi', statusColor: 'success', items: 6 },
    { id: 'SIP-2024-0115', date: '2024-10-15', amount: 67800, status: 'Teslim Edildi', statusColor: 'success', items: 15 },
    { id: 'SIP-2024-0098', date: '2024-10-10', amount: 41500, status: 'İptal Edildi', statusColor: 'error', items: 9 },
  ];

  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return { color: '#52c41a', text: 'Mükemmel', emoji: '🌟' };
    if (score >= 60) return { color: '#1890ff', text: 'İyi', emoji: '👍' };
    if (score >= 40) return { color: '#faad14', text: 'Orta', emoji: '⚠️' };
    return { color: '#ff4d4f', text: 'Dikkat', emoji: '🚨' };
  };

  const healthScoreConfig = getHealthScoreColor(healthScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8 relative">
      {/* Floating Action Buttons */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24 }}
        icon={<CustomerServiceOutlined />}
      >
        <FloatButton icon={<MessageOutlined />} tooltip="Mesaj Gönder" />
        <FloatButton icon={<PhoneOutlined />} tooltip="Ara" />
        <FloatButton icon={<MailOutlined />} tooltip="Email Gönder" />
        <FloatButton icon={<PrinterOutlined />} tooltip="Yazdır" />
        <FloatButton icon={<ShareAltOutlined />} tooltip="Paylaş" />
      </FloatButton.Group>

      {/* Back Button */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button
          type="text"
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/demo/customers')}
          className="hover:bg-white/50 backdrop-blur-sm"
        >
          Müşteri Listesine Dön
        </Button>
      </motion.div>

      {/* Header Card with Glassmorphism */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-2xl"
          style={{
            background: customer.status === 'Active'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : customer.status === 'Pending'
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          }}
        >
          {/* Decorative Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 80%, white 2px, transparent 2px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Content */}
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Section with Animation */}
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="relative">
                  <Avatar
                    size={140}
                    icon={<ShopOutlined />}
                    className={`border-8 border-white shadow-2xl ${
                      customer.status === 'Active'
                        ? 'bg-gradient-to-br from-green-400 to-blue-500'
                        : customer.status === 'Pending'
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                        : 'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}
                  />
                  <motion.div
                    className={`absolute bottom-2 right-2 w-10 h-10 rounded-full border-4 border-white shadow-lg ${
                      customer.status === 'Active'
                        ? 'bg-green-500'
                        : customer.status === 'Pending'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  {/* Health Score Badge */}
                  <Tooltip title={`Müşteri Sağlık Skoru: ${healthScore}/100`}>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-lg">
                      <span className="text-xs font-bold" style={{ color: healthScoreConfig.color }}>
                        {healthScoreConfig.emoji} {healthScore}
                      </span>
                    </div>
                  </Tooltip>
                </div>
              </motion.div>

              {/* Company Info */}
              <div className="flex-grow">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <motion.h1
                      className="text-4xl font-bold mb-3 text-white drop-shadow-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {customer.companyName}
                    </motion.h1>
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                      <span className="text-white flex items-center gap-2 bg-white/30 px-3 py-1 rounded-full backdrop-blur-md border-2 border-white/50 shadow-lg">
                        <UserOutlined className="text-lg" />
                        <span className="font-bold">{customer.contactPerson}</span>
                      </span>
                      {customer.industry && (
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-semibold shadow-md flex items-center gap-2">
                          <ShopOutlined />
                          {customer.industry}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md ${
                        customer.customerType === 'Corporate'
                          ? 'bg-purple-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {customer.customerType === 'Corporate' ? '🏢 Kurumsal' : '👤 Bireysel'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md border-2 border-white/50 shadow-lg">
                        <MailOutlined className="text-white text-lg" />
                        <span className="text-sm text-white font-semibold">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md border-2 border-white/50 shadow-lg">
                        <PhoneOutlined className="text-white text-lg" />
                        <span className="text-sm text-white font-semibold">{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md border-2 border-white/50 shadow-lg">
                        <EnvironmentOutlined className="text-white text-lg" />
                        <span className="text-sm text-white font-semibold truncate">{customer.city}, {customer.district}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md border-2 border-white/50 shadow-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full shadow-md ${
                        customer.status === 'Active' ? 'bg-green-400' :
                        customer.status === 'Pending' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`} />
                      <span className="text-white font-bold text-sm">{statusConfig.text}</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      size="large"
                      className="shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.35)',
                        borderWidth: '2px',
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      Düzenle
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring' }}>
              <Card
                className="shadow-xl border-0 h-full overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <Statistic
                  title={<span className="text-white flex items-center gap-2 text-base font-semibold"><DollarOutlined /> Kredi Limiti</span>}
                  value={customer.creditLimit}
                  prefix="₺"
                  valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}
                />
                <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />
                <div className="text-white text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Kullanılabilir:</span>
                    <span className="font-bold">₺{availableCredit.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring' }}>
              <Card
                className="shadow-xl border-0 h-full overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <Statistic
                  title={<span className="text-white flex items-center gap-2 text-base font-semibold"><ShoppingOutlined /> Toplam Ciro</span>}
                  value={customer.totalPurchases}
                  prefix="₺"
                  valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}
                />
                <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />
                <div className="text-white text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Sipariş Sayısı:</span>
                    <span className="font-bold">{customer.totalOrders} adet</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring' }}>
              <Card
                className="shadow-xl border-0 h-full overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <Statistic
                  title={<span className="text-white flex items-center gap-2 text-base font-semibold"><RiseOutlined /> Kullanım Oranı</span>}
                  value={parseFloat(creditUsagePercentage)}
                  suffix="%"
                  valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}
                />
                <Progress
                  percent={parseFloat(creditUsagePercentage)}
                  strokeColor={{ '0%': '#fff', '100%': '#fff' }}
                  trailColor="rgba(255,255,255,0.3)"
                  showInfo={false}
                  className="mt-3"
                  strokeWidth={8}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring' }}>
              <Card
                className="shadow-xl border-0 h-full overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <Statistic
                  title={<span className="text-white flex items-center gap-2 text-base font-semibold"><BarChartOutlined /> Ort. Sipariş</span>}
                  value={averageOrderValue}
                  prefix="₺"
                  valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}
                />
                <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />
                <div className="text-white text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Son Alışveriş:</span>
                    <span className="font-bold text-xs">
                      {new Date(customer.lastPurchaseDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* AI Insights Card */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card
            className="shadow-xl border-0 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50"
            title={
              <span className="flex items-center gap-2 text-lg">
                <ThunderboltOutlined className="text-yellow-500" />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
                  Akıllı İçgörüler & Öneriler
                </span>
              </span>
            }
          >
            <Row gutter={[16, 16]}>
              {insights.map((insight, index) => (
                <Col xs={24} md={12} key={index}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Alert
                      message={
                        <span className="flex items-center gap-2 font-semibold">
                          {insight.icon}
                          {insight.title}
                        </span>
                      }
                      description={insight.description}
                      type={insight.type as any}
                      showIcon
                      className="shadow-md"
                    />
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Card>
        </motion.div>
      )}

      {/* Tabs Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BankOutlined className="text-blue-500" />
                            Firma Bilgileri
                          </h3>
                          <Descriptions bordered column={1} size="middle">
                            <Descriptions.Item label="Firma Adı" labelStyle={{ fontWeight: 'bold' }}>
                              {customer.companyName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Yetkili Kişi" labelStyle={{ fontWeight: 'bold' }}>
                              {customer.contactPerson}
                            </Descriptions.Item>
                            <Descriptions.Item label="Müşteri Tipi" labelStyle={{ fontWeight: 'bold' }}>
                              <Tag color={customer.customerType === 'Corporate' ? 'purple' : 'green'}>
                                {customer.customerType === 'Corporate' ? '🏢 Kurumsal' : '👤 Bireysel'}
                              </Tag>
                            </Descriptions.Item>
                            {customer.industry && (
                              <Descriptions.Item label="Sektör" labelStyle={{ fontWeight: 'bold' }}>
                                <Tag color={getIndustryColor(customer.industry)}>{customer.industry}</Tag>
                              </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Durum" labelStyle={{ fontWeight: 'bold' }}>
                              <Badge status={statusConfig.badge as any} text={statusConfig.text} />
                            </Descriptions.Item>
                            {customer.taxNumber && (
                              <Descriptions.Item label="Vergi No" labelStyle={{ fontWeight: 'bold' }}>
                                {customer.taxNumber}
                              </Descriptions.Item>
                            )}
                          </Descriptions>
                        </motion.div>
                      </Col>

                      {/* Contact & Address */}
                      <Col xs={24} lg={12}>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <GlobalOutlined className="text-green-500" />
                            İletişim & Adres
                          </h3>
                          <Descriptions bordered column={1} size="middle">
                            <Descriptions.Item label={<><MailOutlined /> Email</>} labelStyle={{ fontWeight: 'bold' }}>
                              <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                                {customer.email}
                              </a>
                            </Descriptions.Item>
                            <Descriptions.Item label={<><PhoneOutlined /> Telefon</>} labelStyle={{ fontWeight: 'bold' }}>
                              <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                                {customer.phone}
                              </a>
                            </Descriptions.Item>
                            <Descriptions.Item label={<><EnvironmentOutlined /> Şehir</>} labelStyle={{ fontWeight: 'bold' }}>
                              {customer.city}
                            </Descriptions.Item>
                            <Descriptions.Item label="İlçe" labelStyle={{ fontWeight: 'bold' }}>
                              {customer.district}
                            </Descriptions.Item>
                            <Descriptions.Item label="Adres" labelStyle={{ fontWeight: 'bold' }}>
                              {customer.address}
                            </Descriptions.Item>
                            <Descriptions.Item label="Posta Kodu" labelStyle={{ fontWeight: 'bold' }}>
                              {customer.postalCode}
                            </Descriptions.Item>
                          </Descriptions>
                        </motion.div>
                      </Col>

                      {/* Financial Info */}
                      <Col xs={24}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCardOutlined className="text-purple-500" />
                            Finansal Bilgiler
                          </h3>
                          <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                              <motion.div whileHover={{ scale: 1.05, y: -5 }}>
                                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                                  <Statistic
                                    title={<span className="font-semibold">Kredi Limiti</span>}
                                    value={customer.creditLimit}
                                    prefix="₺"
                                    valueStyle={{ color: '#1890ff', fontSize: '1.5rem' }}
                                  />
                                </Card>
                              </motion.div>
                            </Col>
                            <Col xs={24} md={8}>
                              <motion.div whileHover={{ scale: 1.05, y: -5 }}>
                                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
                                  <Statistic
                                    title={<span className="font-semibold">Kullanılan Kredi</span>}
                                    value={customer.totalPurchases}
                                    prefix="₺"
                                    valueStyle={{ color: '#52c41a', fontSize: '1.5rem' }}
                                  />
                                </Card>
                              </motion.div>
                            </Col>
                            <Col xs={24} md={8}>
                              <motion.div whileHover={{ scale: 1.05, y: -5 }}>
                                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
                                  <Statistic
                                    title={<span className="font-semibold">Kalan Kredi</span>}
                                    value={availableCredit}
                                    prefix="₺"
                                    valueStyle={{ color: '#722ed1', fontSize: '1.5rem' }}
                                  />
                                </Card>
                              </motion.div>
                            </Col>
                          </Row>
                        </motion.div>
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
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <Card
                            className="hover:shadow-2xl transition-all border-l-4 border-l-blue-500 cursor-pointer"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-bold text-gray-800">{order.id}</h4>
                                  <Tag color="blue">{order.items} ürün</Tag>
                                </div>
                                <div className="flex items-center gap-4 flex-wrap">
                                  <span className="text-gray-600 flex items-center gap-1">
                                    <CalendarOutlined className="text-blue-500" />
                                    {new Date(order.date).toLocaleDateString('tr-TR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  <span className="text-xl font-bold text-green-600">
                                    ₺{order.amount.toLocaleString('tr-TR')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge status={order.statusColor as any} text={order.status} />
                                <Button type="link" icon={<EyeOutlined />}>Detay</Button>
                              </div>
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
                      mode="left"
                      items={timelineData.map((item, index) => ({
                        color: item.color,
                        dot: item.icon,
                        children: (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <Card size="small" className="shadow-md hover:shadow-lg transition-shadow">
                              <p className="font-bold text-gray-800 text-base mb-1">{item.title}</p>
                              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">{item.time}</span>
                                {item.amount && (
                                  <span className="text-green-600 font-bold text-sm">{item.amount}</span>
                                )}
                              </div>
                            </Card>
                          </motion.div>
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
                        <span className="text-gray-500 text-base">
                          Henüz döküman bulunmuyor
                        </span>
                      }
                    >
                      <Button type="primary" icon={<FileTextOutlined />} size="large">
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
