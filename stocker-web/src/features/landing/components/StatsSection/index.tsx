import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { stats } from '../../data/stats';

export const StatsSection: React.FC = () => {
  return (
    <section 
      style={{ 
        padding: '60px 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[48, 48]} justify="center">
          {stats.map((stat, index) => (
            <Col xs={12} md={6} key={index}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>{stat.title}</span>}
                value={stat.value}
                suffix={<span style={{ fontSize: 24 }}>{stat.suffix}</span>}
                prefix={stat.prefix}
                valueStyle={{ 
                  color: 'white', 
                  fontSize: 42,
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
                style={{ textAlign: 'center' }}
              />
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};