import React from 'react';
import { Row, Col, Card, Button, Typography, Badge, List } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pricingPlans } from '../../data/pricingPlans';

const { Title, Text, Paragraph } = Typography;

interface PricingSectionProps {
  navigate?: any;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ navigate: navProp }) => {
  const navigate = navProp || useNavigate();

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
            margin: '0 auto 48px'
          }}
        >
          İşletmenizin büyüklüğüne ve ihtiyaçlarına göre esnek fiyatlandırma
        </Paragraph>

        <Row gutter={[24, 24]} justify="center">
          {pricingPlans.map((plan, index) => (
            <Col xs={24} md={8} key={index}>
              <Badge.Ribbon 
                text="Popüler" 
                color="red"
                style={{ display: plan.popular ? 'block' : 'none' }}
              >
                <Card
                  hoverable
                  style={{ 
                    height: '100%',
                    border: plan.popular ? '2px solid #667eea' : '1px solid #f0f0f0'
                  }}
                  bodyStyle={{ padding: 32 }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 8 }}>
                      {plan.name}
                    </Title>
                    <Text style={{ color: '#666' }}>{plan.description}</Text>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Text style={{ fontSize: 48, fontWeight: 'bold' }}>
                      {plan.currency}{plan.price}
                    </Text>
                    <Text style={{ fontSize: 18, color: '#666' }}>/{plan.period}</Text>
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

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Text style={{ fontSize: 16, color: '#666' }}>
            Tüm paketlerde 14 gün ücretsiz deneme hakkı • İstediğiniz zaman iptal edebilirsiniz
          </Text>
        </div>
      </div>
    </section>
  );
};