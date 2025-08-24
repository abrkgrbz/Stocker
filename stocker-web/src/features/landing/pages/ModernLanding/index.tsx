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
  Divider
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
  FireOutlined
} from '@ant-design/icons';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './style.css';

const { Title, Paragraph, Text } = Typography;

export const ModernLanding: React.FC = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const { ref: statsRef, inView: statsInView } = useInView({ triggerOnce: true });
  const { ref: featuresRef, inView: featuresInView } = useInView({ triggerOnce: true });

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

  const features = [
    {
      icon: <DashboardOutlined />,
      title: 'Akıllı Dashboard',
      description: 'Tüm iş süreçlerinizi tek ekrandan yönetin',
      color: '#667eea',
      details: ['Gerçek zamanlı veriler', 'Özelleştirilebilir widgetlar', 'Mobil uyumlu']
    },
    {
      icon: <BarChartOutlined />,
      title: 'Güçlü Analizler',
      description: 'Verilerinizi anlamlı içgörülere dönüştürün',
      color: '#764ba2',
      details: ['AI destekli raporlar', 'Tahmine dayalı analizler', 'Otomatik öneriler']
    },
    {
      icon: <TeamOutlined />,
      title: 'Ekip Yönetimi',
      description: 'Ekibinizle mükemmel uyum içinde çalışın',
      color: '#f093fb',
      details: ['Rol bazlı yetkiler', 'Performans takibi', 'İletişim araçları']
    },
    {
      icon: <SafetyOutlined />,
      title: 'Maksimum Güvenlik',
      description: 'Verileriniz güvende, işiniz rahat',
      color: '#f5576c',
      details: ['256-bit şifreleme', 'İki faktörlü doğrulama', 'Günlük yedekleme']
    }
  ];

  const stats = [
    { value: 15000, suffix: '+', label: 'Mutlu Müşteri', icon: <HeartFilled /> },
    { value: 99.9, suffix: '%', label: 'Uptime Garantisi', icon: <ThunderboltOutlined /> },
    { value: 50, suffix: '+', label: 'Entegrasyon', icon: <ApiOutlined /> },
    { value: 24, suffix: '/7', label: 'Destek', icon: <CustomerServiceOutlined /> }
  ];

  const pricingPlans = [
    {
      name: 'Başlangıç',
      price: 299,
      period: 'aylık',
      features: ['5 Kullanıcı', '10GB Depolama', 'Temel Raporlar', 'Email Destek'],
      popular: false
    },
    {
      name: 'Profesyonel',
      price: 599,
      period: 'aylık',
      features: ['25 Kullanıcı', '100GB Depolama', 'Gelişmiş Raporlar', '7/24 Destek', 'API Erişimi'],
      popular: true
    },
    {
      name: 'Kurumsal',
      price: 1299,
      period: 'aylık',
      features: ['Sınırsız Kullanıcı', 'Sınırsız Depolama', 'Özel Raporlar', 'Özel Destek', 'White Label'],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      company: 'Tech Startup',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      rating: 5,
      comment: 'Stocker sayesinde işlerimizi %70 hızlandırdık. Mükemmel bir platform!'
    },
    {
      name: 'Ayşe Demir',
      company: 'E-Commerce Co',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      rating: 5,
      comment: 'Stok yönetimi hiç bu kadar kolay olmamıştı. Kesinlikle tavsiye ediyorum.'
    },
    {
      name: 'Mehmet Kara',
      company: 'Retail Chain',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      rating: 5,
      comment: 'Müşteri desteği harika! Her sorunumuzda yanımızdalar.'
    }
  ];

  return (
    <div className="modern-landing">
      {/* Navigation */}
      <motion.nav 
        className="modern-nav"
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
            <a href="#pricing">Fiyatlandırma</a>
            <a href="#testimonials">Referanslar</a>
            <Button type="default" onClick={() => navigate('/login')}>Giriş</Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Ücretsiz Başla
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
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
                animationDelay: `${i * 0.3}s`
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
            <Badge.Ribbon text="🎉 Yeni" color="purple">
              <Tag color="purple" style={{ marginBottom: 20, padding: '4px 16px' }}>
                <FireOutlined /> 14 Gün Ücretsiz Deneme
              </Tag>
            </Badge.Ribbon>
            
            <Title level={1} className="hero-title">
              {displayText}
              <span className="cursor-blink">|</span>
            </Title>
            
            <Title level={2} className="hero-subtitle">
              Stocker ERP ile <span className="gradient-text">Geleceği</span> Bugünden Yaşayın
            </Title>
            
            <Paragraph className="hero-description">
              Yapay zeka destekli, bulut tabanlı ve tamamen entegre iş yönetim platformu.
              İşletmenizi bir üst seviyeye taşıyın.
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
              <img src="/dashboard-preview.png" alt="Dashboard" />
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
            <Tag color="purple" className="section-tag">Özellikler</Tag>
            <Title level={2}>Neden Stocker?</Title>
            <Paragraph>İşletmenizi büyütmek için ihtiyacınız olan her şey</Paragraph>
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
                  <div className="showcase-content">
                    <img src={`/feature-${activeFeature + 1}.png`} alt="Feature" />
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-header">
            <Tag color="purple" className="section-tag">Fiyatlandırma</Tag>
            <Title level={2}>Size Uygun Planı Seçin</Title>
            <Paragraph>İhtiyacınıza göre ölçeklenebilir fiyatlandırma</Paragraph>
          </div>

          <Row gutter={[32, 32]} justify="center">
            {pricingPlans.map((plan, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      <CrownOutlined /> En Popüler
                    </div>
                  )}
                  
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
                        {feature}
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
                    Başla
                  </Button>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <Tag color="purple" className="section-tag">Referanslar</Tag>
            <Title level={2}>Müşterilerimiz Ne Diyor?</Title>
            <Paragraph>15.000+ işletme Stocker'a güveniyor</Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="testimonial-card"
                >
                  <Rate disabled defaultValue={testimonial.rating} />
                  <p className="testimonial-comment">"{testimonial.comment}"</p>
                  <div className="testimonial-author">
                    <Avatar src={testimonial.avatar} size={48} />
                    <div>
                      <h4>{testimonial.name}</h4>
                      <span>{testimonial.company}</span>
                    </div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

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