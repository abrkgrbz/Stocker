import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Dropdown, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  message,
  Row,
  Col,
  Statistic,
  Avatar,
  Tooltip,
  Badge,
  Typography,
  Divider,
  DatePicker,
  Checkbox,
  Upload,
  Tabs,
  Alert,
  Timeline,
  Progress,
  Empty
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  SafetyOutlined,
  GlobalOutlined,
  KeyOutlined,
  SettingOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface TenantUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  title?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  permissions: string[];
  loginCount: number;
  ipAddress?: string;
  location?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  color: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

const TenantUsers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeTab, setActiveTab] = useState('users');
  
  // Modals
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [bulkActionModalVisible, setBulkActionModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [bulkForm] = Form.useForm();

  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [id]);

  const fetchUsers = async () => {
    setLoading(true);
    // Simulated data
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'Ahmet Yılmaz',
          email: 'ahmet.yilmaz@company.com',
          phone: '+90 532 123 4567',
          role: 'Admin',
          department: 'IT',
          title: 'IT Müdürü',
          status: 'active',
          avatar: 'AY',
          lastLogin: '2024-01-15T10:30:00',
          createdAt: '2023-06-15T09:00:00',
          emailVerified: true,
          twoFactorEnabled: true,
          permissions: ['users.read', 'users.write', 'settings.write'],
          loginCount: 245,
          ipAddress: '192.168.1.100',
          location: 'İstanbul, TR'
        },
        {
          id: '2',
          name: 'Ayşe Demir',
          email: 'ayse.demir@company.com',
          phone: '+90 533 234 5678',
          role: 'Manager',
          department: 'Sales',
          title: 'Satış Müdürü',
          status: 'active',
          avatar: 'AD',
          lastLogin: '2024-01-15T14:20:00',
          createdAt: '2023-07-20T10:00:00',
          emailVerified: true,
          twoFactorEnabled: false,
          permissions: ['sales.read', 'sales.write', 'reports.read'],
          loginCount: 189,
          ipAddress: '192.168.1.101',
          location: 'Ankara, TR'
        },
        {
          id: '3',
          name: 'Mehmet Kaya',
          email: 'mehmet.kaya@company.com',
          role: 'User',
          department: 'Finance',
          title: 'Muhasebe Uzmanı',
          status: 'inactive',
          avatar: 'MK',
          lastLogin: '2024-01-10T16:45:00',
          createdAt: '2023-08-10T11:00:00',
          emailVerified: true,
          twoFactorEnabled: false,
          permissions: ['reports.read'],
          loginCount: 67,
          ipAddress: '192.168.1.102',
          location: 'İzmir, TR'
        },
        {
          id: '4',
          name: 'Zeynep Öz',
          email: 'zeynep.oz@company.com',
          role: 'User',
          department: 'HR',
          status: 'pending',
          avatar: 'ZÖ',
          createdAt: '2024-01-14T09:00:00',
          emailVerified: false,
          twoFactorEnabled: false,
          permissions: [],
          loginCount: 0
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const fetchRoles = async () => {
    // Simulated data
    setRoles([
      {
        id: '1',
        name: 'Admin',
        description: 'Tam yetki',
        permissions: ['*'],
        userCount: 2,
        isSystem: true,
        color: 'red'
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Yönetici yetkisi',
        permissions: ['users.read', 'reports.*', 'settings.read'],
        userCount: 5,
        isSystem: false,
        color: 'orange'
      },
      {
        id: '3',
        name: 'User',
        description: 'Standart kullanıcı',
        permissions: ['profile.*', 'reports.read'],
        userCount: 15,
        isSystem: false,
        color: 'blue'
      }
    ]);
  };

  const handleCreateUser = () => {
    form.resetFields();
    setSelectedUser(null);
    setUserModalVisible(true);
  };

  const handleEditUser = (user: TenantUser) => {
    setSelectedUser(user);
    form.setFieldsValue({
      ...user,
      permissions: user.permissions
    });
    setUserModalVisible(true);
  };

  const handleSaveUser = async (values: any) => {
    setLoading(true);
    try {
      // API call would go here
      message.success(selectedUser ? 'Kullanıcı güncellendi' : 'Kullanıcı oluşturuldu');
      setUserModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: 'Kullanıcı Sil',
      content: 'Bu kullanıcıyı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          // API call would go here
          message.success('Kullanıcı silindi');
          fetchUsers();
        } catch (error) {
          message.error('Silme işlemi başarısız');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleBulkAction = async (values: any) => {
    setLoading(true);
    try {
      // API call would go here
      message.success('Toplu işlem tamamlandı');
      setBulkActionModalVisible(false);
      setSelectedRowKeys([]);
      fetchUsers();
    } catch (error) {
      message.error('İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (userId: string) => {
    Modal.confirm({
      title: 'Şifre Sıfırla',
      content: 'Kullanıcıya yeni şifre e-postası gönderilecek. Onaylıyor musunuz?',
      okText: 'Gönder',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          // API call would go here
          message.success('Şifre sıfırlama e-postası gönderildi');
        } catch (error) {
          message.error('E-posta gönderilemedi');
        }
      }
    });
  };

  const handleToggle2FA = (userId: string, enabled: boolean) => {
    Modal.confirm({
      title: enabled ? '2FA Devre Dışı Bırak' : '2FA Etkinleştir',
      content: `İki faktörlü doğrulamayı ${enabled ? 'devre dışı bırakmak' : 'etkinleştirmek'} istediğinizden emin misiniz?`,
      okText: 'Onayla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          // API call would go here
          message.success(`2FA ${enabled ? 'devre dışı bırakıldı' : 'etkinleştirildi'}`);
          fetchUsers();
        } catch (error) {
          message.error('İşlem başarısız');
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      active: { color: 'success', text: 'Aktif', icon: <CheckCircleOutlined /> },
      inactive: { color: 'default', text: 'Pasif', icon: <CloseCircleOutlined /> },
      suspended: { color: 'error', text: 'Askıda', icon: <ExclamationCircleOutlined /> },
      pending: { color: 'warning', text: 'Beklemede', icon: <ClockCircleOutlined /> }
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getRoleTag = (role: string) => {
    const roleColors: Record<string, string> = {
      Admin: 'red',
      Manager: 'orange',
      User: 'blue',
      Guest: 'default'
    };

    return (
      <Tag color={roleColors[role] || 'default'} icon={<CrownOutlined />}>
        {role}
      </Tag>
    );
  };

  const columns: ColumnsType<TenantUser> = [
    {
      title: 'Kullanıcı',
      key: 'user',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#667eea' }}>
            {record.avatar || record.name.substring(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => getRoleTag(role)
    },
    {
      title: 'Departman',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: (department) => department || '-'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      render: (date) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : 'Hiç giriş yapmadı'
    },
    {
      title: 'Güvenlik',
      key: 'security',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="E-posta Doğrulaması">
            <Tag color={record.emailVerified ? 'success' : 'default'}>
              <MailOutlined />
            </Tag>
          </Tooltip>
          <Tooltip title="İki Faktörlü Doğrulama">
            <Tag color={record.twoFactorEnabled ? 'success' : 'default'}>
              <SafetyOutlined />
            </Tag>
          </Tooltip>
          <Tooltip title={`${record.loginCount} giriş`}>
            <Tag>{record.loginCount}</Tag>
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => handleEditUser(record)
              },
              {
                key: 'password',
                label: 'Şifre Sıfırla',
                icon: <LockOutlined />,
                onClick: () => handleResetPassword(record.id)
              },
              {
                key: '2fa',
                label: record.twoFactorEnabled ? '2FA Kapat' : '2FA Aç',
                icon: <SafetyOutlined />,
                onClick: () => handleToggle2FA(record.id, record.twoFactorEnabled)
              },
              {
                key: 'impersonate',
                label: 'Kullanıcı Olarak Giriş',
                icon: <UserSwitchOutlined />,
                onClick: () => message.info('Kullanıcı girişi simüle edilecek')
              },
              {
                type: 'divider'
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDeleteUser(record.id)
              }
            ]
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const roleColumns: ColumnsType<Role> = [
    {
      title: 'Rol Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Tag color={record.color}>{name}</Tag>
          {record.isSystem && <Tag color="purple">Sistem</Tag>}
        </Space>
      )
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Kullanıcı Sayısı',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 120,
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: 'Yetki Sayısı',
      key: 'permissions',
      width: 120,
      render: (_, record) => (
        <Tag>{record.permissions.length} yetki</Tag>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            disabled={record.isSystem}
            onClick={() => {
              roleForm.setFieldsValue(record);
              setRoleModalVisible(true);
            }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small"
            danger
            disabled={record.isSystem || record.userCount > 0}
          />
        </Space>
      )
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesRole && matchesDepartment;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    pending: users.filter(u => u.status === 'pending').length,
    verified: users.filter(u => u.emailVerified).length,
    twoFactor: users.filter(u => u.twoFactorEnabled).length
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <TeamOutlined /> Kullanıcı Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>
                İçe Aktar
              </Button>
              <Button icon={<DownloadOutlined />}>
                Dışa Aktar
              </Button>
              <Button type="primary" icon={<UserAddOutlined />} onClick={handleCreateUser}>
                Yeni Kullanıcı
              </Button>
            </Space>
          </Col>
        </Row>
        <Divider />
        
        {/* Statistics */}
        <Row gutter={16}>
          <Col span={4}>
            <Statistic
              title="Toplam Kullanıcı"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="Aktif"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="Pasif"
              value={stats.inactive}
              valueStyle={{ color: '#999' }}
              prefix={<CloseCircleOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="Beklemede"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="Doğrulanmış"
              value={stats.verified}
              suffix={`/ ${stats.total}`}
              prefix={<MailOutlined />}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="2FA Aktif"
              value={stats.twoFactor}
              suffix={`/ ${stats.total}`}
              prefix={<SafetyOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Kullanıcılar" key="users">
            {/* Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Input
                  placeholder="Kullanıcı ara..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Durum"
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="all">Tüm Durumlar</Option>
                  <Option value="active">Aktif</Option>
                  <Option value="inactive">Pasif</Option>
                  <Option value="suspended">Askıda</Option>
                  <Option value="pending">Beklemede</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Rol"
                  style={{ width: '100%' }}
                  value={roleFilter}
                  onChange={setRoleFilter}
                >
                  <Option value="all">Tüm Roller</Option>
                  <Option value="Admin">Admin</Option>
                  <Option value="Manager">Manager</Option>
                  <Option value="User">User</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Departman"
                  style={{ width: '100%' }}
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                >
                  <Option value="all">Tüm Departmanlar</Option>
                  <Option value="IT">IT</Option>
                  <Option value="Sales">Satış</Option>
                  <Option value="Finance">Finans</Option>
                  <Option value="HR">İK</Option>
                </Select>
              </Col>
              <Col span={6} style={{ textAlign: 'right' }}>
                {selectedRowKeys.length > 0 && (
                  <Space>
                    <Text>{selectedRowKeys.length} kullanıcı seçildi</Text>
                    <Button 
                      onClick={() => setBulkActionModalVisible(true)}
                      type="primary"
                    >
                      Toplu İşlem
                    </Button>
                  </Space>
                )}
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1300 }}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys
              }}
              pagination={{
                total: filteredUsers.length,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} kullanıcı`
              }}
            />
          </TabPane>

          <TabPane tab="Roller" key="roles">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Alert
                  message="Rol Yönetimi"
                  description="Kullanıcı rollerini ve yetkilerini bu alandan yönetebilirsiniz."
                  type="info"
                  showIcon
                />
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    roleForm.resetFields();
                    setRoleModalVisible(true);
                  }}
                >
                  Yeni Rol
                </Button>
              </Col>
            </Row>

            <Table
              columns={roleColumns}
              dataSource={roles}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Yetkiler" key="permissions">
            <Alert
              message="Yetki Matrisi"
              description="Rollere atanan yetkiler ve erişim seviyeleri"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Card>
              <Title level={5}>Modül Yetkileri</Title>
              <Table
                dataSource={[
                  { module: 'Kullanıcılar', admin: true, manager: true, user: false },
                  { module: 'Ayarlar', admin: true, manager: false, user: false },
                  { module: 'Raporlar', admin: true, manager: true, user: true },
                  { module: 'Faturalar', admin: true, manager: true, user: false },
                  { module: 'API Anahtarları', admin: true, manager: false, user: false }
                ]}
                columns={[
                  { title: 'Modül', dataIndex: 'module', key: 'module' },
                  { 
                    title: 'Admin', 
                    dataIndex: 'admin', 
                    key: 'admin',
                    render: (val) => val ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#999' }} />
                  },
                  { 
                    title: 'Manager', 
                    dataIndex: 'manager', 
                    key: 'manager',
                    render: (val) => val ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#999' }} />
                  },
                  { 
                    title: 'User', 
                    dataIndex: 'user', 
                    key: 'user',
                    render: (val) => val ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#999' }} />
                  }
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </TabPane>

          <TabPane tab="Aktivite Logları" key="activity">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <>
                      <Text strong>Ahmet Yılmaz</Text> sisteme giriş yaptı
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        15 Ocak 2024, 10:30 - IP: 192.168.1.100
                      </Text>
                    </>
                  )
                },
                {
                  color: 'blue',
                  children: (
                    <>
                      <Text strong>Ayşe Demir</Text> profil bilgilerini güncelledi
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        15 Ocak 2024, 14:20 - IP: 192.168.1.101
                      </Text>
                    </>
                  )
                },
                {
                  color: 'red',
                  children: (
                    <>
                      <Text strong>Mehmet Kaya</Text> yanlış şifre denemesi (3 kez)
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        15 Ocak 2024, 16:45 - IP: 192.168.1.102
                      </Text>
                    </>
                  )
                },
                {
                  color: 'orange',
                  children: (
                    <>
                      <Text strong>Admin</Text> Zeynep Öz kullanıcısını ekledi
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        14 Ocak 2024, 09:00 - IP: 192.168.1.1
                      </Text>
                    </>
                  )
                }
              ]}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* User Modal */}
      <Modal
        title={selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveUser}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Ad Soyad"
                rules={[{ required: true, message: 'Ad soyad gerekli' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="E-posta"
                rules={[
                  { required: true, message: 'E-posta gerekli' },
                  { type: 'email', message: 'Geçerli e-posta giriniz' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Telefon"
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Rol"
                rules={[{ required: true, message: 'Rol seçimi gerekli' }]}
              >
                <Select>
                  <Option value="Admin">Admin</Option>
                  <Option value="Manager">Manager</Option>
                  <Option value="User">User</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Departman"
              >
                <Select>
                  <Option value="IT">IT</Option>
                  <Option value="Sales">Satış</Option>
                  <Option value="Finance">Finans</Option>
                  <Option value="HR">İK</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Ünvan"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Durum"
                initialValue="active"
              >
                <Select>
                  <Option value="active">Aktif</Option>
                  <Option value="inactive">Pasif</Option>
                  <Option value="pending">Beklemede</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sendWelcomeEmail"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>Hoşgeldin e-postası gönder</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Role Modal */}
      <Modal
        title="Rol Yönetimi"
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        onOk={() => roleForm.submit()}
        width={500}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={(values) => {
            message.success('Rol kaydedildi');
            setRoleModalVisible(false);
            fetchRoles();
          }}
        >
          <Form.Item
            name="name"
            label="Rol Adı"
            rules={[{ required: true, message: 'Rol adı gerekli' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="color"
            label="Renk"
            initialValue="blue"
          >
            <Select>
              <Option value="red">Kırmızı</Option>
              <Option value="orange">Turuncu</Option>
              <Option value="green">Yeşil</Option>
              <Option value="blue">Mavi</Option>
              <Option value="purple">Mor</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Action Modal */}
      <Modal
        title="Toplu İşlem"
        open={bulkActionModalVisible}
        onCancel={() => setBulkActionModalVisible(false)}
        onOk={() => bulkForm.submit()}
        width={500}
      >
        <Alert
          message={`${selectedRowKeys.length} kullanıcı seçildi`}
          type="info"
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={bulkForm}
          layout="vertical"
          onFinish={handleBulkAction}
        >
          <Form.Item
            name="action"
            label="İşlem Türü"
            rules={[{ required: true, message: 'İşlem seçimi gerekli' }]}
          >
            <Select>
              <Option value="activate">Aktif Et</Option>
              <Option value="deactivate">Pasif Et</Option>
              <Option value="changeRole">Rol Değiştir</Option>
              <Option value="changeDepartment">Departman Değiştir</Option>
              <Option value="delete">Sil</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.action !== currentValues.action}
          >
            {({ getFieldValue }) =>
              getFieldValue('action') === 'changeRole' && (
                <Form.Item
                  name="newRole"
                  label="Yeni Rol"
                  rules={[{ required: true, message: 'Rol seçimi gerekli' }]}
                >
                  <Select>
                    <Option value="Admin">Admin</Option>
                    <Option value="Manager">Manager</Option>
                    <Option value="User">User</Option>
                  </Select>
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.action !== currentValues.action}
          >
            {({ getFieldValue }) =>
              getFieldValue('action') === 'changeDepartment' && (
                <Form.Item
                  name="newDepartment"
                  label="Yeni Departman"
                  rules={[{ required: true, message: 'Departman seçimi gerekli' }]}
                >
                  <Select>
                    <Option value="IT">IT</Option>
                    <Option value="Sales">Satış</Option>
                    <Option value="Finance">Finans</Option>
                    <Option value="HR">İK</Option>
                  </Select>
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Kullanıcı İçe Aktarma"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="CSV Formatı"
          description="Ad, E-posta, Telefon, Rol, Departman sütunlarını içeren CSV dosyası yükleyin."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Upload.Dragger
          accept=".csv"
          beforeUpload={(file) => {
            message.success(`${file.name} dosyası yüklendi`);
            return false;
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#667eea' }} />
          </p>
          <p className="ant-upload-text">Dosya yüklemek için tıklayın veya sürükleyin</p>
          <p className="ant-upload-hint">CSV formatında kullanıcı listesi</p>
        </Upload.Dragger>

        <Divider />

        <Button type="link" icon={<DownloadOutlined />}>
          Örnek CSV Dosyasını İndir
        </Button>
      </Modal>
    </div>
  );
};

export default TenantUsers;