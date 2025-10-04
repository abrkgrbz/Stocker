import React from 'react';
import { Row, Col, Card, Typography, Tag } from 'antd';
import { motion } from 'framer-motion';
import {
  RobotOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  LineChartOutlined,
  SafetyOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useInView } from 'react-intersection-observer';
import './style.css';

const { Title, Paragraph } = Typography;

export const AIFeaturesSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const features = [
    {
      icon: <RobotOutlined />,
      title: 'Akıllı Stok Yönetimi',
      description: 'AI destekli stok tahminleme ile hiç stoksuz kalmayın',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      benefits: ['Otomatik sipariş önerileri', 'Talep tahmini', 'Optimum stok seviyesi']
    },
    {
      icon: <ThunderboltOutlined />,
      title: 'Otomasyon Kuralları',
      description: 'Tekrarlayan işleri otomatikleştirin, zamandan tasarruf edin',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      benefits: ['Otomatik fatura kesimi', 'Email bildirimleri', 'Workflow otomasyonu']
    },
    {
      icon: <BulbOutlined />,
      title: 'Akıllı Öneriler',
      description: 'Verilerinizden anlam çıkaran önerilerle büyüyün',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      benefits: ['Fiyat optimizasyonu', 'Müşteri segmentasyonu', 'Satış fırsatları']
    },
    {
      icon: <LineChartOutlined />,
      title: 'Tahmine Dayalı Analiz',
      description: 'Gelecekteki trendleri tahmin edin, önceden hazırlıklı olun',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      benefits: ['Satış tahminleri', 'Nakit akış projeksiyonu', 'Mevsimsel analiz']
    },
    {
      icon: <SafetyOutlined />,
      title: 'Fraud Tespiti',
      description: 'Anormal işlemleri otomatik tespit edin ve uyarı alın',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      benefits: ['Şüpheli işlem tespiti', 'Gerçek zamanlı uyarılar', 'Risk skorlaması']
    },
    {
      icon: <SyncOutlined />,
      title: 'Akıllı Entegrasyonlar',
      description: '50+ platform ile otomatik senkronizasyon',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      benefits: ['E-ticaret entegrasyonu', 'Muhasebe senkronizasyonu', 'API bağlantıları']
    }
  ];

  return (
    <section className="ai-features-section" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <Tag color="cyan" className="section-tag">
            <RobotOutlined /> Yapay Zeka & Otomasyon
          </Tag>
          <Title level={2}>
            Geleceğin Teknolojisiyle <span className="gradient-text">Akıllı İş Yönetimi</span>
          </Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '800px', margin: '0 auto' }}>
            Yapay zeka destekli özellikler ve otomasyon araçlarıyla iş süreçlerinizi optimize edin,
            verimliliğinizi katlamış artırın
          </Paragraph>
        </motion.div>

        <Row gutter={[24, 24]} style={{ marginTop: '60px' }}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="ai-feature-card" bordered={false}>
                  <div className="ai-feature-icon" style={{ background: feature.gradient }}>
                    {feature.icon}
                  </div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph className="feature-description">
                    {feature.description}
                  </Paragraph>
                  <ul className="feature-benefits">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx}>
                        <ThunderboltOutlined style={{ color: '#667eea', marginRight: '8px' }} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="ai-cta"
        >
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center'
            }}
          >
            <Title level={3} style={{ color: 'white', marginBottom: '16px' }}>
              AI Gücünü İşinize Katın
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginBottom: '0' }}>
              Yapay zeka destekli özelliklerimiz sayesinde rakiplerinizden bir adım önde olun.
              Verileriniz sizin için çalışsın, siz stratejiye odaklanın.
            </Paragraph>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
