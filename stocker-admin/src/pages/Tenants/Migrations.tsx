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
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import {
  migrationService,
  type TenantMigrationStatusDto,
  type ApplyMigrationResultDto,
  type MigrationHistoryDto,
} from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

interface ExtendedTenantMigration extends TenantMigrationStatusDto {
  id: string;
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

  useEffect(() => {
    loadMigrations();
  }, []);

  const loadMigrations = async () => {
    setLoading(true);
    try {
      const data = await migrationService.getPendingMigrations();
      const extended = data.map(tenant => ({
        ...tenant,
        id: tenant.tenantId,
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
    setSelectedTenant(tenant);

    try {
      const history = await migrationService.getMigrationHistory(tenant.tenantId);
      setMigrationHistory(history);
    } catch (error: any) {
      message.error('Migration geçmişi yüklenirken hata oluştu');
    }
  };

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
                    <List.Item>
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
                    <List.Item>
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
              rowKey="id"
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
        </Tabs>
      )}
    </PageContainer>
  );
};

export default MigrationsPage;
