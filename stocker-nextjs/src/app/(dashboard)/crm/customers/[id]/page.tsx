'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Avatar, Tag, Button, Tabs, Timeline, Progress, Statistic, Row, Col, Badge, Descriptions, Empty, Divider, Tooltip, Space, Alert, FloatButton, Modal, Form, Input, Select, InputNumber, notification, Skeleton } from 'antd';
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
import { useCustomer, useDeleteCustomer, useUpdateCustomer } from '@/hooks/useCRM';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch customer data from API
  const { data: customer, isLoading, error } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  // Handle edit customer
  const handleEdit = async (values: any) => {
    try {
      await updateCustomer.mutateAsync({
        id: customerId,
        data: values,
      });
      notification.success({
        message: 'Başarılı',
        description: 'Müşteri bilgileri başarıyla güncellendi!',
        placement: 'bottomRight',
      });
      setIsEditModalOpen(false);
    } catch (error) {
      notification.error({
        message: 'Hata',
        description: 'Müşteri güncellenirken bir hata oluştu',
        placement: 'bottomRight',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
        <Skeleton active />
        <Skeleton active className="mt-4" />
        <Skeleton active className="mt-4" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Müşteri Bulunamadı</h3>
          <p className="text-gray-500 mb-6">Aradığınız müşteri sistemde kayıtlı değil</p>
          <Button type="primary" size="large" onClick={() => router.push('/crm/customers')}>
            Müşteri Listesine Dön
          </Button>
        </Card>
      </div>
    );
  }

  // Status configuration based on isActive
  const statusConfig = customer.isActive
    ? { color: 'green', icon: <CheckCircleOutlined />, text: '✓ Aktif', badge: 'success' as const }
    : { color: 'default', icon: <ExclamationCircleOutlined />, text: '✕ Pasif', badge: 'default' as const };

  // Calculate metrics (mock values for now - will be replaced with real data from backend)
  const totalPurchases = 0;
  const creditLimit = 0;
  const creditUsagePercentage = '0';
  const availableCredit = 0;
  const averageOrderValue = 0;

  // Calculate health score (0-100)
  const healthScore = Math.min(100, Math.round(
    (customer.isActive ? 70 : 30) + // Status health
    30 // Base score
  ));

  // Industry color - hardcoded as API doesn't have industry field
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

    if (customer.status === 'Active') {
      insights.push({
        type: 'info',
        icon: <SmileOutlined />,
        title: 'Aktif İlişki',
        description: 'Müşteri aktif durumda. Düzenli iletişim ve takip önerilir.',
      });
    }

    return insights;
  };

  const insights = generateInsights();

  // Mock timeline data (will be replaced with real API data later)
  const timelineData = [
    {
      color: 'green',
      icon: <CheckCircleOutlined />,
      title: 'Müşteri Kaydı Oluşturuldu',
      description: 'Sistem kaydı tamamlandı',
      time: 'Bugün',
    },
  ];

  // Mock orders data (will be replaced with real API data later)
  const mockOrders: any[] = [];

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
        <FloatButton
          icon={<MessageOutlined />}
          tooltip="Mesaj Gönder"
          onClick={() => {
            notification.info({
              message: 'Mesajlaşma',
              description: 'Mesajlaşma özelliği yakında eklenecek',
              placement: 'bottomRight',
            });
          }}
        />
        <FloatButton
          icon={<PhoneOutlined />}
          tooltip="Ara"
          onClick={() => {
            if (customer.phone) {
              window.location.href = `tel:${customer.phone}`;
            } else {
              notification.warning({
                message: 'Telefon',
                description: 'Telefon numarası bulunamadı',
                placement: 'bottomRight',
              });
            }
          }}
        />
        <FloatButton
          icon={<MailOutlined />}
          tooltip="E-posta Gönder"
          onClick={() => {
            if (customer.email) {
              window.location.href = `mailto:${customer.email}`;
            } else {
              notification.warning({
                message: 'E-posta',
                description: 'E-posta adresi bulunamadı',
                placement: 'bottomRight',
              });
            }
          }}
        />
        <FloatButton
          icon={<PrinterOutlined />}
          tooltip="Yazdır"
          onClick={() => {
            window.print();
          }}
        />
        <FloatButton
          icon={<ShareAltOutlined />}
          tooltip="Paylaş"
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
              notification.success({
                message: 'Başarılı',
                description: 'Link panoya kopyalandı!',
                placement: 'bottomRight',
              });
            }).catch(() => {
              notification.error({
                message: 'Hata',
                description: 'Link kopyalanamadı',
                placement: 'bottomRight',
              });
            });
          }}
        />
      </FloatButton.Group>

      {/* Back Button */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Button
          type="text"
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/crm/customers')}
          className="hover:bg-white/50 backdrop-blur-sm"
        >
          Müşteri Listesine Dön
        </Button>
      </motion.div>

      {/* Header Card with Glassmorphism */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-2xl"
          style={{
            background: customer.isActive
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
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
                      customer.isActive
                        ? 'bg-gradient-to-br from-green-400 to-blue-500'
                        : 'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}
                  />
                  <motion.div
                    className={`absolute bottom-2 right-2 w-10 h-10 rounded-full border-4 border-white shadow-lg ${
                      customer.isActive ? 'bg-green-500' : 'bg-gray-400'
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
                      {customer.industry && (
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-semibold shadow-md flex items-center gap-2">
                          <ShopOutlined />
                          {customer.industry}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md ${
                        customer.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {customer.isActive ? '✓ Aktif' : '✗ Pasif'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md border-2 border-white/50 shadow-lg">
                        <MailOutlined className="text-white text-lg" />
                        <span className="text-sm text-white font-semibold">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md border-2 border-white/50 shadow-lg">
                        <PhoneOutlined className="text-white text-lg" />
                        <span className="text-sm text-white font-semibold">{customer.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md border-2 border-white/50 shadow-lg">
                        <EnvironmentOutlined className="text-white text-lg" />
                        <span className="text-sm text-white font-semibold truncate">{customer.city || 'N/A'}, {customer.state || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md border-2 border-white/50 shadow-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full shadow-md ${
                        customer.isActive ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                      <span className="text-white font-bold text-sm">{statusConfig.text}</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      size="large"
                      onClick={() => {
                        form.setFieldsValue({
                          companyName: customer.companyName,
                          email: customer.email,
                          phone: customer.phone,
                          website: customer.website,
                          industry: customer.industry,
                          address: customer.address,
                          city: customer.city,
                          state: customer.state,
                          country: customer.country,
                          postalCode: customer.postalCode,
                          annualRevenue: customer.annualRevenue,
                          numberOfEmployees: customer.numberOfEmployees,
                          description: customer.description,
                        });
                        setIsEditModalOpen(true);
                      }}
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
                  title={<span className="text-white flex items-center gap-2 text-base font-semibold"><UserOutlined /> Kişi Sayısı</span>}
                  value={customer.contacts?.length || 0}
                  valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}
                />
                <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />
                <div className="text-white text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Kayıtlı Kişiler</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {customer.annualRevenue && (
            <Col xs={24} sm={12} lg={6}>
              <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring' }}>
                <Card
                  className="shadow-xl border-0 h-full overflow-hidden relative"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <Statistic
                    title={<span className="text-white flex items-center gap-2 text-base font-semibold"><DollarOutlined /> Yıllık Gelir</span>}
                    value={customer.annualRevenue}
                    prefix="₺"
                    valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}
                  />
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />
                  <div className="text-white text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Firma Cirosu</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          )}

          {customer.numberOfEmployees && (
            <Col xs={24} sm={12} lg={6}>
              <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring' }}>
                <Card
                  className="shadow-xl border-0 h-full overflow-hidden relative"
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <Statistic
                    title={<span className="text-white flex items-center gap-2 text-base font-semibold"><TeamOutlined /> Çalışan Sayısı</span>}
                    value={customer.numberOfEmployees}
                    valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}
                  />
                  <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />
                  <div className="text-white text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Toplam Çalışan</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          )}

          <Col xs={24} sm={12} lg={6}>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring' }}>
              <Card
                className="shadow-xl border-0 h-full overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <Statistic
                  title={<span className="text-white flex items-center gap-2 text-base font-semibold"><TrophyOutlined /> Sağlık Skoru</span>}
                  value={healthScore}
                  suffix="/100"
                  valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}
                />
                <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '12px 0' }} />
                <div className="text-white text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Değerlendirme:</span>
                    <span className="font-bold">{healthScore > 70 ? 'Mükemmel' : healthScore > 50 ? 'İyi' : 'Geliştirilmeli'}</span>
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
                            {customer.industry && (
                              <Descriptions.Item label="Sektör" labelStyle={{ fontWeight: 'bold' }}>
                                <Tag color="blue">{customer.industry}</Tag>
                              </Descriptions.Item>
                            )}
                            {customer.website && (
                              <Descriptions.Item label="Website" labelStyle={{ fontWeight: 'bold' }}>
                                <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {customer.website}
                                </a>
                              </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Durum" labelStyle={{ fontWeight: 'bold' }}>
                              <Badge status={statusConfig.badge as any} text={statusConfig.text} />
                            </Descriptions.Item>
                            {customer.numberOfEmployees && (
                              <Descriptions.Item label="Çalışan Sayısı" labelStyle={{ fontWeight: 'bold' }}>
                                {customer.numberOfEmployees.toLocaleString('tr-TR')}
                              </Descriptions.Item>
                            )}
                            {customer.annualRevenue && (
                              <Descriptions.Item label="Yıllık Gelir" labelStyle={{ fontWeight: 'bold' }}>
                                ₺{customer.annualRevenue.toLocaleString('tr-TR')}
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
                                {customer.phone || 'N/A'}
                              </a>
                            </Descriptions.Item>
                            <Descriptions.Item label="Adres" labelStyle={{ fontWeight: 'bold' }}>
                              {customer.address || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><EnvironmentOutlined /> Şehir</>} labelStyle={{ fontWeight: 'bold' }}>
                              {customer.city || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="İlçe" labelStyle={{ fontWeight: 'bold' }}>
                              {customer.state || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ülke" labelStyle={{ fontWeight: 'bold' }}>
                              {customer.country || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Posta Kodu" labelStyle={{ fontWeight: 'bold' }}>
                              {customer.postalCode || '-'}
                            </Descriptions.Item>
                          </Descriptions>
                        </motion.div>
                      </Col>

                      {/* Description Section */}
                      {customer.description && (
                        <Col xs={24}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                          >
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <FileTextOutlined className="text-purple-500" />
                              Açıklama
                            </h3>
                            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg">
                              <p className="text-gray-700">{customer.description}</p>
                            </Card>
                          </motion.div>
                        </Col>
                      )}
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
                  <div className="py-16">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-gray-500 text-base">
                          Henüz sipariş bulunmuyor
                        </span>
                      }
                    >
                      <Button type="primary" icon={<ShoppingOutlined />} size="large">
                        Yeni Sipariş Oluştur
                      </Button>
                    </Empty>
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

      {/* Edit Customer Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-xl">
            <EditOutlined className="text-blue-600" />
            <span>Müşteri Bilgilerini Düzenle</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={800}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="companyName"
              label="Firma Adı"
              rules={[{ required: true, message: 'Firma adı gereklidir' }]}
            >
              <Input size="large" prefix={<ShopOutlined />} placeholder="Firma adı" />
            </Form.Item>

            <Form.Item
              name="email"
              label="E-posta"
              rules={[
                { required: true, message: 'E-posta gereklidir' },
                { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
              ]}
            >
              <Input size="large" prefix={<MailOutlined />} placeholder="ornek@firma.com" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Telefon"
            >
              <Input size="large" prefix={<PhoneOutlined />} placeholder="+90 555 123 4567" />
            </Form.Item>

            <Form.Item
              name="website"
              label="Website"
            >
              <Input size="large" prefix={<GlobalOutlined />} placeholder="https://www.firma.com" />
            </Form.Item>

            <Form.Item
              name="industry"
              label="Sektör"
            >
              <Input size="large" prefix={<ShopOutlined />} placeholder="Teknoloji" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Adres"
            >
              <Input size="large" prefix={<EnvironmentOutlined />} placeholder="Adres" />
            </Form.Item>

            <Form.Item
              name="city"
              label="Şehir"
            >
              <Input size="large" prefix={<EnvironmentOutlined />} placeholder="İstanbul" />
            </Form.Item>

            <Form.Item
              name="state"
              label="İlçe"
            >
              <Input size="large" placeholder="Kadıköy" />
            </Form.Item>

            <Form.Item
              name="country"
              label="Ülke"
            >
              <Input size="large" placeholder="Türkiye" />
            </Form.Item>

            <Form.Item
              name="postalCode"
              label="Posta Kodu"
            >
              <Input size="large" placeholder="34000" />
            </Form.Item>

            <Form.Item
              name="annualRevenue"
              label="Yıllık Gelir (₺)"
            >
              <InputNumber
                size="large"
                style={{ width: '100%' }}
                min={0}
                step={1000}
                formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => (value || '').replace(/₺\s?|(,*)/g, '')}
                placeholder="1,000,000"
              />
            </Form.Item>

            <Form.Item
              name="numberOfEmployees"
              label="Çalışan Sayısı"
            >
              <InputNumber
                size="large"
                style={{ width: '100%' }}
                min={0}
                step={1}
                placeholder="50"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea rows={4} placeholder="Müşteri hakkında notlar..." />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button size="large" onClick={() => setIsEditModalOpen(false)}>
              İptal
            </Button>
            <Button type="primary" size="large" htmlType="submit" icon={<EditOutlined />} loading={updateCustomer.isPending}>
              Güncelle
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
