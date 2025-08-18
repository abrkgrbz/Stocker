import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  Row,
  Col,
  Avatar,
  Dropdown,
  message,
  Tooltip,
  Badge,
  Switch,
  Divider,
  Typography,
  Descriptions,
  Alert,
  Popconfirm,
  Timeline,
  Tabs,
  List,
  Statistic,
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  SafetyOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable } from '@/shared/components/DataTable';
import { formatDate, formatPhoneNumber } from '@/shared/utils/formatters';
import { formRules } from '@/shared/utils/validators';
import type { ColumnsType } from 'antd/es/table';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  department?: string;
  title?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
  permissions?: string[];
}

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  department?: string;
  title?: string;
  password?: string;
  confirmPassword?: string;
  sendWelcomeEmail?: boolean;
}

export const TenantUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@company.com',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      fullName: 'Ahmet Yılmaz',
      phoneNumber: '+90 532 111 2233',
      role: 'Admin',
      department: 'Yönetim',
      title: 'Genel Müdür',
      isActive: true,
      emailVerified: true,
      lastLogin: '2024-01-15T10:30:00',
      createdAt: '2023-06-01T00:00:00',
      permissions: ['users.create', 'users.edit', 'users.delete', 'invoices.*', 'settings.*'],
    },
    {
      id: '2',
      email: 'muhasebe@company.com',
      firstName: 'Ayşe',
      lastName: 'Demir',
      fullName: 'Ayşe Demir',
      phoneNumber: '+90 533 444 5566',
      role: 'Accountant',
      department: 'Muhasebe',
      title: 'Muhasebe Uzmanı',
      isActive: true,
      emailVerified: true,
      lastLogin: '2024-01-15T09:15:00',
      createdAt: '2023-07-15T00:00:00',
      permissions: ['invoices.*', 'reports.view'],
    },
    {
      id: '3',
      email: 'satis@company.com',
      firstName: 'Mehmet',
      lastName: 'Kaya',
      fullName: 'Mehmet Kaya',
      phoneNumber: '+90 534 777 8899',
      role: 'Sales',
      department: 'Satış',
      title: 'Satış Temsilcisi',
      isActive: true,
      emailVerified: false,
      lastLogin: '2024-01-14T16:45:00',
      createdAt: '2023-09-01T00:00:00',
      permissions: ['customers.*', 'orders.create', 'orders.view'],
    },
    {
      id: '4',
      email: 'depo@company.com',
      firstName: 'Fatma',
      lastName: 'Öz',
      fullName: 'Fatma Öz',
      phoneNumber: '+90 535 222 3344',
      role: 'Staff',
      department: 'Depo',
      title: 'Depo Sorumlusu',
      isActive: false,
      emailVerified: true,
      lastLogin: '2024-01-10T11:20:00',
      createdAt: '2023-10-01T00:00:00',
      permissions: ['inventory.*'],
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // API çağrısı yapılacak
      // const response = await userService.getTenantUsers();
      // setUsers(response.data);
      
      // Mock data kullan
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Kullanıcılar yüklenemedi');
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      sendWelcomeEmail: false,
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // await userService.deleteUser(userId);
      message.success('Kullanıcı silindi');
      fetchUsers();
    } catch (error) {
      message.error('Kullanıcı silinemedi');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // await userService.toggleUserStatus(userId, isActive);
      message.success(isActive ? 'Kullanıcı aktifleştirildi' : 'Kullanıcı pasifleştirildi');
      fetchUsers();
    } catch (error) {
      message.error('İşlem başarısız');
    }
  };

  const handleResetPassword = async (values: any) => {
    try {
      // await userService.resetUserPassword(selectedUser?.id, values.newPassword);
      message.success('Şifre güncellendi');
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('Şifre güncellenemedi');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        // await userService.updateUser(editingUser.id, values);
        message.success('Kullanıcı güncellendi');
      } else {
        // await userService.createUser(values);
        message.success('Kullanıcı oluşturuldu');
        
        if (values.sendWelcomeEmail) {
          message.info('Hoşgeldin e-postası gönderildi');
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      // Handle form validation error silently
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalVisible(true);
  };

  const handlePasswordModal = (user: User) => {
    setSelectedUser(user);
    passwordForm.resetFields();
    setIsPasswordModalVisible(true);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      Admin: 'red',
      Accountant: 'blue',
      Sales: 'green',
      Staff: 'default',
      Manager: 'purple',
    };
    return colors[role] || 'default';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge status="success" text="Aktif" />
    ) : (
      <Badge status="error" text="Pasif" />
    );
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Kullanıcı',
      key: 'user',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <Space>
          <Avatar 
            size={40} 
            style={{ backgroundColor: '#667eea' }}
            icon={<UserOutlined />}
          >
            {record.firstName[0]}{record.lastName[0]}
          </Avatar>
          <div>
            <div>
              <Text strong>{record.fullName}</Text>
              {!record.emailVerified && (
                <Tooltip title="E-posta doğrulanmamış">
                  <ExclamationCircleOutlined style={{ color: '#faad14', marginLeft: 8 }} />
                </Tooltip>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Muhasebe', value: 'Accountant' },
        { text: 'Satış', value: 'Sales' },
        { text: 'Personel', value: 'Staff' },
      ],
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role === 'Admin' ? 'Yönetici' :
           role === 'Accountant' ? 'Muhasebe' :
           role === 'Sales' ? 'Satış' :
           role === 'Staff' ? 'Personel' : role}
        </Tag>
      ),
    },
    {
      title: 'Departman',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: (department) => department || '-',
    },
    {
      title: 'Ünvan',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      ellipsis: true,
      render: (title) => title || '-',
    },
    {
      title: 'Telefon',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 140,
      render: (phone) => formatPhoneNumber(phone) || '-',
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
      sorter: true,
      render: (date) => date ? (
        <Tooltip title={formatDate(date, 'DD.MM.YYYY HH:mm')}>
          {formatDate(date, 'DD.MM.YYYY')}
        </Tooltip>
      ) : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      render: (isActive) => getStatusBadge(isActive),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            label: 'Detayları Gör',
            icon: <EyeOutlined />,
            onClick: () => handleViewDetails(record),
          },
          {
            key: 'edit',
            label: 'Düzenle',
            icon: <EditOutlined />,
            onClick: () => handleEditUser(record),
          },
          {
            key: 'password',
            label: 'Şifre Değiştir',
            icon: <KeyOutlined />,
            onClick: () => handlePasswordModal(record),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'toggle',
            label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
            icon: record.isActive ? <LockOutlined /> : <UnlockOutlined />,
            onClick: () => handleToggleUserStatus(record.id, !record.isActive),
          },
          {
            key: 'delete',
            label: 'Sil',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Kullanıcıyı Sil',
                content: `${record.fullName} adlı kullanıcıyı silmek istediğinizden emin misiniz?`,
                okText: 'Sil',
                cancelText: 'İptal',
                okType: 'danger',
                onOk: () => handleDeleteUser(record.id),
              });
            },
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
                          (selectedStatus === 'active' ? user.isActive : !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="tenant-users-page">
      <PageHeader
        title="Kullanıcı Yönetimi"
        subtitle={`Toplam ${users.length} kullanıcı`}
        breadcrumbs={[
          { title: 'Ana Sayfa', path: '/app/tenant' },
          { title: 'Kullanıcılar' },
        ]}
        extra={
          <Space>
            <Button icon={<DownloadOutlined />}>
              Dışa Aktar
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleCreateUser}
            >
              Yeni Kullanıcı
            </Button>
          </Space>
        }
      />

      {/* İstatistikler */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Kullanıcı"
              value={users.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Aktif Kullanıcı"
              value={users.filter(u => u.isActive).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Yönetici"
              value={users.filter(u => u.role === 'Admin').length}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Son 7 Gün Giriş"
              value={users.filter(u => {
                if (!u.lastLogin) return false;
                const lastLogin = new Date(u.lastLogin);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return lastLogin > weekAgo;
              }).length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtreler */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Ad, soyad veya email ile ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Rol Seçin"
              value={selectedRole}
              onChange={setSelectedRole}
            >
              <Option value="all">Tüm Roller</Option>
              <Option value="Admin">Yönetici</Option>
              <Option value="Accountant">Muhasebe</Option>
              <Option value="Sales">Satış</Option>
              <Option value="Staff">Personel</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Durum Seçin"
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="all">Tüm Durumlar</Option>
              <Option value="active">Aktif</Option>
              <Option value="inactive">Pasif</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Kullanıcı Tablosu */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kullanıcı`,
          }}
        />
      </Card>

      {/* Kullanıcı Oluştur/Düzenle Modal */}
      <Modal
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
        okText={editingUser ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            role: 'Staff',
            isActive: true,
            sendWelcomeEmail: true,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Ad"
                rules={[formRules.required('Ad zorunludur')]}
              >
                <Input placeholder="Ad" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Soyad"
                rules={[formRules.required('Soyad zorunludur')]}
              >
                <Input placeholder="Soyad" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="E-posta"
                rules={[
                  formRules.required('E-posta zorunludur'),
                  formRules.email('Geçerli bir e-posta giriniz'),
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="ornek@email.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Telefon"
                rules={[formRules.phone()]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="+90 5XX XXX XX XX" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Rol"
                rules={[formRules.required('Rol zorunludur')]}
              >
                <Select>
                  <Option value="Admin">Yönetici</Option>
                  <Option value="Accountant">Muhasebe</Option>
                  <Option value="Sales">Satış</Option>
                  <Option value="Staff">Personel</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Departman">
                <Input placeholder="Departman" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="title" label="Ünvan">
            <Input placeholder="Ünvan" />
          </Form.Item>

          {!editingUser && (
            <>
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Şifre"
                    rules={[
                      formRules.required('Şifre zorunludur'),
                      formRules.min(8, 'En az 8 karakter olmalıdır'),
                    ]}
                  >
                    <Input.Password placeholder="Şifre" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Şifre Tekrar"
                    dependencies={['password']}
                    rules={[
                      formRules.required('Şifre tekrarı zorunludur'),
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Şifreler eşleşmiyor'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Şifre Tekrar" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="sendWelcomeEmail" valuePropName="checked">
                <Switch /> Hoşgeldin e-postası gönder
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* Şifre Değiştir Modal */}
      <Modal
        title="Şifre Değiştir"
        open={isPasswordModalVisible}
        onOk={() => passwordForm.submit()}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        okText="Değiştir"
        cancelText="İptal"
      >
        <Alert
          message={`${selectedUser?.fullName} için yeni şifre belirleyin`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="newPassword"
            label="Yeni Şifre"
            rules={[
              formRules.required('Yeni şifre zorunludur'),
              formRules.min(8, 'En az 8 karakter olmalıdır'),
            ]}
          >
            <Input.Password placeholder="Yeni şifre" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Yeni Şifre Tekrar"
            dependencies={['newPassword']}
            rules={[
              formRules.required('Şifre tekrarı zorunludur'),
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Şifreler eşleşmiyor'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Yeni şifre tekrar" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Kullanıcı Detay Modal */}
      <Modal
        title="Kullanıcı Detayları"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Kapat
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsDetailModalVisible(false);
              handleEditUser(selectedUser!);
            }}
          >
            Düzenle
          </Button>,
        ]}
        width={700}
      >
        {selectedUser && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Genel Bilgiler" key="1">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Ad Soyad" span={2}>
                  <Space>
                    <Avatar style={{ backgroundColor: '#667eea' }}>
                      {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                    </Avatar>
                    {selectedUser.fullName}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="E-posta">
                  {selectedUser.email}
                  {selectedUser.emailVerified ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                  ) : (
                    <ExclamationCircleOutlined style={{ color: '#faad14', marginLeft: 8 }} />
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Telefon">
                  {formatPhoneNumber(selectedUser.phoneNumber) || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Rol">
                  <Tag color={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Departman">
                  {selectedUser.department || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Ünvan">
                  {selectedUser.title || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  {getStatusBadge(selectedUser.isActive)}
                </Descriptions.Item>
                <Descriptions.Item label="Kayıt Tarihi">
                  {formatDate(selectedUser.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Son Giriş">
                  {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin, 'DD.MM.YYYY HH:mm') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="Yetkiler" key="2">
              <Title level={5}>Rol Yetkileri</Title>
              <List
                dataSource={selectedUser.permissions || []}
                renderItem={(permission) => (
                  <List.Item>
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>{permission}</Text>
                    </Space>
                  </List.Item>
                )}
                locale={{ emptyText: 'Yetki tanımlanmamış' }}
              />
            </TabPane>

            <TabPane tab="Aktivite Geçmişi" key="3">
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <>
                        <Text strong>Son giriş yapıldı</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin, 'DD.MM.YYYY HH:mm') : '-'}
                          </Text>
                        </div>
                      </>
                    ),
                  },
                  {
                    color: 'blue',
                    children: (
                      <>
                        <Text strong>Profil güncellendi</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            10.01.2024 14:30
                          </Text>
                        </div>
                      </>
                    ),
                  },
                  {
                    color: 'gray',
                    children: (
                      <>
                        <Text strong>Hesap oluşturuldu</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDate(selectedUser.createdAt)}
                          </Text>
                        </div>
                      </>
                    ),
                  },
                ]}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default TenantUsers;