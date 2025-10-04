import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Layout, Button, Card, Row, Col, Typography, Space, Tag, Divider } from 'antd';

import { useScrollToSection } from '@/shared/hooks/useScrollToSection';
import {
  RocketOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ApiOutlined,
  AppstoreOutlined,
  DollarOutlined,
  UserOutlined,
  ToolOutlined,
  MenuOutlined,
  CompassOutlined,
  DatabaseOutlined,
  ShopOutlined,
  FundProjectionScreenOutlined,
  TruckOutlined,
  ShoppingCartOutlined,
  PieChartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { AnimatedHero } from '@/features/landing/components/AnimatedHero';
import { FeaturesSection } from '@/features/landing/components/FeaturesSection';
import { TestimonialsSection } from '@/features/landing/components/TestimonialsSection';
import { StatsSection } from '@/features/landing/components/StatsSection';
import { FloatingActionButton } from '@/features/landing/components/FloatingActionButton';
import { FAQSection } from '@/features/landing/components/FAQSection';
import { SolutionsSection } from '@/features/landing/components/SolutionsSection';
import { TrustBadges } from '@/features/landing/components/TrustBadges';
import { CustomerLogos } from '@/features/landing/components/CustomerLogos';
import { DemoBookingModal } from '@/features/landing/components/DemoBookingModal';
import { mainModules } from '@/features/landing/data/modules';
import './style.css';
import './corporate-style.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollToSection } = useScrollToSection();
  const [scrolled, setScrolled] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


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
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Özellikler</a>
            <a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToSection('solutions'); }}>Çözümler</a>
            <a href="#modules" onClick={(e) => { e.preventDefault(); scrollToSection('modules'); }}>Modüller</a>
            <a onClick={() => navigate('/pricing')} style={{ cursor: 'pointer' }}>Fiyatlandırma</a>
            <a onClick={() => navigate('/training')} style={{ cursor: 'pointer' }}>Eğitimler</a>
            <a onClick={() => navigate('/blog')} style={{ cursor: 'pointer' }}>Blog</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>SSS</a>
          </nav>
          <div className="header-actions">
            <Button
              onClick={() => setShowDemoModal(true)}
              icon={<CalendarOutlined />}
              style={{
                marginRight: '8px',
                color: scrolled ? '#667eea' : 'white',
                borderColor: scrolled ? '#667eea' : 'white'
              }}
            >
              Demo İste
            </Button>
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
        <AnimatedHero onDemoClick={() => setShowDemoModal(true)} />

        {/* Trust Badges - Social Proof */}
        <section style={{ padding: '40px 20px', background: 'white' }}>
          <div className="section-container">
            <TrustBadges />
          </div>
        </section>

        {/* Customer Logos */}
        <CustomerLogos />

        {/* Stats Section */}
        <StatsSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Solutions Section */}
        <SolutionsSection />

        {/* Main Modules Section */}
        <section id="modules" className="modules-section">
          <div className="section-container">
            <div className="section-header">
              <Tag color="purple" style={{ marginBottom: 16 }}>
                <AppstoreOutlined /> Ana Modüller
              </Tag>
              <Typography.Title level={2}>İşletmenizi Güçlendirecek Ana Modüller</Typography.Title>
              <Typography.Paragraph>
                Entegre çalışan modüller ile tüm iş süreçlerinizi tek platformdan yönetin
              </Typography.Paragraph>
            </div>
            
            {/* Additional Modules */}
            <Divider style={{ margin: '48px 0' }}>
              <Typography.Title level={4}>Ek Modüller</Typography.Title>
            </Divider>
            <Row gutter={[24, 24]}>
              {additionalModules.map((module, index) => (
                <Col xs={12} sm={8} lg={4} key={index}>
                  <Card 
                    className="module-card slide-up"
                    hoverable
                    variant="borderless"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="module-icon" style={{ color: '#667eea', fontSize: 32 }}>
                      {module.icon}
                    </div>
                    <Typography.Title level={5} style={{ marginBottom: 4 }}>{module.name}</Typography.Title>
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>{module.description}</Typography.Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Integration Section */}
        <section className="integration-section">
          <div className="section-container">
            <div className="section-header">
              <Tag color="purple" style={{ marginBottom: 16 }}>
                <ApiOutlined /> Entegrasyonlar
              </Tag>
              <Typography.Title level={2}>Hazır Entegrasyonlar</Typography.Title>
              <Typography.Paragraph>
                Kullandığınız tüm sistemlerle uyumlu çalışır
              </Typography.Paragraph>
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
        <section id="contact" className="cta-section">
          <div className="section-container">
            <Card className="cta-card" variant="borderless">
              <Typography.Title level={2} style={{ color: 'white' }}>
                İşletmenizi Dijitalleştirmeye Hazır mısınız?
              </Typography.Title>
              <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.95)', fontSize: 20, maxWidth: 700, margin: '0 auto 40px' }}>
                14 gün ücretsiz deneme sürümüyle başlayın. 
                Kredi kartı gerekmez, hemen kullanmaya başlayın.
              </Typography.Paragraph>
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
                    <Typography.Text style={{ color: 'white', fontSize: 16 }}>Kurulum ücreti yok</Typography.Text>
                  </div>
                  <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ fontSize: 20 }} />
                    <Typography.Text style={{ color: 'white', fontSize: 16 }}>İstediğiniz zaman iptal</Typography.Text>
                  </div>
                  <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ fontSize: 20 }} />
                    <Typography.Text style={{ color: 'white', fontSize: 16 }}>7/24 destek</Typography.Text>
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
                <Typography.Paragraph type="secondary">
                  Türkiye'nin en kapsamlı işletme yönetim platformu. 
                  Tüm iş süreçleriniz tek çatı altında.
                </Typography.Paragraph>
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
                <Typography.Title level={5}>Ürün</Typography.Title>
                <ul className="footer-links">
                  <li><a href="#features">Özellikler</a></li>
                  <li><a href="#solutions">Çözümler</a></li>
                  <li><a href="#modules">Modüller</a></li>
                  <li><a onClick={() => navigate('/pricing')} style={{ cursor: 'pointer' }}>Fiyatlandırma</a></li>
                  <li><a href="#faq">SSS</a></li>
                </ul>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="footer-section">
                <Typography.Title level={5}>Şirket</Typography.Title>
                <ul className="footer-links">
                  <li><a href="#">Hakkımızda</a></li>
                  <li><a href="#">Kariyer</a></li>
                  <li><a onClick={() => navigate('/blog')} style={{ cursor: 'pointer' }}>Blog</a></li>
                  <li><a href="#">İletişim</a></li>
                  <li><a href="#">Basın Kiti</a></li>
                </ul>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div className="footer-section">
                <Typography.Title level={5}>Destek</Typography.Title>
                <ul className="footer-links">
                  <li><a href="#">Yardım Merkezi</a></li>
                  <li><a onClick={() => navigate('/training')} style={{ cursor: 'pointer' }}>Eğitim ve Videolar</a></li>
                  <li><a href="#">Kullanım Kılavuzu</a></li>
                  <li><a href="#">SSS</a></li>
                  <li><a href="#">Sistem Durumu</a></li>
                </ul>
                <div style={{ marginTop: 16 }}>
                  <Typography.Text type="secondary">Destek Hattı:</Typography.Text>
                  <br />
                  <Typography.Text strong style={{ fontSize: 18 }}>0850 123 45 67</Typography.Text>
                </div>
              </div>
            </Col>
          </Row>
          <Divider />
          <div className="footer-bottom">
            <Row align="middle" justify="space-between">
              <Col>
                <Typography.Text type="secondary">
                  © 2024 Stocker. Tüm hakları saklıdır.
                </Typography.Text>
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
      
      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Demo Booking Modal */}
      <DemoBookingModal
        visible={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </Layout>
  );
};