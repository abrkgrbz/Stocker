import React from 'react';
import { TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Typography, Tag } from 'antd';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

const partners = [
  { id: 1, name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png' },
  { id: 2, name: 'Google Cloud', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Google_Cloud_Logo.svg/512px-Google_Cloud_Logo.svg.png' },
  { id: 3, name: 'Amazon AWS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/512px-Amazon_Web_Services_Logo.svg.png' },
  { id: 4, name: 'SAP', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/440px-SAP_2011_logo.svg.png' },
  { id: 5, name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/512px-Oracle_logo.svg.png' },
  { id: 6, name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/512px-IBM_logo.svg.png' },
  { id: 7, name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/512px-Salesforce.com_logo.svg.png' },
  { id: 8, name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Logo.svg/512px-Adobe_Corporate_Logo.svg.png' }
];

const integrations = [
  'e-Fatura', 'e-Arşiv', 'e-İrsaliye', 'e-Defter',
  'Trendyol', 'Hepsiburada', 'N11', 'Amazon',
  'İyzico', 'Paratika', 'PayTR', 'Stripe',
  'Paraşüt', 'Logo', 'Mikro', 'Netsis'
];

export const PartnersSection: React.FC = () => {
  return (
    <section className="partners-section" id="partners">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <Tag color="purple" className="section-tag">
            <TeamOutlined /> İş Ortaklarımız
          </Tag>
          <Title level={2}>Güvenilir Partnerler</Title>
          <Paragraph>
            Dünya çapında lider teknoloji şirketleri ile çalışıyoruz
          </Paragraph>
        </motion.div>

        {/* Partners Logos */}
        <div className="partners-grid">
          <motion.div className="partners-track">
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={`${partner.id}-${index}`}
                className="partner-card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index % 8) * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="integrations-section"
        >
          <div className="integrations-header">
            <SafetyCertificateOutlined className="integrations-icon" />
            <Title level={3}>Hazır Entegrasyonlar</Title>
            <Paragraph>
              Kullandığınız tüm sistemlerle sorunsuz entegrasyon
            </Paragraph>
          </div>
          
          <div className="integrations-grid">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration}
                className="integration-tag"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                {integration}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="partners-stats"
        >
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Teknoloji Partneri</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">100+</div>
            <div className="stat-label">Hazır Entegrasyon</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Teknik Destek</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};