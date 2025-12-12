import React, { useState } from 'react';
import { Card, Tabs, Typography, Space } from 'antd';
import {
  StarOutlined,
  DollarOutlined,
  AppstoreOutlined,
  ShopOutlined,
  ApiOutlined,
  BarChartOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import TestimonialsTab from './tabs/TestimonialsTab';
import PricingTab from './tabs/PricingTab';
import FeaturesTab from './tabs/FeaturesTab';
import IndustriesTab from './tabs/IndustriesTab';
import IntegrationsTab from './tabs/IntegrationsTab';
import StatsTab from './tabs/StatsTab';
import PartnersTab from './tabs/PartnersTab';
import AchievementsTab from './tabs/AchievementsTab';

const { Title, Text } = Typography;

const CMSLanding: React.FC = () => {
  const [activeTab, setActiveTab] = useState('testimonials');

  const tabItems = [
    {
      key: 'testimonials',
      label: (
        <Space>
          <StarOutlined />
          Referanslar
        </Space>
      ),
      children: <TestimonialsTab />,
    },
    {
      key: 'pricing',
      label: (
        <Space>
          <DollarOutlined />
          Fiyatlandırma
        </Space>
      ),
      children: <PricingTab />,
    },
    {
      key: 'features',
      label: (
        <Space>
          <AppstoreOutlined />
          Özellikler
        </Space>
      ),
      children: <FeaturesTab />,
    },
    {
      key: 'industries',
      label: (
        <Space>
          <ShopOutlined />
          Sektörler
        </Space>
      ),
      children: <IndustriesTab />,
    },
    {
      key: 'integrations',
      label: (
        <Space>
          <ApiOutlined />
          Entegrasyonlar
        </Space>
      ),
      children: <IntegrationsTab />,
    },
    {
      key: 'stats',
      label: (
        <Space>
          <BarChartOutlined />
          İstatistikler
        </Space>
      ),
      children: <StatsTab />,
    },
    {
      key: 'partners',
      label: (
        <Space>
          <TeamOutlined />
          Partnerler
        </Space>
      ),
      children: <PartnersTab />,
    },
    {
      key: 'achievements',
      label: (
        <Space>
          <TrophyOutlined />
          Başarılar
        </Space>
      ),
      children: <AchievementsTab />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Landing Page Yönetimi</Title>
        <Text type="secondary">Ana sayfa içeriklerini düzenleyin</Text>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          tabPosition="left"
          style={{ minHeight: 500 }}
        />
      </Card>
    </div>
  );
};

export default CMSLanding;
