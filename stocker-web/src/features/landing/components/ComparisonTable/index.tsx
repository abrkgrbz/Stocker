import React, { useState } from 'react';
import { Typography, Tag, Card, Row, Col, Button, Space, Badge, Divider, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  StarFilled,
  TeamOutlined,
  CloudOutlined,
  ApiOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  FileProtectOutlined,
  DashboardOutlined,
  SettingOutlined,
  MinusOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './style.css';

const { Title, Paragraph, Text } = Typography;

const plansData = [
  {
    key: 'starter',
    name: 'Başlangıç',
    description: 'Küçük işletmeler ve yeni başlayanlar için',
    price: 499,
    period: 'ay',
    icon: <RocketOutlined />,
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    popular: false,
    savings: null,
    features: {
      included: [
        { icon: <TeamOutlined />, text: '5 Kullanıcı' },
        { icon: <CloudOutlined />, text: '10 GB Depolama' },
        { icon: <DashboardOutlined />, text: '3 Ana Modül (CRM, Stok, Satış)' },
        { icon: <FileProtectOutlined />, text: 'Temel Raporlar' },
        { icon: <CustomerServiceOutlined />, text: 'E-posta Desteği' },
        { icon: <SafetyOutlined />, text: 'Günlük Yedekleme' }
      ],
      notIncluded: [
        'E-Fatura Entegrasyonu',
        'API Erişimi',
        '7/24 Telefon Destek',
        'Finans & Muhasebe Modülü'
      ]
    }
  },
  {
    key: 'professional',
    name: 'Profesyonel',
    description: 'Büyüyen işletmeler için tam kapsamlı çözüm',
    price: 999,
    period: 'ay',
    icon: <ThunderboltOutlined />,
    color: '#764ba2',
    gradient: 'linear-gradient(135deg, #764ba2, #f093fb)',
    popular: true,
    savings: 'En popüler seçim',
    features: {
      included: [
        { icon: <TeamOutlined />, text: '25 Kullanıcı' },
        { icon: <CloudOutlined />, text: '100 GB Depolama' },
        { icon: <DashboardOutlined />, text: 'Tüm Standart Modüller (5 Modül)' },
        { icon: <ApiOutlined />, text: 'API Erişimi' },
        { icon: <FileProtectOutlined />, text: 'Gelişmiş Raporlar & Analizler' },
        { icon: <CustomerServiceOutlined />, text: '7/24 Telefon & Canlı Destek' },
        { icon: <SafetyOutlined />, text: 'E-Fatura & E-Arşiv' },
        { icon: <SettingOutlined />, text: '3 E-Ticaret Entegrasyonu' }
      ],
      notIncluded: [
        'Üretim Planlama Modülü',
        'Multi-Şirket Yönetimi',
        'White Label',
        'Özel Sunucu'
      ]
    }
  },
  {
    key: 'enterprise',
    name: 'Kurumsal',
    description: 'Büyük ölçekli işletmeler için özel çözümler',
    price: null,
    customPrice: 'Özel Fiyat',
    period: '',
    icon: <CrownOutlined />,
    color: '#f093fb',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    popular: false,
    savings: 'En kapsamlı paket',
    features: {
      included: [
        { icon: <TeamOutlined />, text: 'Sınırsız Kullanıcı' },
        { icon: <CloudOutlined />, text: 'Sınırsız Depolama' },
        { icon: <DashboardOutlined />, text: 'Tüm Modüller + Özel Modüller' },
        { icon: <ApiOutlined />, text: 'Gelişmiş API & Webhook' },
        { icon: <FileProtectOutlined />, text: 'Özel Raporlar & BI Entegrasyonu' },
        { icon: <CustomerServiceOutlined />, text: 'Özel Hesap Yöneticisi' },
        { icon: <SafetyOutlined />, text: 'SLA Garantisi (%99.9 Uptime)' },
        { icon: <SettingOutlined />, text: 'Sınırsız Entegrasyon' },
        { icon: <CrownOutlined />, text: 'White Label Seçeneği' },
        { icon: <CloudOutlined />, text: 'Özel Sunucu (On-Premise)' }
      ],
      notIncluded: []
    }
  }
];

const comparisonData = [
  {
    category: 'Temel Özellikler',
    icon: <DashboardOutlined />,
    features: [
      { 
        name: 'Kullanıcı Sayısı', 
        starter: '5', 
        professional: '25', 
        enterprise: 'Sınırsız',
        highlight: true 
      },
      { 
        name: 'Depolama Alanı', 
        starter: '10 GB', 
        professional: '100 GB', 
        enterprise: 'Sınırsız',
        highlight: true 
      },
      { 
        name: 'Aylık İşlem Sayısı', 
        starter: '1,000', 
        professional: '10,000', 
        enterprise: 'Sınırsız' 
      },
      { 
        name: 'Veri Yedekleme', 
        starter: 'Günlük', 
        professional: 'Saatlik', 
        enterprise: 'Gerçek Zamanlı' 
      },
      { 
        name: 'Kullanıcı Rolleri', 
        starter: '3 Rol', 
        professional: '10 Rol', 
        enterprise: 'Sınırsız' 
      }
    ]
  },
  {
    category: 'ERP Modülleri',
    icon: <AppstoreOutlined />,
    features: [
      { name: 'CRM Modülü', starter: true, professional: true, enterprise: true },
      { name: 'Stok Yönetimi', starter: true, professional: true, enterprise: true },
      { name: 'Satış & Faturalama', starter: true, professional: true, enterprise: true },
      { name: 'Finans & Muhasebe', starter: false, professional: true, enterprise: true, highlight: true },
      { name: 'İnsan Kaynakları', starter: false, professional: true, enterprise: true },
      { name: 'Üretim Planlama', starter: false, professional: false, enterprise: true, highlight: true },
      { name: 'Proje Yönetimi', starter: false, professional: true, enterprise: true },
      { name: 'Lojistik Yönetimi', starter: false, professional: false, enterprise: true }
    ]
  },
  {
    category: 'Entegrasyonlar',
    icon: <ApiOutlined />,
    features: [
      { name: 'E-Fatura / E-Arşiv', starter: false, professional: true, enterprise: true, highlight: true },
      { name: 'E-Ticaret Platformları', starter: false, professional: '3 Adet', enterprise: 'Sınırsız' },
      { name: 'Banka Entegrasyonu', starter: false, professional: true, enterprise: true },
      { name: 'Kargo Entegrasyonu', starter: false, professional: true, enterprise: true },
      { name: 'Muhasebe Yazılımları', starter: false, professional: true, enterprise: true },
      { name: 'API Erişimi', starter: false, professional: true, enterprise: true, highlight: true },
      { name: 'Webhook Desteği', starter: false, professional: false, enterprise: true },
      { name: 'Özel Entegrasyon', starter: false, professional: false, enterprise: true }
    ]
  },
  {
    category: 'Destek & Hizmetler',
    icon: <CustomerServiceOutlined />,
    features: [
      { name: 'E-posta Desteği', starter: true, professional: true, enterprise: true },
      { name: 'Telefon Desteği', starter: false, professional: true, enterprise: true },
      { name: '7/24 Canlı Destek', starter: false, professional: true, enterprise: true, highlight: true },
      { name: 'Uzaktan Bağlantı Destek', starter: false, professional: true, enterprise: true },
      { name: 'Özel Hesap Yöneticisi', starter: false, professional: false, enterprise: true, highlight: true },
      { name: 'Ücretsiz Eğitim', starter: 'Video', professional: 'Video + Webinar', enterprise: 'Yerinde Eğitim' },
      { name: 'SLA Garantisi', starter: false, professional: false, enterprise: '%99.9' },
      { name: 'Öncelikli Destek', starter: false, professional: false, enterprise: true }
    ]
  },
  {
    category: 'Gelişmiş Özellikler',
    icon: <SettingOutlined />,
    features: [
      { name: 'Özel Raporlar', starter: false, professional: true, enterprise: true },
      { name: 'BI Entegrasyonu', starter: false, professional: false, enterprise: true },
      { name: 'Multi-Şirket Yönetimi', starter: false, professional: false, enterprise: true, highlight: true },
      { name: 'White Label', starter: false, professional: false, enterprise: true, highlight: true },
      { name: 'Özel Geliştirme', starter: false, professional: false, enterprise: true },
      { name: 'Özel Sunucu (On-Premise)', starter: false, professional: false, enterprise: true },
      { name: 'Veri İmport/Export API', starter: false, professional: true, enterprise: true },
      { name: 'SSO (Single Sign-On)', starter: false, professional: false, enterprise: true }
    ]
  }
];


const plans = [
  {
    key: 'starter',
    name: 'Başlangıç',
    price: 499,
    icon: <RocketOutlined />,
    color: '#667eea',
    popular: false
  },
  {
    key: 'professional',
    name: 'Profesyonel',
    price: 999,
    icon: <ThunderboltOutlined />,
    color: '#764ba2',
    popular: true
  },
  {
    key: 'enterprise',
    name: 'Kurumsal',
    price: 'Özel Fiyat',
    icon: <CrownOutlined />,
    color: '#f093fb',
    popular: false
  }
];

export const ComparisonTable: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'detailed'>('overview');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Temel Özellikler');

  const renderFeatureValue = (value: boolean | string | number) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
      ) : (
        <MinusOutlined style={{ color: '#cbd5e0', fontSize: '20px' }} />
      );
    }
    return <Text strong style={{ color: '#2d3748', fontSize: '14px' }}>{value}</Text>;
  };

  return (
    <section className="comparison-section" id="comparison" style={{ 
      padding: '100px 0', 
      background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)' 
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <Tag color="purple" style={{ marginBottom: 16, padding: '6px 16px', fontSize: '14px' }}>
            <StarFilled /> Karşılaştırma
          </Tag>
          <Title level={2} style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>
            Size En Uygun Planı Seçin
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#718096', maxWidth: '600px', margin: '0 auto' }}>
            İhtiyacınıza göre esnek fiyatlandırma seçenekleri
          </Paragraph>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <Space size="large">
            <Button
              size="large"
              type={selectedTab === 'overview' ? 'primary' : 'default'}
              onClick={() => setSelectedTab('overview')}
              style={{
                padding: '0 32px',
                height: '48px',
                fontSize: '16px',
                borderRadius: '8px',
                ...(selectedTab === 'overview' && {
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none'
                })
              }}
            >
              Genel Bakış
            </Button>
            <Button
              size="large"
              type={selectedTab === 'detailed' ? 'primary' : 'default'}
              onClick={() => setSelectedTab('detailed')}
              style={{
                padding: '0 32px',
                height: '48px',
                fontSize: '16px',
                borderRadius: '8px',
                ...(selectedTab === 'detailed' && {
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none'
                })
              }}
            >
              Detaylı Karşılaştırma
            </Button>
          </Space>
        </motion.div>

        {/* Overview Tab */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Row gutter={[32, 32]}>
                {plansData.map((plan, index) => (
                  <Col xs={24} md={8} key={plan.key}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        hoverable
                        style={{
                          height: '100%',
                          borderRadius: '20px',
                          border: plan.popular ? `2px solid ${plan.color}` : '1px solid #e2e8f0',
                          position: 'relative',
                          overflow: 'visible',
                          transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: plan.popular 
                            ? '0 20px 60px rgba(102, 126, 234, 0.2)'
                            : '0 4px 20px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={(e) => {
                          if (!plan.popular) {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!plan.popular) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                          }
                        }}
                      >
                        {plan.popular && (
                          <div style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1
                          }}>
                            <Badge 
                              count="EN POPÜLER" 
                              style={{ 
                                background: plan.gradient,
                                fontSize: '12px',
                                padding: '4px 16px',
                                height: 'auto',
                                borderRadius: '12px',
                                fontWeight: '600'
                              }} 
                            />
                          </div>
                        )}

                        {/* Plan Header */}
                        <div style={{
                          background: plan.gradient,
                          padding: '32px',
                          borderRadius: '20px 20px 0 0',
                          textAlign: 'center',
                          color: 'white'
                        }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            {plan.icon}
                          </div>
                          <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
                            {plan.name}
                          </Title>
                          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                            {plan.description}
                          </Paragraph>
                        </div>

                        {/* Price Section */}
                        <div style={{ padding: '32px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                          {plan.price ? (
                            <div>
                              <span style={{ fontSize: '24px', color: '#718096' }}>₺</span>
                              <span style={{ fontSize: '48px', fontWeight: '700', color: '#2d3748' }}>
                                {plan.price}
                              </span>
                              <span style={{ fontSize: '18px', color: '#718096' }}>/{plan.period}</span>
                              {plan.savings && (
                                <div style={{ marginTop: '8px' }}>
                                  <Tag color={plan.popular ? 'green' : 'blue'}>{plan.savings}</Tag>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span style={{ fontSize: '32px', fontWeight: '600', color: '#2d3748' }}>
                                {plan.customPrice}
                              </span>
                              {plan.savings && (
                                <div style={{ marginTop: '8px' }}>
                                  <Tag color="purple">{plan.savings}</Tag>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Features List */}
                        <div style={{ padding: '32px' }}>
                          <div style={{ marginBottom: '24px' }}>
                            <Text strong style={{ fontSize: '14px', color: '#718096', textTransform: 'uppercase' }}>
                              Dahil Özellikler
                            </Text>
                          </div>
                          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {plan.features.included.slice(0, 6).map((feature, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px', flexShrink: 0 }} />
                                <Text style={{ fontSize: '14px', color: '#2d3748' }}>
                                  {typeof feature === 'string' ? feature : feature.text}
                                </Text>
                              </div>
                            ))}
                          </Space>

                          {plan.features.notIncluded.length > 0 && (
                            <>
                              <Divider />
                              <Space direction="vertical" size="small" style={{ width: '100%', opacity: 0.5 }}>
                                {plan.features.notIncluded.slice(0, 3).map((feature, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CloseCircleOutlined style={{ color: '#cbd5e0', fontSize: '18px', flexShrink: 0 }} />
                                    <Text style={{ fontSize: '14px', color: '#a0aec0', textDecoration: 'line-through' }}>
                                      {feature}
                                    </Text>
                                  </div>
                                ))}
                              </Space>
                            </>
                          )}
                        </div>

                        {/* CTA Button */}
                        <div style={{ padding: '0 32px 32px' }}>
                          <Button
                            type={plan.popular ? 'primary' : 'default'}
                            size="large"
                            block
                            style={{
                              height: '56px',
                              fontSize: '16px',
                              fontWeight: '600',
                              borderRadius: '12px',
                              ...(plan.popular && {
                                background: plan.gradient,
                                border: 'none'
                              })
                            }}
                            onClick={() => {
                              if (plan.key === 'enterprise') {
                                window.location.href = 'mailto:sales@stocker.app';
                              } else {
                                window.location.href = '/register';
                              }
                            }}
                          >
                            {plan.key === 'enterprise' ? 'Teklif Al' : 'Hemen Başla'}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          )}

          {/* Detailed Comparison Tab */}
          {selectedTab === 'detailed' && (
            <motion.div
              key="detailed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
                }}
              >
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  background: 'linear-gradient(135deg, #667eea15, #764ba210)',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <div style={{ padding: '24px', borderRight: '1px solid #e2e8f0' }}>
                    <Text strong style={{ fontSize: '16px', color: '#2d3748' }}>Özellikler</Text>
                  </div>
                  {plansData.map(plan => (
                    <div key={plan.key} style={{ 
                      padding: '24px', 
                      textAlign: 'center',
                      borderRight: '1px solid #e2e8f0',
                      background: plan.popular ? `${plan.color}10` : 'transparent'
                    }}>
                      <div style={{ fontSize: '24px', color: plan.color, marginBottom: '8px' }}>
                        {plan.icon}
                      </div>
                      <Text strong style={{ fontSize: '16px', color: '#2d3748' }}>{plan.name}</Text>
                      {plan.popular && (
                        <div style={{ marginTop: '4px' }}>
                          <Tag color={plan.color} style={{ fontSize: '10px' }}>POPÜLER</Tag>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Table Body */}
                <div>
                  {comparisonData.map((category, catIndex) => (
                    <div key={catIndex}>
                      <div
                        onClick={() => setExpandedCategory(
                          expandedCategory === category.category ? null : category.category
                        )}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr',
                          background: '#f7fafc',
                          borderBottom: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#edf2f7';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f7fafc';
                        }}
                      >
                        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '20px', color: '#667eea' }}>{category.icon}</span>
                          <Text strong style={{ fontSize: '14px', color: '#4a5568' }}>
                            {category.category}
                          </Text>
                          <Tag style={{ marginLeft: 'auto' }}>{category.features.length} özellik</Tag>
                        </div>
                        <div style={{ gridColumn: 'span 3', padding: '16px' }} />
                      </div>

                      <AnimatePresence>
                        {expandedCategory === category.category && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {category.features.map((feature, featIndex) => (
                              <div
                                key={featIndex}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                  borderBottom: '1px solid #e2e8f0',
                                  background: feature.highlight ? '#fffbf0' : 'white'
                                }}
                              >
                                <div style={{ 
                                  padding: '16px 24px', 
                                  paddingLeft: '60px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <Text style={{ fontSize: '14px', color: '#4a5568' }}>
                                    {feature.name}
                                  </Text>
                                  {feature.highlight && (
                                    <Tag color="orange" style={{ fontSize: '10px' }}>YENİ</Tag>
                                  )}
                                </div>
                                <div style={{ padding: '16px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                                  {renderFeatureValue(feature.starter)}
                                </div>
                                <div style={{ 
                                  padding: '16px', 
                                  textAlign: 'center', 
                                  borderLeft: '1px solid #e2e8f0',
                                  background: plansData[1].popular ? '#667eea05' : 'transparent'
                                }}>
                                  {renderFeatureValue(feature.professional)}
                                </div>
                                <div style={{ padding: '16px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                                  {renderFeatureValue(feature.enterprise)}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: '80px', textAlign: 'center' }}
        >
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea15, #764ba210)',
              border: 'none',
              borderRadius: '20px',
              padding: '48px'
            }}
          >
            <Title level={3} style={{ marginBottom: '16px' }}>
              Hangi plan size uygun?
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#718096', maxWidth: '600px', margin: '0 auto 32px' }}>
              İhtiyacınızı tam olarak belirleyemiyorsanız, uzman ekibimiz size en uygun çözümü önermekten mutluluk duyar.
            </Paragraph>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<CustomerServiceOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  height: '56px',
                  padding: '0 40px',
                  fontSize: '16px',
                  borderRadius: '12px'
                }}
                onClick={() => window.location.href = '/demo'}
              >
                Ücretsiz Demo Talebi
              </Button>
              <Button
                size="large"
                style={{
                  height: '56px',
                  padding: '0 40px',
                  fontSize: '16px',
                  borderRadius: '12px'
                }}
                onClick={() => window.location.href = '/pricing-calculator'}
              >
                Fiyat Hesaplayıcı
              </Button>
            </Space>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};