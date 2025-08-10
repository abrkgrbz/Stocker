import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Row, Col, Typography, Space, Tag, Statistic, List, Avatar, Rate, Divider, Badge } from 'antd';
import {
  RocketOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  CloudOutlined,
  TeamOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  DashboardOutlined,
  ApiOutlined,
  MobileOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  StarFilled,
  UserOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  SettingOutlined,
  SyncOutlined,
  FileProtectOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import './style.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TeamOutlined style={{ fontSize: 32 }} />,
      title: 'Çoklu Kiracı Mimarisi',
      description: 'Her müşteri için izole edilmiş veri ve özelleştirilmiş deneyim. Tam güvenlik ve gizlilik.'
    },
    {
      icon: <AppstoreOutlined style={{ fontSize: 32 }} />,
      title: 'Modüler Yapı',
      description: 'İhtiyacınıza göre modül seçin. CRM, Stok, Muhasebe, İK ve daha fazlası.'
    },
    {
      icon: <CloudOutlined style={{ fontSize: 32 }} />,
      title: 'Bulut Tabanlı',
      description: 'Her yerden erişim. Kurulum gerektirmez, bakım maliyeti yoktur.'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32 }} />,
      title: 'Kurumsal Güvenlik',
      description: 'SSL şifreleme, günlük yedekleme ve KVKK uyumlu veri güvenliği.'
    },
    {
      icon: <ApiOutlined style={{ fontSize: 32 }} />,
      title: 'API Entegrasyonu',
      description: 'E-fatura, e-arşiv, kargo, pazaryeri ve banka entegrasyonları hazır.'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 32 }} />,
      title: 'Gelişmiş Raporlama',
      description: 'Anlık raporlar, özelleştirilebilir dashboard ve veri analitiği.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Başlangıç',
      price: 499,
      currency: '₺',
      period: 'ay',
      description: 'Küçük işletmeler için ideal',
      features: [
        '5 kullanıcıya kadar',
        'CRM modülü',
        'Stok takibi',
        '10 GB depolama',
        'E-posta desteği',
        'Temel raporlar',
        'Mobil uygulama'
      ],
      popular: false
    },
    {
      name: 'Profesyonel',
      price: 999,
      currency: '₺',
      period: 'ay',
      description: 'Büyüyen işletmeler için',
      features: [
        '25 kullanıcıya kadar',
        'CRM + Stok + Muhasebe',
        'E-fatura entegrasyonu',
        '100 GB depolama',
        'Öncelikli destek',
        'Gelişmiş raporlar',
        'API erişimi',
        'Özel eğitim'
      ],
      popular: true
    },
    {
      name: 'Kurumsal',
      price: 2499,
      currency: '₺',
      period: 'ay',
      description: 'Büyük organizasyonlar için',
      features: [
        'Sınırsız kullanıcı',
        'Tüm modüller dahil',
        'Tüm entegrasyonlar',
        'Sınırsız depolama',
        '7/24 VIP destek',
        'Özel geliştirmeler',
        'SLA garantisi',
        'Yerinde eğitim'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      role: 'Genel Müdür - TechnoSoft',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet',
      content: 'Stocker sayesinde 5 şubemizi tek bir sistemden yönetiyoruz. Stok takibi ve CRM modülleri işlerimizi kolaylaştırdı.',
      rating: 5
    },
    {
      name: 'Ayşe Kaya',
      role: 'Mali İşler Müdürü - KayalarGrup',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse',
      content: 'E-fatura entegrasyonu ve muhasebe modülü ile manuel işlemleri %80 azalttık. Harika bir çözüm!',
      rating: 5
    },
    {
      name: 'Mehmet Demir',
      role: 'IT Müdürü - DemirTicaret',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet',
      content: 'API desteği sayesinde mevcut sistemlerimizle sorunsuz entegre ettik. Teknik destek ekibi çok başarılı.',
      rating: 5
    }
  ];

  const stats = [
    { title: 'Aktif Firma', value: 500, suffix: '+', prefix: <TeamOutlined /> },
    { title: 'Kullanıcı', value: 10000, suffix: '+', prefix: <UserOutlined /> },
    { title: 'İşlem/Gün', value: 100, suffix: 'K+', prefix: <SyncOutlined /> },
    { title: 'Çalışma Süresi', value: 99.9, suffix: '%', prefix: <ClockCircleOutlined /> }
  ];

  const modules = [
    { name: 'CRM', icon: <UserOutlined />, description: 'Müşteri ilişkileri yönetimi' },
    { name: 'Stok', icon: <ShoppingCartOutlined />, description: 'Stok ve depo yönetimi' },
    { name: 'Muhasebe', icon: <DollarOutlined />, description: 'Finansal işlemler' },
    { name: 'İnsan Kaynakları', icon: <TeamOutlined />, description: 'Personel yönetimi' },
    { name: 'E-Ticaret', icon: <GlobalOutlined />, description: 'Online satış yönetimi' },
    { name: 'Üretim', icon: <ToolOutlined />, description: 'Üretim takibi' }
  ];

  return (
    <Layout className="landing-layout">
      {/* Navigation Header */}
      <Header className="landing-header">
        <div className="header-container">
          <div className="logo-section" onClick={() => navigate('/')}>
            <RocketOutlined className="logo-icon" />
            <span className="logo-text">Stocker</span>
          </div>
          <nav className="nav-menu">
            <a href="#features">Özellikler</a>
            <a href="#modules">Modüller</a>
            <a href="#pricing">Fiyatlandırma</a>
            <a href="#testimonials">Referanslar</a>
            <a href="#contact">İletişim</a>
          </nav>
          <div className="header-actions">
            <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Ücretsiz Dene
            </Button>
          </div>
        </div>
      </Header>

      <Content>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-shape-1"></div>
            <div className="hero-shape-2"></div>
            <div className="hero-shape-3"></div>
          </div>
          <div className="hero-content">
            <Badge.Ribbon text="Yeni" color="purple">
              <Tag color="purple" className="hero-tag">
                <ThunderboltOutlined /> 500+ işletme Stocker kullanıyor
              </Tag>
            </Badge.Ribbon>
            <Title level={1} className="hero-title">
              İşletmeniz İçin Komple Yönetim Platformu
            </Title>
            <Paragraph className="hero-description">
              Tüm iş süreçlerinizi tek platformdan yönetin. 
              CRM, stok, muhasebe, e-ticaret ve daha fazlası bir arada.
            </Paragraph>
            <Space size="large" className="hero-buttons">
              <Button 
                type="primary" 
                size="large" 
                icon={<RocketOutlined />}
                onClick={() => navigate('/register')}
                className="cta-button"
              >
                14 Gün Ücretsiz Dene
              </Button>
              <Button 
                size="large" 
                icon={<ArrowRightOutlined />}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Detaylı İncele
              </Button>
            </Space>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <Statistic
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: '#667eea', fontSize: 24 }}
                  />
                  <Text type="secondary">{stat.title}</Text>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="section-container">
            <div className="section-header">
              <Title level={2}>Modern İşletmeler İçin Güçlü Özellikler</Title>
              <Paragraph>
                İşletmenizi büyütmek için ihtiyacınız olan tüm araçlar
              </Paragraph>
            </div>
            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card 
                    className="feature-card"
                    hoverable
                    bordered={false}
                  >
                    <div className="feature-icon">{feature.icon}</div>
                    <Title level={4}>{feature.title}</Title>
                    <Text type="secondary">{feature.description}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Modules Section */}
        <section id="modules" className="modules-section">
          <div className="section-container">
            <div className="section-header">
              <Title level={2}>İhtiyacınıza Özel Modüller</Title>
              <Paragraph>
                Sektörünüze ve büyüklüğünüze uygun modülleri seçin
              </Paragraph>
            </div>
            <Row gutter={[24, 24]}>
              {modules.map((module, index) => (
                <Col xs={12} sm={8} lg={4} key={index}>
                  <Card 
                    className="module-card"
                    hoverable
                    bordered={false}
                  >
                    <div className="module-icon">{module.icon}</div>
                    <Title level={5} style={{ marginBottom: 4 }}>{module.name}</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>{module.description}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="pricing-section">
          <div className="section-container">
            <div className="section-header">
              <Title level={2}>Şeffaf ve Uygun Fiyatlandırma</Title>
              <Paragraph>
                İşletmenize uygun paketi seçin. Gizli ücret yoktur.
              </Paragraph>
            </div>
            <Row gutter={[32, 32]} align="middle">
              {pricingPlans.map((plan, index) => (
                <Col xs={24} sm={24} lg={8} key={index}>
                  <Badge.Ribbon 
                    text="En Popüler" 
                    color="purple"
                    style={{ display: plan.popular ? 'block' : 'none' }}
                  >
                    <Card 
                      className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                      hoverable
                      bordered={false}
                    >
                      <div className="pricing-header">
                        <Title level={3}>{plan.name}</Title>
                        <Text type="secondary">{plan.description}</Text>
                      </div>
                      <div className="pricing-amount">
                        <span className="currency">{plan.currency}</span>
                        <span className="price">{plan.price}</span>
                        <span className="period">/{plan.period}</span>
                      </div>
                      <List
                        dataSource={plan.features}
                        renderItem={item => (
                          <List.Item className="pricing-feature">
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <span>{item}</span>
                          </List.Item>
                        )}
                      />
                      <Button 
                        type={plan.popular ? 'primary' : 'default'}
                        size="large"
                        block
                        className="pricing-button"
                        onClick={() => navigate('/register')}
                      >
                        Hemen Başla
                      </Button>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Text type="secondary">
                * Tüm paketlerde KDV dahildir. Yıllık ödemede %20 indirim.
              </Text>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section">
          <div className="section-container">
            <div className="section-header">
              <Title level={2}>Müşterilerimiz Ne Diyor?</Title>
              <Paragraph>
                Stocker kullanan işletmelerin başarı hikayeleri
              </Paragraph>
            </div>
            <Row gutter={[32, 32]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} sm={24} lg={8} key={index}>
                  <Card className="testimonial-card" bordered={false}>
                    <div className="testimonial-content">
                      <Rate disabled defaultValue={testimonial.rating} />
                      <Paragraph className="testimonial-text">
                        "{testimonial.content}"
                      </Paragraph>
                    </div>
                    <div className="testimonial-author">
                      <Avatar size={48} src={testimonial.avatar} />
                      <div>
                        <Text strong>{testimonial.name}</Text>
                        <br />
                        <Text type="secondary">{testimonial.role}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Integration Section */}
        <section className="integration-section">
          <div className="section-container">
            <div className="section-header">
              <Title level={2}>Hazır Entegrasyonlar</Title>
              <Paragraph>
                Kullandığınız tüm sistemlerle uyumlu çalışır
              </Paragraph>
            </div>
            <Row gutter={[24, 24]} justify="center">
              <Col><Tag className="integration-tag">e-Fatura</Tag></Col>
              <Col><Tag className="integration-tag">e-Arşiv</Tag></Col>
              <Col><Tag className="integration-tag">e-İrsaliye</Tag></Col>
              <Col><Tag className="integration-tag">Trendyol</Tag></Col>
              <Col><Tag className="integration-tag">Hepsiburada</Tag></Col>
              <Col><Tag className="integration-tag">N11</Tag></Col>
              <Col><Tag className="integration-tag">Amazon</Tag></Col>
              <Col><Tag className="integration-tag">Paraşüt</Tag></Col>
              <Col><Tag className="integration-tag">Logo</Tag></Col>
              <Col><Tag className="integration-tag">Mikro</Tag></Col>
              <Col><Tag className="integration-tag">Nebim</Tag></Col>
              <Col><Tag className="integration-tag">SAP</Tag></Col>
            </Row>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="section-container">
            <Card className="cta-card" bordered={false}>
              <Title level={2} style={{ color: 'white' }}>
                İşletmenizi Dijitalleştirmeye Hazır mısınız?
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>
                14 gün ücretsiz deneme sürümüyle başlayın. 
                Kredi kartı gerekmez, hemen kullanmaya başlayın.
              </Paragraph>
              <Space size="large">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={() => navigate('/register')}
                  className="cta-final-button"
                >
                  Ücretsiz Dene
                </Button>
                <Button 
                  size="large"
                  ghost
                  style={{ color: 'white', borderColor: 'white' }}
                  icon={<CustomerServiceOutlined />}
                  onClick={() => window.open('https://wa.me/905555555555', '_blank')}
                >
                  Satış Ekibiyle Görüş
                </Button>
              </Space>
              <div style={{ marginTop: 24 }}>
                <Space>
                  <CheckCircleOutlined style={{ color: 'white' }} />
                  <Text style={{ color: 'white' }}>Kurulum ücreti yok</Text>
                  <CheckCircleOutlined style={{ color: 'white' }} />
                  <Text style={{ color: 'white' }}>İstediğiniz zaman iptal</Text>
                  <CheckCircleOutlined style={{ color: 'white' }} />
                  <Text style={{ color: 'white' }}>7/24 destek</Text>
                </Space>
              </div>
            </Card>
          </div>
        </section>
      </Content>

      {/* Footer */}
      <Footer className="landing-footer">
        <div className="footer-container">
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="footer-section">
                <div className="footer-logo">
                  <RocketOutlined /> Stocker
                </div>
                <Paragraph type="secondary">
                  Türkiye'nin en kapsamlı işletme yönetim platformu. 
                  Tüm iş süreçleriniz tek çatı altında.
                </Paragraph>
                <div style={{ marginTop: 16 }}>
                  <Space>
                    <Button shape="circle" icon={<GlobalOutlined />} />
                    <Button shape="circle" icon={<CustomerServiceOutlined />} />
                  </Space>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="footer-section">
                <Title level={5}>Ürün</Title>
                <ul className="footer-links">
                  <li><a href="#features">Özellikler</a></li>
                  <li><a href="#modules">Modüller</a></li>
                  <li><a href="#pricing">Fiyatlandırma</a></li>
                  <li><a href="#">API Dokümantasyon</a></li>
                  <li><a href="#">Güncelleme Notları</a></li>
                </ul>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="footer-section">
                <Title level={5}>Şirket</Title>
                <ul className="footer-links">
                  <li><a href="#">Hakkımızda</a></li>
                  <li><a href="#">Kariyer</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">İletişim</a></li>
                  <li><a href="#">Basın Kiti</a></li>
                </ul>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="footer-section">
                <Title level={5}>Destek</Title>
                <ul className="footer-links">
                  <li><a href="#">Yardım Merkezi</a></li>
                  <li><a href="#">Video Eğitimler</a></li>
                  <li><a href="#">Kullanım Kılavuzu</a></li>
                  <li><a href="#">SSS</a></li>
                  <li><a href="#">Sistem Durumu</a></li>
                </ul>
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Destek Hattı:</Text>
                  <br />
                  <Text strong style={{ fontSize: 18 }}>0850 123 45 67</Text>
                </div>
              </div>
            </Col>
          </Row>
          <Divider />
          <div className="footer-bottom">
            <Row align="middle" justify="space-between">
              <Col>
                <Text type="secondary">
                  © 2024 Stocker. Tüm hakları saklıdır.
                </Text>
              </Col>
              <Col>
                <Space>
                  <a href="#">Gizlilik Politikası</a>
                  <span>|</span>
                  <a href="#">Kullanım Koşulları</a>
                  <span>|</span>
                  <a href="#">KVKK</a>
                </Space>
              </Col>
            </Row>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};