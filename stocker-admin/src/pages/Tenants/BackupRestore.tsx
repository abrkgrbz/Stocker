import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  message,
  Alert,
  Progress,
  Tabs,
  Timeline,
  Descriptions,
  Badge,
  Tooltip,
  Statistic,
  List,
  Avatar,
  Drawer,
  Steps,
  Result,
  Divider,
  Radio,
  Checkbox,
  Upload,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  DatabaseOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  SafetyOutlined,
  SyncOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  HourglassOutlined,
  ExclamationCircleOutlined,
  RocketOutlined,
  SaveOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;
const { Dragger } = Upload;

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'queued';
  progress: number;
  size: number;
  createdAt: string;
  completedAt?: string;
  duration?: string;
  description?: string;
  location: string;
  retention: number;
  compressed: boolean;
  encrypted: boolean;
  tables: string[];
  creator: string;
}

interface RestoreJob {
  id: string;
  backupId: string;
  backupName: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  startedAt: string;
  completedAt?: string;
  duration?: string;
  restoredTables: string[];
  targetEnvironment: 'production' | 'staging' | 'development';
  creator: string;
}

const TenantBackupRestore: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('backups');
  const [loading, setLoading] = useState(false);
  const [isBackupModalVisible, setIsBackupModalVisible] = useState(false);
  const [isRestoreModalVisible, setIsRestoreModalVisible] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [backupForm] = Form.useForm();
  const [restoreForm] = Form.useForm();

  // Mock data
  const mockBackups: Backup[] = [
    {
      id: '1',
      name: 'Daily Backup - 07.12.2024',
      type: 'full',
      status: 'completed',
      progress: 100,
      size: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
      createdAt: '2024-12-07T03:00:00Z',
      completedAt: '2024-12-07T03:15:00Z',
      duration: '15m 23s',
      description: 'Günlük otomatik tam yedekleme',
      location: 's3://backups/tenant-abc/daily/2024-12-07-030000.sql.gz',
      retention: 30,
      compressed: true,
      encrypted: true,
      tables: ['users', 'orders', 'products', 'invoices', 'audit_logs'],
      creator: 'System',
    },
    {
      id: '2',
      name: 'Pre-Migration Backup',
      type: 'full',
      status: 'completed',
      progress: 100,
      size: 2.1 * 1024 * 1024 * 1024, // 2.1 GB
      createdAt: '2024-12-06T14:30:00Z',
      completedAt: '2024-12-06T14:42:00Z',
      duration: '12m 15s',
      description: 'Migration öncesi güvenlik yedeklemesi',
      location: 's3://backups/tenant-abc/manual/2024-12-06-143000.sql.gz',
      retention: 90,
      compressed: true,
      encrypted: true,
      tables: ['users', 'orders', 'products', 'invoices', 'audit_logs'],
      creator: 'John Doe',
    },
    {
      id: '3',
      name: 'Incremental Backup - 06.12.2024',
      type: 'incremental',
      status: 'running',
      progress: 65,
      size: 0.3 * 1024 * 1024 * 1024, // 300 MB
      createdAt: '2024-12-06T12:00:00Z',
      description: 'Artımlı yedekleme',
      location: 's3://backups/tenant-abc/incremental/2024-12-06-120000.sql.gz',
      retention: 7,
      compressed: true,
      encrypted: true,
      tables: ['orders', 'audit_logs'],
      creator: 'System',
    },
    {
      id: '4',
      name: 'Weekly Backup - 01.12.2024',
      type: 'full',
      status: 'failed',
      progress: 35,
      size: 0.8 * 1024 * 1024 * 1024, // 800 MB
      createdAt: '2024-12-01T02:00:00Z',
      completedAt: '2024-12-01T02:25:00Z',
      duration: '25m 10s',
      description: 'Haftalık tam yedekleme - Disk alanı yetersiz',
      location: 's3://backups/tenant-abc/weekly/2024-12-01-020000.sql.gz',
      retention: 365,
      compressed: true,
      encrypted: true,
      tables: ['users', 'orders', 'products'],
      creator: 'System',
    },
  ];

  const mockRestoreJobs: RestoreJob[] = [
    {
      id: '1',
      backupId: '2',
      backupName: 'Pre-Migration Backup',
      status: 'completed',
      progress: 100,
      startedAt: '2024-12-06T16:00:00Z',
      completedAt: '2024-12-06T16:18:00Z',
      duration: '18m 30s',
      restoredTables: ['users', 'orders', 'products'],
      targetEnvironment: 'staging',
      creator: 'John Doe',
    },
    {
      id: '2',
      backupId: '1',
      backupName: 'Daily Backup - 07.12.2024',
      status: 'running',
      progress: 45,
      startedAt: '2024-12-07T10:30:00Z',
      restoredTables: [],
      targetEnvironment: 'development',
      creator: 'Jane Smith',
    },
  ];

  const backupTypeColors = {
    full: 'blue',
    incremental: 'green',
    differential: 'orange',
  };

  const statusColors = {
    completed: 'success',
    running: 'processing',
    failed: 'error',
    queued: 'warning',
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const backupColumns: ProColumns<Backup>[] = [
    {
      title: 'Yedekleme',
      key: 'backup',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <DatabaseOutlined style={{ color: '#667eea' }} />
            <Text strong>{record.name}</Text>
            <Tag color={backupTypeColors[record.type]}>
              {record.type.toUpperCase()}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
          <Space size="small">
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatFileSize(record.size)}
            </Text>
            {record.compressed && (
              <Tag size="small" color="cyan">ZIP</Tag>
            )}
            {record.encrypted && (
              <Tag size="small" color="red">🔒</Tag>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string, record) => (
        <Space direction="vertical" size={0}>
          <Badge
            status={statusColors[status as keyof typeof statusColors]}
            text={
              status === 'completed' ? 'Tamamlandı' :
              status === 'running' ? 'Çalışıyor' :
              status === 'failed' ? 'Başarısız' : 'Sırada'
            }
          />
          {(status === 'running' || status === 'queued') && (
            <Progress
              percent={record.progress}
              size="small"
              status={status === 'failed' ? 'exception' : 'active'}
              format={(percent) => `${percent}%`}
            />
          )}
          {record.duration && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.duration}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Tablolar',
      dataIndex: 'tables',
      key: 'tables',
      width: 200,
      render: (tables: string[]) => (
        <Space direction="vertical" size={0}>
          <Text>{tables.length} tablo</Text>
          <div>
            {tables.slice(0, 3).map(table => (
              <Tag key={table} size="small" style={{ marginBottom: 2 }}>
                {table}
              </Tag>
            ))}
            {tables.length > 3 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{tables.length - 3} daha
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('DD.MM.YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format('HH:mm')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Oluşturan',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setSelectedBackup(record);
                setIsDrawerVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'completed' && (
            <>
              <Tooltip title="İndir">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => message.success(`${record.name} indiriliyor...`)}
                />
              </Tooltip>
              <Tooltip title="Geri Yükle">
                <Button
                  type="text"
                  icon={<CloudUploadOutlined />}
                  onClick={() => {
                    setSelectedBackup(record);
                    setIsRestoreModalVisible(true);
                  }}
                />
              </Tooltip>
            </>
          )}
          {record.status === 'running' && (
            <Tooltip title="Durdur">
              <Button
                type="text"
                icon={<PauseCircleOutlined />}
                onClick={() => handleStopBackup(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Sil">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteBackup(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const restoreColumns = [
    {
      title: 'Restore İşi',
      key: 'restore',
      render: (_, record: RestoreJob) => (
        <Space direction="vertical" size={0}>
          <Text strong>Restore: {record.backupName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hedef: {record.targetEnvironment}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: RestoreJob) => (
        <Space direction="vertical" size={0}>
          <Badge
            status={statusColors[status as keyof typeof statusColors]}
            text={
              status === 'completed' ? 'Tamamlandı' :
              status === 'running' ? 'Çalışıyor' :
              status === 'failed' ? 'Başarısız' : 'Sırada'
            }
          />
          {status === 'running' && (
            <Progress percent={record.progress} size="small" />
          )}
        </Space>
      ),
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Süre',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration?: string) => duration || 'Devam ediyor...',
    },
    {
      title: 'Oluşturan',
      dataIndex: 'creator',
      key: 'creator',
    },
  ];

  const handleCreateBackup = () => {
    backupForm.resetFields();
    setIsBackupModalVisible(true);
  };

  const handleStopBackup = async (backup: Backup) => {
    await Swal.fire({
      title: 'Yedeklemeyi Durdur',
      text: 'Bu yedekleme işlemini durdurmak istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Durdur',
      cancelButtonText: 'İptal',
    }).then((result) => {
      if (result.isConfirmed) {
        message.info('Yedekleme işlemi durduruluyor...');
      }
    });
  };

  const handleDeleteBackup = async (backup: Backup) => {
    await Swal.fire({
      title: 'Yedeklemeyi Sil',
      text: 'Bu yedeklemeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sil',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ff4d4f',
    }).then((result) => {
      if (result.isConfirmed) {
        message.success('Yedekleme başarıyla silindi');
      }
    });
  };

  const handleBackupSubmit = async () => {
    try {
      const values = await backupForm.validateFields();
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 2000));

      await Swal.fire({
        icon: 'success',
        title: 'Yedekleme Başlatıldı',
        text: 'Yedekleme işlemi başarıyla başlatıldı.',
        timer: 2000,
        showConfirmButton: false,
      });

      setIsBackupModalVisible(false);
    } catch (error) {
      message.error('Lütfen gerekli alanları doldurun');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreSubmit = async () => {
    try {
      const values = await restoreForm.validateFields();
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 2000));

      await Swal.fire({
        icon: 'warning',
        title: 'Restore İşlemi Başlatıldı',
        text: 'Geri yükleme işlemi başlatıldı. Bu işlem mevcut verileri etkileyebilir.',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#667eea',
      });

      setIsRestoreModalVisible(false);
    } catch (error) {
      message.error('Lütfen gerekli alanları doldurun');
    } finally {
      setLoading(false);
    }
  };

  const BackupModal = () => (
    <Modal
      title="Yeni Yedekleme Oluştur"
      open={isBackupModalVisible}
      onOk={handleBackupSubmit}
      onCancel={() => setIsBackupModalVisible(false)}
      confirmLoading={loading}
      width={700}
      okText="Yedeklemeyi Başlat"
      cancelText="İptal"
    >
      <Form form={backupForm} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Yedekleme Adı"
              rules={[{ required: true, message: 'Ad zorunludur' }]}
            >
              <Input placeholder="Manuel Yedekleme - 07.12.2024" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Yedekleme Tipi"
              rules={[{ required: true, message: 'Tip seçimi zorunludur' }]}
              initialValue="full"
            >
              <Select>
                <Option value="full">Tam Yedekleme</Option>
                <Option value="incremental">Artımlı Yedekleme</Option>
                <Option value="differential">Değişiklik Yedeklemesi</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Açıklama"
        >
          <Input.TextArea rows={3} placeholder="Yedekleme açıklaması..." />
        </Form.Item>

        <Form.Item
          name="tables"
          label="Yedeklenecek Tablolar"
          rules={[{ required: true, message: 'En az bir tablo seçmelisiniz' }]}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              <Col span={8}><Checkbox value="users">Users</Checkbox></Col>
              <Col span={8}><Checkbox value="orders">Orders</Checkbox></Col>
              <Col span={8}><Checkbox value="products">Products</Checkbox></Col>
              <Col span={8}><Checkbox value="invoices">Invoices</Checkbox></Col>
              <Col span={8}><Checkbox value="audit_logs">Audit Logs</Checkbox></Col>
              <Col span={8}><Checkbox value="settings">Settings</Checkbox></Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="retention"
              label="Saklama Süresi (gün)"
              initialValue={30}
              rules={[{ required: true, message: 'Saklama süresi zorunludur' }]}
            >
              <Select>
                <Option value={7}>7 gün</Option>
                <Option value={30}>30 gün</Option>
                <Option value={90}>90 gün</Option>
                <Option value={365}>1 yıl</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="schedule"
              label="Zamanlama"
              initialValue="now"
            >
              <Radio.Group>
                <Radio value="now">Hemen Başlat</Radio>
                <Radio value="scheduled">Zamanla</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="compressed" valuePropName="checked" initialValue={true}>
              <Checkbox>Sıkıştır (Gzip)</Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="encrypted" valuePropName="checked" initialValue={true}>
              <Checkbox>Şifrele (AES-256)</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Alert
          message="Yedekleme Uyarısı"
          description="Tam yedekleme işlemi sırasında veritabanı performansı etkilenebilir. Yoğun olmayan saatleri tercih edin."
          type="info"
          showIcon
        />
      </Form>
    </Modal>
  );

  const RestoreModal = () => (
    <Modal
      title={`Geri Yükleme: ${selectedBackup?.name}`}
      open={isRestoreModalVisible}
      onOk={handleRestoreSubmit}
      onCancel={() => setIsRestoreModalVisible(false)}
      confirmLoading={loading}
      width={600}
      okText="Restore İşlemini Başlat"
      cancelText="İptal"
    >
      <Alert
        message="Dikkat!"
        description="Geri yükleme işlemi mevcut verilerin üzerine yazacaktır. Bu işlem geri alınamaz."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={restoreForm} layout="vertical">
        <Form.Item
          name="targetEnvironment"
          label="Hedef Ortam"
          rules={[{ required: true, message: 'Hedef ortam seçimi zorunludur' }]}
          initialValue="development"
        >
          <Radio.Group>
            <Radio value="production">Production</Radio>
            <Radio value="staging">Staging</Radio>
            <Radio value="development">Development</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="restoreTables"
          label="Geri Yüklenecek Tablolar"
          rules={[{ required: true, message: 'En az bir tablo seçmelisiniz' }]}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {selectedBackup?.tables.map(table => (
                <Col span={12} key={table}>
                  <Checkbox value={table}>{table}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item name="dropExisting" valuePropName="checked">
          <Checkbox>Mevcut tabloları sil (DROP)</Checkbox>
        </Form.Item>

        <Form.Item name="createIndexes" valuePropName="checked" initialValue={true}>
          <Checkbox>İndeksleri yeniden oluştur</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );

  const BackupDetailDrawer = () => (
    <Drawer
      title={`Yedekleme Detayları: ${selectedBackup?.name}`}
      width={700}
      open={isDrawerVisible}
      onClose={() => setIsDrawerVisible(false)}
      extra={
        selectedBackup?.status === 'completed' && (
          <Space>
            <Button icon={<DownloadOutlined />}>İndir</Button>
            <Button type="primary" icon={<CloudUploadOutlined />}>
              Restore
            </Button>
          </Space>
        )
      }
    >
      {selectedBackup && (
        <div>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Yedekleme ID">
              {selectedBackup.id}
            </Descriptions.Item>
            <Descriptions.Item label="Ad">
              {selectedBackup.name}
            </Descriptions.Item>
            <Descriptions.Item label="Tip">
              <Tag color={backupTypeColors[selectedBackup.type]}>
                {selectedBackup.type.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Durum">
              <Badge
                status={statusColors[selectedBackup.status]}
                text={
                  selectedBackup.status === 'completed' ? 'Tamamlandı' :
                  selectedBackup.status === 'running' ? 'Çalışıyor' :
                  selectedBackup.status === 'failed' ? 'Başarısız' : 'Sırada'
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="Boyut">
              {formatFileSize(selectedBackup.size)}
            </Descriptions.Item>
            <Descriptions.Item label="Başlangıç">
              {dayjs(selectedBackup.createdAt).format('DD.MM.YYYY HH:mm:ss')}
            </Descriptions.Item>
            {selectedBackup.completedAt && (
              <Descriptions.Item label="Tamamlanma">
                {dayjs(selectedBackup.completedAt).format('DD.MM.YYYY HH:mm:ss')}
              </Descriptions.Item>
            )}
            {selectedBackup.duration && (
              <Descriptions.Item label="Süre">
                {selectedBackup.duration}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Saklama Süresi">
              {selectedBackup.retention} gün
            </Descriptions.Item>
            <Descriptions.Item label="Konum">
              <Text code style={{ fontSize: 12 }}>
                {selectedBackup.location}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Oluşturan">
              {selectedBackup.creator}
            </Descriptions.Item>
            <Descriptions.Item label="Özellikler">
              <Space>
                {selectedBackup.compressed && (
                  <Tag color="cyan">Sıkıştırılmış</Tag>
                )}
                {selectedBackup.encrypted && (
                  <Tag color="red">Şifrelenmiş</Tag>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={5}>Yedeklenen Tablolar ({selectedBackup.tables.length})</Title>
          <List
            size="small"
            dataSource={selectedBackup.tables}
            renderItem={(table) => (
              <List.Item>
                <Space>
                  <DatabaseOutlined />
                  <Text>{table}</Text>
                </Space>
              </List.Item>
            )}
          />

          {selectedBackup.status === 'failed' && (
            <>
              <Divider />
              <Alert
                message="Yedekleme Hatası"
                description="Disk alanı yetersiz. Yedekleme işlemi %35'te durduruldu."
                type="error"
                showIcon
                action={
                  <Button size="small" icon={<ReloadOutlined />}>
                    Tekrar Dene
                  </Button>
                }
              />
            </>
          )}
        </div>
      )}
    </Drawer>
  );

  return (
    <PageContainer
      header={{
        title: 'Yedekleme & Geri Yükleme',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Yedekleme & Geri Yükleme' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
      }}
    >
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Yedekleme"
              value={mockBackups.length}
              prefix={<DatabaseOutlined style={{ color: '#667eea' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Başarılı Yedekleme"
              value={mockBackups.filter(b => b.status === 'completed').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Boyut"
              value="4.8"
              suffix="GB"
              prefix={<CloudDownloadOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Son Yedekleme"
              value="2 saat önce"
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Yedeklemeler" key="backups">
          <Card>
            <Alert
              message="Otomatik Yedekleme"
              description="Günlük otomatik yedekleme her gece saat 03:00'te çalışır. Haftalık yedekleme pazartesi günleri yapılır."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <ProTable<Backup>
              columns={backupColumns}
              dataSource={mockBackups}
              rowKey="id"
              search={false}
              pagination={{
                pageSize: 10,
              }}
              toolBarRender={() => [
                <Button
                  key="refresh"
                  icon={<ReloadOutlined />}
                >
                  Yenile
                </Button>,
                <Button
                  key="settings"
                  icon={<SettingOutlined />}
                >
                  Ayarlar
                </Button>,
                <Button
                  key="create"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateBackup}
                >
                  Yeni Yedekleme
                </Button>,
              ]}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Restore İşleri" key="restores">
          <Card>
            <Table
              dataSource={mockRestoreJobs}
              columns={restoreColumns}
              rowKey="id"
              pagination={{
                pageSize: 10,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Yedekleme Geçmişi" key="history">
          <Card>
            <Timeline
              items={mockBackups.map(backup => ({
                dot: backup.status === 'completed' ? <CheckCircleOutlined /> :
                     backup.status === 'failed' ? <CloseCircleOutlined /> :
                     backup.status === 'running' ? <SyncOutlined spin /> : 
                     <ClockCircleOutlined />,
                color: backup.status === 'completed' ? 'green' :
                       backup.status === 'failed' ? 'red' :
                       backup.status === 'running' ? 'blue' : 'gray',
                children: (
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <Space>
                        <Text strong>{backup.name}</Text>
                        <Tag color={backupTypeColors[backup.type]} size="small">
                          {backup.type}
                        </Tag>
                        <Badge
                          status={statusColors[backup.status]}
                          text={
                            backup.status === 'completed' ? 'Tamamlandı' :
                            backup.status === 'running' ? 'Çalışıyor' :
                            backup.status === 'failed' ? 'Başarısız' : 'Sırada'
                          }
                        />
                      </Space>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(backup.createdAt).format('DD.MM.YYYY HH:mm')} • 
                      {formatFileSize(backup.size)} • 
                      {backup.creator}
                    </Text>
                    {backup.description && (
                      <div style={{ marginTop: 4 }}>
                        <Text>{backup.description}</Text>
                      </div>
                    )}
                    {backup.status === 'failed' && (
                      <Alert
                        message="Disk alanı yetersiz"
                        type="error"
                        size="small"
                        style={{ marginTop: 8, maxWidth: 300 }}
                      />
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </TabPane>

        <TabPane tab="Ayarlar" key="settings">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Otomatik Yedekleme">
                <Form layout="vertical">
                  <Form.Item label="Günlük Yedekleme">
                    <Space>
                      <Switch defaultChecked />
                      <Text>Her gün saat 03:00'te</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item label="Haftalık Yedekleme">
                    <Space>
                      <Switch defaultChecked />
                      <Text>Her pazartesi saat 02:00'de</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item label="Aylık Yedekleme">
                    <Space>
                      <Switch />
                      <Text>Her ayın 1'inde</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item label="Varsayılan Saklama Süresi">
                    <Select defaultValue={30} style={{ width: 150 }}>
                      <Option value={7}>7 gün</Option>
                      <Option value={30}>30 gün</Option>
                      <Option value={90}>90 gün</Option>
                      <Option value={365}>1 yıl</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Yedekleme Seçenekleri">
                <Form layout="vertical">
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>Otomatik sıkıştırma (Gzip)</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>AES-256 şifreleme</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Switch defaultChecked />
                      <Text>E-posta bildirimler</Text>
                    </Space>
                  </Form.Item>
                  <Form.Item label="Depolama Konumu">
                    <Select defaultValue="s3" style={{ width: '100%' }}>
                      <Option value="s3">Amazon S3</Option>
                      <Option value="azure">Azure Blob Storage</Option>
                      <Option value="gcs">Google Cloud Storage</Option>
                      <Option value="local">Yerel Depolama</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>

          <Card title="Hızlı İşlemler" style={{ marginTop: 16 }}>
            <Space wrap>
              <Button icon={<DatabaseOutlined />} onClick={handleCreateBackup}>
                Manuel Yedekleme Oluştur
              </Button>
              <Button icon={<UploadOutlined />}>
                Yedekleme Yükle
              </Button>
              <Button icon={<SettingOutlined />}>
                Zamanlama Ayarları
              </Button>
              <Button icon={<SafetyOutlined />}>
                Şifreleme Ayarları
              </Button>
            </Space>
          </Card>
        </TabPane>
      </Tabs>

      <BackupModal />
      <RestoreModal />
      <BackupDetailDrawer />
    </PageContainer>
  );
};

export default TenantBackupRestore;