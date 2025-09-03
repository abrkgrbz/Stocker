import React, { useState } from 'react';
import { Input, Button, Typography, message, Row, Col } from 'antd';
import { 
  MailOutlined, 
  SendOutlined, 
  GiftOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Paragraph, Text } = Typography;

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      message.error('Lütfen e-posta adresinizi girin');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('Geçerli bir e-posta adresi girin');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      message.success('Başarıyla abone oldunuz! 🎉');
      setEmail('');
      setLoading(false);
    }, 1500);
  };

  const benefits = [
    'Haftalık ERP ipuçları ve trendler',
    'Özel indirimler ve kampanyalar',
    'Yeni özellik duyuruları',
    'Ücretsiz e-kitap ve rehberler'
  ];

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="newsletter-container">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="newsletter-content"
            >
              <div className="newsletter-badge">
                <GiftOutlined /> Özel Fırsatlar
              </div>
              
              <Title level={2} className="newsletter-title">
                ERP Dünyasından Haberdar Olun
              </Title>
              
              <Paragraph className="newsletter-description">
                En son ERP trendleri, başarı hikayeleri ve özel kampanyalardan 
                ilk siz haberdar olun. Üstelik abone olanlara özel %20 indirim!
              </Paragraph>

              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="benefit-item"
                  >
                    <CheckCircleOutlined className="benefit-icon" />
                    <Text>{benefit}</Text>
                  </motion.div>
                ))}
              </div>

              <div className="trust-badges">
                <div className="trust-item">
                  <SafetyCertificateOutlined />
                  <span>KVKK Uyumlu</span>
                </div>
                <div className="trust-item">
                  <MailOutlined />
                  <span>10.000+ Abone</span>
                </div>
              </div>
            </motion.div>
          </Col>

          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="newsletter-form-wrapper"
            >
              <div className="newsletter-form">
                <div className="form-header">
                  <MailOutlined className="form-icon" />
                  <Title level={3}>Bültene Abone Ol</Title>
                </div>

                <div className="form-input-group">
                  <Input
                    size="large"
                    placeholder="E-posta adresiniz"
                    prefix={<MailOutlined />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onPressEnter={handleSubscribe}
                    className="newsletter-input"
                  />
                  
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    loading={loading}
                    onClick={handleSubscribe}
                    className="subscribe-button"
                  >
                    Abone Ol
                  </Button>
                </div>

                <Text type="secondary" className="form-note">
                  Aboneliğinizi istediğiniz zaman iptal edebilirsiniz.
                  Gizlilik politikamızı okumak için <a href="#">tıklayın</a>.
                </Text>

                <div className="discount-badge">
                  <GiftOutlined />
                  <span>İlk siparişinizde %20 indirim kazanın!</span>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </div>
    </section>
  );
};