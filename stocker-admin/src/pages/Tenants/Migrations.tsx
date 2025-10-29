import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Tooltip,
  Badge,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Progress,
  Descriptions,
  Steps,
  List,
  Tabs,
  Spin,
  Modal,
  Form,
  Switch,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Divider,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  DatabaseOutlined,
  SyncOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
  HistoryOutlined,
  SafetyOutlined,
  ScheduleOutlined,
  RocketOutlined,
  CodeOutlined,
  ExperimentOutlined,
  ReloadOutlined,
  FireOutlined,
  EyeOutlined,
  RollbackOutlined,
  DeleteOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import {
  migrationService,
  type TenantMigrationStatusDto,
  type ApplyMigrationResultDto,
  type MigrationHistoryDto,
  type ScheduledMigrationDto,
  type MigrationSettingsDto,
  type MigrationScriptPreviewDto,
} from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

interface ExtendedTenantMigration extends TenantMigrationStatusDto {
  status: 'completed' | 'pending' | 'error';
  totalPending: number;
  totalApplied: number;
}

const MigrationsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tenantMigrations, setTenantMigrations] = useState<ExtendedTenantMigration[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<ExtendedTenantMigration | null>(null);
  const [migrationHistory, setMigrationHistory] = useState<MigrationHistoryDto | null>(null);
  const [activeTab, setActiveTab] = useState('migrations');
  const [applyingAll, setApplyingAll] = useState(false);

  // Scheduled Migrations
  const [scheduledMigrations, setScheduledMigrations] = useState<ScheduledMigrationDto[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleForm] = Form.useForm();

  // Settings
  const [settings, setSettings] = useState<MigrationSettingsDto | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsForm] = Form.useForm();

  // Preview Modal
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<MigrationScriptPreviewDto | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    loadMigrations();
  }, []);

  const loadMigrations = async () => {
    setLoading(true);
    try {
      const data = await migrationService.getPendingMigrations();
      const extended = data.map(tenant => ({
        ...tenant,
        status: tenant.error ? 'error' as const :
                tenant.hasPendingMigrations ? 'pending' as const :
                'completed' as const,
        totalPending: tenant.pendingMigrations.reduce((sum, m) => sum + m.migrations.length, 0),
        totalApplied: tenant.appliedMigrations.reduce((sum, m) => sum + m.migrations.length, 0),
      }));
      setTenantMigrations(extended);
    } catch (error: any) {
      message.error(error.message || 'Migration durumları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMigration = async (tenant: ExtendedTenantMigration) => {
    console.log('DEBUG handleApplyMigration:', {
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName
    });

    const result = await Swal.fire({
      title: 'Migration Uygula',
      html: `
        <div style="text-align: left;">
          <p><strong>Tenant:</strong> ${tenant.tenantName} (${tenant.tenantCode})</p>
          <p><strong>Bekleyen Migration Sayısı:</strong> ${tenant.totalPending}</p>
          <hr/>
          <p style="color: #ff4d4f;">⚠️ Bu işlem veritabanında değişiklikler yapacaktır!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Uygula',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#667eea',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const result = await migrationService.applyMigration(tenant.tenantId);
          return result;
        } catch (error: any) {
          Swal.showValidationMessage(error.message || 'Migration uygulanamadı');
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed && result.value) {
      const applyResult = result.value as ApplyMigrationResultDto;

      if (applyResult.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          html: `
            <div style="text-align: left;">
              <p>${applyResult.message}</p>
              <p><strong>Uygulanan Migrationlar:</strong></p>
              <ul>
                ${applyResult.appliedMigrations.map(m => `<li>${m}</li>`).join('')}
              </ul>
            </div>
          `,
        });
        loadMigrations();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Hata!',
          text: applyResult.error || applyResult.message,
        });
      }
    }
  };

  const handleApplyAllMigrations = async () => {
    const pendingTenants = tenantMigrations.filter(t => t.hasPendingMigrations);

    if (pendingTenants.length === 0) {
      message.info('Bekleyen migration bulunmamaktadır');
      return;
    }

    const result = await Swal.fire({
      title: 'Tüm Migrationları Uygula',
      html: `
        <div style="text-align: left;">
          <p><strong>Etkilenecek Tenant Sayısı:</strong> ${pendingTenants.length}</p>
          <p><strong>Toplam Migration Sayısı:</strong> ${pendingTenants.reduce((sum, t) => sum + t.totalPending, 0)}</p>
          <hr/>
          <p style="color: #ff4d4f;">⚠️ Bu işlem tüm tenantlarda değişiklikler yapacaktır!</p>
          <p style="color: #ff4d4f;">⚠️ Bu işlem geri alınamaz!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tümünü Uygula',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ff4d4f',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const results = await migrationService.applyAllMigrations();
          return results;
        } catch (error: any) {
          Swal.showValidationMessage(error.message || 'Migrationlar uygulanamadı');
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed && result.value) {
      const results = result.value as ApplyMigrationResultDto[];

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      await Swal.fire({
        icon: failed === 0 ? 'success' : 'warning',
        title: 'Uygulama Tamamlandı',
        html: `
          <div style="text-align: left;">
            <p><strong>Başarılı:</strong> ${successful}</p>
            <p><strong>Başarısız:</strong> ${failed}</p>
            ${failed > 0 ? '<hr/><p><strong>Hatalar:</strong></p><ul>' +
              results.filter(r => !r.success).map(r =>
                `<li>${r.tenantName}: ${r.error || r.message}</li>`
              ).join('') + '</ul>' : ''}
          </div>
        `,
      });

      loadMigrations();
    }
  };

  const handleViewDetails = async (tenant: ExtendedTenantMigration) => {
    console.log('DEBUG handleViewDetails:', {
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName
    });

    setSelectedTenant(tenant);

    try {
      const history = await migrationService.getMigrationHistory(tenant.tenantId);
      setMigrationHistory(history);
    } catch (error: any) {
      message.error('Migration geçmişi yüklenirken hata oluştu');
    }
  };

  // Load Scheduled Migrations
  const loadScheduledMigrations = async () => {
    setLoadingScheduled(true);
    try {
      const data = await migrationService.getScheduledMigrations();
      setScheduledMigrations(data);
    } catch (error: any) {
      message.error(error.message || 'Zamanlanmış migrationlar yüklenemedi');
    } finally {
      setLoadingScheduled(false);
    }
  };

  // Load Settings
  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const data = await migrationService.getMigrationSettings();
      setSettings(data);
      settingsForm.setFieldsValue(data);
    } catch (error: any) {
      message.error(error.message || 'Ayarlar yüklenemedi');
    } finally {
      setLoadingSettings(false);
    }
  };

  // Handle Schedule Migration
  const handleScheduleMigration = async (values: any) => {
    try {
      await migrationService.scheduleMigration(
        values.tenantId,
        values.scheduledTime.toDate(),
        values.migrationName,
        values.moduleName
      );
      message.success('Migration zamanlandı');
      setScheduleModalVisible(false);
      scheduleForm.resetFields();
      loadScheduledMigrations();
    } catch (error: any) {
      message.error(error.message || 'Migration zamanlanamadı');
    }
  };

  // Handle Cancel Scheduled Migration
  const handleCancelScheduled = async (scheduleId: string) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Zamanlanmış migration iptal edilecek',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'İptal Et',
      cancelButtonText: 'Vazgeç',
    });

    if (result.isConfirmed) {
      try {
        await migrationService.cancelScheduledMigration(scheduleId);
        message.success('Zamanlanmış migration iptal edildi');
        loadScheduledMigrations();
      } catch (error: any) {
        message.error(error.message || 'İptal işlemi başarısız');
      }
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (values: MigrationSettingsDto) => {
    setLoadingSettings(true);
    try {
      await migrationService.updateMigrationSettings(values);
      message.success('Ayarlar kaydedildi');
      loadSettings();
    } catch (error: any) {
      message.error(error.message || 'Ayarlar kaydedilemedi');
    } finally {
      setLoadingSettings(false);
    }
  };

  // Handle Preview Migration
  const handlePreviewMigration = async (
    tenantId: string,
    moduleName: string,
    migrationName: string
  ) => {
    setLoadingPreview(true);
    setPreviewModalVisible(true);
    try {
      const preview = await migrationService.getMigrationScriptPreview(
        tenantId,
        moduleName,
        migrationName
      );
      setPreviewData(preview);
    } catch (error: any) {
      message.error(error.message || 'Preview alınamadı');
      setPreviewModalVisible(false);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Handle Rollback Migration
  const handleRollbackMigration = async (
    tenantId: string,
    moduleName: string,
    migrationName: string
  ) => {
    const result = await Swal.fire({
      title: 'Migration Geri Al',
      html: `
        <div style="text-align: left;">
          <p><strong>Migration:</strong> ${migrationName}</p>
          <p><strong>Modül:</strong> ${moduleName}</p>
          <hr/>
          <p style="color: #ff4d4f;">⚠️ Bu işlem dikkatli yapılmalıdır!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Geri Al',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ff4d4f',
    });

    if (result.isConfirmed) {
      try {
        const rollbackResult = await migrationService.rollbackMigration(
          tenantId,
          moduleName,
          migrationName
        );

        if (rollbackResult.success) {
          message.success(rollbackResult.message);
        } else {
          await Swal.fire({
            icon: 'info',
            title: 'Bilgi',
            html: `<pre style="text-align: left;">${rollbackResult.message}</pre>`,
          });
        }
      } catch (error: any) {
        message.error(error.message || 'Rollback başarısız');
      }
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'scheduled') {
      loadScheduledMigrations();
    } else if (activeTab === 'settings') {
      loadSettings();
    }
  }, [activeTab]);

  const statusColors = {
    completed: 'success',
    pending: 'warning',
    error: 'error',
  };

  const columns: ProColumns<ExtendedTenantMigration>[] = [
    {
      title: 'Tenant',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <DatabaseOutlined style={{ color: '#667eea' }} />
            <Text strong>{record.tenantName}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.tenantCode}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record) => (
        <Space direction="vertical" size={4}>
          <Badge
            status={statusColors[status as keyof typeof statusColors] as any}
            text={
              status === 'completed' ? 'Güncel' :
              status === 'pending' ? 'Bekleyen Migration Var' : 'Hata'
            }
          />
          {record.error && (
            <Text type="danger" style={{ fontSize: 12 }}>
              {record.error}
            </Text>
          )}
        </Space>
      ),
      filters: [
        { text: 'Güncel', value: 'completed' },
        { text: 'Bekleyen', value: 'pending' },
        { text: 'Hata', value: 'error' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Bekleyen',
      dataIndex: 'totalPending',
      key: 'totalPending',
      render: (count: number, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: count > 0 ? '#faad14' : '#52c41a' }}>
            {count} migration
          </Text>
          {count > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.pendingMigrations.map(m =>
                `${m.module}: ${m.migrations.length}`
              ).join(', ')}
            </Text>
          )}
        </Space>
      ),
      sorter: (a, b) => a.totalPending - b.totalPending,
    },
    {
      title: 'Uygulanmış',
      dataIndex: 'totalApplied',
      key: 'totalApplied',
      render: (count: number, record) => (
        <Space direction="vertical" size={0}>
          <Text>{count} migration</Text>
          {count > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.appliedMigrations.map(m =>
                `${m.module}: ${m.migrations.length}`
              ).join(', ')}
            </Text>
          )}
        </Space>
      ),
      sorter: (a, b) => a.totalApplied - b.totalApplied,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.hasPendingMigrations && !record.error && (
            <Tooltip title="Migration Uygula">
              <Button
                type="primary"
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={() => handleApplyMigration(record)}
              >
                Uygula
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const TenantMigrationDetails = () => {
    if (!selectedTenant) return null;

    return (
      <Card
        title={`Migration Detayları: ${selectedTenant.tenantName}`}
        extra={
          <Button onClick={() => setSelectedTenant(null)}>Kapat</Button>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tenant Adı" span={2}>
            {selectedTenant.tenantName}
          </Descriptions.Item>
          <Descriptions.Item label="Tenant Kodu">
            {selectedTenant.tenantCode}
          </Descriptions.Item>
          <Descriptions.Item label="Tenant ID">
            {selectedTenant.tenantId}
          </Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Badge
              status={statusColors[selectedTenant.status as keyof typeof statusColors] as any}
              text={
                selectedTenant.status === 'completed' ? 'Güncel' :
                selectedTenant.status === 'pending' ? 'Bekleyen Migration Var' : 'Hata'
              }
            />
          </Descriptions.Item>
          <Descriptions.Item label="Toplam Bekleyen">
            <Text strong style={{ color: selectedTenant.totalPending > 0 ? '#faad14' : '#52c41a' }}>
              {selectedTenant.totalPending}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {selectedTenant.error && (
          <Alert
            message="Hata"
            description={selectedTenant.error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {selectedTenant.pendingMigrations.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 24 }}>Bekleyen Migrationlar</Title>
            {selectedTenant.pendingMigrations.map(module => (
              <Card
                key={module.module}
                type="inner"
                title={`Modül: ${module.module}`}
                style={{ marginBottom: 16 }}
              >
                <List
                  dataSource={module.migrations}
                  renderItem={migration => (
                    <List.Item
                      actions={[
                        <Tooltip title="SQL Preview">
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() =>
                              handlePreviewMigration(
                                selectedTenant.tenantId,
                                module.module,
                                migration
                              )
                            }
                          />
                        </Tooltip>,
                        <Tooltip title="Zamanla">
                          <Button
                            size="small"
                            icon={<ScheduleOutlined />}
                            onClick={() => {
                              setScheduleModalVisible(true);
                              scheduleForm.setFieldsValue({
                                tenantId: selectedTenant.tenantId,
                                moduleName: module.module,
                                migrationName: migration,
                              });
                            }}
                          />
                        </Tooltip>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<CodeOutlined style={{ fontSize: 20, color: '#faad14' }} />}
                        title={migration}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </>
        )}

        {selectedTenant.appliedMigrations.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 24 }}>Uygulanmış Migrationlar</Title>
            {selectedTenant.appliedMigrations.map(module => (
              <Card
                key={module.module}
                type="inner"
                title={`Modül: ${module.module}`}
                style={{ marginBottom: 16 }}
              >
                <List
                  dataSource={module.migrations}
                  renderItem={migration => (
                    <List.Item
                      actions={[
                        <Tooltip title="Rollback">
                          <Button
                            size="small"
                            danger
                            icon={<RollbackOutlined />}
                            onClick={() =>
                              handleRollbackMigration(
                                selectedTenant.tenantId,
                                module.module,
                                migration
                              )
                            }
                          />
                        </Tooltip>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                        title={migration}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </>
        )}

        {migrationHistory && (
          <>
            <Title level={5} style={{ marginTop: 24 }}>Migration Geçmişi</Title>
            <Descriptions bordered>
              <Descriptions.Item label="Toplam Migration" span={3}>
                {migrationHistory.totalMigrations}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    );
  };

  const totalPending = tenantMigrations.reduce((sum, t) => sum + t.totalPending, 0);
  const totalCompleted = tenantMigrations.filter(t => !t.hasPendingMigrations && !t.error).length;
  const totalWithErrors = tenantMigrations.filter(t => t.error).length;

  return (
    <PageContainer
      header={{
        title: 'Database Migrations',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa' },
            { title: 'Tenants' },
            { title: 'Migrations' },
          ],
        },
      }}
    >
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Tenant"
              value={tenantMigrations.length}
              prefix={<DatabaseOutlined style={{ color: '#667eea' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Güncel"
              value={totalCompleted}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bekleyen Migration"
              value={totalPending}
              prefix={<SyncOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hatalı"
              value={totalWithErrors}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {selectedTenant ? (
        <TenantMigrationDetails />
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tenant Migrationları" key="migrations">
            <ProTable<ExtendedTenantMigration>
              columns={columns}
              dataSource={tenantMigrations}
              rowKey="tenantId"
              search={false}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
              }}
              toolBarRender={() => [
                <Button
                  key="refresh"
                  icon={<ReloadOutlined />}
                  onClick={loadMigrations}
                  loading={loading}
                >
                  Yenile
                </Button>,
                <Button
                  key="apply-all"
                  type="primary"
                  danger
                  icon={<FireOutlined />}
                  onClick={handleApplyAllMigrations}
                  disabled={totalPending === 0}
                  loading={applyingAll}
                >
                  Tüm Migrationları Uygula ({totalPending})
                </Button>,
              ]}
            />
          </TabPane>

          <TabPane tab="Migration Rehberi" key="guide">
            <Card>
              <Steps current={-1} direction="vertical">
                <Step
                  title="Test Ortamında Dene"
                  description="Migration'ı önce test ortamında çalıştırın"
                  icon={<ExperimentOutlined />}
                />
                <Step
                  title="Yedek Al"
                  description="Production veritabanının yedeğini alın"
                  icon={<SafetyOutlined />}
                />
                <Step
                  title="Zamanla"
                  description="En az trafiğin olduğu saatleri tercih edin"
                  icon={<ScheduleOutlined />}
                />
                <Step
                  title="Çalıştır"
                  description="Migration'ı production ortamında çalıştırın"
                  icon={<RocketOutlined />}
                />
                <Step
                  title="Doğrula"
                  description="Migration'ın başarılı olduğunu doğrulayın"
                  icon={<CheckCircleOutlined />}
                />
              </Steps>

              <Alert
                message="Önemli Notlar"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>Migrationlar otomatik olarak transaction içinde çalışır</li>
                    <li>Hata durumunda tüm değişiklikler geri alınır</li>
                    <li>Migrationlar tenant bazında bağımsız olarak uygulanır</li>
                    <li>Başarısız migration'lar için detaylı hata logları kontrol edilmelidir</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginTop: 24 }}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ClockCircleOutlined /> Zamanlanmış Migrationlar
              </span>
            }
            key="scheduled"
          >
            <Card
              title="Zamanlanmış Migrationlar"
              extra={
                <Button
                  type="primary"
                  icon={<ScheduleOutlined />}
                  onClick={() => setScheduleModalVisible(true)}
                >
                  Yeni Zamanlama
                </Button>
              }
            >
              <Table
                loading={loadingScheduled}
                dataSource={scheduledMigrations}
                rowKey="scheduleId"
                columns={[
                  {
                    title: 'Tenant',
                    dataIndex: 'tenantName',
                    key: 'tenantName',
                    render: (text, record) => (
                      <Space direction="vertical" size={0}>
                        <Text strong>{text}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {record.tenantCode}
                        </Text>
                      </Space>
                    ),
                  },
                  {
                    title: 'Migration',
                    key: 'migration',
                    render: (_, record) => (
                      <Space direction="vertical" size={0}>
                        {record.migrationName ? (
                          <>
                            <Text>{record.migrationName}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Modül: {record.moduleName}
                            </Text>
                          </>
                        ) : (
                          <Text type="secondary">Tüm bekleyen migrationlar</Text>
                        )}
                      </Space>
                    ),
                  },
                  {
                    title: 'Zamanlanma',
                    dataIndex: 'scheduledTime',
                    key: 'scheduledTime',
                    render: (time) => dayjs(time).format('DD.MM.YYYY HH:mm'),
                  },
                  {
                    title: 'Durum',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Tag color={status === 'Pending' ? 'orange' : status === 'Running' ? 'blue' : 'green'}>
                        {status}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Oluşturan',
                    dataIndex: 'createdBy',
                    key: 'createdBy',
                  },
                  {
                    title: 'İşlemler',
                    key: 'actions',
                    render: (_, record) =>
                      record.status === 'Pending' ? (
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleCancelScheduled(record.scheduleId)}
                        >
                          İptal Et
                        </Button>
                      ) : null,
                  },
                ]}
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined /> Ayarlar
              </span>
            }
            key="settings"
          >
            <Card title="Migration Ayarları" loading={loadingSettings}>
              {settings && (
                <Form
                  form={settingsForm}
                  layout="vertical"
                  onFinish={handleSaveSettings}
                  initialValues={settings}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="autoApplyMigrations"
                        label="Otomatik Migration Uygula"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="backupBeforeMigration"
                        label="Migration Öncesi Yedek Al"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="enableScheduledMigrations"
                        label="Zamanlanmış Migrationları Etkinleştir"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="migrationTimeout" label="Migration Timeout (saniye)">
                        <InputNumber min={30} max={3600} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="notifyOnMigrationComplete"
                        label="Başarılı Migration Bildirimi"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="notifyOnMigrationFailure"
                        label="Başarısız Migration Bildirimi"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="notificationEmails" label="Bildirim Email Adresleri">
                    <Select mode="tags" placeholder="Email adresleri ekleyin" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loadingSettings}>
                      Ayarları Kaydet
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Card>
          </TabPane>
        </Tabs>
      )}

      {/* Schedule Migration Modal */}
      <Modal
        title="Migration Zamanla"
        open={scheduleModalVisible}
        onCancel={() => {
          setScheduleModalVisible(false);
          scheduleForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={scheduleForm} layout="vertical" onFinish={handleScheduleMigration}>
          <Form.Item name="tenantId" label="Tenant" rules={[{ required: true, message: 'Tenant seçiniz' }]}>
            <Select
              placeholder="Tenant seçin"
              showSearch
              optionFilterProp="children"
            >
              {tenantMigrations.map((tenant) => (
                <Select.Option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.tenantName} ({tenant.tenantCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="moduleName" label="Modül">
            <Input placeholder="Opsiyonel: CRM, Tenant, Master" />
          </Form.Item>

          <Form.Item name="migrationName" label="Migration Adı">
            <Input placeholder="Opsiyonel: Belirli bir migration adı" />
          </Form.Item>

          <Form.Item
            name="scheduledTime"
            label="Zamanlanma"
            rules={[{ required: true, message: 'Tarih ve saat seçiniz' }]}
          >
            <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<ScheduleOutlined />}>
                Zamanla
              </Button>
              <Button onClick={() => {
                setScheduleModalVisible(false);
                scheduleForm.resetFields();
              }}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="SQL Script Preview"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Kapat
          </Button>,
        ]}
      >
        {loadingPreview ? (
          <Spin />
        ) : previewData ? (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tenant">{previewData.tenantName}</Descriptions.Item>
              <Descriptions.Item label="Modül">{previewData.moduleName}</Descriptions.Item>
              <Descriptions.Item label="Migration">{previewData.migrationName}</Descriptions.Item>
              <Descriptions.Item label="Tahmini Süre">{previewData.estimatedDuration}s</Descriptions.Item>
            </Descriptions>

            {previewData.affectedTables.length > 0 && (
              <div>
                <Text strong>Etkilenecek Tablolar:</Text>
                <div style={{ marginTop: 8 }}>
                  {previewData.affectedTables.map((table) => (
                    <Tag key={table} color="blue">
                      {table}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Text strong>SQL Script:</Text>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 4,
                  marginTop: 8,
                  maxHeight: 400,
                  overflow: 'auto',
                }}
              >
                {previewData.sqlScript}
              </pre>
            </div>
          </Space>
        ) : null}
      </Modal>
    </PageContainer>
  );
};

export default MigrationsPage;
