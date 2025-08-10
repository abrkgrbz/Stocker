import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Progress, Typography, Tag } from 'antd';
import {
  TeamOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;


export const AdminDashboard: React.FC = () => {
  return (
    <PageContainer
      title="Dashboard"
      subTitle="System overview and statistics"
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Tenants</span>}
              value={125}
              prefix={<TeamOutlined />}
              valueStyle={{ color: 'white' }}
              suffix={
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
            <Progress 
              percent={78} 
              showInfo={false} 
              strokeColor="rgba(255,255,255,0.4)"
              trailColor="rgba(255,255,255,0.1)"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: 16,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Active Subscriptions</span>}
              value={98}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: 'white' }}
              suffix={
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
                  <ArrowUpOutlined /> 8%
                </span>
              }
            />
            <Progress 
              percent={92} 
              showInfo={false} 
              strokeColor="rgba(255,255,255,0.4)"
              trailColor="rgba(255,255,255,0.1)"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: 16,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Packages</span>}
              value={12}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: 'white' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: 'white', border: 'none' }}>
                3 New This Month
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: 16,
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Monthly Revenue</span>}
              value={45678}
              prefix={<DollarOutlined />}
              valueStyle={{ color: 'white' }}
              precision={2}
              suffix={
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
                  <ArrowUpOutlined /> 23%
                </span>
              }
            />
            <Progress 
              percent={85} 
              showInfo={false} 
              strokeColor="rgba(255,255,255,0.4)"
              trailColor="rgba(255,255,255,0.1)"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Recent Activities" 
            bordered={false}
            style={{ borderRadius: 16 }}
          >
            <div style={{ minHeight: 300 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3, 4].map((item) => (
                  <div 
                    key={item} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: 12, 
                      background: '#fafafa', 
                      borderRadius: 8,
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0f0f0';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fafafa';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Text strong>New tenant registered</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Acme Corp - 2 minutes ago
                      </Text>
                    </div>
                    <Tag color="green">New</Tag>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="System Health" 
            bordered={false}
            style={{ borderRadius: 16 }}
          >
            <div style={{ minHeight: 300 }}>
              <div style={{ marginBottom: 24 }}>
                <Text type="secondary">API Response Time</Text>
                <Progress percent={95} strokeColor="#52c41a" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <Text type="secondary">Database Load</Text>
                <Progress percent={68} strokeColor="#667eea" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <Text type="secondary">Memory Usage</Text>
                <Progress percent={45} strokeColor="#1890ff" />
              </div>
              <div>
                <Text type="secondary">Storage</Text>
                <Progress percent={82} strokeColor="#faad14" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};