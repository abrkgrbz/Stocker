'use client';

import React from 'react';
import { Card, Row, Col, Typography, Tag, Switch, Button, Space, Tooltip, Statistic, Progress } from 'antd';
import {
  TeamOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  AppstoreAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

// Module definitions with features and pricing
const modules = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Müşteri İlişkileri Yönetimi',
    icon: <TeamOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
    color: '#1890ff',
    enabled: true,
    features: [
      'Müşteri Yönetimi',
      'Potansiyel Müşteriler',
      'Anlaşmalar & Fırsatlar',
      'Aktivite Takibi',
      'Satış Süreçleri',
      'Segmentasyon',
      'Kampanya Yönetimi',
    ],
    stats: {
      users: 156,
      records: '2.4K',
      growth: '+12%',
    },
    tier: 'premium',
  },
  {
    id: 'inventory',
    name: 'Stok Yönetimi',
    description: 'Envanter ve Depo Yönetimi',
    icon: <ShoppingCartOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
    color: '#52c41a',
    enabled: false,
    features: [
      'Ürün Yönetimi',
      'Depo Takibi',
      'Stok Hareketleri',
      'Barkod Sistemi',
      'Minimum Stok Uyarıları',
      'Lot & Seri No Takibi',
    ],
    stats: {
      users: 0,
      records: '0',
      growth: '-',
    },
    tier: 'standard',
  },
  {
    id: 'finance',
    name: 'Finans',
    description: 'Muhasebe ve Mali İşlemler',
    icon: <DollarCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />,
    color: '#faad14',
    enabled: false,
    features: [
      'Fatura Yönetimi',
      'Gelir/Gider Takibi',
      'Banka Hesapları',
      'Ödeme Takibi',
      'Vergi Raporları',
      'Muhasebe Entegrasyonu',
    ],
    stats: {
      users: 0,
      records: '0',
      growth: '-',
    },
    tier: 'premium',
  },
  {
    id: 'analytics',
    name: 'Raporlama',
    description: 'İş Zekası ve Analitik',
    icon: <BarChartOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
    color: '#722ed1',
    enabled: false,
    features: [
      'Dinamik Raporlar',
      'Dashboard Builder',
      'Veri Görselleştirme',
      'Tahmine Dayalı Analiz',
      'KPI Takibi',
      'Excel/PDF Export',
    ],
    stats: {
      users: 0,
      records: '0',
      growth: '-',
    },
    tier: 'enterprise',
  },
  {
    id: 'hrm',
    name: 'İnsan Kaynakları',
    description: 'Personel ve Bordro Yönetimi',
    icon: <TeamOutlined style={{ fontSize: 48, color: '#eb2f96' }} />,
    color: '#eb2f96',
    enabled: false,
    features: [
      'Personel Yönetimi',
      'Bordro Hesaplama',
      'Izin Takibi',
      'Performans Değerlendirme',
      'Eğitim Yönetimi',
      'Özlük Dosyası',
    ],
    stats: {
      users: 0,
      records: '0',
      growth: '-',
    },
    tier: 'standard',
  },
  {
    id: 'production',
    name: 'Üretim',
    description: 'Üretim Planlama ve Takip',
    icon: <SettingOutlined style={{ fontSize: 48, color: '#13c2c2' }} />,
    color: '#13c2c2',
    enabled: false,
    features: [
      'Üretim Emirleri',
      'Reçete Yönetimi',
      'Kapasite Planlama',
      'Kalite Kontrol',
      'Fire Takibi',
      'Makine Yönetimi',
    ],
    stats: {
      users: 0,
      records: '0',
      growth: '-',
    },
    tier: 'enterprise',
  },
];

const tierConfig = {
  standard: {
    name: 'Standard',
    icon: <CheckCircleOutlined />,
    color: '#52c41a',
    badge: 'success',
  },
  premium: {
    name: 'Premium',
    icon: <StarOutlined />,
    color: '#faad14',
    badge: 'warning',
  },
  enterprise: {
    name: 'Enterprise',
    icon: <CrownOutlined />,
    color: '#722ed1',
    badge: 'purple',
  },
};

export default function ModulesPage() {
  const handleToggleModule = (moduleId: string, enabled: boolean) => {
    console.log(`Toggle module ${moduleId}: ${enabled}`);
    // TODO: Implement module activation/deactivation API call
  };

  const activeModules = modules.filter(m => m.enabled).length;
  const totalModules = modules.length;
  const activationRate = ((activeModules / totalModules) * 100).toFixed(0);

  return (
    <div className="p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <Title level={2} className="!mb-2 !text-gray-800">
              Modüller
            </Title>
            <Text className="text-gray-500 text-base">
              İşletmeniz için gerekli modülleri aktifleştirin ve yönetin
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<AppstoreAddOutlined />}
          >
            Tüm Modülleri Keşfet
          </Button>
        </div>

        {/* Stats Overview */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic
                title="Aktif Modüller"
                value={activeModules}
                suffix={`/ ${totalModules}`}
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic
                title="Aktivasyon Oranı"
                value={activationRate}
                suffix="%"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <Progress
                percent={Number(activationRate)}
                showInfo={false}
                strokeColor="#52c41a"
                className="mt-2"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic
                title="Toplam Kullanıcı"
                value={modules.reduce((sum, m) => sum + m.stats.users, 0)}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Modules Grid */}
      <Row gutter={[24, 24]}>
        {modules.map((module, index) => {
          const tier = tierConfig[module.tier as keyof typeof tierConfig];

          return (
            <Col key={module.id} xs={24} lg={12} xl={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="h-full shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    borderTop: `4px solid ${module.color}`,
                    opacity: module.enabled ? 1 : 0.7,
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  {/* Module Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${module.color}15` }}
                      >
                        {module.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Title level={4} className="!mb-0">
                            {module.name}
                          </Title>
                          <Tag color={tier.badge} icon={tier.icon}>
                            {tier.name}
                          </Tag>
                        </div>
                        <Text className="text-gray-500">{module.description}</Text>
                      </div>
                    </div>
                    <Tooltip title={module.enabled ? 'Modülü Devre Dışı Bırak' : 'Modülü Aktifleştir'}>
                      <Switch
                        checked={module.enabled}
                        onChange={(checked) => handleToggleModule(module.id, checked)}
                      />
                    </Tooltip>
                  </div>

                  {/* Module Stats */}
                  {module.enabled && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <Row gutter={16}>
                        <Col span={8}>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-700">{module.stats.users}</div>
                            <div className="text-xs text-gray-500">Kullanıcı</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-700">{module.stats.records}</div>
                            <div className="text-xs text-gray-500">Kayıt</div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">{module.stats.growth}</div>
                            <div className="text-xs text-gray-500">Büyüme</div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* Features List */}
                  <div className="mb-4">
                    <Text strong className="text-gray-700 mb-2 block">Özellikler:</Text>
                    <div className="space-y-1">
                      {module.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircleOutlined style={{ color: module.color }} />
                          <Text className="text-gray-600">{feature}</Text>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <Space className="w-full" size="small">
                    {module.enabled ? (
                      <>
                        <Button
                          type="primary"
                          block
                          style={{ backgroundColor: module.color, borderColor: module.color }}
                        >
                          Modülü Aç
                        </Button>
                        <Button icon={<SettingOutlined />}>
                          Ayarlar
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="dashed"
                        block
                        icon={<RocketOutlined />}
                        onClick={() => handleToggleModule(module.id, true)}
                      >
                        Aktifleştir
                      </Button>
                    )}
                  </Space>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <Title level={4} className="!mb-2">Modül Yönetimi Hakkında</Title>
              <Paragraph className="text-gray-600 mb-0">
                Modüller işletmenizin ihtiyaçlarına göre aktif hale getirilebilir. Her modül kendi özellikleri
                ve fiyatlandırması ile gelir. Aktif olmayan modüller sistem kaynaklarını kullanmaz ve
                faturanıza yansımaz. İhtiyaç duyduğunuzda tek tıkla modülleri aktifleştirebilir veya
                devre dışı bırakabilirsiniz.
              </Paragraph>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
