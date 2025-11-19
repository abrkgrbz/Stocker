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
  CopyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { tenantService, type TenantDto as Tenant } from '../../services/api/tenantService';

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
      const data = await tenantService.getById(id!);
      console.log('📊 Tenant Data Response:', data);
      console.log('🔄 isActive status:', data.isActive);
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

    if (!tenant) return;

    form.setFieldsValue({
      ...tenant,
      subscriptionEndDate: tenant?.subscriptionEndDate ? dayjs(tenant.subscriptionEndDate) : null,
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!tenant?.id) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      // Call real API
      await tenantService.update(tenant.id, {
        name: values.name,
        domain: values.domain,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        isActive: tenant.isActive,
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
    if (!tenant?.id) return;

    const statusMessages = {
      active: 'aktifleştirmek',
      suspended: 'askıya almak',
      inactive: 'devre dışı bırakmak',
    };

    const warningTexts = {
      active: `${tenant?.name || 'Tenant'} tekrar aktifleştirilecek ve kullanıcılar giriş yapabilecek.`,
      suspended: `${tenant?.name || 'Tenant'} askıya alınacak. Tüm kullanıcılar sistemden çıkarılacak ve subdomain erişimi engellenecek.`,
      inactive: `${tenant?.name || 'Tenant'} tamamen devre dışı bırakılacak.`,
    };

    const result = await Swal.fire({
      title: 'Durum Değişikliği',
      html: `<p><strong>${warningTexts[status as keyof typeof warningTexts]}</strong></p>
             <p style="color: #ff4d4f; margin-top: 10px;">Bu işlemi yapmak istediğinize emin misiniz?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Devam Et',
      cancelButtonText: 'İptal',
      confirmButtonColor: status === 'suspended' ? '#ff4d4f' : '#667eea',
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        console.log('🔄 Status change requested:', { tenantId: tenant.id, newStatus: status });

        if (status === 'active') {
          const result = await tenantService.activate(tenant.id);
          console.log('✅ Activate API response:', result);
        } else if (status === 'suspended') {
          const result = await tenantService.suspend(tenant.id, {
            reason: 'Admin panelden askıya alındı',
          });
          console.log('⏸️ Suspend API response:', result);
        }

        message.success('Tenant durumu güncellendi');

        // Fetch updated data and log response
        console.log('🔄 Fetching updated tenant data...');
        await fetchTenantData();
        console.log('✅ Data refresh completed');
      } catch (error: any) {
        console.error('❌ Status change failed:', error);
        message.error(error?.message || 'Durum değiştirilemedi');
      } finally {
        setLoading(false);
      }
    }
  };

  const InfoCard = ({ title, value, icon, color, progress }: any) => (
    <Card size="small">
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={{ color }}
      />
      {progress !== undefined && (
        <Progress
          percent={progress}
          strokeColor={color}
          size="small"
          showInfo={false}
          style={{ marginTop: 8 }}
        />
      )}
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
      {tenant && !tenant.isActive && (
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

      {loading ? (
        <Card loading={true} />
      ) : !tenant ? (
        <Empty description="Tenant bilgisi bulunamadı" />
      ) : (
        <>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <InfoCard
                title="Durum"
                value={tenant?.isActive ? 'Aktif' : 'Askıda'}
                icon={<CheckCircleOutlined />}
                color={tenant?.isActive ? '#52c41a' : '#faad14'}
              />
            </Col>
        <Col xs={24} sm={12} lg={6}>
          <InfoCard
            title="Kullanıcılar"
            value={`${tenant?.users || 0} / ${tenant?.maxUsers || 0}`}
            icon={<TeamOutlined />}
            color="#1890ff"
            progress={Math.round(((tenant?.users || 0) / (tenant?.maxUsers || 1)) * 100)}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <InfoCard
            title="Depolama"
            value={`${tenant?.storage || 0} GB`}
            icon={<CloudServerOutlined />}
            color="#722ed1"
            progress={Math.round(((tenant?.storage || 0) / (tenant?.maxStorage || 1)) * 100)}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <InfoCard
            title="Aylık Ücret"
            value={`₺${tenant?.billing?.amount?.toLocaleString() || '0'}`}
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
                    <Descriptions.Item label="Tenant ID">
                      <Space>
                        <Typography.Text code copyable={{ text: tenant?.id || '', tooltips: ['Kopyala', 'Kopyalandı!'] }}>
                          {tenant?.id || '-'}
                        </Typography.Text>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tenant Adı">{tenant?.name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Subdomain">
                      {tenant?.subdomain ? (
                        <a href={`https://${tenant.subdomain}.stocker.app`} target="_blank" rel="noopener noreferrer">
                          <Space>
                            {tenant.subdomain}.stocker.app
                            <ExportOutlined style={{ fontSize: 12 }} />
                          </Space>
                        </a>
                      ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Özel Domain">
                      {tenant?.customDomain ? (
                        <a href={`https://${tenant.customDomain}`} target="_blank" rel="noopener noreferrer">
                          <Space>
                            {tenant.customDomain}
                            <ExportOutlined style={{ fontSize: 12 }} />
                          </Space>
                        </a>
                      ) : (
                        '-'
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Paket">
                      <Tag color="purple">{tenant?.package?.toUpperCase() || '-'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Durum">
                      <Badge
                        status={tenant?.isActive ? "success" : "error"}
                        text={tenant?.isActive ? "Aktif" : "Pasif"}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Oluşturulma">
                      {tenant?.createdAt ? dayjs(tenant.createdAt).format('DD MMMM YYYY, HH:mm') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bitiş Tarihi">
                      {tenant?.expiresAt ? dayjs(tenant.expiresAt).format('DD MMMM YYYY') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Son Aktivite">
                      {tenant?.lastActive ? dayjs(tenant.lastActive).format('DD MMMM YYYY, HH:mm') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Veritabanı Bölgesi">{tenant?.database?.region || '-'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Hızlı İşlemler" size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size={2}>
                    <Button
                      type="text"
                      icon={<KeyOutlined />}
                      block
                      onClick={() => navigate(`/tenants/${id}/api-keys`)}
                      style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      API Anahtarları
                    </Button>
                    <Button
                      type="text"
                      icon={<DatabaseOutlined />}
                      block
                      onClick={() => navigate(`/tenants/${id}/backup-restore`)}
                      style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      Yedekleme & Geri Yükleme
                    </Button>
                    <Button
                      type="text"
                      icon={<FileTextOutlined />}
                      block
                      onClick={() => navigate(`/tenants/${id}/billing`)}
                      style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      Faturalar
                    </Button>
                    <Button
                      type="text"
                      icon={<HistoryOutlined />}
                      block
                      onClick={() => navigate(`/tenants/${id}/activity-logs`)}
                      style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      Aktivite Logları
                    </Button>
                    <Button
                      type="text"
                      icon={<SafetyOutlined />}
                      block
                      onClick={() => navigate(`/tenants/${id}/security`)}
                      style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      Güvenlik Ayarları
                    </Button>
                  </Space>
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
                      {tenant?.owner?.firstName || '-'} {tenant?.owner?.lastName || ''}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ünvan">{tenant?.owner?.title || '-'}</Descriptions.Item>
                    <Descriptions.Item label="E-posta">
                      <Space>
                        <MailOutlined />
                        {tenant?.owner?.email || '-'}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Telefon">
                      <Space>
                        <PhoneOutlined />
                        {tenant?.owner?.phone || '-'}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Şirket Bilgileri">
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Şirket Adı">{tenant?.company?.name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Vergi No">{tenant?.company?.taxNumber || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Adres">
                      {tenant?.company?.address || '-'}
                      <br />
                      {tenant?.company?.postalCode || ''} {tenant?.company?.city || ''}
                      <br />
                      {tenant?.company?.country || ''}
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
                        used={tenant?.limits?.apiCalls?.used || 0}
                        max={tenant?.limits?.apiCalls?.max || 0}
                        unit="çağrı"
                      />
                    </Col>
                    <Col span={12}>
                      <LimitCard
                        title="Bant Genişliği"
                        used={tenant?.limits?.bandwidth?.used || 0}
                        max={tenant?.limits?.bandwidth?.max || 0}
                        unit="GB"
                      />
                    </Col>
                    <Col span={12}>
                      <LimitCard
                        title="E-posta Gönderimi"
                        used={tenant?.limits?.emailsSent?.used || 0}
                        max={tenant?.limits?.emailsSent?.max || 0}
                        unit="e-posta"
                      />
                    </Col>
                    <Col span={12}>
                      <LimitCard
                        title="Özel Domain"
                        used={tenant?.limits?.customDomains?.used || 0}
                        max={tenant?.limits?.customDomains?.max || 0}
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
                        value={tenant?.storage || 0}
                        suffix="GB"
                        prefix={<CloudServerOutlined />}
                      />
                      <Progress
                        percent={Math.round(((tenant?.storage || 0) / (tenant?.maxStorage || 1)) * 100)}
                        strokeColor="#667eea"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Veritabanı Boyutu"
                        value={tenant?.database?.size || 0}
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
        </>
      )}
    </PageContainer>
  );
};

export default TenantDetails;