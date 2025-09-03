import React, { useState } from 'react';
import { Table, Typography, Tag, Tooltip, Switch, Button, Space } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  StarFilled
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Paragraph } = Typography;

interface PlanFeature {
  feature: string;
  category: string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
  tooltip?: string;
}

const features: PlanFeature[] = [
  // Temel Özellikler
  { feature: 'Kullanıcı Sayısı', category: 'Temel', starter: '5 Kullanıcı', professional: '25 Kullanıcı', enterprise: 'Sınırsız' },
  { feature: 'Depolama Alanı', category: 'Temel', starter: '10 GB', professional: '100 GB', enterprise: 'Sınırsız' },
  { feature: 'Aylık İşlem Limiti', category: 'Temel', starter: '1,000', professional: '10,000', enterprise: 'Sınırsız' },
  { feature: 'API Erişimi', category: 'Temel', starter: false, professional: true, enterprise: true },
  { feature: '7/24 Destek', category: 'Temel', starter: false, professional: true, enterprise: true },
  
  // Modüller
  { feature: 'CRM Modülü', category: 'Modüller', starter: true, professional: true, enterprise: true },
  { feature: 'Stok Yönetimi', category: 'Modüller', starter: true, professional: true, enterprise: true },
  { feature: 'Satış & Faturalama', category: 'Modüller', starter: true, professional: true, enterprise: true },
  { feature: 'Finans & Muhasebe', category: 'Modüller', starter: false, professional: true, enterprise: true },
  { feature: 'İnsan Kaynakları', category: 'Modüller', starter: false, professional: true, enterprise: true },
  { feature: 'Üretim Planlama', category: 'Modüller', starter: false, professional: false, enterprise: true },
  { feature: 'Proje Yönetimi', category: 'Modüller', starter: false, professional: true, enterprise: true },
  
  // Entegrasyonlar
  { feature: 'E-Fatura', category: 'Entegrasyonlar', starter: false, professional: true, enterprise: true },
  { feature: 'E-Ticaret Entegrasyonu', category: 'Entegrasyonlar', starter: false, professional: '3 Platform', enterprise: 'Sınırsız' },
  { feature: 'Banka Entegrasyonu', category: 'Entegrasyonlar', starter: false, professional: true, enterprise: true },
  { feature: 'Kargo Entegrasyonu', category: 'Entegrasyonlar', starter: false, professional: true, enterprise: true },
  
  // Gelişmiş Özellikler
  { feature: 'Özel Raporlar', category: 'Gelişmiş', starter: false, professional: true, enterprise: true },
  { feature: 'Multi-Şirket', category: 'Gelişmiş', starter: false, professional: false, enterprise: true },
  { feature: 'White Label', category: 'Gelişmiş', starter: false, professional: false, enterprise: true },
  { feature: 'Özel Geliştirme', category: 'Gelişmiş', starter: false, professional: false, enterprise: true },
  { feature: 'SLA Garantisi', category: 'Gelişmiş', starter: false, professional: false, enterprise: true },
  { feature: 'Özel Sunucu', category: 'Gelişmiş', starter: false, professional: false, enterprise: true },
];

const plans = [
  {
    key: 'starter',
    name: 'Başlangıç',
    price: 499,
    icon: <RocketOutlined />,
    color: '#667eea',
    popular: false
  },
  {
    key: 'professional',
    name: 'Profesyonel',
    price: 999,
    icon: <ThunderboltOutlined />,
    color: '#764ba2',
    popular: true
  },
  {
    key: 'enterprise',
    name: 'Kurumsal',
    price: 'Özel Fiyat',
    icon: <CrownOutlined />,
    color: '#f093fb',
    popular: false
  }
];

export const ComparisonTable: React.FC = () => {
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Temel', 'Modüller']);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
      ) : (
        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
      );
    }
    return <span className="feature-value">{value}</span>;
  };

  const filteredFeatures = showOnlyDifferences
    ? features.filter(f => f.starter !== f.professional || f.professional !== f.enterprise)
    : features;

  const groupedFeatures = filteredFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, PlanFeature[]>);

  return (
    <section className="comparison-section" id="comparison">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <Tag color="purple" className="section-tag">
            <StarFilled /> Detaylı Karşılaştırma
          </Tag>
          <Title level={2}>Paket Karşılaştırması</Title>
          <Paragraph>
            Size en uygun paketi seçmenize yardımcı olacak detaylı özellik karşılaştırması
          </Paragraph>
        </motion.div>

        <div className="comparison-controls">
          <Space>
            <span>Sadece farklılıkları göster:</span>
            <Switch
              checked={showOnlyDifferences}
              onChange={setShowOnlyDifferences}
            />
          </Space>
        </div>

        <div className="comparison-table-wrapper">
          <div className="plans-header">
            <div className="feature-column">
              <div className="feature-header">Özellikler</div>
            </div>
            {plans.map(plan => (
              <motion.div
                key={plan.key}
                className={`plan-column ${plan.popular ? 'popular' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    <CrownOutlined /> En Popüler
                  </div>
                )}
                <div className="plan-header" style={{ borderColor: plan.color }}>
                  <div className="plan-icon" style={{ color: plan.color }}>
                    {plan.icon}
                  </div>
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    {typeof plan.price === 'number' ? (
                      <>
                        <span className="currency">₺</span>
                        <span className="amount">{plan.price}</span>
                        <span className="period">/ay</span>
                      </>
                    ) : (
                      <span className="custom-price">{plan.price}</span>
                    )}
                  </div>
                  <Button
                    type={plan.popular ? 'primary' : 'default'}
                    size="large"
                    block
                    style={plan.popular ? {
                      background: `linear-gradient(135deg, ${plan.color} 0%, #764ba2 100%)`,
                      border: 'none'
                    } : {}}
                  >
                    {plan.key === 'enterprise' ? 'Teklif Al' : 'Hemen Başla'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="features-body">
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
              <div key={category} className="category-group">
                <div
                  className="category-header"
                  onClick={() => toggleCategory(category)}
                >
                  <span className="category-name">{category}</span>
                  <span className="category-count">{categoryFeatures.length} özellik</span>
                </div>
                
                {expandedCategories.includes(category) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    {categoryFeatures.map((feature, index) => (
                      <div key={index} className="feature-row">
                        <div className="feature-column">
                          <div className="feature-name">
                            {feature.feature}
                            {feature.tooltip && (
                              <Tooltip title={feature.tooltip}>
                                <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        <div className="plan-column">
                          <div className="feature-cell">
                            {renderFeatureValue(feature.starter)}
                          </div>
                        </div>
                        <div className="plan-column popular">
                          <div className="feature-cell">
                            {renderFeatureValue(feature.professional)}
                          </div>
                        </div>
                        <div className="plan-column">
                          <div className="feature-cell">
                            {renderFeatureValue(feature.enterprise)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="comparison-footer"
        >
          <div className="footer-content">
            <Title level={4}>Hala karar veremediniz mi?</Title>
            <Paragraph>
              Uzman ekibimiz size en uygun paketi seçmenizde yardımcı olabilir
            </Paragraph>
            <Button type="primary" size="large" icon={<RocketOutlined />}>
              Ücretsiz Danışmanlık Al
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};