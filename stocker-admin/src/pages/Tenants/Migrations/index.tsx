import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
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
  List,
  Tooltip,
  Badge,
  Descriptions,
  Upload,
  Checkbox,
  Radio,
  Tabs,
  Collapse
} from 'antd';
import {
  DatabaseOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  HistoryOutlined,
  RollbackOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  FileTextOutlined,
  CodeOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import dayjs from 'dayjs';
import { tenantService } from '../../../services/tenantService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface Migration {
  id: string;
  name: string;
  version: string;
  type: 'schema' | 'data' | 'seed' | 'rollback';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  source: 'manual' | 'automatic' | 'scheduled';
  executedAt?: string;
  executedBy?: string;
  duration?: number;
  affectedTables: string[];
  affectedRows: number;
  sqlScript?: string;
  error?: string;
  canRollback: boolean;
  rollbackVersion?: string;
}

interface MigrationHistory {
  id: string;
  migrationId: string;
  action: 'apply' | 'rollback';
  timestamp: string;
  user: string;
  status: 'success' | 'failed';
  details: string;
}

interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  migrations: string[];
  schedule?: string;
  autoApply: boolean;
  rollbackOnError: boolean;
  notifications: boolean;
}

const TenantMigrations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [history, setHistory] = useState<MigrationHistory[]>([]);
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null);
  const [activeTab, setActiveTab] = useState('migrations');
  
  // Modals
  const [migrationModalVisible, setMigrationModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [planForm] = Form.useForm();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchMigrations();
    fetchHistory();
  }, [id]);

  const fetchMigrations = async () => {
    setLoading(true);
    try {
      // Fetch real tenant list
      console.log('[Migration UI] Fetching tenants from API...');
      const response = await tenantService.getTenants({ pageSize: 100 });
      console.log('[Migration UI] Tenants fetched:', response.data.length, 'tenants');
      console.log('[Migration UI] Tenant names:', response.data.map(t => t.name));

      // Map tenants to migration items (each tenant can be migrated)
      const tenantMigrations: Migration[] = response.data.map((tenant, index) => ({
        id: tenant.id,
        name: `${tenant.name} (${tenant.code})`,
        version: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        type: 'schema' as const,
        status: tenant.database?.status === 'migrating' ? 'running' as const : 'pending' as const,
        source: 'manual' as const,
        affectedTables: ['Tenant DB', 'CRM Tables (if active)'],
        affectedRows: 0,
        canRollback: false,
      }));

      console.log('[Migration UI] Setting migrations state with', tenantMigrations.length, 'items');
      setMigrations(tenantMigrations);
    } catch (error) {
      console.error('[Migration UI] Error fetching tenants for migration:', error);
      message.error('Tenant listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    // Simulated data
    setHistory([
      {
        id: '1',
        migrationId: '1',
        action: 'apply',
        timestamp: '2024-01-15T10:30:00',
        user: 'System',
        status: 'success',
        details: 'Migration applied successfully'
      },
      {
        id: '2',
        migrationId: '2',
        action: 'apply',
        timestamp: '2024-01-14T15:20:00',
        user: 'admin@example.com',
        status: 'success',
        details: 'Data migration completed'
      },
      {
        id: '3',
        migrationId: '5',
        action: 'apply',
        timestamp: '2024-01-13T14:30:00',
        user: 'admin@example.com',
        status: 'failed',
        details: 'Foreign key constraint violation'
      }
    ]);
  };

  const handleRunMigration = async (migrationId: string) => {
    Modal.confirm({
      title: 'Migration Çalıştır',
      content: 'Bu migration\'ı çalıştırmak istediğinizden emin misiniz?',
      okText: 'Çalıştır',
      cancelText: 'İptal',
      okType: 'primary',
      icon: <DatabaseOutlined />,
      onOk: async () => {
        setLoading(true);
        try {
          // Call real API
          const migration = migrations.find(m => m.id === migrationId);
          console.log('Starting migration for tenant:', migrationId);
          const result = await tenantService.migrateTenantDatabase(migrationId);
          console.log('Migration result:', result);
          message.success(result.message || `${migration?.name} migration başarıyla tamamlandı!`);
          fetchMigrations();
        } catch (error: any) {
          console.error('Migration error:', error);
          const errorMsg = error?.response?.data?.message || error?.message || 'Migration başarısız';
          message.error(errorMsg);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleRollback = async (migrationId: string) => {
    Modal.confirm({
      title: 'Migration Geri Al',
      content: (
        <div>
          <Alert
            message="Dikkat!"
            description="Bu işlem veritabanında değişiklikler yapacaktır. Geri almadan önce yedek almanızı öneririz."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Text>Migration'ı geri almak istediğinizden emin misiniz?</Text>
        </div>
      ),
      okText: 'Geri Al',
      cancelText: 'İptal',
      okType: 'danger',
      icon: <RollbackOutlined />,
      onOk: async () => {
        setLoading(true);
        try {
          // API call would go here
          message.success('Migration geri alındı');
          fetchMigrations();
        } catch (error) {
          message.error('Geri alma başarısız');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      pending: { color: 'default', text: 'Beklemede', icon: <ClockCircleOutlined /> },
      running: { color: 'processing', text: 'Çalışıyor', icon: <LoadingOutlined spin /> },
      completed: { color: 'success', text: 'Tamamlandı', icon: <CheckCircleOutlined /> },
      failed: { color: 'error', text: 'Başarısız', icon: <CloseCircleOutlined /> },
      rolled_back: { color: 'warning', text: 'Geri Alındı', icon: <RollbackOutlined /> }
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      schema: { color: 'blue', text: 'Şema', icon: <DatabaseOutlined /> },
      data: { color: 'green', text: 'Veri', icon: <FileTextOutlined /> },
      seed: { color: 'orange', text: 'Seed', icon: <CloudUploadOutlined /> },
      rollback: { color: 'red', text: 'Geri Alma', icon: <RollbackOutlined /> }
    };

    const config = typeConfig[type];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns: ColumnsType<Migration> = [
    {
      title: 'Migration',
      key: 'migration',
      fixed: 'left',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong>{record.name}</Text>
            {record.canRollback && (
              <Tooltip title="Geri alınabilir">
                <RollbackOutlined style={{ color: '#52c41a' }} />
              </Tooltip>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            v{record.version}
          </Text>
        </Space>
      )
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => getTypeTag(type)
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source) => (
        <Tag color={source === 'automatic' ? 'blue' : source === 'scheduled' ? 'orange' : 'default'}>
          {source === 'automatic' ? 'Otomatik' : source === 'scheduled' ? 'Zamanlanmış' : 'Manuel'}
        </Tag>
      )
    },
    {
      title: 'Etkilenen',
      key: 'affected',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.affectedTables.length} tablo
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.affectedRows} satır
          </Text>
        </Space>
      )
    },
    {
      title: 'Çalıştırma',
      key: 'execution',
      width: 200,
      render: (_, record) => record.executedAt ? (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.executedAt).format('DD.MM.YYYY HH:mm')}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.executedBy} • {(record.duration || 0) / 1000}s
          </Text>
        </Space>
      ) : '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Tooltip title="Çalıştır">
              <Button 
                icon={<PlayCircleOutlined />} 
                size="small"
                type="primary"
                onClick={() => handleRunMigration(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'completed' && record.canRollback && (
            <Tooltip title="Geri Al">
              <Button 
                icon={<RollbackOutlined />} 
                size="small"
                danger
                onClick={() => handleRollback(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Detaylar">
            <Button 
              icon={<InfoCircleOutlined />} 
              size="small"
              onClick={() => {
                setSelectedMigration(record);
                setDetailsModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const historyColumns: ColumnsType<MigrationHistory> = [
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp) => dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss')
    },
    {
      title: 'Migration',
      dataIndex: 'migrationId',
      key: 'migrationId',
      render: (migrationId) => {
        const migration = migrations.find(m => m.id === migrationId);
        return migration ? migration.name : migrationId;
      }
    },
    {
      title: 'İşlem',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action) => (
        <Tag color={action === 'apply' ? 'blue' : 'orange'}>
          {action === 'apply' ? 'Uygula' : 'Geri Al'}
        </Tag>
      )
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'user',
      key: 'user',
      width: 150
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? 'Başarılı' : 'Başarısız'}
        </Tag>
      )
    },
    {
      title: 'Detay',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true
    }
  ];

  const filteredMigrations = migrations.filter(migration => {
    const matchesStatus = statusFilter === 'all' || migration.status === statusFilter;
    const matchesType = typeFilter === 'all' || migration.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: migrations.length,
    pending: migrations.filter(m => m.status === 'pending').length,
    completed: migrations.filter(m => m.status === 'completed').length,
    failed: migrations.filter(m => m.status === 'failed').length,
    rolledBack: migrations.filter(m => m.status === 'rolled_back').length
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <DatabaseOutlined /> Veritabanı Migration Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchMigrations}>
                Yenile
              </Button>
              <Button icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>
                Migration Yükle
              </Button>
              <Button icon={<ThunderboltOutlined />} onClick={() => setPlanModalVisible(true)}>
                Migration Planı
              </Button>
              <Button 
                type="primary" 
                danger
                icon={<ThunderboltOutlined />} 
                onClick={async () => {
                  Modal.confirm({
                    title: 'Tüm Tenant\'ları Güncelle',
                    content: 'Tüm aktif tenant\'ların veritabanları migrate edilecek. CRM modülü aktif olan tenant\'larda CRM tabloları oluşturulacak. Devam etmek istiyor musunuz?',
                    okText: 'Evet, Güncelle',
                    cancelText: 'İptal',
                    okType: 'danger',
                    icon: <DatabaseOutlined />,
                    onOk: async () => {
                      setLoading(true);
                      try {
                        console.log('Starting migration for all tenants');
                        const result = await tenantService.migrateAllTenants();
                        console.log('Migrate all result:', result);
                        message.success(result.message || 'Tüm tenant\'lar başarıyla güncellendi!');
                        fetchMigrations();
                      } catch (error: any) {
                        console.error('Migrate all error:', error);
                        const errorMsg = error?.response?.data?.message || error?.message || 'Toplu migration başarısız oldu';
                        message.error(errorMsg);
                      } finally {
                        setLoading(false);
                      }
                    }
                  });
                }}
              >
                Tüm Tenant'ları Güncelle
              </Button>
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setMigrationModalVisible(true)}>
                Yeni Migration
              </Button>
            </Space>
          </Col>
        </Row>
        <Divider />
        
        {/* Statistics */}
        <Row gutter={16}>
          <Col span={4}>
            <Statistic
              title="Toplam"
              value={stats.total}
              prefix={<DatabaseOutlined />}
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="Beklemede"
              value={stats.pending}
              valueStyle={{ color: '#999' }}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="Tamamlandı"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="Başarısız"
              value={stats.failed}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="Geri Alındı"
              value={stats.rolledBack}
              valueStyle={{ color: '#faad14' }}
              prefix={<RollbackOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Warnings */}
      {stats.pending > 0 && (
        <Alert
          message="Bekleyen Migration'lar"
          description={`${stats.pending} adet bekleyen migration bulunmaktadır. Çalıştırmak için işlemler sütununu kullanın.`}
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {stats.failed > 0 && (
        <Alert
          message="Başarısız Migration'lar"
          description="Başarısız migration'ları inceleyip tekrar çalıştırabilirsiniz."
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Migration'lar" key="migrations">
            {/* Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Select
                  placeholder="Durum"
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="all">Tüm Durumlar</Option>
                  <Option value="pending">Beklemede</Option>
                  <Option value="running">Çalışıyor</Option>
                  <Option value="completed">Tamamlandı</Option>
                  <Option value="failed">Başarısız</Option>
                  <Option value="rolled_back">Geri Alındı</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Tür"
                  style={{ width: '100%' }}
                  value={typeFilter}
                  onChange={setTypeFilter}
                >
                  <Option value="all">Tüm Türler</Option>
                  <Option value="schema">Şema</Option>
                  <Option value="data">Veri</Option>
                  <Option value="seed">Seed</Option>
                  <Option value="rollback">Geri Alma</Option>
                </Select>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredMigrations}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                total: filteredMigrations.length,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} migration`
              }}
            />
          </TabPane>

          <TabPane tab="Geçmiş" key="history">
            <Timeline
              mode="left"
              items={history.map(h => ({
                color: h.status === 'success' ? 'green' : 'red',
                label: dayjs(h.timestamp).format('DD.MM.YYYY HH:mm'),
                children: (
                  <div>
                    <Text strong>
                      {migrations.find(m => m.id === h.migrationId)?.name || h.migrationId}
                    </Text>
                    <br />
                    <Text type="secondary">
                      {h.action === 'apply' ? 'Uygulandı' : 'Geri Alındı'} - {h.user}
                    </Text>
                    <br />
                    <Text type={h.status === 'failed' ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
                      {h.details}
                    </Text>
                  </div>
                )
              }))}
            />
          </TabPane>

          <TabPane tab="SQL Önizleme" key="sql">
            <Alert
              message="SQL Script Önizleme"
              description="Migration'lar çalıştırılmadan önce SQL scriptlerini inceleyebilirsiniz."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Collapse>
              {migrations.filter(m => m.status === 'pending').map(migration => (
                <Panel 
                  header={
                    <Space>
                      <Text strong>{migration.name}</Text>
                      {getTypeTag(migration.type)}
                    </Space>
                  } 
                  key={migration.id}
                >
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 16, 
                    borderRadius: 4,
                    overflow: 'auto'
                  }}>
                    <code>
{`-- Migration: ${migration.name}
-- Version: ${migration.version}
-- Type: ${migration.type}

BEGIN TRANSACTION;

-- Create roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),
  UNIQUE(user_id, role_id)
);

-- Add indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Add audit trigger
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

COMMIT;`}
                    </code>
                  </pre>
                </Panel>
              ))}
            </Collapse>
          </TabPane>

          <TabPane tab="Ayarlar" key="settings">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Migration Ayarları">
                  <Form layout="vertical">
                    <Form.Item label="Otomatik Migration">
                      <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" defaultChecked />
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">
                          Yeni migration'lar otomatik olarak çalıştırılsın
                        </Text>
                      </div>
                    </Form.Item>

                    <Form.Item label="Hata Durumunda">
                      <Radio.Group defaultValue="rollback">
                        <Radio value="rollback">Otomatik Geri Al</Radio>
                        <Radio value="stop">Durdur</Radio>
                        <Radio value="continue">Devam Et</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item label="Yedekleme">
                      <Checkbox defaultChecked>
                        Migration öncesi otomatik yedek al
                      </Checkbox>
                    </Form.Item>

                    <Form.Item label="Bildirimler">
                      <Checkbox.Group
                        options={[
                          { label: 'Başarılı', value: 'success' },
                          { label: 'Başarısız', value: 'failed' },
                          { label: 'Geri Alma', value: 'rollback' }
                        ]}
                        defaultValue={['failed', 'rollback']}
                      />
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Bağlantı Bilgileri">
                  <Descriptions column={1}>
                    <Descriptions.Item label="Host">
                      localhost:5432
                    </Descriptions.Item>
                    <Descriptions.Item label="Veritabanı">
                      tenant_db
                    </Descriptions.Item>
                    <Descriptions.Item label="Şema">
                      public
                    </Descriptions.Item>
                    <Descriptions.Item label="Versiyon">
                      PostgreSQL 14.5
                    </Descriptions.Item>
                    <Descriptions.Item label="Bağlantı Durumu">
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Bağlı
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Migration Details Modal */}
      <Modal
        title="Migration Detayları"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Kapat
          </Button>,
          selectedMigration?.status === 'pending' && (
            <Button 
              key="run" 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={() => {
                handleRunMigration(selectedMigration.id);
                setDetailsModalVisible(false);
              }}
            >
              Çalıştır
            </Button>
          ),
          selectedMigration?.status === 'completed' && selectedMigration.canRollback && (
            <Button 
              key="rollback" 
              danger 
              icon={<RollbackOutlined />}
              onClick={() => {
                handleRollback(selectedMigration.id);
                setDetailsModalVisible(false);
              }}
            >
              Geri Al
            </Button>
          )
        ]}
      >
        {selectedMigration && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Ad" span={2}>
                {selectedMigration.name}
              </Descriptions.Item>
              <Descriptions.Item label="Versiyon">
                {selectedMigration.version}
              </Descriptions.Item>
              <Descriptions.Item label="Tür">
                {getTypeTag(selectedMigration.type)}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                {getStatusTag(selectedMigration.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Kaynak">
                {selectedMigration.source}
              </Descriptions.Item>
              <Descriptions.Item label="Etkilenen Tablolar" span={2}>
                {selectedMigration.affectedTables.join(', ')}
              </Descriptions.Item>
              {selectedMigration.executedAt && (
                <>
                  <Descriptions.Item label="Çalıştırma Zamanı">
                    {dayjs(selectedMigration.executedAt).format('DD.MM.YYYY HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Çalıştıran">
                    {selectedMigration.executedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Süre">
                    {(selectedMigration.duration || 0) / 1000} saniye
                  </Descriptions.Item>
                  <Descriptions.Item label="Etkilenen Satır">
                    {selectedMigration.affectedRows}
                  </Descriptions.Item>
                </>
              )}
              {selectedMigration.error && (
                <Descriptions.Item label="Hata" span={2}>
                  <Alert
                    message="Hata Detayı"
                    description={selectedMigration.error}
                    type="error"
                    showIcon
                  />
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedMigration.status === 'pending' && (
              <Alert
                message="Migration Beklemede"
                description="Bu migration henüz çalıştırılmamış. Çalıştırmak için yukarıdaki butonu kullanabilirsiniz."
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </>
        )}
      </Modal>

      {/* New Migration Modal */}
      <Modal
        title="Yeni Migration"
        open={migrationModalVisible}
        onCancel={() => setMigrationModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            message.success('Migration oluşturuldu');
            setMigrationModalVisible(false);
            fetchMigrations();
          }}
        >
          <Form.Item
            name="name"
            label="Migration Adı"
            rules={[{ required: true, message: 'Migration adı gerekli' }]}
          >
            <Input placeholder="CreateUsersTable" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Tür"
            rules={[{ required: true, message: 'Tür seçimi gerekli' }]}
            initialValue="schema"
          >
            <Select>
              <Option value="schema">Şema Değişikliği</Option>
              <Option value="data">Veri Migration</Option>
              <Option value="seed">Seed Data</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="sql"
            label="SQL Script"
            rules={[{ required: true, message: 'SQL script gerekli' }]}
          >
            <Input.TextArea 
              rows={10} 
              placeholder="CREATE TABLE users (...)"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            name="rollbackSql"
            label="Rollback SQL (Opsiyonel)"
          >
            <Input.TextArea 
              rows={5} 
              placeholder="DROP TABLE users;"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="autoRun"
                valuePropName="checked"
                initialValue={false}
              >
                <Checkbox>Oluşturduktan sonra çalıştır</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="backup"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>Önce yedek al</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Migration Plan Modal */}
      <Modal
        title="Migration Planı"
        open={planModalVisible}
        onCancel={() => setPlanModalVisible(false)}
        width={700}
        footer={null}
      >
        <Alert
          message="Zamanlanmış Migration'lar"
          description="Belirli zamanlarda otomatik çalışacak migration'ları planlayabilirsiniz."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <List
          dataSource={[
            {
              id: '1',
              name: 'Haftalık Veri Temizleme',
              schedule: 'Her Pazar 02:00',
              migrations: ['CleanOldLogs', 'ArchiveData'],
              lastRun: '2024-01-14T02:00:00',
              nextRun: '2024-01-21T02:00:00'
            },
            {
              id: '2',
              name: 'Aylık İndeks Optimizasyonu',
              schedule: 'Her ayın 1\'i 03:00',
              migrations: ['OptimizeIndexes', 'UpdateStatistics'],
              lastRun: '2024-01-01T03:00:00',
              nextRun: '2024-02-01T03:00:00'
            }
          ]}
          renderItem={plan => (
            <List.Item
              actions={[
                <Button size="small" icon={<EditOutlined />}>Düzenle</Button>,
                <Button size="small" icon={<PlayCircleOutlined />}>Şimdi Çalıştır</Button>
              ]}
            >
              <List.Item.Meta
                title={plan.name}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">{plan.schedule}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Migration'lar: {plan.migrations.join(', ')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Son: {dayjs(plan.lastRun).format('DD.MM.YYYY HH:mm')} | 
                      Sonraki: {dayjs(plan.nextRun).format('DD.MM.YYYY HH:mm')}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        <Divider />

        <Button type="dashed" icon={<PlusOutlined />} block>
          Yeni Plan Oluştur
        </Button>
      </Modal>

      {/* Import Migration Modal */}
      <Modal
        title="Migration Yükle"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={600}
      >
        <Upload.Dragger
          accept=".sql"
          beforeUpload={(file) => {
            message.success(`${file.name} dosyası yüklendi`);
            return false;
          }}
        >
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined style={{ fontSize: 48, color: '#667eea' }} />
          </p>
          <p className="ant-upload-text">SQL dosyası yüklemek için tıklayın veya sürükleyin</p>
          <p className="ant-upload-hint">.sql uzantılı migration dosyaları</p>
        </Upload.Dragger>

        <Divider />

        <Alert
          message="Desteklenen Formatlar"
          description="PostgreSQL, MySQL, SQL Server migration scriptleri desteklenmektedir."
          type="info"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default TenantMigrations;