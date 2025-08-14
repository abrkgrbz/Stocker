import { Modal, Row, Col, Typography, Tag, Space, List, Tabs, Button, Card, Progress, Statistic } from 'antd';
import { 
  CheckCircleOutlined,
  RocketOutlined,
  TrophyOutlined,
  StarOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  ApiOutlined
} from '@ant-design/icons';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ModuleDetailModalProps {
  module: {
    id: string;
    name: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    features: string[];
    benefits: string[];
    status: string;
  };
  visible: boolean;
  onClose: () => void;
}

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({ module, visible, onClose }) => {
  const integrations = [
    { name: 'E-posta', status: 'active' },
    { name: 'Takvim', status: 'active' },
    { name: 'Muhasebe', status: 'active' },
    { name: 'E-ticaret', status: 'coming' },
    { name: 'Lojistik', status: 'coming' },
    { name: 'CRM', status: 'active' }
  ];

  const useCases = [
    {
      title: 'Küçük İşletmeler',
      description: 'Temel özellikleri kullanarak hızlı başlangıç',
      icon: <RocketOutlined />
    },
    {
      title: 'Orta Ölçekli Şirketler',
      description: 'Gelişmiş özellikler ile süreç optimizasyonu',
      icon: <TrophyOutlined />
    },
    {
      title: 'Kurumsal Firmalar',
      description: 'Tam entegrasyon ve özelleştirme imkanları',
      icon: <SafetyOutlined />
    }
  ];

  const screenshots = [
    { title: 'Dashboard', url: '/screenshots/dashboard.png' },
    { title: 'Raporlar', url: '/screenshots/reports.png' },
    { title: 'Analiz', url: '/screenshots/analytics.png' }
  ];

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Kapat
        </Button>,
        <Button key="demo" type="default" icon={<RocketOutlined />}>
          Demo İste
        </Button>,
        <Button key="start" type="primary" icon={<CheckCircleOutlined />}>
          Hemen Başla
        </Button>
      ]}
      className="module-detail-modal"
    >
      <div className="modal-header">
        <div className="module-icon-large" style={{ backgroundColor: `${module.color}20`, color: module.color }}>
          {module.icon}
        </div>
        <div className="module-info">
          <Title level={2}>{module.title}</Title>
          <Paragraph className="module-description-full">{module.description}</Paragraph>
          <Space>
            <Tag color={module.status === 'active' ? 'success' : 'processing'}>
              {module.status === 'active' ? 'Kullanıma Hazır' : 'Beta'}
            </Tag>
            <Tag icon={<StarOutlined />} color="gold">4.8/5 Puan</Tag>
            <Tag icon={<ClockCircleOutlined />}>5 dk kurulum</Tag>
          </Space>
        </div>
      </div>

      <Tabs defaultActiveKey="features" className="module-tabs">
        <TabPane tab="Özellikler" key="features">
          <Row gutter={[24, 24]}>
            <Col span={14}>
              <Card title="Temel Özellikler" className="feature-card">
                <List
                  dataSource={module.features}
                  renderItem={item => (
                    <List.Item>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={10}>
              <Card title="İş Sonuçları" className="benefits-card">
                {module.benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <ArrowUpOutlined style={{ color: '#52c41a' }} />
                    <Text strong>{benefit}</Text>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Entegrasyonlar" key="integrations">
          <Card title="Mevcut Entegrasyonlar">
            <Row gutter={[16, 16]}>
              {integrations.map((integration, index) => (
                <Col span={8} key={index}>
                  <Card className="integration-card" hoverable>
                    <Space>
                      <ApiOutlined style={{ fontSize: 20, color: integration.status === 'active' ? '#52c41a' : '#faad14' }} />
                      <div>
                        <Text strong>{integration.name}</Text>
                        <br />
                        <Tag color={integration.status === 'active' ? 'success' : 'warning'} style={{ marginTop: 4 }}>
                          {integration.status === 'active' ? 'Aktif' : 'Yakında'}
                        </Tag>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="Kullanım Senaryoları" key="usecases">
          <Row gutter={[16, 16]}>
            {useCases.map((useCase, index) => (
              <Col span={8} key={index}>
                <Card className="usecase-card" hoverable>
                  <div className="usecase-icon">{useCase.icon}</div>
                  <Title level={5}>{useCase.title}</Title>
                  <Paragraph>{useCase.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
          
          <Card title="Başarı Hikayeleri" style={{ marginTop: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Aktif Kullanıcı"
                  value={5280}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="İşlem Hacmi"
                  value={125}
                  suffix="M₺"
                  prefix={<DollarOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Verimlilik Artışı"
                  value={42}
                  suffix="%"
                  prefix={<ArrowUpOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="Fiyatlandırma" key="pricing">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card className="pricing-card" hoverable>
                <div className="pricing-header">
                  <Title level={4}>Başlangıç</Title>
                  <div className="price">
                    <Text className="currency">₺</Text>
                    <Text className="amount">99</Text>
                    <Text className="period">/ay</Text>
                  </div>
                </div>
                <List
                  dataSource={[
                    '5 kullanıcıya kadar',
                    'Temel özellikler',
                    'E-posta desteği',
                    '10GB depolama'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
                <Button block>Planı Seç</Button>
              </Card>
            </Col>

            <Col span={8}>
              <Card className="pricing-card featured" hoverable>
                <Badge.Ribbon text="Popüler" color="red">
                  <div className="pricing-header">
                    <Title level={4}>Profesyonel</Title>
                    <div className="price">
                      <Text className="currency">₺</Text>
                      <Text className="amount">299</Text>
                      <Text className="period">/ay</Text>
                    </div>
                  </div>
                  <List
                    dataSource={[
                      '25 kullanıcıya kadar',
                      'Tüm özellikler',
                      'Öncelikli destek',
                      '100GB depolama',
                      'API erişimi'
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                  <Button type="primary" block>Planı Seç</Button>
                </Badge.Ribbon>
              </Card>
            </Col>

            <Col span={8}>
              <Card className="pricing-card" hoverable>
                <div className="pricing-header">
                  <Title level={4}>Kurumsal</Title>
                  <div className="price">
                    <Text className="currency">₺</Text>
                    <Text className="amount">Özel</Text>
                  </div>
                </div>
                <List
                  dataSource={[
                    'Sınırsız kullanıcı',
                    'Özel özellikler',
                    '7/24 destek',
                    'Sınırsız depolama',
                    'Özel entegrasyonlar'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
                <Button block>İletişime Geç</Button>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

// Import için gerekli tip tanımlamaları
import { TeamOutlined, DollarOutlined } from '@ant-design/icons';