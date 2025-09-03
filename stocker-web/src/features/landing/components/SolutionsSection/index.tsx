import React from 'react';
import { Row, Col, Card, Typography, Tag, Button } from 'antd';
import {
  ShopOutlined,
  ToolOutlined,
  CustomerServiceOutlined,
  TruckOutlined,
  MedicineBoxOutlined,
  BookOutlined,
  CoffeeOutlined,
  BuildOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import './style.css';

const { Title, Paragraph, Text } = Typography;

const solutions = [
  {
    id: 'retail',
    title: 'Perakende',
    icon: <ShopOutlined />,
    description: 'Mağaza ve zincir mağazalar için komple çözüm',
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    features: [
      'POS entegrasyonu',
      'Stok yönetimi',
      'Müşteri sadakati'
    ],
    metric: '+%40',
    metricLabel: 'Stok Devir Hızı'
  },
  {
    id: 'manufacturing',
    title: 'Üretim',
    icon: <ToolOutlined />,
    description: 'Üretim planlama ve takip sistemi',
    color: '#764ba2',
    gradient: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
    features: [
      'Üretim planlama',
      'Maliyet hesaplama',
      'Kalite kontrol'
    ],
    metric: '+%25',
    metricLabel: 'Verimlilik Artışı'
  },
  {
    id: 'services',
    title: 'Hizmet',
    icon: <CustomerServiceOutlined />,
    description: 'Servis ve hizmet işletmeleri için',
    color: '#f093fb',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    features: [
      'Randevu yönetimi',
      'Proje takibi',
      'Müşteri portali'
    ],
    metric: '%95',
    metricLabel: 'Müşteri Memnuniyeti'
  },
  {
    id: 'logistics',
    title: 'Lojistik',
    icon: <TruckOutlined />,
    description: 'Nakliye ve kargo yönetimi',
    color: '#4facfe',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    features: [
      'Araç takibi',
      'Rota optimizasyonu',
      'Sevkiyat planlama'
    ],
    metric: '-%30',
    metricLabel: 'Teslimat Süresi'
  }
];

export const SolutionsSection: React.FC = () => {
  return (
    <section className="solutions-section" id="solutions">
      <div className="section-container">
        <div className="section-header">
          <Tag color="purple" style={{ marginBottom: 16 }}>
            <BuildOutlined /> Sektörel Çözümler
          </Tag>
          <Title level={2}>Her Sektöre Özel Çözümler</Title>
          <Paragraph>
            İşletmenizin ihtiyaçlarına göre özelleştirilmiş, sektöre özel çözümlerimizle 
            verimliliğinizi artırın ve rekabette öne geçin
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          {solutions.map((solution, index) => (
            <Col xs={24} sm={12} lg={6} key={solution.id}>
              <Card 
                className="solution-card-modern"
                hoverable
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="solution-header" style={{ background: solution.gradient }}>
                  <div className="solution-icon-wrapper">
                    <span style={{ fontSize: 40, color: 'white' }}>
                      {solution.icon}
                    </span>
                  </div>
                  <div className="solution-metric">
                    <div className="metric-value">{solution.metric}</div>
                    <div className="metric-label">{solution.metricLabel}</div>
                  </div>
                </div>
                
                <div className="solution-content">
                  <Title level={4} className="solution-title-modern">
                    {solution.title}
                  </Title>
                  
                  <Paragraph className="solution-description-modern">
                    {solution.description}
                  </Paragraph>
                  
                  <div className="solution-features-modern">
                    {solution.features.map((feature, idx) => (
                      <div key={idx} className="feature-tag">
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    type="primary"
                    block
                    className="solution-cta"
                    style={{ 
                      background: solution.gradient,
                      border: 'none',
                      height: 40,
                      fontWeight: 600,
                      marginTop: 20
                    }}
                  >
                    Keşfet <ArrowRightOutlined />
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="solutions-cta">
          <Card className="cta-card-gradient">
            <Row align="middle" gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <Title level={3} style={{ color: 'white', marginBottom: 8 }}>
                  Sektörünüze özel çözümü keşfedin
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0 }}>
                  Uzman ekibimiz size özel demo hazırlayarak işletmenizin ihtiyaçlarına 
                  en uygun çözümü sunar
                </Paragraph>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    background: 'white', 
                    color: '#667eea',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  Ücretsiz Demo Talep Et
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </section>
  );
};