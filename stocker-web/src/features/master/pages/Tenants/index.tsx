import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { 
  Card, 
  Table, 
  Space, 
  Button, 
  Tag, 
  Input, 
  Select, 
  DatePicker, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Descriptions, 
  Tabs, 
  Timeline,
  Statistic,
  Alert,
  Popconfirm,
  message,
  Badge,
  Switch,
  Divider,
  Typography,
  Avatar,
  Tooltip,
  Dropdown,
  Spin,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  DownloadOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  useGetTenants, 
  useCreateTenant, 
  useUpdateTenant, 
  useDeleteTenant,
  useSuspendTenant,
  useActivateTenant,
  useResetTenantPassword,
  useLoginAsTenant,
  useGetTenant,
  useGetTenantUsage,
  useGetTenantActivity
} from '@/features/master/hooks/useTenants';
import { Tenant } from '@/shared/types';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

export const MasterTenantsPage: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  // API Hooks
  const { data: tenantsData, isLoading, refetch } = useGetTenants({
    page: currentPage,
    pageSize,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    search: searchText,
  });

  const { data: selectedTenantDetail } = useGetTenant(selectedTenant?.id || '');
  const { data: tenantUsage } = useGetTenantUsage(selectedTenant?.id || '');
  const { data: tenantActivity } = useGetTenantActivity(selectedTenant?.id || '');

  const createTenantMutation = useCreateTenant();
  const updateTenantMutation = useUpdateTenant();
  const deleteTenantMutation = useDeleteTenant();
  const suspendTenantMutation = useSuspendTenant();
  const activateTenantMutation = useActivateTenant();
  const resetPasswordMutation = useResetTenantPassword();
  const loginAsTenantMutation = useLoginAsTenant();

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDetailModalVisible(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    form.setFieldsValue(tenant);
    setEditModalVisible(true);
  };

  const handleSuspend = (tenant: Tenant) => {
    Modal.confirm({
      title: 'Tenant\'ı Askıya Al',
      content: `${tenant.name} adlı tenant'ı askıya almak istediğinizden emin misiniz?`,
      okText: 'Askıya Al',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        if (tenant.status === 'suspended') {
          activateTenantMutation.mutate(tenant.id);
        } else {
          suspendTenantMutation.mutate({ id: tenant.id });
        }
      },
    });
  };

  const handleDelete = (tenant: Tenant) => {
    deleteTenantMutation.mutate(tenant.id);
  };

  const handleResetPassword = (tenant: Tenant) => {
    Modal.confirm({
      title: 'Şifre Sıfırlama',
      content: `${tenant.contactEmail} adresine şifre sıfırlama linki gönderilecek.`,
      okText: 'Gönder',
      cancelText: 'İptal',
      onOk: () => {
        resetPasswordMutation.mutate(tenant.id);
      },
    });
  };

  const handleLoginAsTenant = (tenant: Tenant) => {
    loginAsTenantMutation.mutate(tenant.id);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      if (selectedTenant) {
        updateTenantMutation.mutate({
          id: selectedTenant.id,
          data: values,
        });
      } else {
        createTenantMutation.mutate(values);
      }
      setEditModalVisible(false);
    });
  };

  const columns: ColumnsType<Tenant> = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Kod: {record.code}
          </Text>
          {record.domain && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <GlobalOutlined /> {record.domain}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.contactName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <MailOutlined /> {record.contactEmail}
          </Text>
          {record.contactPhone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <PhoneOutlined /> {record.contactPhone}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'subscriptionStatus',
      key: 'plan',
      render: (status: string) => {
        const color = status === 'Active' ? 'green' : status === 'Trial' ? 'blue' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Durum',
      key: 'status',
      render: (_, record) => {
        const isActive = record.isActive;
        const config = {
          active: { color: 'success', text: 'Aktif', icon: <CheckCircleOutlined /> },
          inactive: { color: 'error', text: 'Pasif', icon: <CloseCircleOutlined /> },
        };
        const statusConfig = isActive ? config.active : config.inactive;
        return (
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.text}
          </Tag>
        );
      },
    },
    {
      title: 'Kullanım',
      key: 'usage',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            <UserOutlined /> {record.userCount || 0} kullanıcı
          </Text>
        </Space>
      ),
    },
    {
      title: 'Tarihler',
      key: 'dates',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Kayıt: {new Date(record.createdAt).toLocaleDateString('tr-TR')}
          </Text>
          {record.updatedAt && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Güncelleme: {new Date(record.updatedAt).toLocaleDateString('tr-TR')}
            </Text>
          )}
        </Space>
      ),
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
                key: 'view',
                label: 'Detayları Gör',
                icon: <EyeOutlined />,
                onClick: () => handleViewDetails(record),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'login',
                label: 'Tenant\'a Giriş Yap',
                icon: <KeyOutlined />,
                onClick: () => handleLoginAsTenant(record),
              },
              {
                key: 'reset',
                label: 'Şifre Sıfırla',
                icon: <LockOutlined />,
                onClick: () => handleResetPassword(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'suspend',
                label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
                icon: record.isActive ? <LockOutlined /> : <UnlockOutlined />,
                danger: record.isActive,
                onClick: () => handleSuspend(record),
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const tenants = tenantsData?.data?.items || [];
  const totalCount = tenantsData?.data?.totalCount || 0;

  // Calculate statistics
  const statusCounts = {
    all: totalCount,
    active: tenants.filter(t => t.isActive).length,
    inactive: tenants.filter(t => !t.isActive).length,
    trial: tenants.filter(t => t.subscriptionStatus === 'Trial').length,
  };

  return (
    <PageContainer
      title="Tenant Yönetimi"
      subTitle="Tüm tenant'ları görüntüle ve yönet"
      extra={[
        <Button 
          key="refresh" 
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Yenile
        </Button>,
        <Button key="export" icon={<DownloadOutlined />}>
          Dışa Aktar
        </Button>,
        <Button 
          key="add" 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedTenant(null);
            form.resetFields();
            setEditModalVisible(true);
          }}
        >
          Yeni Tenant
        </Button>,
      ]}
    >
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Tenant"
              value={statusCounts.all}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Aktif"
              value={statusCounts.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Deneme"
              value={statusCounts.trial}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pasif"
              value={statusCounts.inactive}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tenant ara..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={setSearchText}
              loading={isLoading}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              size="large"
              placeholder="Durum"
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Select.Option value="all">Tümü</Select.Option>
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="inactive">Pasif</Select.Option>
              <Select.Option value="trial">Deneme</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Tenants Table */}
      <Card>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : tenants.length === 0 ? (
          <Empty description="Tenant bulunamadı" />
        ) : (
          <Table
            columns={columns}
            dataSource={tenants}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 10);
              },
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} tenant`,
            }}
            scroll={{ x: 1200 }}
            loading={isLoading}
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Tenant Detayları"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => {
            setDetailModalVisible(false);
            handleEdit(selectedTenant!);
          }}>
            Düzenle
          </Button>,
        ]}
      >
        {selectedTenant && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Genel Bilgiler" key="1">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Tenant Adı">{selectedTenant.name}</Descriptions.Item>
                <Descriptions.Item label="Kod">{selectedTenant.code}</Descriptions.Item>
                <Descriptions.Item label="Domain">{selectedTenant.domain || '-'}</Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={selectedTenant.isActive ? 'success' : 'error'}>
                    {selectedTenant.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Abonelik Durumu">{selectedTenant.subscriptionStatus || '-'}</Descriptions.Item>
                <Descriptions.Item label="Kullanıcı Sayısı">{selectedTenant.userCount || 0}</Descriptions.Item>
                <Descriptions.Item label="Kayıt Tarihi">
                  {new Date(selectedTenant.createdAt).toLocaleString('tr-TR')}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="İletişim Bilgileri" key="2">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="İletişim Adı">{selectedTenant.contactName}</Descriptions.Item>
                <Descriptions.Item label="E-posta">{selectedTenant.contactEmail}</Descriptions.Item>
                <Descriptions.Item label="Telefon">{selectedTenant.contactPhone || '-'}</Descriptions.Item>
                <Descriptions.Item label="Adres">{selectedTenant.address || '-'}</Descriptions.Item>
                <Descriptions.Item label="Şehir">{selectedTenant.city || '-'}</Descriptions.Item>
                <Descriptions.Item label="Ülke">{selectedTenant.country || '-'}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            {tenantUsage && (
              <TabPane tab="Kullanım İstatistikleri" key="3">
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="Toplam Kullanıcı" 
                        value={tenantUsage.data?.userCount || 0} 
                        prefix={<UserOutlined />} 
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="Depolama" 
                        value={tenantUsage.data?.storageUsed || 0} 
                        suffix="GB" 
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="API Çağrısı" 
                        value={tenantUsage.data?.apiCalls || 0} 
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            )}
            {tenantActivity && (
              <TabPane tab="İşlem Geçmişi" key="4">
                <Timeline>
                  {tenantActivity.data?.map((activity: any, index: number) => (
                    <Timeline.Item 
                      key={index}
                      color={activity.type === 'success' ? 'green' : activity.type === 'error' ? 'red' : 'blue'}
                    >
                      {activity.description} - {new Date(activity.createdAt).toLocaleString('tr-TR')}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </TabPane>
            )}
          </Tabs>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={selectedTenant ? "Tenant Düzenle" : "Yeni Tenant"}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSave}
        width={600}
        confirmLoading={createTenantMutation.isPending || updateTenantMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Tenant Adı" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="code" label="Kod" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="domain" label="Domain">
            <Input addonBefore="https://" addonAfter=".stocker.app" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactName" label="İletişim Adı" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactEmail" label="E-posta" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="contactPhone" label="Telefon">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="Şehir">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Ülke">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Adres">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="isActive" label="Durum" valuePropName="checked">
            <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};