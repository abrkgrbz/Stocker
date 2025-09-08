import React, { useState, useRef } from 'react';
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
  Transfer,
  Tree,
  Descriptions,
  Empty,
  Steps,
  notification,
  Segmented,
} from 'antd';
import { PageContainer, ProTable, ProCard } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
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
  SafetyOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  KeyOutlined,
  AuditOutlined,
  CrownOutlined,
  IdcardOutlined,
  GlobalOutlined,
  LoginOutlined,
  LogoutOutlined,
  HistoryOutlined,
  BellOutlined,
  SecurityScanOutlined,
  UserSwitchOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  SolutionOutlined,
  ContactsOutlined,
  WarningOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  tenant: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: string;
  lastLogin: string;
  loginCount: number;
  avatar?: string;
  permissions: string[];
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  sessions: number;
  ipAddress: string;
  location: string;
  deviceInfo: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  isSystem: boolean;
}

const UsersPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('users');
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+90 555 123 4567',
      tenant: 'ABC Corporation',
      role: 'Admin',
      department: 'IT',
      status: 'active',
      createdAt: '2024-01-15',
      lastLogin: '5 dakika önce',
      loginCount: 324,
      permissions: ['users.view', 'users.edit', 'users.delete', 'settings.manage'],
      twoFactorEnabled: true,
      emailVerified: true,
      phoneVerified: true,
      sessions: 2,
      ipAddress: '192.168.1.100',
      location: 'İstanbul, Türkiye',
      deviceInfo: 'Chrome 120, Windows 11',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+90 555 987 6543',
      tenant: 'Tech Startup Ltd.',
      role: 'User',
      department: 'Sales',
      status: 'active',
      createdAt: '2024-03-20',
      lastLogin: '1 saat önce',
      loginCount: 145,
      permissions: ['dashboard.view', 'reports.view'],
      twoFactorEnabled: false,
      emailVerified: true,
      phoneVerified: false,
      sessions: 1,
      ipAddress: '192.168.1.101',
      location: 'Ankara, Türkiye',
      deviceInfo: 'Safari 17, MacOS',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+90 555 456 7890',
      tenant: 'Small Business Co.',
      role: 'Manager',
      department: 'Operations',
      status: 'suspended',
      createdAt: '2024-06-10',
      lastLogin: '3 gün önce',
      loginCount: 89,
      permissions: ['users.view', 'reports.view', 'reports.export'],
      twoFactorEnabled: false,
      emailVerified: false,
      phoneVerified: false,
      sessions: 0,
      ipAddress: '192.168.1.102',
      location: 'İzmir, Türkiye',
      deviceInfo: 'Firefox 121, Ubuntu',
    },
  ];

  const mockRoles: Role[] = [
    {
      id: '1',
      name: 'Super Admin',
      description: 'Tüm sistem yetkilerine sahip',
      permissions: ['*'],
      userCount: 3,
      createdAt: '2024-01-01',
      isSystem: true,
    },
    {
      id: '2',
      name: 'Admin',
      description: 'Tenant yönetim yetkilerine sahip',
      permissions: ['users.*', 'settings.*', 'reports.*'],
      userCount: 15,
      createdAt: '2024-01-01',
      isSystem: true,
    },
    {
      id: '3',
      name: 'Manager',
      description: 'Ekip yönetimi ve raporlama yetkilerine sahip',
      permissions: ['users.view', 'users.edit', 'reports.*'],
      userCount: 42,
      createdAt: '2024-01-15',
      isSystem: false,
    },
    {
      id: '4',
      name: 'User',
      description: 'Temel kullanıcı yetkileri',
      permissions: ['dashboard.view', 'profile.edit'],
      userCount: 1150,
      createdAt: '2024-01-01',
      isSystem: true,
    },
  ];

  const allPermissions = [
    { key: 'users.view', title: 'Kullanıcıları Görüntüle', group: 'Kullanıcılar' },
    { key: 'users.create', title: 'Kullanıcı Oluştur', group: 'Kullanıcılar' },
    { key: 'users.edit', title: 'Kullanıcı Düzenle', group: 'Kullanıcılar' },
    { key: 'users.delete', title: 'Kullanıcı Sil', group: 'Kullanıcılar' },
    { key: 'roles.view', title: 'Rolleri Görüntüle', group: 'Roller' },
    { key: 'roles.create', title: 'Rol Oluştur', group: 'Roller' },
    { key: 'roles.edit', title: 'Rol Düzenle', group: 'Roller' },
    { key: 'roles.delete', title: 'Rol Sil', group: 'Roller' },
    { key: 'tenants.view', title: 'Tenantları Görüntüle', group: 'Tenants' },
    { key: 'tenants.create', title: 'Tenant Oluştur', group: 'Tenants' },
    { key: 'tenants.edit', title: 'Tenant Düzenle', group: 'Tenants' },
    { key: 'tenants.delete', title: 'Tenant Sil', group: 'Tenants' },
    { key: 'reports.view', title: 'Raporları Görüntüle', group: 'Raporlar' },
    { key: 'reports.export', title: 'Rapor Dışa Aktar', group: 'Raporlar' },
    { key: 'settings.view', title: 'Ayarları Görüntüle', group: 'Ayarlar' },
    { key: 'settings.manage', title: 'Ayarları Yönet', group: 'Ayarlar' },
  ];

  const statusColors = {
    active: 'success',
    inactive: 'default',
    suspended: 'error',
    pending: 'warning',
  };

  const userColumns: ProColumns<User>[] = [
    {
      title: 'Kullanıcı',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar 
            size={40}
            style={{ backgroundColor: record.status === 'active' ? '#52c41a' : '#999' }}
          >
            {record.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <div>
            <Space>
              <Text strong>{record.name}</Text>
              {record.twoFactorEnabled && (
                <Tooltip title="2FA Aktif">
                  <SafetyOutlined style={{ color: '#52c41a' }} />
                </Tooltip>
              )}
            </Space>
            <br />
            <Space size={4}>
              <MailOutlined style={{ fontSize: 12, color: '#999' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.email}
              </Text>
              {record.emailVerified && (
                <CheckCircleOutlined style={{ fontSize: 12, color: '#52c41a' }} />
              )}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tenant',
      dataIndex: 'tenant',
      key: 'tenant',
      width: 150,
      filters: mockUsers.map(u => ({ text: u.tenant, value: u.tenant }))
        .filter((v, i, a) => a.findIndex(t => t.value === v.value) === i),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => {
        const colors: Record<string, string> = {
          'Super Admin': 'red',
          'Admin': 'orange',
          'Manager': 'blue',
          'User': 'green',
        };
        return (
          <Tag icon={<CrownOutlined />} color={colors[role] || 'default'}>
            {role}
          </Tag>
        );
      },
      filters: [
        { text: 'Super Admin', value: 'Super Admin' },
        { text: 'Admin', value: 'Admin' },
        { text: 'Manager', value: 'Manager' },
        { text: 'User', value: 'User' },
      ],
    },
    {
      title: 'Departman',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Badge
          status={statusColors[status as keyof typeof statusColors]}
          text={
            status === 'active' ? 'Aktif' :
            status === 'inactive' ? 'İnaktif' :
            status === 'suspended' ? 'Askıda' : 'Beklemede'
          }
        />
      ),
      filters: [
        { text: 'Aktif', value: 'active' },
        { text: 'İnaktif', value: 'inactive' },
        { text: 'Askıda', value: 'suspended' },
        { text: 'Beklemede', value: 'pending' },
      ],
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 120,
      render: (text: string) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Oturumlar',
      dataIndex: 'sessions',
      key: 'sessions',
      width: 100,
      align: 'center',
      render: (sessions: number) => (
        <Badge
          count={sessions}
          style={{ backgroundColor: sessions > 0 ? '#52c41a' : '#999' }}
        />
      ),
    },
    {
      title: 'Güvenlik',
      key: 'security',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const score = 
          (record.twoFactorEnabled ? 40 : 0) +
          (record.emailVerified ? 30 : 0) +
          (record.phoneVerified ? 30 : 0);
        
        return (
          <Tooltip title={`Güvenlik Skoru: ${score}%`}>
            <Progress
              type="circle"
              percent={score}
              width={40}
              strokeColor={
                score >= 80 ? '#52c41a' :
                score >= 50 ? '#faad14' : '#ff4d4f'
              }
              format={() => score}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button
              type="text"
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setIsDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'impersonate',
                  icon: <UserSwitchOutlined />,
                  label: 'Kullanıcı Olarak Giriş',
                },
                {
                  key: 'reset-password',
                  icon: <KeyOutlined />,
                  label: 'Şifre Sıfırla',
                },
                {
                  key: 'send-email',
                  icon: <MailOutlined />,
                  label: 'E-posta Gönder',
                },
                { type: 'divider' },
                {
                  key: 'suspend',
                  icon: <LockOutlined />,
                  label: 'Askıya Al',
                  disabled: record.status === 'suspended',
                },
                {
                  key: 'activate',
                  icon: <UnlockOutlined />,
                  label: 'Aktifleştir',
                  disabled: record.status === 'active',
                },
                {
                  key: 'logout-all',
                  icon: <LogoutOutlined />,
                  label: 'Tüm Oturumları Kapat',
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
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const roleColumns: ProColumns<Role>[] = [
    {
      title: 'Rol Adı',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <SafetyOutlined style={{ color: record.isSystem ? '#ff4d4f' : '#667eea' }} />
          <div>
            <Text strong>{record.name}</Text>
            {record.isSystem && (
              <Tag color="red" style={{ marginLeft: 8 }}>Sistem</Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Kullanıcı Sayısı',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 150,
      render: (count: number) => (
        <Space>
          <TeamOutlined />
          <Text>{count} kullanıcı</Text>
        </Space>
      ),
    },
    {
      title: 'İzin Sayısı',
      key: 'permissionCount',
      width: 150,
      render: (_, record) => (
        <Space>
          <KeyOutlined />
          <Text>
            {record.permissions[0] === '*' ? 'Tüm İzinler' : `${record.permissions.length} izin`}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              disabled={record.isSystem}
              onClick={() => handleEditRole(record)}
            />
          </Tooltip>
          <Tooltip title="İzinleri Yönet">
            <Button
              type="text"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => handleManagePermissions(record)}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={record.isSystem}
              onClick={() => handleDeleteRole(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: User) => {
    setSelectedUser(record);
    setEditMode(true);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
    });
  };

  const handleEditRole = (record: Role) => {
    roleForm.setFieldsValue(record);
    setIsRoleModalVisible(true);
  };

  const handleManagePermissions = (record: Role) => {
    setTargetKeys(record.permissions);
    setIsPermissionModalVisible(true);
  };

  const handleDeleteRole = (record: Role) => {
    Modal.confirm({
      title: 'Rol Sil',
      content: `${record.name} rolünü silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      onOk: () => message.success('Rol silindi'),
    });
  };

  const handleMenuClick = (key: string, record: User) => {
    switch (key) {
      case 'impersonate':
        message.info(`${record.name} olarak giriş yapılıyor...`);
        break;
      case 'reset-password':
        Modal.confirm({
          title: 'Şifre Sıfırla',
          content: `${record.name} için şifre sıfırlama e-postası gönderilecek.`,
          onOk: () => {
            notification.success({
              message: 'Şifre Sıfırlama',
              description: 'Şifre sıfırlama e-postası gönderildi.',
            });
          },
        });
        break;
      case 'send-email':
        message.info('E-posta gönderme özelliği yakında...');
        break;
      case 'suspend':
        Modal.confirm({
          title: 'Kullanıcı Askıya Al',
          content: `${record.name} askıya alınacak. Onaylıyor musunuz?`,
          onOk: () => message.warning('Kullanıcı askıya alındı'),
        });
        break;
      case 'activate':
        message.success('Kullanıcı aktifleştirildi');
        break;
      case 'logout-all':
        Modal.confirm({
          title: 'Tüm Oturumları Kapat',
          content: `${record.name} için tüm aktif oturumlar kapatılacak.`,
          onOk: () => message.success('Tüm oturumlar kapatıldı'),
        });
        break;
      case 'delete':
        Modal.confirm({
          title: 'Kullanıcı Sil',
          content: (
            <div>
              <Alert
                message="Dikkat!"
                description="Bu işlem geri alınamaz. Kullanıcı kalıcı olarak silinecektir."
                type="error"
                showIcon
              />
              <p style={{ marginTop: 16 }}>
                <strong>{record.name}</strong> kullanıcısını silmek istediğinize emin misiniz?
              </p>
            </div>
          ),
          okText: 'Sil',
          okType: 'danger',
          onOk: () => message.success('Kullanıcı silindi'),
        });
        break;
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      setTimeout(() => {
        if (editMode) {
          message.success('Kullanıcı güncellendi');
        } else {
          message.success('Yeni kullanıcı oluşturuldu');
        }
        setIsModalVisible(false);
        form.resetFields();
        setLoading(false);
        actionRef.current?.reload();
      }, 1500);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderUserForm = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        status: 'pending',
        role: 'User',
        twoFactorEnabled: false,
        emailVerified: false,
        phoneVerified: false,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Ad Soyad"
            rules={[{ required: true, message: 'Ad soyad zorunludur' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="John Doe" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            label="E-posta"
            rules={[
              { required: true, message: 'E-posta zorunludur' },
              { type: 'email', message: 'Geçerli bir e-posta giriniz' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="john@example.com" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Telefon"
            rules={[{ required: true, message: 'Telefon zorunludur' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+90 555 123 4567" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="tenant"
            label="Tenant"
            rules={[{ required: true, message: 'Tenant seçimi zorunludur' }]}
          >
            <Select placeholder="Tenant seçin">
              <Option value="ABC Corporation">ABC Corporation</Option>
              <Option value="Tech Startup Ltd.">Tech Startup Ltd.</Option>
              <Option value="Small Business Co.">Small Business Co.</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Rol seçimi zorunludur' }]}
          >
            <Select>
              <Option value="Super Admin">Super Admin</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Manager">Manager</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="department"
            label="Departman"
            rules={[{ required: true, message: 'Departman zorunludur' }]}
          >
            <Input placeholder="IT, Sales, Operations..." />
          </Form.Item>
        </Col>
      </Row>

      <Divider>Güvenlik Ayarları</Divider>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="twoFactorEnabled"
            label="2FA"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="emailVerified"
            label="E-posta Doğrulama"
            valuePropName="checked"
          >
            <Switch checkedChildren="Doğrulandı" unCheckedChildren="Doğrulanmadı" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="phoneVerified"
            label="Telefon Doğrulama"
            valuePropName="checked"
          >
            <Switch checkedChildren="Doğrulandı" unCheckedChildren="Doğrulanmadı" />
          </Form.Item>
        </Col>
      </Row>

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

      {!editMode && (
        <Alert
          message="Kullanıcıya giriş bilgileri e-posta ile gönderilecektir."
          type="info"
          showIcon
          icon={<MailOutlined />}
        />
      )}
    </Form>
  );

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    return (
      <Drawer
        title={
          <Space>
            <Avatar size={48} style={{ backgroundColor: '#667eea' }}>
              {selectedUser.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <div>
              <Text strong>{selectedUser.name}</Text>
              <br />
              <Space>
                <Badge
                  status={statusColors[selectedUser.status as keyof typeof statusColors]}
                  text={selectedUser.status}
                />
                <Tag>{selectedUser.role}</Tag>
              </Space>
            </div>
          </Space>
        }
        placement="right"
        width={800}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(selectedUser)}>
              Düzenle
            </Button>
            <Button icon={<KeyOutlined />}>Şifre Sıfırla</Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Genel Bakış" key="overview">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Kullanıcı ID">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="Tenant">{selectedUser.tenant}</Descriptions.Item>
              <Descriptions.Item label="E-posta">
                <Space>
                  {selectedUser.email}
                  {selectedUser.emailVerified && (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Telefon">
                <Space>
                  {selectedUser.phone}
                  {selectedUser.phoneVerified && (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Departman">{selectedUser.department}</Descriptions.Item>
              <Descriptions.Item label="Rol">
                <Tag color="blue">{selectedUser.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">{selectedUser.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Son Giriş">{selectedUser.lastLogin}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Giriş Sayısı"
                    value={selectedUser.loginCount}
                    prefix={<LoginOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Aktif Oturum"
                    value={selectedUser.sessions}
                    prefix={<GlobalOutlined />}
                    valueStyle={{ color: selectedUser.sessions > 0 ? '#52c41a' : '#999' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Güvenlik Skoru"
                    value={
                      (selectedUser.twoFactorEnabled ? 40 : 0) +
                      (selectedUser.emailVerified ? 30 : 0) +
                      (selectedUser.phoneVerified ? 30 : 0)
                    }
                    suffix="/ 100"
                    prefix={<SafetyOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Güvenlik" key="security">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card title="İki Faktörlü Doğrulama" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>2FA Durumu</Text>
                    <Switch
                      checked={selectedUser.twoFactorEnabled}
                      checkedChildren="Aktif"
                      unCheckedChildren="Pasif"
                    />
                  </div>
                  {selectedUser.twoFactorEnabled && (
                    <Alert
                      message="2FA aktif"
                      description="Kullanıcı girişlerinde SMS ile doğrulama yapılmaktadır."
                      type="success"
                      showIcon
                    />
                  )}
                </Space>
              </Card>

              <Card title="Doğrulama Durumları" size="small">
                <List>
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        selectedUser.emailVerified ? 
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> :
                          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                      }
                      title="E-posta Doğrulama"
                      description={
                        selectedUser.emailVerified ? 
                          'E-posta adresi doğrulanmış' : 
                          'E-posta adresi doğrulanmamış'
                      }
                    />
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        selectedUser.phoneVerified ? 
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> :
                          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                      }
                      title="Telefon Doğrulama"
                      description={
                        selectedUser.phoneVerified ? 
                          'Telefon numarası doğrulanmış' : 
                          'Telefon numarası doğrulanmamış'
                      }
                    />
                  </List.Item>
                </List>
              </Card>

              <Card title="Oturum Bilgileri" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Son IP Adresi">
                    {selectedUser.ipAddress}
                  </Descriptions.Item>
                  <Descriptions.Item label="Konum">
                    {selectedUser.location}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cihaz">
                    {selectedUser.deviceInfo}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Space>
          </TabPane>

          <TabPane tab="İzinler" key="permissions">
            <List
              dataSource={selectedUser.permissions}
              renderItem={(permission) => (
                <List.Item>
                  <Space>
                    <KeyOutlined style={{ color: '#667eea' }} />
                    <Text>{permission}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Aktivite Geçmişi" key="activity">
            <Timeline
              items={[
                {
                  dot: <LoginOutlined style={{ fontSize: '16px' }} />,
                  color: 'green',
                  children: (
                    <>
                      <p>Sisteme giriş yaptı</p>
                      <Text type="secondary">2024-12-07 14:30 - 192.168.1.100</Text>
                    </>
                  ),
                },
                {
                  dot: <EditOutlined style={{ fontSize: '16px' }} />,
                  color: 'blue',
                  children: (
                    <>
                      <p>Profil bilgileri güncellendi</p>
                      <Text type="secondary">2024-12-06 10:15</Text>
                    </>
                  ),
                },
                {
                  dot: <KeyOutlined style={{ fontSize: '16px' }} />,
                  children: (
                    <>
                      <p>Şifre değiştirildi</p>
                      <Text type="secondary">2024-12-01 09:00</Text>
                    </>
                  ),
                },
                {
                  dot: <SafetyOutlined style={{ fontSize: '16px' }} />,
                  color: 'green',
                  children: (
                    <>
                      <p>2FA aktifleştirildi</p>
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
        title: 'Kullanıcı Yönetimi',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa' },
            { title: 'Kullanıcılar' },
          ],
        },
      }}
      tabList={[
        { key: 'users', tab: 'Kullanıcılar' },
        { key: 'roles', tab: 'Roller' },
        { key: 'permissions', tab: 'İzinler' },
      ]}
      tabActiveKey={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'users' && (
        <>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Toplam Kullanıcı"
                  value={15632}
                  prefix={<UserOutlined style={{ color: '#667eea' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Aktif Kullanıcı"
                  value={14280}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Askıda"
                  value={342}
                  prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="2FA Aktif"
                  value="68%"
                  prefix={<SafetyOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
          </Row>

          {/* Users Table */}
          <ProTable<User>
            columns={userColumns}
            dataSource={mockUsers}
            actionRef={actionRef}
            rowKey="id"
            search={{
              labelWidth: 120,
            }}
            pagination={{
              pageSize: 10,
            }}
            dateFormatter="string"
            headerTitle="Kullanıcı Listesi"
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            toolBarRender={() => [
              selectedRowKeys.length > 0 && (
                <Dropdown
                  key="batch"
                  menu={{
                    items: [
                      {
                        key: 'batch-activate',
                        icon: <UnlockOutlined />,
                        label: 'Toplu Aktifleştir',
                      },
                      {
                        key: 'batch-suspend',
                        icon: <LockOutlined />,
                        label: 'Toplu Askıya Al',
                      },
                      {
                        key: 'batch-delete',
                        icon: <DeleteOutlined />,
                        label: 'Toplu Sil',
                        danger: true,
                      },
                    ],
                  }}
                >
                  <Button icon={<MoreOutlined />}>
                    Toplu İşlem ({selectedRowKeys.length})
                  </Button>
                </Dropdown>
              ),
              <Button key="export" icon={<ExportOutlined />}>
                Export
              </Button>,
              <Button key="import" icon={<ImportOutlined />}>
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
                Yeni Kullanıcı
              </Button>,
            ]}
            scroll={{ x: 1500 }}
          />
        </>
      )}

      {activeTab === 'roles' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Toplam Rol"
                  value={12}
                  prefix={<SafetyOutlined style={{ color: '#667eea' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Sistem Rolleri"
                  value={4}
                  prefix={<FileProtectOutlined style={{ color: '#ff4d4f' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Özel Roller"
                  value={8}
                  prefix={<SolutionOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Ortalama İzin"
                  value={18}
                  prefix={<KeyOutlined style={{ color: '#faad14' }} />}
                />
              </Card>
            </Col>
          </Row>

          <ProTable<Role>
            columns={roleColumns}
            dataSource={mockRoles}
            rowKey="id"
            search={false}
            pagination={false}
            headerTitle="Rol Listesi"
            toolBarRender={() => [
              <Button
                key="create"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  roleForm.resetFields();
                  setIsRoleModalVisible(true);
                }}
              >
                Yeni Rol
              </Button>,
            ]}
          />
        </>
      )}

      {activeTab === 'permissions' && (
        <Row gutter={[16, 16]}>
          {Object.entries(
            allPermissions.reduce((acc, perm) => {
              if (!acc[perm.group]) acc[perm.group] = [];
              acc[perm.group].push(perm);
              return acc;
            }, {} as Record<string, typeof allPermissions>)
          ).map(([group, permissions]) => (
            <Col span={12} key={group}>
              <Card title={group}>
                <List
                  dataSource={permissions}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        <KeyOutlined style={{ color: '#667eea' }} />
                        <Text strong>{item.key}</Text>
                        <Text type="secondary">- {item.title}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create/Edit User Modal */}
      <Modal
        title={editMode ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
        confirmLoading={loading}
        okText={editMode ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        {renderUserForm()}
      </Modal>

      {/* Role Modal */}
      <Modal
        title="Rol Oluştur/Düzenle"
        open={isRoleModalVisible}
        onOk={() => {
          message.success('Rol kaydedildi');
          setIsRoleModalVisible(false);
        }}
        onCancel={() => setIsRoleModalVisible(false)}
        width={600}
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item
            name="name"
            label="Rol Adı"
            rules={[{ required: true, message: 'Rol adı zorunludur' }]}
          >
            <Input placeholder="Manager, Editor, Viewer..." />
          </Form.Item>
          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama zorunludur' }]}
          >
            <TextArea rows={3} placeholder="Bu rolün yetkilerini açıklayın..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Permission Management Modal */}
      <Modal
        title="İzin Yönetimi"
        open={isPermissionModalVisible}
        onOk={() => {
          message.success('İzinler güncellendi');
          setIsPermissionModalVisible(false);
        }}
        onCancel={() => setIsPermissionModalVisible(false)}
        width={800}
      >
        <Transfer
          dataSource={allPermissions}
          titles={['Mevcut İzinler', 'Seçili İzinler']}
          targetKeys={targetKeys}
          onChange={setTargetKeys}
          render={(item) => `${item.title} (${item.key})`}
          listStyle={{
            width: 350,
            height: 400,
          }}
        />
      </Modal>

      {/* User Details Drawer */}
      {renderUserDetails()}
    </PageContainer>
  );
};

export default UsersPage;