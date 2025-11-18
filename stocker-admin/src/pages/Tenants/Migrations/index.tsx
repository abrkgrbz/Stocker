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
  Collapse,
  Switch
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
  ReloadOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table'; 
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { tenantService } from '../../../services/tenantService';
import { migrationService } from '../../../services/api/migrationService';

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

  // Scheduled migrations state
  const [scheduledMigrations, setScheduledMigrations] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Bulk actions
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchMigrations();
    fetchHistory();
  }, [id]);

  const fetchScheduledMigrations = async () => {
    setLoadingScheduled(true);
    try {
      const scheduled = await migrationService.getScheduledMigrations();
      setScheduledMigrations(scheduled);
    } catch (error: any) {
      console.error('[Migration UI] Error fetching scheduled migrations:', error);
      message.error(error.message || 'Zamanlanmış migration listesi yüklenemedi');
    } finally {
      setLoadingScheduled(false);
    }
  };

  const fetchMigrations = async () => {
    setLoading(true);
    try {
      // Fetch pending migrations from real API
      const pendingMigrations = await migrationService.getPendingMigrations();

      // Transform API data to match Migration interface
      const transformedMigrations: Migration[] = [];

      pendingMigrations.forEach(tenant => {
        // For each tenant with pending migrations
        tenant.pendingMigrations.forEach(module => {
          module.migrations.forEach(migrationName => {
            transformedMigrations.push({
              id: `${tenant.tenantId}-${module.module}-${migrationName}`,
              name: `${tenant.tenantName} - ${module.module} - ${migrationName}`,
              version: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
              type: 'schema' as const,
              status: 'pending' as const,
              source: 'automatic' as const,
              affectedTables: [module.module],
              affectedRows: 0,
              canRollback: false,
            });
          });
        });

        // Also add completed migrations
        tenant.appliedMigrations.forEach(module => {
          module.migrations.forEach(migrationName => {
            transformedMigrations.push({
              id: `${tenant.tenantId}-${module.module}-${migrationName}-completed`,
              name: `${tenant.tenantName} - ${module.module} - ${migrationName}`,
              version: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
              type: 'schema' as const,
              status: 'completed' as const,
              source: 'automatic' as const,
              affectedTables: [module.module],
              affectedRows: 0,
              canRollback: true,
              executedAt: new Date().toISOString(),
              executedBy: 'System',
              duration: 1000,
            });
          });
        });
      });

      setMigrations(transformedMigrations);
    } catch (error: any) {
      console.error('[Migration UI] Error fetching migrations:', error);
      message.error(error.message || 'Migration listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      // Get migration history from all tenants
      const pendingMigrations = await migrationService.getPendingMigrations();
      const historyItems: MigrationHistory[] = [];

      // For each tenant, get their migration history
      for (const tenant of pendingMigrations) {
        try {
          const tenantHistory = await migrationService.getMigrationHistory(tenant.tenantId);

          // Transform to history format
          tenantHistory.appliedMigrations.forEach((migration, index) => {
            historyItems.push({
              id: `${tenant.tenantId}-${migration}-${index}`,
              migrationId: migration,
              action: 'apply' as const,
              timestamp: new Date().toISOString(),
              user: 'System',
              status: 'success' as const,
              details: `Applied to ${tenant.tenantName} (${tenant.tenantCode})`,
            });
          });
        } catch (err) {
          // Silently skip tenants with history fetch errors (e.g., database connection issues)
          // This is optional data, don't break the UI
          if (process.env.NODE_ENV === 'development') {
            console.debug(`[Migration UI] Could not fetch history for tenant ${tenant.tenantId}`);
          }
        }
      }

      setHistory(historyItems.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error: any) {
      // History is optional, don't show error to user
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Migration UI] Could not fetch migration history:', error?.message);
      }
      setHistory([]);
    }
  };

  const handleRunMigration = async (migrationId: string) => {
    const migration = migrations.find(m => m.id === migrationId);

    // Extract tenantId from migration ID
    // Format: "GUID-MODULE-MIGRATION" where GUID is 5 segments (8-4-4-4-12)
    // Example: "5f94c9ec-fc7b-496c-b321-0170d9e138b3-CRM-20251029..."
    // Split by '-' and take first 5 parts to reconstruct GUID
    const parts = migrationId.split('-');
    const tenantId = parts.slice(0, 5).join('-'); // First 5 parts = GUID

    const result = await Swal.fire({
      title: 'Migration Çalıştır',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 12px;">
            <strong>${migration?.name || 'Bu migration'}</strong> çalıştırılacak.
          </p>
          <div style="background: #f0f2f5; padding: 12px; border-radius: 6px; font-size: 13px;">
            <div style="margin-bottom: 6px;">
              <span style="color: #8c8c8c;">Migration:</span>
              <span style="margin-left: 8px; font-family: monospace;">${migration?.name}</span>
            </div>
            <div>
              <span style="color: #8c8c8c;">Durum:</span>
              <span style="margin-left: 8px;">${migration?.status === 'pending' ? 'Beklemede' : 'Tamamlandı'}</span>
            </div>
          </div>
          <p style="margin-top: 12px; color: #faad14; font-size: 13px;">
            ⚠️ Bu işlem veritabanında değişiklikler yapacaktır.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<span style="padding: 0 8px;">✓ Çalıştır</span>',
      cancelButtonText: '<span style="padding: 0 8px;">✕ İptal</span>',
      confirmButtonColor: '#1890ff',
      cancelButtonColor: '#d9d9d9',
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      // Use real migration API
      const apiResult = await migrationService.applyMigration(tenantId);

      await Swal.fire({
        title: 'Başarılı!',
        text: apiResult.message || 'Migration başarıyla tamamlandı!',
        icon: 'success',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#52c41a',
        timer: 3000,
        timerProgressBar: true
      });

      fetchMigrations();
      fetchHistory();
    } catch (error: any) {
      const errorMsg = error?.message || 'Migration başarısız';

      await Swal.fire({
        title: 'Hata!',
        text: errorMsg,
        icon: 'error',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#ff4d4f'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (migrationId: string) => {
    const migration = migrations.find(m => m.id === migrationId);

    // Extract info from migration ID (format: tenantId-module-migrationName-completed)
    const parts = migrationId.split('-');
    const tenantId = parts[0];
    const moduleName = parts[1];
    const migrationName = parts.slice(2, -1).join('-'); // Remove 'completed' suffix

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
          <Text>
            <strong>{migration?.name}</strong> migration'ını geri almak istediğinizden emin misiniz?
          </Text>
        </div>
      ),
      okText: 'Geri Al',
      cancelText: 'İptal',
      okType: 'danger',
      icon: <RollbackOutlined />,
      onOk: async () => {
        setLoading(true);
        try {
          const result = await migrationService.rollbackMigration(tenantId, moduleName, migrationName);

          if (result.success) {
            message.success(result.message || 'Migration geri alındı');
          } else {
            // Show instructions if automatic rollback not supported
            Modal.info({
              title: 'Rollback Bilgisi',
              content: result.message,
              width: 600,
            });
          }

          fetchMigrations();
          fetchHistory();
        } catch (error: any) {
          message.error(error?.message || 'Geri alma başarısız');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Bulk action handlers
  const handleBulkApply = async () => {
    const selectedMigrations = migrations.filter(m => selectedRowKeys.includes(m.id));
    const pendingMigrations = selectedMigrations.filter(m => m.status === 'pending');

    if (pendingMigrations.length === 0) {
      message.warning('Seçili migration\'lar arasında çalıştırılabilir migration yok');
      return;
    }

    const result = await Swal.fire({
      title: 'Toplu Migration Çalıştır',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 12px;">
            <strong>${pendingMigrations.length} migration</strong> çalıştırılacak.
          </p>
          <div style="background: #f0f2f5; padding: 12px; border-radius: 6px; font-size: 13px; max-height: 200px; overflow-y: auto;">
            ${pendingMigrations.map(m => `
              <div style="margin-bottom: 6px; padding: 4px; background: white; border-radius: 4px;">
                <span style="font-family: monospace; font-size: 12px;">${m.name}</span>
              </div>
            `).join('')}
          </div>
          <p style="margin-top: 12px; color: #faad14; font-size: 13px;">
            ⚠️ Bu işlem veritabanında değişiklikler yapacaktır.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<span style="padding: 0 8px;">✓ Tümünü Çalıştır</span>',
      cancelButtonText: '<span style="padding: 0 8px;">✕ İptal</span>',
      confirmButtonColor: '#1890ff',
      cancelButtonColor: '#d9d9d9',
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) {
      return;
    }

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const migration of pendingMigrations) {
      try {
        const parts = migration.id.split('-');
        const tenantId = parts.slice(0, 5).join('-');
        await migrationService.applyMigration(tenantId);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to apply migration ${migration.id}:`, error);
      }
    }

    setBulkActionLoading(false);
    setSelectedRowKeys([]);

    await Swal.fire({
      title: 'Toplu İşlem Tamamlandı',
      html: `
        <div style="text-align: center; padding: 10px;">
          <p style="font-size: 16px; margin-bottom: 12px;">
            ${successCount > 0 ? `✓ <strong>${successCount}</strong> migration başarılı` : ''}
            ${failCount > 0 ? `<br>✕ <strong>${failCount}</strong> migration başarısız` : ''}
          </p>
        </div>
      `,
      icon: failCount > 0 ? 'warning' : 'success',
      confirmButtonText: 'Tamam',
      confirmButtonColor: failCount > 0 ? '#faad14' : '#52c41a'
    });

    fetchMigrations();
    fetchHistory();
  };

  const handleBulkRollback = async () => {
    const selectedMigrations = migrations.filter(m => selectedRowKeys.includes(m.id));
    const completedMigrations = selectedMigrations.filter(m => m.status === 'completed' && m.canRollback);

    if (completedMigrations.length === 0) {
      message.warning('Seçili migration\'lar arasında geri alınabilir migration yok');
      return;
    }

    const result = await Swal.fire({
      title: 'Toplu Migration Geri Al',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 12px;">
            <strong>${completedMigrations.length} migration</strong> geri alınacak.
          </p>
          <div style="background: #fff2e8; padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 12px;">
            <div style="color: #fa8c16;">⚠️ Dikkat!</div>
            <div style="margin-top: 6px; color: #8c8c8c;">Bu işlem veritabanında değişiklikler yapacaktır.</div>
          </div>
          <div style="background: #f0f2f5; padding: 12px; border-radius: 6px; font-size: 13px; max-height: 200px; overflow-y: auto;">
            ${completedMigrations.map(m => `
              <div style="margin-bottom: 6px; padding: 4px; background: white; border-radius: 4px;">
                <span style="font-family: monospace; font-size: 12px;">${m.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<span style="padding: 0 8px;">✓ Tümünü Geri Al</span>',
      cancelButtonText: '<span style="padding: 0 8px;">✕ İptal</span>',
      confirmButtonColor: '#ff4d4f',
      cancelButtonColor: '#d9d9d9',
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) {
      return;
    }

    setBulkActionLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const migration of completedMigrations) {
      try {
        const parts = migration.id.split('-');
        const tenantId = parts[0];
        const moduleName = parts[1];
        const migrationName = parts.slice(2, -1).join('-');
        await migrationService.rollbackMigration(tenantId, moduleName, migrationName);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to rollback migration ${migration.id}:`, error);
      }
    }

    setBulkActionLoading(false);
    setSelectedRowKeys([]);

    await Swal.fire({
      title: 'Toplu Geri Alma Tamamlandı',
      html: `
        <div style="text-align: center; padding: 10px;">
          <p style="font-size: 16px; margin-bottom: 12px;">
            ${successCount > 0 ? `✓ <strong>${successCount}</strong> migration geri alındı` : ''}
            ${failCount > 0 ? `<br>✕ <strong>${failCount}</strong> migration başarısız` : ''}
          </p>
        </div>
      `,
      icon: failCount > 0 ? 'warning' : 'success',
      confirmButtonText: 'Tamam',
      confirmButtonColor: failCount > 0 ? '#faad14' : '#52c41a'
    });

    fetchMigrations();
    fetchHistory();
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: 'Toplu Silme',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 12px;">
            <strong>${selectedRowKeys.length} migration</strong> silinecek.
          </p>
          <div style="background: #fff1f0; padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 12px;">
            <div style="color: #ff4d4f;">⚠️ Uyarı!</div>
            <div style="margin-top: 6px; color: #8c8c8c;">Bu işlem geri alınamaz.</div>
          </div>
        </div>
      `,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: '<span style="padding: 0 8px;">✓ Tümünü Sil</span>',
      cancelButtonText: '<span style="padding: 0 8px;">✕ İptal</span>',
      confirmButtonColor: '#ff4d4f',
      cancelButtonColor: '#d9d9d9',
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) {
      return;
    }

    setBulkActionLoading(true);

    // Simulate deletion - in real implementation, call API
    setMigrations(prev => prev.filter(m => !selectedRowKeys.includes(m.id)));
    setSelectedRowKeys([]);

    setBulkActionLoading(false);

    message.success(`${selectedRowKeys.length} migration silindi`);
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
        <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Title level={4} style={{ margin: 0 }}>
              <DatabaseOutlined /> Veritabanı Migration Yönetimi
            </Title>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space wrap size="middle">
              {/* Secondary Actions - Left Group */}
              <Space.Compact>
                <Tooltip title="Listeyi yenile">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchMigrations}
                  />
                </Tooltip>
                <Tooltip title="Migration hakkında bilgi">
                  <Button
                    icon={<InfoCircleOutlined />}
                    onClick={() => setImportModalVisible(true)}
                  />
                </Tooltip>
              </Space.Compact>

              {/* Secondary Actions - Right Group */}
              <Button
                icon={<ThunderboltOutlined />}
                onClick={() => {
                  setPlanModalVisible(true);
                  fetchScheduledMigrations();
                }}
              >
                Migration Planı
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={async () => {
                  Modal.confirm({
                    title: 'Tüm Tenant\'ları Güncelle',
                    content: 'Tüm aktif tenant\'ların veritabanlarına bekleyen migration\'lar uygulanacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
                    okText: 'Evet, Güncelle',
                    cancelText: 'İptal',
                    okType: 'primary',
                    icon: <ExclamationCircleOutlined />,
                    onOk: async () => {
                      setLoading(true);
                      try {
                        const results = await migrationService.applyAllMigrations();

                        const successCount = results.filter(r => r.success).length;
                        const failureCount = results.filter(r => !r.success).length;

                        if (failureCount === 0) {
                          message.success(`Tüm tenant'lar başarıyla güncellendi! (${successCount} tenant)`);
                        } else {
                          Modal.warning({
                            title: 'Migration Sonuçları',
                            content: (
                              <div>
                                <p>Başarılı: {successCount}</p>
                                <p>Başarısız: {failureCount}</p>
                                <Divider />
                                <p><strong>Hatalı tenant'lar:</strong></p>
                                <ul>
                                  {results.filter(r => !r.success).map(r => (
                                    <li key={r.tenantId}>{r.tenantName}: {r.error}</li>
                                  ))}
                                </ul>
                              </div>
                            ),
                            width: 600,
                          });
                        }

                        fetchMigrations();
                        fetchHistory();
                      } catch (error: any) {
                        const errorMsg = error?.message || 'Toplu migration başarısız oldu';
                        message.error(errorMsg);
                      } finally {
                        setLoading(false);
                      }
                    }
                  });
                }}
              >
                Toplu Güncelle
              </Button>

              {/* Primary Action - Main CTA */}
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setMigrationModalVisible(true)}
              >
                Migration Oluştur
              </Button>
            </Space>
          </Col>
        </Row>
        <Divider />
        
        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small" style={{ borderLeft: '4px solid #1890ff' }}>
              <Statistic
                title="Toplam Migration"
                value={stats.total}
                prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
                suffix="migration"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card size="small" style={{ borderLeft: '4px solid #d9d9d9' }}>
              <Statistic
                title="Beklemede"
                value={stats.pending}
                valueStyle={{ color: '#8c8c8c' }}
                prefix={<ClockCircleOutlined style={{ color: '#8c8c8c' }} />}
                suffix="migration"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card size="small" style={{ borderLeft: '4px solid #52c41a' }}>
              <Statistic
                title="Tamamlandı"
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                suffix="migration"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card size="small" style={{ borderLeft: '4px solid #ff4d4f' }}>
              <Statistic
                title="Başarısız"
                value={stats.failed}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                suffix="migration"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Card size="small" style={{ borderLeft: '4px solid #8c8c8c' }}>
              <Statistic
                title="Geri Alındı"
                value={stats.rolledBack}
                valueStyle={{ color: '#8c8c8c' }}
                prefix={<RollbackOutlined style={{ color: '#8c8c8c' }} />}
                suffix="migration"
              />
            </Card>
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
            {/* Bulk Action Bar */}
            {selectedRowKeys.length > 0 && (
              <Alert
                message={
                  <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <Text strong>{selectedRowKeys.length} migration seçildi</Text>
                      <Button
                        size="small"
                        type="link"
                        onClick={() => setSelectedRowKeys([])}
                      >
                        Seçimi Temizle
                      </Button>
                    </Space>
                    <Space>
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={handleBulkApply}
                        loading={bulkActionLoading}
                      >
                        Çalıştır
                      </Button>
                      <Button
                        icon={<RollbackOutlined />}
                        onClick={handleBulkRollback}
                        loading={bulkActionLoading}
                      >
                        Geri Al
                      </Button>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={handleBulkDelete}
                        loading={bulkActionLoading}
                      >
                        Sil
                      </Button>
                    </Space>
                  </Space>
                }
                type="info"
                style={{ marginBottom: 16 }}
              />
            )}

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
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                selections: [
                  Table.SELECTION_ALL,
                  Table.SELECTION_INVERT,
                  Table.SELECTION_NONE,
                ],
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <DatabaseOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                    <Title level={4} style={{ color: '#8c8c8c', marginBottom: 8 }}>
                      Henüz Bir Migration Oluşturulmamış
                    </Title>
                    <Paragraph style={{ color: '#bfbfbf', marginBottom: 24 }}>
                      Migration'lar veritabanı yapısındaki değişiklikleri yönetir.<br />
                      Yeni tablolar, sütunlar veya veri güncellemeleri için migration oluşturun.
                    </Paragraph>
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => setMigrationModalVisible(true)}
                    >
                      İlk Migration'ı Oluştur
                    </Button>
                  </div>
                ),
              }}
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
                    <Descriptions.Item label="Server">
                      localhost\SQLEXPRESS (veya konfigüre edilmiş SQL Server)
                    </Descriptions.Item>
                    <Descriptions.Item label="Database Engine">
                      Microsoft SQL Server
                    </Descriptions.Item>
                    <Descriptions.Item label="Şema">
                      dbo (default schema)
                    </Descriptions.Item>
                    <Descriptions.Item label="Versiyon">
                      SQL Server 2019+ (desteklenen tüm versiyonlar)
                    </Descriptions.Item>
                    <Descriptions.Item label="Bağlantı Durumu">
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Bağlı
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Not">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Her tenant'ın kendi SQL Server veritabanı vardır
                      </Text>
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
        title="Yeni Migration Oluşturma"
        open={migrationModalVisible}
        onCancel={() => setMigrationModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setMigrationModalVisible(false)}>
            Kapat
          </Button>,
          <Button
            key="docs"
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => window.open('https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/', '_blank')}
          >
            EF Core Dokümantasyonu
          </Button>
        ]}
        width={800}
      >
        <Alert
          message="Entity Framework Core Migration"
          description="Migration'lar kod tabanlı olup, backend projesinden EF Core CLI komutları ile oluşturulur. UI üzerinden doğrudan migration oluşturulamaz."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Card title="Yeni Migration Oluşturma Adımları" style={{ marginBottom: 16 }}>
          <Steps
            direction="vertical"
            current={-1}
            items={[
              {
                title: '1. Domain Model Değişikliği Yap',
                description: (
                  <div>
                    <Text>Stocker.Domain projesinde entity'lerde değişiklik yapın</Text>
                    <pre style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 4,
                      fontSize: 12,
                      marginTop: 8
                    }}>
                      <code>{`// Örnek: Yeni property ekleme
public class Tenant : AggregateRoot<Guid>
{
    public string Name { get; private set; }
    public string Code { get; private set; }
    // Yeni alan
    public string Description { get; private set; }
}`}</code>
                    </pre>
                  </div>
                ),
                icon: <EditOutlined />
              },
              {
                title: '2. Migration Oluştur',
                description: (
                  <div>
                    <Text>Terminal veya Package Manager Console'da komutu çalıştırın:</Text>
                    <pre style={{
                      background: '#1f1f1f',
                      color: '#d4d4d4',
                      padding: 12,
                      borderRadius: 4,
                      fontSize: 12,
                      marginTop: 8
                    }}>
                      <code>{`# Visual Studio Package Manager Console
Add-Migration AddTenantDescription -Project Stocker.Persistence

# veya .NET CLI
dotnet ef migrations add AddTenantDescription -p src/Infrastructure/Stocker.Persistence`}</code>
                    </pre>
                  </div>
                ),
                icon: <CodeOutlined />
              },
              {
                title: '3. Migration Dosyasını İncele',
                description: (
                  <div>
                    <Text>Migrations klasöründe oluşturulan dosyayı kontrol edin</Text>
                    <pre style={{
                      background: '#f5f5f5',
                      padding: 12,
                      borderRadius: 4,
                      fontSize: 12,
                      marginTop: 8
                    }}>
                      <code>{`// 20250122_AddTenantDescription.cs
public partial class AddTenantDescription : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Description",
            table: "Tenants",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Description",
            table: "Tenants");
    }
}`}</code>
                    </pre>
                  </div>
                ),
                icon: <FileTextOutlined />
              },
              {
                title: '4. Backend\'i Çalıştır',
                description: 'API projesini çalıştırın. Migration otomatik olarak algılanır',
                icon: <SyncOutlined />
              },
              {
                title: '5. Bu Sayfadan Tenant\'lara Uygula',
                description: (
                  <Space direction="vertical">
                    <Text>Pending migrations listesinde yeni migration görünecektir</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      • Tekil tenant için "Çalıştır" butonunu kullanın
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      • Tüm tenant'lar için "Tüm Tenant'ları Güncelle" butonunu kullanın
                    </Text>
                  </Space>
                ),
                icon: <CheckCircleOutlined />
              }
            ]}
          />
        </Card>

        <Card title="Hızlı Referans Komutlar">
          <Collapse>
            <Panel header="Visual Studio Package Manager Console" key="1">
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
                <code>{`# Yeni migration oluştur
Add-Migration MigrationName -Project Stocker.Persistence

# Migration'ları listele
Get-Migration -Project Stocker.Persistence

# Migration'ı geri al
Remove-Migration -Project Stocker.Persistence

# SQL script önizle
Script-Migration -Project Stocker.Persistence`}</code>
              </pre>
            </Panel>
            <Panel header=".NET CLI" key="2">
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
                <code>{`# Yeni migration oluştur
dotnet ef migrations add MigrationName -p src/Infrastructure/Stocker.Persistence

# Migration'ları listele
dotnet ef migrations list -p src/Infrastructure/Stocker.Persistence

# Migration'ı geri al
dotnet ef migrations remove -p src/Infrastructure/Stocker.Persistence

# SQL script önizle
dotnet ef migrations script -p src/Infrastructure/Stocker.Persistence`}</code>
              </pre>
            </Panel>
          </Collapse>
        </Card>

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="✅ Avantajlar">
              <ul style={{ fontSize: 12, paddingLeft: 20 }}>
                <li>Tip güvenliği ve IntelliSense</li>
                <li>Versiyon kontrolü ve takip</li>
                <li>Otomatik Up/Down migration</li>
                <li>Team collaboration</li>
                <li>Rollback desteği</li>
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="📚 Kaynaklar">
              <Space direction="vertical" size={8}>
                <a href="https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/" target="_blank">
                  <FileTextOutlined /> EF Core Migrations Dokümantasyonu
                </a>
                <a href="https://learn.microsoft.com/en-us/ef/core/cli/dotnet" target="_blank">
                  <CodeOutlined /> EF Core CLI Komutları
                </a>
                <a href="https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/teams" target="_blank">
                  <DatabaseOutlined /> Team Ortamında Migration Yönetimi
                </a>
              </Space>
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* Migration Plan Modal */}
      <Modal
        title="Migration Planı"
        open={planModalVisible}
        onCancel={() => setPlanModalVisible(false)}
        width={800}
        footer={null}
      >
        <Alert
          message="Zamanlanmış Migration'lar"
          description="Belirli zamanlarda otomatik çalışacak migration'ları görüntüleyebilir ve yönetebilirsiniz."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {loadingScheduled ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <LoadingOutlined style={{ fontSize: 32 }} />
            <div style={{ marginTop: 16 }}>Yükleniyor...</div>
          </div>
        ) : scheduledMigrations.length === 0 ? (
          <Result
            icon={<ClockCircleOutlined />}
            title="Zamanlanmış Migration Bulunamadı"
            subTitle="Henüz zamanlanmış migration bulunmuyor."
          />
        ) : (
          <List
            dataSource={scheduledMigrations}
            renderItem={scheduled => (
              <List.Item
                actions={[
                  <Tooltip title="İptal Et">
                    <Button
                      size="small"
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={async () => {
                        Modal.confirm({
                          title: 'Zamanlanmış Migration İptal Et',
                          content: `${scheduled.tenantName} için zamanlanmış migration iptal edilecek. Devam etmek istiyor musunuz?`,
                          okText: 'İptal Et',
                          okType: 'danger',
                          cancelText: 'Vazgeç',
                          onOk: async () => {
                            try {
                              await migrationService.cancelScheduledMigration(scheduled.scheduleId);
                              message.success('Zamanlanmış migration iptal edildi');
                              fetchScheduledMigrations();
                            } catch (error: any) {
                              message.error(error.message || 'İptal işlemi başarısız');
                            }
                          }
                        });
                      }}
                    >
                      İptal
                    </Button>
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{scheduled.tenantName}</Text>
                      <Tag color={scheduled.status === 'Pending' ? 'processing' : 'default'}>
                        {scheduled.status}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Text type="secondary">
                        <strong>Tenant Code:</strong> {scheduled.tenantCode}
                      </Text>
                      {scheduled.migrationName && (
                        <Text type="secondary">
                          <strong>Migration:</strong> {scheduled.moduleName} - {scheduled.migrationName}
                        </Text>
                      )}
                      <Text type="secondary">
                        <strong>Zamanlanma:</strong> {dayjs(scheduled.scheduledTime).format('DD.MM.YYYY HH:mm')}
                      </Text>
                      <Text type="secondary">
                        <strong>Oluşturan:</strong> {scheduled.createdBy} • {dayjs(scheduled.createdAt).format('DD.MM.YYYY HH:mm')}
                      </Text>
                      {scheduled.executedAt && (
                        <Text type="secondary">
                          <strong>Çalıştırıldı:</strong> {dayjs(scheduled.executedAt).format('DD.MM.YYYY HH:mm')}
                        </Text>
                      )}
                      {scheduled.error && (
                        <Alert
                          message="Hata"
                          description={scheduled.error}
                          type="error"
                          showIcon
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Import Migration Modal */}
      <Modal
        title="Migration Yönetimi"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setImportModalVisible(false)}>
            Kapat
          </Button>
        ]}
        width={700}
      >
        <Alert
          message="Entity Framework Core Migration Sistemi"
          description="Bu sistem Entity Framework Core migrations kullanır. Migration'lar kod tabanlıdır ve manuel SQL yükleme desteklenmez."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Card title="Migration Nasıl Eklenir?" style={{ marginBottom: 16 }}>
          <Steps
            direction="vertical"
            current={-1}
            items={[
              {
                title: 'Backend Projesinde Migration Oluştur',
                description: (
                  <pre style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    fontSize: 12,
                    marginTop: 8
                  }}>
                    <code>dotnet ef migrations add MigrationName -p Stocker.Persistence</code>
                  </pre>
                ),
                icon: <CodeOutlined />
              },
              {
                title: 'Backend\'i Yeniden Derle ve Çalıştır',
                description: 'Migration dosyaları otomatik olarak uygulamaya dahil edilir',
                icon: <SyncOutlined />
              },
              {
                title: 'Bu Sayfadan Tenant\'lara Uygula',
                description: 'Pending migrations listesi otomatik güncellenir ve buradan uygulanabilir',
                icon: <CheckCircleOutlined />
              }
            ]}
          />
        </Card>

        <Card title="Mevcut Migration Durumu">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Toplam Migration">
              {migrations.length}
            </Descriptions.Item>
            <Descriptions.Item label="Bekleyen">
              {migrations.filter(m => m.status === 'pending').length}
            </Descriptions.Item>
            <Descriptions.Item label="Uygulanan">
              {migrations.filter(m => m.status === 'completed').length}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Divider />

        <Alert
          message="Manuel SQL İşlemleri"
          description="Eğer manuel SQL script çalıştırmanız gerekiyorsa, SQL Server Management Studio veya Azure Data Studio kullanabilirsiniz."
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default TenantMigrations;