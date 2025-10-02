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
  App,
  Affix
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
  TruckOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { FAQSection } from '@/features/landing/components/FAQSection';
import { ComparisonTable } from '@/features/landing/components/ComparisonTable';
import { SectionDivider } from '@/features/landing/components/SectionDivider';
import { TenantLoginModal } from '@/features/auth/components/TenantLoginModal';
import { Logo } from '@/shared/components/Logo';
import { isTenantDomain } from '@/utils/tenant';
import './style.css';

const { Title, Paragraph, Text } = Typography;

export const ModernLanding: React.FC = () => {
  const navigate = useNavigate();
  const { modal, notification } = App.useApp();
  const [activeFeature, setActiveFeature] = useState(0);
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [showTenantModal, setShowTenantModal] = useState(false);
  
  // Section IDs for navigation
  const sections = [
    { id: 'hero', name: 'Ana Sayfa', icon: '🏠' },
    { id: 'stats', name: 'İstatistikler', icon: '📊' },
    { id: 'features', name: 'Özellikler', icon: '✨' },
    { id: 'testimonials', name: 'Referanslar', icon: '💬' },
    { id: 'comparison', name: 'Karşılaştırma', icon: '⚖️' },
    { id: 'faq', name: 'SSS', icon: '❓' }
  ];

  // Scroll listener for navigation and parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setScrollY(window.scrollY);
      setShowScrollTop(window.scrollY > 500);

      // Detect active section
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
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
      highlights: [
        { label: 'Müşteri Yönetimi', value: 'Detaylı müşteri kartları ve iletişim geçmişi' },
        { label: 'Satış Pipeline', value: 'Fırsatları takip edin ve dönüşüm oranlarınızı artırın' },
        { label: 'Otomasyonlar', value: 'Hatırlatmalar ve görev atamaları ile verimliliği artırın' },
        { label: 'Analiz & Raporlama', value: 'Satış performansınızı detaylı raporlarla izleyin' }
      ],
      stats: { users: '10K+', efficiency: '%45', time: '2 saat/gün' }
    },
    {
      icon: <AppstoreOutlined />,
      title: 'Stok Yönetimi',
      description: 'Envanter kontrolünü tamamen dijitalleştirin',
      color: '#764ba2',
      highlights: [
        { label: 'Gerçek Zamanlı Takip', value: 'Stok hareketlerini anlık olarak görüntüleyin' },
        { label: 'Barkod & QR Kod', value: 'Hızlı ve hatasız stok girişi/çıkışı yapın' },
        { label: 'Akıllı Uyarılar', value: 'Minimum ve maksimum stok seviyesi bildirimleri' },
        { label: 'Çoklu Depo', value: 'Tüm depolarınızı tek platformdan yönetin' }
      ],
      stats: { products: '100K+', accuracy: '%99.9', warehouses: '50+' }
    },
    {
      icon: <BarChartOutlined />,
      title: 'Satış & Faturalama',
      description: 'Satış süreçlerinizi baştan sona dijitalleştirin',
      color: '#f093fb',
      highlights: [
        { label: 'E-Fatura & E-Arşiv', value: 'GİB entegrasyonu ile otomatik fatura oluşturma' },
        { label: 'Teklif Yönetimi', value: 'Profesyonel teklifler hazırlayın ve takip edin' },
        { label: 'Sipariş Takibi', value: 'Siparişten teslimata tüm süreci yönetin' },
        { label: 'Tahsilat Yönetimi', value: 'Vadeli satışları ve tahsilatları takip edin' }
      ],
      stats: { invoices: '1M+', integration: 'GİB Onaylı', speed: '10x' }
    },
    {
      icon: <DashboardOutlined />,
      title: 'Finans & Muhasebe',
      description: 'Mali süreçlerinizi kontrol altına alın',
      color: '#f5576c',
      highlights: [
        { label: 'Gelir-Gider Takibi', value: 'Nakit akışınızı anlık olarak görüntüleyin' },
        { label: 'Bütçe Planlama', value: 'Departman bazlı bütçeler oluşturun ve takip edin' },
        { label: 'Mali Tablolar', value: 'Bilanço, kar-zarar ve diğer mali raporlar' },
        { label: 'Vergi Yönetimi', value: 'KDV, stopaj ve diğer vergi hesaplamaları' }
      ],
      stats: { transactions: '10M+', reports: '50+', compliance: '%100' }
    },
    {
      icon: <UserOutlined />,
      title: 'İnsan Kaynakları',
      description: 'Modern İK yönetimi için komple çözüm',
      color: '#4facfe',
      highlights: [
        { label: 'Personel Yönetimi', value: 'Dijital özlük dosyaları ve organizasyon şeması' },
        { label: 'İzin & Vardiya', value: 'İzin talepleri ve vardiya planlaması' },
        { label: 'Bordro İşlemleri', value: 'Maaş, prim ve kesintileri otomatik hesaplama' },
        { label: 'Performans Takibi', value: '360 derece performans değerlendirme sistemi' }
      ],
      stats: { employees: '50K+', automation: '%80', satisfaction: '4.8/5' }
    },
    {
      icon: <GlobalOutlined />,
      title: 'Üretim Planlama',
      description: 'Üretim süreçlerinizi optimize edin',
      color: '#43e97b',
      highlights: [
        { label: 'İş Emirleri', value: 'Üretim emirlerini dijital olarak yönetin' },
        { label: 'Reçete Yönetimi', value: 'Ürün reçetelerini ve maliyetlerini takip edin' },
        { label: 'Kapasite Planlama', value: 'Makine ve işgücü kapasitesini optimize edin' },
        { label: 'Kalite Kontrol', value: 'Üretim sürecinde kalite kontrol noktaları' }
      ],
      stats: { production: '1M+ ürün', optimization: '%35', quality: '%99.5' }
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
            <Logo width={140} height={36} style={{ cursor: 'pointer' }} />
          </div>
          <div className="nav-menu">
            <a 
              className={activeSection === 'features' ? 'active' : ''}
              onClick={() => scrollToSection('features')} 
              style={{ cursor: 'pointer' }}
            >
              Özellikler
            </a>
            <a 
              className={activeSection === 'stats' ? 'active' : ''}
              onClick={() => scrollToSection('stats')} 
              style={{ cursor: 'pointer' }}
            >
              İstatistikler
            </a>
            <a 
              className={activeSection === 'comparison' ? 'active' : ''}
              onClick={() => scrollToSection('comparison')} 
              style={{ cursor: 'pointer' }}
            >
              Fiyatlandırma
            </a>
            <a 
              className={activeSection === 'testimonials' ? 'active' : ''}
              onClick={() => scrollToSection('testimonials')} 
              style={{ cursor: 'pointer' }}
            >
              Referanslar
            </a>
            <a onClick={() => navigate('/blog')} style={{ cursor: 'pointer' }}>Blog</a>
            <a 
              className={activeSection === 'faq' ? 'active' : ''}
              onClick={() => scrollToSection('faq')} 
              style={{ cursor: 'pointer' }}
            >
              SSS
            </a>
            <Button type="default" onClick={() => setShowTenantModal(true)}>Giriş</Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Ücretsiz Başla
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Section Navigation Dots */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'fixed',
          left: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
        className="section-navigation"
      >
        {sections.map((section) => (
          <Tooltip
            key={section.id}
            title={`${section.icon} ${section.name}`}
            placement="right"
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scrollToSection(section.id)}
              style={{
                width: activeSection === section.id ? '40px' : '12px',
                height: '12px',
                borderRadius: '6px',
                background: activeSection === section.id
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : '#cbd5e0',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeSection === section.id
                  ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                  : 'none'
              }}
            />
          </Tooltip>
        ))}
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollY / (document.documentElement.scrollHeight - window.innerHeight) }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          transformOrigin: 'left',
          zIndex: 1001,
          transition: 'transform 0.1s'
        }}
      />

      {/* Hero Section */}
      <section id="hero" className="hero-section">
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

      {/* Section Divider */}
      <SectionDivider type="curve" color="#f7fafc" height={80} />

      {/* Stats Section */}
      <section id="stats" className="stats-section" ref={statsRef}>
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

      {/* Section Divider */}
      <SectionDivider type="curve" color="#f7fafc" height={80} />

      {/* Features Section */}
      <section id="features" className="features-section" ref={featuresRef}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={featuresInView ? { opacity: 1 } : {}}
            className="section-header"
          >
            <Tag color="purple" className="section-tag">ERP Modülleri</Tag>
            <Title level={2}>İşletmenizi Dijitalleştiren 6 Ana Modül</Title>
            <Paragraph>Her departman için özel tasarlanmış, birbiriyle entegre çalışan güçlü modüller</Paragraph>
          </motion.div>

          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="feature-card-modern"
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    }}
                  >
                    {/* Gradient Header */}
                    <div style={{
                      background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
                      padding: '24px',
                      marginBottom: '20px',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        color: feature.color,
                        marginBottom: '12px'
                      }}>
                        {feature.icon}
                      </div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        margin: '0 0 8px 0',
                        color: '#1a202c'
                      }}>
                        {feature.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#718096',
                        margin: 0,
                        lineHeight: '1.5'
                      }}>
                        {feature.description}
                      </p>
                    </div>

                    {/* Key Features */}
                    <div style={{ padding: '0 24px 24px' }}>
                      <div style={{ marginBottom: '20px' }}>
                        {feature.highlights.slice(0, 3).map((highlight, i) => (
                          <div key={i} style={{
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px'
                          }}>
                            <CheckCircleOutlined style={{
                              color: feature.color,
                              fontSize: '16px',
                              marginTop: '2px',
                              flexShrink: 0
                            }} />
                            <div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#2d3748',
                                marginBottom: '2px'
                              }}>
                                {highlight.label}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: '#718096',
                                lineHeight: '1.4'
                              }}>
                                {highlight.value}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Stats Bar */}
                      <div style={{
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '16px',
                        display: 'flex',
                        justifyContent: 'space-around',
                        textAlign: 'center'
                      }}>
                        {Object.entries(feature.stats).slice(0, 3).map(([key, value], i) => (
                          <div key={i}>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: feature.color
                            }}>
                              {value}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#a0aec0',
                              textTransform: 'capitalize',
                              marginTop: '2px'
                            }}>
                              {key === 'users' ? 'Kullanıcı' : 
                               key === 'efficiency' ? 'Verimlilik' :
                               key === 'time' ? 'Tasarruf' :
                               key === 'products' ? 'Ürün' :
                               key === 'accuracy' ? 'Doğruluk' :
                               key === 'warehouses' ? 'Depo' :
                               key === 'invoices' ? 'Fatura' :
                               key === 'integration' ? 'Entegrasyon' :
                               key === 'speed' ? 'Hız' :
                               key === 'transactions' ? 'İşlem' :
                               key === 'reports' ? 'Rapor' :
                               key === 'compliance' ? 'Uyumluluk' :
                               key === 'employees' ? 'Çalışan' :
                               key === 'automation' ? 'Otomasyon' :
                               key === 'satisfaction' ? 'Memnuniyet' :
                               key === 'production' ? 'Üretim' :
                               key === 'optimization' ? 'Optimizasyon' :
                               key === 'quality' ? 'Kalite' : key}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Learn More Button */}
                      <Button
                        type="link"
                        style={{
                          padding: 0,
                          marginTop: '16px',
                          color: feature.color,
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                        onClick={() => {
                          modal.info({
                            title: feature.title,
                            width: 600,
                            content: (
                              <div>
                                <p style={{ marginBottom: '20px' }}>{feature.description}</p>
                                <h4 style={{ marginBottom: '12px', fontWeight: '600' }}>Öne Çıkan Özellikler:</h4>
                                {feature.highlights.map((highlight, i) => (
                                  <div key={i} style={{ marginBottom: '12px' }}>
                                    <strong>{highlight.label}:</strong> {highlight.value}
                                  </div>
                                ))}
                                <Divider />
                                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                  {Object.entries(feature.stats).map(([key, value], i) => (
                                    <div key={i}>
                                      <div style={{ fontSize: '20px', fontWeight: '600', color: feature.color }}>
                                        {value}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#718096' }}>
                                        {key === 'users' ? 'Aktif Kullanıcı' : 
                                         key === 'efficiency' ? 'Verimlilik Artışı' :
                                         key === 'time' ? 'Zaman Tasarrufu' :
                                         key === 'products' ? 'Yönetilen Ürün' :
                                         key === 'accuracy' ? 'Envanter Doğruluğu' :
                                         key === 'warehouses' ? 'Desteklenen Depo' :
                                         key === 'invoices' ? 'Aylık Fatura' :
                                         key === 'integration' ? '' :
                                         key === 'speed' ? 'Daha Hızlı' :
                                         key === 'transactions' ? 'Yıllık İşlem' :
                                         key === 'reports' ? 'Hazır Rapor' :
                                         key === 'compliance' ? 'Yasal Uyumluluk' :
                                         key === 'employees' ? 'Yönetilen Personel' :
                                         key === 'automation' ? 'Süreç Otomasyonu' :
                                         key === 'satisfaction' ? 'Kullanıcı Puanı' :
                                         key === 'production' ? '' :
                                         key === 'optimization' ? 'Maliyet Azalması' :
                                         key === 'quality' ? 'Kalite Oranı' : key}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ),
                            okText: 'Tamam',
                            okButtonProps: { type: 'primary' },
                            centered: true
                          });
                        }}
                      >
                        Detaylı Bilgi <ArrowRightOutlined style={{ fontSize: '12px' }} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Integration Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{
              marginTop: '60px',
              textAlign: 'center'
            }}
          >
            <Card
              style={{
                background: 'linear-gradient(135deg, #667eea15, #764ba205)',
                border: 'none',
                borderRadius: '16px',
                padding: '32px'
              }}
            >
              <ApiOutlined style={{ fontSize: '48px', color: '#667eea', marginBottom: '16px' }} />
              <Title level={3} style={{ marginBottom: '12px' }}>Tam Entegre Çalışma</Title>
              <Paragraph style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
                Tüm modüller birbiriyle senkronize çalışır. Bir modülde yapılan değişiklik, 
                ilgili tüm modüllerde otomatik olarak güncellenir.
              </Paragraph>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider type="curve" color="#f7fafc" height={80} />

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

      {/* Section Divider */}
      <SectionDivider type="curve" color="#f7fafc" height={80} />

      {/* Comparison Table */}
      <section id="comparison">
        <ComparisonTable />
      </section>

      {/* Section Divider */}
      <SectionDivider type="curve" color="#f7fafc" height={80} />

      {/* FAQ Section */}
      <section id="faq">
        <FAQSection />
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="container">
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="footer-brand">
                <Logo width={120} height={32} />
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

      {/* Scroll to Top Button */}
      <Affix style={{ position: 'fixed', bottom: 40, right: 40 }}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<ArrowUpOutlined />}
          onClick={scrollToTop}
          style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.35)',
            fontSize: '20px',
            display: showScrollTop ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </Affix>

      {/* Tenant Login Modal */}
      <TenantLoginModal
        visible={showTenantModal}
        onClose={() => setShowTenantModal(false)}
      />
    </div>
  );
};