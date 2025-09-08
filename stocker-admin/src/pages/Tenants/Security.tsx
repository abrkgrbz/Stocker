import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Switch,
  Form,
  Input,
  Select,
  Table,
  Tag,
  Alert,
  Tabs,
  List,
  Statistic,
  Timeline,
  Progress,
  Badge,
  Modal,
  message,
  Tooltip,
  Divider,
  Checkbox,
  Radio,
  InputNumber,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  SafetyOutlined,
  LockOutlined,
  UnlockOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  UserOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  KeyOutlined,
  DatabaseOutlined,
  ApiOutlined,
  MailOutlined,
  BellOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'permission_denied' | 'data_breach' | 'malware_detected' | 'ddos_attack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  source: string;
  user?: string;
  resolved: boolean;
  actions: string[];
}

interface SecurityRule {
  id: string;
  name: string;
  type: 'ip_whitelist' | 'ip_blacklist' | 'rate_limit' | 'geo_block' | 'user_agent_block';
  enabled: boolean;
  value: string;
  description: string;
  createdAt: string;
}

const TenantSecurity: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const mockSecurityEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'failed_login',
      severity: 'medium',
      description: 'Çoklu başarısız giriş denemesi tespit edildi',
      timestamp: '2024-12-07T14:30:00Z',
      source: '185.220.101.182',
      user: 'admin@abc-corp.com',
      resolved: false,
      actions: ['IP engellendi', 'Kullanıcı bilgilendirildi'],
    },
    {
      id: '2',
      type: 'suspicious_activity',
      severity: 'high',
      description: 'Olağandışı veri erişim paterni',
      timestamp: '2024-12-07T13:15:00Z',
      source: '192.168.1.100',
      user: 'jane@abc-corp.com',
      resolved: true,
      actions: ['Aktivite loglandı', 'Güvenlik ekibi bilgilendirildi'],
    },
    {
      id: '3',
      type: 'ddos_attack',
      severity: 'critical',
      description: 'DDoS saldırısı tespit edildi',
      timestamp: '2024-12-07T12:00:00Z',
      source: 'Multiple IPs',
      resolved: true,
      actions: ['Rate limiting aktifleştirildi', 'CDN koruması devreye alındı'],
    },
  ];

  const mockSecurityRules: SecurityRule[] = [
    {
      id: '1',
      name: 'Office IP Whitelist',
      type: 'ip_whitelist',
      enabled: true,
      value: '192.168.1.0/24,10.0.0.0/8',
      description: 'Ofis IP adreslerine izin ver',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Malicious IP Block',
      type: 'ip_blacklist',
      enabled: true,
      value: '185.220.101.0/24',
      description: 'Bilinen kötü amaçlı IP bloku',
      createdAt: '2024-03-20T14:30:00Z',
    },
    {
      id: '3',
      name: 'API Rate Limit',
      type: 'rate_limit',
      enabled: true,
      value: '1000/hour',
      description: 'Saatlik API istek limiti',
      createdAt: '2024-06-10T09:15:00Z',
    },
  ];

  const securityStats = {
    totalEvents: 247,
    resolvedEvents: 234,
    criticalEvents: 3,
    securityScore: 85,
    lastScan: '2024-12-07T10:30:00Z',
    activeRules: 12,
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    message.success(`Güvenlik kuralı ${enabled ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`);
  };

  const handleResolveEvent = async (eventId: string) => {
    await Swal.fire({
      title: 'Güvenlik Olayını Çöz',
      text: 'Bu güvenlik olayını çözüldü olarak işaretlemek istediğinize emin misiniz?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Çözüldü İşaretle',
      cancelButtonText: 'İptal',
    }).then((result) => {
      if (result.isConfirmed) {
        message.success('Güvenlik olayı çözüldü olarak işaretlendi');
      }
    });
  };

  const handleSecurityScan = async () => {
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await Swal.fire({
      icon: 'success',
      title: 'Güvenlik Taraması Tamamlandı',
      text: 'Sistem güvenlik taraması başarıyla tamamlandı. 2 yeni risk tespit edildi.',
      confirmButtonColor: '#667eea',
    });
    
    setLoading(false);
  };

  const SecurityDashboard = () => (
    <div>
      {/* Security Score */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row gutter={[16, 16]} align="middle">
              <Col flex="auto">
                <Title level={3} style={{ margin: 0 }}>
                  Güvenlik Skoru: {securityStats.securityScore}/100
                </Title>
                <Text type="secondary">
                  Son güncelleme: {dayjs(securityStats.lastScan).format('DD.MM.YYYY HH:mm')}
                </Text>
              </Col>
              <Col>
                <Progress
                  type="circle"
                  percent={securityStats.securityScore}
                  strokeColor={
                    securityStats.securityScore >= 80 ? '#52c41a' :
                    securityStats.securityScore >= 60 ? '#faad14' : '#ff4d4f'
                  }
                />
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />} 
                  loading={loading}
                  onClick={handleSecurityScan}
                >
                  Güvenlik Taraması Başlat
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Güvenlik Olayı"
              value={securityStats.totalEvents}
              prefix={<SafetyOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Çözülen Olaylar"
              value={securityStats.resolvedEvents}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kritik Olaylar"
              value={securityStats.criticalEvents}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Kurallar"
              value={securityStats.activeRules}
              prefix={<SafetyOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Events */}
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="Son Güvenlik Olayları" extra={
            <Button icon={<HistoryOutlined />}>Tüm Olaylar</Button>
          }>
            <List
              dataSource={mockSecurityEvents.slice(0, 5)}
              renderItem={(event) => (
                <List.Item
                  actions={[
                    !event.resolved && (
                      <Button 
                        size="small" 
                        type="primary"
                        onClick={() => handleResolveEvent(event.id)}
                      >
                        Çöz
                      </Button>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <SafetyOutlined 
                        style={{ 
                          fontSize: 24,
                          color: event.severity === 'critical' ? '#ff4d4f' :
                                 event.severity === 'high' ? '#fa8c16' :
                                 event.severity === 'medium' ? '#faad14' : '#52c41a'
                        }} 
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{event.description}</Text>
                        <Tag color={
                          event.severity === 'critical' ? 'red' :
                          event.severity === 'high' ? 'orange' :
                          event.severity === 'medium' ? 'gold' : 'green'
                        }>
                          {event.severity.toUpperCase()}
                        </Tag>
                        {event.resolved && <Tag color="green">Çözüldü</Tag>}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">
                          {dayjs(event.timestamp).format('DD.MM.YYYY HH:mm')} • {event.source}
                        </Text>
                        {event.user && (
                          <Text type="secondary">Kullanıcı: {event.user}</Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Güvenlik Durumu">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>Firewall Aktif</Text>
                      <br />
                      <Text type="secondary">Tüm portlar korumalı</Text>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>SSL Sertifikası Geçerli</Text>
                      <br />
                      <Text type="secondary">45 gün kaldı</Text>
                    </div>
                  ),
                },
                {
                  color: 'orange',
                  children: (
                    <div>
                      <Text strong>2FA Uyarısı</Text>
                      <br />
                      <Text type="secondary">%60 kullanıcı aktif</Text>
                    </div>
                  ),
                },
                {
                  color: 'red',
                  children: (
                    <div>
                      <Text strong>Şüpheli Aktivite</Text>
                      <br />
                      <Text type="secondary">3 IP engellenmiş</Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const SecurityRules = () => (
    <Card>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>Güvenlik Kuralları</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Yeni Kural Ekle
        </Button>
      </Space>

      <Table
        dataSource={mockSecurityRules}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: 'Kural Adı',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{text}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {record.description}
                </Text>
              </Space>
            ),
          },
          {
            title: 'Tip',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
              <Tag color={
                type === 'ip_whitelist' ? 'green' :
                type === 'ip_blacklist' ? 'red' :
                type === 'rate_limit' ? 'blue' :
                type === 'geo_block' ? 'orange' : 'default'
              }>
                {type.replace('_', ' ').toUpperCase()}
              </Tag>
            ),
          },
          {
            title: 'Değer',
            dataIndex: 'value',
            key: 'value',
            render: (value) => <Text code>{value}</Text>,
          },
          {
            title: 'Durum',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled, record) => (
              <Switch
                checked={enabled}
                onChange={(checked) => handleToggleRule(record.id, checked)}
                checkedChildren="Aktif"
                unCheckedChildren="Pasif"
              />
            ),
          },
          {
            title: 'Oluşturulma',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD.MM.YYYY'),
          },
          {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
              <Space>
                <Button type="text" icon={<EyeOutlined />} />
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  const SecuritySettings = () => (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card title="Genel Güvenlik">
          <Form layout="vertical">
            <Form.Item>
              <Space>
                <Switch defaultChecked />
                <Text>Güvenlik olayı bildirimlerini etkinleştir</Text>
              </Space>
            </Form.Item>
            <Form.Item>
              <Space>
                <Switch defaultChecked />
                <Text>Otomatik güvenlik taramalarını etkinleştir</Text>
              </Space>
            </Form.Item>
            <Form.Item>
              <Space>
                <Switch />
                <Text>Şüpheli aktivite durumunda hesabı otomatik kilitle</Text>
              </Space>
            </Form.Item>
            <Form.Item label="Güvenlik log saklama süresi">
              <Select defaultValue={90} style={{ width: 200 }}>
                <Option value={30}>30 gün</Option>
                <Option value={90}>90 gün</Option>
                <Option value={365}>1 yıl</Option>
                <Option value={-1}>Sınırsız</Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="Kimlik Doğrulama">
          <Form layout="vertical">
            <Form.Item>
              <Space>
                <Switch defaultChecked />
                <Text>İki faktörlü doğrulamayı zorunlu kıl</Text>
              </Space>
            </Form.Item>
            <Form.Item>
              <Space>
                <Switch defaultChecked />
                <Text>Güçlü şifre politikası</Text>
              </Space>
            </Form.Item>
            <Form.Item label="Oturum süresi">
              <Select defaultValue={30} style={{ width: 200 }}>
                <Option value={15}>15 dakika</Option>
                <Option value={30}>30 dakika</Option>
                <Option value={60}>1 saat</Option>
                <Option value={480}>8 saat</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Maksimum başarısız giriş">
              <InputNumber min={3} max={20} defaultValue={5} />
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="Ağ Güvenliği">
          <Form layout="vertical">
            <Form.Item>
              <Space>
                <Switch defaultChecked />
                <Text>DDoS koruması</Text>
              </Space>
            </Form.Item>
            <Form.Item>
              <Space>
                <Switch defaultChecked />
                <Text>Rate limiting</Text>
              </Space>
            </Form.Item>
            <Form.Item>
              <Space>
                <Switch />
                <Text>Coğrafi IP engelleme</Text>
              </Space>
            </Form.Item>
            <Form.Item label="Maksimum API istek/saat">
              <InputNumber min={100} max={10000} defaultValue={1000} />
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="Veri Koruması">
          <Form layout="vertical">
            <Form.Item>
              <Space>
                <Switch defaultChecked />
                <Text>Veri şifreleme (AES-256)</Text>
              </Space>
            </Form.Item>
            <Form.Item>
              <Space>
                <Switch defaultChecked />
                <Text>Otomatik yedekleme şifrelemesi</Text>
              </Space>
            </Form.Item>
            <Form.Item>
              <Space>
                <Switch defaultChecked />
                <Text>Hassas veri maskeleme</Text>
              </Space>
            </Form.Item>
            <Form.Item label="Veri saklama süresi">
              <Select defaultValue={365} style={{ width: 200 }}>
                <Option value={90}>90 gün</Option>
                <Option value={365}>1 yıl</Option>
                <Option value={1095}>3 yıl</Option>
                <Option value={-1}>Sınırsız</Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );

  const SecurityEvents = () => (
    <Card>
      <Table
        dataSource={mockSecurityEvents}
        rowKey="id"
        columns={[
          {
            title: 'Olay',
            key: 'event',
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.description}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {record.type.replace('_', ' ').toUpperCase()}
                </Text>
              </Space>
            ),
          },
          {
            title: 'Önem',
            dataIndex: 'severity',
            key: 'severity',
            render: (severity) => (
              <Badge
                status={
                  severity === 'critical' ? 'error' :
                  severity === 'high' ? 'warning' :
                  severity === 'medium' ? 'processing' : 'success'
                }
                text={severity.toUpperCase()}
              />
            ),
          },
          {
            title: 'Kaynak',
            dataIndex: 'source',
            key: 'source',
            render: (source) => <Text code>{source}</Text>,
          },
          {
            title: 'Kullanıcı',
            dataIndex: 'user',
            key: 'user',
            render: (user) => user || '-',
          },
          {
            title: 'Zaman',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
          },
          {
            title: 'Durum',
            dataIndex: 'resolved',
            key: 'resolved',
            render: (resolved) => (
              <Tag color={resolved ? 'green' : 'orange'}>
                {resolved ? 'Çözüldü' : 'Bekliyor'}
              </Tag>
            ),
          },
          {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
              !record.resolved && (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleResolveEvent(record.id)}
                >
                  Çöz
                </Button>
              )
            ),
          },
        ]}
      />
    </Card>
  );

  return (
    <PageContainer
      header={{
        title: 'Güvenlik',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Güvenlik' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
      }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><SafetyOutlined /> Dashboard</span>} key="dashboard">
          <SecurityDashboard />
        </TabPane>
        
        <TabPane tab={<span><SafetyOutlined /> Kurallar</span>} key="rules">
          <SecurityRules />
        </TabPane>
        
        <TabPane tab={<span><WarningOutlined /> Olaylar</span>} key="events">
          <SecurityEvents />
        </TabPane>
        
        <TabPane tab={<span><SettingOutlined /> Ayarlar</span>} key="settings">
          <SecuritySettings />
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Button type="primary" size="large" icon={<SaveOutlined />}>
              Ayarları Kaydet
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};

export default TenantSecurity;