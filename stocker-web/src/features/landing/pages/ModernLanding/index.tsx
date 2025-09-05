import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Button, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Space, 
  Tag,
  Badge,
  Statistic,
  Avatar,
  Rate,
  Tooltip,
  Divider,
  App
} from 'antd';
import {
  RocketOutlined,
  CheckCircleOutlined,
  StarFilled,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  BarChartOutlined,
  SafetyOutlined,
  CloudOutlined,
  ApiOutlined,
  CustomerServiceOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  MobileOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  HeartFilled,
  CrownOutlined,
  FireOutlined,
  ShopOutlined,
  TruckOutlined
} from '@ant-design/icons';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { FAQSection } from '../../components/FAQSection';
import { SolutionsSection } from '../../components/SolutionsSection';
import { PartnersSection } from '../../components/PartnersSection';
import { ComparisonTable } from '../../components/ComparisonTable';
import { DemoBooking } from '../../components/DemoBooking';
import './style.css';

const { Title, Paragraph, Text } = Typography;

export const ModernLanding: React.FC = () => {
  const navigate = useNavigate();
  const { modal, notification } = App.useApp();
  const [activeFeature, setActiveFeature] = useState(0);
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  // Scroll listener for navigation and parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleBusinessTypeSelect = (type: string, name: string) => {
    setSelectedBusinessType(type);
    notification.success({
      message: `${name} Sektörü Seçildi`,
      description: 'Size özel paket önerilerimizi aşağıda görebilirsiniz.',
      placement: 'top',
      duration: 3,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    });
  };
  const { ref: statsRef, inView: statsInView } = useInView({ 
    triggerOnce: true,
    threshold: 0.1
  });
  const { ref: featuresRef, inView: featuresInView } = useInView({ 
    triggerOnce: true,
    threshold: 0.1
  });
  const { ref: pricingRef, inView: pricingInView } = useInView({ 
    triggerOnce: true,
    threshold: 0.1
  });
  const { ref: testimonialsRef, inView: testimonialsInView } = useInView({ 
    triggerOnce: true,
    threshold: 0.1
  });

  // Hero typing animation
  const [displayText, setDisplayText] = useState('');
  const fullText = 'İşletmenizi Dijitalleştirin';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <TeamOutlined />,
      title: 'CRM Modülü',
      description: 'Müşteri ilişkilerinizi profesyonelce yönetin',
      color: '#667eea',
      details: ['Müşteri takibi', 'Satış pipeline', 'Otomatik hatırlatmalar', 'Raporlama']
    },
    {
      icon: <AppstoreOutlined />,
      title: 'Stok Yönetimi',
      description: 'Envanter kontrolünü kolaylaştırın',
      color: '#764ba2',
      details: ['Gerçek zamanlı stok takibi', 'Barkod sistemi', 'Min-max uyarıları', 'Depo yönetimi']
    },
    {
      icon: <BarChartOutlined />,
      title: 'Satış & Faturalama',
      description: 'Satış süreçlerinizi hızlandırın',
      color: '#f093fb',
      details: ['E-fatura entegrasyonu', 'Teklif yönetimi', 'Sipariş takibi', 'Tahsilat takibi']
    },
    {
      icon: <DashboardOutlined />,
      title: 'Finans & Muhasebe',
      description: 'Mali süreçlerinizi kontrol altına alın',
      color: '#f5576c',
      details: ['Gelir-gider takibi', 'Bütçe yönetimi', 'Mali raporlar', 'Vergi hesaplamaları']
    },
    {
      icon: <UserOutlined />,
      title: 'İnsan Kaynakları',
      description: 'Personel yönetimini dijitalleştirin',
      color: '#4facfe',
      details: ['Personel kartları', 'İzin takibi', 'Maaş bordrosu', 'Performans değerlendirme']
    },
    {
      icon: <GlobalOutlined />,
      title: 'Üretim Planlama',
      description: 'Üretim süreçlerinizi optimize edin',
      color: '#43e97b',
      details: ['İş emirleri', 'Reçete yönetimi', 'Kapasite planlama', 'Maliyet analizi']
    }
  ];

  const stats = [
    { value: 6, suffix: '', label: 'ERP Modülü', icon: <AppstoreOutlined /> },
    { value: 100, suffix: '+', label: 'İş Süreci', icon: <ThunderboltOutlined /> },
    { value: 50, suffix: '+', label: 'Entegrasyon', icon: <ApiOutlined /> },
    { value: 24, suffix: '/7', label: 'Teknik Destek', icon: <CustomerServiceOutlined /> }
  ];

  const pricingPlansByType = {
    retail: [
      {
        name: 'Perakende Başlangıç',
        price: 399,
        period: 'aylık',
        icon: <ShopOutlined />,
        features: ['3 Kullanıcı', 'Stok + Satış + Kasa Modülleri', 'Barkod Sistemi', '5GB Depolama', 'POS Entegrasyonu', 'Email Destek'],
        popular: false
      },
      {
        name: 'Perakende Plus',
        price: 799,
        period: 'aylık',
        icon: <ShopOutlined />,
        features: ['10 Kullanıcı', 'CRM + Stok + Satış + Finans', 'Multi-Mağaza Desteği', '50GB Depolama', 'E-Fatura & E-Arşiv', 'Sadakat Programı', '7/24 Destek'],
        popular: true
      },
      {
        name: 'Perakende Zincir',
        price: 1999,
        period: 'aylık',
        icon: <ShopOutlined />,
        features: ['Sınırsız Kullanıcı', 'Tüm Modüller', 'Sınırsız Mağaza', 'Merkezi Yönetim', 'Franchise Desteği', 'Özel Raporlar', 'SLA Garantisi'],
        popular: false
      }
    ],
    production: [
      {
        name: 'Üretim Atölye',
        price: 599,
        period: 'aylık',
        icon: <GlobalOutlined />,
        features: ['5 Kullanıcı', 'Üretim + Stok + Satış', 'Reçete Yönetimi', '20GB Depolama', 'İş Emirleri', 'Temel Planlama'],
        popular: false
      },
      {
        name: 'Üretim Fabrika',
        price: 1299,
        period: 'aylık',
        icon: <GlobalOutlined />,
        features: ['25 Kullanıcı', 'Tüm Üretim Modülleri', 'MRP Planlama', 'Kalite Kontrol', 'Bakım Yönetimi', 'IoT Entegrasyon', 'Vardiya Yönetimi'],
        popular: true
      },
      {
        name: 'Üretim Enterprise',
        price: 3499,
        period: 'aylık',
        icon: <GlobalOutlined />,
        features: ['Sınırsız Kullanıcı', 'ERP + MES + WMS', 'Gelişmiş Planlama', 'AI Optimizasyon', 'Multi-Fabrika', 'SAP Entegrasyon', 'Özel Geliştirme'],
        popular: false
      }
    ],
    distribution: [
      {
        name: 'Dağıtım Başlangıç',
        price: 499,
        period: 'aylık',
        icon: <TruckOutlined />,
        features: ['5 Kullanıcı', 'Stok + Satış + Lojistik', 'Rota Planlama', '15GB Depolama', 'Araç Takibi', 'Sevkiyat Yönetimi'],
        popular: false
      },
      {
        name: 'Dağıtım Pro',
        price: 999,
        period: 'aylık',
        icon: <TruckOutlined />,
        features: ['20 Kullanıcı', 'WMS + TMS Modülleri', 'Depo Optimizasyonu', 'Gerçek Zamanlı Takip', 'B2B Portal', 'EDI Entegrasyon', 'Cross-Docking'],
        popular: true
      },
      {
        name: 'Dağıtım Network',
        price: 2999,
        period: 'aylık',
        icon: <TruckOutlined />,
        features: ['Sınırsız Kullanıcı', 'Komple Lojistik Suite', 'Multi-Depo', 'Filo Yönetimi', 'Global Ticaret', 'Gümrük Entegrasyonu', 'Blockchain Takip'],
        popular: false
      }
    ],
    service: [
      {
        name: 'Hizmet Başlangıç',
        price: 349,
        period: 'aylık',
        icon: <CustomerServiceOutlined />,
        features: ['3 Kullanıcı', 'CRM + Servis Yönetimi', 'Randevu Sistemi', '5GB Depolama', 'Ticket Sistemi', 'Email Destek'],
        popular: false
      },
      {
        name: 'Hizmet Professional',
        price: 749,
        period: 'aylık',
        icon: <CustomerServiceOutlined />,
        features: ['15 Kullanıcı', 'Field Service Management', 'Saha Ekibi Yönetimi', 'SLA Takibi', 'Müşteri Portali', 'Sözleşme Yönetimi', '7/24 Destek'],
        popular: true
      },
      {
        name: 'Hizmet Enterprise',
        price: 1799,
        period: 'aylık',
        icon: <CustomerServiceOutlined />,
        features: ['Sınırsız Kullanıcı', 'Komple Service Suite', 'AI Chatbot', 'Omnichannel Destek', 'Knowledge Base', 'API Marketplace', 'White Label'],
        popular: false
      }
    ],
    default: [
      {
        name: 'Startup Paketi',
        price: 499,
        period: 'aylık',
        icon: <RocketOutlined />,
        features: ['5 Kullanıcı', 'CRM + Stok + Satış', '10GB Depolama', 'Temel Raporlar', 'Email Destek', 'Mobil Uygulama'],
        popular: false
      },
      {
        name: 'Profesyonel Paket',
        price: 999,
        period: 'aylık',
        icon: <ThunderboltOutlined />,
        features: ['25 Kullanıcı', 'Tüm ERP Modülleri', '100GB Depolama', 'Gelişmiş Raporlar', '7/24 Destek', 'E-Fatura', 'API Erişimi'],
        popular: true
      },
      {
        name: 'Kurumsal Paket',
        price: 2499,
        period: 'aylık',
        icon: <TrophyOutlined />,
        features: ['Sınırsız Kullanıcı', 'Tüm Modüller + Özelleştirme', 'Sınırsız Depolama', 'BI & Analytics', 'Özel Destek', 'White Label', 'SLA'],
        popular: false
      }
    ]
  };

  const currentPlans = pricingPlansByType[selectedBusinessType] || pricingPlansByType.default;

  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      position: 'Genel Müdür',
      company: 'TechCorp',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      rating: 5,
      comment: 'Stocker ERP ile tüm departmanlarımızı tek platformda topladık. Üretimden satışa kadar her şey kontrol altında.'
    },
    {
      name: 'Ayşe Demir',
      position: 'Operasyon Direktörü',
      company: 'GlobalTrade',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      rating: 5,
      comment: 'Stok ve finans modülleri mükemmel entegre. E-fatura sistemi sayesinde muhasebe işlerimiz %80 hızlandı.'
    },
    {
      name: 'Mehmet Kara',
      position: 'Satış Müdürü',
      company: 'RetailPlus',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      rating: 5,
      comment: 'CRM modülü ile müşteri memnuniyetimiz arttı. Tüm şubelerimizi tek yerden yönetiyoruz.'
    }
  ];

  return (
    <div className="modern-landing">
      {/* Navigation */}
      <motion.nav 
        className={`modern-nav ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate('/')}>
            <RocketOutlined style={{ fontSize: 28 }} />
            <span>Stocker</span>
          </div>
          <div className="nav-menu">
            <a href="#features">Özellikler</a>
            <a href="#solutions">Çözümler</a>
            <a href="#pricing">Fiyatlandırma</a>
            <a onClick={() => navigate('/training')} style={{ cursor: 'pointer' }}>Eğitimler</a>
            <a onClick={() => navigate('/blog')} style={{ cursor: 'pointer' }}>Blog</a>
            <a href="#partners">İş Ortakları</a>
            <a href="#faq">SSS</a>
            <Button type="default" onClick={() => navigate('/login')}>Giriş</Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Ücretsiz Başla
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div 
          className="hero-background"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="floating-shape"
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                transform: `translateY(${scrollY * (0.1 * (i % 3))}px)`
              }}
            />
          ))}
        </div>

        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ marginBottom: 20 }}>
              <Tag color="purple" style={{ padding: '8px 20px', fontSize: '16px' }}>
                <FireOutlined /> 14 Gün Ücretsiz Deneme
              </Tag>
              <Tag color="red" style={{ padding: '8px 20px', fontSize: '16px', marginLeft: '10px' }}>
                🎉 Yeni
              </Tag>
            </div>
            
            <Title level={1} className="hero-title">
              {displayText}
              <span className="cursor-blink">|</span>
            </Title>
            
            <Title level={2} className="hero-subtitle">
              Kapsamlı ERP Çözümü ile <span className="gradient-text">Tek Platform</span>da Tüm İşlemler
            </Title>
            
            <Paragraph className="hero-description">
              CRM, Stok, Satış, Finans, İK ve Üretim modülleriyle işletmenizin tüm süreçlerini 
              tek bir platformdan yönetin. Bulut tabanlı, güvenli ve ölçeklenebilir ERP sistemi.
            </Paragraph>

            <Space size="large" className="hero-actions">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={() => navigate('/register')}
                  className="cta-button primary-cta"
                >
                  Hemen Başla - Ücretsiz
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="large"
                  icon={<PlayCircleOutlined />}
                  className="cta-button secondary-cta"
                  onClick={() => {
                    modal.info({
                      title: 'Demo Videosu',
                      content: (
                        <div>
                          <p>Demo videosu yakında eklenecek!</p>
                          <p>Şimdilik <strong>14 gün ücretsiz deneme</strong> ile tüm özellikleri test edebilirsiniz.</p>
                        </div>
                      ),
                      icon: <PlayCircleOutlined style={{ color: '#667eea' }} />,
                      okText: 'Tamam',
                      okButtonProps: { type: 'primary' },
                      centered: true,
                      maskClosable: true
                    });
                  }}
                >
                  Demo İzle
                </Button>
              </motion.div>
            </Space>

            <div className="hero-trust">
              <Space split={<Divider type="vertical" />}>
                <span><CheckCircleOutlined /> Kredi kartı gerekmez</span>
                <span><CheckCircleOutlined /> 5 dakikada kurulum</span>
                <span><CheckCircleOutlined /> 7/24 destek</span>
              </Space>
            </div>
          </motion.div>
        </div>

        {/* Hero Dashboard Preview */}
        <motion.div 
          className="hero-preview"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="preview-window">
            <div className="window-controls">
              <span></span><span></span><span></span>
            </div>
            <div className="preview-content">
              <div style={{ 
                padding: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                color: 'white',
                textAlign: 'center'
              }}>
                <DashboardOutlined style={{ fontSize: '64px', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '10px' }}>
                  Stocker ERP Dashboard
                </h3>
                <p style={{ fontSize: '16px', opacity: 0.9 }}>
                  6 Ana Modül, Tek Platform
                </p>
                <div style={{ 
                  marginTop: '30px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '15px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <TeamOutlined style={{ fontSize: '24px', marginBottom: '5px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>CRM</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <AppstoreOutlined style={{ fontSize: '24px', marginBottom: '5px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Stok</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <BarChartOutlined style={{ fontSize: '24px', marginBottom: '5px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Satış</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <DashboardOutlined style={{ fontSize: '24px', marginBottom: '5px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Finans</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: '24px', marginBottom: '5px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>İK</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <GlobalOutlined style={{ fontSize: '24px', marginBottom: '5px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Üretim</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <Row gutter={[32, 32]}>
            {stats.map((stat, index) => (
              <Col xs={12} sm={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className="stat-card"
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-value">
                    {statsInView && (
                      <CountUp
                        end={stat.value}
                        duration={2.5}
                        separator=","
                        decimals={stat.suffix === '%' ? 1 : 0}
                      />
                    )}
                    <span className="stat-suffix">{stat.suffix}</span>
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" ref={featuresRef}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={featuresInView ? { opacity: 1 } : {}}
            className="section-header"
          >
            <Tag color="purple" className="section-tag">ERP Modülleri</Tag>
            <Title level={2}>Tek Platform, Komple Çözüm</Title>
            <Paragraph>İşletmenizin tüm departmanlarını dijitalleştiren kapsamlı ERP modülleri</Paragraph>
          </motion.div>

          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              <div className="features-list">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={featuresInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                    className={`feature-item ${activeFeature === index ? 'active' : ''}`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="feature-icon" style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                    <div className="feature-content">
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                      {activeFeature === index && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="feature-details"
                        >
                          {feature.details.map((detail, i) => (
                            <li key={i}><CheckCircleOutlined /> {detail}</li>
                          ))}
                        </motion.ul>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <motion.div
                className="features-showcase"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 }}
              >
                <div className="showcase-card">
                  <div className="showcase-header">
                    <span style={{ color: features[activeFeature].color }}>
                      {features[activeFeature].icon}
                    </span>
                    <h3>{features[activeFeature].title}</h3>
                  </div>
                  <div className="showcase-content" style={{ padding: '20px' }}>
                    {/* Modül Akış Diyagramı */}
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        background: 'white',
                        padding: '15px 25px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: `2px solid ${features[activeFeature].color}`,
                        width: '100%',
                        maxWidth: '350px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ 
                            fontSize: '32px', 
                            color: features[activeFeature].color
                          }}>
                            {features[activeFeature].icon}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                              {features[activeFeature].title}
                            </h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666', marginTop: '4px' }}>
                              {features[activeFeature].description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Özellik Kartları */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '15px',
                        width: '100%',
                        maxWidth: '350px'
                      }}>
                        {features[activeFeature].details.map((detail, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                              background: 'white',
                              padding: '12px',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '14px',
                              color: '#333'
                            }}
                          >
                            <CheckCircleOutlined style={{ 
                              color: features[activeFeature].color,
                              fontSize: '16px',
                              flexShrink: 0
                            }} />
                            <span>{detail}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Entegrasyon Bilgisi */}
                      <div style={{
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        padding: '15px',
                        borderRadius: '10px',
                        width: '100%',
                        maxWidth: '350px',
                        textAlign: 'center'
                      }}>
                        <ApiOutlined style={{ 
                          fontSize: '24px', 
                          color: '#667eea',
                          marginBottom: '8px'
                        }} />
                        <p style={{ 
                          margin: 0, 
                          fontSize: '13px', 
                          color: '#555',
                          fontWeight: 500
                        }}>
                          Diğer modüllerle tam entegre çalışır
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section" ref={pricingRef}>
        <div className="container">
          <div className="section-header">
            <Tag color="purple" className="section-tag">Çözüm Önerileri</Tag>
            <Title level={2}>İşletmenize Özel ERP Çözümü</Title>
            <Paragraph>Sektörünüze ve büyüklüğünüze göre özelleştirilmiş paketler</Paragraph>
          </div>

          {/* İşletme Tipi Seçimi */}
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto 60px',
            textAlign: 'center'
          }}>
            <Title level={4} style={{ marginBottom: '20px' }}>İşletme tipinizi seçin:</Title>
            <Row gutter={[16, 16]} justify="center">
              <Col>
                <Card 
                  hoverable
                  onClick={() => handleBusinessTypeSelect('retail', 'Perakende')}
                  style={{ 
                    width: 180,
                    textAlign: 'center',
                    borderColor: selectedBusinessType === 'retail' ? '#667eea' : '#e8e8e8',
                    borderWidth: selectedBusinessType === 'retail' ? '2px' : '1px',
                    background: selectedBusinessType === 'retail' 
                      ? 'linear-gradient(135deg, #667eea25 0%, #764ba225 100%)'
                      : 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
                  }}
                >
                  <ShopOutlined style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }} />
                  <h4>Perakende</h4>
                  <p style={{ fontSize: '12px', color: '#666' }}>1-10 Mağaza</p>
                </Card>
              </Col>
              <Col>
                <Card 
                  hoverable
                  onClick={() => handleBusinessTypeSelect('production', 'Üretim')}
                  style={{ 
                    width: 180,
                    textAlign: 'center',
                    borderColor: selectedBusinessType === 'production' ? '#764ba2' : '#e8e8e8',
                    borderWidth: selectedBusinessType === 'production' ? '2px' : '1px',
                    background: selectedBusinessType === 'production'
                      ? 'linear-gradient(135deg, #764ba225 0%, #f093fb25 100%)'
                      : 'linear-gradient(135deg, #764ba215 0%, #f093fb15 100%)'
                  }}
                >
                  <GlobalOutlined style={{ fontSize: '32px', color: '#764ba2', marginBottom: '10px' }} />
                  <h4>Üretim</h4>
                  <p style={{ fontSize: '12px', color: '#666' }}>KOBİ & Büyük</p>
                </Card>
              </Col>
              <Col>
                <Card 
                  hoverable
                  onClick={() => handleBusinessTypeSelect('distribution', 'Dağıtım')}
                  style={{ 
                    width: 180,
                    textAlign: 'center',
                    borderColor: selectedBusinessType === 'distribution' ? '#f093fb' : '#e8e8e8',
                    borderWidth: selectedBusinessType === 'distribution' ? '2px' : '1px',
                    background: selectedBusinessType === 'distribution'
                      ? 'linear-gradient(135deg, #f093fb25 0%, #f5576c25 100%)'
                      : 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)'
                  }}
                >
                  <TruckOutlined style={{ fontSize: '32px', color: '#f093fb', marginBottom: '10px' }} />
                  <h4>Dağıtım</h4>
                  <p style={{ fontSize: '12px', color: '#666' }}>Toptan & Lojistik</p>
                </Card>
              </Col>
              <Col>
                <Card 
                  hoverable
                  onClick={() => handleBusinessTypeSelect('service', 'Hizmet')}
                  style={{ 
                    width: 180,
                    textAlign: 'center',
                    borderColor: selectedBusinessType === 'service' ? '#f5576c' : '#e8e8e8',
                    borderWidth: selectedBusinessType === 'service' ? '2px' : '1px',
                    background: selectedBusinessType === 'service'
                      ? 'linear-gradient(135deg, #f5576c25 0%, #ffa50025 100%)'
                      : 'linear-gradient(135deg, #f5576c15 0%, #ffa50015 100%)'
                  }}
                >
                  <CustomerServiceOutlined style={{ fontSize: '32px', color: '#f5576c', marginBottom: '10px' }} />
                  <h4>Hizmet</h4>
                  <p style={{ fontSize: '12px', color: '#666' }}>Servis & Danışmanlık</p>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Özelleştirilmiş Paketler */}
          <Row gutter={[32, 32]} justify="center">
            {currentPlans.map((plan, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={pricingInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      <CrownOutlined /> Önerilen
                    </div>
                  )}

                  <div style={{ 
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{ 
                      fontSize: '40px', 
                      color: plan.popular ? '#764ba2' : '#667eea',
                      marginBottom: '10px'
                    }}>
                      {plan.icon}
                    </div>
                  </div>
                  
                  <div className="pricing-header">
                    <h3>{plan.name}</h3>
                    <div className="pricing-amount">
                      <span className="currency">₺</span>
                      <span className="price">{plan.price}</span>
                      <span className="period">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="pricing-features">
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        {feature.includes('Sınırsız') || feature.includes('Tüm') 
                          ? <strong>{feature}</strong> 
                          : feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    type={plan.popular ? 'primary' : 'default'}
                    size="large"
                    block
                    className="pricing-button"
                    onClick={() => navigate('/register')}
                  >
                    {index === 2 ? 'Teklif Al' : plan.popular ? 'Ücretsiz Dene' : 'Hemen Başla'}
                  </Button>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Karşılaştırma Tablosu Butonu */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Button 
              icon={<BarChartOutlined />}
              size="large"
              style={{ marginRight: '10px' }}
              onClick={() => {
                notification.info({
                  message: 'Karşılaştırma Tablosu',
                  description: 'Detaylı paket karşılaştırma tablosu yakında eklenecek! Şu an için paket özelliklerini yukarıda görebilirsiniz.',
                  placement: 'topRight',
                  duration: 4,
                  icon: <BarChartOutlined style={{ color: '#667eea' }} />
                });
              }}
            >
              Detaylı Karşılaştırma
            </Button>
            <Button 
              icon={<CustomerServiceOutlined />}
              size="large"
              onClick={() => navigate('/register')}
            >
              Danışmanlık Al
            </Button>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <SolutionsSection />

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section" ref={testimonialsRef}>
        <div className="container">
          <div className="section-header">
            <Tag color="purple" className="section-tag">Referanslar</Tag>
            <Title level={2}>Müşterilerimiz Ne Diyor?</Title>
            <Paragraph>Stocker ERP'yi tercih eden işletmelerden geri bildirimler</Paragraph>
          </div>

          {/* Client Logos */}
          <div className="client-logos">
            <motion.div 
              className="logos-container"
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              {[
                { name: 'TechCorp', bg: '#667eea' },
                { name: 'GlobalTrade', bg: '#764ba2' },
                { name: 'RetailPlus', bg: '#f093fb' },
                { name: 'LogiMove', bg: '#4facfe' },
                { name: 'ProdFactory', bg: '#43e97b' },
                { name: 'ServicePro', bg: '#fa709a' }
              ].map((client, index) => (
                <motion.div
                  key={index}
                  className="logo-card"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="logo-placeholder"
                    style={{ background: `linear-gradient(135deg, ${client.bg}20, ${client.bg}10)` }}
                  >
                    <span style={{ color: client.bg, fontWeight: 700, fontSize: 18 }}>
                      {client.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <Row gutter={[32, 32]} style={{ marginTop: 60 }}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className="testimonial-card-modern"
                >
                  <div className="testimonial-header">
                    <Avatar 
                      src={testimonial.avatar} 
                      size={64} 
                      style={{ border: '4px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Rate disabled defaultValue={testimonial.rating} style={{ marginTop: 12 }} />
                  </div>
                  <p className="testimonial-comment">"{testimonial.comment}"</p>
                  <div className="testimonial-footer">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.position}</span>
                    <div className="company-badge">{testimonial.company}</div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Demo Booking */}
      <DemoBooking />

      {/* Partners Section */}
      <PartnersSection />

      {/* FAQ Section */}
      <FAQSection />


      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="cta-content"
          >
            <TrophyOutlined className="cta-icon" />
            <Title level={2} className="cta-title">
              İşletmenizi Dijitalleştirmeye Hazır mısınız?
            </Title>
            <Paragraph className="cta-description">
              14 gün ücretsiz deneme ile risk almadan başlayın
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
                className="cta-button-secondary"
                onClick={() => window.location.href = 'mailto:info@stoocker.app'}
              >
                İletişime Geçin
              </Button>
            </Space>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="container">
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="footer-brand">
                <RocketOutlined /> Stocker
              </div>
              <p>Modern işletmeler için dijital dönüşüm platformu</p>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <h4>Ürün</h4>
              <ul>
                <li><a href="#">Özellikler</a></li>
                <li><a href="#">Fiyatlandırma</a></li>
                <li><a href="#">Entegrasyonlar</a></li>
              </ul>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <h4>Şirket</h4>
              <ul>
                <li><a href="#">Hakkımızda</a></li>
                <li><a href="#">Kariyer</a></li>
                <li><a href="#">İletişim</a></li>
              </ul>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <h4>Destek</h4>
              <ul>
                <li><a href="#">Yardım Merkezi</a></li>
                <li><a href="#">API Dokümantasyon</a></li>
                <li><a href="#">Durum</a></li>
              </ul>
            </Col>
          </Row>
          <Divider />
          <div className="footer-bottom">
            <p>© 2024 Stocker. Tüm hakları saklıdır.</p>
            <Space>
              <a href="#">Gizlilik</a>
              <a href="#">Şartlar</a>
              <a href="#">Çerezler</a>
            </Space>
          </div>
        </div>
      </footer>
    </div>
  );
};