'use client';

import React from 'react';
import { Typography, Card, Row, Col, Statistic } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function DashboardPage() {
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <p>Hoş geldiniz! Stok yönetim sisteminize genel bakış.</p>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Ürün"
              value={1234}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Satış"
              value={98765}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              suffix="₺"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Müşteriler"
              value={567}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Büyüme"
              value={11.28}
              prefix={<RiseOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
