import React from 'react';
import { Card, Typography, Space } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: 'Ayarlar',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Ayarlar' },
          ],
        },
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" align="center" style={{ width: '100%', padding: '40px 0' }}>
            <SettingOutlined style={{ fontSize: 64, color: '#1890ff' }} />
            <Title level={3}>Ayarlar Sayfası</Title>
            <Text type="secondary">
              Admin ayarları sayfası yakında eklenecek
            </Text>
          </Space>
        </Card>
      </Space>
    </PageContainer>
  );
};

export default Settings;
