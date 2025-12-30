import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
  Divider,
  Timeline,
  Tooltip,
  Badge,
  Descriptions,
  Tabs,
  Collapse,
  Switch,
  Empty,
  Spin,
  Input,
  InputNumber,
  DatePicker,
  Table,
  Progress,
  Segmented,
  Drawer,
  List,
  Avatar,
  Skeleton,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  DatabaseOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  RollbackOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  CodeOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  EyeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  SafetyOutlined,
  RocketOutlined,
  ExperimentOutlined,
  ScheduleOutlined,
  DeleteOutlined,
  SaveOutlined,
  FilterOutlined,
  SearchOutlined,
  HistoryOutlined,
  BranchesOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import Swal from 'sweetalert2';
import { migrationService, TenantMigrationStatusDto, ScheduledMigrationDto, MigrationSettingsDto, MigrationScriptPreviewDto, ApplyMigrationResultDto } from '../../../services/api/migrationService';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Extended type for UI state
interface ExtendedTenantMigration extends TenantMigrationStatusDto {
  status: 'pending' | 'completed' | 'error';
  totalPending: number;
  totalApplied: number;
}

// Status filter type
type StatusFilter = 'all' | 'pending' | 'completed' | 'error';

const TenantMigrations: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tenantMigrations, setTenantMigrations] = useState<ExtendedTenantMigration[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<ExtendedTenantMigration | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchText, setSearchText] = useState('');

  // Drawer states
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [previewDrawerVisible, setPreviewDrawerVisible] = useState(false);
  const [previewData, setPreviewData] = useState<MigrationScriptPreviewDto | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Scheduled Migrations
  const [scheduledMigrations, setScheduledMigrations] = useState<ScheduledMigrationDto[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleForm] = Form.useForm();

  // Settings
  const [settings, setSettings] = useState<MigrationSettingsDto | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsForm] = Form.useForm();

  // Applying state
  const [applyingTenantId, setApplyingTenantId] = useState<string | null>(null);
  const [applyingAll, setApplyingAll] = useState(false);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    loadMigrations();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadMigrations(true);
      }, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadMigrations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await migrationService.getPendingMigrations();
      const extended: ExtendedTenantMigration[] = data.map(tenant => ({
        ...tenant,
        status: tenant.error ? 'error' as const :
                tenant.hasPendingMigrations ? 'pending' as const :
                'completed' as const,
        totalPending: tenant.pendingMigrations.reduce((sum, m) => sum + m.migrations.length, 0),
        totalApplied: tenant.appliedMigrations.reduce((sum, m) => sum + m.migrations.length, 0),
      }));
      setTenantMigrations(extended);
      setLastRefreshed(new Date());
    } catch (error: any) {
      if (!silent) {
        message.error(error.message || 'Migration listesi yüklenemedi');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const handleApplyMigration = async (tenantId: string, tenantName: string) => {
    const result = await Swal.fire({
      title: '🚀 Migration Uygula',
      html: `
        <div style="text-align: left; padding: 16px 0;">
          <div style="background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
            <div style="font-size: 16px; font-weight: 600; color: #0050b3; margin-bottom: 8px;">
              📦 ${tenantName}
            </div>
            <div style="color: #1890ff; font-size: 13px;">
              Bekleyen migration'lar uygulanacak
            </div>
          </div>

          <div style="background: #fffbe6; border: 1px solid #ffe58f; padding: 12px; border-radius: 8px;">
            <div style="color: #ad6800; font-size: 13px;">
              ⚠️ Bu işlem veritabanı yapısını değiştirecektir.
            </div>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✓ Uygula',
      cancelButtonText: '✕ İptal',
      confirmButtonColor: '#52c41a',
      cancelButtonColor: '#d9d9d9',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setApplyingTenantId(tenantId);
    try {
      const applyResult = await migrationService.applyMigration(tenantId);

      await Swal.fire({
        title: applyResult.success ? '✅ Başarılı!' : '❌ Hata!',
        html: applyResult.success ? `
          <div style="text-align: left; padding: 16px 0;">
            <div style="background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%); padding: 16px; border-radius: 12px;">
              <div style="font-size: 15px; color: #135200; margin-bottom: 12px;">
                ${applyResult.message || 'Migration başarıyla uygulandı'}
              </div>
              ${applyResult.appliedMigrations && applyResult.appliedMigrations.length > 0 ? `
                <div style="margin-top: 12px;">
                  <div style="font-weight: 600; color: #389e0d; margin-bottom: 8px;">Uygulanan Migration'lar:</div>
                  <ul style="margin: 0; padding-left: 20px; color: #52c41a;">
                    ${applyResult.appliedMigrations.map(m => `<li style="margin-bottom: 4px;">${m}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          </div>
        ` : `<p style="color: #ff4d4f;">${applyResult.error || applyResult.message}</p>`,
        icon: applyResult.success ? 'success' : 'error',
        confirmButtonText: 'Tamam',
        confirmButtonColor: applyResult.success ? '#52c41a' : '#ff4d4f',
      });

      loadMigrations();
    } catch (error: any) {
      await Swal.fire({
        title: '❌ Hata!',
        text: error.message || 'Migration uygulanamadı',
        icon: 'error',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ff4d4f'
      });
    } finally {
      setApplyingTenantId(null);
    }
  };

  const handleApplyAllMigrations = async () => {
    const pendingTenants = tenantMigrations.filter(t => t.hasPendingMigrations);

    if (pendingTenants.length === 0) {
      message.info('Bekleyen migration bulunmuyor');
      return;
    }

    const result = await Swal.fire({
      title: '⚡ Toplu Migration',
      html: `
        <div style="text-align: left; padding: 16px 0;">
          <div style="background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
            <div style="font-size: 24px; font-weight: 700; color: #d46b08; margin-bottom: 4px;">
              ${pendingTenants.length} Tenant
            </div>
            <div style="color: #fa8c16; font-size: 14px;">
              için bekleyen migration'lar uygulanacak
            </div>
          </div>

          <div style="max-height: 200px; overflow-y: auto; background: #fafafa; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            ${pendingTenants.map(t => `
              <div style="display: flex; align-items: center; padding: 8px; background: white; border-radius: 6px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="width: 8px; height: 8px; background: #faad14; border-radius: 50%; margin-right: 12px;"></div>
                <div>
                  <div style="font-weight: 500;">${t.tenantName}</div>
                  <div style="font-size: 12px; color: #8c8c8c;">${t.totalPending} bekleyen migration</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="background: #fff1f0; border: 1px solid #ffccc7; padding: 12px; border-radius: 8px;">
            <div style="color: #a8071a; font-size: 13px;">
              ⚠️ Bu işlem geri alınamaz. Devam etmeden önce yedek aldığınızdan emin olun.
            </div>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '⚡ Tümünü Uygula',
      cancelButtonText: '✕ İptal',
      confirmButtonColor: '#fa8c16',
      cancelButtonColor: '#d9d9d9',
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) return;

    setApplyingAll(true);
    try {
      const results = await migrationService.applyAllMigrations();

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      await Swal.fire({
        title: failCount === 0 ? '✅ Tamamlandı!' : '⚠️ Kısmen Tamamlandı',
        html: `
          <div style="text-align: center; padding: 16px 0;">
            <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 16px;">
              <div style="background: #f6ffed; padding: 16px 24px; border-radius: 12px;">
                <div style="font-size: 28px; font-weight: 700; color: #52c41a;">${successCount}</div>
                <div style="color: #389e0d; font-size: 13px;">Başarılı</div>
              </div>
              ${failCount > 0 ? `
                <div style="background: #fff2f0; padding: 16px 24px; border-radius: 12px;">
                  <div style="font-size: 28px; font-weight: 700; color: #ff4d4f;">${failCount}</div>
                  <div style="color: #cf1322; font-size: 13px;">Başarısız</div>
                </div>
              ` : ''}
            </div>

            ${failCount > 0 ? `
              <div style="text-align: left; background: #fff2f0; padding: 12px; border-radius: 8px; max-height: 150px; overflow-y: auto;">
                <div style="font-weight: 600; color: #a8071a; margin-bottom: 8px;">Hatalı Tenant'lar:</div>
                ${results.filter(r => !r.success).map(r => `
                  <div style="margin-bottom: 6px; font-size: 13px;">
                    <span style="color: #cf1322;">✕</span> ${r.tenantName}: ${r.error}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `,
        icon: failCount === 0 ? 'success' : 'warning',
        confirmButtonText: 'Tamam',
        confirmButtonColor: failCount === 0 ? '#52c41a' : '#faad14'
      });

      loadMigrations();
    } catch (error: any) {
      message.error(error.message || 'Toplu migration başarısız');
    } finally {
      setApplyingAll(false);
    }
  };

  // Preview migration SQL
  const handlePreviewMigration = async (tenantId: string, moduleName: string, migrationName: string) => {
    setLoadingPreview(true);
    setPreviewDrawerVisible(true);
    try {
      const preview = await migrationService.getMigrationScriptPreview(tenantId, moduleName, migrationName);
      setPreviewData(preview);
    } catch (error: any) {
      message.error(error.message || 'SQL önizleme alınamadı');
      setPreviewDrawerVisible(false);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Rollback migration
  const handleRollbackMigration = async (tenantId: string, moduleName: string, migrationName: string) => {
    const result = await Swal.fire({
      title: '⚠️ Migration Geri Al',
      html: `
        <div style="text-align: left; padding: 16px 0;">
          <div style="background: #fff1f0; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
            <div style="font-size: 14px; color: #cf1322;">
              <strong>${migrationName}</strong> migration'ı geri alınacak.
            </div>
          </div>
          <div style="background: #fff1f0; border: 1px solid #ffccc7; padding: 12px; border-radius: 8px;">
            <div style="color: #a8071a; font-size: 13px;">
              ⚠️ Bu işlem veri kaybına neden olabilir!
            </div>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Geri Al',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#ff4d4f',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const rollbackResult = await migrationService.rollbackMigration(tenantId, moduleName, migrationName);
      if (rollbackResult.success) {
        message.success(rollbackResult.message);
        loadMigrations();
      } else {
        message.error(rollbackResult.message || 'Geri alma başarısız');
      }
    } catch (error: any) {
      message.error(error.message || 'Rollback işlemi başarısız');
    }
  };

  // Load Scheduled Migrations
  const loadScheduledMigrations = async () => {
    setLoadingScheduled(true);
    try {
      const data = await migrationService.getScheduledMigrations();
      setScheduledMigrations(data);
    } catch (error: any) {
      message.error(error.message || 'Zamanlanmış migration listesi yüklenemedi');
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
      console.error('Settings load error:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (values: any) => {
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

  // Cancel Scheduled Migration
  const handleCancelScheduled = async (scheduleId: string) => {
    try {
      await migrationService.cancelScheduledMigration(scheduleId);
      message.success('Zamanlanmış migration iptal edildi');
      loadScheduledMigrations();
    } catch (error: any) {
      message.error(error.message || 'İptal işlemi başarısız');
    }
  };

  // Filtered tenants
  const filteredTenants = tenantMigrations.filter(tenant => {
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesSearch = !searchText ||
      tenant.tenantName.toLowerCase().includes(searchText.toLowerCase()) ||
      tenant.tenantCode.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Statistics
  const totalPending = tenantMigrations.reduce((sum, t) => sum + t.totalPending, 0);
  const totalCompleted = tenantMigrations.filter(t => !t.hasPendingMigrations && !t.error).length;
  const totalWithErrors = tenantMigrations.filter(t => t.error).length;
  const totalWithPending = tenantMigrations.filter(t => t.hasPendingMigrations).length;

  // Tenant Card Component
  const TenantCard = ({ tenant }: { tenant: ExtendedTenantMigration }) => {
    const isApplying = applyingTenantId === tenant.tenantId;

    return (
      <Card
        hoverable
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: tenant.error ? '2px solid #ff4d4f' :
                  tenant.hasPendingMigrations ? '2px solid #faad14' : '2px solid #52c41a',
          opacity: isApplying ? 0.7 : 1,
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header */}
        <div style={{
          background: tenant.error ? 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)' :
                     tenant.hasPendingMigrations ? 'linear-gradient(135deg, #fffbe6 0%, #ffe58f 100%)' :
                     'linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)',
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text strong style={{ fontSize: 16 }}>{tenant.tenantName}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>{tenant.tenantCode}</Text>
              </div>
            </div>
            <Tag
              color={tenant.error ? 'error' : tenant.hasPendingMigrations ? 'warning' : 'success'}
              icon={tenant.error ? <CloseCircleOutlined /> :
                    tenant.hasPendingMigrations ? <ClockCircleOutlined /> :
                    <CheckCircleOutlined />}
            >
              {tenant.error ? 'Hata' :
               tenant.hasPendingMigrations ? 'Bekliyor' : 'Güncel'}
            </Tag>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '16px 20px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title={<span style={{ fontSize: 12 }}>Bekleyen</span>}
                value={tenant.totalPending}
                valueStyle={{ color: tenant.totalPending > 0 ? '#faad14' : '#8c8c8c', fontSize: 20 }}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<span style={{ fontSize: 12 }}>Uygulanan</span>}
                value={tenant.totalApplied}
                valueStyle={{ color: '#52c41a', fontSize: 20 }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
          </Row>

          {tenant.error && (
            <Alert
              message={tenant.error}
              type="error"
              showIcon
              style={{ marginTop: 12, fontSize: 12 }}
            />
          )}

          {/* Pending Migrations Preview */}
          {tenant.pendingMigrations.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Modüller:</Text>
              <div style={{ marginTop: 4 }}>
                {tenant.pendingMigrations.slice(0, 3).map(m => (
                  <Tag key={m.module} color="orange" style={{ marginBottom: 4 }}>
                    {m.module} ({m.migrations.length})
                  </Tag>
                ))}
                {tenant.pendingMigrations.length > 3 && (
                  <Tag color="default">+{tenant.pendingMigrations.length - 3} daha</Tag>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            {tenant.hasPendingMigrations && !tenant.error && (
              <Button
                type="primary"
                icon={isApplying ? <LoadingOutlined /> : <PlayCircleOutlined />}
                onClick={() => handleApplyMigration(tenant.tenantId, tenant.tenantName)}
                size="small"
                loading={isApplying}
                disabled={isApplying}
              >
                {isApplying ? 'Uygulanıyor' : 'Uygula'}
              </Button>
            )}
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedTenant(tenant);
                setDetailDrawerVisible(true);
              }}
              size="small"
              style={{ flex: tenant.hasPendingMigrations && !tenant.error ? undefined : 1 }}
            >
              Detay
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  // Table columns
  const tableColumns = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_: any, record: ExtendedTenantMigration) => (
        <Space>
          <Avatar
            style={{
              backgroundColor: record.error ? '#ff4d4f' :
                              record.hasPendingMigrations ? '#faad14' : '#52c41a'
            }}
            icon={<DatabaseOutlined />}
          />
          <div>
            <div><Text strong>{record.tenantName}</Text></div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.tenantCode}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_: any, record: ExtendedTenantMigration) => (
        <Tag
          color={record.error ? 'error' : record.hasPendingMigrations ? 'warning' : 'success'}
          icon={record.error ? <CloseCircleOutlined /> :
                record.hasPendingMigrations ? <ClockCircleOutlined /> :
                <CheckCircleOutlined />}
        >
          {record.error ? 'Hata' : record.hasPendingMigrations ? 'Bekliyor' : 'Güncel'}
        </Tag>
      ),
    },
    {
      title: 'Bekleyen',
      dataIndex: 'totalPending',
      key: 'totalPending',
      width: 100,
      render: (val: number) => (
        <Badge count={val} showZero style={{ backgroundColor: val > 0 ? '#faad14' : '#d9d9d9' }} />
      ),
    },
    {
      title: 'Uygulanan',
      dataIndex: 'totalApplied',
      key: 'totalApplied',
      width: 100,
      render: (val: number) => (
        <Badge count={val} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Modüller',
      key: 'modules',
      render: (_: any, record: ExtendedTenantMigration) => (
        <Space size={4} wrap>
          {record.pendingMigrations.slice(0, 2).map(m => (
            <Tag key={m.module} color="orange" style={{ margin: 0 }}>
              {m.module}
            </Tag>
          ))}
          {record.pendingMigrations.length > 2 && (
            <Tag color="default">+{record.pendingMigrations.length - 2}</Tag>
          )}
          {record.pendingMigrations.length === 0 && <Text type="secondary">-</Text>}
        </Space>
      ),
    },
    {
      title: 'İşlem',
      key: 'actions',
      width: 180,
      render: (_: any, record: ExtendedTenantMigration) => {
        const isApplying = applyingTenantId === record.tenantId;
        return (
          <Space>
            {record.hasPendingMigrations && !record.error && (
              <Button
                type="primary"
                size="small"
                icon={isApplying ? <LoadingOutlined /> : <PlayCircleOutlined />}
                onClick={() => handleApplyMigration(record.tenantId, record.tenantName)}
                loading={isApplying}
              >
                Uygula
              </Button>
            )}
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedTenant(record);
                setDetailDrawerVisible(true);
              }}
            >
              Detay
            </Button>
          </Space>
        );
      },
    },
  ];

  // Overview Tab Content
  const renderOverviewTab = () => (
    <>
      {/* Action Bar */}
      <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
        <Row gutter={16} align="middle" justify="space-between">
          <Col>
            <Space size="middle">
              <Input
                placeholder="Tenant ara..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
              <Segmented
                options={[
                  { value: 'all', label: `Tümü (${tenantMigrations.length})` },
                  { value: 'pending', label: <><ClockCircleOutlined /> Bekleyen ({totalWithPending})</> },
                  { value: 'completed', label: <><CheckCircleOutlined /> Güncel ({totalCompleted})</> },
                  { value: 'error', label: <><CloseCircleOutlined /> Hatalı ({totalWithErrors})</> },
                ]}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as StatusFilter)}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title={`Son güncelleme: ${dayjs(lastRefreshed).format('HH:mm:ss')}`}>
                <Button icon={<ReloadOutlined spin={loading} />} onClick={() => loadMigrations()}>
                  Yenile
                </Button>
              </Tooltip>
              <Tooltip title="Otomatik yenileme (30sn)">
                <Switch
                  checkedChildren={<SyncOutlined />}
                  unCheckedChildren={<SyncOutlined />}
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                />
              </Tooltip>
              <Segmented
                options={[
                  { value: 'card', icon: <AppstoreOutlined /> },
                  { value: 'table', icon: <UnorderedListOutlined /> },
                ]}
                value={viewMode}
                onChange={(val) => setViewMode(val as 'card' | 'table')}
              />
              {totalWithPending > 0 && (
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={handleApplyAllMigrations}
                  loading={applyingAll}
                  danger
                >
                  Tümünü Uygula ({totalWithPending})
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Warnings */}
      {totalWithPending > 0 && (
        <Alert
          message={
            <Space>
              <WarningOutlined />
              <strong>{totalWithPending}</strong> tenant'ta <strong>{totalPending}</strong> bekleyen migration bulunuyor
            </Space>
          }
          description="Sisteminizin güncel kalması için bekleyen migration'ları uygulamanız önerilir."
          type="warning"
          showIcon={false}
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary" ghost onClick={handleApplyAllMigrations}>
              Hepsini Uygula
            </Button>
          }
        />
      )}

      {/* Content */}
      {filteredTenants.length === 0 && !loading ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={searchText || statusFilter !== 'all' ? 'Filtre kriterlerine uygun tenant bulunamadı' : 'Tenant bulunamadı'}
          >
            {(searchText || statusFilter !== 'all') && (
              <Button type="primary" onClick={() => { setSearchText(''); setStatusFilter('all'); }}>
                Filtreleri Temizle
              </Button>
            )}
          </Empty>
        </Card>
      ) : viewMode === 'card' ? (
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            {filteredTenants.map((tenant) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={tenant.tenantId}>
                <TenantCard tenant={tenant} />
              </Col>
            ))}
          </Row>
        </Spin>
      ) : (
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            dataSource={filteredTenants}
            columns={tableColumns}
            rowKey="tenantId"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Toplam ${total} tenant` }}
          />
        </Card>
      )}
    </>
  );

  // Guide Tab Content
  const renderGuideTab = () => (
    <Row gutter={24}>
      <Col xs={24} lg={16}>
        <Card title={<><RocketOutlined /> Migration Uygulama Rehberi</>}>
          <Timeline
            items={[
              {
                color: 'blue',
                dot: <ExperimentOutlined style={{ fontSize: 16 }} />,
                children: (
                  <div>
                    <Text strong>1. Test Ortamında Deneyin</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      Migration'ı önce test veritabanında çalıştırın ve sonuçları doğrulayın.
                    </Paragraph>
                  </div>
                ),
              },
              {
                color: 'green',
                dot: <SafetyOutlined style={{ fontSize: 16 }} />,
                children: (
                  <div>
                    <Text strong>2. Veritabanı Yedeği Alın</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      Production veritabanının tam yedeğini alın. Sorun olursa geri dönebilirsiniz.
                    </Paragraph>
                  </div>
                ),
              },
              {
                color: 'orange',
                dot: <ClockCircleOutlined style={{ fontSize: 16 }} />,
                children: (
                  <div>
                    <Text strong>3. Uygun Zaman Seçin</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      En az kullanıcı trafiğinin olduğu saatleri tercih edin (gece veya hafta sonu).
                    </Paragraph>
                  </div>
                ),
              },
              {
                color: 'purple',
                dot: <RocketOutlined style={{ fontSize: 16 }} />,
                children: (
                  <div>
                    <Text strong>4. Migration'ı Çalıştırın</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      Hazırlıklar tamamlandıktan sonra migration'ı production ortamında uygulayın.
                    </Paragraph>
                  </div>
                ),
              },
              {
                color: 'green',
                dot: <CheckCircleOutlined style={{ fontSize: 16 }} />,
                children: (
                  <div>
                    <Text strong>5. Doğrulama Yapın</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      Migration sonrası uygulamanın düzgün çalıştığını ve verilerin doğru olduğunu kontrol edin.
                    </Paragraph>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <Card title={<><CodeOutlined /> CLI Komutları</>} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>.NET CLI</Title>
              <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 8, fontSize: 12 }}>
{`# Migration ekle
dotnet ef migrations add MigrationName \\
  -p src/Infrastructure/Stocker.Persistence

# Migration listele
dotnet ef migrations list

# Migration kaldır (son eklenen)
dotnet ef migrations remove

# SQL script oluştur
dotnet ef migrations script`}
              </pre>
            </Col>
            <Col span={12}>
              <Title level={5}>Package Manager Console</Title>
              <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 8, fontSize: 12 }}>
{`# Migration ekle
Add-Migration MigrationName \\
  -Project Stocker.Persistence

# Migration listele
Get-Migration

# Migration kaldır
Remove-Migration

# SQL script
Script-Migration`}
              </pre>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title={<><InfoCircleOutlined /> Önemli Bilgiler</>}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              message="Transaction Güvenliği"
              description="Tüm migration'lar otomatik olarak transaction içinde çalışır. Hata durumunda değişiklikler geri alınır."
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

        <Card title={<><ApiOutlined /> Kaynaklar</>} style={{ marginTop: 16 }}>
          <List
            size="small"
            dataSource={[
              { title: 'EF Core Migrations Docs', url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/' },
              { title: 'EF Core CLI Reference', url: 'https://learn.microsoft.com/en-us/ef/core/cli/dotnet' },
              { title: 'Migration Best Practices', url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying' },
            ]}
            renderItem={item => (
              <List.Item>
                <Button type="link" href={item.url} target="_blank" style={{ padding: 0 }}>
                  <FileTextOutlined /> {item.title}
                </Button>
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  // Scheduled Migrations Tab Content
  const renderScheduledTab = () => (
    <Card
      title="Zamanlanmış Migration'lar"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadScheduledMigrations}>
            Yenile
          </Button>
          <Button type="primary" icon={<ScheduleOutlined />} onClick={() => setScheduleModalVisible(true)}>
            Yeni Zamanlama
          </Button>
        </Space>
      }
    >
      <Table
        loading={loadingScheduled}
        dataSource={scheduledMigrations}
        rowKey="scheduleId"
        locale={{ emptyText: <Empty description="Zamanlanmış migration bulunmuyor" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
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
            title: 'Migration',
            key: 'migration',
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                {record.migrationName ? (
                  <>
                    <Text>{record.migrationName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Modül: {record.moduleName}</Text>
                  </>
                ) : (
                  <Text type="secondary">Tüm bekleyen migration'lar</Text>
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
                <Text>{dayjs(time).format('DD MMMM YYYY HH:mm')}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(time).fromNow()}</Text>
              </Space>
            ),
          },
          {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
              <Tag color={
                status === 'Pending' ? 'processing' :
                status === 'Running' ? 'blue' :
                status === 'Completed' ? 'success' : 'error'
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
  const renderSettingsTab = () => (
    <Row gutter={24}>
      <Col xs={24} lg={12}>
        <Card title={<><SettingOutlined /> Migration Ayarları</>} loading={loadingSettings}>
          <Form
            form={settingsForm}
            layout="vertical"
            onFinish={handleSaveSettings}
            initialValues={settings || {}}
          >
            <Form.Item
              name="autoApplyMigrations"
              label="Otomatik Migration Uygula"
              valuePropName="checked"
              extra="Yeni migration'lar tespit edildiğinde otomatik olarak uygular"
            >
              <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
            </Form.Item>

            <Form.Item
              name="backupBeforeMigration"
              label="Migration Öncesi Yedek Al"
              valuePropName="checked"
              extra="Her migration öncesi otomatik veritabanı yedeği oluşturur"
            >
              <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
            </Form.Item>

            <Form.Item
              name="enableScheduledMigrations"
              label="Zamanlanmış Migration'ları Etkinleştir"
              valuePropName="checked"
            >
              <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
            </Form.Item>

            <Form.Item
              name="migrationTimeout"
              label="Migration Timeout (saniye)"
              extra="Migration işleminin maksimum çalışma süresi"
            >
              <InputNumber min={30} max={3600} style={{ width: '100%' }} />
            </Form.Item>

            <Divider />

            <Form.Item
              name="notifyOnMigrationComplete"
              label="Başarılı Migration Bildirimi"
              valuePropName="checked"
            >
              <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
            </Form.Item>

            <Form.Item
              name="notifyOnMigrationFailure"
              label="Başarısız Migration Bildirimi"
              valuePropName="checked"
            >
              <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
            </Form.Item>

            <Form.Item
              name="notificationEmails"
              label="Bildirim E-posta Adresleri"
            >
              <Select
                mode="tags"
                placeholder="E-posta adreslerini girin ve Enter'a basın"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loadingSettings}>
                Kaydet
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title={<><DatabaseOutlined /> Sistem Bilgileri</>}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Veritabanı">PostgreSQL</Descriptions.Item>
            <Descriptions.Item label="Mimari">Multi-Tenant (Her tenant ayrı şema)</Descriptions.Item>
            <Descriptions.Item label="ORM">Entity Framework Core 8.0</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <Tag color="success" icon={<CheckCircleOutlined />}>Bağlı</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Toplam Tenant">{tenantMigrations.length}</Descriptions.Item>
            <Descriptions.Item label="Bekleyen Migration">{totalPending}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  );

  // Tab items
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <AppstoreOutlined />
          Genel Bakış
          {totalWithPending > 0 && <Badge count={totalWithPending} style={{ marginLeft: 8 }} />}
        </span>
      ),
      children: renderOverviewTab(),
    },
    {
      key: 'guide',
      label: (
        <span>
          <FileTextOutlined />
          Uygulama Rehberi
        </span>
      ),
      children: renderGuideTab(),
    },
    {
      key: 'scheduled',
      label: (
        <span>
          <ClockCircleOutlined />
          Zamanlanmış
          {scheduledMigrations.filter(s => s.status === 'Pending').length > 0 && (
            <Badge count={scheduledMigrations.filter(s => s.status === 'Pending').length} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
      children: renderScheduledTab(),
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined />
          Ayarlar
        </span>
      ),
      children: renderSettingsTab(),
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
            { title: 'Müşteri Yönetimi' },
            { title: 'Migrations' },
          ],
        },
      }}
    >
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '20px 24px' }} hoverable>
            <Statistic
              title={<Text type="secondary">Toplam Tenant</Text>}
              value={tenantMigrations.length}
              prefix={<DatabaseOutlined style={{ color: '#667eea' }} />}
              valueStyle={{ fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '20px 24px' }} hoverable>
            <Statistic
              title={<Text type="secondary">Güncel</Text>}
              value={totalCompleted}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '20px 24px' }} hoverable>
            <Statistic
              title={<Text type="secondary">Bekleyen Migration</Text>}
              value={totalPending}
              prefix={<ClockCircleOutlined style={{ color: totalPending > 0 ? '#faad14' : '#52c41a' }} />}
              valueStyle={{ color: totalPending > 0 ? '#faad14' : '#52c41a', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bodyStyle={{ padding: '20px 24px' }} hoverable>
            <Statistic
              title={<Text type="secondary">Hatalı Tenant</Text>}
              value={totalWithErrors}
              prefix={<CloseCircleOutlined style={{ color: totalWithErrors > 0 ? '#ff4d4f' : '#d9d9d9' }} />}
              valueStyle={{ color: totalWithErrors > 0 ? '#ff4d4f' : '#d9d9d9', fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            if (key === 'scheduled') loadScheduledMigrations();
            if (key === 'settings') loadSettings();
          }}
          items={tabItems}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={
          <Space>
            <DatabaseOutlined />
            {selectedTenant?.tenantName} - Migration Detayları
          </Space>
        }
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        width={600}
        extra={
          selectedTenant?.hasPendingMigrations && !selectedTenant?.error && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                handleApplyMigration(selectedTenant.tenantId, selectedTenant.tenantName);
                setDetailDrawerVisible(false);
              }}
            >
              Tümünü Uygula
            </Button>
          )
        }
      >
        {selectedTenant && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Tenant Info */}
            <Card
              size="small"
              style={{
                background: selectedTenant.hasPendingMigrations ? '#fffbe6' : '#f6ffed',
                border: `1px solid ${selectedTenant.hasPendingMigrations ? '#ffe58f' : '#b7eb8f'}`
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong style={{ fontSize: 16 }}>{selectedTenant.tenantName}</Text>
                  <div><Text type="secondary">{selectedTenant.tenantCode}</Text></div>
                </Col>
                <Col>
                  <Tag
                    color={selectedTenant.hasPendingMigrations ? 'warning' : 'success'}
                    icon={selectedTenant.hasPendingMigrations ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
                    style={{ fontSize: 14, padding: '4px 12px' }}
                  >
                    {selectedTenant.hasPendingMigrations ? 'Bekleyen Migration Var' : 'Güncel'}
                  </Tag>
                </Col>
              </Row>
            </Card>

            {/* Error */}
            {selectedTenant.error && (
              <Alert
                message="Bağlantı Hatası"
                description={selectedTenant.error}
                type="error"
                showIcon
              />
            )}

            {/* Pending Migrations */}
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#faad14' }} />
                  Bekleyen Migration'lar
                  <Tag>{selectedTenant.totalPending}</Tag>
                </Space>
              }
              size="small"
            >
              {selectedTenant.pendingMigrations.length > 0 ? (
                <Collapse ghost accordion>
                  {selectedTenant.pendingMigrations.map(module => (
                    <Panel
                      header={
                        <Space>
                          <BranchesOutlined />
                          <Text strong>{module.module}</Text>
                          <Tag color="orange">{module.migrations.length}</Tag>
                        </Space>
                      }
                      key={module.module}
                    >
                      <List
                        size="small"
                        dataSource={module.migrations}
                        renderItem={migration => (
                          <List.Item
                            actions={[
                              <Tooltip title="SQL Önizle" key="preview">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={() => handlePreviewMigration(selectedTenant.tenantId, module.module, migration)}
                                />
                              </Tooltip>,
                              <Tooltip title="Zamanla" key="schedule">
                                <Button
                                  type="text"
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
                            <Text code style={{ fontSize: 12 }}>{migration}</Text>
                          </List.Item>
                        )}
                      />
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bekleyen migration yok" />
              )}
            </Card>

            {/* Applied Migrations */}
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  Uygulanan Migration'lar
                  <Tag color="green">{selectedTenant.totalApplied}</Tag>
                </Space>
              }
              size="small"
            >
              {selectedTenant.appliedMigrations.length > 0 ? (
                <Collapse ghost accordion>
                  {selectedTenant.appliedMigrations.map(module => (
                    <Panel
                      header={
                        <Space>
                          <BranchesOutlined />
                          <Text strong>{module.module}</Text>
                          <Tag color="green">{module.migrations.length}</Tag>
                        </Space>
                      }
                      key={module.module}
                    >
                      <List
                        size="small"
                        dataSource={module.migrations.slice(0, 10)}
                        renderItem={migration => (
                          <List.Item
                            actions={[
                              <Tooltip title="Geri Al" key="rollback">
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<RollbackOutlined />}
                                  onClick={() => handleRollbackMigration(selectedTenant.tenantId, module.module, migration)}
                                />
                              </Tooltip>,
                            ]}
                          >
                            <Text type="secondary" style={{ fontSize: 12 }}>{migration}</Text>
                          </List.Item>
                        )}
                        footer={module.migrations.length > 10 && (
                          <Text type="secondary">...ve {module.migrations.length - 10} migration daha</Text>
                        )}
                      />
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Uygulanan migration yok" />
              )}
            </Card>
          </Space>
        )}
      </Drawer>

      {/* SQL Preview Drawer */}
      <Drawer
        title={<Space><CodeOutlined /> SQL Script Önizleme</Space>}
        open={previewDrawerVisible}
        onClose={() => setPreviewDrawerVisible(false)}
        width={700}
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
                  {previewData.affectedTables.map(table => (
                    <Tag key={table} color="blue" style={{ marginBottom: 4 }}>{table}</Tag>
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
      </Drawer>

      {/* Schedule Migration Modal */}
      <Modal
        title={<Space><ScheduleOutlined /> Migration Zamanla</Space>}
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
            extra="Boş bırakırsanız tüm bekleyen migration'lar uygulanır"
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
    </PageContainer>
  );
};

export default TenantMigrations;
