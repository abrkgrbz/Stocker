import React, { useState } from 'react';
import { Card, Tabs, Typography, Space } from 'antd';
import { FolderOutlined, FileTextOutlined } from '@ant-design/icons';
import DocCategoriesTab from './tabs/DocCategoriesTab';
import DocArticlesTab from './tabs/DocArticlesTab';

const { Title, Text } = Typography;

const CMSDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories');

  const tabItems = [
    {
      key: 'categories',
      label: (
        <Space>
          <FolderOutlined />
          Kategoriler
        </Space>
      ),
      children: <DocCategoriesTab />,
    },
    {
      key: 'articles',
      label: (
        <Space>
          <FileTextOutlined />
          Makaleler
        </Space>
      ),
      children: <DocArticlesTab />,
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Dokümantasyon Yönetimi</Title>
        <Text type="secondary">Yardım merkezi kategorileri ve makaleleri</Text>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        tabPosition="left"
        style={{ minHeight: 500 }}
      />
    </Card>
  );
};

export default CMSDocs;
