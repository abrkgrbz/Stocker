import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
  Divider,
  List,
  Avatar,
  Badge,
  Tabs,
  Steps,
  Result,
  Tooltip,
  Progress,
  Timeline,
  Descriptions,
  Empty,
  Dropdown
} from 'antd';
import {
  ApiOutlined,
  LinkOutlined,
  DisconnectOutlined,
  CloudOutlined,
  DatabaseOutlined,
  MailOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MessageOutlined,
  WhatsAppOutlined,
  SlackOutlined,
  GithubOutlined,
  GoogleOutlined,
  AmazonOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

interface Integration {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  icon: string;
  description: string;
  lastSync?: string;
  syncFrequency?: string;
  config: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    clientId?: string;
    [key: string]: any;
  };
  features: string[];
  usage?: {
    requests: number;
    limit: number;
    lastRequest?: string;
  };
  createdAt: string;
  createdBy: string;
}

interface IntegrationLog {
  id: string;
  integrationId: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  timestamp: string;
  details?: any;
}

interface AvailableIntegration {
  id: string;
  name: string;
  provider: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  pricing: string;
  popular: boolean;
}

const TenantIntegrations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  
  // Modals
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [marketplaceModalVisible, setMarketplaceModalVisible] = useState(false);
  const [setupModalVisible, setSetupModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchIntegrations();
    fetchLogs();
  }, [id]);

  const fetchIntegrations = async () => {
    setLoading(true);
    // Simulated data
    setTimeout(() => {
      setIntegrations([
        {
          id: '1',
          name: 'Slack',
          provider: 'Slack Technologies',
          category: 'İletişim',
          status: 'connected',
          icon: 'slack',
          description: 'Takım iletişimi ve bildirimler',
          lastSync: '2024-01-15T14:30:00',
          syncFrequency: 'Gerçek zamanlı',
          config: {
            webhookUrl: 'https://hooks.slack.com/services/XXX',
            channel: '#general'
          },
          features: ['Bildirimler', 'Mesajlaşma', 'Dosya paylaşımı'],
          usage: {
            requests: 12543,
            limit: 50000,
            lastRequest: '2024-01-15T14:30:00'
          },
          createdAt: '2023-06-15T10:00:00',
          createdBy: 'admin@example.com'
        },
        {
          id: '2',
          name: 'Google Analytics',
          provider: 'Google',
          category: 'Analitik',
          status: 'connected',
          icon: 'google',
          description: 'Web sitesi analitikleri',
          lastSync: '2024-01-15T14:00:00',
          syncFrequency: 'Her 30 dakika',
          config: {
            trackingId: 'UA-XXXXXX-X',
            viewId: '123456789'
          },
          features: ['Trafik analizi', 'Dönüşüm takibi', 'Kullanıcı davranışı'],
          usage: {
            requests: 8932,
            limit: 100000,
            lastRequest: '2024-01-15T14:00:00'
          },
          createdAt: '2023-07-20T11:00:00',
          createdBy: 'admin@example.com'
        },
        {
          id: '3',
          name: 'Stripe',
          provider: 'Stripe Inc.',
          category: 'Ödeme',
          status: 'connected',
          icon: 'stripe',
          description: 'Online ödeme işlemleri',
          lastSync: '2024-01-15T13:45:00',
          syncFrequency: 'Gerçek zamanlı',
          config: {
            apiKey: 'sk_live_xxx',
            webhookSecret: 'whsec_xxx'
          },
          features: ['Ödeme alma', 'Abonelik yönetimi', 'Fatura oluşturma'],
          usage: {
            requests: 3456,
            limit: 10000,
            lastRequest: '2024-01-15T13:45:00'
          },
          createdAt: '2023-05-10T09:00:00',
          createdBy: 'admin@example.com'
        },
        {
          id: '4',
          name: 'SendGrid',
          provider: 'Twilio',
          category: 'E-posta',
          status: 'error',
          icon: 'mail',
          description: 'E-posta gönderimi',
          lastSync: '2024-01-15T10:00:00',
          config: {
            apiKey: 'SG.xxx'
          },
          features: ['Transactional email', 'Marketing campaigns', 'Email analytics'],
          createdAt: '2023-08-05T14:00:00',
          createdBy: 'admin@example.com'
        },
        {
          id: '5',
          name: 'AWS S3',
          provider: 'Amazon',
          category: 'Depolama',
          status: 'disconnected',
          icon: 'aws',
          description: 'Bulut depolama',
          config: {},
          features: ['Dosya depolama', 'CDN', 'Yedekleme'],
          createdAt: '2023-09-12T16:00:00',
          createdBy: 'admin@example.com'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const fetchLogs = async () => {
    // Simulated data
    setLogs([
      {
        id: '1',
        integrationId: '1',
        action: 'sync',
        status: 'success',
        message: 'Slack senkronizasyonu başarılı',
        timestamp: '2024-01-15T14:30:00'
      },
      {
        id: '2',
        integrationId: '4',
        action: 'send_email',
        status: 'error',
        message: 'API rate limit aşıldı',
        timestamp: '2024-01-15T10:00:00',
        details: { error: 'Rate limit exceeded' }
      },
      {
        id: '3',
        integrationId: '2',
        action: 'fetch_data',
        status: 'success',
        message: 'Analytics verisi alındı',
        timestamp: '2024-01-15T14:00:00'
      }
    ]);
  };

  const availableIntegrations: AvailableIntegration[] = [
    {
      id: 'slack',
      name: 'Slack',
      provider: 'Slack Technologies',
      category: 'İletişim',
      icon: <SlackOutlined style={{ fontSize: 32, color: '#4A154B' }} />,
      description: 'Takım iletişimi ve işbirliği',
      features: ['Gerçek zamanlı mesajlaşma', 'Dosya paylaşımı', 'Video konferans'],
      pricing: 'Ücretsiz başlangıç',
      popular: true
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      provider: 'Microsoft',
      category: 'İletişim',
      icon: <TeamOutlined style={{ fontSize: 32, color: '#5059C9' }} />,
      description: 'İşbirliği ve iletişim platformu',
      features: ['Video toplantı', 'Dosya paylaşımı', 'Office entegrasyonu'],
      pricing: 'Aylık abonelik',
      popular: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      provider: 'Meta',
      category: 'İletişim',
      icon: <WhatsAppOutlined style={{ fontSize: 32, color: '#25D366' }} />,
      description: 'Müşteri iletişimi',
      features: ['Mesajlaşma', 'Otomatik yanıt', 'Katalog paylaşımı'],
      pricing: 'Ücretsiz',
      popular: true
    },
    {
      id: 'github',
      name: 'GitHub',
      provider: 'GitHub Inc.',
      category: 'Geliştirme',
      icon: <GithubOutlined style={{ fontSize: 32, color: '#000' }} />,
      description: 'Kod repository ve CI/CD',
      features: ['Versiyon kontrolü', 'Issue takibi', 'CI/CD pipeline'],
      pricing: 'Ücretsiz başlangıç',
      popular: true
    },
    {
      id: 'jira',
      name: 'Jira',
      provider: 'Atlassian',
      category: 'Proje Yönetimi',
      icon: <DatabaseOutlined style={{ fontSize: 32, color: '#0052CC' }} />,
      description: 'Proje ve görev yönetimi',
      features: ['Agile boards', 'Sprint planning', 'Reporting'],
      pricing: 'Kullanıcı başı ücret',
      popular: false
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      provider: 'HubSpot',
      category: 'CRM',
      icon: <TeamOutlined style={{ fontSize: 32, color: '#FF7A59' }} />,
      description: 'CRM ve pazarlama otomasyonu',
      features: ['Lead yönetimi', 'Email marketing', 'Analytics'],
      pricing: 'Ücretsiz başlangıç',
      popular: false
    }
  ];

  const handleConnect = (integration: Integration | AvailableIntegration) => {
    setSelectedIntegration(integration as Integration);
    setSetupModalVisible(true);
    setCurrentStep(0);
  };

  const handleDisconnect = (integrationId: string) => {
    Modal.confirm({
      title: 'Entegrasyonu Kaldır',
      content: 'Bu entegrasyonu kaldırmak istediğinizden emin misiniz?',
      okText: 'Kaldır',
      cancelText: 'İptal',
      okType: 'danger',
      icon: <DisconnectOutlined />,
      onOk: async () => {
        setLoading(true);
        try {
          // API call would go here
          message.success('Entegrasyon kaldırıldı');
          fetchIntegrations();
        } catch (error) {
          message.error('İşlem başarısız');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSync = async (integrationId: string) => {
    setLoading(true);
    try {
      // API call would go here
      message.success('Senkronizasyon başlatıldı');
      fetchIntegrations();
    } catch (error) {
      message.error('Senkronizasyon başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = async (values: any) => {
    setLoading(true);
    try {
      // API call would go here
      message.success('Entegrasyon kurulumu tamamlandı');
      setSetupModalVisible(false);
      fetchIntegrations();
    } catch (error) {
      message.error('Kurulum başarısız');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      connected: { color: 'success', text: 'Bağlı', icon: <CheckCircleOutlined /> },
      disconnected: { color: 'default', text: 'Bağlı Değil', icon: <DisconnectOutlined /> },
      error: { color: 'error', text: 'Hata', icon: <CloseCircleOutlined /> },
      configuring: { color: 'processing', text: 'Yapılandırılıyor', icon: <SyncOutlined spin /> }
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'İletişim': <MessageOutlined />,
      'Analitik': <LineChartOutlined />,
      'Ödeme': <CreditCardOutlined />,
      'E-posta': <MailOutlined />,
      'Depolama': <CloudOutlined />,
      'CRM': <TeamOutlined />,
      'Proje Yönetimi': <CalendarOutlined />,
      'Geliştirme': <CodeOutlined />
    };
    return icons[category] || <ApiOutlined />;
  };

  const getIntegrationIcon = (name: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Slack': <SlackOutlined style={{ color: '#4A154B' }} />,
      'Google Analytics': <GoogleOutlined style={{ color: '#4285F4' }} />,
      'Stripe': <CreditCardOutlined style={{ color: '#635BFF' }} />,
      'SendGrid': <MailOutlined style={{ color: '#1A82E2' }} />,
      'AWS S3': <AmazonOutlined style={{ color: '#FF9900' }} />
    };
    return icons[name] || <ApiOutlined />;
  };

  const columns: ColumnsType<Integration> = [
    {
      title: 'Entegrasyon',
      key: 'integration',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar size={40} style={{ backgroundColor: '#f5f5f5' }}>
            {getIntegrationIcon(record.name)}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.provider}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => (
        <Tag icon={getCategoryIcon(category)}>
          {category}
        </Tag>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Son Senkronizasyon',
      dataIndex: 'lastSync',
      key: 'lastSync',
      width: 180,
      render: (date) => date ? (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('DD.MM.YYYY HH:mm')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).fromNow()}
          </Text>
        </Space>
      ) : '-'
    },
    {
      title: 'Kullanım',
      key: 'usage',
      width: 150,
      render: (_, record) => record.usage ? (
        <Tooltip title={`${record.usage.requests} / ${record.usage.limit} istek`}>
          <Progress 
            percent={Math.round((record.usage.requests / record.usage.limit) * 100)} 
            size="small"
            status={record.usage.requests / record.usage.limit > 0.8 ? 'exception' : 'normal'}
          />
        </Tooltip>
      ) : '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === 'connected' && (
            <Tooltip title="Senkronize Et">
              <Button 
                icon={<SyncOutlined />} 
                size="small"
                onClick={() => handleSync(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Ayarlar">
            <Button 
              icon={<SettingOutlined />} 
              size="small"
              onClick={() => {
                setSelectedIntegration(record);
                setConfigModalVisible(true);
              }}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'details',
                  label: 'Detaylar',
                  icon: <InfoCircleOutlined />,
                  onClick: () => {
                    setSelectedIntegration(record);
                    setDetailsModalVisible(true);
                  }
                },
                {
                  key: 'logs',
                  label: 'Loglar',
                  icon: <FileTextOutlined />
                },
                record.status === 'connected' && {
                  key: 'pause',
                  label: 'Duraklat',
                  icon: <PauseCircleOutlined />
                },
                {
                  type: 'divider'
                },
                {
                  key: 'disconnect',
                  label: 'Bağlantıyı Kes',
                  icon: <DisconnectOutlined />,
                  danger: true,
                  onClick: () => handleDisconnect(record.id)
                }
              ].filter(Boolean)
            }}
          >
            <Button icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </Space>
      )
    }
  ];

  const logColumns: ColumnsType<IntegrationLog> = [
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp) => dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss')
    },
    {
      title: 'Entegrasyon',
      dataIndex: 'integrationId',
      key: 'integrationId',
      render: (integrationId) => {
        const integration = integrations.find(i => i.id === integrationId);
        return integration ? (
          <Space>
            {getIntegrationIcon(integration.name)}
            <Text>{integration.name}</Text>
          </Space>
        ) : integrationId;
      }
    },
    {
      title: 'İşlem',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Tag>{action}</Tag>
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'success' ? 'success' : status === 'error' ? 'error' : 'warning'}>
          {status === 'success' ? 'Başarılı' : status === 'error' ? 'Hata' : 'Uyarı'}
        </Tag>
      )
    },
    {
      title: 'Mesaj',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    error: integrations.filter(i => i.status === 'error').length,
    categories: [...new Set(integrations.map(i => i.category))].length
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <ApiOutlined /> Entegrasyon Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchIntegrations}>
                Yenile
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setMarketplaceModalVisible(true)}
              >
                Yeni Entegrasyon
              </Button>
            </Space>
          </Col>
        </Row>
        <Divider />
        
        {/* Statistics */}
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Toplam Entegrasyon"
              value={stats.total}
              prefix={<ApiOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Aktif"
              value={stats.connected}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Hatalı"
              value={stats.error}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Kategori"
              value={stats.categories}
              prefix={<AppstoreOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Error Alert */}
      {stats.error > 0 && (
        <Alert
          message="Hatalı Entegrasyonlar"
          description={`${stats.error} entegrasyonda hata tespit edildi. Lütfen kontrol ediniz.`}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Aktif Entegrasyonlar" key="active">
            {/* Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Select
                  placeholder="Kategori"
                  style={{ width: '100%' }}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                >
                  <Option value="all">Tüm Kategoriler</Option>
                  <Option value="İletişim">İletişim</Option>
                  <Option value="Analitik">Analitik</Option>
                  <Option value="Ödeme">Ödeme</Option>
                  <Option value="E-posta">E-posta</Option>
                  <Option value="Depolama">Depolama</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Durum"
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="all">Tüm Durumlar</Option>
                  <Option value="connected">Bağlı</Option>
                  <Option value="disconnected">Bağlı Değil</Option>
                  <Option value="error">Hata</Option>
                  <Option value="configuring">Yapılandırılıyor</Option>
                </Select>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredIntegrations}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                total: filteredIntegrations.length,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} entegrasyon`
              }}
            />
          </TabPane>

          <TabPane tab="Entegrasyon Marketplesi" key="marketplace">
            <Alert
              message="Entegrasyon Marketplesi"
              description="İşletmeniz için yeni entegrasyonlar ekleyin ve bağlayın."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={[16, 16]}>
              {availableIntegrations.map(integration => (
                <Col span={8} key={integration.id}>
                  <Card
                    hoverable
                    actions={[
                      <Button 
                        type="primary" 
                        icon={<LinkOutlined />}
                        onClick={() => handleConnect(integration as any)}
                      >
                        Bağlan
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      avatar={integration.icon}
                      title={
                        <Space>
                          {integration.name}
                          {integration.popular && <Tag color="gold">Popüler</Tag>}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text type="secondary">{integration.description}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {integration.provider} • {integration.pricing}
                          </Text>
                          <Space wrap>
                            {integration.features.slice(0, 2).map(feature => (
                              <Tag key={feature} style={{ fontSize: 11 }}>
                                {feature}
                              </Tag>
                            ))}
                            {integration.features.length > 2 && (
                              <Tag style={{ fontSize: 11 }}>
                                +{integration.features.length - 2} özellik
                              </Tag>
                            )}
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="Aktivite Logları" key="logs">
            <Table
              columns={logColumns}
              dataSource={logs}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} log`
              }}
            />
          </TabPane>

          <TabPane tab="API Anahtarları" key="apikeys">
            <Alert
              message="API Güvenliği"
              description="API anahtarlarınızı güvenli bir şekilde saklayın ve düzenli olarak yenileyin."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <List
              dataSource={integrations.filter(i => i.config.apiKey)}
              renderItem={integration => (
                <List.Item
                  actions={[
                    <Button size="small" icon={<EyeInvisibleOutlined />}>
                      Göster
                    </Button>,
                    <Button size="small" icon={<SyncOutlined />}>
                      Yenile
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={getIntegrationIcon(integration.name)}
                    title={integration.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">
                          API Key: ****{integration.config.apiKey?.slice(-4)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Oluşturulma: {dayjs(integration.createdAt).format('DD.MM.YYYY')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Configuration Modal */}
      <Modal
        title={`${selectedIntegration?.name} Ayarları`}
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            message.success('Ayarlar güncellendi');
            setConfigModalVisible(false);
          }}
        >
          <Form.Item
            name="syncFrequency"
            label="Senkronizasyon Sıklığı"
            initialValue="30min"
          >
            <Select>
              <Option value="realtime">Gerçek Zamanlı</Option>
              <Option value="5min">Her 5 Dakika</Option>
              <Option value="30min">Her 30 Dakika</Option>
              <Option value="1hour">Saatlik</Option>
              <Option value="daily">Günlük</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notifications"
            label="Bildirimler"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>

          <Form.Item
            name="errorHandling"
            label="Hata Durumunda"
            initialValue="retry"
          >
            <Radio.Group>
              <Radio value="retry">Tekrar Dene</Radio>
              <Radio value="skip">Atla</Radio>
              <Radio value="notify">Sadece Bildir</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title="Entegrasyon Detayları"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedIntegration && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Ad" span={2}>
                <Space>
                  {getIntegrationIcon(selectedIntegration.name)}
                  <Text strong>{selectedIntegration.name}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Sağlayıcı">
                {selectedIntegration.provider}
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">
                {selectedIntegration.category}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                {getStatusTag(selectedIntegration.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Senkronizasyon">
                {selectedIntegration.syncFrequency || 'Yapılandırılmamış'}
              </Descriptions.Item>
              <Descriptions.Item label="Son Senkronizasyon" span={2}>
                {selectedIntegration.lastSync ? 
                  dayjs(selectedIntegration.lastSync).format('DD.MM.YYYY HH:mm:ss') : 
                  'Henüz senkronize edilmedi'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma" span={2}>
                {dayjs(selectedIntegration.createdAt).format('DD.MM.YYYY HH:mm')} - {selectedIntegration.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Özellikler" span={2}>
                <Space wrap>
                  {selectedIntegration.features.map(feature => (
                    <Tag key={feature}>{feature}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {selectedIntegration.usage && (
              <>
                <Divider />
                <Title level={5}>Kullanım İstatistikleri</Title>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="API İstekleri"
                      value={selectedIntegration.usage.requests}
                      suffix={`/ ${selectedIntegration.usage.limit}`}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Kullanım Oranı"
                      value={Math.round((selectedIntegration.usage.requests / selectedIntegration.usage.limit) * 100)}
                      suffix="%"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Son İstek"
                      value={selectedIntegration.usage.lastRequest ? 
                        dayjs(selectedIntegration.usage.lastRequest).fromNow() : 
                        '-'
                      }
                    />
                  </Col>
                </Row>
              </>
            )}
          </>
        )}
      </Modal>

      {/* Setup Modal */}
      <Modal
        title="Entegrasyon Kurulumu"
        open={setupModalVisible}
        onCancel={() => setSetupModalVisible(false)}
        width={700}
        footer={null}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Bağlantı" />
          <Step title="Yapılandırma" />
          <Step title="Test" />
          <Step title="Tamamlandı" />
        </Steps>

        {currentStep === 0 && (
          <Form layout="vertical">
            <Alert
              message="API Bağlantısı"
              description="Entegrasyonu bağlamak için gerekli bilgileri girin."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form.Item
              label="API Anahtarı"
              name="apiKey"
              rules={[{ required: true, message: 'API anahtarı gerekli' }]}
            >
              <Input.Password prefix={<KeyOutlined />} placeholder="sk_live_..." />
            </Form.Item>
            <Form.Item
              label="API Secret"
              name="apiSecret"
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Secret key" />
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && (
          <Form layout="vertical">
            <Form.Item
              label="Webhook URL"
              name="webhookUrl"
            >
              <Input prefix={<LinkOutlined />} placeholder="https://..." />
            </Form.Item>
            <Form.Item
              label="Bildirim Kanalı"
              name="channel"
            >
              <Select placeholder="Kanal seçin">
                <Option value="general">#general</Option>
                <Option value="notifications">#notifications</Option>
                <Option value="alerts">#alerts</Option>
              </Select>
            </Form.Item>
          </Form>
        )}

        {currentStep === 2 && (
          <Result
            status="success"
            title="Bağlantı Test Ediliyor"
            subTitle="Entegrasyon bağlantısı test ediliyor, lütfen bekleyin..."
            extra={<SyncOutlined spin style={{ fontSize: 32 }} />}
          />
        )}

        {currentStep === 3 && (
          <Result
            status="success"
            title="Entegrasyon Başarılı!"
            subTitle="Entegrasyon başarıyla kuruldu ve kullanıma hazır."
            extra={[
              <Button type="primary" key="done" onClick={() => setSetupModalVisible(false)}>
                Tamamla
              </Button>
            ]}
          />
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          {currentStep > 0 && currentStep < 3 && (
            <Button style={{ marginRight: 8 }} onClick={() => setCurrentStep(currentStep - 1)}>
              Geri
            </Button>
          )}
          {currentStep < 2 && (
            <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
              İleri
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="primary" onClick={() => setCurrentStep(3)}>
              Test Et
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TenantIntegrations;