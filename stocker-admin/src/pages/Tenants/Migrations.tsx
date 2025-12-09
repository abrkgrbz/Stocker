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
  Empty,
  Collapse,
  Timeline,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  DatabaseOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
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
  ArrowLeftOutlined,
  AppstoreOutlined,
  PlayCircleOutlined,
  WarningOutlined,
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
const { Panel } = Collapse;

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
  const [activeTab, setActiveTab] = useState('overview');
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
    const result = await Swal.fire({
      title: 'Migration Uygula',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: #f6f8fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0;"><strong>🏢 Tenant:</strong> ${tenant.tenantName}</p>
            <p style="margin: 0 0 8px 0;"><strong>📋 Kod:</strong> ${tenant.tenantCode}</p>
            <p style="margin: 0;"><strong>📦 Bekleyen:</strong> ${tenant.totalPending} migration</p>
          </div>
          <div style="background: #fff3cd; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Dikkat:</strong> Bu işlem veritabanında kalıcı değişiklikler yapacaktır.
            </p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✓ Migration Uygula',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#1890ff',
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
              <p style="color: #52c41a; font-weight: 500;">${applyResult.message}</p>
              <div style="background: #f6ffed; padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p style="margin: 0 0 8px 0;"><strong>Uygulanan Migrationlar:</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                  ${applyResult.appliedMigrations.map(m => `<li style="color: #389e0d;">${m}</li>`).join('')}
                </ul>
              </div>
            </div>
          `,
        });
        loadMigrations();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Hata Oluştu',
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
      title: '⚠️ Tüm Migrationları Uygula',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: #f6f8fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0;"><strong>🏢 Etkilenecek Tenant:</strong> ${pendingTenants.length} adet</p>
            <p style="margin: 0;"><strong>📦 Toplam Migration:</strong> ${pendingTenants.reduce((sum, t) => sum + t.totalPending, 0)} adet</p>
          </div>
          <div style="background: #fff1f0; padding: 12px; border-radius: 8px; border-left: 4px solid #ff4d4f;">
            <p style="margin: 0 0 8px 0; color: #cf1322;"><strong>🚨 Kritik Uyarı:</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: #cf1322;">
              <li>Bu işlem TÜM tenantlarda değişiklik yapacaktır</li>
              <li>İşlem başladıktan sonra durdurulamaz</li>
              <li>Lütfen önce yedek aldığınızdan emin olun</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '🔥 Tümünü Uygula',
      cancelButtonText: 'Vazgeç',
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
        title: failed === 0 ? '✓ Tamamlandı' : 'Kısmen Tamamlandı',
        html: `
          <div style="text-align: left;">
            <div style="display: flex; gap: 16px; margin-bottom: 16px;">
              <div style="flex: 1; background: #f6ffed; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; color: #52c41a; font-weight: bold;">${successful}</div>
                <div style="color: #389e0d;">Başarılı</div>
              </div>
              <div style="flex: 1; background: ${failed > 0 ? '#fff1f0' : '#f6f8fa'}; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; color: ${failed > 0 ? '#ff4d4f' : '#999'}; font-weight: bold;">${failed}</div>
                <div style="color: ${failed > 0 ? '#cf1322' : '#999'};">Başarısız</div>
              </div>
            </div>
            ${failed > 0 ? `
              <div style="background: #fff1f0; padding: 12px; border-radius: 8px;">
                <p style="margin: 0 0 8px 0; color: #cf1322;"><strong>Hatalar:</strong></p>
                <ul style="margin: 0; padding-left: 20px; color: #cf1322;">
                  ${results.filter(r => !r.success).map(r =>
                    `<li><strong>${r.tenantName}:</strong> ${r.error || r.message}</li>`
                  ).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `,
      });

      loadMigrations();
    }
  };

  const handleViewDetails = async (tenant: ExtendedTenantMigration) => {
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
      message.success('Migration başarıyla zamanlandı');
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
      title: 'Zamanlamayı İptal Et',
      text: 'Bu zamanlanmış migration iptal edilecek. Emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, İptal Et',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#ff4d4f',
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
      message.success('Ayarlar başarıyla kaydedildi');
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
      title: '⚠️ Migration Geri Al',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: #f6f8fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0;"><strong>📦 Migration:</strong> ${migrationName}</p>
            <p style="margin: 0;"><strong>🗂️ Modül:</strong> ${moduleName}</p>
          </div>
          <div style="background: #fff1f0; padding: 12px; border-radius: 8px; border-left: 4px solid #ff4d4f;">
            <p style="margin: 0; color: #cf1322;">
              <strong>⚠️ Dikkat:</strong> Bu işlem veritabanı değişikliklerini geri alacaktır.
              Veri kaybına neden olabilir!
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Geri Al',
      cancelButtonText: 'Vazgeç',
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
          loadMigrations();
        } else {
          await Swal.fire({
            icon: 'info',
            title: 'Bilgi',
            html: `<pre style="text-align: left; white-space: pre-wrap;">${rollbackResult.message}</pre>`,
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

  const totalPending = tenantMigrations.reduce((sum, t) => sum + t.totalPending, 0);
  const totalCompleted = tenantMigrations.filter(t => !t.hasPendingMigrations && !t.error).length;
  const totalWithErrors = tenantMigrations.filter(t => t.error).length;
  const totalWithPending = tenantMigrations.filter(t => t.hasPendingMigrations).length;

  // Overview Tab Content
  const OverviewContent = () => (
    <div>
      {/* Quick Actions */}
      {totalPending > 0 && (
        <Alert
          message={
            <Space>
              <WarningOutlined />
              <span><strong>{totalWithPending}</strong> tenant'ta <strong>{totalPending}</strong> bekleyen migration var</span>
            </Space>
          }
          type="warning"
          showIcon={false}
          action={
            <Button
              type="primary"
              danger
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={handleApplyAllMigrations}
              loading={applyingAll}
            >
              Tümünü Uygula
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Tenant Cards */}
      <Row gutter={[16, 16]}>
        {tenantMigrations.map(tenant => (
          <Col xs={24} sm={12} lg={8} xl={6} key={tenant.tenantId}>
            <Card
              hoverable
              style={{
                borderLeft: `4px solid ${
                  tenant.error ? '#ff4d4f' :
                  tenant.hasPendingMigrations ? '#faad14' : '#52c41a'
                }`,
              }}
              bodyStyle={{ padding: 16 }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Space>
                      <DatabaseOutlined style={{ color: '#667eea', fontSize: 18 }} />
                      <Text strong style={{ fontSize: 16 }}>{tenant.tenantName}</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{tenant.tenantCode}</Text>
                    </div>
                  </div>
                  <Badge
                    status={
                      tenant.error ? 'error' :
                      tenant.hasPendingMigrations ? 'warning' : 'success'
                    }
                    text={
                      <Text style={{ fontSize: 12 }}>
                        {tenant.error ? 'Hata' :
                         tenant.hasPendingMigrations ? 'Bekliyor' : 'Güncel'}
                      </Text>
                    }
                  />
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: tenant.totalPending > 0 ? '#faad14' : '#52c41a'
                    }}>
                      {tenant.totalPending}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>Bekleyen</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                      {tenant.totalApplied}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>Uygulanmış</div>
                  </div>
                </div>

                {/* Error Message */}
                {tenant.error && (
                  <Alert
                    message={tenant.error}
                    type="error"
                    showIcon
                    style={{ fontSize: 12 }}
                  />
                )}

                {/* Pending Modules */}
                {tenant.pendingMigrations.length > 0 && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Bekleyen Modüller:</Text>
                    <div style={{ marginTop: 4 }}>
                      {tenant.pendingMigrations.map(m => (
                        <Tag key={m.module} color="orange" style={{ marginBottom: 4 }}>
                          {m.module} ({m.migrations.length})
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {tenant.hasPendingMigrations && !tenant.error && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleApplyMigration(tenant)}
                      style={{ flex: 1 }}
                    >
                      Uygula
                    </Button>
                  )}
                  <Button
                    size="small"
                    icon={<InfoCircleOutlined />}
                    onClick={() => handleViewDetails(tenant)}
                    style={{ flex: tenant.hasPendingMigrations && !tenant.error ? undefined : 1 }}
                  >
                    Detay
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {tenantMigrations.length === 0 && !loading && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Henüz tenant bulunmuyor"
        />
      )}
    </div>
  );

  // Tenant Detail View
  const TenantDetailView = () => {
    if (!selectedTenant) return null;

    return (
      <div>
        {/* Back Button & Header */}
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setSelectedTenant(null)}
            style={{ marginBottom: 16 }}
          >
            Geri Dön
          </Button>

          <Card>
            <Row gutter={24} align="middle">
              <Col>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${
                    selectedTenant.error ? '#ff4d4f20' :
                    selectedTenant.hasPendingMigrations ? '#faad1420' : '#52c41a20'
                  }, ${
                    selectedTenant.error ? '#ff4d4f10' :
                    selectedTenant.hasPendingMigrations ? '#faad1410' : '#52c41a10'
                  })`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <DatabaseOutlined style={{
                    fontSize: 28,
                    color: selectedTenant.error ? '#ff4d4f' :
                           selectedTenant.hasPendingMigrations ? '#faad14' : '#52c41a'
                  }} />
                </div>
              </Col>
              <Col flex={1}>
                <Title level={4} style={{ margin: 0 }}>{selectedTenant.tenantName}</Title>
                <Space>
                  <Tag>{selectedTenant.tenantCode}</Tag>
                  <Badge
                    status={
                      selectedTenant.error ? 'error' :
                      selectedTenant.hasPendingMigrations ? 'warning' : 'success'
                    }
                    text={
                      selectedTenant.error ? 'Hata Var' :
                      selectedTenant.hasPendingMigrations ? 'Bekleyen Migration Var' : 'Güncel'
                    }
                  />
                </Space>
              </Col>
              <Col>
                {selectedTenant.hasPendingMigrations && !selectedTenant.error && (
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleApplyMigration(selectedTenant)}
                  >
                    Tüm Migrationları Uygula
                  </Button>
                )}
              </Col>
            </Row>
          </Card>
        </div>

        {/* Error Alert */}
        {selectedTenant.error && (
          <Alert
            message="Migration Hatası"
            description={selectedTenant.error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Row gutter={24}>
          {/* Pending Migrations */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#faad14' }} />
                  <span>Bekleyen Migrationlar</span>
                  <Badge count={selectedTenant.totalPending} style={{ backgroundColor: '#faad14' }} />
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              {selectedTenant.pendingMigrations.length > 0 ? (
                <Collapse accordion ghost>
                  {selectedTenant.pendingMigrations.map(module => (
                    <Panel
                      header={
                        <Space>
                          <AppstoreOutlined />
                          <Text strong>{module.module}</Text>
                          <Tag color="orange">{module.migrations.length} migration</Tag>
                        </Space>
                      }
                      key={module.module}
                    >
                      <Timeline>
                        {module.migrations.map((migration, index) => (
                          <Timeline.Item
                            key={migration}
                            color="orange"
                            dot={<CodeOutlined style={{ fontSize: 14 }} />}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text>{migration}</Text>
                              <Space size={4}>
                                <Tooltip title="SQL Önizle">
                                  <Button
                                    size="small"
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() => handlePreviewMigration(
                                      selectedTenant.tenantId,
                                      module.module,
                                      migration
                                    )}
                                  />
                                </Tooltip>
                                <Tooltip title="Zamanla">
                                  <Button
                                    size="small"
                                    type="text"
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
                                </Tooltip>
                              </Space>
                            </div>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Bekleyen migration yok"
                />
              )}
            </Card>
          </Col>

          {/* Applied Migrations */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Uygulanmış Migrationlar</span>
                  <Badge count={selectedTenant.totalApplied} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              {selectedTenant.appliedMigrations.length > 0 ? (
                <Collapse accordion ghost>
                  {selectedTenant.appliedMigrations.map(module => (
                    <Panel
                      header={
                        <Space>
                          <AppstoreOutlined />
                          <Text strong>{module.module}</Text>
                          <Tag color="green">{module.migrations.length} migration</Tag>
                        </Space>
                      }
                      key={module.module}
                    >
                      <Timeline>
                        {module.migrations.slice(0, 10).map((migration, index) => (
                          <Timeline.Item
                            key={migration}
                            color="green"
                            dot={<CheckCircleOutlined style={{ fontSize: 14 }} />}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text type="secondary">{migration}</Text>
                              <Tooltip title="Geri Al">
                                <Button
                                  size="small"
                                  type="text"
                                  danger
                                  icon={<RollbackOutlined />}
                                  onClick={() => handleRollbackMigration(
                                    selectedTenant.tenantId,
                                    module.module,
                                    migration
                                  )}
                                />
                              </Tooltip>
                            </div>
                          </Timeline.Item>
                        ))}
                        {module.migrations.length > 10 && (
                          <Timeline.Item>
                            <Text type="secondary">...ve {module.migrations.length - 10} migration daha</Text>
                          </Timeline.Item>
                        )}
                      </Timeline>
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Uygulanmış migration yok"
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Guide Tab Content
  const GuideContent = () => (
    <Row gutter={24}>
      <Col xs={24} lg={16}>
        <Card title="Migration Uygulama Rehberi">
          <Steps direction="vertical" current={-1}>
            <Steps.Step
              title="1. Test Ortamında Deneyin"
              description="Migration'ı önce test veritabanında çalıştırın ve sonuçları doğrulayın."
              icon={<ExperimentOutlined />}
              status="wait"
            />
            <Steps.Step
              title="2. Veritabanı Yedeği Alın"
              description="Production veritabanının tam yedeğini alın. Sorun olursa geri dönebilirsiniz."
              icon={<SafetyOutlined />}
              status="wait"
            />
            <Steps.Step
              title="3. Uygun Zaman Seçin"
              description="En az kullanıcı trafiğinin olduğu saatleri tercih edin (gece veya hafta sonu)."
              icon={<ScheduleOutlined />}
              status="wait"
            />
            <Steps.Step
              title="4. Migration'ı Çalıştırın"
              description="Hazırlıklar tamamlandıktan sonra migration'ı production ortamında uygulayın."
              icon={<RocketOutlined />}
              status="wait"
            />
            <Steps.Step
              title="5. Doğrulama Yapın"
              description="Migration sonrası uygulamanın düzgün çalıştığını ve verilerin doğru olduğunu kontrol edin."
              icon={<CheckCircleOutlined />}
              status="wait"
            />
          </Steps>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title="Önemli Bilgiler" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Transaction Güvenliği"
              description="Tüm migrationlar otomatik olarak transaction içinde çalışır. Hata durumunda değişiklikler geri alınır."
              type="info"
              showIcon
            />
            <Alert
              message="Tenant Bağımsızlığı"
              description="Her tenant'ın migration'ı diğerlerinden bağımsızdır. Bir tenant'ta hata olması diğerlerini etkilemez."
              type="success"
              showIcon
            />
            <Alert
              message="Rollback Desteği"
              description="Uygulanan migration'lar geri alınabilir ancak veri kaybı riski vardır."
              type="warning"
              showIcon
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Scheduled Migrations Tab Content
  const ScheduledContent = () => (
    <Card
      title="Zamanlanmış Migrationlar"
      extra={
        <Button
          type="primary"
          icon={<ScheduleOutlined />}
          onClick={() => setScheduleModalVisible(true)}
        >
          Yeni Zamanlama Ekle
        </Button>
      }
    >
      <Table
        loading={loadingScheduled}
        dataSource={scheduledMigrations}
        rowKey="scheduleId"
        locale={{ emptyText: 'Zamanlanmış migration bulunmuyor' }}
        columns={[
          {
            title: 'Tenant',
            key: 'tenant',
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.tenantName}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{record.tenantCode}</Text>
              </Space>
            ),
          },
          {
            title: 'Migration Detayı',
            key: 'migration',
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                {record.migrationName ? (
                  <>
                    <Text>{record.migrationName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Modül: {record.moduleName}</Text>
                  </>
                ) : (
                  <Text type="secondary">Tüm bekleyen migrationlar</Text>
                )}
              </Space>
            ),
          },
          {
            title: 'Planlanan Zaman',
            dataIndex: 'scheduledTime',
            key: 'scheduledTime',
            render: (time) => (
              <Space direction="vertical" size={0}>
                <Text>{dayjs(time).format('DD MMMM YYYY')}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(time).format('HH:mm')}</Text>
              </Space>
            ),
          },
          {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
              <Tag color={
                status === 'Pending' ? 'orange' :
                status === 'Running' ? 'blue' :
                status === 'Completed' ? 'green' : 'red'
              }>
                {status === 'Pending' ? 'Bekliyor' :
                 status === 'Running' ? 'Çalışıyor' :
                 status === 'Completed' ? 'Tamamlandı' : status}
              </Tag>
            ),
          },
          {
            title: 'Oluşturan',
            dataIndex: 'createdBy',
            key: 'createdBy',
          },
          {
            title: 'İşlem',
            key: 'actions',
            render: (_, record) =>
              record.status === 'Pending' && (
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleCancelScheduled(record.scheduleId)}
                >
                  İptal
                </Button>
              ),
          },
        ]}
      />
    </Card>
  );

  // Settings Tab Content
  const SettingsContent = () => (
    <Card title="Migration Ayarları" loading={loadingSettings}>
      {settings && (
        <Form
          form={settingsForm}
          layout="vertical"
          onFinish={handleSaveSettings}
          initialValues={settings}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Card type="inner" title="Genel Ayarlar" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="autoApplyMigrations"
                  label="Otomatik Migration Uygula"
                  valuePropName="checked"
                  extra="Yeni migration'lar tespit edildiğinde otomatik olarak uygular"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="backupBeforeMigration"
                  label="Migration Öncesi Yedek Al"
                  valuePropName="checked"
                  extra="Her migration öncesi otomatik veritabanı yedeği oluşturur"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="enableScheduledMigrations"
                  label="Zamanlanmış Migration'ları Etkinleştir"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="migrationTimeout"
                  label="Migration Timeout (saniye)"
                  extra="Migration işleminin maksimum çalışma süresi"
                >
                  <InputNumber min={30} max={3600} style={{ width: '100%' }} />
                </Form.Item>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card type="inner" title="Bildirim Ayarları" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="notifyOnMigrationComplete"
                  label="Başarılı Migration Bildirimi"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="notifyOnMigrationFailure"
                  label="Başarısız Migration Bildirimi"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="notificationEmails"
                  label="Bildirim Alacak E-posta Adresleri"
                >
                  <Select
                    mode="tags"
                    placeholder="E-posta adreslerini girin ve Enter'a basın"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loadingSettings}>
              Ayarları Kaydet
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <DatabaseOutlined />
          Genel Bakış
        </span>
      ),
      children: selectedTenant ? <TenantDetailView /> : <OverviewContent />,
    },
    {
      key: 'guide',
      label: (
        <span>
          <SafetyOutlined />
          Uygulama Rehberi
        </span>
      ),
      children: <GuideContent />,
    },
    {
      key: 'scheduled',
      label: (
        <span>
          <ClockCircleOutlined />
          Zamanlanmış
          {scheduledMigrations.filter(s => s.status === 'Pending').length > 0 && (
            <Badge
              count={scheduledMigrations.filter(s => s.status === 'Pending').length}
              style={{ marginLeft: 8 }}
            />
          )}
        </span>
      ),
      children: <ScheduledContent />,
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined />
          Ayarlar
        </span>
      ),
      children: <SettingsContent />,
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'Database Migrations',
        subTitle: 'Tenant veritabanı migration yönetimi',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', href: '/' },
            { title: 'Tenants' },
            { title: 'Migrations' },
          ],
        },
      }}
      loading={loading}
    >
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<Text type="secondary">Toplam Tenant</Text>}
              value={tenantMigrations.length}
              prefix={<DatabaseOutlined style={{ color: '#667eea' }} />}
              valueStyle={{ fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<Text type="secondary">Güncel</Text>}
              value={totalCompleted}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<Text type="secondary">Bekleyen Migration</Text>}
              value={totalPending}
              prefix={<SyncOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: totalPending > 0 ? '#faad14' : '#52c41a', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<Text type="secondary">Hatalı Tenant</Text>}
              value={totalWithErrors}
              prefix={<CloseCircleOutlined style={{ color: totalWithErrors > 0 ? '#ff4d4f' : '#999' }} />}
              valueStyle={{ color: totalWithErrors > 0 ? '#ff4d4f' : '#999', fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        tabList={tabItems.map(t => ({ key: t.key, tab: t.label }))}
        activeTabKey={activeTab}
        onTabChange={(key) => {
          if (selectedTenant && key !== 'overview') {
            setSelectedTenant(null);
          }
          setActiveTab(key);
        }}
        tabBarExtraContent={
          activeTab === 'overview' && !selectedTenant && (
            <Button
              icon={<ReloadOutlined />}
              onClick={loadMigrations}
              loading={loading}
            >
              Yenile
            </Button>
          )
        }
      >
        {tabItems.find(t => t.key === activeTab)?.children}
      </Card>

      {/* Schedule Migration Modal */}
      <Modal
        title="Migration Zamanla"
        open={scheduleModalVisible}
        onCancel={() => {
          setScheduleModalVisible(false);
          scheduleForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={scheduleForm} layout="vertical" onFinish={handleScheduleMigration}>
          <Form.Item
            name="tenantId"
            label="Tenant"
            rules={[{ required: true, message: 'Tenant seçiniz' }]}
          >
            <Select placeholder="Tenant seçin" showSearch optionFilterProp="children">
              {tenantMigrations.map((tenant) => (
                <Select.Option key={tenant.tenantId} value={tenant.tenantId}>
                  {tenant.tenantName} ({tenant.tenantCode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="moduleName"
            label="Modül"
            extra="Boş bırakırsanız tüm modüller için uygulanır"
          >
            <Input placeholder="Örn: CRM, Inventory, HR" />
          </Form.Item>

          <Form.Item
            name="migrationName"
            label="Migration Adı"
            extra="Boş bırakırsanız tüm bekleyen migrationlar uygulanır"
          >
            <Input placeholder="Örn: 20240101_AddNewColumn" />
          </Form.Item>

          <Form.Item
            name="scheduledTime"
            label="Çalıştırılacak Zaman"
            rules={[{ required: true, message: 'Tarih ve saat seçiniz' }]}
          >
            <DatePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Tarih ve saat seçin"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setScheduleModalVisible(false);
                scheduleForm.resetFields();
              }}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" icon={<ScheduleOutlined />}>
                Zamanla
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="SQL Script Önizleme"
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
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>SQL Script yükleniyor...</div>
          </div>
        ) : previewData ? (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Tenant">{previewData.tenantName}</Descriptions.Item>
              <Descriptions.Item label="Modül">{previewData.moduleName}</Descriptions.Item>
              <Descriptions.Item label="Migration">{previewData.migrationName}</Descriptions.Item>
              <Descriptions.Item label="Tahmini Süre">~{previewData.estimatedDuration} saniye</Descriptions.Item>
            </Descriptions>

            {previewData.affectedTables.length > 0 && (
              <div>
                <Text strong>Etkilenecek Tablolar:</Text>
                <div style={{ marginTop: 8 }}>
                  {previewData.affectedTables.map((table) => (
                    <Tag key={table} color="blue" style={{ marginBottom: 4 }}>
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
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: 16,
                  borderRadius: 8,
                  marginTop: 8,
                  maxHeight: 400,
                  overflow: 'auto',
                  fontSize: 13,
                  fontFamily: 'Consolas, Monaco, monospace',
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
