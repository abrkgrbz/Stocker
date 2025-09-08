import React, { useState } from 'react';
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
  message,
  Tooltip,
  Badge,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Progress,
  Timeline,
  Descriptions,
  Steps,
  Result,
  List,
  Avatar,
  Tabs,
  Radio,
  Checkbox,
  DatePicker,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  CloudServerOutlined,
  DatabaseOutlined,
  SyncOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
  HistoryOutlined,
  FileTextOutlined,
  CodeOutlined,
  BugOutlined,
  SafetyOutlined,
  ScheduleOutlined,
  RollbackOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface Migration {
  id: string;
  name: string;
  tenant: string;
  version: string;
  type: 'schema' | 'data' | 'full';
  status: 'completed' | 'running' | 'failed' | 'pending' | 'rollback';
  progress: number;
  startTime: string;
  endTime?: string;
  duration?: string;
  appliedBy: string;
  description: string;
  changes: number;
  size: string;
}

const MigrationsPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null);
  const [activeTab, setActiveTab] = useState('migrations');
  const [form] = Form.useForm();

  // Mock data
  const mockMigrations: Migration[] = [
    {
      id: '1',
      name: 'add_user_roles_table',
      tenant: 'ABC Corporation',
      version: 'v2.4.0',
      type: 'schema',
      status: 'completed',
      progress: 100,
      startTime: '2024-12-01 14:30:00',
      endTime: '2024-12-01 14:31:15',
      duration: '1m 15s',
      appliedBy: 'System',
      description: 'Kullanıcı rolleri tablosu eklendi',
      changes: 3,
      size: '2.4 KB',
    },
    {
      id: '2',
      name: 'update_pricing_structure',
      tenant: 'Tech Startup Ltd.',
      version: 'v2.3.5',
      type: 'data',
      status: 'running',
      progress: 65,
      startTime: '2024-12-07 10:15:00',
      appliedBy: 'Admin',
      description: 'Fiyatlandırma yapısı güncelleniyor',
      changes: 150,
      size: '45.2 KB',
    },
    {
      id: '3',
      name: 'migrate_legacy_data',
      tenant: 'Example Company',
      version: 'v2.3.0',
      type: 'full',
      status: 'failed',
      progress: 32,
      startTime: '2024-12-06 22:00:00',
      endTime: '2024-12-06 22:15:30',
      duration: '15m 30s',
      appliedBy: 'System',
      description: 'Eski veri tabanından veri aktarımı',
      changes: 1250,
      size: '3.2 MB',
    },
    {
      id: '4',
      name: 'add_audit_logs',
      tenant: 'Global Services',
      version: 'v2.2.0',
      type: 'schema',
      status: 'pending',
      progress: 0,
      startTime: '2024-12-08 00:00:00',
      appliedBy: 'Scheduled',
      description: 'Denetim logları tablosu eklenecek',
      changes: 5,
      size: '8.1 KB',
    },
  ];

  const statusColors = {
    completed: 'success',
    running: 'processing',
    failed: 'error',
    pending: 'warning',
    rollback: 'default',
  };

  const typeColors = {
    schema: 'blue',
    data: 'green',
    full: 'purple',
  };

  const columns: ProColumns<Migration>[] = [
    {
      title: 'Migration',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <DatabaseOutlined style={{ color: '#667eea' }} />
            <Text strong>{record.name}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Tenant',
      dataIndex: 'tenant',
      key: 'tenant',
      filters: true,
      onFilter: true,
    },
    {
      title: 'Versiyon',
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => (
        <Tag color="blue">{version}</Tag>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={typeColors[type as keyof typeof typeColors]}>
          {type === 'schema' ? 'Şema' : type === 'data' ? 'Veri' : 'Tam'}
        </Tag>
      ),
      filters: [
        { text: 'Şema', value: 'schema' },
        { text: 'Veri', value: 'data' },
        { text: 'Tam', value: 'full' },
      ],
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record) => (
        <Space direction="vertical" size={0} style={{ width: 120 }}>
          <Badge
            status={statusColors[status as keyof typeof statusColors]}
            text={
              status === 'completed' ? 'Tamamlandı' :
              status === 'running' ? 'Çalışıyor' :
              status === 'failed' ? 'Başarısız' :
              status === 'pending' ? 'Bekliyor' : 'Geri Alındı'
            }
          />
          {(status === 'running' || status === 'failed') && (
            <Progress
              percent={record.progress}
              size="small"
              status={status === 'failed' ? 'exception' : 'active'}
            />
          )}
        </Space>
      ),
      filters: [
        { text: 'Tamamlandı', value: 'completed' },
        { text: 'Çalışıyor', value: 'running' },
        { text: 'Başarısız', value: 'failed' },
        { text: 'Bekliyor', value: 'pending' },
      ],
    },
    {
      title: 'Değişiklikler',
      dataIndex: 'changes',
      key: 'changes',
      render: (changes: number, record) => (
        <Space>
          <Text>{changes} değişiklik</Text>
          <Text type="secondary">({record.size})</Text>
        </Space>
      ),
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => (
        <Text type="secondary">{dayjs(time).format('DD.MM.YYYY HH:mm')}</Text>
      ),
    },
    {
      title: 'Süre',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: string, record) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{duration || 'Devam ediyor'}</Text>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'running' && (
            <Tooltip title="Durdur">
              <Button
                type="text"
                icon={<PauseCircleOutlined />}
                onClick={() => handleStop(record)}
              />
            </Tooltip>
          )}
          {record.status === 'pending' && (
            <Tooltip title="Başlat">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record)}
              />
            </Tooltip>
          )}
          {record.status === 'completed' && (
            <Tooltip title="Geri Al">
              <Button
                type="text"
                icon={<RollbackOutlined />}
                onClick={() => handleRollback(record)}
              />
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

  const handleStart = async (migration: Migration) => {
    await Swal.fire({
      title: 'Migration Başlatılsın mı?',
      text: `${migration.name} migration'ı başlatılacak.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Başlat',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#667eea',
    }).then((result) => {
      if (result.isConfirmed) {
        message.success('Migration başlatıldı');
      }
    });
  };

  const handleStop = async (migration: Migration) => {
    await Swal.fire({
      title: 'Migration Durdurulsun mu?',
      text: 'Bu işlem veri kaybına neden olabilir!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Durdur',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ff4d4f',
    }).then((result) => {
      if (result.isConfirmed) {
        message.warning('Migration durduruldu');
      }
    });
  };

  const handleRollback = async (migration: Migration) => {
    await Swal.fire({
      title: 'Migration Geri Alınsın mı?',
      text: 'Bu işlem önceki duruma geri dönecek!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Geri Al',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ff4d4f',
    }).then((result) => {
      if (result.isConfirmed) {
        message.info('Migration geri alınıyor...');
      }
    });
  };

  const handleViewDetails = (migration: Migration) => {
    setSelectedMigration(migration);
  };

  const MigrationDetails = () => {
    if (!selectedMigration) return null;

    return (
      <Card title="Migration Detayları" extra={
        <Button onClick={() => setSelectedMigration(null)}>Kapat</Button>
      }>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Migration Adı" span={2}>
            {selectedMigration.name}
          </Descriptions.Item>
          <Descriptions.Item label="Tenant">
            {selectedMigration.tenant}
          </Descriptions.Item>
          <Descriptions.Item label="Versiyon">
            <Tag color="blue">{selectedMigration.version}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tip">
            <Tag color={typeColors[selectedMigration.type as keyof typeof typeColors]}>
              {selectedMigration.type}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Badge
              status={statusColors[selectedMigration.status as keyof typeof statusColors]}
              text={selectedMigration.status}
            />
          </Descriptions.Item>
          <Descriptions.Item label="İlerleme" span={2}>
            <Progress percent={selectedMigration.progress} />
          </Descriptions.Item>
          <Descriptions.Item label="Başlangıç">
            {selectedMigration.startTime}
          </Descriptions.Item>
          <Descriptions.Item label="Bitiş">
            {selectedMigration.endTime || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Süre">
            {selectedMigration.duration || 'Devam ediyor'}
          </Descriptions.Item>
          <Descriptions.Item label="Uygulayan">
            {selectedMigration.appliedBy}
          </Descriptions.Item>
          <Descriptions.Item label="Değişiklik Sayısı">
            {selectedMigration.changes}
          </Descriptions.Item>
          <Descriptions.Item label="Boyut">
            {selectedMigration.size}
          </Descriptions.Item>
          <Descriptions.Item label="Açıklama" span={2}>
            {selectedMigration.description}
          </Descriptions.Item>
        </Descriptions>

        {selectedMigration.status === 'failed' && (
          <Alert
            message="Migration Başarısız"
            description="Connection timeout: Unable to connect to database server"
            type="error"
            showIcon
            style={{ marginTop: 16 }}
            action={
              <Button size="small" danger>
                Tekrar Dene
              </Button>
            }
          />
        )}

        <Divider />

        <Title level={5}>Migration Script</Title>
        <pre style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 8,
          overflow: 'auto',
        }}>
          <code>{`-- Migration: ${selectedMigration.name}
-- Version: ${selectedMigration.version}
-- Date: ${selectedMigration.startTime}

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

COMMIT;`}</code>
        </pre>
      </Card>
    );
  };

  const CreateMigrationModal = () => (
    <Modal
      title="Yeni Migration Oluştur"
      open={isModalVisible}
      onOk={() => {
        form.validateFields().then(async () => {
          await Swal.fire({
            icon: 'success',
            title: 'Migration Oluşturuldu',
            text: 'Migration başarıyla oluşturuldu ve sıraya alındı.',
            timer: 2000,
            showConfirmButton: false,
          });
          setIsModalVisible(false);
          form.resetFields();
        });
      }}
      onCancel={() => {
        setIsModalVisible(false);
        form.resetFields();
      }}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Migration Adı"
          rules={[{ required: true, message: 'Migration adı zorunludur' }]}
        >
          <Input placeholder="add_new_feature_table" />
        </Form.Item>

        <Form.Item
          name="tenant"
          label="Tenant"
          rules={[{ required: true, message: 'Tenant seçimi zorunludur' }]}
        >
          <Select placeholder="Tenant seçin">
            <Option value="all">Tüm Tenantlar</Option>
            <Option value="ABC Corporation">ABC Corporation</Option>
            <Option value="Tech Startup Ltd.">Tech Startup Ltd.</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="type"
          label="Migration Tipi"
          rules={[{ required: true, message: 'Tip seçimi zorunludur' }]}
        >
          <Radio.Group>
            <Radio value="schema">Şema Değişikliği</Radio>
            <Radio value="data">Veri Migrasyonu</Radio>
            <Radio value="full">Tam Migration</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="script"
          label="Migration Script"
          rules={[{ required: true, message: 'Script zorunludur' }]}
        >
          <TextArea
            rows={10}
            placeholder="SQL script veya migration kodu..."
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item
          name="schedule"
          label="Zamanlama"
        >
          <Radio.Group defaultValue="now">
            <Radio value="now">Hemen Çalıştır</Radio>
            <Radio value="scheduled">Zamanla</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="scheduledTime"
          label="Zamanlanmış Tarih/Saat"
          style={{ display: form.getFieldValue('schedule') === 'scheduled' ? 'block' : 'none' }}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Alert
          message="Önemli"
          description="Migration işlemi geri alınamaz değişiklikler yapabilir. Lütfen önce test ortamında deneyin."
          type="warning"
          showIcon
        />
      </Form>
    </Modal>
  );

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
              title="Toplam Migration"
              value={mockMigrations.length}
              prefix={<DatabaseOutlined style={{ color: '#667eea' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Başarılı"
              value={mockMigrations.filter(m => m.status === 'completed').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Çalışıyor"
              value={mockMigrations.filter(m => m.status === 'running').length}
              prefix={<SyncOutlined spin style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Başarısız"
              value={mockMigrations.filter(m => m.status === 'failed').length}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {selectedMigration ? (
        <MigrationDetails />
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Migration Listesi" key="migrations">
            <ProTable<Migration>
              columns={columns}
              dataSource={mockMigrations}
              rowKey="id"
              search={{
                labelWidth: 120,
              }}
              pagination={{
                pageSize: 10,
              }}
              toolBarRender={() => [
                <Button
                  key="history"
                  icon={<HistoryOutlined />}
                >
                  Geçmiş
                </Button>,
                <Button
                  key="create"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalVisible(true)}
                >
                  Yeni Migration
                </Button>,
              ]}
            />
          </TabPane>

          <TabPane tab="Zamanlanmış Migrationlar" key="scheduled">
            <List
              dataSource={mockMigrations.filter(m => m.status === 'pending')}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<PlayCircleOutlined />}>Şimdi Çalıştır</Button>,
                    <Button type="link" icon={<EditOutlined />}>Düzenle</Button>,
                    <Button type="link" danger icon={<DeleteOutlined />}>İptal</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<ScheduleOutlined style={{ fontSize: 24, color: '#faad14' }} />}
                    title={item.name}
                    description={
                      <Space direction="vertical">
                        <Text>Tenant: {item.tenant}</Text>
                        <Text type="secondary">Zamanlanmış: {item.startTime}</Text>
                        <Text type="secondary">{item.description}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
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
                  title="Migration Oluştur"
                  description="Migration script'ini oluşturun ve doğrulayın"
                  icon={<CodeOutlined />}
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
            </Card>
          </TabPane>
        </Tabs>
      )}

      <CreateMigrationModal />
    </PageContainer>
  );
};

export default MigrationsPage;