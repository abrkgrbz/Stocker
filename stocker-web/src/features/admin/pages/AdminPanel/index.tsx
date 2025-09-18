import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Card, 
  Table, 
  Button, 
  Space, 
  Avatar, 
  Tag, 
  Typography,
  Breadcrumb,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Tooltip,
  Dropdown,
  Divider
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Text } = Typography;
const { Content, Sider } = Layout;
const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  modules: string[];
  createdAt: string;
}

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Mock data for development
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Ali Yılmaz',
      email: 'ali@company.com',
      role: 'Yönetici',
      department: 'Satış',
      isActive: true,
      lastLogin: '2024-01-15 14:30',
      modules: ['sales', 'crm', 'finance'],
      createdAt: '2023-12-01'
    },
    {
      id: '2',
      name: 'Ayşe Demir',
      email: 'ayse@company.com',
      role: 'Kullanıcı',
      department: 'Muhasebe',
      isActive: true,
      lastLogin: '2024-01-15 09:15',
      modules: ['finance', 'reports'],
      createdAt: '2023-12-15'
    },
    {
      id: '3',
      name: 'Mehmet Kaya',
      email: 'mehmet@company.com',
      role: 'Kullanıcı',
      department: 'Depo',
      isActive: false,
      lastLogin: '2024-01-10 16:45',
      modules: ['inventory'],
      createdAt: '2024-01-05'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // const response = await api.get('/api/admin/users');
      // setUsers(response.data);
      
      // For development, use mock data
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error('Kullanıcılar yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: 'Kullanıcıyı Sil',
      content: 'Bu kullanıcıyı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          // API call to delete user
          setUsers(users.filter(u => u.id !== userId));
          message.success('Kullanıcı silindi');
        } catch (error) {
          message.error('Kullanıcı silinirken hata oluştu');
        }
      }
    });
  };

  const handleSaveUser = async (values: any) => {
    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = { ...editingUser, ...values };
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
        message.success('Kullanıcı güncellendi');
      } else {
        // Add new user
        const newUser: User = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setUsers([...users, newUser]);
        message.success('Kullanıcı eklendi');
      }
      setUserModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('İşlem sırasında hata oluştu');
    }
  };

  const columns = [
    {
      title: 'Kullanıcı',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#667eea' }}>
            {record.name.charAt(0)}
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
      render: (role: string) => (
        <Tag color={role === 'Yönetici' ? 'gold' : 'blue'}>
          {role === 'Yönetici' && <SafetyCertificateOutlined />}
          {' '}{role}
        </Tag>
      )
    },
    {
      title: 'Departman',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Modüller',
      key: 'modules',
      render: (record: User) => (
        <Space size={[0, 8]} wrap>
          {record.modules.map(module => (
            <Tag key={module} color="purple">{module}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Durum',
      key: 'status',
      render: (record: User) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          {' '}{record.isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      )
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => date || 'Henüz giriş yapmadı'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUser(record.id)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'resetPassword',
                  icon: <LockOutlined />,
                  label: 'Şifreyi Sıfırla'
                },
                {
                  key: 'sendEmail',
                  icon: <MailOutlined />,
                  label: 'E-posta Gönder'
                },
                {
                  type: 'divider'
                },
                {
                  key: 'viewLogs',
                  icon: <CalendarOutlined />,
                  label: 'Aktivite Logları'
                }
              ]
            }}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  return (
    <Layout className="admin-panel-layout">
      <Sider width={250} className="admin-sider">
        <div className="admin-sider-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ marginBottom: 16 }}
          >
            Ana Sayfaya Dön
          </Button>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onSelect={({ key }) => setSelectedMenu(key)}
          items={[
            {
              key: 'users',
              icon: <TeamOutlined />,
              label: 'Kullanıcılar'
            },
            {
              key: 'roles',
              icon: <SafetyCertificateOutlined />,
              label: 'Roller ve Yetkiler'
            },
            {
              key: 'modules',
              icon: <AppstoreOutlined />,
              label: 'Modül Yönetimi'
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Sistem Ayarları'
            }
          ]}
        />
      </Sider>

      <Layout>
        <Content className="admin-content">
          <div className="admin-header">
            <Breadcrumb items={[
              { title: 'Yönetim Paneli' },
              { title: 'Kullanıcılar' }
            ]} />
            
            <Title level={2}>
              <TeamOutlined /> Kullanıcı Yönetimi
            </Title>
            
            <Text type="secondary">
              Sistemdeki kullanıcıları yönetin, roller atayın ve modül erişimlerini düzenleyin.
            </Text>
          </div>

          <Card className="admin-card">
            <div className="admin-card-header">
              <Space>
                <Badge count={users.length} style={{ backgroundColor: '#52c41a' }}>
                  <Text strong>Toplam Kullanıcı</Text>
                </Badge>
              </Space>
              
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddUser}
              >
                Yeni Kullanıcı Ekle
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Content>
      </Layout>

      {/* User Modal */}
      <Modal
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveUser}
        >
          <Form.Item
            name="name"
            label="Ad Soyad"
            rules={[{ required: true, message: 'Ad soyad gereklidir' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ad Soyad" />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-posta"
            rules={[
              { required: true, message: 'E-posta gereklidir' },
              { type: 'email', message: 'Geçerli bir e-posta girin' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="E-posta" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Rol seçimi gereklidir' }]}
          >
            <Select placeholder="Rol Seçin">
              <Option value="Yönetici">Yönetici</Option>
              <Option value="Kullanıcı">Kullanıcı</Option>
              <Option value="Misafir">Misafir</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Departman"
          >
            <Input prefix={<SolutionOutlined />} placeholder="Departman" />
          </Form.Item>

          <Form.Item
            name="modules"
            label="Modül Erişimleri"
            rules={[{ required: true, message: 'En az bir modül seçmelisiniz' }]}
          >
            <Select mode="multiple" placeholder="Modülleri Seçin">
              <Option value="sales">Satış Yönetimi</Option>
              <Option value="crm">CRM</Option>
              <Option value="inventory">Stok Yönetimi</Option>
              <Option value="finance">Finans</Option>
              <Option value="reports">Raporlar</Option>
              <Option value="settings">Ayarlar</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Aktif"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setUserModalVisible(false)}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Güncelle' : 'Ekle'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};