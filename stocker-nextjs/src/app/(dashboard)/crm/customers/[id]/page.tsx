'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Avatar, Tag, Button, Tabs, Timeline, Progress, Statistic, Row, Col, Badge, Descriptions, Empty, Divider, Tooltip, Space, Alert, FloatButton, Modal, Form, Input, Select, InputNumber, Skeleton } from 'antd';
import { showSuccess, showError } from '@/lib/utils/notifications';
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
  HomeOutlined,
  FileOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer, useDeleteCustomer, useUpdateCustomer } from '@/hooks/useCRM';
import { useActivities } from '@/lib/api/hooks/useCRM';
import { DocumentUpload } from '@/components/crm/shared';
import { CustomerTags } from '@/components/crm/customers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

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

  // Fetch customer activities
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({
    customerId: customerId,
  });

  // Handle edit customer
  const handleEdit = async (values: any) => {
    try {
      await updateCustomer.mutateAsync({
        id: customerId,
        data: values,
      });
      showSuccess('Müşteri bilgileri başarıyla güncellendi!');
      setIsEditModalOpen(false);
    } catch (error) {
      showError('Müşteri güncellenirken bir hata oluştu');
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

  // Activity type to icon/color mapping
  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Call: <PhoneOutlined />,
      Email: <MailOutlined />,
      Meeting: <TeamOutlined />,
      Task: <FileTextOutlined />,
      Note: <FileTextOutlined />,
      Document: <FileOutlined />,
    };
    return iconMap[type] || <ClockCircleOutlined />;
  };

  const getActivityColor = (type: string, status: string) => {
    if (status === 'Completed') return 'green';
    if (status === 'Cancelled') return 'red';

    const colorMap: Record<string, string> = {
      Call: 'blue',
      Email: 'cyan',
      Meeting: 'green',
      Task: 'orange',
      Note: 'gray',
      Document: 'purple',
    };
    return colorMap[type] || 'blue';
  };

  // Real timeline data from activities
  const timelineData = activitiesData?.items?.map((activity: any) => ({
    color: getActivityColor(activity.type, activity.status),
    icon: getActivityIcon(activity.type),
    title: activity.subject || activity.title,
    description: activity.description || `${activity.type} aktivitesi`,
    time: dayjs(activity.createdAt).fromNow(),
    status: activity.status,
  })) || [];

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
              showSuccess('Link panoya kopyalandı!');
            }).catch(() => {
              showError('Link kopyalanamadı');
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

      {/* Clean Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Avatar + Name + Status */}
          <div className="flex items-center gap-4">
            <Avatar
              size={64}
              icon={<ShopOutlined />}
              className={`${
                customer.isActive
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
              }`}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {customer.companyName}
              </h1>
              <div className="flex items-center gap-2">
                <Tag
                  color={customer.isActive ? 'success' : 'default'}
                  className="m-0"
                >
                  {customer.isActive ? '✓ Aktif' : '✗ Pasif'}
                </Tag>
                {customer.industry && (
                  <Tag color="blue" className="m-0">
                    {customer.industry}
                  </Tag>
                )}
              </div>
            </div>
          </div>

          {/* Right: Edit Button */}
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
          >
            Düzenle
          </Button>
        </div>

        {/* Tags Section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <CustomerTags customerId={customer.id} editable={true} size="default" />
        </div>
      </motion.div>

      {/* Clean Stats Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">Kişi Sayısı</span>}
                value={customer.contacts?.length || 0}
                valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
              />
              <div className="text-xs text-gray-400 mt-2">Kayıtlı Kişiler</div>
            </Card>
          </Col>

          {customer.annualRevenue && (
            <Col xs={24} sm={12} lg={6}>
              <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={<span className="text-gray-500 text-sm">Yıllık Gelir</span>}
                  value={customer.annualRevenue}
                  prefix="₺"
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
                />
                <div className="text-xs text-gray-400 mt-2">Firma Cirosu</div>
              </Card>
            </Col>
          )}

          {customer.numberOfEmployees && (
            <Col xs={24} sm={12} lg={6}>
              <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <Statistic
                  title={<span className="text-gray-500 text-sm">Çalışan Sayısı</span>}
                  value={customer.numberOfEmployees}
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
                />
                <div className="text-xs text-gray-400 mt-2">Toplam Çalışan</div>
              </Card>
            </Col>
          )}

          <Col xs={24} sm={12} lg={6}>
            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">Sağlık Skoru</span>}
                value={healthScore}
                suffix="/100"
                valueStyle={{ color: healthScore > 70 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444', fontWeight: 'bold', fontSize: '2rem' }}
              />
              <div className="text-xs font-medium mt-2" style={{ color: healthScore > 70 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444' }}>
                {healthScore > 70 ? 'Mükemmel' : healthScore > 50 ? 'İyi' : 'Geliştirilmeli'}
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* AI Insights Card */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-white border-l-4 border-blue-500 rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💡</span>
              <h3 className="text-lg font-semibold text-blue-600">Akıllı İçgörü</h3>
            </div>
            <Row gutter={[16, 16]}>
              {insights.map((insight, index) => (
                <Col xs={24} md={12} key={index}>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium">{insight.title}:</span> {insight.description}
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </motion.div>
      )}

      {/* Tabs Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="shadow-sm border border-gray-100">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            items={[
              {
                key: 'overview',
                label: (
                  <span className="flex items-center gap-2">
                    <HomeOutlined />
                    Genel Bakış
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <Row gutter={[24, 24]}>
                      {/* Contact & Address */}
                      <Col xs={24}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <GlobalOutlined className="text-blue-500" />
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
                            {customer.website && (
                              <Descriptions.Item label={<><GlobalOutlined /> Website</>} labelStyle={{ fontWeight: 'bold' }}>
                                <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {customer.website}
                                </a>
                              </Descriptions.Item>
                            )}
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
                              <FileTextOutlined className="text-blue-500" />
                              Açıklama
                            </h3>
                            <Card className="bg-gray-50 border border-gray-200 shadow-sm">
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
                    <UnorderedListOutlined />
                    Aktiviteler
                  </span>
                ),
                children: (
                  <div className="py-4">
                    {activitiesLoading ? (
                      <div className="space-y-4">
                        <Skeleton active />
                        <Skeleton active />
                        <Skeleton active />
                      </div>
                    ) : timelineData.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <span className="text-gray-500 text-base">
                            Henüz aktivite bulunmuyor
                          </span>
                        }
                      >
                        <Button type="dashed" icon={<ClockCircleOutlined />}>
                          Yeni Aktivite Oluştur
                        </Button>
                      </Empty>
                    ) : (
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
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-bold text-gray-800 text-base">{item.title}</p>
                                  <Tag color={item.color}>{item.status}</Tag>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400 text-xs">{item.time}</span>
                                </div>
                              </Card>
                            </motion.div>
                          ),
                      }))}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: 'documents',
                label: (
                  <span className="flex items-center gap-2">
                    <FileOutlined />
                    Dokümanlar
                  </span>
                ),
                children: (
                  <div className="py-4">
                    <DocumentUpload
                      entityId={customer.id}
                      entityType="Customer"
                      maxFileSize={10}
                      allowedFileTypes={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'jpeg']}
                    />
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
