import React, { useState } from 'react';
import { Row, Col, Card, Button, Typography, Badge, List, Segmented, Space } from 'antd';
import { CheckOutlined, CalculatorOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pricingPlans } from '../../data/pricingPlans';
import { PricingWizard } from '../PricingWizard';

const { Title, Text, Paragraph } = Typography;

interface PricingSectionProps {
  navigate?: any;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ navigate: navProp }) => {
  const navigate = navProp || useNavigate();
  const [viewMode, setViewMode] = useState<'classic' | 'wizard'>('wizard');

  return (
    <section id="pricing" style={{ padding: '80px 0', background: 'white' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>
          Size Uygun Paketi Seçin
        </Title>
        <Paragraph 
          style={{ 
            textAlign: 'center', 
            fontSize: 18, 
            color: '#666',
            maxWidth: 700,
            margin: '0 auto 32px'
          }}
        >
          İşletmenizin büyüklüğüne ve ihtiyaçlarına göre esnek fiyatlandırma
        </Paragraph>
        
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as 'classic' | 'wizard')}
            options={[
              {
                value: 'wizard',
                label: (
                  <Space>
                    <CalculatorOutlined />
                    <span>Size Özel Plan</span>
                  </Space>
                ),
              },
              {
                value: 'classic',
                label: (
                  <Space>
                    <AppstoreOutlined />
                    <span>Tüm Planlar</span>
                  </Space>
                ),
              },
            ]}
            size="large"
          />
          <Paragraph style={{ marginTop: 16, color: '#666' }}>
            {viewMode === 'wizard' 
              ? 'Birkaç basit soruyla size özel plan oluşturun'
              : 'Hazır paket planlarımızı inceleyin'}
          </Paragraph>
        </div>

        {viewMode === 'wizard' ? (
          <PricingWizard />
        ) : (
          <>

        <Row gutter={[32, 32]} justify="center">
          {pricingPlans.map((plan, index) => (
            <Col xs={24} sm={24} md={12} lg={8} key={index}>
              <Badge.Ribbon 
                text={plan.badge || "Popüler"} 
                color={plan.popular ? "#667eea" : "#52c41a"}
                style={{ display: plan.badge ? 'block' : 'none' }}
              >
                <Card
                  hoverable
                  style={{ 
                    height: '100%',
                    border: plan.popular ? '2px solid #667eea' : '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    transform: plan.popular ? 'scale(1.02)' : 'scale(1)'
                  }}
                  styles={{ body: { padding: 32 } }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 8 }}>
                      {plan.name}
                    </Title>
                    <Text style={{ color: '#666' }}>{plan.description}</Text>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    {plan.oldPrice && (
                      <Text 
                        delete 
                        style={{ 
                          fontSize: 20, 
                          color: '#999',
                          display: 'block',
                          marginBottom: 8
                        }}
                      >
                        {plan.currency}{plan.oldPrice}
                      </Text>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 48, fontWeight: 'bold', color: plan.popular ? '#667eea' : '#1a1a1a' }}>
                        {plan.currency}{plan.price}
                      </Text>
                      <Text style={{ fontSize: 18, color: '#666' }}>/{plan.period}</Text>
                    </div>
                    {plan.savings && (
                      <Badge 
                        count={plan.savings} 
                        style={{ 
                          backgroundColor: '#52c41a',
                          marginTop: 8
                        }} 
                      />
                    )}
                  </div>

                  <List
                    dataSource={plan.features}
                    renderItem={item => (
                      <List.Item style={{ border: 'none', padding: '8px 0' }}>
                        <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        <Text>{item}</Text>
                      </List.Item>
                    )}
                    style={{ marginBottom: 24 }}
                  />

                  <Button
                    type={plan.popular ? 'primary' : 'default'}
                    size="large"
                    block
                    onClick={() => navigate('/register')}
                    style={{
                      height: 48,
                      fontSize: 16,
                      background: plan.popular ? '#667eea' : undefined
                    }}
                  >
                    Hemen Başla
                  </Button>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>

        <div style={{ 
          textAlign: 'center', 
          marginTop: 64,
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          borderRadius: 16
        }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            💰 30 Gün Para İade Garantisi
          </Title>
          <Text style={{ fontSize: 16, color: '#666', display: 'block', marginBottom: 8 }}>
            14 gün ücretsiz deneme • Kredi kartı gerekmez • Anında iptal
          </Text>
          <Text style={{ fontSize: 14, color: '#999' }}>
            Memnun kalmazsanız, ilk 30 gün içinde ücret iadesi alabilirsiniz
          </Text>
        </div>
        </>
        )}
      </div>
    </section>
  );
};