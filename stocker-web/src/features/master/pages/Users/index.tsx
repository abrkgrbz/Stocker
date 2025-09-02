import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Dropdown,
  Menu,
  Typography,
  Row,
  Col,
  Statistic,
  Avatar,
  Badge,
  Tooltip,
  message,
  Popconfirm,
  Divider,
  Alert,
  Descriptions,
  Timeline,
  List,
  Tabs,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  SafetyOutlined,
  CalendarOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  CrownOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  GlobalOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import { usersApi, MasterUser, CreateUserRequest, UpdateUserRequest } from '@/shared/api/users.api';
import '../../styles/master-layout.css';
import './users.css';
import CountUp from 'react-countup';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export const MasterUsersPage: React.FC = () => {
  const [users, setUsers] = useState<MasterUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MasterUser | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, searchText, filterRole, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getAll({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
        role: filterRole,
        isActive: filterStatus,
      });

      if (response.data?.success && response.data?.data) {
        const mappedUsers = response.data.data.map((user: any) => ({
          id: user.id,
          username: user.username || user.userName,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role || 'User',
          isActive: user.isActive,
          isTwoFactorEnabled: user.isTwoFactorEnabled || false,
          lastLoginDate: user.lastLoginDate,
          createdDate: user.createdDate || user.createdAt,
          tenantAccess: user.tenantAccess || [],
        }));
        
        setUsers(mappedUsers);
        setPagination(prev => ({
          ...prev,
          total: response.data.totalCount || mappedUsers.length,
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'SuperAdmin': 'purple',
      'Admin': 'red',
      'Support': 'blue',
      'User': 'green',
      'Viewer': 'default',
    };
    return colors[role] || 'default';
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, React.ReactNode> = {
      'SuperAdmin': <CrownOutlined />,
      'Admin': <SafetyOutlined />,
      'Support': <TeamOutlined />,
      'User': <UserOutlined />,
      'Viewer': <EyeOutlined />,
    };
    return icons[role] || <UserOutlined />;
  };

  const stats = [
    {
      title: 'Toplam Kullanıcı',
      value: users.length,
      icon: <TeamOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
      trend: 12,
    },
    {
      title: 'Aktif Kullanıcı',
      value: users.filter(u => u.isActive).length,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
      trend: 8,
    },
    {
      title: 'Admin Kullanıcı',
      value: users.filter(u => u.role === 'Admin' || u.role === 'SuperAdmin').length,
      icon: <SafetyOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1',
      trend: -3,
    },
    {
      title: '2FA Aktif',
      value: users.filter(u => u.isTwoFactorEnabled).length,
      icon: <LockOutlined style={{ color: '#fa8c16' }} />,
      color: '#fa8c16',
      trend: 25,
    },
  ];

  const columns = [
    {
      title: 'Kullanıcı',
      key: 'user',
      render: (record: MasterUser) => (
        <Space>
          <Badge
            dot
            status={record.isActive ? 'success' : 'error'}
            offset={[-5, 5]}
          >
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }}>
              {record.firstName?.[0]}{record.lastName?.[0]}
            </Avatar>
          </Badge>
          <div>
            <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              @{record.username}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          <Text>{email}</Text>
        </Space>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => phone ? (
        <Space>
          <PhoneOutlined />
          <Text>{phone}</Text>
        </Space>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Güvenlik',
      key: 'security',
      render: (record: MasterUser) => (
        <Space>
          {record.isTwoFactorEnabled && (
            <Tooltip title="2FA Aktif">
              <Tag color="green" icon={<LockOutlined />}>
                2FA
              </Tag>
            </Tooltip>
          )}
          {record.tenantAccess && record.tenantAccess.length > 0 && (
            <Tooltip title={`${record.tenantAccess.length} Tenant Erişimi`}>
              <Tag color="blue" icon={<ApartmentOutlined />}>
                {record.tenantAccess.length}
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLoginDate',
      key: 'lastLoginDate',
      render: (date: string) => date ? (
        <Tooltip title={dayjs(date).format('DD MMMM YYYY HH:mm')}>
          <Text type="secondary">{dayjs(date).fromNow()}</Text>
        </Tooltip>
      ) : <Text type="secondary">Hiç giriş yapmadı</Text>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (record: MasterUser) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="view"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
              >
                Detaylar
              </Menu.Item>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Düzenle
              </Menu.Item>
              <Menu.Item
                key="password"
                icon={<KeyOutlined />}
                onClick={() => handleResetPassword(record)}
              >
                Şifre Sıfırla
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                key="toggle"
                icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => handleToggleStatus(record)}
              >
                {record.isActive ? 'Devre Dışı Bırak' : 'Aktif Et'}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(record.id)}
              >
                Sil
              </Menu.Item>
            </Menu>
          }
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleCreate = () => {
    form.resetFields();
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: MasterUser) => {
    setSelectedUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (selectedUser) {
        // Update
        const updateData: UpdateUserRequest = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          role: values.role,
          isActive: values.isActive,
        };
        await usersApi.update(selectedUser.id, updateData);
        message.success('Kullanıcı güncellendi');
      } else {
        // Create
        const createData: CreateUserRequest = {
          username: values.username,
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          role: values.role,
          isActive: values.isActive !== false,
        };
        await usersApi.create(createData);
        message.success('Kullanıcı oluşturuldu');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      message.error(selectedUser ? 'Kullanıcı güncellenemedi' : 'Kullanıcı oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: MasterUser) => {
    try {
      await usersApi.toggleStatus(user.id);
      message.success(`Kullanıcı ${user.isActive ? 'devre dışı bırakıldı' : 'aktif edildi'}`);
      fetchUsers();
    } catch (error) {
      message.error('Durum değiştirilemedi');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Kullanıcıyı Sil',
      content: 'Bu kullanıcıyı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await usersApi.delete(id);
          message.success('Kullanıcı silindi');
          fetchUsers();
        } catch (error) {
          message.error('Kullanıcı silinemedi');
        }
      },
    });
  };

  const handleResetPassword = (user: MasterUser) => {
    setSelectedUser(user);
    passwordForm.resetFields();
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (values: any) => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await usersApi.resetPassword(selectedUser.id, values.newPassword);
      message.success('Şifre başarıyla sıfırlandı');
      setShowPasswordModal(false);
    } catch (error) {
      message.error('Şifre sıfırlanamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user: MasterUser) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  return (
    <div className="master-users-page">
      {/* Header */}
      <motion.div 
        className="users-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="users-header-content">
          <Title level={1}>
            <TeamOutlined /> Kullanıcı Yönetimi
          </Title>
          <Paragraph>Sistem kullanıcılarını yönetin ve yetkilendirin</Paragraph>
        </div>
        <div className="users-header-actions">
          <Button 
            icon={<ExportOutlined />}
            size="large"
          >
            Dışa Aktar
          </Button>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleCreate}
            className="gradient-btn"
            size="large"
          >
            Yeni Kullanıcı
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <Row gutter={[24, 24]} className="users-stats">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="user-stat-card">
                <div className="stat-icon-box" style={{
                  background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`
                }}>
                  {stat.icon}
                </div>
                <div className="stat-value">
                  <CountUp end={stat.value} separator="," duration={2} />
                </div>
                <div className="stat-label">{stat.title}</div>
                {stat.trend && (
                  <div className="stat-trend">
                    <Tag 
                      color={stat.trend > 0 ? 'success' : 'error'}
                      style={{ fontSize: 12 }}
                    >
                      {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend)}%
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      geçen aya göre
                    </Text>
                  </div>
                )}
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card className="filter-card glass-morphism">
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Input
                placeholder="Kullanıcı ara..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                placeholder="Rol"
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: 150 }}
                allowClear
              >
                <Option value="SuperAdmin">Super Admin</Option>
                <Option value="Admin">Admin</Option>
                <Option value="Support">Destek</Option>
                <Option value="User">Kullanıcı</Option>
                <Option value="Viewer">İzleyici</Option>
              </Select>
              <Select
                placeholder="Durum"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 120 }}
                allowClear
              >
                <Option value={true}>Aktif</Option>
                <Option value={false}>Pasif</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              loading={loading}
            >
              Yenile
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="table-card glass-morphism">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Ad"
                rules={[{ required: true, message: 'Ad zorunlu' }]}
              >
                <Input placeholder="Ad" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Soyad"
                rules={[{ required: true, message: 'Soyad zorunlu' }]}
              >
                <Input placeholder="Soyad" />
              </Form.Item>
            </Col>
          </Row>

          {!selectedUser && (
            <Form.Item
              name="username"
              label="Kullanıcı Adı"
              rules={[
                { required: true, message: 'Kullanıcı adı zorunlu' },
                { min: 3, message: 'En az 3 karakter olmalı' },
              ]}
            >
              <Input placeholder="Kullanıcı adı" />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label="E-posta"
            rules={[
              { required: true, message: 'E-posta zorunlu' },
              { type: 'email', message: 'Geçerli bir e-posta girin' },
            ]}
          >
            <Input placeholder="E-posta" />
          </Form.Item>

          {!selectedUser && (
            <Form.Item
              name="password"
              label="Şifre"
              rules={[
                { required: true, message: 'Şifre zorunlu' },
                { min: 6, message: 'En az 6 karakter olmalı' },
              ]}
            >
              <Input.Password
                placeholder="Şifre"
                iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          )}

          <Form.Item
            name="phoneNumber"
            label="Telefon"
          >
            <Input placeholder="Telefon numarası" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Rol"
                rules={[{ required: true, message: 'Rol seçimi zorunlu' }]}
              >
                <Select placeholder="Rol seçin">
                  <Option value="Admin">Admin</Option>
                  <Option value="Support">Destek</Option>
                  <Option value="User">Kullanıcı</Option>
                  <Option value="Viewer">İzleyici</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Durum"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowModal(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedUser ? 'Güncelle' : 'Oluştur'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        title="Şifre Sıfırla"
        open={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        footer={null}
        width={400}
      >
        <Alert
          message={`${selectedUser?.firstName} ${selectedUser?.lastName} kullanıcısının şifresini sıfırlıyorsunuz`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
        >
          <Form.Item
            name="newPassword"
            label="Yeni Şifre"
            rules={[
              { required: true, message: 'Şifre zorunlu' },
              { min: 6, message: 'En az 6 karakter olmalı' },
            ]}
          >
            <Input.Password
              placeholder="Yeni şifre"
              iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Şifre Tekrar"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Şifre tekrarı zorunlu' },
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
            <Input.Password
              placeholder="Şifre tekrar"
              iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowPasswordModal(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Şifreyi Sıfırla
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title="Kullanıcı Detayları"
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailsModal(false)}>
            Kapat
          </Button>,
        ]}
        width={700}
      >
        {selectedUser && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Genel Bilgiler" key="1">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Ad Soyad" span={2}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Kullanıcı Adı">
                  @{selectedUser.username}
                </Descriptions.Item>
                <Descriptions.Item label="Rol">
                  <Tag color={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="E-posta">
                  {selectedUser.email}
                </Descriptions.Item>
                <Descriptions.Item label="Telefon">
                  {selectedUser.phoneNumber || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={selectedUser.isActive ? 'success' : 'error'}>
                    {selectedUser.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="2FA">
                  <Tag color={selectedUser.isTwoFactorEnabled ? 'success' : 'default'}>
                    {selectedUser.isTwoFactorEnabled ? 'Aktif' : 'Pasif'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Kayıt Tarihi" span={2}>
                  {dayjs(selectedUser.createdDate).format('DD MMMM YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Son Giriş" span={2}>
                  {selectedUser.lastLoginDate
                    ? dayjs(selectedUser.lastLoginDate).format('DD MMMM YYYY HH:mm')
                    : 'Henüz giriş yapmadı'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="Tenant Erişimleri" key="2">
              {selectedUser.tenantAccess && selectedUser.tenantAccess.length > 0 ? (
                <List
                  dataSource={selectedUser.tenantAccess}
                  renderItem={(tenant) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<ApartmentOutlined />}
                        title={tenant}
                        description="Erişim yetkisi var"
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Alert
                  message="Tenant Erişimi Yok"
                  description="Bu kullanıcının herhangi bir tenant'a erişimi bulunmuyor."
                  type="info"
                  showIcon
                />
              )}
            </TabPane>
            
            <TabPane tab="İşlem Geçmişi" key="3">
              <Timeline>
                <Timeline.Item color="green">
                  Hesap oluşturuldu - {dayjs(selectedUser.createdDate).format('DD MMMM YYYY')}
                </Timeline.Item>
                {selectedUser.lastLoginDate && (
                  <Timeline.Item color="blue">
                    Son giriş - {dayjs(selectedUser.lastLoginDate).fromNow()}
                  </Timeline.Item>
                )}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};