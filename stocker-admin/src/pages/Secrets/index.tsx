import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Typography,
  App,
  Modal,
  Descriptions,
  Badge,
  Row,
  Col,
  Statistic,
  Alert,
  Tooltip,
  Popconfirm,
  Empty,
  Collapse,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  KeyOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudOutlined,
  LockOutlined,
  DatabaseOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { secretsService, SecretInfo, SecretsListResponse, SecretStoreStatus } from '../../services/api/secretsService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Panel } = Collapse;

const SecretsPage: React.FC = () => {
  const { modal, message } = App.useApp();
  const [secrets, setSecrets] = useState<SecretInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [storeStatus, setStoreStatus] = useState<SecretStoreStatus | null>(null);
  const [selectedSecret, setSelectedSecret] = useState<SecretInfo | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [groupedSecrets, setGroupedSecrets] = useState<Map<string, SecretInfo[]>>(new Map());

  const fetchStatus = async () => {
    try {
      const status = await secretsService.getStatus();
      setStoreStatus(status);
    } catch (error: any) {
      message.error(error.message || 'Secret store durumu alınamadı');
    }
  };

  const fetchSecrets = async () => {
    setLoading(true);
    try {
      const data: SecretsListResponse = await secretsService.listSecrets();
      setSecrets(data.secrets);
      const grouped = secretsService.groupSecretsByTenant(data.secrets);
      setGroupedSecrets(grouped);
    } catch (error: any) {
      message.error(error.message || 'Secretlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchSecrets();
  }, []);

  const handleDeleteSecret = async (secretName: string) => {
    try {
      await secretsService.deleteSecret(secretName);
      message.success(`Secret '${secretName}' silindi`);
      fetchSecrets();
    } catch (error: any) {
      message.error(error.message || 'Secret silinemedi');
    }
  };

  const handleDeleteTenantSecrets = async (tenantShortId: string) => {
    modal.confirm({
      title: 'Tenant Secretlarını Sil',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p><strong>{tenantShortId}</strong> tenant'ına ait tüm secretları silmek istediğinize emin misiniz?</p>
          <Alert
            type="warning"
            message="Bu işlem geri alınamaz!"
            description="Silinen secretlar Key Vault'ta soft-delete durumuna geçer ancak uygulama tarafından kullanılamaz hale gelir."
            style={{ marginTop: 12 }}
          />
        </div>
      ),
      okText: 'Tümünü Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          const result = await secretsService.deleteTenantSecrets(tenantShortId);
          message.success(`${result.deletedCount} secret silindi`);
          if (result.failedCount > 0) {
            message.warning(`${result.failedCount} secret silinemedi`);
          }
          fetchSecrets();
        } catch (error: any) {
          message.error(error.message || 'Secretlar silinemedi');
        }
      },
    });
  };

  const showDetails = (secret: SecretInfo) => {
    setSelectedSecret(secret);
    setDetailsModalVisible(true);
  };

  const getSecretTypeTag = (secretType: string) => {
    const typeMap: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      ConnectionString: { color: 'blue', icon: <DatabaseOutlined />, text: 'Connection String' },
      Password: { color: 'orange', icon: <LockOutlined />, text: 'Password' },
      Unknown: { color: 'default', icon: <KeyOutlined />, text: 'Unknown' },
    };
    const typeInfo = typeMap[secretType] || typeMap.Unknown;
    return (
      <Tag color={typeInfo.color} icon={typeInfo.icon}>
        {typeInfo.text}
      </Tag>
    );
  };

  const getEnabledBadge = (enabled: boolean) => {
    return enabled ? (
      <Badge status="success" text="Aktif" />
    ) : (
      <Badge status="error" text="Pasif" />
    );
  };

  const columns: ColumnsType<SecretInfo> = [
    {
      title: 'Secret Adı',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name) => (
        <Tooltip title={name}>
          <Text strong copyable={{ text: name }}>
            {name.length > 40 ? `${name.substring(0, 40)}...` : name}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'secretType',
      key: 'secretType',
      width: 150,
      render: (type) => getSecretTypeTag(type),
    },
    {
      title: 'Tenant',
      dataIndex: 'tenantShortId',
      key: 'tenantShortId',
      width: 150,
      render: (tenantId) =>
        tenantId ? (
          <Tag color="purple">{tenantId}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Durum',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled) => getEnabledBadge(enabled),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 150,
      render: (date) =>
        date ? (
          <Tooltip title={dayjs(date).format('DD.MM.YYYY HH:mm:ss')}>
            {dayjs(date).fromNow()}
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Son Güncelleme',
      dataIndex: 'updatedOn',
      key: 'updatedOn',
      width: 150,
      render: (date) =>
        date ? (
          <Tooltip title={dayjs(date).format('DD.MM.YYYY HH:mm:ss')}>
            {dayjs(date).fromNow()}
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showDetails(record)}
          >
            Detay
          </Button>
          <Popconfirm
            title="Secret'ı Sil"
            description={`'${record.name}' secretını silmek istediğinize emin misiniz?`}
            onConfirm={() => handleDeleteSecret(record.name)}
            okText="Sil"
            cancelText="İptal"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Statistics
  const stats = {
    totalSecrets: secrets.length,
    connectionStrings: secrets.filter((s) => s.secretType === 'ConnectionString').length,
    passwords: secrets.filter((s) => s.secretType === 'Password').length,
    tenantCount: groupedSecrets.size,
    activeSecrets: secrets.filter((s) => s.enabled).length,
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Status Card */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={8}>
            <Space>
              <CloudOutlined style={{ fontSize: 24, color: storeStatus?.isAvailable ? '#52c41a' : '#ff4d4f' }} />
              <div>
                <Text type="secondary">Secret Store</Text>
                <br />
                <Text strong>{storeStatus?.provider || 'Yükleniyor...'}</Text>
                {storeStatus && (
                  <Tag
                    color={storeStatus.isAvailable ? 'success' : 'error'}
                    style={{ marginLeft: 8 }}
                  >
                    {storeStatus.isAvailable ? 'Bağlı' : 'Bağlantı Yok'}
                  </Tag>
                )}
              </div>
            </Space>
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchStatus();
                fetchSecrets();
              }}
              loading={loading}
            >
              Yenile
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Secret"
              value={stats.totalSecrets}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Connection String"
              value={stats.connectionStrings}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Password"
              value={stats.passwords}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tenant Sayısı"
              value={stats.tenantCount}
              prefix={<CloudOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Warning if store is unavailable */}
      {storeStatus && !storeStatus.isAvailable && (
        <Alert
          type="error"
          message="Secret Store Bağlantı Hatası"
          description="Azure Key Vault'a bağlanılamıyor. Lütfen yapılandırmayı kontrol edin."
          icon={<WarningOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Main Content */}
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              <KeyOutlined /> Azure Key Vault Secrets
            </Title>
          </div>

          {/* Grouped by Tenant */}
          {groupedSecrets.size > 0 ? (
            <Collapse defaultActiveKey={Array.from(groupedSecrets.keys())}>
              {Array.from(groupedSecrets.entries()).map(([tenantId, tenantSecrets]) => (
                <Panel
                  header={
                    <Space>
                      <Tag color="purple">{tenantId}</Tag>
                      <Text>{tenantSecrets.length} secret</Text>
                    </Space>
                  }
                  key={tenantId}
                  extra={
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTenantSecrets(tenantId);
                      }}
                    >
                      Tümünü Sil
                    </Button>
                  }
                >
                  <Table
                    columns={columns}
                    dataSource={tenantSecrets}
                    rowKey="name"
                    loading={loading}
                    pagination={false}
                    size="small"
                    scroll={{ x: 1200 }}
                  />
                </Panel>
              ))}
            </Collapse>
          ) : (
            <Empty
              description={
                loading ? 'Yükleniyor...' : 'Henüz secret bulunmuyor'
              }
            />
          )}

          {/* All Secrets Table */}
          <Card title="Tüm Secretlar" size="small" style={{ marginTop: 16 }}>
            <Table
              columns={columns}
              dataSource={secrets}
              rowKey="name"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} secret`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Space>
      </Card>

      {/* Details Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            Secret Detayları
          </Space>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Popconfirm
            key="delete"
            title="Secret'ı Sil"
            description="Bu secretı silmek istediğinize emin misiniz?"
            onConfirm={() => {
              if (selectedSecret) {
                handleDeleteSecret(selectedSecret.name);
                setDetailsModalVisible(false);
              }
            }}
            okText="Sil"
            cancelText="İptal"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              Sil
            </Button>
          </Popconfirm>,
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Kapat
          </Button>,
        ]}
        width={700}
      >
        {selectedSecret && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Secret Adı">
              <Text copyable>{selectedSecret.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tür">
              {getSecretTypeTag(selectedSecret.secretType)}
            </Descriptions.Item>
            <Descriptions.Item label="Tenant">
              {selectedSecret.tenantShortId ? (
                <Tag color="purple">{selectedSecret.tenantShortId}</Tag>
              ) : (
                <Text type="secondary">Bilinmiyor</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Durum">
              {getEnabledBadge(selectedSecret.enabled)}
            </Descriptions.Item>
            <Descriptions.Item label="Oluşturulma Tarihi">
              {selectedSecret.createdOn
                ? dayjs(selectedSecret.createdOn).format('DD.MM.YYYY HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Son Güncelleme">
              {selectedSecret.updatedOn
                ? dayjs(selectedSecret.updatedOn).format('DD.MM.YYYY HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Son Kullanma Tarihi">
              {selectedSecret.expiresOn ? (
                <Space>
                  {dayjs(selectedSecret.expiresOn).format('DD.MM.YYYY HH:mm:ss')}
                  {dayjs(selectedSecret.expiresOn).isBefore(dayjs()) && (
                    <Tag color="error">Süresi Dolmuş</Tag>
                  )}
                </Space>
              ) : (
                <Text type="secondary">Belirlenmemiş</Text>
              )}
            </Descriptions.Item>
            {Object.keys(selectedSecret.tags || {}).length > 0 && (
              <Descriptions.Item label="Etiketler">
                <Space wrap>
                  {Object.entries(selectedSecret.tags).map(([key, value]) => (
                    <Tag key={key}>
                      {key}: {value}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SecretsPage;
