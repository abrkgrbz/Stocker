import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Tag, Space, Switch, List, Tooltip, Badge, Tabs, message } from 'antd';
import {
  RocketOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  StarFilled,
  UserOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  FireOutlined,
  GiftOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  ApiOutlined,
  CloudOutlined,
  TeamOutlined,
  DashboardOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PricingCalculator } from '../../components/PricingCalculator';
import './style.css';
import './pricing-fixes.css';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  discount?: string;
  popular?: boolean;
  enterprise?: boolean;
  icon: React.ReactNode;
  color: string;
  features: string[];
  limitations?: string[];
  userLimit?: string;
  storageLimit?: string;
  supportType: string;
  badge?: string;
}

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const pricingPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Başlangıç',
      description: 'Küçük işletmeler ve girişimciler için ideal',
      monthlyPrice: 299,
      yearlyPrice: 2990,
      discount: '2 Ay Ücretsiz',
      icon: <RocketOutlined />,
      color: '#52c41a',
      userLimit: '1-5 Kullanıcı',
      storageLimit: '10 GB',
      supportType: 'E-posta Desteği',
      features: [
        'Temel CRM Modülü',
        'Stok Yönetimi',
        'Faturalama',
        'Temel Raporlar',
        'Mobil Uygulama',
        'E-posta Desteği',
        'Aylık Güncelleme'
      ],
      limitations: [
        'Sınırlı Entegrasyon',
        'Temel Raporlama'
      ]
    },
    {
      id: 'professional',
      name: 'Profesyonel',
      description: 'Büyüyen işletmeler için kapsamlı çözüm',
      monthlyPrice: 599,
      yearlyPrice: 5990,
      discount: '2 Ay Ücretsiz',
      popular: true,
      badge: 'EN POPÜLER',
      icon: <StarFilled />,
      color: '#1890ff',
      userLimit: '6-20 Kullanıcı',
      storageLimit: '100 GB',
      supportType: '7/24 Telefon Desteği',
      features: [
        'Tüm Başlangıç Özellikleri',
        'Gelişmiş CRM',
        'İnsan Kaynakları',
        'Muhasebe Modülü',
        'E-Ticaret Entegrasyonları',
        'Özel Raporlar',
        'API Erişimi',
        '7/24 Telefon Desteği',
        'Haftalık Güncelleme',
        'Eğitim Videoları'
      ]
    },
    {
      id: 'business',
      name: 'İşletme',
      description: 'Kurumsal işletmeler için güçlü araçlar',
      monthlyPrice: 999,
      yearlyPrice: 9990,
      discount: '2 Ay Ücretsiz',
      icon: <CrownOutlined />,
      color: '#722ed1',
      userLimit: '21-50 Kullanıcı',
      storageLimit: '500 GB',
      supportType: 'Özel Müşteri Temsilcisi',
      features: [
        'Tüm Profesyonel Özellikleri',
        'Üretim Modülü',
        'Proje Yönetimi',
        'İleri Düzey Analitik',
        'Çoklu Şube Yönetimi',
        'Özel Entegrasyonlar',
        'Veri Yedekleme',
        'Özel Müşteri Temsilcisi',
        'Günlük Güncelleme',
        'Yerinde Eğitim'
      ]
    },
    {
      id: 'enterprise',
      name: 'Kurumsal',
      description: 'Büyük ölçekli kurumlar için özel çözümler',
      monthlyPrice: 0,
      yearlyPrice: 0,
      enterprise: true,
      icon: <ThunderboltOutlined />,
      color: '#f5222d',
      userLimit: 'Sınırsız Kullanıcı',
      storageLimit: 'Sınırsız',
      supportType: 'Premium 7/24 Destek',
      badge: 'ÖZEL FİYAT',
      features: [
        'Tüm Özellikler Dahil',
        'Sınırsız Kullanıcı',
        'Sınırsız Depolama',
        'Özel Geliştirme',
        'On-Premise Kurulum',
        'Beyaz Etiket Seçeneği',
        'SLA Garantisi',
        'Premium 7/24 Destek',
        'Özel Eğitim Programı',
        'Danışmanlık Hizmeti'
      ]
    }
  ];

  const addons = [
    {
      name: 'E-Ticaret Plus',
      description: 'Tüm pazaryeri entegrasyonları',
      price: 149,
      icon: <GlobalOutlined />
    },
    {
      name: 'Gelişmiş Analitik',
      description: 'AI destekli iş zekası raporları',
      price: 199,
      icon: <DashboardOutlined />
    },
    {
      name: 'Ekstra Depolama',
      description: 'Her 100 GB için',
      price: 49,
      icon: <CloudOutlined />
    },
    {
      name: 'Ek Kullanıcı',
      description: 'Her kullanıcı için',
      price: 29,
      icon: <TeamOutlined />
    }
  ];

  const comparisionFeatures = [
    { feature: 'CRM Modülü', starter: true, professional: true, business: true, enterprise: true },
    { feature: 'Stok Yönetimi', starter: true, professional: true, business: true, enterprise: true },
    { feature: 'Faturalama', starter: true, professional: true, business: true, enterprise: true },
    { feature: 'İnsan Kaynakları', starter: false, professional: true, business: true, enterprise: true },
    { feature: 'Muhasebe', starter: false, professional: true, business: true, enterprise: true },
    { feature: 'E-Ticaret', starter: false, professional: true, business: true, enterprise: true },
    { feature: 'Üretim', starter: false, professional: false, business: true, enterprise: true },
    { feature: 'Proje Yönetimi', starter: false, professional: false, business: true, enterprise: true },
    { feature: 'API Erişimi', starter: false, professional: true, business: true, enterprise: true },
    { feature: 'Özel Raporlar', starter: false, professional: true, business: true, enterprise: true },
    { feature: 'Çoklu Şube', starter: false, professional: false, business: true, enterprise: true },
    { feature: 'Veri Yedekleme', starter: 'Aylık', professional: 'Haftalık', business: 'Günlük', enterprise: 'Anlık' },
    { feature: '7/24 Destek', starter: false, professional: true, business: true, enterprise: true },
    { feature: 'Eğitim', starter: 'Video', professional: 'Video + Webinar', business: 'Yerinde', enterprise: 'Özel Program' }
  ];

  const faqs = [
    {
      question: 'Deneme sürümü var mı?',
      answer: '14 gün ücretsiz deneme sürümü sunuyoruz. Kredi kartı gerekmez.'
    },
    {
      question: 'Planımı daha sonra değiştirebilir miyim?',
      answer: 'Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz.'
    },
    {
      question: 'İptal politikanız nedir?',
      answer: 'İstediğiniz zaman iptal edebilirsiniz. Yıllık planlarda kalan süre için iade yapılır.'
    },
    {
      question: 'Kurulum ücreti var mı?',
      answer: 'Hayır, kurulum tamamen ücretsizdir ve ekibimiz size destek olur.'
    }
  ];

  const calculatePrice = (plan: PricingPlan) => {
    if (plan.enterprise) return 'Teklif Al';
    const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return `₺${price.toLocaleString('tr-TR')}`;
  };

  const calculateSavings = (plan: PricingPlan) => {
    if (plan.enterprise || billingPeriod === 'monthly') return null;
    const yearlyTotal = plan.yearlyPrice;
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - yearlyTotal;
    return savings > 0 ? `Yıllık ₺${savings.toLocaleString('tr-TR')} tasarruf` : null;
  };

  return (
    <Layout className="pricing-layout">
      <Header className="pricing-header">
        <div className="header-container">
          <div className="header-content">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/')}
              type="text"
              className="back-button"
            >
              Ana Sayfa
            </Button>
            <div className="logo-section" onClick={() => navigate('/')}>
              <RocketOutlined className="logo-icon" />
              <span className="logo-text">Stocker</span>
            </div>
          </div>
          <div className="header-actions">
            <Button onClick={() => navigate('/blog')}>Blog</Button>
            <Button onClick={() => navigate('/training')}>Eğitimler</Button>
            <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Ücretsiz Dene
            </Button>
          </div>
        </div>
      </Header>

      <Content className="pricing-content">
        {/* Hero Section */}
        <motion.section 
          className="pricing-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge.Ribbon text="🎁 Yıl Sonu İndirimi %20" color="red">
            <div className="hero-content">
              <Title level={1} className="hero-title">
                <span className="gradient-text">İşletmeniz İçin</span>
                <br />
                En Uygun Planı Seçin
              </Title>
              <Paragraph className="hero-description">
                14 gün ücretsiz deneme • Kredi kartı gerekmez • İstediğiniz zaman iptal edin
              </Paragraph>
              
              <div className="billing-container">
                <div className={`billing-toggle ${billingPeriod}`}>
                  <span 
                    className={billingPeriod === 'monthly' ? 'active' : ''}
                    onClick={() => setBillingPeriod('monthly')}
                  >
                    Aylık
                  </span>
                  <span 
                    className={billingPeriod === 'yearly' ? 'active' : ''}
                    onClick={() => setBillingPeriod('yearly')}
                  >
                    Yıllık
                  </span>
                </div>
                {billingPeriod === 'yearly' && (
                  <Tag color="green" className="save-tag">
                    <GiftOutlined /> %20 İndirim
                  </Tag>
                )}
              </div>
            </div>
          </Badge.Ribbon>
        </motion.section>

        {/* Trust Badges */}
        <section className="trust-section">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={8} md={6}>
              <div className="trust-item">
                <SafetyOutlined className="trust-icon" />
                <Text strong>SSL Güvenlik</Text>
                <Text type="secondary">256-bit Şifreleme</Text>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="trust-item">
                <CustomerServiceOutlined className="trust-icon" />
                <Text strong>7/24 Destek</Text>
                <Text type="secondary">Türkçe Destek Ekibi</Text>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="trust-item">
                <ApiOutlined className="trust-icon" />
                <Text strong>%99.9 Uptime</Text>
                <Text type="secondary">SLA Garantili</Text>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="trust-item">
                <GiftOutlined className="trust-icon" />
                <Text strong>14 Gün Deneme</Text>
                <Text type="secondary">Kredi Kartı Gerekmez</Text>
              </div>
            </Col>
          </Row>
        </section>

        {/* Pricing Cards */}
        <section className="pricing-cards-section">
          <Row gutter={[24, 24]} justify="center">
            {pricingPlans.map((plan, index) => (
              <Col xs={24} sm={12} lg={6} key={plan.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.enterprise ? 'enterprise' : ''}`}
                    hoverable
                    bordered={false}
                  >
                    {plan.badge && (
                      <div className="plan-badge">
                        <FireOutlined /> {plan.badge}
                      </div>
                    )}
                    
                    <div className="plan-header">
                      <div className="plan-icon" style={{ color: plan.color }}>
                        {plan.icon}
                      </div>
                      <Title level={3} className="plan-name">{plan.name}</Title>
                      <Paragraph className="plan-description">{plan.description}</Paragraph>
                    </div>

                    <div className="plan-price">
                      <div className="price-amount">
                        {plan.enterprise ? (
                          <span className="custom-price">Özel Fiyat</span>
                        ) : (
                          <>
                            <span className="currency">₺</span>
                            <span className="amount">
                              {billingPeriod === 'monthly' ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}
                            </span>
                            <span className="period">/ay</span>
                          </>
                        )}
                      </div>
                      {calculateSavings(plan) && (
                        <Text type="success" className="savings-text">
                          {calculateSavings(plan)}
                        </Text>
                      )}
                    </div>

                    <div className="plan-limits">
                      <Tag icon={<UserOutlined />}>{plan.userLimit}</Tag>
                      <Tag icon={<CloudOutlined />}>{plan.storageLimit}</Tag>
                    </div>

                    <List
                      className="plan-features"
                      dataSource={plan.features}
                      renderItem={item => (
                        <List.Item className="feature-item">
                          <CheckCircleOutlined className="feature-icon" />
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />

                    {plan.limitations && (
                      <div className="plan-limitations">
                        {plan.limitations.map((limit, idx) => (
                          <Text key={idx} type="secondary" className="limitation">
                            • {limit}
                          </Text>
                        ))}
                      </div>
                    )}

                    <Button
                      type={plan.popular ? 'primary' : 'default'}
                      size="large"
                      block
                      className={`plan-button ${plan.enterprise ? 'enterprise-button' : ''}`}
                      onClick={() => {
                        if (plan.enterprise) {
                          message.info('Satış ekibimiz sizinle iletişime geçecek');
                        } else {
                          navigate('/register');
                        }
                      }}
                    >
                      {plan.enterprise ? 'Teklif Al' : 'Hemen Başla'}
                    </Button>

                    <Text type="secondary" className="support-type">
                      <CustomerServiceOutlined /> {plan.supportType}
                    </Text>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </section>

        {/* Comparison Table */}
        <section className="comparison-section">
          <div className="section-header">
            <Title level={2}>Detaylı Özellik Karşılaştırması</Title>
            <Paragraph>Tüm planlarımızın özelliklerini karşılaştırın</Paragraph>
          </div>
          
          <Card className="comparison-card">
            <div className="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>Özellikler</th>
                    <th>Başlangıç</th>
                    <th>Profesyonel</th>
                    <th>İşletme</th>
                    <th>Kurumsal</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisionFeatures.map((item, index) => (
                    <tr key={index}>
                      <td className="feature-name">
                        <Text strong>{item.feature}</Text>
                      </td>
                      <td>
                        {typeof item.starter === 'boolean' ? (
                          item.starter ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} />
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <span style={{ color: '#d1d5db', fontSize: 24 }}>-</span>
                            </div>
                          )
                        ) : (
                          <Tag color="blue">{item.starter}</Tag>
                        )}
                      </td>
                      <td>
                        {typeof item.professional === 'boolean' ? (
                          item.professional ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} />
                          ) : (
                            <span className="not-included">-</span>
                          )
                        ) : (
                          <Tag color="blue">{item.professional}</Tag>
                        )}
                      </td>
                      <td>
                        {typeof item.business === 'boolean' ? (
                          item.business ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} />
                          ) : (
                            <span className="not-included">-</span>
                          )
                        ) : (
                          <Tag color="purple">{item.business}</Tag>
                        )}
                      </td>
                      <td>
                        {typeof item.enterprise === 'boolean' ? (
                          item.enterprise ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} />
                          ) : (
                            <span className="not-included">-</span>
                          )
                        ) : (
                          <Tag color="red">{item.enterprise}</Tag>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Pricing Calculator Section */}
        <section className="calculator-section" style={{ marginBottom: 80 }}>
          <div className="section-header">
            <Title level={2}>Özel Fiyatlandırma</Title>
            <Paragraph>İhtiyaçlarınıza göre kendi planınızı oluşturun</Paragraph>
          </div>
          <PricingCalculator />
        </section>

        {/* Add-ons Section */}
        <section className="addons-section">
          <div className="section-header">
            <Title level={2}>Ek Hizmetler</Title>
            <Paragraph>İhtiyacınıza göre planınızı özelleştirin</Paragraph>
          </div>
          
          <Row gutter={[24, 24]}>
            {addons.map((addon, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="addon-card" hoverable>
                  <div className="addon-icon" style={{ color: '#1890ff' }}>
                    {addon.icon}
                  </div>
                  <Title level={4}>{addon.name}</Title>
                  <Paragraph type="secondary">{addon.description}</Paragraph>
                  <div className="addon-price">
                    <Text strong style={{ fontSize: 20 }}>₺{addon.price}</Text>
                    <Text type="secondary">/ay</Text>
                  </div>
                  <Button type="link">Ekle →</Button>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="section-header">
            <Title level={2}>Sıkça Sorulan Sorular</Title>
          </div>
          
          <Row gutter={[32, 32]}>
            {faqs.map((faq, index) => (
              <Col xs={24} md={12} key={index}>
                <Card className="faq-card">
                  <Title level={4}>
                    <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    {faq.question}
                  </Title>
                  <Paragraph>{faq.answer}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* CTA Section */}
        <section className="pricing-cta">
          <Card className="cta-card">
            <Title level={2} style={{ color: 'white' }}>
              Hala Karar Veremediniz mi?
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>
              14 gün ücretsiz deneme sürümüyle başlayın. Kredi kartı gerekmez.
            </Paragraph>
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                icon={<RocketOutlined />}
                onClick={() => navigate('/register')}
                className="cta-button"
              >
                Ücretsiz Deneyin
              </Button>
              <Button 
                size="large"
                ghost
                style={{ color: 'white', borderColor: 'white' }}
                icon={<CustomerServiceOutlined />}
                onClick={() => message.info('Satış ekibimiz sizinle iletişime geçecek')}
              >
                Satış Ekibiyle Görüşün
              </Button>
            </Space>
          </Card>
        </section>
      </Content>
    </Layout>
  );
};