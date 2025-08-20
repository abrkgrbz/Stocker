import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { features } from '../../data/features';

const { Title, Paragraph } = Typography;

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" style={{ padding: '80px 0', background: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>
          Neden Stocker?
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
          Modern işletmeler için tasarlanmış, bulut tabanlı ve güvenli ERP çözümü
        </Paragraph>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Col xs={24} md={8} key={index}>
                <Card
                  hoverable
                  style={{ height: '100%', textAlign: 'center' }}
                  styles={{ body: { padding: 32 } }}
                >
                  <div style={{ marginBottom: 24 }}>
                    <Icon style={{ fontSize: feature.iconSize, color: feature.color }} />
                  </div>
                  <Title level={4} style={{ marginBottom: 16 }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ color: '#666' }}>
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </section>
  );
};