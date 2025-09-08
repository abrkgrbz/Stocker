import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  DatePicker,
  Checkbox,
  message,
  Alert,
  Tabs,
  Badge,
  Tooltip,
  Popconfirm,
  Descriptions,
  Timeline,
  List,
  Avatar,
  Progress,
  Statistic,
  Drawer,
  Divider,
  Radio,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  KeyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  SettingOutlined,
  SafetyOutlined,
  ApiOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ExportOutlined,
  ImportOutlined,
  LockOutlined,
  UnlockOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  status: 'active' | 'inactive' | 'expired';
  permissions: string[];
  rateLimit: number;
  rateLimitWindow: number;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  usageCount: number;
  description?: string;
  ipWhitelist: string[];
  environment: 'production' | 'staging' | 'development';
}

interface ApiUsage {
  date: string;
  requests: number;
  errors: number;
  endpoint: string;
  method: string;
  responseTime: number;
}

const TenantApiKeys: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('keys');
  const [form] = Form.useForm();

  // Mock data
  const mockApiKeys: ApiKey[] = [
    {
      id: '1',
      name: 'Production API',
      key: 'mock_prod_key_abc123def456789...',
      prefix: 'mock_prod',
      status: 'active',
      permissions: ['read', 'write', 'delete'],
      rateLimit: 1000,
      rateLimitWindow: 3600,
      createdAt: '2024-01-15T10:00:00Z',
      lastUsedAt: '2024-12-07T14:30:00Z',
      expiresAt: '2025-01-15T10:00:00Z',
      usageCount: 125467,
      description: 'Production ortamı için ana API anahtarı',
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
      environment: 'production',
    },
    {
      id: '2',
      name: 'Test API',
      key: 'mock_test_key_xyz789uvw012345...',
      prefix: 'mock_test',
      status: 'active',
      permissions: ['read', 'write'],
      rateLimit: 500,
      rateLimitWindow: 3600,
      createdAt: '2024-03-20T15:30:00Z',
      lastUsedAt: '2024-12-05T11:20:00Z',
      usageCount: 45231,
      description: 'Test ve geliştirme için API anahtarı',
      ipWhitelist: [],
      environment: 'staging',
    },
    {
      id: '3',
      name: 'Mobile App API',
      key: 'mock_prod_key_abc123def456789...',
      prefix: 'mock_prod',
      status: 'inactive',
      permissions: ['read'],
      rateLimit: 2000,
      rateLimitWindow: 3600,
      createdAt: '2024-06-10T09:15:00Z',
      lastUsedAt: '2024-11-20T16:45:00Z',
      expiresAt: '2024-12-10T09:15:00Z',
      usageCount: 89123,
      description: 'Mobil uygulama için sadece okuma yetkili anahtar',
      ipWhitelist: [],
      environment: 'production',
    },
  ];

  const mockUsage: ApiUsage[] = [
    {
      date: '2024-12-07',
      requests: 1245,
      errors: 12,
      endpoint: '/api/v1/users',
      method: 'GET',
      responseTime: 120,
    },
    {
      date: '2024-12-06',
      requests: 1180,
      errors: 8,
      endpoint: '/api/v1/orders',
      method: 'POST',
      responseTime: 150,
    },
    {
      date: '2024-12-05',
      requests: 980,
      errors: 15,
      endpoint: '/api/v1/products',
      method: 'GET',
      responseTime: 95,
    },
  ];

  const statusColors = {
    active: 'success',
    inactive: 'default',
    expired: 'error',
  };

  const environmentColors = {
    production: 'red',
    staging: 'orange',
    development: 'green',
  };

  const columns: ProColumns<ApiKey>[] = [
    {
      title: 'API Anahtarı',
      key: 'key',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <KeyOutlined style={{ color: '#667eea' }} />
            <Text strong>{record.name}</Text>
            <Tag color={environmentColors[record.environment]}>
              {record.environment.toUpperCase()}
            </Tag>
          </Space>
          <Space>
            <Text code style={{ fontFamily: 'monospace' }}>
              {isKeyVisible[record.id] 
                ? record.key 
                : record.key.substring(0, 20) + '...'
              }
            </Text>
            <Tooltip title={isKeyVisible[record.id] ? 'Gizle' : 'Göster'}>
              <Button
                type="text"
                size="small"
                icon={isKeyVisible[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setIsKeyVisible(prev => ({
                  ...prev,
                  [record.id]: !prev[record.id]
                }))}
              />
            </Tooltip>
            <Tooltip title="Kopyala">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(record.key);
                  message.success('API anahtarı kopyalandı');
                }}
              />
            </Tooltip>
          </Space>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record) => (
        <Space direction="vertical" size={0}>
          <Badge
            status={statusColors[status as keyof typeof statusColors]}
            text={
              status === 'active' ? 'Aktif' :
              status === 'inactive' ? 'İnaktif' : 'Süresi Dolmuş'
            }
          />
          {record.expiresAt && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(record.expiresAt).diff(dayjs(), 'day')} gün kaldı
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'İzinler',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 150,
      render: (permissions: string[]) => (
        <Space direction="vertical" size={0}>
          {permissions.map(permission => (
            <Tag
              key={permission}
              color={
                permission === 'read' ? 'blue' :
                permission === 'write' ? 'orange' :
                permission === 'delete' ? 'red' : 'default'
              }
              size="small"
            >
              {permission.toUpperCase()}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Rate Limit',
      key: 'rateLimit',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.rateLimit} istek</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            / {record.rateLimitWindow / 3600} saat
          </Text>
        </Space>
      ),
    },
    {
      title: 'Kullanım',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      render: (count: number, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{count.toLocaleString()}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Son: {record.lastUsedAt ? dayjs(record.lastUsedAt).fromNow() : 'Hiç'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setSelectedApiKey(record);
                setIsDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Devre Dışı Bırak' : 'Aktifleştir'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bu API anahtarını silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleCreate = () => {
    setSelectedApiKey(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    form.setFieldsValue({
      ...apiKey,
      expiresAt: apiKey.expiresAt ? dayjs(apiKey.expiresAt) : undefined,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (apiKey: ApiKey) => {
    await Swal.fire({
      icon: 'success',
      title: 'API Anahtarı Silindi',
      text: `${apiKey.name} başarıyla silindi.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleToggleStatus = async (apiKey: ApiKey) => {
    const newStatus = apiKey.status === 'active' ? 'inactive' : 'active';
    await Swal.fire({
      icon: 'success',
      title: 'Durum Güncellendi',
      text: `${apiKey.name} ${newStatus === 'active' ? 'aktifleştirildi' : 'devre dışı bırakıldı'}.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1500));

      await Swal.fire({
        icon: 'success',
        title: selectedApiKey ? 'API Anahtarı Güncellendi' : 'API Anahtarı Oluşturuldu',
        text: selectedApiKey ? 
          'API anahtarı başarıyla güncellendi.' : 
          'Yeni API anahtarı oluşturuldu ve kopyalandı.',
        timer: 2000,
        showConfirmButton: false,
      });

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Lütfen gerekli alanları doldurun');
    } finally {
      setLoading(false);
    }
  };

  const ApiKeyModal = () => (
    <Modal
      title={selectedApiKey ? 'API Anahtarını Düzenle' : 'Yeni API Anahtarı Oluştur'}
      open={isModalVisible}
      onOk={handleModalOk}
      onCancel={() => setIsModalVisible(false)}
      confirmLoading={loading}
      width={700}
      okText={selectedApiKey ? 'Güncelle' : 'Oluştur'}
      cancelText="İptal"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="API Anahtarı Adı"
              rules={[{ required: true, message: 'Ad zorunludur' }]}
            >
              <Input placeholder="Production API" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="environment"
              label="Ortam"
              rules={[{ required: true, message: 'Ortam seçimi zorunludur' }]}
            >
              <Select>
                <Option value="production">Production</Option>
                <Option value="staging">Staging</Option>
                <Option value="development">Development</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Açıklama"
        >
          <TextArea rows={3} placeholder="API anahtarının kullanım amacı..." />
        </Form.Item>

        <Form.Item
          name="permissions"
          label="İzinler"
          rules={[{ required: true, message: 'En az bir izin seçmelisiniz' }]}
        >
          <Checkbox.Group>
            <Row>
              <Col span={8}><Checkbox value="read">Okuma</Checkbox></Col>
              <Col span={8}><Checkbox value="write">Yazma</Checkbox></Col>
              <Col span={8}><Checkbox value="delete">Silme</Checkbox></Col>
              <Col span={8}><Checkbox value="admin">Yönetici</Checkbox></Col>
              <Col span={8}><Checkbox value="billing">Faturalama</Checkbox></Col>
              <Col span={8}><Checkbox value="analytics">Analitik</Checkbox></Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="rateLimit"
              label="Rate Limit (istek/saat)"
              rules={[{ required: true, message: 'Rate limit zorunludur' }]}
              initialValue={1000}
            >
              <Select>
                <Option value={100}>100 istek/saat</Option>
                <Option value={500}>500 istek/saat</Option>
                <Option value={1000}>1,000 istek/saat</Option>
                <Option value={5000}>5,000 istek/saat</Option>
                <Option value={10000}>10,000 istek/saat</Option>
                <Option value={0}>Limitsiz</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expiresAt"
              label="Son Kullanma Tarihi (Opsiyonel)"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="ipWhitelist"
          label="IP Whitelist (Her satıra bir IP/CIDR)"
        >
          <TextArea 
            rows={3} 
            placeholder="192.168.1.0/24&#10;10.0.0.0/8&#10;203.0.113.0/24"
          />
        </Form.Item>

        <Alert
          message="Güvenlik Uyarısı"
          description="API anahtarı oluşturulduktan sonra sadece bir kez gösterilecektir. Lütfen güvenli bir yerde saklayın."
          type="warning"
          showIcon
        />
      </Form>
    </Modal>
  );

  const ApiKeyDrawer = () => (
    <Drawer
      title={`API Anahtarı: ${selectedApiKey?.name}`}
      width={800}
      open={isDrawerVisible}
      onClose={() => setIsDrawerVisible(false)}
      extra={
        <Space>
          <Button icon={<EditOutlined />}>Düzenle</Button>
          <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
        </Space>
      }
    >
      {selectedApiKey && (
        <Tabs defaultActiveKey="details">
          <TabPane tab="Detaylar" key="details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="API Anahtarı ID">
                {selectedApiKey.id}
              </Descriptions.Item>
              <Descriptions.Item label="Ad">
                {selectedApiKey.name}
              </Descriptions.Item>
              <Descriptions.Item label="Anahtar">
                <Space>
                  <Text code style={{ fontFamily: 'monospace' }}>
                    {selectedApiKey.key}
                  </Text>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedApiKey.key);
                      message.success('Kopyalandı');
                    }}
                  />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge
                  status={statusColors[selectedApiKey.status]}
                  text={
                    selectedApiKey.status === 'active' ? 'Aktif' :
                    selectedApiKey.status === 'inactive' ? 'İnaktif' : 'Süresi Dolmuş'
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label="Ortam">
                <Tag color={environmentColors[selectedApiKey.environment]}>
                  {selectedApiKey.environment.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="İzinler">
                <Space>
                  {selectedApiKey.permissions.map(permission => (
                    <Tag key={permission} color="blue">
                      {permission.toUpperCase()}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Rate Limit">
                {selectedApiKey.rateLimit} istek / {selectedApiKey.rateLimitWindow / 3600} saat
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Kullanım">
                {selectedApiKey.usageCount.toLocaleString()} istek
              </Descriptions.Item>
              <Descriptions.Item label="Son Kullanım">
                {selectedApiKey.lastUsedAt ? dayjs(selectedApiKey.lastUsedAt).format('DD.MM.YYYY HH:mm') : 'Hiç kullanılmamış'}
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(selectedApiKey.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
              {selectedApiKey.expiresAt && (
                <Descriptions.Item label="Son Kullanma Tarihi">
                  {dayjs(selectedApiKey.expiresAt).format('DD.MM.YYYY HH:mm')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Açıklama">
                {selectedApiKey.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedApiKey.ipWhitelist.length > 0 && (
              <>
                <Divider />
                <Title level={5}>IP Whitelist</Title>
                <List
                  size="small"
                  dataSource={selectedApiKey.ipWhitelist}
                  renderItem={(ip) => (
                    <List.Item>
                      <Text code>{ip}</Text>
                    </List.Item>
                  )}
                />
              </>
            )}
          </TabPane>

          <TabPane tab="Kullanım İstatistikleri" key="usage">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Bu Ay"
                    value={45231}
                    prefix={<ApiOutlined />}
                    suffix="istek"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Başarı Oranı"
                    value={98.5}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Ortalama Yanıt"
                    value={125}
                    suffix="ms"
                    prefix={<ThunderboltOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Son Kullanım Aktiviteleri" style={{ marginTop: 16 }}>
              <Timeline
                items={mockUsage.map(usage => ({
                  children: (
                    <div>
                      <Space>
                        <Text strong>{usage.method} {usage.endpoint}</Text>
                        <Tag color="blue">{usage.requests} istek</Tag>
                        {usage.errors > 0 && (
                          <Tag color="red">{usage.errors} hata</Tag>
                        )}
                      </Space>
                      <br />
                      <Text type="secondary">
                        {dayjs(usage.date).format('DD.MM.YYYY')} • Yanıt süresi: {usage.responseTime}ms
                      </Text>
                    </div>
                  ),
                }))}
              />
            </Card>
          </TabPane>
        </Tabs>
      )}
    </Drawer>
  );

  return (
    <PageContainer
      header={{
        title: 'API Anahtarları',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'API Anahtarları' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
      }}
    >
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Anahtar"
              value={mockApiKeys.length}
              prefix={<KeyOutlined style={{ color: '#667eea' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Anahtar"
              value={mockApiKeys.filter(k => k.status === 'active').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bu Ay Toplam İstek"
              value={259849}
              prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  +23%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ortalama Yanıt Süresi"
              value={125}
              suffix="ms"
              prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="API Anahtarları" key="keys">
          <Card>
            <Alert
              message="API Güvenliği"
              description="API anahtarlarınızı güvenli tutun. Şüpheli aktivite durumunda hemen devre dışı bırakın."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <ProTable<ApiKey>
              columns={columns}
              dataSource={mockApiKeys}
              rowKey="id"
              search={false}
              pagination={{
                pageSize: 10,
              }}
              toolBarRender={() => [
                <Button
                  key="refresh"
                  icon={<ReloadOutlined />}
                >
                  Yenile
                </Button>,
                <Button
                  key="import"
                  icon={<ImportOutlined />}
                >
                  İçe Aktar
                </Button>,
                <Button
                  key="export"
                  icon={<ExportOutlined />}
                >
                  Dışa Aktar
                </Button>,
                <Button
                  key="create"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Yeni API Anahtarı
                </Button>,
              ]}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Kullanım İstatistikleri" key="stats">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Günlük API Kullanımı">
                <Table
                  dataSource={mockUsage}
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: 'Tarih',
                      dataIndex: 'date',
                      key: 'date',
                      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
                    },
                    {
                      title: 'Endpoint',
                      key: 'endpoint',
                      render: (_, record) => (
                        <Space>
                          <Tag color="blue">{record.method}</Tag>
                          <Text code>{record.endpoint}</Text>
                        </Space>
                      ),
                    },
                    {
                      title: 'İstek Sayısı',
                      dataIndex: 'requests',
                      key: 'requests',
                      render: (count: number) => (
                        <Text strong>{count.toLocaleString()}</Text>
                      ),
                    },
                    {
                      title: 'Hata Sayısı',
                      dataIndex: 'errors',
                      key: 'errors',
                      render: (errors: number) => (
                        <Text type={errors > 0 ? 'danger' : 'secondary'}>
                          {errors}
                        </Text>
                      ),
                    },
                    {
                      title: 'Ortalama Yanıt',
                      dataIndex: 'responseTime',
                      key: 'responseTime',
                      render: (time: number) => `${time}ms`,
                    },
                    {
                      title: 'Başarı Oranı',
                      key: 'successRate',
                      render: (_, record) => {
                        const rate = ((record.requests - record.errors) / record.requests) * 100;
                        return (
                          <Progress
                            percent={rate}
                            size="small"
                            format={(percent) => `${percent?.toFixed(1)}%`}
                            strokeColor={rate > 95 ? '#52c41a' : rate > 90 ? '#faad14' : '#ff4d4f'}
                          />
                        );
                      },
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Ayarlar" key="settings">
          <Card title="API Güvenlik Ayarları">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Varsayılan Rate Limit">
                    <Select defaultValue={1000}>
                      <Option value={100}>100 istek/saat</Option>
                      <Option value={500}>500 istek/saat</Option>
                      <Option value={1000}>1,000 istek/saat</Option>
                      <Option value={5000}>5,000 istek/saat</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Anahtar Geçerlilik Süresi">
                    <Select defaultValue={365}>
                      <Option value={30}>30 gün</Option>
                      <Option value={90}>90 gün</Option>
                      <Option value={365}>1 yıl</Option>
                      <Option value={0}>Süresiz</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>API loglarını kaydet</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>Rate limit aşımında bildirim gönder</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    <Space>
                      <Switch />
                      <Text>IP whitelist zorunlu kıl</Text>
                    </Space>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>Şüpheli aktivite tespitini aktifleştir</Text>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />}>
                  Ayarları Kaydet
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>

      <ApiKeyModal />
      <ApiKeyDrawer />
    </PageContainer>
  );
};

export default TenantApiKeys;