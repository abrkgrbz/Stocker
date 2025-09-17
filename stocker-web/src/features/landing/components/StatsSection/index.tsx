import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Row, Col, Typography } from 'antd';
import { motion } from 'framer-motion';

import { stats } from '@/features/landing/data/stats';

const { Title } = Typography;

export const StatsSection: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <section 
      ref={ref}
      style={{ 
        padding: '80px 0',
        background: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
        }}
      />
      
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Title 
          level={2} 
          style={{ 
            textAlign: 'center', 
            marginBottom: 60,
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Güvenilir ve Ölçeklenebilir Altyapı
        </Title>
        
        <Row gutter={[48, 48]} justify="center">
          {stats.map((stat, index) => (
            <Col xs={12} sm={12} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }} 
                style={{ 
                  textAlign: 'center',
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'white',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  height: '100%'
                }}
              >
                <div 
                  style={{ 
                    fontSize: 40, 
                    marginBottom: 16,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {stat.prefix}
                </div>
                
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 }}>
                  {inView && (
                    <CountUp
                      start={0}
                      end={stat.value}
                      duration={2.5}
                      separator=","
                      decimal="."
                      decimals={stat.suffix === '%' ? 1 : 0}
                    />
                  )}
                  <span style={{ fontSize: 36, marginLeft: 4, color: '#667eea' }}>
                    {stat.suffix}
                  </span>
                </div>
                
                <div style={{ 
                  fontSize: 16, 
                  color: '#666',
                  fontWeight: 500,
                  marginTop: 8
                }}>
                  {stat.title}
                </div>
                
                <div style={{ 
                  fontSize: 14, 
                  color: '#999',
                  marginTop: 8
                }}>
                  {stat.description}
                </div>
              </motion.div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};