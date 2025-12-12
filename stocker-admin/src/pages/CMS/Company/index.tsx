import React, { useState } from 'react';
import { Card, Tabs, Typography, Space } from 'antd';
import {
  TeamOutlined,
  HeartOutlined,
  PhoneOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import TeamMembersTab from './tabs/TeamMembersTab';
import CompanyValuesTab from './tabs/CompanyValuesTab';
import ContactInfoTab from './tabs/ContactInfoTab';
import SocialLinksTab from './tabs/SocialLinksTab';

const { Title, Text } = Typography;

const CMSCompany: React.FC = () => {
  const [activeTab, setActiveTab] = useState('team');

  const tabItems = [
    {
      key: 'team',
      label: (
        <Space>
          <TeamOutlined />
          Ekip
        </Space>
      ),
      children: <TeamMembersTab />,
    },
    {
      key: 'values',
      label: (
        <Space>
          <HeartOutlined />
          Değerlerimiz
        </Space>
      ),
      children: <CompanyValuesTab />,
    },
    {
      key: 'contact',
      label: (
        <Space>
          <PhoneOutlined />
          İletişim
        </Space>
      ),
      children: <ContactInfoTab />,
    },
    {
      key: 'social',
      label: (
        <Space>
          <ShareAltOutlined />
          Sosyal Medya
        </Space>
      ),
      children: <SocialLinksTab />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Şirket Sayfası Yönetimi</Title>
        <Text type="secondary">Hakkımızda sayfası içeriklerini düzenleyin</Text>
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

export default CMSCompany;
