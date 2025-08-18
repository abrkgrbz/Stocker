import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Row, Col, Typography, Space, Tag, Statistic, List, Avatar, Rate, Divider, Badge, Progress, Carousel } from 'antd';
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
  PlayCircleOutlined,
  MenuOutlined,
  TrophyOutlined,
  LockOutlined,
  LineChartOutlined,
  BulbOutlined,
  HeartOutlined,
  DatabaseOutlined,
  CompassOutlined,
  SolutionOutlined,
  BankOutlined,
  CalendarOutlined,
  BoxPlotOutlined,
  ContactsOutlined,
  FileDoneOutlined,
  FundProjectionScreenOutlined,
  ReconciliationOutlined,
  AuditOutlined,
  CalculatorOutlined,
  IdcardOutlined,
  ScheduleOutlined,
  ContainerOutlined,
  ShopOutlined,
  TagsOutlined,
  BarcodeOutlined,
  TruckOutlined,
  FundOutlined,
  ProfileOutlined,
  PieChartOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import './style.css';
import './corporate-style.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Check if stats section is visible
      const statsSection = document.querySelector('.hero-stats');
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setStatsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <TeamOutlined style={{ fontSize: 36 }} />,
      title: 'Çoklu Kiracı Mimarisi',
      description: 'Her müşteri için izole edilmiş veri ve özelleştirilmiş deneyim. Tam güvenlik ve gizlilik.',
      color: '#667eea'
    },
    {
      icon: <AppstoreOutlined style={{ fontSize: 36 }} />,
      title: 'Modüler Yapı',
      description: 'İhtiyacınıza göre modül seçin. CRM, Stok, Muhasebe, İK ve daha fazlası.',
      color: '#764ba2'
    },
    {
      icon: <CloudOutlined style={{ fontSize: 36 }} />,
      title: 'Bulut Tabanlı',
      description: 'Her yerden erişim. Kurulum gerektirmez, bakım maliyeti yoktur.',
      color: '#667eea'
    },
    {
      icon: <LockOutlined style={{ fontSize: 36 }} />,
      title: 'Kurumsal Güvenlik',
      description: 'SSL şifreleme, günlük yedekleme ve KVKK uyumlu veri güvenliği.',
      color: '#764ba2'
    },
    {
      icon: <ApiOutlined style={{ fontSize: 36 }} />,
      title: 'API Entegrasyonu',
      description: 'E-fatura, e-arşiv, kargo, pazaryeri ve banka entegrasyonları hazır.',
      color: '#667eea'
    },
    {
      icon: <LineChartOutlined style={{ fontSize: 36 }} />,
      title: 'Gelişmiş Raporlama',
      description: 'Anlık raporlar, özelleştirilebilir dashboard ve veri analitiği.',
      color: '#764ba2'
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
    { title: 'Aktif Firma', value: 12, suffix: '+', prefix: <TeamOutlined /> },
    { title: 'Kullanıcı', value: 248, suffix: '+', prefix: <UserOutlined /> },
    { title: 'İşlem/Gün', value: 1.5, suffix: 'K+', prefix: <SyncOutlined /> },
    { title: 'Çalışma Süresi', value: 99.9, suffix: '%', prefix: <ClockCircleOutlined /> }
  ];

  const mainModules = [
    {
      id: 'crm',
      name: 'CRM',
      title: 'Müşteri İlişkileri Yönetimi',
      icon: <ContactsOutlined style={{ fontSize: 48 }} />,
      color: '#1890ff',
      description: 'Müşteri ilişkilerinizi güçlendirin, satışlarınızı artırın',
      features: [
        'Müşteri ve firma yönetimi',
        'Fırsat ve teklif takibi',
        'Satış hunisi ve pipeline yönetimi',
        'Aktivite ve görev yönetimi',
        'E-posta ve SMS entegrasyonu',
        'Müşteri segmentasyonu',
        'Satış raporları ve analizler',
        'Mobil CRM uygulaması'
      ],
      benefits: [
        'Satış verimliliğini %40 artırır',
        'Müşteri memnuniyetini yükseltir',
        'Satış süreçlerini otomatikleştirir'
      ]
    },
    {
      id: 'erp',
      name: 'ERP',
      title: 'Kurumsal Kaynak Planlama',
      icon: <BankOutlined style={{ fontSize: 48 }} />,
      color: '#52c41a',
      description: 'Tüm iş süreçlerinizi entegre edin ve optimize edin',
      features: [
        'Üretim planlama ve kontrol',
        'Tedarik zinciri yönetimi',
        'Proje yönetimi',
        'Kalite kontrol',
        'Bakım ve onarım yönetimi',
        'Kaynak planlama',
        'Maliyet analizi',
        'Performans göstergeleri (KPI)'
      ],
      benefits: [
        'Operasyonel verimliliği artırır',
        'Maliyetleri %30 azaltır',
        'Karar alma süreçlerini hızlandırır'
      ]
    },
    {
      id: 'accounting',
      name: 'Muhasebe',
      title: 'Finansal Yönetim ve Muhasebe',
      icon: <CalculatorOutlined style={{ fontSize: 48 }} />,
      color: '#fa8c16',
      description: 'Finansal süreçlerinizi dijitalleştirin, vergi uyumluluğunu sağlayın',
      features: [
        'Genel muhasebe ve defterler',
        'Fatura ve tahsilat yönetimi',
        'E-fatura, e-arşiv entegrasyonu',
        'Banka ve kasa yönetimi',
        'KDV, stopaj hesaplamaları',
        'Mizan ve mali tablolar',
        'Bütçe planlama ve takibi',
        'Vergi beyanname hazırlığı'
      ],
      benefits: [
        'Muhasebe hatalarını %95 azaltır',
        'Vergi uyumluluğunu garanti eder',
        'Mali süreçleri otomatikleştirir'
      ]
    },
    {
      id: 'hr',
      name: 'İnsan Kaynakları',
      title: 'İK ve Personel Yönetimi',
      icon: <IdcardOutlined style={{ fontSize: 48 }} />,
      color: '#722ed1',
      description: 'Çalışan deneyimini iyileştirin, İK süreçlerinizi dijitalleştirin',
      features: [
        'Personel özlük yönetimi',
        'Puantaj ve mesai takibi',
        'İzin ve talep yönetimi',
        'Bordro ve maaş hesaplama',
        'Performans değerlendirme',
        'İşe alım ve aday takibi',
        'Eğitim ve gelişim yönetimi',
        'Organizasyon şeması'
      ],
      benefits: [
        'İK süreçlerini %60 hızlandırır',
        'Çalışan memnuniyetini artırır',
        'İK maliyetlerini optimize eder'
      ]
    },
    {
      id: 'inventory',
      name: 'Stok Yönetimi',
      title: 'Envanter ve Depo Yönetimi',
      icon: <ContainerOutlined style={{ fontSize: 48 }} />,
      color: '#eb2f96',
      description: 'Stok seviyelerinizi optimize edin, depo operasyonlarınızı yönetin',
      features: [
        'Ürün ve stok kartları',
        'Depo ve raf yönetimi',
        'Stok hareketleri takibi',
        'Barkod ve QR kod desteği',
        'Sayım ve envanter kontrolü',
        'Minimum-maksimum stok takibi',
        'Sipariş ve sevkiyat yönetimi',
        'Stok değerleme raporları'
      ],
      benefits: [
        'Stok maliyetlerini %25 düşürür',
        'Stoksuz kalma riskini minimize eder',
        'Depo verimliliğini maksimize eder'
      ]
    }
  ];

  const additionalModules = [
    { name: 'E-Ticaret', icon: <ShopOutlined />, description: 'Online satış yönetimi' },
    { name: 'Üretim', icon: <ToolOutlined />, description: 'Üretim planlama ve takibi' },
    { name: 'Proje Yönetimi', icon: <FundProjectionScreenOutlined />, description: 'Proje takibi ve yönetimi' },
    { name: 'Lojistik', icon: <TruckOutlined />, description: 'Nakliye ve kargo yönetimi' },
    { name: 'Satın Alma', icon: <ShoppingCartOutlined />, description: 'Tedarik ve satın alma' },
    { name: 'Raporlama', icon: <PieChartOutlined />, description: 'İş zekası ve analizler' }
  ];

  return (
    <Layout className="landing-layout">
      {/* Navigation Header */}
      <Header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
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
            <Button 
              type={scrolled ? 'default' : 'primary'}
              ghost={scrolled}
              onClick={() => navigate('/login')}
              icon={<UserOutlined />}
              style={{ 
                marginRight: '8px',
                ...(scrolled ? {} : { 
                  background: 'transparent', 
                  border: '2px solid #667eea',
                  color: '#667eea'
                })
              }}
            >
              Giriş Yap
            </Button>
            <Button 
              type="primary" 
              onClick={() => navigate('/register')}
              icon={<RocketOutlined />}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              Ücretsiz Dene
            </Button>
            <MenuOutlined className="mobile-menu-toggle" />
          </div>
        </div>
      </Header>

      <Content>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-particles"></div>
            <div className="hero-shape-1"></div>
            <div className="hero-shape-2"></div>
            <div className="hero-shape-3"></div>
          </div>
          <div className="hero-content">
            <div className="hero-badge">
              <StarFilled className="hero-badge-icon" />
              <span className="hero-badge-text">500+ işletme güveniyor</span>
            </div>
            <Title level={1} className="hero-title">
              İşletmeniz İçin <span className="hero-title-gradient">Akıllı</span><br/>
              Yönetim Platformu
            </Title>
            <Paragraph className="hero-description">
              Tüm iş süreçlerinizi tek platformdan yönetin. 
              CRM, stok, muhasebe, e-ticaret ve daha fazlası bir arada.
            </Paragraph>
            <div className="hero-buttons">
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
                className="cta-secondary"
                icon={<ArrowRightOutlined />}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Detaylı İncele
              </Button>
            </div>
            <div className="hero-demo-button" onClick={() => window.open('https://demo.stocker.com', '_blank')}>
              <div className="play-icon">
                <PlayCircleOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <span>Demo İzle</span>
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <Statistic
                    value={statsVisible ? stat.value : 0}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ fontSize: 28, fontWeight: 700 }}
                    formatter={(value) => {
                      if (statsVisible) {
                        return value;
                      }
                      return '0';
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
                    {stat.title}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="section-container">
            <div className="section-header">
              <Tag color="purple" style={{ marginBottom: 16 }}>
                <BulbOutlined /> Özellikler
              </Tag>
              <Title level={2}>Modern İşletmeler İçin Güçlü Özellikler</Title>
              <Paragraph>
                İşletmenizi büyütmek için ihtiyacınız olan tüm araçlar
              </Paragraph>
            </div>
            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card 
                    className="feature-card fade-in"
                    hoverable
                    bordered={false}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="feature-icon">
                      {feature.icon}
                    </div>
                    <Title level={4}>{feature.title}</Title>
                    <Text type="secondary">{feature.description}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Main Modules Section */}
        <section id="modules" className="modules-section">
          <div className="section-container">
            <div className="section-header">
              <Tag color="purple" style={{ marginBottom: 16 }}>
                <AppstoreOutlined /> Ana Modüller
              </Tag>
              <Title level={2}>İşletmenizi Güçlendirecek 5 Ana Modül</Title>
              <Paragraph>
                Entegre çalışan modüller ile tüm iş süreçlerinizi tek platformdan yönetin
              </Paragraph>
            </div>
            
            {/* Module Cards */}
            <Row gutter={[32, 32]}>
              {mainModules.map((module, index) => (
                <Col xs={24} key={module.id}>
                  <Card 
                    className="main-module-card fade-in"
                    hoverable
                    bordered={false}
                    style={{ 
                      animationDelay: `${index * 0.15}s`,
                      background: `linear-gradient(135deg, ${module.color}15 0%, ${module.color}05 100%)`,
                      borderLeft: `4px solid ${module.color}`
                    }}
                  >
                    <Row gutter={[32, 24]} align="middle">
                      <Col xs={24} md={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: `${module.color}20`,
                            marginBottom: 16
                          }}>
                            <div style={{ color: module.color }}>
                              {module.icon}
                            </div>
                          </div>
                          <Title level={3}>{module.title}</Title>
                          <Paragraph style={{ fontSize: 16 }}>
                            {module.description}
                          </Paragraph>
                          <Button 
                            type="primary"
                            icon={<ArrowRightOutlined />}
                            style={{ 
                              background: module.color,
                              borderColor: module.color 
                            }}
                            onClick={() => navigate(`/modules/${module.id}`)}
                          >
                            Detaylı İncele
                          </Button>
                        </div>
                      </Col>
                      <Col xs={24} md={8}>
                        <Title level={5}>Özellikler</Title>
                        <List
                          size="small"
                          dataSource={module.features}
                          renderItem={item => (
                            <List.Item style={{ padding: '4px 0', border: 'none' }}>
                              <Space>
                                <CheckCircleOutlined style={{ color: module.color }} />
                                <Text>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      </Col>
                      <Col xs={24} md={8}>
                        <Title level={5}>Faydaları</Title>
                        <div style={{ marginBottom: 24 }}>
                          {module.benefits.map((benefit, idx) => (
                            <div key={idx} style={{ 
                              padding: '12px',
                              background: `${module.color}10`,
                              borderRadius: 8,
                              marginBottom: 12
                            }}>
                              <Space>
                                <RiseOutlined style={{ color: module.color, fontSize: 20 }} />
                                <Text strong>{benefit}</Text>
                              </Space>
                            </div>
                          ))}
                        </div>
                        <div style={{ 
                          padding: '16px',
                          background: `linear-gradient(135deg, ${module.color} 0%, ${module.color}dd 100%)`,
                          borderRadius: 8,
                          textAlign: 'center'
                        }}>
                          <Text style={{ color: 'white', fontSize: 14 }}>Bu modülü kullanan</Text>
                          <Title level={3} style={{ color: 'white', margin: '8px 0' }}>
                            {100 + index * 50}+
                          </Title>
                          <Text style={{ color: 'white', fontSize: 14 }}>işletme mevcut</Text>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Additional Modules */}
            <Divider style={{ margin: '48px 0' }}>
              <Title level={4}>Ek Modüller</Title>
            </Divider>
            <Row gutter={[24, 24]}>
              {additionalModules.map((module, index) => (
                <Col xs={12} sm={8} lg={4} key={index}>
                  <Card 
                    className="module-card slide-up"
                    hoverable
                    bordered={false}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="module-icon" style={{ color: '#667eea', fontSize: 32 }}>
                      {module.icon}
                    </div>
                    <Title level={5} style={{ marginBottom: 4 }}>{module.name}</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>{module.description}</Text>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Module Integration Info */}
            <Card 
              style={{ 
                marginTop: 48,
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                border: 'none'
              }}
            >
              <Row gutter={[32, 24]} align="middle">
                <Col xs={24} md={12}>
                  <Title level={3}>
                    <SyncOutlined /> Tam Entegrasyon
                  </Title>
                  <Paragraph style={{ fontSize: 16 }}>
                    Tüm modüller birbiriyle entegre çalışır. Bir modülde yapılan işlem,
                    ilgili diğer modüllerde otomatik olarak güncellenir.
                  </Paragraph>
                  <Space wrap>
                    <Tag color="purple">Gerçek Zamanlı Senkronizasyon</Tag>
                    <Tag color="purple">Çapraz Modül Raporlama</Tag>
                    <Tag color="purple">Merkezi Veri Yönetimi</Tag>
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4}>Modüller Arası Veri Akışı</Title>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 16,
                      marginTop: 24
                    }}>
                      <Badge count="CRM" style={{ backgroundColor: '#1890ff' }}>
                        <Avatar size={48} icon={<ContactsOutlined />} />
                      </Badge>
                      <ArrowRightOutlined style={{ fontSize: 24, color: '#667eea' }} />
                      <Badge count="ERP" style={{ backgroundColor: '#52c41a' }}>
                        <Avatar size={48} icon={<BankOutlined />} />
                      </Badge>
                      <ArrowRightOutlined style={{ fontSize: 24, color: '#667eea' }} />
                      <Badge count="Muhasebe" style={{ backgroundColor: '#fa8c16' }}>
                        <Avatar size={48} icon={<CalculatorOutlined />} />
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="pricing-section">
          <div className="section-container">
            <div className="section-header">
              <Tag color="purple" style={{ marginBottom: 16 }}>
                <DollarOutlined /> Fiyatlandırma
              </Tag>
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
                      className={`pricing-card ${plan.popular ? 'popular' : ''} fade-in`}
                      hoverable
                      bordered={false}
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      {plan.popular && (
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                          <TrophyOutlined style={{ fontSize: 32, color: '#ffd700' }} />
                        </div>
                      )}
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
                            <CheckCircleOutlined />
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
                        icon={<RocketOutlined />}
                      >
                        Hemen Başla
                      </Button>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  * Tüm paketlerde KDV dahildir. Yıllık ödemede %20 indirim.
                </Text>
                <Button type="link" icon={<CompassOutlined />}>
                  Paketleri Karşılaştır
                </Button>
              </Space>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section">
          <div className="section-container">
            <div className="section-header">
              <Tag color="purple" style={{ marginBottom: 16 }}>
                <HeartOutlined /> Referanslar
              </Tag>
              <Title level={2}>Müşterilerimiz Ne Diyor?</Title>
              <Paragraph>
                Stocker kullanan işletmelerin başarı hikayeleri
              </Paragraph>
            </div>
            <Row gutter={[32, 32]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} sm={24} lg={8} key={index}>
                  <Card 
                    className="testimonial-card fade-in" 
                    bordered={false}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="testimonial-content">
                      <Rate disabled defaultValue={testimonial.rating} />
                      <Paragraph className="testimonial-text">
                        {testimonial.content}
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
              <Tag color="purple" style={{ marginBottom: 16 }}>
                <ApiOutlined /> Entegrasyonlar
              </Tag>
              <Title level={2}>Hazır Entegrasyonlar</Title>
              <Paragraph>
                Kullandığınız tüm sistemlerle uyumlu çalışır
              </Paragraph>
            </div>
            <Row gutter={[24, 24]} justify="center">
              {[
                'e-Fatura', 'e-Arşiv', 'e-İrsaliye', 'Trendyol', 
                'Hepsiburada', 'N11', 'Amazon', 'Paraşüt', 
                'Logo', 'Mikro', 'Nebim', 'SAP'
              ].map((integration, index) => (
                <Col key={index}>
                  <Tag 
                    className="integration-tag fade-in" 
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {integration}
                  </Tag>
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Button type="link" icon={<DatabaseOutlined />}>
                Tüm Entegrasyonları Gör
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="section-container">
            <Card className="cta-card" bordered={false}>
              <Badge.Ribbon text="Sınırlı Süre" color="red">
                <div></div>
              </Badge.Ribbon>
              <Title level={2} style={{ color: 'white' }}>
                İşletmenizi Dijitalleştirmeye Hazır mısınız?
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.95)', fontSize: 20, maxWidth: 700, margin: '0 auto 40px' }}>
                14 gün ücretsiz deneme sürümüyle başlayın. 
                Kredi kartı gerekmez, hemen kullanmaya başlayın.
              </Paragraph>
              <Space size="large" wrap>
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
                  style={{ color: 'white', borderColor: 'white', backdropFilter: 'blur(10px)' }}
                  icon={<CustomerServiceOutlined />}
                  onClick={() => window.open('https://wa.me/905555555555', '_blank')}
                >
                  Satış Ekibiyle Görüş
                </Button>
              </Space>
              <div style={{ marginTop: 40 }}>
                <Space wrap size="large" style={{ justifyContent: 'center' }}>
                  <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ fontSize: 20 }} />
                    <Text style={{ color: 'white', fontSize: 16 }}>Kurulum ücreti yok</Text>
                  </div>
                  <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ fontSize: 20 }} />
                    <Text style={{ color: 'white', fontSize: 16 }}>İstediğiniz zaman iptal</Text>
                  </div>
                  <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ fontSize: 20 }} />
                    <Text style={{ color: 'white', fontSize: 16 }}>7/24 destek</Text>
                  </div>
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