import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
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
  message,
  Alert,
  Tabs,
  Badge,
  Tooltip,
  Avatar,
  Statistic,
  Drawer,
  Descriptions,
  Timeline,
  List,
  Progress,
  Divider,
  Radio,
  Checkbox,
  Upload,
  Table,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  KeyOutlined,
  SafetyOutlined,
  HistoryOutlined,
  CrownOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  SendOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface TenantUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
  avatar?: string;
  department?: string;
  title?: string;
  permissions: string[];
  twoFactorEnabled: boolean;
  loginCount: number;
  emailVerified: boolean;
  invitedBy?: string;
}

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: any;
}

const TenantUsers: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [form] = Form.useForm();

  // Mock data
  const mockUsers: TenantUser[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@abc-corp.com',
      phone: '+90 555 123 4567',
      role: 'admin',
      status: 'active',
      lastLoginAt: '2024-12-07T14:30:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      department: 'IT',
      title: 'IT Manager',
      permissions: ['all'],
      twoFactorEnabled: true,
      loginCount: 1247,
      emailVerified: true,
      invitedBy: 'System',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@abc-corp.com',
      phone: '+90 555 987 6543',
      role: 'manager',
      status: 'active',
      lastLoginAt: '2024-12-07T10:15:00Z',
      createdAt: '2024-02-20T14:30:00Z',
      department: 'Sales',
      title: 'Sales Manager',
      permissions: ['read', 'write', 'manage_team'],
      twoFactorEnabled: false,
      loginCount: 856,
      emailVerified: true,
      invitedBy: 'John Doe',
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@abc-corp.com',
      role: 'user',
      status: 'active',
      lastLoginAt: '2024-12-06T16:45:00Z',
      createdAt: '2024-03-10T09:00:00Z',
      department: 'Marketing',
      title: 'Marketing Specialist',
      permissions: ['read', 'write'],
      twoFactorEnabled: false,
      loginCount: 234,
      emailVerified: true,
      invitedBy: 'Jane Smith',
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah@abc-corp.com',
      role: 'user',
      status: 'pending',
      createdAt: '2024-12-05T11:20:00Z',
      department: 'HR',
      title: 'HR Specialist',
      permissions: ['read'],
      twoFactorEnabled: false,
      loginCount: 0,
      emailVerified: false,
      invitedBy: 'John Doe',
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david@abc-corp.com',
      role: 'user',
      status: 'suspended',
      lastLoginAt: '2024-11-25T13:10:00Z',
      createdAt: '2024-04-15T16:00:00Z',
      department: 'Finance',
      title: 'Accountant',
      permissions: ['read'],
      twoFactorEnabled: true,
      loginCount: 445,
      emailVerified: true,
      invitedBy: 'Jane Smith',
    },
  ];

  const mockActivities: UserActivity[] = [
    {
      id: '1',
      userId: '1',
      action: 'Giriş yaptı',
      timestamp: '2024-12-07T14:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
    },
    {
      id: '2',
      userId: '2',
      action: 'Profil güncellendi',
      timestamp: '2024-12-07T10:15:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Firefox/121.0',
    },
  ];

  const statusColors = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
    suspended: 'error',
  };

  const roleColors = {
    admin: 'red',
    manager: 'blue',
    user: 'green',
    guest: 'default',
  };

  const columns: ProColumns<TenantUser>[] = [
    {
      title: 'Kullanıcı',
      key: 'user',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#667eea' }}>
            {record.firstName[0]}{record.lastName[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>{record.firstName} {record.lastName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
            {record.department && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.department} • {record.title}
              </Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={roleColors[role as keyof typeof roleColors]} icon={
          role === 'admin' ? <CrownOutlined /> : 
          role === 'manager' ? <TeamOutlined /> : 
          <UserOutlined />
        }>
          {role.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
        { text: 'User', value: 'user' },
      ],
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
              status === 'inactive' ? 'İnaktif' :
              status === 'pending' ? 'Bekliyor' : 'Askıda'
            }
          />
          <Space size="small">
            {record.emailVerified ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} title="E-posta doğrulandı" />
            ) : (
              <ExclamationCircleOutlined style={{ color: '#faad14' }} title="E-posta doğrulanmadı" />
            )}
            {record.twoFactorEnabled && (
              <SafetyOutlined style={{ color: '#1890ff' }} title="2FA aktif" />
            )}
          </Space>
        </Space>
      ),
      filters: [
        { text: 'Aktif', value: 'active' },
        { text: 'İnaktif', value: 'inactive' },
        { text: 'Bekliyor', value: 'pending' },
        { text: 'Askıda', value: 'suspended' },
      ],
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 130,
      render: (date?: string, record) => (
        <Space direction="vertical" size={0}>
          <Text>{date ? dayjs(date).fromNow() : 'Hiç'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.loginCount} giriş
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
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button
              type="text"
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
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleCreate = () => {
    setSelectedUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: TenantUser) => {
    setSelectedUser(user);
    form.setFieldsValue({
      ...user,
      name: `${user.firstName} ${user.lastName}`,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (user: TenantUser) => {
    await Swal.fire({
      title: 'Kullanıcıyı Sil',
      text: `${user.firstName} ${user.lastName} kullanıcısını silmek istediğinize emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sil',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ff4d4f',
    }).then((result) => {
      if (result.isConfirmed) {
        message.success('Kullanıcı başarıyla silindi');
      }
    });
  };

  const handleToggleStatus = async (user: TenantUser) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await Swal.fire({
      icon: 'success',
      title: 'Durum Güncellendi',
      text: `${user.firstName} ${user.lastName} ${newStatus === 'active' ? 'aktifleştirildi' : 'askıya alındı'}.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Lütfen işlem yapmak için kullanıcı seçin');
      return;
    }

    const actionText = {
      'activate': 'aktifleştir',
      'suspend': 'askıya al',
      'delete': 'sil',
      'export': 'dışa aktar',
    }[action];

    await Swal.fire({
      title: `${selectedRowKeys.length} kullanıcıyı ${actionText}?`,
      text: 'Bu işlemi onaylıyor musunuz?',
      icon: action === 'delete' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet',
      cancelButtonText: 'İptal',
      confirmButtonColor: action === 'delete' ? '#ff4d4f' : '#667eea',
    }).then((result) => {
      if (result.isConfirmed) {
        message.success(`${selectedRowKeys.length} kullanıcı için ${action} işlemi tamamlandı`);
        setSelectedRowKeys([]);
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1500));

      await Swal.fire({
        icon: 'success',
        title: selectedUser ? 'Kullanıcı Güncellendi' : 'Kullanıcı Oluşturuldu',
        text: selectedUser ? 
          'Kullanıcı bilgileri başarıyla güncellendi.' : 
          'Yeni kullanıcı oluşturuldu ve davet e-postası gönderildi.',
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

  const UserModal = () => (
    <Modal
      title={selectedUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
      open={isModalVisible}
      onOk={handleModalOk}
      onCancel={() => setIsModalVisible(false)}
      confirmLoading={loading}
      width={700}
      okText={selectedUser ? 'Güncelle' : 'Oluştur'}
      cancelText="İptal"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="Ad"
              rules={[{ required: true, message: 'Ad zorunludur' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Soyad"
              rules={[{ required: true, message: 'Soyad zorunludur' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="E-posta"
              rules={[
                { required: true, message: 'E-posta zorunludur' },
                { type: 'email', message: 'Geçerli bir e-posta giriniz' }
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Telefon"
            >
              <Input prefix={<PhoneOutlined />} placeholder="+90 555 123 4567" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="role"
              label="Rol"
              rules={[{ required: true, message: 'Rol seçimi zorunludur' }]}
            >
              <Select>
                <Option value="admin">Admin</Option>
                <Option value="manager">Manager</Option>
                <Option value="user">User</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="department"
              label="Departman"
            >
              <Select>
                <Option value="IT">IT</Option>
                <Option value="Sales">Sales</Option>
                <Option value="Marketing">Marketing</Option>
                <Option value="HR">HR</Option>
                <Option value="Finance">Finance</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="title"
              label="Ünvan"
            >
              <Input placeholder="Manager, Specialist..." />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="permissions"
          label="İzinler"
          rules={[{ required: true, message: 'En az bir izin seçmelisiniz' }]}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              <Col span={8}><Checkbox value="read">Okuma</Checkbox></Col>
              <Col span={8}><Checkbox value="write">Yazma</Checkbox></Col>
              <Col span={8}><Checkbox value="delete">Silme</Checkbox></Col>
              <Col span={8}><Checkbox value="manage_users">Kullanıcı Yönetimi</Checkbox></Col>
              <Col span={8}><Checkbox value="manage_team">Takım Yönetimi</Checkbox></Col>
              <Col span={8}><Checkbox value="view_reports">Rapor Görüntüleme</Checkbox></Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="twoFactorEnabled" valuePropName="checked">
              <Checkbox>İki faktörlü doğrulamayı zorla</Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="sendWelcomeEmail" valuePropName="checked" initialValue={true}>
              <Checkbox>Hoş geldin e-postası gönder</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {!selectedUser && (
          <Alert
            message="Yeni Kullanıcı"
            description="Kullanıcı oluşturulduktan sonra bir davet e-postası gönderilecektir."
            type="info"
            showIcon
          />
        )}
      </Form>
    </Modal>
  );

  const UserDrawer = () => (
    <Drawer
      title={`Kullanıcı: ${selectedUser?.firstName} ${selectedUser?.lastName}`}
      width={700}
      open={isDrawerVisible}
      onClose={() => setIsDrawerVisible(false)}
      extra={
        <Space>
          <Button icon={<EditOutlined />}>Düzenle</Button>
          <Button icon={<SendOutlined />}>E-posta Gönder</Button>
        </Space>
      }
    >
      {selectedUser && (
        <Tabs defaultActiveKey="details">
          <TabPane tab="Detaylar" key="details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Ad Soyad">
                {selectedUser.firstName} {selectedUser.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="E-posta">
                <Space>
                  {selectedUser.email}
                  {selectedUser.emailVerified ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Telefon">
                {selectedUser.phone || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Rol">
                <Tag color={roleColors[selectedUser.role]} icon={
                  selectedUser.role === 'admin' ? <CrownOutlined /> : 
                  selectedUser.role === 'manager' ? <TeamOutlined /> : 
                  <UserOutlined />
                }>
                  {selectedUser.role.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge
                  status={statusColors[selectedUser.status]}
                  text={
                    selectedUser.status === 'active' ? 'Aktif' :
                    selectedUser.status === 'inactive' ? 'İnaktif' :
                    selectedUser.status === 'pending' ? 'Bekliyor' : 'Askıda'
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label="Departman">
                {selectedUser.department || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ünvan">
                {selectedUser.title || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Son Giriş">
                {selectedUser.lastLoginAt ? 
                  dayjs(selectedUser.lastLoginAt).format('DD.MM.YYYY HH:mm') : 
                  'Hiç giriş yapmamış'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Giriş">
                {selectedUser.loginCount}
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(selectedUser.createdAt).format('DD.MM.YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Davet Eden">
                {selectedUser.invitedBy || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="2FA">
                {selectedUser.twoFactorEnabled ? (
                  <Tag color="green" icon={<SafetyOutlined />}>Aktif</Tag>
                ) : (
                  <Tag color="default">Pasif</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>İzinler</Title>
            <Space wrap>
              {selectedUser.permissions.map(permission => (
                <Tag key={permission} color="blue">
                  {permission.replace('_', ' ').toUpperCase()}
                </Tag>
              ))}
            </Space>
          </TabPane>

          <TabPane tab="Aktivite" key="activity">
            <Timeline
              items={[
                {
                  children: (
                    <div>
                      <Text strong>Giriş yaptı</Text>
                      <br />
                      <Text type="secondary">
                        {dayjs(selectedUser.lastLoginAt).format('DD.MM.YYYY HH:mm')} • 192.168.1.100
                      </Text>
                    </div>
                  ),
                },
                {
                  children: (
                    <div>
                      <Text strong>Profil güncellendi</Text>
                      <br />
                      <Text type="secondary">
                        2 gün önce • Telefon numarası eklendi
                      </Text>
                    </div>
                  ),
                },
                {
                  children: (
                    <div>
                      <Text strong>İlk giriş</Text>
                      <br />
                      <Text type="secondary">
                        {dayjs(selectedUser.createdAt).format('DD.MM.YYYY HH:mm')}
                      </Text>
                    </div>
                  ),
                },
              ]}
            />
          </TabPane>

          <TabPane tab="İstatistikler" key="stats">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Toplam Giriş"
                    value={selectedUser.loginCount}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Hesap Yaşı"
                    value={dayjs().diff(dayjs(selectedUser.createdAt), 'day')}
                    suffix="gün"
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Aylık Aktivite" style={{ marginTop: 16 }}>
              <Progress
                percent={75}
                format={() => '45 giriş'}
                strokeColor="#667eea"
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                Bu ay ortalama 1.5 giriş/gün
              </Text>
            </Card>
          </TabPane>
        </Tabs>
      )}
    </Drawer>
  );

  return (
    <PageContainer
      header={{
        title: 'Kullanıcılar',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Kullanıcılar' },
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
              title="Toplam Kullanıcı"
              value={mockUsers.length}
              prefix={<TeamOutlined style={{ color: '#667eea' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Kullanıcı"
              value={mockUsers.filter(u => u.status === 'active').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bekleyen Davet"
              value={mockUsers.filter(u => u.status === 'pending').length}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bu Ay Giriş"
              value={2782}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  +15%
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Kullanıcılar" key="users">
          <Card>
            {selectedRowKeys.length > 0 && (
              <Alert
                message={`${selectedRowKeys.length} kullanıcı seçildi`}
                action={
                  <Space>
                    <Button size="small" onClick={() => handleBulkAction('activate')}>
                      Aktifleştir
                    </Button>
                    <Button size="small" onClick={() => handleBulkAction('suspend')}>
                      Askıya Al
                    </Button>
                    <Button size="small" onClick={() => handleBulkAction('export')}>
                      Dışa Aktar
                    </Button>
                    <Button size="small" danger onClick={() => handleBulkAction('delete')}>
                      Sil
                    </Button>
                  </Space>
                }
                style={{ marginBottom: 16 }}
                closable
                onClose={() => setSelectedRowKeys([])}
              />
            )}

            <ProTable<TenantUser>
              columns={columns}
              dataSource={mockUsers}
              rowKey="id"
              search={{
                labelWidth: 120,
              }}
              pagination={{
                pageSize: 10,
              }}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
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
                  key="invite"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Kullanıcı Ekle
                </Button>,
              ]}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Roller & İzinler" key="roles">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card title="Admin" extra={<Tag color="red">3 kullanıcı</Tag>}>
                <List
                  size="small"
                  dataSource={['Tüm izinler', 'Kullanıcı yönetimi', 'Sistem ayarları']}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Manager" extra={<Tag color="blue">2 kullanıcı</Tag>}>
                <List
                  size="small"
                  dataSource={['Okuma/Yazma', 'Takım yönetimi', 'Rapor görüntüleme']}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="User" extra={<Tag color="green">5 kullanıcı</Tag>}>
                <List
                  size="small"
                  dataSource={['Okuma', 'Yazma', 'Kendi profil']}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Aktivite Logları" key="activity">
          <Card>
            <Table
              dataSource={mockActivities}
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Kullanıcı',
                  key: 'user',
                  render: (_, record) => {
                    const user = mockUsers.find(u => u.id === record.userId);
                    return user ? `${user.firstName} ${user.lastName}` : 'Bilinmeyen';
                  },
                },
                {
                  title: 'Eylem',
                  dataIndex: 'action',
                  key: 'action',
                },
                {
                  title: 'Zaman',
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                  render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
                },
                {
                  title: 'IP Adresi',
                  dataIndex: 'ipAddress',
                  key: 'ipAddress',
                  render: (ip: string) => <Text code>{ip}</Text>,
                },
                {
                  title: 'Tarayıcı',
                  dataIndex: 'userAgent',
                  key: 'userAgent',
                },
              ]}
            />
          </Card>
        </TabPane>

        <TabPane tab="Ayarlar" key="settings">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Kullanıcı Ayarları">
                <Form layout="vertical">
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>Yeni kullanıcı kaydına izin ver</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>E-posta doğrulaması gerekli</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Switch />
                      <Text>2FA zorunlu</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item label="Maksimum kullanıcı sayısı">
                    <Select defaultValue={500} style={{ width: 150 }}>
                      <Option value={100}>100</Option>
                      <Option value={500}>500</Option>
                      <Option value={1000}>1000</Option>
                      <Option value={-1}>Sınırsız</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Güvenlik Ayarları">
                <Form layout="vertical">
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>Şüpheli giriş bildirimleri</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>Çoklu oturum uyarısı</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item label="Oturum süresi">
                    <Select defaultValue={30} style={{ width: 150 }}>
                      <Option value={15}>15 dakika</Option>
                      <Option value={30}>30 dakika</Option>
                      <Option value={60}>1 saat</Option>
                      <Option value={480}>8 saat</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Max başarısız giriş">
                    <Select defaultValue={5} style={{ width: 150 }}>
                      <Option value={3}>3 deneme</Option>
                      <Option value={5}>5 deneme</Option>
                      <Option value={10}>10 deneme</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      <UserModal />
      <UserDrawer />
    </PageContainer>
  );
};

export default TenantUsers;