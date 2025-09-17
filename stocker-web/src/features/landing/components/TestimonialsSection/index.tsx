import React from 'react';
import { Row, Col, Card, Avatar, Typography, Rate } from 'antd';
import { testimonials } from '@/features/landing/data/testimonials';

const { Title, Paragraph, Text } = Typography;

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" style={{ padding: '80px 0', background: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>
          Müşterilerimiz Ne Diyor?
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
          Binlerce işletme Stocker ile büyüyor
        </Paragraph>

        <Row gutter={[24, 24]}>
          {testimonials.map((testimonial, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                style={{ height: '100%' }}
                styles={{ body: { padding: 32 } }}
              >
                <div style={{ marginBottom: 24 }}>
                  <Rate disabled defaultValue={testimonial.rating} />
                </div>
                
                <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
                  "{testimonial.content}"
                </Paragraph>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar size={48} src={testimonial.avatar} />
                  <div>
                    <Text strong>{testimonial.name}</Text>
                    <br />
                    <Text style={{ color: '#666' }}>{testimonial.role}</Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};