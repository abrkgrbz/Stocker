'use client'

import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';
import {
  CheckIcon,
} from '@heroicons/react/24/outline';

const { Title } = Typography;

export default function PricingPage() {
  const plans = [
    {
      name: 'Başlangıç',
      price: '₺99',
      period: '/ay',
      features: [
        '10 Kullanıcı',
        '1000 Ürün',
        'Temel Raporlar',
        'Email Desteği',
      ],
    },
    {
      name: 'Profesyonel',
      price: '₺299',
      period: '/ay',
      features: [
        '50 Kullanıcı',
        'Sınırsız Ürün',
        'Gelişmiş Raporlar',
        'Öncelikli Destek',
        'API Erişimi',
      ],
      popular: true,
    },
    {
      name: 'Kurumsal',
      price: 'Özel Fiyat',
      period: '',
      features: [
        'Sınırsız Kullanıcı',
        'Sınırsız Ürün',
        'Özel Raporlar',
        '7/24 Destek',
        'API Erişimi',
        'Özel Entegrasyonlar',
      ],
    },
  ];

  return (
    <div style={{ padding: '50px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <Title level={1}>Fiyatlandırma</Title>
        <p style={{ fontSize: 18 }}>İşletmeniz için en uygun planı seçin</p>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {plans.map((plan, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              style={{
                textAlign: 'center',
                border: plan.popular ? '2px solid #1890ff' : undefined,
                position: 'relative',
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1890ff',
                    color: 'white',
                    padding: '4px 16px',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                >
                  Popüler
                </div>
              )}
              <Title level={3}>{plan.name}</Title>
              <div style={{ fontSize: 36, fontWeight: 'bold', margin: '20px 0' }}>
                {plan.price}
                <span style={{ fontSize: 16, fontWeight: 'normal' }}>
                  {plan.period}
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{ marginBottom: 12 }}>
                    <CheckIcon className="w-4 h-4" style={{ color: '#52c41a', marginRight: 8 }} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                type={plan.popular ? 'primary' : 'default'}
                size="large"
                block
                style={{ marginTop: 24 }}
              >
                Başlayın
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
