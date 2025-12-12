import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Typography, Modal, message, Dropdown, Tooltip } from 'antd';
import {
  FileTextOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  SolutionOutlined,
  ReadOutlined,
  RocketOutlined,
  SafetyOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface Page {
  key: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  status: 'published' | 'draft';
  lastUpdated: string;
  views: number;
  description: string;
}

const CMSPages: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const pages: Page[] = [
    { key: '1', name: 'Ana Sayfa', path: '/', icon: <HomeOutlined />, status: 'published', lastUpdated: '10 Ara 2024', views: 15420, description: 'Landing page ana içerik' },
    { key: '2', name: 'Hakkımızda', path: '/about', icon: <InfoCircleOutlined />, status: 'published', lastUpdated: '8 Ara 2024', views: 3240, description: 'Şirket bilgileri ve ekip' },
    { key: '3', name: 'İletişim', path: '/contact', icon: <PhoneOutlined />, status: 'published', lastUpdated: '5 Ara 2024', views: 2180, description: 'İletişim formu ve bilgiler' },
    { key: '4', name: 'Demo', path: '/demo', icon: <RocketOutlined />, status: 'published', lastUpdated: '3 Ara 2024', views: 4560, description: 'Demo talep formu' },
    { key: '5', name: 'SSS', path: '/faq', icon: <QuestionCircleOutlined />, status: 'published', lastUpdated: '1 Ara 2024', views: 5670, description: 'Sıkça sorulan sorular' },
    { key: '6', name: 'Destek', path: '/support', icon: <CustomerServiceOutlined />, status: 'published', lastUpdated: '28 Kas 2024', views: 1890, description: 'Destek merkezi' },
    { key: '7', name: 'Kariyer', path: '/careers', icon: <SolutionOutlined />, status: 'published', lastUpdated: '25 Kas 2024', views: 980, description: 'Açık pozisyonlar' },
    { key: '8', name: 'Blog', path: '/blog', icon: <ReadOutlined />, status: 'published', lastUpdated: '20 Kas 2024', views: 8920, description: 'Blog ana sayfa' },
    { key: '9', name: 'Güncellemeler', path: '/updates', icon: <HistoryOutlined />, status: 'published', lastUpdated: '15 Kas 2024', views: 2340, description: 'Changelog ve güncellemeler' },
    { key: '10', name: 'Gizlilik Politikası', path: '/privacy', icon: <SafetyOutlined />, status: 'published', lastUpdated: '10 Kas 2024', views: 890, description: 'Gizlilik politikası' },
    { key: '11', name: 'Kullanım Şartları', path: '/terms', icon: <SafetyOutlined />, status: 'published', lastUpdated: '10 Kas 2024', views: 670, description: 'Kullanım şartları' },
    { key: '12', name: 'KVKK', path: '/kvkk', icon: <SafetyOutlined />, status: 'published', lastUpdated: '10 Kas 2024', views: 450, description: 'KVKK aydınlatma metni' },
  ];

  const filteredPages = pages.filter(
    (page) =>
      page.name.toLowerCase().includes(searchText.toLowerCase()) ||
      page.path.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = (page: Page) => {
    Modal.confirm({
      title: 'Sayfayı Sil',
      content: `"${page.name}" sayfasını silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        message.success('Sayfa silindi');
      },
    });
  };

  const columns = [
    {
      title: 'Sayfa',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Page) => (
        <Space>
          <span style={{ color: '#667eea' }}>{record.icon}</span>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.path}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? 'Yayında' : 'Taslak'}
        </Tag>
      ),
    },
    {
      title: 'Görüntüleme',
      dataIndex: 'views',
      key: 'views',
      sorter: (a: Page, b: Page) => a.views - b.views,
      render: (views: number) => views.toLocaleString(),
    },
    {
      title: 'Son Güncelleme',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: Page) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/cms/pages${record.path}`)}
            />
          </Tooltip>
          <Tooltip title="Önizle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => window.open(record.path, '_blank')}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'duplicate',
                  label: 'Kopyala',
                  onClick: () => message.info('Sayfa kopyalandı'),
                },
                {
                  key: 'unpublish',
                  label: record.status === 'published' ? 'Yayından Kaldır' : 'Yayınla',
                  onClick: () => message.success('Durum güncellendi'),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Sil',
                  danger: true,
                  onClick: () => handleDelete(record),
                },
              ],
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Sayfalar</Title>
          <Text type="secondary">Landing page sayfalarını yönetin</Text>
        </div>
        <Space>
          <Input
            placeholder="Sayfa ara..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Yeni Sayfa
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          dataSource={filteredPages}
          columns={columns}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Toplam ${total} sayfa`,
          }}
        />
      </Card>
    </div>
  );
};

export default CMSPages;
