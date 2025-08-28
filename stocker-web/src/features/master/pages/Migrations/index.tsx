import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, message, Modal, Spin, Alert, Tooltip, Badge, Divider } from 'antd';
import { SyncOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DatabaseOutlined, HistoryOutlined, ThunderboltOutlined } from '@ant-design/icons';
import api from '@/services/api';
import './styles.css';

interface TenantMigration {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  pendingMigrations: string[];
  appliedMigrations: string[];
  hasPendingMigrations: boolean;
  error?: string;
}

interface MigrationResult {
  tenantId: string;
  tenantName: string;
  success: boolean;
  message: string;
  appliedMigrations?: string[];
  error?: string;
}

const MigrationsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [migrations, setMigrations] = useState<TenantMigration[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantMigration | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  useEffect(() => {
    fetchMigrations();
  }, []);

  const fetchMigrations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/master/migrations/pending');
      setMigrations(response.data.data || []);
    } catch (error) {
      message.error('Migration durumu alınamadı');
      console.error('Error fetching migrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyMigrationToTenant = async (tenantId: string, tenantName: string) => {
    Modal.confirm({
      title: 'Migration Uygula',
      content: (
        <div>
          <p><strong>{tenantName}</strong> tenant'ına migration'lar uygulanacak.</p>
          <Alert
            message="Dikkat"
            description="Bu işlem database şemasını değiştirecektir. İşlem geri alınamaz!"
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
          />
        </div>
      ),
      okText: 'Uygula',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        setApplyingTo(tenantId);
        try {
          const response = await api.post(`/api/master/migrations/apply/${tenantId}`);
          message.success(response.data.message || 'Migration başarıyla uygulandı');
          await fetchMigrations();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Migration uygulanamadı');
          console.error('Error applying migration:', error);
        } finally {
          setApplyingTo(null);
        }
      }
    });
  };

  const applyMigrationsToAll = async () => {
    Modal.confirm({
      title: 'Tüm Tenantlara Migration Uygula',
      content: (
        <div>
          <p>Tüm aktif tenant'lara bekleyen migration'lar uygulanacak.</p>
          <Alert
            message="Kritik İşlem"
            description="Bu işlem TÜM tenant database'lerini güncelleyecektir. İşlem geri alınamaz ve uzun sürebilir!"
            type="error"
            showIcon
            style={{ marginTop: 12 }}
          />
        </div>
      ),
      okText: 'Tümüne Uygula',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        const hide = message.loading('Migrationlar uygulanıyor...', 0);
        setLoading(true);
        try {
          const response = await api.post('/api/master/migrations/apply-all');
          hide();
          
          // Show results modal
          Modal.info({
            title: 'Migration Sonuçları',
            width: 800,
            content: (
              <div>
                <p>{response.data.message}</p>
                <Divider />
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  {response.data.results.map((result: MigrationResult) => (
                    <div key={result.tenantId} style={{ marginBottom: 12 }}>
                      <Tag color={result.success ? 'success' : 'error'}>
                        {result.success ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                      </Tag>
                      <strong>{result.tenantName}:</strong> {result.message}
                      {result.error && (
                        <Alert
                          message={result.error}
                          type="error"
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
            okText: 'Tamam'
          });
          
          await fetchMigrations();
        } catch (error: any) {
          hide();
          message.error(error.response?.data?.message || 'Migrationlar uygulanamadı');
          console.error('Error applying migrations to all:', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const showMigrationHistory = async (tenant: TenantMigration) => {
    setSelectedTenant(tenant);
    setHistoryModalVisible(true);
  };

  const columns = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (record: TenantMigration) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.tenantName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.tenantCode}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      render: (record: TenantMigration) => {
        if (record.error) {
          return <Tag color="error">Hata</Tag>;
        }
        return record.hasPendingMigrations ? (
          <Badge count={record.pendingMigrations.length}>
            <Tag color="warning">Bekleyen Migration Var</Tag>
          </Badge>
        ) : (
          <Tag color="success">Güncel</Tag>
        );
      },
    },
    {
      title: 'Bekleyen Migrationlar',
      key: 'pending',
      render: (record: TenantMigration) => {
        if (record.error) {
          return (
            <Tooltip title={record.error}>
              <span style={{ color: '#ff4d4f' }}>Bağlantı hatası</span>
            </Tooltip>
          );
        }
        if (!record.hasPendingMigrations) {
          return <span style={{ color: '#52c41a' }}>Yok</span>;
        }
        return (
          <div>
            {record.pendingMigrations.map((migration, index) => (
              <div key={index} style={{ fontSize: 12 }}>
                • {migration}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Uygulanan',
      key: 'applied',
      render: (record: TenantMigration) => (
        <span>{record.appliedMigrations?.length || 0} migration</span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (record: TenantMigration) => (
        <Space>
          <Tooltip title="Migration geçmişini görüntüle">
            <Button
              type="link"
              icon={<HistoryOutlined />}
              onClick={() => showMigrationHistory(record)}
            />
          </Tooltip>
          {record.hasPendingMigrations && !record.error && (
            <Button
              type="primary"
              size="small"
              icon={<SyncOutlined />}
              loading={applyingTo === record.tenantId}
              onClick={() => applyMigrationToTenant(record.tenantId, record.tenantName)}
            >
              Migration Uygula
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tenantsWithPending = migrations.filter(m => m.hasPendingMigrations && !m.error);

  return (
    <div className="migrations-page">
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              <DatabaseOutlined /> Database Migration Yönetimi
            </span>
            <Space>
              <Button
                icon={<SyncOutlined />}
                onClick={fetchMigrations}
                loading={loading}
              >
                Yenile
              </Button>
              {tenantsWithPending.length > 0 && (
                <Button
                  type="primary"
                  danger
                  icon={<ThunderboltOutlined />}
                  onClick={applyMigrationsToAll}
                  loading={loading}
                >
                  Tümüne Uygula ({tenantsWithPending.length} tenant)
                </Button>
              )}
            </Space>
          </div>
        }
      >
        {tenantsWithPending.length > 0 && (
          <Alert
            message={`${tenantsWithPending.length} tenant'ta bekleyen migration var`}
            description="Migration'ları tek tek veya toplu olarak uygulayabilirsiniz."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Spin spinning={loading}>
          <Table
            dataSource={migrations}
            columns={columns}
            rowKey="tenantId"
            pagination={false}
            rowClassName={(record) => record.error ? 'error-row' : ''}
          />
        </Spin>
      </Card>

      <Modal
        title={`Migration Geçmişi - ${selectedTenant?.tenantName}`}
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            Kapat
          </Button>
        ]}
        width={600}
      >
        {selectedTenant && (
          <div>
            <p><strong>Tenant Kodu:</strong> {selectedTenant.tenantCode}</p>
            <Divider />
            <h4>Uygulanan Migration'lar ({selectedTenant.appliedMigrations?.length || 0})</h4>
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              {selectedTenant.appliedMigrations?.map((migration, index) => (
                <div key={index} style={{ padding: '4px 0' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  {migration}
                </div>
              )) || <p>Migration geçmişi yok</p>}
            </div>
            {selectedTenant.hasPendingMigrations && (
              <>
                <Divider />
                <h4 style={{ color: '#faad14' }}>
                  Bekleyen Migration'lar ({selectedTenant.pendingMigrations?.length || 0})
                </h4>
                <div style={{ maxHeight: 200, overflow: 'auto' }}>
                  {selectedTenant.pendingMigrations?.map((migration, index) => (
                    <div key={index} style={{ padding: '4px 0' }}>
                      <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                      {migration}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MigrationsPage;