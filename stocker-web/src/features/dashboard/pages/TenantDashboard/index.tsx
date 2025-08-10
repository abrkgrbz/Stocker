import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  ContactsOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
} from '@ant-design/icons';

export const TenantDashboard: React.FC = () => {
  return (
    <PageContainer
      title="Dashboard"
      subTitle="Welcome to your workspace"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={25}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Contacts"
              value={342}
              prefix={<ContactsOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Products"
              value={156}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Growth"
              value={12.5}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Recent Activities">
            <div style={{ minHeight: 400 }}>
              <p>Your recent activities will appear here</p>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};