import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Badge, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Divider, 
  Alert, 
  Tooltip, 
  Dropdown, 
  Menu, 
  List, 
  Avatar, 
  Tabs, 
  Descriptions, 
  Tree, 
  Checkbox, 
  Transfer,
  message, 
  notification 
} from 'antd';
import {
  SafetyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  SettingOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  ShareAltOutlined,
  SecurityScanOutlined,
  AuditOutlined,
  DatabaseOutlined,
  ApiOutlined,
  FileTextOutlined,
  GlobalOutlined,
  MoreOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  FlagOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  level: 'read' | 'write' | 'delete' | 'admin';
}

interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  level: 'basic' | 'advanced' | 'admin' | 'super_admin';
  permissions: string[];
  userCount: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  color: string;
  icon: string;
}

interface RoleAssignment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
  isActive: boolean;
}

const UserRolesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [permissionForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  const [permissions] = useState<Permission[]>([
    // User Management
    { id: '1', name: 'users.read', description: 'Kullanıcıları görüntüleme', category: 'Kullanıcı Yönetimi', resource: 'users', action: 'read', level: 'read' },
    { id: '2', name: 'users.create', description: 'Kullanıcı oluşturma', category: 'Kullanıcı Yönetimi', resource: 'users', action: 'create', level: 'write' },
    { id: '3', name: 'users.update', description: 'Kullanıcı güncelleme', category: 'Kullanıcı Yönetimi', resource: 'users', action: 'update', level: 'write' },
    { id: '4', name: 'users.delete', description: 'Kullanıcı silme', category: 'Kullanıcı Yönetimi', resource: 'users', action: 'delete', level: 'delete' },
    
    // Tenant Management
    { id: '5', name: 'tenants.read', description: 'Tenantları görüntüleme', category: 'Tenant Yönetimi', resource: 'tenants', action: 'read', level: 'read' },
    { id: '6', name: 'tenants.create', description: 'Tenant oluşturma', category: 'Tenant Yönetimi', resource: 'tenants', action: 'create', level: 'write' },
    { id: '7', name: 'tenants.update', description: 'Tenant güncelleme', category: 'Tenant Yönetimi', resource: 'tenants', action: 'update', level: 'write' },
    { id: '8', name: 'tenants.delete', description: 'Tenant silme', category: 'Tenant Yönetimi', resource: 'tenants', action: 'delete', level: 'delete' },
    
    // Reports & Analytics
    { id: '9', name: 'reports.read', description: 'Raporları görüntüleme', category: 'Raporlar', resource: 'reports', action: 'read', level: 'read' },
    { id: '10', name: 'reports.create', description: 'Rapor oluşturma', category: 'Raporlar', resource: 'reports', action: 'create', level: 'write' },
    { id: '11', name: 'analytics.read', description: 'Analitikleri görüntüleme', category: 'Raporlar', resource: 'analytics', action: 'read', level: 'read' },
    
    // System Settings
    { id: '12', name: 'settings.read', description: 'Ayarları görüntüleme', category: 'Sistem', resource: 'settings', action: 'read', level: 'read' },
    { id: '13', name: 'settings.update', description: 'Ayarları güncelleme', category: 'Sistem', resource: 'settings', action: 'update', level: 'admin' },
    { id: '14', name: 'audit.read', description: 'Audit loglarını görüntüleme', category: 'Sistem', resource: 'audit', action: 'read', level: 'admin' },
    
    // Billing & Finance
    { id: '15', name: 'invoices.read', description: 'Faturaları görüntüleme', category: 'Finans', resource: 'invoices', action: 'read', level: 'read' },
    { id: '16', name: 'invoices.create', description: 'Fatura oluşturma', category: 'Finans', resource: 'invoices', action: 'create', level: 'write' },
    { id: '17', name: 'subscriptions.read', description: 'Abonelikleri görüntüleme', category: 'Finans', resource: 'subscriptions', action: 'read', level: 'read' },
    { id: '18', name: 'subscriptions.update', description: 'Abonelik güncelleme', category: 'Finans', resource: 'subscriptions', action: 'update', level: 'write' }
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: 'Tüm sistem yetkilerine sahip süper yönetici',
      type: 'system',
      level: 'super_admin',
      permissions: permissions.map(p => p.id),
      userCount: 2,
      isActive: true,
      isDefault: false,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-15',
      createdBy: 'System',
      color: 'red',
      icon: 'crown'
    },
    {
      id: '2',
      name: 'Admin',
      description: 'Sistem yöneticisi, çoğu işlemi yapabilir',
      type: 'system',
      level: 'admin',
      permissions: ['1', '2', '3', '5', '6', '7', '9', '10', '11', '12', '15', '16', '17'],
      userCount: 8,
      isActive: true,
      isDefault: false,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-10',
      createdBy: 'System',
      color: 'orange',
      icon: 'safety'
    },
    {
      id: '3',
      name: 'Manager',
      description: 'Bölüm yöneticisi, sınırlı yönetim yetkileri',
      type: 'custom',
      level: 'advanced',
      permissions: ['1', '2', '3', '5', '6', '7', '9', '11', '15', '17'],
      userCount: 15,
      isActive: true,
      isDefault: false,
      createdAt: '2023-02-15',
      updatedAt: '2024-01-08',
      createdBy: 'Admin',
      color: 'blue',
      icon: 'team'
    },
    {
      id: '4',
      name: 'Operator',
      description: 'Operasyon kullanıcısı, temel işlemler',
      type: 'custom',
      level: 'advanced',
      permissions: ['1', '5', '9', '11', '15', '17'],
      userCount: 25,
      isActive: true,
      isDefault: false,
      createdAt: '2023-03-01',
      updatedAt: '2023-12-20',
      createdBy: 'Manager',
      color: 'green',
      icon: 'user'
    },
    {
      id: '5',
      name: 'Viewer',
      description: 'Sadece görüntüleme yetkisi olan kullanıcı',
      type: 'system',
      level: 'basic',
      permissions: ['1', '5', '9', '11', '15', '17'],
      userCount: 45,
      isActive: true,
      isDefault: true,
      createdAt: '2023-01-01',
      updatedAt: '2023-11-15',
      createdBy: 'System',
      color: 'default',
      icon: 'eye'
    },
    {
      id: '6',
      name: 'Finance Admin',
      description: 'Finans modülü yöneticisi',
      type: 'custom',
      level: 'advanced',
      permissions: ['1', '5', '9', '11', '15', '16', '17', '18'],
      userCount: 5,
      isActive: true,
      isDefault: false,
      createdAt: '2023-04-10',
      updatedAt: '2024-01-05',
      createdBy: 'Super Admin',
      color: 'gold',
      icon: 'dollar'
    }
  ]);

  const [roleAssignments] = useState<RoleAssignment[]>([
    {
      id: '1',
      userId: 'user_1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      roleId: '1',
      roleName: 'Super Admin',
      assignedAt: '2023-01-01',
      assignedBy: 'System',
      isActive: true
    },
    {
      id: '2',
      userId: 'user_2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      roleId: '2',
      roleName: 'Admin',
      assignedAt: '2023-02-15',
      assignedBy: 'Super Admin',
      isActive: true
    },
    {
      id: '3',
      userId: 'user_3',
      userName: 'Bob Johnson',
      userEmail: 'bob@example.com',
      roleId: '3',
      roleName: 'Manager',
      assignedAt: '2023-03-20',
      assignedBy: 'Admin',
      expiresAt: '2024-03-20',
      isActive: true
    }
  ]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'super_admin': return 'red';
      case 'admin': return 'orange';
      case 'advanced': return 'blue';
      case 'basic': return 'green';
      default: return 'default';
    }
  };

  const getPermissionLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'red';
      case 'delete': return 'orange';
      case 'write': return 'blue';
      case 'read': return 'green';
      default: return 'default';
    }
  };

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case 'admin': return <CrownOutlined />;
      case 'delete': return <DeleteOutlined />;
      case 'write': return <EditOutlined />;
      case 'read': return <EyeOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const handleCreateRole = () => {
    form.validateFields().then(values => {
      const newRole: Role = {
        id: Date.now().toString(),
        ...values,
        type: 'custom',
        userCount: 0,
        isActive: true,
        isDefault: false,
        createdAt: dayjs().format('YYYY-MM-DD'),
        updatedAt: dayjs().format('YYYY-MM-DD'),
        createdBy: 'Current User',
        permissions: values.permissions || []
      };
      setRoles([...roles, newRole]);
      message.success('Yeni rol oluşturuldu');
      setModalVisible(false);
      form.resetFields();
    });
  };

  const handleToggleRole = (roleId: string, active: boolean) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId 
        ? { ...role, isActive: active }
        : role
    ));
    message.success(`Rol ${active ? 'aktif' : 'pasif'} edildi`);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.type === 'system') {
      message.error('Sistem rolleri silinemez');
      return;
    }
    if (role?.userCount && role.userCount > 0) {
      message.error('Bu role atanmış kullanıcılar var, önce kullanıcıları başka rollere atayın');
      return;
    }
    setRoles(prev => prev.filter(role => role.id !== roleId));
    message.success('Rol silindi');
  };

  const roleColumns = [
    {
      title: 'Rol Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <Space>
          {record.icon === 'crown' && <CrownOutlined style={{ color: record.color }} />}
          {record.icon === 'safety' && <SafetyOutlined style={{ color: record.color }} />}
          {record.icon === 'team' && <TeamOutlined style={{ color: record.color }} />}
          {record.icon === 'user' && <UserOutlined style={{ color: record.color }} />}
          {record.icon === 'eye' && <EyeOutlined style={{ color: record.color }} />}
          {record.icon === 'dollar' && <DollarOutlined style={{ color: record.color }} />}
          <div>
            <Text strong>{text}</Text>
            {record.isDefault && <Tag color="blue" style={{ marginLeft: 8 }}>Varsayılan</Tag>}
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'system' ? 'red' : 'blue'}>
          {type === 'system' ? 'Sistem' : 'Özel'}
        </Tag>
      )
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={getLevelColor(level)}>
          {level === 'super_admin' ? 'Süper Admin' :
           level === 'admin' ? 'Admin' :
           level === 'advanced' ? 'Gelişmiş' : 'Temel'}
        </Tag>
      )
    },
    {
      title: 'Kullanıcılar',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => (
        <Space>
          <UserOutlined />
          <Text>{count}</Text>
        </Space>
      )
    },
    {
      title: 'İzinler',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Text>{permissions.length} izin</Text>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Role) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleRole(record.id, checked)}
          disabled={record.type === 'system'}
        />
      )
    },
    {
      title: 'Güncelleme',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY')
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRole(record);
              setDetailModalVisible(true);
            }}
          >
            Detay
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item 
                  key="edit" 
                  icon={<EditOutlined />}
                  disabled={record.type === 'system'}
                >
                  Düzenle
                </Menu.Item>
                <Menu.Item 
                  key="copy" 
                  icon={<CopyOutlined />}
                >
                  Kopyala
                </Menu.Item>
                <Menu.Item 
                  key="permissions" 
                  icon={<KeyOutlined />}
                  onClick={() => {
                    setSelectedRole(record);
                    setPermissionModalVisible(true);
                  }}
                >
                  İzinleri Düzenle
                </Menu.Item>
                <Menu.Item 
                  key="assign" 
                  icon={<TeamOutlined />}
                  onClick={() => {
                    setSelectedRole(record);
                    setAssignModalVisible(true);
                  }}
                >
                  Kullanıcı Ata
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  key="delete" 
                  icon={<DeleteOutlined />}
                  danger
                  disabled={record.type === 'system' || record.userCount > 0}
                  onClick={() => handleDeleteRole(record.id)}
                >
                  Sil
                </Menu.Item>
              </Menu>
            }
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  const permissionColumns = [
    {
      title: 'İzin',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Permission) => (
        <Space>
          {getPermissionIcon(record.level)}
          <div>
            <Text code>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>
    },
    {
      title: 'Kaynak',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: string) => <Text code>{resource}</Text>
    },
    {
      title: 'Aksiyon',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => <Tag color="blue">{action}</Tag>
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={getPermissionLevelColor(level)}>
          {level === 'admin' ? 'Admin' :
           level === 'delete' ? 'Silme' :
           level === 'write' ? 'Yazma' : 'Okuma'}
        </Tag>
      )
    }
  ];

  const assignmentColumns = [
    {
      title: 'Kullanıcı',
      key: 'user',
      render: (_: any, record: RoleAssignment) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{record.userName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.userEmail}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Rol',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (roleName: string) => <Tag color="blue">{roleName}</Tag>
    },
    {
      title: 'Atanma Tarihi',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY')
    },
    {
      title: 'Atayan',
      dataIndex: 'assignedBy',
      key: 'assignedBy'
    },
    {
      title: 'Bitiş Tarihi',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date?: string) => date ? dayjs(date).format('DD.MM.YYYY') : 'Süresiz'
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'default'}
          text={isActive ? 'Aktif' : 'Pasif'}
        />
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Düzenle</Button>
          <Button size="small" icon={<DeleteOutlined />} danger>Kaldır</Button>
        </Space>
      )
    }
  ];

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <SafetyOutlined /> Rol Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<FilterOutlined />}>Filtrele</Button>
              <Button icon={<ReloadOutlined />}>Yenile</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Yeni Rol
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Roller" key="roles">
            <Alert
              message="Rol Yönetimi"
              description="Sistem rollerini yönetin ve kullanıcılara izin atayın. Sistem rolleri değiştirilemez."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Space style={{ marginBottom: 16 }}>
              <Select placeholder="Rol Tipi" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="system">Sistem</Option>
                <Option value="custom">Özel</Option>
              </Select>
              <Select placeholder="Seviye" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="super_admin">Süper Admin</Option>
                <Option value="admin">Admin</Option>
                <Option value="advanced">Gelişmiş</Option>
                <Option value="basic">Temel</Option>
              </Select>
              <Input.Search 
                placeholder="Rol ara..." 
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
            </Space>

            <Table
              columns={roleColumns}
              dataSource={roles}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showTotal: (total) => `Toplam ${total} rol`
              }}
            />
          </TabPane>

          <TabPane tab="İzinler" key="permissions">
            <Alert
              message="İzin Sistemi"
              description="Sistem izinlerini görüntüleyin ve rollere atayın. İzinler kaynak bazlı olarak organize edilmiştir."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Space style={{ marginBottom: 16 }}>
              <Select placeholder="Kategori" style={{ width: 150 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                {Object.keys(permissionsByCategory).map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
              <Select placeholder="Seviye" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="admin">Admin</Option>
                <Option value="delete">Silme</Option>
                <Option value="write">Yazma</Option>
                <Option value="read">Okuma</Option>
              </Select>
              <Input.Search 
                placeholder="İzin ara..." 
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
            </Space>

            <Table
              columns={permissionColumns}
              dataSource={permissions}
              rowKey="id"
              pagination={{ 
                pageSize: 15,
                showTotal: (total) => `Toplam ${total} izin`
              }}
            />
          </TabPane>

          <TabPane tab="Rol Atamaları" key="assignments">
            <Alert
              message="Rol Atamaları"
              description="Kullanıcılara atanmış rolleri görüntüleyin ve yönetin."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={assignmentColumns}
              dataSource={roleAssignments}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showTotal: (total) => `Toplam ${total} atama`
              }}
            />
          </TabPane>

          <TabPane tab="İzin Matrisi" key="matrix">
            <Alert
              message="İzin Matrisi"
              description="Rollerin sahip olduğu izinleri matris görünümünde inceleyin."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #d9d9d9', padding: 8, background: '#fafafa' }}>
                      İzin
                    </th>
                    {roles.map(role => (
                      <th key={role.id} style={{ 
                        border: '1px solid #d9d9d9', 
                        padding: 8, 
                        background: '#fafafa',
                        minWidth: 100 
                      }}>
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(permission => (
                    <tr key={permission.id}>
                      <td style={{ border: '1px solid #d9d9d9', padding: 8 }}>
                        <Space>
                          {getPermissionIcon(permission.level)}
                          <div>
                            <Text strong>{permission.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {permission.description}
                            </Text>
                          </div>
                        </Space>
                      </td>
                      {roles.map(role => (
                        <td key={role.id} style={{ 
                          border: '1px solid #d9d9d9', 
                          padding: 8,
                          textAlign: 'center' 
                        }}>
                          {role.permissions.includes(permission.id) ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                          ) : (
                            <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Role Modal */}
      <Modal
        title={editMode ? 'Rol Düzenle' : 'Yeni Rol Oluştur'}
        visible={modalVisible}
        onOk={handleCreateRole}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Rol Adı"
                rules={[{ required: true, message: 'Rol adı gereklidir' }]}
              >
                <Input placeholder="Örn: Content Manager" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="level"
                label="Rol Seviyesi"
                rules={[{ required: true, message: 'Rol seviyesi seçiniz' }]}
              >
                <Select placeholder="Seviye seçiniz">
                  <Option value="basic">Temel</Option>
                  <Option value="advanced">Gelişmiş</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama gereklidir' }]}
          >
            <TextArea rows={3} placeholder="Rolün açıklaması" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="color"
                label="Renk"
                rules={[{ required: true, message: 'Renk seçiniz' }]}
              >
                <Select placeholder="Renk seçiniz">
                  <Option value="blue">Mavi</Option>
                  <Option value="green">Yeşil</Option>
                  <Option value="orange">Turuncu</Option>
                  <Option value="purple">Mor</Option>
                  <Option value="gold">Altın</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="icon"
                label="İkon"
                rules={[{ required: true, message: 'İkon seçiniz' }]}
              >
                <Select placeholder="İkon seçiniz">
                  <Option value="user">Kullanıcı</Option>
                  <Option value="team">Takım</Option>
                  <Option value="safety">Güvenlik</Option>
                  <Option value="setting">Ayar</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="permissions"
            label="İzinler"
          >
            <Checkbox.Group style={{ width: '100%' }}>
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category} style={{ marginBottom: 16 }}>
                  <Title level={5}>{category}</Title>
                  <Row>
                    {perms.map(permission => (
                      <Col span={12} key={permission.id}>
                        <Checkbox value={permission.id}>
                          <Space>
                            {getPermissionIcon(permission.level)}
                            <Text>{permission.name}</Text>
                          </Space>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Role Detail Modal */}
      <Modal
        title="Rol Detayları"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedRole && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Rol Adı" span={2}>
                <Space>
                  {selectedRole.icon === 'crown' && <CrownOutlined style={{ color: selectedRole.color }} />}
                  {selectedRole.icon === 'safety' && <SafetyOutlined style={{ color: selectedRole.color }} />}
                  {selectedRole.icon === 'team' && <TeamOutlined style={{ color: selectedRole.color }} />}
                  {selectedRole.icon === 'user' && <UserOutlined style={{ color: selectedRole.color }} />}
                  {selectedRole.icon === 'eye' && <EyeOutlined style={{ color: selectedRole.color }} />}
                  {selectedRole.icon === 'dollar' && <DollarOutlined style={{ color: selectedRole.color }} />}
                  <Text strong>{selectedRole.name}</Text>
                  {selectedRole.isDefault && <Tag color="blue">Varsayılan</Tag>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Tip">
                <Tag color={selectedRole.type === 'system' ? 'red' : 'blue'}>
                  {selectedRole.type === 'system' ? 'Sistem' : 'Özel'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Seviye">
                <Tag color={getLevelColor(selectedRole.level)}>
                  {selectedRole.level === 'super_admin' ? 'Süper Admin' :
                   selectedRole.level === 'admin' ? 'Admin' :
                   selectedRole.level === 'advanced' ? 'Gelişmiş' : 'Temel'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kullanıcı Sayısı">
                {selectedRole.userCount}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge
                  status={selectedRole.isActive ? 'success' : 'default'}
                  text={selectedRole.isActive ? 'Aktif' : 'Pasif'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(selectedRole.createdAt).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Güncelleme">
                {dayjs(selectedRole.updatedAt).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturan">
                {selectedRole.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Açıklama" span={2}>
                {selectedRole.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>İzinler ({selectedRole.permissions.length})</Title>
            <List
              size="small"
              dataSource={permissions.filter(p => selectedRole.permissions.includes(p.id))}
              renderItem={permission => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getPermissionIcon(permission.level)}
                    title={
                      <Space>
                        <Text code>{permission.name}</Text>
                        <Tag color={getPermissionLevelColor(permission.level)}>
                          {permission.level}
                        </Tag>
                      </Space>
                    }
                    description={permission.description}
                  />
                  <Tag>{permission.category}</Tag>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* Permission Management Modal */}
      <Modal
        title="İzin Yönetimi"
        visible={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setPermissionModalVisible(false)}>
            İptal
          </Button>,
          <Button key="save" type="primary">
            Kaydet
          </Button>
        ]}
      >
        {selectedRole && (
          <div>
            <Alert
              message={`${selectedRole.name} rolü için izin düzenleme`}
              description="İzinleri seçerek rolün yetkilerini belirleyebilirsiniz."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <Card key={category} title={category} size="small" style={{ marginBottom: 16 }}>
                <Checkbox.Group 
                  value={selectedRole.permissions.filter(id => 
                    perms.some(p => p.id === id)
                  )}
                  style={{ width: '100%' }}
                >
                  <Row>
                    {perms.map(permission => (
                      <Col span={12} key={permission.id} style={{ marginBottom: 8 }}>
                        <Checkbox value={permission.id}>
                          <Space>
                            {getPermissionIcon(permission.level)}
                            <div>
                              <Text>{permission.name}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {permission.description}
                              </Text>
                            </div>
                          </Space>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Card>
            ))}
          </div>
        )}
      </Modal>

      {/* User Assignment Modal */}
      <Modal
        title="Kullanıcı Atama"
        visible={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setAssignModalVisible(false)}>
            İptal
          </Button>,
          <Button key="assign" type="primary">
            Ata
          </Button>
        ]}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="userId"
            label="Kullanıcı"
            rules={[{ required: true, message: 'Kullanıcı seçiniz' }]}
          >
            <Select
              placeholder="Kullanıcı seçiniz"
              showSearch
              optionFilterProp="children"
            >
              <Option value="user_1">John Doe (john@example.com)</Option>
              <Option value="user_2">Jane Smith (jane@example.com)</Option>
              <Option value="user_3">Bob Johnson (bob@example.com)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="expiresAt"
            label="Bitiş Tarihi (Opsiyonel)"
          >
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Notlar"
          >
            <TextArea rows={3} placeholder="Atama notları" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserRolesPage;