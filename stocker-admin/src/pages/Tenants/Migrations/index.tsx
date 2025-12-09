import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Progress,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
  Divider,
  Timeline,
  Steps,
  Result,
  Tooltip,
  Badge,
  Descriptions,
  Checkbox,
  Radio,
  Tabs,
  Collapse,
  Switch,
  Empty,
  Spin
} from 'antd';
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
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { migrationService, TenantMigrationStatusDto, ScheduledMigrationDto, MigrationSettingsDto } from '../../../services/api/migrationService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Extended type for UI state
interface ExtendedTenantMigration extends TenantMigrationStatusDto {
  status: 'pending' | 'completed' | 'error';
  totalPending: number;
  totalApplied: number;
}

const TenantMigrations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [tenantMigrations, setTenantMigrations] = useState<ExtendedTenantMigration[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<ExtendedTenantMigration | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  // Scheduled Migrations
  const [scheduledMigrations, setScheduledMigrations] = useState<ScheduledMigrationDto[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  // Settings
  const [settings, setSettings] = useState<MigrationSettingsDto | null>(null);
  const [settingsForm] = Form.useForm();

  // Modals
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createMigrationModalVisible, setCreateMigrationModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  useEffect(() => {
    loadMigrations();
  }, [id]);

  const loadMigrations = async () => {
    setLoading(true);
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
    } catch (error: any) {
      message.error(error.message || 'Migration listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

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
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const applyResult = await migrationService.applyMigration(tenantId);

      await Swal.fire({
        title: '✅ Başarılı!',
        html: `
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
        `,
        icon: 'success',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#52c41a',
        timer: 5000,
        timerProgressBar: true
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
      setLoading(false);
    }
  };

  const handleApplyAllMigrations = async () => {
    const pendingTenants = tenantMigrations.filter(t => t.hasPendingMigrations);

    if (pendingTenants.length === 0) {
      message.info('Bekleyen migration bulunmuyor');
      return;
    }

    const result = await Swal.fire({
      title: '🚀 Tüm Migration\'ları Uygula',
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
      confirmButtonText: '✓ Tümünü Uygula',
      cancelButtonText: '✕ İptal',
      confirmButtonColor: '#fa8c16',
      cancelButtonColor: '#d9d9d9',
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) return;

    setLoading(true);
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
      setLoading(false);
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
    try {
      const data = await migrationService.getMigrationSettings();
      setSettings(data);
      settingsForm.setFieldsValue(data);
    } catch (error: any) {
      console.error('Settings load error:', error);
    }
  };

  // Save Settings
  const handleSaveSettings = async (values: any) => {
    try {
      await migrationService.updateMigrationSettings(values);
      message.success('Ayarlar kaydedildi');
      loadSettings();
    } catch (error: any) {
      message.error(error.message || 'Ayarlar kaydedilemedi');
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

  // Statistics
  const totalPending = tenantMigrations.reduce((sum, t) => sum + t.totalPending, 0);
  const totalCompleted = tenantMigrations.filter(t => !t.hasPendingMigrations && !t.error).length;
  const totalWithErrors = tenantMigrations.filter(t => t.error).length;
  const totalWithPending = tenantMigrations.filter(t => t.hasPendingMigrations).length;

  // Tenant Card Component
  const TenantCard = ({ tenant }: { tenant: ExtendedTenantMigration }) => (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: tenant.error ? '2px solid #ff4d4f' :
                tenant.hasPendingMigrations ? '2px solid #faad14' : '2px solid #52c41a'
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

        {/* Pending Migrations List */}
        {tenant.pendingMigrations.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Collapse ghost size="small">
              {tenant.pendingMigrations.map(m => (
                <Panel header={<Text type="secondary">{m.module} ({m.migrations.length})</Text>} key={m.module}>
                  {m.migrations.map((migration, idx) => (
                    <div key={idx} style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>• {migration}</div>
                  ))}
                </Panel>
              ))}
            </Collapse>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          {tenant.hasPendingMigrations && !tenant.error && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleApplyMigration(tenant.tenantId, tenant.tenantName)}
              size="small"
            >
              Uygula
            </Button>
          )}
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedTenant(tenant);
              setDetailModalVisible(true);
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

  // Empty State
  const EmptyState = () => (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <DatabaseOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
      <Title level={4} style={{ color: '#8c8c8c', marginBottom: 8 }}>
        Tenant Bulunamadı
      </Title>
      <Paragraph style={{ color: '#bfbfbf', marginBottom: 24 }}>
        Henüz hiç tenant kaydı bulunmuyor veya migration durumu alınamadı.
      </Paragraph>
      <Button type="primary" icon={<ReloadOutlined />} onClick={loadMigrations}>
        Yenile
      </Button>
    </div>
  );

  // Overview Tab Content
  const renderOverviewTab = () => (
    <>
      {/* Quick Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space size="large">
              <Statistic
                title="Toplam Tenant"
                value={tenantMigrations.length}
                prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              />
              <Divider type="vertical" style={{ height: 40 }} />
              <Statistic
                title="Bekleyen Migration"
                value={totalPending}
                valueStyle={{ color: totalPending > 0 ? '#faad14' : '#52c41a' }}
                prefix={<ClockCircleOutlined />}
              />
              <Divider type="vertical" style={{ height: 40 }} />
              <Statistic
                title="Güncel Tenant"
                value={totalCompleted}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
              {totalWithErrors > 0 && (
                <>
                  <Divider type="vertical" style={{ height: 40 }} />
                  <Statistic
                    title="Hatalı"
                    value={totalWithErrors}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Görünüm">
                <Button.Group>
                  <Button
                    icon={<AppstoreOutlined />}
                    type={viewMode === 'card' ? 'primary' : 'default'}
                    onClick={() => setViewMode('card')}
                  />
                  <Button
                    icon={<UnorderedListOutlined />}
                    type={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                  />
                </Button.Group>
              </Tooltip>
              <Button icon={<ReloadOutlined />} onClick={loadMigrations}>
                Yenile
              </Button>
              {totalWithPending > 0 && (
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={handleApplyAllMigrations}
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
          message={`${totalWithPending} tenant'ta bekleyen migration bulunuyor`}
          description="Sisteminizin güncel kalması için bekleyen migration'ları uygulamanız önerilir."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Tenant Cards */}
      {tenantMigrations.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            {tenantMigrations.map((tenant) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={tenant.tenantId}>
                <TenantCard tenant={tenant} />
              </Col>
            ))}
          </Row>
        </Spin>
      )}
    </>
  );

  // Guide Tab Content
  const renderGuideTab = () => (
    <Row gutter={16}>
      <Col span={16}>
        <Card title="🚀 Migration Oluşturma Adımları">
          <Steps
            direction="vertical"
            current={-1}
            items={[
              {
                title: '1. Domain Model Değişikliği',
                description: (
                  <div>
                    <Text>Entity'lerde gerekli değişiklikleri yapın</Text>
                    <pre style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 12,
                      marginTop: 8,
                      overflow: 'auto'
                    }}>
{`// Örnek: Yeni property ekleme
public class Product : AggregateRoot<Guid>
{
    public string Name { get; private set; }
    // Yeni alan
    public string Description { get; private set; }
}`}
                    </pre>
                  </div>
                ),
                icon: <EditOutlined />
              },
              {
                title: '2. Migration Oluştur',
                description: (
                  <div>
                    <Text>Terminal'de komutu çalıştırın:</Text>
                    <pre style={{
                      background: '#1f1f1f',
                      color: '#d4d4d4',
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 12,
                      marginTop: 8
                    }}>
{`# .NET CLI
dotnet ef migrations add MigrationName \\
  -p src/Infrastructure/Stocker.Persistence

# Visual Studio PMC
Add-Migration MigrationName -Project Stocker.Persistence`}
                    </pre>
                  </div>
                ),
                icon: <CodeOutlined />
              },
              {
                title: '3. Migration Dosyasını İncele',
                description: 'Migrations klasöründe oluşturulan dosyayı kontrol edin',
                icon: <FileTextOutlined />
              },
              {
                title: '4. Backend\'i Derle ve Çalıştır',
                description: 'API projesini yeniden derleyip çalıştırın',
                icon: <SyncOutlined />
              },
              {
                title: '5. Bu Sayfadan Uygula',
                description: 'Tenant kartlarından veya toplu güncelle ile uygulayın',
                icon: <CheckCircleOutlined />
              }
            ]}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card title="📚 Hızlı Referans" style={{ marginBottom: 16 }}>
          <Collapse size="small">
            <Panel header=".NET CLI Komutları" key="1">
              <pre style={{ fontSize: 11, margin: 0 }}>
{`# Migration ekle
dotnet ef migrations add Name

# Migration listele
dotnet ef migrations list

# Migration kaldır
dotnet ef migrations remove

# SQL script oluştur
dotnet ef migrations script`}
              </pre>
            </Panel>
            <Panel header="PMC Komutları" key="2">
              <pre style={{ fontSize: 11, margin: 0 }}>
{`# Migration ekle
Add-Migration Name

# Migration listele
Get-Migration

# Migration kaldır
Remove-Migration

# SQL script
Script-Migration`}
              </pre>
            </Panel>
          </Collapse>
        </Card>

        <Card title="🔗 Kaynaklar">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="link"
              icon={<FileTextOutlined />}
              href="https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/"
              target="_blank"
              style={{ padding: 0 }}
            >
              EF Core Migrations Docs
            </Button>
            <Button
              type="link"
              icon={<CodeOutlined />}
              href="https://learn.microsoft.com/en-us/ef/core/cli/dotnet"
              target="_blank"
              style={{ padding: 0 }}
            >
              EF Core CLI Reference
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Scheduled Migrations Tab Content
  const renderScheduledTab = () => (
    <Card
      title="Zamanlanmış Migration'lar"
      extra={
        <Button icon={<ReloadOutlined />} onClick={loadScheduledMigrations}>
          Yenile
        </Button>
      }
    >
      {loadingScheduled ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : scheduledMigrations.length === 0 ? (
        <Empty
          description="Zamanlanmış migration bulunmuyor"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Timeline
          items={scheduledMigrations.map(s => ({
            color: s.status === 'Pending' ? 'blue' : s.status === 'Completed' ? 'green' : 'red',
            children: (
              <Card size="small" style={{ marginBottom: 8 }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong>{s.tenantName}</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {s.moduleName} - {s.migrationName}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Zamanlanma: {dayjs(s.scheduledTime).format('DD.MM.YYYY HH:mm')}
                      </Text>
                    </div>
                  </Col>
                  <Col>
                    <Space>
                      <Tag color={s.status === 'Pending' ? 'processing' : s.status === 'Completed' ? 'success' : 'error'}>
                        {s.status === 'Pending' ? 'Bekliyor' : s.status === 'Completed' ? 'Tamamlandı' : 'Hata'}
                      </Tag>
                      {s.status === 'Pending' && (
                        <Button
                          size="small"
                          danger
                          onClick={() => handleCancelScheduled(s.scheduleId)}
                        >
                          İptal
                        </Button>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            )
          }))}
        />
      )}
    </Card>
  );

  // Settings Tab Content
  const renderSettingsTab = () => (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="⚙️ Migration Ayarları">
          <Form
            form={settingsForm}
            layout="vertical"
            onFinish={handleSaveSettings}
            initialValues={settings || {}}
          >
            <Form.Item
              name="autoApplyMigrations"
              label="Otomatik Migration"
              valuePropName="checked"
            >
              <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
            </Form.Item>
            <Text type="secondary" style={{ display: 'block', marginTop: -16, marginBottom: 16, fontSize: 12 }}>
              Yeni migration'lar otomatik olarak uygulanır
            </Text>

            <Form.Item
              name="enableScheduledMigrations"
              label="Zamanlanmış Migration"
              valuePropName="checked"
            >
              <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
            </Form.Item>
            <Text type="secondary" style={{ display: 'block', marginTop: -16, marginBottom: 16, fontSize: 12 }}>
              Migration'ları belirli zamanlarda çalıştırabilirsiniz
            </Text>

            <Form.Item name="rollbackOnError" label="Hata Durumunda">
              <Radio.Group>
                <Radio value={true}>Otomatik Geri Al</Radio>
                <Radio value={false}>Durdur</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="backupBeforeMigration" label="Yedekleme" valuePropName="checked">
              <Checkbox>Migration öncesi otomatik yedek al</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Kaydet
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="📊 Bağlantı Bilgileri">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Veritabanı">
              PostgreSQL / SQL Server
            </Descriptions.Item>
            <Descriptions.Item label="Mimari">
              Multi-Tenant (Her tenant ayrı şema)
            </Descriptions.Item>
            <Descriptions.Item label="ORM">
              Entity Framework Core 8.0
            </Descriptions.Item>
            <Descriptions.Item label="Durum">
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Bağlı
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <DatabaseOutlined style={{ marginRight: 12 }} />
              Database Migrations
            </Title>
            <Text type="secondary">
              Tenant veritabanı migration yönetimi
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<PlusOutlined />}
                onClick={() => setCreateMigrationModalVisible(true)}
              >
                Migration Oluştur
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            if (key === 'scheduled') loadScheduledMigrations();
            if (key === 'settings') loadSettings();
          }}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <AppstoreOutlined />
                  Genel Bakış
                  {totalWithPending > 0 && (
                    <Badge count={totalWithPending} style={{ marginLeft: 8 }} />
                  )}
                </span>
              ),
              children: renderOverviewTab()
            },
            {
              key: 'guide',
              label: (
                <span>
                  <FileTextOutlined />
                  Uygulama Rehberi
                </span>
              ),
              children: renderGuideTab()
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
              children: renderScheduledTab()
            },
            {
              key: 'settings',
              label: (
                <span>
                  <CodeOutlined />
                  Ayarlar
                </span>
              ),
              children: renderSettingsTab()
            }
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <DatabaseOutlined />
            {selectedTenant?.tenantName} - Migration Detayları
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
          selectedTenant?.hasPendingMigrations && !selectedTenant?.error && (
            <Button
              key="apply"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                handleApplyMigration(selectedTenant.tenantId, selectedTenant.tenantName);
                setDetailModalVisible(false);
              }}
            >
              Migration Uygula
            </Button>
          )
        ]}
      >
        {selectedTenant && (
          <>
            {/* Tenant Info */}
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: selectedTenant.hasPendingMigrations ? '#fffbe6' : '#f6ffed',
                border: `1px solid ${selectedTenant.hasPendingMigrations ? '#ffe58f' : '#b7eb8f'}`
              }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong style={{ fontSize: 16 }}>{selectedTenant.tenantName}</Text>
                  <div>
                    <Text type="secondary">{selectedTenant.tenantCode}</Text>
                  </div>
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
                style={{ marginBottom: 16 }}
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
              style={{ marginBottom: 16 }}
            >
              {selectedTenant.pendingMigrations.length > 0 ? (
                <Collapse ghost>
                  {selectedTenant.pendingMigrations.map(module => (
                    <Panel
                      header={
                        <Space>
                          <Text strong>{module.module}</Text>
                          <Tag color="orange">{module.migrations.length}</Tag>
                        </Space>
                      }
                      key={module.module}
                    >
                      <Timeline
                        items={module.migrations.map(m => ({
                          color: 'orange',
                          children: (
                            <Text code style={{ fontSize: 12 }}>{m}</Text>
                          )
                        }))}
                      />
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
                <Collapse ghost>
                  {selectedTenant.appliedMigrations.map(module => (
                    <Panel
                      header={
                        <Space>
                          <Text strong>{module.module}</Text>
                          <Tag color="green">{module.migrations.length}</Tag>
                        </Space>
                      }
                      key={module.module}
                    >
                      <Timeline
                        items={module.migrations.map(m => ({
                          color: 'green',
                          children: (
                            <Text code style={{ fontSize: 12 }}>{m}</Text>
                          )
                        }))}
                      />
                    </Panel>
                  ))}
                </Collapse>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Uygulanan migration yok"
                />
              )}
            </Card>
          </>
        )}
      </Modal>

      {/* Create Migration Modal */}
      <Modal
        title="🚀 Yeni Migration Oluşturma"
        open={createMigrationModalVisible}
        onCancel={() => setCreateMigrationModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setCreateMigrationModalVisible(false)}>
            Kapat
          </Button>,
          <Button
            key="docs"
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => window.open('https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/', '_blank')}
          >
            EF Core Docs
          </Button>
        ]}
      >
        <Alert
          message="Entity Framework Core Migration"
          description="Migration'lar kod tabanlıdır ve backend projesinden oluşturulur. UI üzerinden doğrudan migration oluşturulamaz."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Steps
          direction="vertical"
          current={-1}
          items={[
            {
              title: '1. Entity Değişikliği Yap',
              description: 'Domain projesinde entity\'lerde değişiklik yapın',
              icon: <EditOutlined />
            },
            {
              title: '2. Migration Oluştur',
              description: (
                <pre style={{ background: '#1f1f1f', color: '#d4d4d4', padding: 12, borderRadius: 8, fontSize: 12 }}>
{`dotnet ef migrations add MigrationName \\
  -p src/Infrastructure/Stocker.Persistence`}
                </pre>
              ),
              icon: <CodeOutlined />
            },
            {
              title: '3. Backend\'i Çalıştır',
              description: 'Migration otomatik olarak algılanır',
              icon: <SyncOutlined />
            },
            {
              title: '4. Bu Sayfadan Uygula',
              description: 'Tenant kartlarından migration uygulayın',
              icon: <CheckCircleOutlined />
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default TenantMigrations;
