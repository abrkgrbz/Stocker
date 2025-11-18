import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Statistic,
  Button,
  Space,
  Tag,
  Badge,
  Tabs,
  Timeline,
  Avatar,
  Typography,
  Divider,
  Progress,
  Alert,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  message,
  Tooltip,
  List,
  Table,
  Empty,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  TeamOutlined,
  CloudServerOutlined,
  DollarOutlined,
  CalendarOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  DatabaseOutlined,
  ApiOutlined,
  KeyOutlined,
  SettingOutlined,
  ExportOutlined,
  SyncOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LockOutlined,
  UnlockOutlined,
  HeartOutlined,
  CloudUploadOutlined,
  LineChartOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { tenantService, type Tenant } from '../../services/tenantService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const TenantDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [form] = Form.useForm();

  // Fetch tenant data on component mount
  React.useEffect(() => {
    if (id) {
      fetchTenantData();
    }
  }, [id]);

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getTenantById(id!);
      setTenant(data);
    } catch (error: any) {
      message.error(error?.message || 'Tenant bilgileri yüklenemedi');
      navigate('/tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!tenant) return;

    form.setFieldsValue({
      ...tenant,
      subscriptionEndDate: tenant.subscriptionEndDate ? dayjs(tenant.subscriptionEndDate) : null,
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!tenant) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      // Call real API
      await tenantService.updateTenant(tenant.id, {
        ...values,
        subscriptionEndDate: values.subscriptionEndDate?.format('YYYY-MM-DD'),
      });

      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Tenant bilgileri güncellendi.',
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh tenant data
      await fetchTenantData();
      setEditMode(false);
    } catch (error: any) {
      message.error(error?.message || 'Tenant güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    form.resetFields();
  };

  const handleStatusChange = async (status: string) => {
    if (!tenant) return;

    const statusMessages = {
      active: 'aktifleştirmek',
      suspended: 'askıya almak',
      inactive: 'devre dışı bırakmak',
    };

    const result = await Swal.fire({
      title: 'Durum Değişikliği',
      text: `${tenant.name} tenant'ını ${statusMessages[status as keyof typeof statusMessages]} istediğinize emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#667eea',
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        if (status === 'active') {
          await tenantService.activateTenant(tenant.id);
        } else if (status === 'suspended') {
          await tenantService.suspendTenant(tenant.id);
        }

        message.success('Tenant durumu güncellendi');
        await fetchTenantData();
      } catch (error: any) {
        message.error(error?.message || 'Durum değiştirilemedi');
      } finally {
        setLoading(false);
      }
    }
  };

  const InfoCard = ({ title, value, icon, color }: any) => (
    <Card size="small">
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={{ color }}
      />
    </Card>
  );

  const LimitCard = ({ title, used, max, unit }: any) => {
    const percentage = (used / max) * 100;
    const isWarning = percentage > 80;
    
    return (
      <Card size="small">
        <div style={{ marginBottom: 8 }}>
          <Text strong>{title}</Text>
        </div>
        <Progress
          percent={percentage}
          status={isWarning ? 'exception' : 'normal'}
          format={() => `${used.toLocaleString()} / ${max.toLocaleString()} ${unit}`}
        />
      </Card>
    );
  };

  // Show loading state
  if (loading && !tenant) {
    return (
      <PageContainer>
        <Card loading={true} style={{ minHeight: 400 }} />
      </PageContainer>
    );
  }

  // Show error state if tenant not found
  if (!tenant) {
    return (
      <PageContainer>
        <Empty
          description="Tenant bulunamadı"
          extra={
            <Button type="primary" onClick={() => navigate('/tenants')}>
              Tenant Listesine Dön
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      header={{
        title: editMode ? 'Tenant Düzenle' : 'Tenant Detayları',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: tenant?.name || 'Tenant' },
          ],
        },
        onBack: () => navigate('/tenants'),
        extra: [
          editMode ? (
            <Space key="edit-actions">
              <Button onClick={handleCancel} icon={<CloseOutlined />}>
                İptal
              </Button>
              <Button
                type="primary"
                loading={loading}
                onClick={handleSave}
                icon={<SaveOutlined />}
              >
                Kaydet
              </Button>
            </Space>
          ) : (
            <Space key="view-actions">
              <Button icon={<ExportOutlined />}>Export</Button>
              <Button icon={<SyncOutlined />}>Senkronize</Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Düzenle
              </Button>
            </Space>
          ),
        ],
      }}
    >
      {/* Status Alert */}
      {tenant.status === 'suspended' && (
        <Alert
          message="Tenant Askıda"
          description="Bu tenant şu anda askıya alınmış durumda. Hizmetler devre dışı."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" onClick={() => handleStatusChange('active')}>
              Aktifleştir
            </Button>
          }
        />
      )}

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <InfoCard
            title="Durum"
            value={tenant.status === 'active' ? 'Aktif' : 'Askıda'}
            icon={<CheckCircleOutlined />}
            color={tenant.status === 'active' ? '#52c41a' : '#faad14'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <InfoCard
            title="Kullanıcılar"
            value={`${tenant.users} / ${tenant.maxUsers}`}
            icon={<TeamOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <InfoCard
            title="Depolama"
            value={`${tenant.storage} GB`}
            icon={<CloudServerOutlined />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <InfoCard
            title="Aylık Ücret"
            value={`₺${tenant.billing.amount.toLocaleString()}`}
            icon={<DollarOutlined />}
            color="#667eea"
          />
        </Col>
      </Row>

      {editMode ? (
        // Edit Form
        <Card>
          <Form form={form} layout="vertical">
            <Divider orientation="left">Temel Bilgiler</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tenant Adı"
                  rules={[{ required: true }]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="subdomain"
                  label="Subdomain"
                  rules={[{ required: true }]}
                >
                  <Input addonAfter=".stocker.app" size="large" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="customDomain" label="Özel Domain">
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Durum">
                  <Select size="large">
                    <Option value="active">Aktif</Option>
                    <Option value="suspended">Askıda</Option>
                    <Option value="inactive">İnaktif</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Paket ve Limitler</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="package" label="Paket">
                  <Select size="large">
                    <Option value="starter">Starter</Option>
                    <Option value="professional">Professional</Option>
                    <Option value="enterprise">Enterprise</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="maxUsers" label="Max Kullanıcı">
                  <InputNumber min={1} style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="maxStorage" label="Max Depolama (GB)">
                  <InputNumber min={1} style={{ width: '100%' }} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Sahip Bilgileri</Divider>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name={['owner', 'firstName']} label="Ad">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['owner', 'lastName']} label="Soyad">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['owner', 'email']} label="E-posta">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['owner', 'phone']} label="Telefon">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      ) : (
        // View Tabs
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Genel Bakış" key="overview">
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Card title="Tenant Bilgileri">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Tenant ID">{tenant.id}</Descriptions.Item>
                    <Descriptions.Item label="Tenant Adı">{tenant.name}</Descriptions.Item>
                    <Descriptions.Item label="Subdomain">
                      <a href={`https://${tenant.subdomain}.stocker.app`} target="_blank">
                        {tenant.subdomain}.stocker.app
                      </a>
                    </Descriptions.Item>
                    <Descriptions.Item label="Özel Domain">
                      {tenant.customDomain ? (
                        <a href={`https://${tenant.customDomain}`} target="_blank">
                          {tenant.customDomain}
                        </a>
                      ) : (
                        '-'
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Paket">
                      <Tag color="purple">{tenant.package.toUpperCase()}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Durum">
                      <Badge status="success" text="Aktif" />
                    </Descriptions.Item>
                    <Descriptions.Item label="Oluşturulma">{tenant.createdAt}</Descriptions.Item>
                    <Descriptions.Item label="Bitiş Tarihi">{tenant.expiresAt}</Descriptions.Item>
                    <Descriptions.Item label="Son Aktivite">{tenant.lastActive}</Descriptions.Item>
                    <Descriptions.Item label="Veritabanı Bölgesi">{tenant.database.region}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Hızlı İşlemler">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button icon={<KeyOutlined />} block onClick={() => navigate(`/tenants/${id}/api-keys`)}>
                      API Anahtarları
                    </Button>
                    <Button icon={<DatabaseOutlined />} block onClick={() => navigate(`/tenants/${id}/backup-restore`)}>
                      Yedekleme & Geri Yükleme
                    </Button>
                    <Button icon={<FileTextOutlined />} block onClick={() => navigate(`/tenants/${id}/billing`)}>
                      Faturalar
                    </Button>
                    <Button icon={<HistoryOutlined />} block onClick={() => navigate(`/tenants/${id}/activity-logs`)}>
                      Aktivite Logları
                    </Button>
                    <Button icon={<SafetyOutlined />} block onClick={() => navigate(`/tenants/${id}/security`)}>
                      Güvenlik Ayarları
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Tüm Yönetim Sayfaları Kartları */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Title level={4}>Tenant Yönetimi</Title>
              </Col>
              
              {/* İlk Satır */}
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  onClick={() => navigate(`/tenants/${id}/settings`)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <SettingOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  <Title level={5} style={{ marginTop: 8 }}>Ayarlar</Title>
                  <Text type="secondary">Genel, e-posta, güvenlik ayarları</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  onClick={() => navigate(`/tenants/${id}/users`)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <UserOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  <Title level={5} style={{ marginTop: 8 }}>Kullanıcılar</Title>
                  <Text type="secondary">Kullanıcı yönetimi ve roller</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  onClick={() => navigate(`/tenants/${id}/analytics`)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <LineChartOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                  <Title level={5} style={{ marginTop: 8 }}>Analitik</Title>
                  <Text type="secondary">Trafik ve kullanım raporları</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  onClick={() => navigate(`/tenants/${id}/integrations`)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <ApiOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
                  <Title level={5} style={{ marginTop: 8 }}>Entegrasyonlar</Title>
                  <Text type="secondary">3. parti servis bağlantıları</Text>
                </Card>
              </Col>
              
              {/* İkinci Satır */}
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  onClick={() => navigate(`/tenants/${id}/webhooks`)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <LinkOutlined style={{ fontSize: 32, color: '#13c2c2' }} />
                  <Title level={5} style={{ marginTop: 8 }}>Webhook'lar</Title>
                  <Text type="secondary">Event yönetimi ve loglar</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  onClick={() => navigate(`/tenants/${id}/health`)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <HeartOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                  <Title level={5} style={{ marginTop: 8 }}>Sistem Sağlığı</Title>
                  <Text type="secondary">Performans ve metrikler</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  onClick={() => navigate(`/tenants/${id}/domains`)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <GlobalOutlined style={{ fontSize: 32, color: '#2f54eb' }} />
                  <Title level={5} style={{ marginTop: 8 }}>Domain'ler</Title>
                  <Text type="secondary">Domain yönetimi</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  onClick={() => navigate(`/tenants/${id}/migrations`)}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <CloudUploadOutlined style={{ fontSize: 32, color: '#eb2f96' }} />
                  <Title level={5} style={{ marginTop: 8 }}>Migrasyonlar</Title>
                  <Text type="secondary">Veritabanı migrasyonları</Text>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Sahip & Şirket" key="owner">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Sahip Bilgileri">
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Ad Soyad">
                      {tenant.owner.firstName} {tenant.owner.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ünvan">{tenant.owner.title}</Descriptions.Item>
                    <Descriptions.Item label="E-posta">
                      <Space>
                        <MailOutlined />
                        {tenant.owner.email}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Telefon">
                      <Space>
                        <PhoneOutlined />
                        {tenant.owner.phone}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Şirket Bilgileri">
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Şirket Adı">{tenant.company.name}</Descriptions.Item>
                    <Descriptions.Item label="Vergi No">{tenant.company.taxNumber}</Descriptions.Item>
                    <Descriptions.Item label="Adres">
                      {tenant.company.address}
                      <br />
                      {tenant.company.postalCode} {tenant.company.city}
                      <br />
                      {tenant.company.country}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Kullanım & Limitler" key="usage">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Kaynak Kullanımı">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <LimitCard
                        title="API Çağrıları"
                        used={tenant.limits.apiCalls.used}
                        max={tenant.limits.apiCalls.max}
                        unit="çağrı"
                      />
                    </Col>
                    <Col span={12}>
                      <LimitCard
                        title="Bant Genişliği"
                        used={tenant.limits.bandwidth.used}
                        max={tenant.limits.bandwidth.max}
                        unit="GB"
                      />
                    </Col>
                    <Col span={12}>
                      <LimitCard
                        title="E-posta Gönderimi"
                        used={tenant.limits.emailsSent.used}
                        max={tenant.limits.emailsSent.max}
                        unit="e-posta"
                      />
                    </Col>
                    <Col span={12}>
                      <LimitCard
                        title="Özel Domain"
                        used={tenant.limits.customDomains.used}
                        max={tenant.limits.customDomains.max}
                        unit="domain"
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Depolama Detayları">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Kullanılan Alan"
                        value={tenant.storage}
                        suffix="GB"
                        prefix={<CloudServerOutlined />}
                      />
                      <Progress
                        percent={Math.round((tenant.storage / tenant.maxStorage) * 100)}
                        strokeColor="#667eea"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Veritabanı Boyutu"
                        value={tenant.database.size}
                        suffix="GB"
                        prefix={<DatabaseOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Dosya Sayısı"
                        value={125438}
                        prefix={<FileTextOutlined />}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Özellikler" key="features">
            <Card title="Aktif Özellikler">
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={[
                  { key: 'advanced-analytics', title: 'Gelişmiş Analitik', icon: <HistoryOutlined /> },
                  { key: 'api-access', title: 'API Erişimi', icon: <ApiOutlined /> },
                  { key: 'custom-branding', title: 'Özel Marka', icon: <SafetyOutlined /> },
                  { key: 'priority-support', title: 'Öncelikli Destek', icon: <TeamOutlined /> },
                  { key: 'white-label', title: 'White Label', icon: <GlobalOutlined /> },
                  { key: 'sla-guarantee', title: 'SLA Garantisi', icon: <CheckCircleOutlined /> },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Card size="small">
                      <Space>
                        {item.icon}
                        <Text strong>{item.title}</Text>
                        <Tag color="green">Aktif</Tag>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>

          <TabPane tab="Aktivite Geçmişi" key="activity">
            <Card>
              <Timeline
                items={[
                  {
                    dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />,
                    color: 'green',
                    children: (
                      <>
                        <Text strong>Paket yükseltildi</Text>
                        <br />
                        <Text type="secondary">Professional → Enterprise</Text>
                        <br />
                        <Text type="secondary">2024-12-05 14:30</Text>
                      </>
                    ),
                  },
                  {
                    dot: <UserOutlined style={{ fontSize: '16px' }} />,
                    color: 'blue',
                    children: (
                      <>
                        <Text strong>25 yeni kullanıcı eklendi</Text>
                        <br />
                        <Text type="secondary">2024-12-03 10:15</Text>
                      </>
                    ),
                  },
                  {
                    dot: <DollarOutlined style={{ fontSize: '16px' }} />,
                    color: 'green',
                    children: (
                      <>
                        <Text strong>Ödeme alındı</Text>
                        <br />
                        <Text type="secondary">₺9,999</Text>
                        <br />
                        <Text type="secondary">2024-12-01 00:00</Text>
                      </>
                    ),
                  },
                  {
                    dot: <GlobalOutlined style={{ fontSize: '16px' }} />,
                    children: (
                      <>
                        <Text strong>Özel domain eklendi</Text>
                        <br />
                        <Text type="secondary">app.abc-corp.com</Text>
                        <br />
                        <Text type="secondary">2024-11-28 16:45</Text>
                      </>
                    ),
                  },
                  {
                    dot: <DatabaseOutlined style={{ fontSize: '16px' }} />,
                    children: (
                      <>
                        <Text strong>Veritabanı migration tamamlandı</Text>
                        <br />
                        <Text type="secondary">v2.4.0</Text>
                        <br />
                        <Text type="secondary">2024-11-25 03:00</Text>
                      </>
                    ),
                  },
                ]}
              />
            </Card>
          </TabPane>
        </Tabs>
      )}
    </PageContainer>
  );
};

export default TenantDetails;