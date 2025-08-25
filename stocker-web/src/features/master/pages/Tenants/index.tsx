import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Typography,
  Input,
  Select,
  DatePicker,
  Dropdown,
  Modal,
  Form,
  Switch,
  Badge,
  Tooltip,
  Divider,
  Tabs,
  Statistic,
  Progress,
  Timeline,
  List,
  message,
  notification,
  Drawer,
  Segmented,
  Empty,
  Result,
  Alert,
  Popconfirm,
  Upload,
  Radio,
  Checkbox,
  InputNumber,
  Skeleton,
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  LockOutlined,
  UnlockOutlined,
  LoginOutlined,
  SettingOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  CalendarOutlined,
  DollarOutlined,
  CrownOutlined,
  FireOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ApiOutlined,
  AppstoreOutlined,
  BarsOutlined,
  CopyOutlined,
  DownloadOutlined,
  SyncOutlined,
  StarOutlined,
  HeartOutlined,
  CommentOutlined,
  ShareAltOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  BellOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie, TinyLine, TinyColumn, Progress as TinyProgress } from '@ant-design/plots';
import CountUp from 'react-countup';
// import './styles.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Meta } = Card;
const { Option } = Select;

// Types
interface Tenant {
  id: string;
  name: string;
  domain: string;
  email: string;
  phone: string;
  plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  status: 'active' | 'suspended' | 'pending' | 'expired';
  userCount: number;
  maxUsers: number;
  storageUsed: number;
  maxStorage: number;
  createdAt: string;
  expiresAt: string;
  lastLogin: string;
  revenue: number;
  growth: number;
  modules: string[];
  features: string[];
  owner: {
    name: string;
    email: string;
    avatar?: string;
  };
  performance: {
    cpu: number;
    memory: number;
    requests: number;
    errors: number;
  };
}

interface TenantCardProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onLoginAs: (tenant: Tenant) => void;
  onViewDetails: (tenant: Tenant) => void;
}

export const MasterTenantsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [form] = Form.useForm();

  // Mock data
  const mockTenants: Tenant[] = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      domain: 'techcorp.stoocker.app',
      email: 'admin@techcorp.com',
      phone: '+90 555 123 4567',
      plan: 'Enterprise',
      status: 'active',
      userCount: 245,
      maxUsers: 500,
      storageUsed: 75,
      maxStorage: 100,
      createdAt: '2024-01-15',
      expiresAt: '2025-01-15',
      lastLogin: '2 saat önce',
      revenue: 45000,
      growth: 15,
      modules: ['CRM', 'Sales', 'Finance', 'HR'],
      features: ['API Access', 'Custom Domain', 'Priority Support'],
      owner: {
        name: 'John Doe',
        email: 'john@techcorp.com',
        avatar: undefined,
      },
      performance: {
        cpu: 45,
        memory: 68,
        requests: 12450,
        errors: 3,
      },
    },
    {
      id: '2',
      name: 'Digital Dynamics',
      domain: 'digital.stoocker.app',
      email: 'info@digital.com',
      phone: '+90 555 987 6543',
      plan: 'Professional',
      status: 'active',
      userCount: 89,
      maxUsers: 100,
      storageUsed: 32,
      maxStorage: 50,
      createdAt: '2024-02-20',
      expiresAt: '2025-02-20',
      lastLogin: '1 gün önce',
      revenue: 18500,
      growth: -5,
      modules: ['CRM', 'Sales'],
      features: ['API Access'],
      owner: {
        name: 'Jane Smith',
        email: 'jane@digital.com',
      },
      performance: {
        cpu: 32,
        memory: 45,
        requests: 5670,
        errors: 12,
      },
    },
    {
      id: '3',
      name: 'StartupHub',
      domain: 'startup.stoocker.app',
      email: 'hello@startup.com',
      phone: '+90 555 456 7890',
      plan: 'Starter',
      status: 'pending',
      userCount: 12,
      maxUsers: 25,
      storageUsed: 8,
      maxStorage: 10,
      createdAt: '2024-03-10',
      expiresAt: '2025-03-10',
      lastLogin: '3 gün önce',
      revenue: 4500,
      growth: 22,
      modules: ['CRM'],
      features: [],
      owner: {
        name: 'Mike Johnson',
        email: 'mike@startup.com',
      },
      performance: {
        cpu: 15,
        memory: 22,
        requests: 890,
        errors: 0,
      },
    },
    {
      id: '4',
      name: 'CloudFirst Inc',
      domain: 'cloudfirst.stoocker.app',
      email: 'contact@cloudfirst.com',
      phone: '+90 555 321 6547',
      plan: 'Enterprise',
      status: 'suspended',
      userCount: 156,
      maxUsers: 500,
      storageUsed: 85,
      maxStorage: 100,
      createdAt: '2023-12-01',
      expiresAt: '2024-12-01',
      lastLogin: '1 hafta önce',
      revenue: 38000,
      growth: -12,
      modules: ['CRM', 'Sales', 'Finance', 'HR', 'Production'],
      features: ['API Access', 'Custom Domain', 'Priority Support', 'White Label'],
      owner: {
        name: 'Sarah Williams',
        email: 'sarah@cloudfirst.com',
      },
      performance: {
        cpu: 78,
        memory: 82,
        requests: 18900,
        errors: 45,
      },
    },
  ];

  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);

  // Stats cards
  const stats = [
    {
      title: 'Toplam Tenant',
      value: tenants.length,
      icon: <TeamOutlined />,
      color: '#1890ff',
      trend: 12,
      suffix: '',
    },
    {
      title: 'Aktif Tenant',
      value: tenants.filter(t => t.status === 'active').length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      trend: 8,
      suffix: '',
    },
    {
      title: 'Toplam Kullanıcı',
      value: tenants.reduce((sum, t) => sum + t.userCount, 0),
      icon: <UserOutlined />,
      color: '#722ed1',
      trend: 15,
      suffix: '',
    },
    {
      title: 'Aylık Gelir',
      value: tenants.reduce((sum, t) => sum + t.revenue, 0),
      icon: <DollarOutlined />,
      color: '#fa8c16',
      trend: 22,
      prefix: '₺',
    },
  ];

  // Plan colors and icons
  const planConfig = {
    Free: { color: '#8c8c8c', icon: <UserOutlined />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    Starter: { color: '#52c41a', icon: <RocketOutlined />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    Professional: { color: '#1890ff', icon: <ThunderboltOutlined />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    Enterprise: { color: '#722ed1', icon: <CrownOutlined />, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  };

  // Status config
  const statusConfig = {
    active: { color: 'success', text: 'Aktif', icon: <CheckCircleOutlined /> },
    suspended: { color: 'error', text: 'Askıda', icon: <CloseCircleOutlined /> },
    pending: { color: 'warning', text: 'Bekliyor', icon: <ClockCircleOutlined /> },
    expired: { color: 'default', text: 'Süresi Dolmuş', icon: <InfoCircleOutlined /> },
  };

  // Tenant Card Component
  const TenantCard: React.FC<TenantCardProps> = ({
    tenant,
    onEdit,
    onDelete,
    onToggleStatus,
    onLoginAs,
    onViewDetails,
  }) => {
    const planInfo = planConfig[tenant.plan];
    const statusInfo = statusConfig[tenant.status];

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className="tenant-card glass-morphism"
          size="small"
          style={{
            background: `linear-gradient(135deg, white 0%, ${planInfo.color}08 100%)`,
            borderTop: `3px solid ${planInfo.color}`,
            height: '100%',
          }}
          actions={[
            <Tooltip title="Detaylar">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onViewDetails(tenant)}
              />
            </Tooltip>,
            <Tooltip title="Düzenle">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(tenant)}
              />
            </Tooltip>,
            <Tooltip title={tenant.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}>
              <Button
                type="text"
                icon={tenant.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => onToggleStatus(tenant.id)}
              />
            </Tooltip>,
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'login',
                    label: 'Tenant Olarak Giriş',
                    icon: <LoginOutlined />,
                    onClick: () => onLoginAs(tenant),
                  },
                  {
                    key: 'copy',
                    label: 'Domain Kopyala',
                    icon: <CopyOutlined />,
                    onClick: () => {
                      navigator.clipboard.writeText(tenant.domain);
                      message.success('Domain kopyalandı');
                    },
                  },
                  { type: 'divider' },
                  {
                    key: 'delete',
                    label: 'Sil',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => onDelete(tenant.id),
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>,
          ]}
        >
          {/* Header */}
          <div className="tenant-card-header">
            <Avatar
              size={48}
              style={{
                background: planInfo.gradient,
                border: `2px solid ${planInfo.color}20`,
              }}
            >
              {tenant.name.substring(0, 2).toUpperCase()}
            </Avatar>
            <div className="tenant-info" style={{ flex: 1, minWidth: 0 }}>
              <Title level={5} style={{ margin: 0, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tenant.name}
              </Title>
              <Space size={2} style={{ marginTop: 4 }}>
                <Tag color={planInfo.color} style={{ margin: 0, fontSize: 10 }}>
                  {tenant.plan}
                </Tag>
                <Tag color={statusInfo.color} style={{ margin: 0, fontSize: 10 }}>
                  {statusInfo.text === 'Aktif' ? 'Aktif' : 'Askıda'}
                </Tag>
              </Space>
            </div>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* Stats */}
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Statistic
                title="Kullanıcı"
                value={tenant.userCount}
                suffix={`/ ${tenant.maxUsers}`}
                prefix={<UserOutlined />}
                valueStyle={{ fontSize: 14 }}
              />
              <Progress
                percent={(tenant.userCount / tenant.maxUsers) * 100}
                size="small"
                showInfo={false}
                strokeColor={planInfo.color}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Depolama"
                value={tenant.storageUsed}
                suffix={`GB / ${tenant.maxStorage}GB`}
                prefix={<DatabaseOutlined />}
                valueStyle={{ fontSize: 14 }}
              />
              <Progress
                percent={(tenant.storageUsed / tenant.maxStorage) * 100}
                size="small"
                showInfo={false}
                strokeColor={
                  (tenant.storageUsed / tenant.maxStorage) * 100 > 80
                    ? '#ff4d4f'
                    : planInfo.color
                }
              />
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0' }} />

          {/* Info */}
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div className="info-item">
              <GlobalOutlined />
              <Text type="secondary">{tenant.domain}</Text>
            </div>
            <div className="info-item">
              <MailOutlined />
              <Text type="secondary">{tenant.email}</Text>
            </div>
            <div className="info-item">
              <CalendarOutlined />
              <Text type="secondary">Son giriş: {tenant.lastLogin}</Text>
            </div>
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          {/* Revenue & Growth */}
          <Row gutter={16}>
            <Col span={12}>
              <div className="metric-box">
                <Text type="secondary">Gelir</Text>
                <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
                  ₺<CountUp end={tenant.revenue} separator="," />
                </Title>
              </div>
            </Col>
            <Col span={12}>
              <div className="metric-box">
                <Text type="secondary">Büyüme</Text>
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    color: tenant.growth > 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {tenant.growth > 0 ? '+' : ''}
                  {tenant.growth}%
                </Title>
              </div>
            </Col>
          </Row>

          {/* Modules */}
          <div className="modules-section" style={{ marginTop: 12 }}>
            <Space size={[4, 4]} wrap style={{ display: 'flex', flexWrap: 'wrap' }}>
              {tenant.modules.slice(0, 3).map((module) => (
                <Tag key={module} color="blue" style={{ margin: 0, fontSize: 11 }}>
                  {module}
                </Tag>
              ))}
              {tenant.modules.length > 3 && (
                <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
                  +{tenant.modules.length - 3}
                </Tag>
              )}
            </Space>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Table columns
  const columns = [
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 250,
      render: (text: string, record: Tenant) => (
        <Space>
          <Avatar style={{ backgroundColor: planConfig[record.plan].color }}>
            {text.substring(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.domain}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      width: 120,
      render: (plan: Tenant['plan']) => (
        <Tag color={planConfig[plan].color} icon={planConfig[plan].icon}>
          {plan}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: Tenant['status']) => (
        <Tag color={statusConfig[status].color} icon={statusConfig[status].icon}>
          {statusConfig[status].text}
        </Tag>
      ),
    },
    {
      title: 'Kullanıcılar',
      key: 'users',
      width: 150,
      render: (record: Tenant) => (
        <Space direction="vertical" size={0}>
          <Text>{record.userCount} / {record.maxUsers}</Text>
          <Progress
            percent={(record.userCount / record.maxUsers) * 100}
            size="small"
            showInfo={false}
          />
        </Space>
      ),
    },
    {
      title: 'Depolama',
      key: 'storage',
      width: 150,
      render: (record: Tenant) => (
        <Space direction="vertical" size={0}>
          <Text>{record.storageUsed}GB / {record.maxStorage}GB</Text>
          <Progress
            percent={(record.storageUsed / record.maxStorage) * 100}
            size="small"
            showInfo={false}
            strokeColor={
              (record.storageUsed / record.maxStorage) * 100 > 80 ? '#ff4d4f' : undefined
            }
          />
        </Space>
      ),
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 120,
      render: (revenue: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₺{revenue.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Büyüme',
      dataIndex: 'growth',
      key: 'growth',
      width: 100,
      render: (growth: number) => (
        <Tag color={growth > 0 ? 'success' : 'error'}>
          {growth > 0 ? '+' : ''}{growth}%
        </Tag>
      ),
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 120,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (record: Tenant) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
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
                  key: 'login',
                  label: 'Tenant Olarak Giriş',
                  icon: <LoginOutlined />,
                },
                {
                  key: 'toggle',
                  label: record.status === 'active' ? 'Askıya Al' : 'Aktifleştir',
                  icon: record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />,
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Sil',
                  icon: <DeleteOutlined />,
                  danger: true,
                },
              ],
              onClick: ({ key }) => handleTableAction(key, record),
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Handlers
  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    form.setFieldsValue(tenant);
    setShowCreateModal(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Tenant Sil',
      content: 'Bu tenant\'ı silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        setTenants(tenants.filter(t => t.id !== id));
        message.success('Tenant silindi');
      },
    });
  };

  const handleToggleStatus = (id: string) => {
    setTenants(
      tenants.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' }
          : t
      )
    );
    message.success('Tenant durumu güncellendi');
  };

  const handleLoginAs = (tenant: Tenant) => {
    message.info(`${tenant.name} olarak giriş yapılıyor...`);
    // Implement login as tenant
  };

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsDrawer(true);
  };

  const handleTableAction = (key: string, record: Tenant) => {
    switch (key) {
      case 'login':
        handleLoginAs(record);
        break;
      case 'toggle':
        handleToggleStatus(record.id);
        break;
      case 'delete':
        handleDelete(record.id);
        break;
    }
  };

  const handleCreateTenant = (values: any) => {
    console.log('Creating tenant:', values);
    setShowCreateModal(false);
    form.resetFields();
    message.success('Tenant oluşturuldu');
  };

  // Filtered tenants
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         tenant.domain.toLowerCase().includes(searchText.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || tenant.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="master-tenants-page">
      {/* Header */}
      <div className="page-header glass-morphism">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-content"
        >
          <Title level={2} className="gradient-text">
            <TeamOutlined /> Tenant Yönetimi
          </Title>
          <Text type="secondary">Tüm tenant'ları yönetin ve izleyin</Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-actions"
        >
          <Space>
            <Button icon={<ImportOutlined />}>İçe Aktar</Button>
            <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
              className="gradient-button"
            >
              Yeni Tenant
            </Button>
          </Space>
        </motion.div>
      </div>

      {/* Stats */}
      <Row gutter={[20, 20]} className="stats-row">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="stat-card glass-morphism">
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={
                    <>
                      {stat.prefix}
                      <span className="stat-icon" style={{ color: stat.color }}>
                        {stat.icon}
                      </span>
                    </>
                  }
                  suffix={stat.suffix}
                  valueStyle={{ color: stat.color }}
                />
                {stat.trend && (
                  <div className="stat-trend">
                    <Tag color={stat.trend > 0 ? 'success' : 'error'}>
                      {stat.trend > 0 ? '+' : ''}{stat.trend}%
                    </Tag>
                  </div>
                )}
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card className="filters-card glass-morphism">
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle" wrap>
              <Search
                placeholder="Tenant ara..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />
              <Select
                placeholder="Durum"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 120 }}
              >
                <Option value="all">Tümü</Option>
                <Option value="active">Aktif</Option>
                <Option value="suspended">Askıda</Option>
                <Option value="pending">Bekliyor</Option>
                <Option value="expired">Süresi Dolmuş</Option>
              </Select>
              <Select
                placeholder="Plan"
                value={filterPlan}
                onChange={setFilterPlan}
                style={{ width: 120 }}
              >
                <Option value="all">Tümü</Option>
                <Option value="Free">Free</Option>
                <Option value="Starter">Starter</Option>
                <Option value="Professional">Professional</Option>
                <Option value="Enterprise">Enterprise</Option>
              </Select>
              <RangePicker />
            </Space>
          </Col>
          <Col>
            <Space>
              <Segmented
                value={viewMode}
                onChange={(value) => setViewMode(value as 'grid' | 'table')}
                options={[
                  { label: 'Tablo', value: 'table', icon: <BarsOutlined /> },
                  { label: 'Grid', value: 'grid', icon: <AppstoreOutlined /> },
                ]}
              />
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={() => setLoading(!loading)}
              >
                Yenile
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Row gutter={[16, 16]}>
              {filteredTenants.map((tenant) => (
                <Col xs={24} sm={12} md={8} lg={6} xl={6} xxl={4} key={tenant.id}>
                  <TenantCard
                    tenant={tenant}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onLoginAs={handleLoginAs}
                    onViewDetails={handleViewDetails}
                  />
                </Col>
              ))}
            </Row>
            {filteredTenants.length === 0 && (
              <Empty
                description="Tenant bulunamadı"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="table-card glass-morphism">
              <Table
                columns={columns}
                dataSource={filteredTenants}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Toplam ${total} tenant`,
                }}
                scroll={{ x: 1500 }}
                rowSelection={{
                  selectedRowKeys: selectedTenants,
                  onChange: setSelectedTenants,
                }}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedTenant ? 'Tenant Düzenle' : 'Yeni Tenant Oluştur'}
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          setSelectedTenant(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTenant}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tenant Adı"
                rules={[{ required: true, message: 'Tenant adı gerekli' }]}
              >
                <Input placeholder="Örn: TechCorp Solutions" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="domain"
                label="Domain"
                rules={[{ required: true, message: 'Domain gerekli' }]}
              >
                <Input placeholder="Örn: techcorp" addonAfter=".stoocker.app" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="E-posta"
                rules={[
                  { required: true, message: 'E-posta gerekli' },
                  { type: 'email', message: 'Geçerli bir e-posta girin' },
                ]}
              >
                <Input placeholder="admin@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Telefon"
                rules={[{ required: true, message: 'Telefon gerekli' }]}
              >
                <Input placeholder="+90 555 123 4567" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plan"
                label="Plan"
                rules={[{ required: true, message: 'Plan seçin' }]}
              >
                <Select placeholder="Plan seçin">
                  <Option value="Free">Free</Option>
                  <Option value="Starter">Starter</Option>
                  <Option value="Professional">Professional</Option>
                  <Option value="Enterprise">Enterprise</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxUsers"
                label="Maksimum Kullanıcı"
                rules={[{ required: true, message: 'Kullanıcı limiti gerekli' }]}
              >
                <InputNumber
                  min={1}
                  max={10000}
                  style={{ width: '100%' }}
                  placeholder="100"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="modules"
            label="Modüller"
          >
            <Checkbox.Group>
              <Row>
                <Col span={8}>
                  <Checkbox value="CRM">CRM</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="Sales">Sales</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="Finance">Finance</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="HR">HR</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="Production">Production</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="Inventory">Inventory</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowCreateModal(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedTenant ? 'Güncelle' : 'Oluştur'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title="Tenant Detayları"
        placement="right"
        width={600}
        open={showDetailsDrawer}
        onClose={() => {
          setShowDetailsDrawer(false);
          setSelectedTenant(null);
        }}
      >
        {selectedTenant && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Tenant Info */}
            <Card className="glass-morphism">
              <Space align="start">
                <Avatar size={64} style={{ background: planConfig[selectedTenant.plan].gradient }}>
                  {selectedTenant.name.substring(0, 2).toUpperCase()}
                </Avatar>
                <div>
                  <Title level={4}>{selectedTenant.name}</Title>
                  <Space>
                    <Tag color={planConfig[selectedTenant.plan].color}>
                      {selectedTenant.plan}
                    </Tag>
                    <Tag color={statusConfig[selectedTenant.status].color}>
                      {statusConfig[selectedTenant.status].text}
                    </Tag>
                  </Space>
                </div>
              </Space>
            </Card>

            {/* Performance Metrics */}
            <Card title="Performans Metrikleri" className="glass-morphism">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">CPU Kullanımı</Text>
                  <Progress percent={selectedTenant.performance.cpu} />
                </Col>
                <Col span={12}>
                  <Text type="secondary">Memory Kullanımı</Text>
                  <Progress percent={selectedTenant.performance.memory} />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Günlük İstek"
                    value={selectedTenant.performance.requests}
                    prefix={<ApiOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Hata Sayısı"
                    value={selectedTenant.performance.errors}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Contact Info */}
            <Card title="İletişim Bilgileri" className="glass-morphism">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Sahip</Text>
                  <br />
                  <Text strong>{selectedTenant.owner.name}</Text>
                </div>
                <div>
                  <Text type="secondary">E-posta</Text>
                  <br />
                  <Text copyable>{selectedTenant.email}</Text>
                </div>
                <div>
                  <Text type="secondary">Telefon</Text>
                  <br />
                  <Text>{selectedTenant.phone}</Text>
                </div>
                <div>
                  <Text type="secondary">Domain</Text>
                  <br />
                  <Text copyable>{selectedTenant.domain}</Text>
                </div>
              </Space>
            </Card>

            {/* Modules & Features */}
            <Card title="Modüller ve Özellikler" className="glass-morphism">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Aktif Modüller</Text>
                  <br />
                  <Space wrap>
                    {selectedTenant.modules.map((module) => (
                      <Tag key={module} color="blue">
                        {module}
                      </Tag>
                    ))}
                  </Space>
                </div>
                <div>
                  <Text type="secondary">Özellikler</Text>
                  <br />
                  <Space wrap>
                    {selectedTenant.features.map((feature) => (
                      <Tag key={feature} color="green">
                        {feature}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </Space>
            </Card>

            {/* Actions */}
            <Space style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                block
                onClick={() => handleLoginAs(selectedTenant)}
              >
                Tenant Olarak Giriş Yap
              </Button>
              <Button
                icon={<EditOutlined />}
                block
                onClick={() => {
                  setShowDetailsDrawer(false);
                  handleEdit(selectedTenant);
                }}
              >
                Düzenle
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
};