import React, { useState, useEffect } from 'react';

import { SyncOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DatabaseOutlined, HistoryOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Table, Button, Space, Tag, message, Modal, Spin, Alert, Tooltip, Badge, Divider } from 'antd';
import Swal from 'sweetalert2';

import api from '@/services/api';

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
      // Error handling removed for production
    } finally {
      setLoading(false);
    }
  };

  const applyMigrationToTenant = async (tenantId: string, tenantName: string) => {
        const result = await Swal.fire({
      title: 'Migration Uygula',
      html: `
        <div>
          <p><strong>${tenantName}</strong> tenant'ına migration'lar uygulanacak.</p>
          <div style="background-color: #fff2e8; border: 1px solid #faad14; border-radius: 4px; padding: 12px; margin-top: 12px;">
            <strong style="color: #faad14;">⚠️ Dikkat</strong><br/>
            Bu işlem database şemasını değiştirecektir. İşlem geri alınamaz!
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Uygula',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ff4d4f',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
                try {
          const response = await api.post(`/api/master/migrations/apply/${tenantId}`);
                    return response.data;
        } catch (error: any) {
          // Error handling removed for production
          Swal.showValidationMessage(
            `Hata: ${error.response?.data?.message || error.message || 'Migration uygulanamadı'}`
          );
          throw error;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      setApplyingTo(tenantId);
      
      await Swal.fire({
        title: 'Başarılı!',
        html: `
          <div>
            <p>${result.value.message || 'Migration başarıyla uygulandı'}</p>
            ${result.value.appliedMigrations && result.value.appliedMigrations.length > 0 ? `
              <div style="margin-top: 12px; text-align: left;">
                <strong>Uygulanan Migration'lar:</strong>
                <ul style="margin-top: 8px;">
                  ${result.value.appliedMigrations.map((m: string) => `<li>${m}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#52c41a'
      });
      
      await fetchMigrations();
      setApplyingTo(null);
    }
  };

  const applyMigrationsToAll = async () => {
    const result = await Swal.fire({
      title: 'Tüm Tenantlara Migration Uygula',
      html: `
        <div>
          <p>Tüm aktif tenant'lara bekleyen migration'lar uygulanacak.</p>
          <div style="background-color: #fff1f0; border: 1px solid #ff4d4f; border-radius: 4px; padding: 12px; margin-top: 12px;">
            <strong style="color: #ff4d4f;">🚨 Kritik İşlem</strong><br/>
            Bu işlem TÜM tenant database'lerini güncelleyecektir. İşlem geri alınamaz ve uzun sürebilir!
          </div>
        </div>
      `,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Tümüne Uygula',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ff4d4f',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await api.post('/api/master/migrations/apply-all');
          return response.data;
        } catch (error: any) {
          Swal.showValidationMessage(
            `Hata: ${error.response?.data?.message || error.message || 'Migrationlar uygulanamadı'}`
          );
          throw error;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      setLoading(true);
      
      // Show results
      let resultsHtml = `<p>${result.value.message}</p><hr/>`;
      resultsHtml += '<div style="max-height: 400px; overflow: auto; text-align: left;">';
      
      result.value.results.forEach((res: MigrationResult) => {
        const icon = res.success ? '✅' : '❌';
        const color = res.success ? '#52c41a' : '#ff4d4f';
        resultsHtml += `
          <div style="margin-bottom: 12px; padding: 8px; border-left: 3px solid ${color};">
            <span>${icon}</span>
            <strong>${res.tenantName}:</strong> ${res.message}
            ${res.error ? `<div style="color: #ff4d4f; margin-top: 4px; font-size: 12px;">${res.error}</div>` : ''}
            ${res.appliedMigrations && res.appliedMigrations.length > 0 ? `
              <div style="margin-top: 4px; font-size: 12px;">
                <em>Uygulanan: ${res.appliedMigrations.join(', ')}</em>
              </div>
            ` : ''}
          </div>
        `;
      });
      
      resultsHtml += '</div>';
      
      await Swal.fire({
        title: 'Migration Sonuçları',
        html: resultsHtml,
        icon: result.value.failureCount > 0 ? 'warning' : 'success',
        confirmButtonText: 'Tamam',
        confirmButtonColor: result.value.failureCount > 0 ? '#faad14' : '#52c41a',
        width: 800
      });
      
      await fetchMigrations();
      setLoading(false);
    }
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