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
  Tree, 
  Transfer, 
  Tabs, 
  Descriptions, 
  Timeline, 
  Progress, 
  Statistic,
  Avatar,
  List,
  Checkbox,
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
  DownloadOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BellOutlined,
  KeyOutlined,
  ControlOutlined,
  SecurityScanOutlined,
  SafetyOutlined,
  ApiOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  FileTextOutlined,
  ToolOutlined,
  MonitorOutlined,
  CloudOutlined,
  ShareAltOutlined,
  CopyOutlined,
  SearchOutlined,
  MoreOutlined
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
const { TreeNode } = Tree;

interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'system' | 'tenant' | 'user' | 'billing' | 'analytics' | 'security';
  level: 'read' | 'write' | 'delete' | 'admin';
  resource: string;
  action: string;
  isActive: boolean;
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  dependencies?: string[];
  conflictsWith?: string[];
  roles: string[];
  usageCount: number;
}

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  category: string;
}

interface PermissionAudit {
  id: string;
  permissionId: string;
  permissionName: string;
  action: 'granted' | 'revoked' | 'modified' | 'created' | 'deleted';
  userId: string;
  userName: string;
  roleId?: string;
  roleName?: string;
  reason: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

const PermissionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions');
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: '1',
      name: 'Tenant Yönetimi - Okuma',
      code: 'tenant.read',
      description: 'Tenant bilgilerini görüntüleme yetkisi',
      category: 'tenant',
      level: 'read',
      resource: 'tenant',
      action: 'read',
      isActive: true,
      isSystemPermission: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'system',
      dependencies: [],
      roles: ['admin', 'tenant-manager', 'viewer'],
      usageCount: 245
    },
    {
      id: '2',
      name: 'Tenant Yönetimi - Yazma',
      code: 'tenant.write',
      description: 'Tenant bilgilerini düzenleme yetkisi',
      category: 'tenant',
      level: 'write',
      resource: 'tenant',
      action: 'write',
      isActive: true,
      isSystemPermission: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'system',
      dependencies: ['tenant.read'],
      roles: ['admin', 'tenant-manager'],
      usageCount: 89
    },
    {
      id: '3',
      name: 'Tenant Yönetimi - Silme',
      code: 'tenant.delete',
      description: 'Tenant silme yetkisi',
      category: 'tenant',
      level: 'delete',
      resource: 'tenant',
      action: 'delete',
      isActive: true,
      isSystemPermission: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'system',
      dependencies: ['tenant.read', 'tenant.write'],
      conflictsWith: ['tenant.readonly'],
      roles: ['admin'],
      usageCount: 12
    },
    {
      id: '4',
      name: 'Kullanıcı Yönetimi - Okuma',
      code: 'user.read',
      description: 'Kullanıcı bilgilerini görüntüleme yetkisi',
      category: 'user',
      level: 'read',
      resource: 'user',
      action: 'read',
      isActive: true,
      isSystemPermission: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'system',
      roles: ['admin', 'user-manager', 'hr'],
      usageCount: 189
    },
    {
      id: '5',
      name: 'Faturalama - Yönetim',
      code: 'billing.admin',
      description: 'Faturalama sistemini tam yönetme yetkisi',
      category: 'billing',
      level: 'admin',
      resource: 'billing',
      action: 'admin',
      isActive: true,
      isSystemPermission: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'system',
      dependencies: ['billing.read', 'billing.write'],
      roles: ['admin', 'finance-manager'],
      usageCount: 34
    },
    {
      id: '6',
      name: 'Analytics - Görüntüleme',
      code: 'analytics.view',
      description: 'Analytics dashboard görüntüleme yetkisi',
      category: 'analytics',
      level: 'read',
      resource: 'analytics',
      action: 'view',
      isActive: true,
      isSystemPermission: false,
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      createdBy: 'admin',
      roles: ['admin', 'analyst', 'manager'],
      usageCount: 156
    },
    {
      id: '7',
      name: 'Güvenlik - Audit Log',
      code: 'security.audit',
      description: 'Güvenlik audit loglarını görüntüleme yetkisi',
      category: 'security',
      level: 'read',
      resource: 'security',
      action: 'audit',
      isActive: true,
      isSystemPermission: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'system',
      roles: ['admin', 'security-officer'],
      usageCount: 67
    },
    {
      id: '8',
      name: 'API - Erişim',
      code: 'api.access',
      description: 'API endpoints erişim yetkisi',
      category: 'system',
      level: 'read',
      resource: 'api',
      action: 'access',
      isActive: false,
      isSystemPermission: false,
      createdAt: '2024-01-25T09:15:00Z',
      updatedAt: '2024-01-25T09:15:00Z',
      createdBy: 'admin',
      roles: ['developer'],
      usageCount: 5
    }
  ]);

  const [permissionGroups] = useState<PermissionGroup[]>([
    {
      id: '1',
      name: 'Tenant Yöneticisi',
      description: 'Tenant yönetimi için gerekli tüm yetkiler',
      permissions: ['tenant.read', 'tenant.write', 'user.read'],
      color: 'blue',
      category: 'tenant'
    },
    {
      id: '2',
      name: 'Finansal Yönetici',
      description: 'Faturalama ve finansal işlemler için yetkiler',
      permissions: ['billing.admin', 'analytics.view', 'tenant.read'],
      color: 'green',
      category: 'billing'
    },
    {
      id: '3',
      name: 'Güvenlik Uzmanı',
      description: 'Güvenlik ve audit işlemleri için yetkiler',
      permissions: ['security.audit', 'user.read', 'tenant.read'],
      color: 'red',
      category: 'security'
    },
    {
      id: '4',
      name: 'Analiz Uzmanı',
      description: 'Analytics ve raporlama yetkiler',
      permissions: ['analytics.view', 'tenant.read'],
      color: 'purple',
      category: 'analytics'
    }
  ]);

  const [auditLogs] = useState<PermissionAudit[]>([
    {
      id: '1',
      permissionId: '1',
      permissionName: 'tenant.read',
      action: 'granted',
      userId: 'user_123',
      userName: 'Ahmet Yılmaz',
      roleId: 'role_456',
      roleName: 'Tenant Manager',
      reason: 'Yeni role ataması',
      timestamp: '2024-01-25T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: '2',
      permissionId: '3',
      permissionName: 'tenant.delete',
      action: 'revoked',
      userId: 'user_789',
      userName: 'Mehmet Kaya',
      reason: 'Güvenlik ihlali nedeniyle iptal',
      timestamp: '2024-01-24T15:45:00Z',
      ipAddress: '10.0.0.50',
      userAgent: 'Chrome/120.0...'
    },
    {
      id: '3',
      permissionId: '6',
      permissionName: 'analytics.view',
      action: 'created',
      userId: 'admin',
      userName: 'System Admin',
      reason: 'Yeni permission oluşturuldu',
      timestamp: '2024-01-20T14:30:00Z',
      ipAddress: '172.16.0.1',
      userAgent: 'Admin Panel'
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'red';
      case 'tenant': return 'blue';
      case 'user': return 'green';
      case 'billing': return 'orange';
      case 'analytics': return 'purple';
      case 'security': return 'gold';
      default: return 'default';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'read': return 'green';
      case 'write': return 'blue';
      case 'delete': return 'red';
      case 'admin': return 'purple';
      default: return 'default';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'granted': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'revoked': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'modified': return <EditOutlined style={{ color: '#1890ff' }} />;
      case 'created': return <PlusOutlined style={{ color: '#52c41a' }} />;
      case 'deleted': return <DeleteOutlined style={{ color: '#ff4d4f' }} />;
      default: return <InfoCircleOutlined />;
    }
  };

  const handleCreate = () => {
    form.validateFields().then(values => {
      const newPermission: Permission = {
        id: Date.now().toString(),
        ...values,
        isActive: true,
        isSystemPermission: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        roles: [],
        usageCount: 0
      };
      setPermissions([newPermission, ...permissions]);
      message.success('Yeni yetki oluşturuldu');
      setModalVisible(false);
      form.resetFields();
    });
  };

  const handleToggleStatus = (permissionId: string) => {
    setPermissions(prev => prev.map(perm => 
      perm.id === permissionId 
        ? { ...perm, isActive: !perm.isActive }
        : perm
    ));
    message.success('Yetki durumu güncellendi');
  };

  const handleDeletePermission = (permissionId: string) => {
    Modal.confirm({
      title: 'Yetkiyi Sil',
      content: 'Bu yetkiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        setPermissions(prev => prev.filter(perm => perm.id !== permissionId));
        message.success('Yetki silindi');
      }
    });
  };

  const permissionColumns = [
    {
      title: 'Yetki Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Permission) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text code style={{ fontSize: 12 }}>{record.code}</Text>
          {record.isSystemPermission && (
            <Tag size="small" color="gold">Sistem</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {category.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={getLevelColor(level)}>
          {level.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? 'Aktif' : 'Pasif'}
        />
      )
    },
    {
      title: 'Kullanım',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => (
        <Text>{count} kez</Text>
      )
    },
    {
      title: 'Roller',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space wrap>
          {roles.slice(0, 2).map(role => (
            <Tag key={role} size="small">{role}</Tag>
          ))}
          {roles.length > 2 && (
            <Tooltip title={roles.slice(2).join(', ')}>
              <Tag size="small">+{roles.length - 2}</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Permission) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPermission(record);
              setDetailModalVisible(true);
            }}
          >
            Detay
          </Button>
          <Switch
            size="small"
            checked={record.isActive}
            onChange={() => handleToggleStatus(record.id)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="edit"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedPermission(record);
                    setEditMode(true);
                    form.setFieldsValue(record);
                    setModalVisible(true);
                  }}
                >
                  Düzenle
                </Menu.Item>
                <Menu.Item
                  key="clone"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    const cloned = { ...record, id: '', name: `${record.name} (Kopya)` };
                    form.setFieldsValue(cloned);
                    setEditMode(false);
                    setModalVisible(true);
                  }}
                >
                  Kopyala
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  key="delete"
                  icon={<DeleteOutlined />}
                  danger
                  disabled={record.isSystemPermission}
                  onClick={() => handleDeletePermission(record.id)}
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

  const auditColumns = [
    {
      title: 'İşlem',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Space>
          {getActionIcon(action)}
          <Text>{action === 'granted' ? 'Verildi' :
                action === 'revoked' ? 'İptal Edildi' :
                action === 'modified' ? 'Değiştirildi' :
                action === 'created' ? 'Oluşturuldu' : 'Silindi'}</Text>
        </Space>
      )
    },
    {
      title: 'Yetki',
      dataIndex: 'permissionName',
      key: 'permissionName',
      render: (name: string) => <Text code>{name}</Text>
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string, record: PermissionAudit) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            {record.roleName && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  via {record.roleName}
                </Text>
              </div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason'
    },
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => (
        <Text>{dayjs(timestamp).format('DD.MM.YYYY HH:mm')}</Text>
      )
    },
    {
      title: 'IP Adresi',
      dataIndex: 'ipAddress',
      key: 'ipAddress'
    }
  ];

  // Permission statistics
  const permissionStats = {
    total: permissions.length,
    active: permissions.filter(p => p.isActive).length,
    system: permissions.filter(p => p.isSystemPermission).length,
    custom: permissions.filter(p => !p.isSystemPermission).length,
    byCategory: {
      system: permissions.filter(p => p.category === 'system').length,
      tenant: permissions.filter(p => p.category === 'tenant').length,
      user: permissions.filter(p => p.category === 'user').length,
      billing: permissions.filter(p => p.category === 'billing').length,
      analytics: permissions.filter(p => p.category === 'analytics').length,
      security: permissions.filter(p => p.category === 'security').length,
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <SafetyOutlined /> Yetki Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<FilterOutlined />}>Filtrele</Button>
              <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
              <Button icon={<ReloadOutlined />}>Yenile</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditMode(false);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                Yeni Yetki
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Toplam Yetki"
              value={permissionStats.total}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Aktif Yetki"
              value={permissionStats.active}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Sistem Yetkisi"
              value={permissionStats.system}
              prefix={<SafetyOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Özel Yetki"
              value={permissionStats.custom}
              prefix={<ControlOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Yetki Listesi" key="permissions">
            <Space style={{ marginBottom: 16 }}>
              <Select placeholder="Kategori" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="system">Sistem</Option>
                <Option value="tenant">Tenant</Option>
                <Option value="user">Kullanıcı</Option>
                <Option value="billing">Faturalama</Option>
                <Option value="analytics">Analytics</Option>
                <Option value="security">Güvenlik</Option>
              </Select>
              <Select placeholder="Seviye" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="read">Okuma</Option>
                <Option value="write">Yazma</Option>
                <Option value="delete">Silme</Option>
                <Option value="admin">Admin</Option>
              </Select>
              <Select placeholder="Durum" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="active">Aktif</Option>
                <Option value="inactive">Pasif</Option>
              </Select>
              <Input.Search 
                placeholder="Yetki ara..." 
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
            </Space>

            <Table
              columns={permissionColumns}
              dataSource={permissions}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} yetki`
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          <TabPane tab="Yetki Grupları" key="groups">
            <Alert
              message="Yetki Grupları"
              description="İlgili yetkiler gruplanarak yönetilebilir ve roller üzerinden toplu atama yapılabilir."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
              {permissionGroups.map(group => (
                <Col span={6} key={group.id} style={{ marginBottom: 16 }}>
                  <Card 
                    size="small"
                    title={
                      <Space>
                        <Badge color={group.color} />
                        <Text strong>{group.name}</Text>
                      </Space>
                    }
                    extra={
                      <Dropdown
                        overlay={
                          <Menu>
                            <Menu.Item key="edit" icon={<EditOutlined />}>
                              Düzenle
                            </Menu.Item>
                            <Menu.Item key="clone" icon={<CopyOutlined />}>
                              Kopyala
                            </Menu.Item>
                            <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                              Sil
                            </Menu.Item>
                          </Menu>
                        }
                      >
                        <Button type="text" icon={<MoreOutlined />} size="small" />
                      </Dropdown>
                    }
                  >
                    <Paragraph style={{ fontSize: 12, margin: '0 0 12px 0' }}>
                      {group.description}
                    </Paragraph>
                    
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Yetkiler ({group.permissions.length})
                      </Text>
                    </div>
                    
                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                      {group.permissions.slice(0, 3).map(permCode => (
                        <Text key={permCode} code style={{ fontSize: 11 }}>
                          {permCode}
                        </Text>
                      ))}
                      {group.permissions.length > 3 && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          +{group.permissions.length - 3} daha...
                        </Text>
                      )}
                    </Space>
                  </Card>
                </Col>
              ))}
              
              <Col span={6}>
                <Card 
                  size="small"
                  style={{ 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #d9d9d9',
                    backgroundColor: '#fafafa'
                  }}
                  bodyStyle={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%'
                  }}
                >
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={() => setGroupModalVisible(true)}
                  >
                    Yeni Grup
                  </Button>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Yetki Matrisi" key="matrix">
            <Alert
              message="Yetki Matrisi"
              description="Roller ve yetkiler arasındaki ilişkileri görsel olarak inceleyin."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card title="Role-Permission Matrix" size="small">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: 8, border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                        Role / Permission
                      </th>
                      {permissions.slice(0, 6).map(perm => (
                        <th 
                          key={perm.id}
                          style={{ 
                            padding: 8, 
                            border: '1px solid #f0f0f0', 
                            backgroundColor: '#fafafa',
                            writing: 'vertical-lr',
                            textOrientation: 'mixed',
                            fontSize: 11,
                            maxWidth: 60
                          }}
                        >
                          {perm.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['admin', 'tenant-manager', 'user-manager', 'finance-manager', 'security-officer'].map(role => (
                      <tr key={role}>
                        <td style={{ padding: 8, border: '1px solid #f0f0f0', fontWeight: 600 }}>
                          {role}
                        </td>
                        {permissions.slice(0, 6).map(perm => (
                          <td key={perm.id} style={{ padding: 8, border: '1px solid #f0f0f0', textAlign: 'center' }}>
                            {perm.roles.includes(role) ? (
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            ) : (
                              <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPane>

          <TabPane tab="Audit Logları" key="audit">
            <Alert
              message="Yetki Değişiklikleri"
              description="Tüm yetki değişiklikleri ve atama işlemleri kayıt altında tutulmaktadır."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={auditColumns}
              dataSource={auditLogs}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showTotal: (total) => `Toplam ${total} log kaydı`
              }}
              size="small"
            />
          </TabPane>

          <TabPane tab="Bağımlılıklar" key="dependencies">
            <Alert
              message="Yetki Bağımlılıkları"
              description="Yetkiler arasındaki bağımlılık ilişkilerini ve çakışmaları görüntüleyin."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="Bağımlılık Ağacı" size="small">
                  <Tree
                    showLine
                    defaultExpandedKeys={['tenant', 'user', 'billing']}
                    treeData={[
                      {
                        title: 'Tenant Permissions',
                        key: 'tenant',
                        children: [
                          { title: 'tenant.read', key: 'tenant.read' },
                          { 
                            title: 'tenant.write', 
                            key: 'tenant.write',
                            children: [
                              { title: '→ requires: tenant.read', key: 'tenant.write.dep1' }
                            ]
                          },
                          { 
                            title: 'tenant.delete', 
                            key: 'tenant.delete',
                            children: [
                              { title: '→ requires: tenant.read', key: 'tenant.delete.dep1' },
                              { title: '→ requires: tenant.write', key: 'tenant.delete.dep2' }
                            ]
                          }
                        ]
                      },
                      {
                        title: 'User Permissions',
                        key: 'user',
                        children: [
                          { title: 'user.read', key: 'user.read' },
                          { title: 'user.write', key: 'user.write' },
                          { title: 'user.delete', key: 'user.delete' }
                        ]
                      }
                    ]}
                  />
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Çakışan Yetkiler" size="small">
                  <List
                    size="small"
                    dataSource={[
                      {
                        permission: 'tenant.delete',
                        conflicts: ['tenant.readonly'],
                        reason: 'Okuma-yazma çakışması'
                      },
                      {
                        permission: 'billing.admin',
                        conflicts: ['billing.readonly'],
                        reason: 'Admin ve readonly çakışması'
                      }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                          title={<Text code>{item.permission}</Text>}
                          description={
                            <div>
                              <Text type="secondary">{item.reason}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Çakışan: {item.conflicts.join(', ')}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Permission Modal */}
      <Modal
        title={editMode ? 'Yetki Düzenle' : 'Yeni Yetki Oluştur'}
        visible={modalVisible}
        onOk={handleCreate}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText={editMode ? 'Güncelle' : 'Oluştur'}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Yetki Adı"
                rules={[{ required: true, message: 'Yetki adı gereklidir' }]}
              >
                <Input placeholder="Tenant Yönetimi - Okuma" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Yetki Kodu"
                rules={[{ required: true, message: 'Yetki kodu gereklidir' }]}
              >
                <Input placeholder="tenant.read" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama gereklidir' }]}
          >
            <TextArea rows={3} placeholder="Bu yetkinin amacını açıklayın..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="category"
                label="Kategori"
                rules={[{ required: true, message: 'Kategori seçiniz' }]}
              >
                <Select placeholder="Kategori seçiniz">
                  <Option value="system">Sistem</Option>
                  <Option value="tenant">Tenant</Option>
                  <Option value="user">Kullanıcı</Option>
                  <Option value="billing">Faturalama</Option>
                  <Option value="analytics">Analytics</Option>
                  <Option value="security">Güvenlik</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="level"
                label="Seviye"
                rules={[{ required: true, message: 'Seviye seçiniz' }]}
              >
                <Select placeholder="Seviye seçiniz">
                  <Option value="read">Okuma</Option>
                  <Option value="write">Yazma</Option>
                  <Option value="delete">Silme</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="resource"
                label="Kaynak"
                rules={[{ required: true, message: 'Kaynak gereklidir' }]}
              >
                <Input placeholder="tenant" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="action"
                label="Aksiyon"
                rules={[{ required: true, message: 'Aksiyon gereklidir' }]}
              >
                <Input placeholder="read" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dependencies"
                label="Bağımlılıklar"
              >
                <Select
                  mode="multiple"
                  placeholder="Bağımlı olunan yetkiler"
                  options={permissions.map(p => ({ label: p.code, value: p.code }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Permission Detail Modal */}
      <Modal
        title="Yetki Detayları"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedPermission && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Yetki Adı" span={2}>
              <Text strong>{selectedPermission.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Kod">
              <Text code>{selectedPermission.code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Kategori">
              <Tag color={getCategoryColor(selectedPermission.category)}>
                {selectedPermission.category.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Seviye">
              <Tag color={getLevelColor(selectedPermission.level)}>
                {selectedPermission.level.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Durum">
              <Badge
                status={selectedPermission.isActive ? 'success' : 'error'}
                text={selectedPermission.isActive ? 'Aktif' : 'Pasif'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Kaynak">{selectedPermission.resource}</Descriptions.Item>
            <Descriptions.Item label="Aksiyon">{selectedPermission.action}</Descriptions.Item>
            <Descriptions.Item label="Sistem Yetkisi">
              {selectedPermission.isSystemPermission ? 'Evet' : 'Hayır'}
            </Descriptions.Item>
            <Descriptions.Item label="Kullanım Sayısı">{selectedPermission.usageCount}</Descriptions.Item>
            <Descriptions.Item label="Oluşturan">{selectedPermission.createdBy}</Descriptions.Item>
            <Descriptions.Item label="Oluşturma Tarihi">
              {dayjs(selectedPermission.createdAt).format('DD.MM.YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Açıklama" span={2}>
              {selectedPermission.description}
            </Descriptions.Item>
            <Descriptions.Item label="Bağımlılıklar" span={2}>
              <Space wrap>
                {selectedPermission.dependencies?.map(dep => (
                  <Tag key={dep} color="blue">{dep}</Tag>
                )) || 'Yok'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Çakışmalar" span={2}>
              <Space wrap>
                {selectedPermission.conflictsWith?.map(conflict => (
                  <Tag key={conflict} color="red">{conflict}</Tag>
                )) || 'Yok'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Atanmış Roller" span={2}>
              <Space wrap>
                {selectedPermission.roles.map(role => (
                  <Tag key={role}>{role}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create Group Modal */}
      <Modal
        title="Yeni Yetki Grubu Oluştur"
        visible={groupModalVisible}
        onCancel={() => setGroupModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setGroupModalVisible(false)}>
            İptal
          </Button>,
          <Button key="create" type="primary">
            Oluştur
          </Button>
        ]}
      >
        <Form form={groupForm} layout="vertical">
          <Form.Item
            name="name"
            label="Grup Adı"
            rules={[{ required: true, message: 'Grup adı gereklidir' }]}
          >
            <Input placeholder="Analytics Uzmanı" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama gereklidir' }]}
          >
            <TextArea rows={3} placeholder="Bu grubun amacını açıklayın..." />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Yetkiler"
            rules={[{ required: true, message: 'En az bir yetki seçiniz' }]}
          >
            <Checkbox.Group
              options={permissions.map(p => ({ label: `${p.name} (${p.code})`, value: p.code }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PermissionsPage;