import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Avatar,
  Typography,
  Divider,
  Drawer,
  Tabs,
  Timeline,
  List,
  Alert,
  Upload,
  Checkbox,
  Radio,
  InputNumber,
  Progress,
  Descriptions,
  Result,
  Empty,
  Spin,
} from 'antd';
import { PageContainer, ProTable, ProFormText, ProFormSelect, ProFormDateRangePicker } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import tenantService, { Tenant, TenantStats } from '../../services/tenantService';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  LinkOutlined,
  ApiOutlined,
  SafetyOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
  CopyOutlined,
  SyncOutlined,
  PoweroffOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const TenantsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValidationStatus, setCodeValidationStatus] = useState<'success' | 'error' | 'warning' | undefined>();
  const [codeValidationHelp, setCodeValidationHelp] = useState<string>('');
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const codeValidationTimeout = useRef<NodeJS.Timeout>();

  // Fetch tenant statistics
  useEffect(() => {
    fetchTenantStats();
  }, []);

  const fetchTenantStats = async () => {
    setStatsLoading(true);
    try {
      // For now, we'll use mock stats since the endpoint might not exist yet
      setTenantStats({
        totalTenants: 1247,
        activeTenants: 1189,
        suspendedTenants: 58,
        totalRevenue: 458750,
        monthlyGrowth: 12.5,
      });
    } catch (error) {
      console.error('Error fetching tenant stats:', error);
      // Use default stats if API fails
      setTenantStats({
        totalTenants: 0,
        activeTenants: 0,
        suspendedTenants: 0,
        totalRevenue: 0,
        monthlyGrowth: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Mock data for fallback
  const mockTenants: Tenant[] = [
    {
      id: '1',
      name: 'ABC Corporation',
      subdomain: 'abc-corp',
      customDomain: 'app.abc-corp.com',
      status: 'active',
      package: 'enterprise',
      users: 425,
      maxUsers: 500,
      storage: 85.4,
      maxStorage: 100,
      createdAt: '2024-01-15',
      expiresAt: '2025-01-15',
      lastActive: '5 dakika önce',
      owner: {
        name: 'John Doe',
        email: 'john@abc-corp.com',
        phone: '+90 555 123 4567',
      },
      billing: {
        plan: 'Enterprise',
        amount: 9999,
        cycle: 'yearly',
        nextBilling: '2025-01-15',
      },
      database: {
        name: 'abc_corp_db',
        status: 'active',
        size: 4.8,
      },
      features: ['advanced-analytics', 'api-access', 'custom-branding', 'priority-support'],
    },
    {
      id: '2',
      name: 'Tech Startup Ltd.',
      subdomain: 'tech-startup',
      status: 'active',
      package: 'professional',
      users: 85,
      maxUsers: 100,
      storage: 32.1,
      maxStorage: 50,
      createdAt: '2024-03-20',
      expiresAt: '2025-03-20',
      lastActive: '1 saat önce',
      owner: {
        name: 'Jane Smith',
        email: 'jane@techstartup.com',
        phone: '+90 555 987 6543',
      },
      billing: {
        plan: 'Professional',
        amount: 299,
        cycle: 'monthly',
        nextBilling: '2024-12-20',
      },
      database: {
        name: 'tech_startup_db',
        status: 'active',
        size: 1.2,
      },
      features: ['analytics', 'api-access', 'email-support'],
    },
    {
      id: '3',
      name: 'Small Business Co.',
      subdomain: 'small-biz',
      status: 'suspended',
      package: 'starter',
      users: 12,
      maxUsers: 25,
      storage: 5.2,
      maxStorage: 10,
      createdAt: '2024-06-10',
      expiresAt: '2024-12-10',
      lastActive: '3 gün önce',
      owner: {
        name: 'Bob Johnson',
        email: 'bob@smallbiz.com',
        phone: '+90 555 456 7890',
      },
      billing: {
        plan: 'Starter',
        amount: 99,
        cycle: 'monthly',
        nextBilling: '2024-12-10',
      },
      database: {
        name: 'small_biz_db',
        status: 'active',
        size: 0.3,
      },
      features: ['basic-features', 'email-support'],
    },
  ];

  const packageColors = {
    starter: 'green',
    professional: 'blue',
    enterprise: 'purple',
    custom: 'gold',
  };

  const statusColors = {
    active: 'success',
    inactive: 'default',
    suspended: 'error',
    pending: 'warning',
  };

  const columns: ProColumns<Tenant>[] = [
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#667eea' }}>
            {record.name?.[0] || 'T'}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.code || record.subdomain || 'N/A'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Aktif', value: true },
        { text: 'İnaktif', value: false },
      ],
      render: (isActive: boolean, record) => {
        const status = record.status || (isActive ? 'active' : 'inactive');
        return (
          <Badge
            status={statusColors[status as keyof typeof statusColors]}
            text={
              status === 'active' || isActive ? 'Aktif' :
              status === 'inactive' || !isActive ? 'İnaktif' :
              status === 'suspended' ? 'Askıda' : 'Beklemede'
            }
          />
        );
      },
    },
    {
      title: 'Paket',
      dataIndex: 'packageName',
      key: 'package',
      width: 130,
      filters: [
        { text: 'Starter', value: 'starter' },
        { text: 'Professional', value: 'professional' },
        { text: 'Enterprise', value: 'enterprise' },
        { text: 'Custom', value: 'custom' },
      ],
      render: (packageName: string, record) => {
        const pkg = record.package || 'starter';
        return (
          <Tag color={packageColors[pkg as keyof typeof packageColors]}>
            {packageName || pkg.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Kullanıcılar',
      key: 'users',
      width: 150,
      render: (_, record) => {
        const users = record.userCount || record.users || 0;
        const maxUsers = record.maxUsers || 100;
        return (
          <Space direction="vertical" size={0}>
            <Text>{users} / {maxUsers}</Text>
            <Progress
              percent={Math.round((users / maxUsers) * 100)}
              size="small"
              strokeColor={users / maxUsers > 0.8 ? '#ff4d4f' : '#667eea'}
              showInfo={false}
            />
          </Space>
        );
      },
    },
    {
      title: 'Depolama',
      key: 'storage',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.storage} / {record.maxStorage} GB</Text>
          <Progress
            percent={Math.round((record.storage / record.maxStorage) * 100)}
            size="small"
            strokeColor={record.storage / record.maxStorage > 0.8 ? '#ff4d4f' : '#52c41a'}
            showInfo={false}
          />
        </Space>
      ),
    },
    {
      title: 'İletişim',
      key: 'owner',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.owner?.name || record.contactEmail?.split('@')[0] || 'Admin'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.contactEmail || record.owner?.email || '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Faturalama',
      key: 'billing',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>₺{record.billing.amount}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.billing.cycle === 'monthly' ? 'Aylık' : 'Yıllık'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Son Aktivite',
      dataIndex: 'lastActive',
      key: 'lastActive',
      width: 120,
      render: (text: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text type="secondary">{text}</Text>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space className="tenant-actions" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTenant(record);
                setIsDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(record);
              }}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'login',
                  icon: <LoginOutlined />,
                  label: 'Tenant\'a Giriş',
                },
                {
                  key: 'migrate',
                  icon: <CloudServerOutlined />,
                  label: 'Migration Başlat',
                },
                {
                  key: 'backup',
                  icon: <DatabaseOutlined />,
                  label: 'Yedek Al',
                },
                { type: 'divider' },
                {
                  key: 'suspend',
                  icon: <PauseCircleOutlined />,
                  label: 'Askıya Al',
                  disabled: record.status === 'suspended',
                },
                {
                  key: 'activate',
                  icon: <PlayCircleOutlined />,
                  label: 'Aktifleştir',
                  disabled: record.status === 'active',
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Sil',
                  danger: true,
                },
              ],
              onClick: ({ key }) => handleMenuClick(key, record),
            }}
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />} 
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: Tenant) => {
    setSelectedTenant(record);
    setEditMode(true);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      expiresAt: dayjs(record.expiresAt),
    });
  };

  const handleMenuClick = (key: string, record: Tenant) => {
    switch (key) {
      case 'login':
        message.info(`${record.name} tenant'ına giriş yapılıyor...`);
        break;
      case 'migrate':
        Modal.confirm({
          title: 'Migration Başlat',
          content: `${record.name} için migration başlatmak istediğinize emin misiniz?`,
          onOk: () => message.success('Migration başlatıldı'),
        });
        break;
      case 'backup':
        message.loading('Yedek alınıyor...');
        setTimeout(() => message.success('Yedek başarıyla alındı'), 2000);
        break;
      case 'suspend':
        Modal.confirm({
          title: 'Tenant Askıya Al',
          content: `${record.name} askıya alınacak. Onaylıyor musunuz?`,
          onOk: () => message.warning('Tenant askıya alındı'),
        });
        break;
      case 'activate':
        message.success('Tenant aktifleştirildi');
        break;
      case 'delete':
        Modal.confirm({
          title: 'Tenant Sil',
          content: (
            <div>
              <Alert
                message="Dikkat!"
                description="Bu işlem geri alınamaz. Tüm veriler silinecektir."
                type="error"
                showIcon
              />
              <p style={{ marginTop: 16 }}>
                <strong>{record.name}</strong> tenant'ını silmek istediğinize emin misiniz?
              </p>
            </div>
          ),
          okText: 'Sil',
          okType: 'danger',
          onOk: () => message.success('Tenant silindi'),
        });
        break;
    }
  };

  // Validate tenant code in real-time
  const validateTenantCode = async (value: string) => {
    if (!value) return;
    
    // Clear previous timeout
    if (codeValidationTimeout.current) {
      clearTimeout(codeValidationTimeout.current);
    }
    
    // Set loading state
    setValidatingCode(true);
    setCodeValidationStatus(undefined);
    setCodeValidationHelp('Kontrol ediliyor...');
    
    // Debounce the validation
    codeValidationTimeout.current = setTimeout(async () => {
      try {
        const result = await tenantService.validateTenantCode(value);
        
        if (result.isAvailable) {
          setCodeValidationStatus('success');
          setCodeValidationHelp('Bu kod kullanılabilir!');
        } else {
          setCodeValidationStatus('error');
          setCodeValidationHelp(result.message || 'Bu kod zaten kullanımda!');
        }
      } catch (error) {
        setCodeValidationStatus('warning');
        setCodeValidationHelp('Kod kontrolü yapılamadı');
      } finally {
        setValidatingCode(false);
      }
    }, 500); // 500ms debounce
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Check if code is valid before submitting
      if (codeValidationStatus === 'error') {
        message.error('Lütfen geçerli bir kod girin');
        setLoading(false);
        return;
      }
      
      // API çağrısı simülasyonu
      setTimeout(() => {
        if (editMode) {
          message.success('Tenant güncellendi');
        } else {
          message.success('Yeni tenant oluşturuldu');
        }
        setIsModalVisible(false);
        form.resetFields();
        setLoading(false);
        setCodeValidationStatus(undefined);
        setCodeValidationHelp('');
        actionRef.current?.reload();
      }, 1500);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderTenantForm = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        status: 'pending',
        package: 'starter',
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tenant Adı"
            rules={[{ required: true, message: 'Tenant adı zorunludur' }]}
          >
            <Input placeholder="ABC Corporation" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="code"
            label="Şirket Kodu"
            validateStatus={validatingCode ? 'validating' : codeValidationStatus}
            help={validatingCode || codeValidationStatus ? codeValidationHelp : ''}
            hasFeedback
            rules={[
              { required: true, message: 'Şirket kodu zorunludur' },
              { 
                pattern: /^[a-z0-9-]+$/, 
                message: 'Sadece küçük harf, rakam ve tire kullanılabilir' 
              },
              {
                min: 3,
                message: 'En az 3 karakter olmalıdır'
              },
              {
                max: 50,
                message: 'En fazla 50 karakter olabilir'
              }
            ]}
          >
            <Input 
              addonAfter=".stoocker.app" 
              placeholder="abc-corp"
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                form.setFieldsValue({ code: value });
                validateTenantCode(value);
              }}
              suffix={
                validatingCode ? (
                  <Spin size="small" />
                ) : codeValidationStatus === 'success' ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : codeValidationStatus === 'error' ? (
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                ) : null
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="customDomain" label="Özel Domain (Opsiyonel)">
            <Input placeholder="app.example.com" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="package"
            label="Paket"
            rules={[{ required: true, message: 'Paket seçimi zorunludur' }]}
          >
            <Select>
              <Option value="starter">Starter</Option>
              <Option value="professional">Professional</Option>
              <Option value="enterprise">Enterprise</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="maxUsers"
            label="Maksimum Kullanıcı"
            rules={[{ required: true, message: 'Maksimum kullanıcı sayısı zorunludur' }]}
          >
            <InputNumber min={1} max={10000} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="maxStorage"
            label="Maksimum Depolama (GB)"
            rules={[{ required: true, message: 'Maksimum depolama zorunludur' }]}
          >
            <InputNumber min={1} max={1000} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Divider>Sahip Bilgileri</Divider>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={['owner', 'name']}
            label="Sahip Adı"
            rules={[{ required: true, message: 'Sahip adı zorunludur' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['owner', 'email']}
            label="E-posta"
            rules={[
              { required: true, message: 'E-posta zorunludur' },
              { type: 'email', message: 'Geçerli bir e-posta giriniz' },
            ]}
          >
            <Input placeholder="john@example.com" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['owner', 'phone']}
            label="Telefon"
            rules={[{ required: true, message: 'Telefon zorunludur' }]}
          >
            <Input placeholder="+90 555 123 4567" />
          </Form.Item>
        </Col>
      </Row>

      <Divider>Faturalama</Divider>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={['billing', 'amount']}
            label="Tutar"
            rules={[{ required: true, message: 'Tutar zorunludur' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={['billing', 'cycle']}
            label="Faturalama Periyodu"
            rules={[{ required: true, message: 'Periyod seçimi zorunludur' }]}
          >
            <Select>
              <Option value="monthly">Aylık</Option>
              <Option value="yearly">Yıllık</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="expiresAt"
            label="Bitiş Tarihi"
            rules={[{ required: true, message: 'Bitiş tarihi zorunludur' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="features" label="Özellikler">
        <Checkbox.Group>
          <Row>
            <Col span={12}>
              <Checkbox value="advanced-analytics">Gelişmiş Analitik</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="api-access">API Erişimi</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="custom-branding">Özel Marka</Checkbox>
            </Col>
            <Col span={12}>
              <Checkbox value="priority-support">Öncelikli Destek</Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </Form.Item>

      <Form.Item
        name="status"
        label="Durum"
        rules={[{ required: true, message: 'Durum seçimi zorunludur' }]}
      >
        <Radio.Group>
          <Radio value="active">Aktif</Radio>
          <Radio value="inactive">İnaktif</Radio>
          <Radio value="suspended">Askıda</Radio>
          <Radio value="pending">Beklemede</Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  );

  const renderTenantDetails = () => {
    if (!selectedTenant) return null;

    return (
      <Drawer
        title={
          <Space>
            <Avatar style={{ backgroundColor: '#667eea' }}>
              {selectedTenant.name[0]}
            </Avatar>
            <div>
              <Text strong>{selectedTenant.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedTenant.subdomain}.stocker.app
              </Text>
            </div>
          </Space>
        }
        placement="right"
        width={800}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(selectedTenant)}>
              Düzenle
            </Button>
            <Button icon={<DownloadOutlined />}>Export</Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Genel Bakış" key="overview">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tenant ID">{selectedTenant.id}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge
                  status={statusColors[selectedTenant.status as keyof typeof statusColors]}
                  text={selectedTenant.status}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Paket">
                <Tag color={packageColors[selectedTenant.package as keyof typeof packageColors]}>
                  {selectedTenant.package.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">{selectedTenant.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Bitiş Tarihi">{selectedTenant.expiresAt}</Descriptions.Item>
              <Descriptions.Item label="Son Aktivite">{selectedTenant.lastActive}</Descriptions.Item>
              <Descriptions.Item label="Özel Domain" span={2}>
                {selectedTenant.customDomain || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Kullanıcılar"
                    value={selectedTenant.users}
                    suffix={`/ ${selectedTenant.maxUsers}`}
                    prefix={<UserOutlined />}
                  />
                  <Progress
                    percent={Math.round((selectedTenant.users / selectedTenant.maxUsers) * 100)}
                    strokeColor="#667eea"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Depolama"
                    value={selectedTenant.storage}
                    suffix={`/ ${selectedTenant.maxStorage} GB`}
                    prefix={<CloudServerOutlined />}
                  />
                  <Progress
                    percent={Math.round((selectedTenant.storage / selectedTenant.maxStorage) * 100)}
                    strokeColor="#52c41a"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Sahip Bilgileri" key="owner">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Ad Soyad">{selectedTenant.owner.name}</Descriptions.Item>
              <Descriptions.Item label="E-posta">
                <Space>
                  <MailOutlined />
                  {selectedTenant.owner.email}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Telefon">
                <Space>
                  <PhoneOutlined />
                  {selectedTenant.owner.phone}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Faturalama" key="billing">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Plan">{selectedTenant.billing.plan}</Descriptions.Item>
              <Descriptions.Item label="Tutar">
                ₺{selectedTenant.billing.amount.toLocaleString('tr-TR')}
              </Descriptions.Item>
              <Descriptions.Item label="Periyod">
                {selectedTenant.billing.cycle === 'monthly' ? 'Aylık' : 'Yıllık'}
              </Descriptions.Item>
              <Descriptions.Item label="Sonraki Fatura">
                {selectedTenant.billing.nextBilling}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Timeline
              items={[
                {
                  color: 'green',
                  children: '2024-11-15 - Ödeme alındı (₺299)',
                },
                {
                  color: 'green',
                  children: '2024-10-15 - Ödeme alındı (₺299)',
                },
                {
                  color: 'red',
                  children: '2024-09-15 - Ödeme başarısız',
                },
                {
                  color: 'green',
                  children: '2024-09-16 - Ödeme alındı (₺299)',
                },
              ]}
            />
          </TabPane>

          <TabPane tab="Veritabanı" key="database">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Veritabanı Adı">{selectedTenant.database.name}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge
                  status={selectedTenant.database.status === 'active' ? 'success' : 'error'}
                  text={selectedTenant.database.status}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Boyut">{selectedTenant.database.size} GB</Descriptions.Item>
              <Descriptions.Item label="Son Yedek">2024-12-07 03:00</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<DatabaseOutlined />} block>
                Veritabanı Yönetimi
              </Button>
              <Button icon={<CloudServerOutlined />} block>
                Migration Başlat
              </Button>
              <Button icon={<DownloadOutlined />} block>
                Yedek İndir
              </Button>
            </Space>
          </TabPane>

          <TabPane tab="Özellikler" key="features">
            <List
              dataSource={selectedTenant.features}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    {item === 'advanced-analytics' && 'Gelişmiş Analitik'}
                    {item === 'api-access' && 'API Erişimi'}
                    {item === 'custom-branding' && 'Özel Marka'}
                    {item === 'priority-support' && 'Öncelikli Destek'}
                  </Space>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Aktivite Geçmişi" key="activity">
            <Timeline
              items={[
                {
                  dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />,
                  color: 'green',
                  children: (
                    <>
                      <p>Tenant aktifleştirildi</p>
                      <Text type="secondary">2024-12-07 14:30</Text>
                    </>
                  ),
                },
                {
                  dot: <UserOutlined style={{ fontSize: '16px' }} />,
                  color: 'blue',
                  children: (
                    <>
                      <p>5 yeni kullanıcı eklendi</p>
                      <Text type="secondary">2024-12-06 10:15</Text>
                    </>
                  ),
                },
                {
                  dot: <DollarOutlined style={{ fontSize: '16px' }} />,
                  color: 'green',
                  children: (
                    <>
                      <p>Ödeme alındı</p>
                      <Text type="secondary">2024-12-01 00:00</Text>
                    </>
                  ),
                },
                {
                  dot: <SettingOutlined style={{ fontSize: '16px' }} />,
                  children: (
                    <>
                      <p>Ayarlar güncellendi</p>
                      <Text type="secondary">2024-11-28 16:45</Text>
                    </>
                  ),
                },
              ]}
            />
          </TabPane>
        </Tabs>
      </Drawer>
    );
  };

  return (
    <PageContainer
      header={{
        title: 'Tenants',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa' },
            { title: 'Tenants' },
          ],
        },
      }}
    >
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Toplam Tenant"
              value={tenantStats?.totalTenants || 0}
              prefix={<TeamOutlined style={{ color: '#667eea' }} />}
              suffix={
                tenantStats?.monthlyGrowth ? (
                  <Text type="success" style={{ fontSize: 14 }}>
                    +{tenantStats.monthlyGrowth}%
                  </Text>
                ) : null
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Aktif Tenant"
              value={tenantStats?.activeTenants || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Askıda"
              value={tenantStats?.suspendedTenants || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Toplam Gelir"
              value={tenantStats?.totalRevenue || 0}
              prefix="₺"
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  +8.2%
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ProTable */}
      <ProTable<Tenant>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        request={async (params, sort, filter) => {
          try {
            const response = await tenantService.getTenants({
              page: params.current,
              pageSize: params.pageSize,
              search: params.name || params.keyword,
              status: filter.status?.[0],
              package: filter.package?.[0],
              sortBy: sort ? Object.keys(sort)[0] : undefined,
              sortOrder: sort ? (Object.values(sort)[0] === 'descend' ? 'desc' : 'asc') : undefined,
            });

            return {
              data: response.data,
              success: true,
              total: response.total,
              page: response.page,
            };
          } catch (error) {
            message.error('Tenant listesi yüklenirken hata oluştu');
            console.error('Error loading tenants:', error);
            
            // Return mock data if API fails
            return {
              data: mockTenants,
              success: true,
              total: mockTenants.length,
              page: 1,
            };
          }
        }}
        search={{
          labelWidth: 120,
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        onRow={(record) => {
          return {
            onClick: (e) => {
              // Prevent navigation when clicking on action buttons or dropdowns
              const target = e.target as HTMLElement;
              const isActionButton = target.closest('.ant-dropdown-trigger') || 
                                   target.closest('.ant-btn') || 
                                   target.closest('.ant-space') ||
                                   target.closest('[class*="actions"]');
              
              if (!isActionButton) {
                navigate(`/tenants/${record.id}`);
              }
            },
            style: { cursor: 'pointer' },
          };
        }}
        dateFormatter="string"
        headerTitle="Tenant Listesi"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<ExportOutlined />}
          >
            Export
          </Button>,
          <Button
            key="import"
            icon={<ImportOutlined />}
          >
            Import
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditMode(false);
              setIsModalVisible(true);
              form.resetFields();
            }}
          >
            Yeni Tenant
          </Button>,
        ]}
        scroll={{ x: 1500 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editMode ? 'Tenant Düzenle' : 'Yeni Tenant Oluştur'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setCodeValidationStatus(undefined);
          setCodeValidationHelp('');
          setValidatingCode(false);
          if (codeValidationTimeout.current) {
            clearTimeout(codeValidationTimeout.current);
          }
        }}
        width={900}
        confirmLoading={loading}
        okText={editMode ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        {renderTenantForm()}
      </Modal>

      {/* Details Drawer */}
      {renderTenantDetails()}
    </PageContainer>
  );
};

export default TenantsPage;