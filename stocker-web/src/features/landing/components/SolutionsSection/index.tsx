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
    features: [
      'POS entegrasyonu',
      'Stok yönetimi',
      'Kasa yönetimi',
      'Müşteri sadakat programı',
      'Şube bazlı raporlama'
    ],
    caseStudy: '35 şubeli perakende zinciri stok devir hızını %40 artırdı'
  },
  {
    id: 'manufacturing',
    title: 'Üretim',
    icon: <ToolOutlined />,
    description: 'Üretim planlama ve takip sistemi',
    color: '#764ba2',
    features: [
      'Üretim planlama',
      'Reçete yönetimi',
      'Maliyet hesaplama',
      'Kalite kontrol',
      'Makine bakım takibi'
    ],
    caseStudy: 'Tekstil firması üretim verimliliğini %25 yükseltti'
  },
  {
    id: 'services',
    title: 'Hizmet Sektörü',
    icon: <CustomerServiceOutlined />,
    description: 'Servis ve hizmet işletmeleri için',
    color: '#f093fb',
    features: [
      'Randevu yönetimi',
      'Personel planlama',
      'Proje takibi',
      'Sözleşme yönetimi',
      'Müşteri portali'
    ],
    caseStudy: 'IT hizmet firması müşteri memnuniyetini %95\'e çıkardı'
  },
  {
    id: 'logistics',
    title: 'Lojistik',
    icon: <TruckOutlined />,
    description: 'Nakliye ve kargo yönetimi',
    color: '#4facfe',
    features: [
      'Araç takip sistemi',
      'Rota optimizasyonu',
      'Yakıt yönetimi',
      'Sevkiyat planlama',
      'Müşteri takip sistemi'
    ],
    caseStudy: 'Kargo firması teslimat süresini %30 kısalttı'
  },
  {
    id: 'healthcare',
    title: 'Sağlık',
    icon: <MedicineBoxOutlined />,
    description: 'Hastane ve klinikler için',
    color: '#43e97b',
    features: [
      'Hasta kayıt sistemi',
      'Randevu yönetimi',
      'Stok ve ilaç takibi',
      'Laboratuvar entegrasyonu',
      'Sigorta entegrasyonu'
    ],
    caseStudy: 'Özel hastane hasta bekleme süresini %50 azalttı'
  },
  {
    id: 'education',
    title: 'Eğitim',
    icon: <BookOutlined />,
    description: 'Okul ve eğitim kurumları için',
    color: '#fa709a',
    features: [
      'Öğrenci takip sistemi',
      'Ders programı yönetimi',
      'Online sınav sistemi',
      'Veli bilgilendirme',
      'Muhasebe entegrasyonu'
    ],
    caseStudy: 'Eğitim kurumu öğrenci memnuniyetini %85\'e yükseltti'
  },
  {
    id: 'restaurant',
    title: 'Restaurant & Cafe',
    icon: <CoffeeOutlined />,
    description: 'Yiyecek içecek işletmeleri için',
    color: '#f7b733',
    features: [
      'Masa yönetimi',
      'Adisyon sistemi',
      'Mutfak ekranı',
      'Paket servis yönetimi',
      'Reçete ve maliyet'
    ],
    caseStudy: 'Restoran zinciri sipariş süresini %40 hızlandırdı'
  },
  {
    id: 'construction',
    title: 'İnşaat',
    icon: <BuildOutlined />,
    description: 'İnşaat ve müteahhitlik firmaları için',
    color: '#fc4a1a',
    features: [
      'Proje yönetimi',
      'Hakediş takibi',
      'Malzeme yönetimi',
      'Taşeron yönetimi',
      'Metraj hesaplama'
    ],
    caseStudy: 'İnşaat firması proje tamamlama süresini %20 kısalttı'
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

        <Row gutter={[24, 24]}>
          {solutions.map((solution, index) => (
            <Col xs={24} sm={12} lg={6} key={solution.id}>
              <Card 
                className="solution-card"
                hoverable
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="solution-icon"
                  style={{ background: `linear-gradient(135deg, ${solution.color}20, ${solution.color}10)` }}
                >
                  <span style={{ color: solution.color, fontSize: 32 }}>
                    {solution.icon}
                  </span>
                </div>
                
                <Title level={4} className="solution-title">
                  {solution.title}
                </Title>
                
                <Paragraph className="solution-description">
                  {solution.description}
                </Paragraph>
                
                <div className="solution-features">
                  {solution.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <CheckCircleOutlined style={{ color: solution.color, marginRight: 8 }} />
                      <Text>{feature}</Text>
                    </div>
                  ))}
                </div>
                
                <div className="solution-case-study">
                  <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                    {solution.caseStudy}
                  </Text>
                </div>
                
                <Button 
                  type="link" 
                  className="solution-link"
                  style={{ color: solution.color, padding: 0, marginTop: 16 }}
                >
                  Detaylı Bilgi <ArrowRightOutlined />
                </Button>
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