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
  Switch,
  Spin,
  Select,
  Descriptions,
  Progress,
  Empty,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  LockOutlined,
  UnlockOutlined,
  CrownOutlined,
  RocketOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  DollarOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import {
  tenantModuleService,
  tenantService,
  type AvailableModuleDto,
  type TenantModuleStatusDto,
  type TenantDto,
} from '../../services/api/index';

const { Title, Text, Paragraph } = Typography;

// Module icon mapping
const moduleIcons: Record<string, React.ReactNode> = {
  CRM: <TeamOutlined />,
  Inventory: <DatabaseOutlined />,
  Sales: <ShoppingCartOutlined />,
  Purchase: <ShoppingCartOutlined style={{ transform: 'scaleX(-1)' }} />,
  Finance: <DollarOutlined />,
  HR: <TeamOutlined />,
  Projects: <ProjectOutlined />,
  ACCOUNTING: <BarChartOutlined />,
};

// Module color mapping
const moduleColors: Record<string, string> = {
  CRM: '#1890ff',
  Inventory: '#52c41a',
  Sales: '#faad14',
  Purchase: '#13c2c2',
  Finance: '#722ed1',
  HR: '#eb2f96',
  Projects: '#fa541c',
  ACCOUNTING: '#2f54eb',
};

const TenantModulesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [moduleStatus, setModuleStatus] = useState<TenantModuleStatusDto | null>(null);
  const [loadingModules, setLoadingModules] = useState(false);
  const [activatingModule, setActivatingModule] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenantId) {
      loadModuleStatus(selectedTenantId);
    }
  }, [selectedTenantId]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const tenantList = await tenantService.getAll({ pageNumber: 1, pageSize: 1000 });
      // Response is directly an array, not { items: ... }
      const items = Array.isArray(tenantList) ? tenantList : [];
      setTenants(items as unknown as TenantDto[]);
      if (items.length > 0 && !selectedTenantId) {
        setSelectedTenantId(items[0].id);
      }
    } catch (error: any) {
      message.error(error.message || 'Tenantlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadModuleStatus = async (tenantId: string) => {
    setLoadingModules(true);
    try {
      const status = await tenantModuleService.getTenantModuleStatus(tenantId);
      setModuleStatus(status);
    } catch (error: any) {
      message.error(error.message || 'Modül durumları yüklenirken hata oluştu');
      setModuleStatus(null);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleToggleModule = async (module: AvailableModuleDto) => {
    if (!selectedTenantId) return;

    // Check if module is available in package
    if (!module.isAvailableInPackage) {
      await Swal.fire({
        icon: 'warning',
        title: 'Modül Pakette Yok',
        html: `
          <p><strong>${module.moduleName}</strong> modülü tenant'ın mevcut paketinde bulunmuyor.</p>
          <p>Bu modülü aktifleştirmek için tenant'ın paketini yükseltmeniz gerekiyor.</p>
        `,
        confirmButtonText: 'Anladım',
      });
      return;
    }

    const action = module.isActive ? 'deactivate' : 'activate';
    const actionText = module.isActive ? 'devre dışı bırakmak' : 'aktifleştirmek';

    const result = await Swal.fire({
      title: `Modül ${module.isActive ? 'Devre Dışı Bırak' : 'Aktifleştir'}`,
      html: `
        <div style="text-align: left;">
          <p><strong>Modül:</strong> ${module.moduleName}</p>
          <p><strong>İşlem:</strong> ${actionText}</p>
          ${module.isActive ? '<p style="color: #ff4d4f;">⚠️ Modül devre dışı bırakıldığında kullanıcılar bu modüle erişemeyecek!</p>' : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: module.isActive ? 'Devre Dışı Bırak' : 'Aktifleştir',
      cancelButtonText: 'İptal',
      confirmButtonColor: module.isActive ? '#ff4d4f' : '#52c41a',
    });

    if (result.isConfirmed) {
      setActivatingModule(module.moduleCode);
      try {
        let response;
        if (module.isActive) {
          response = await tenantModuleService.deactivateModule(selectedTenantId, module.moduleCode);
        } else {
          response = await tenantModuleService.activateModule(selectedTenantId, module.moduleCode);
        }

        if (response.success) {
          message.success(response.message);
          await loadModuleStatus(selectedTenantId);
        } else {
          message.error(response.message);
        }
      } catch (error: any) {
        message.error(error.message || 'İşlem sırasında hata oluştu');
      } finally {
        setActivatingModule(null);
      }
    }
  };

  const columns: ProColumns<AvailableModuleDto>[] = [
    {
      title: 'Modül',
      dataIndex: 'moduleName',
      key: 'moduleName',
      render: (_, record) => (
        <Space>
          <span style={{
            color: moduleColors[record.moduleCode] || '#666',
            fontSize: 20
          }}>
            {moduleIcons[record.moduleCode] || <AppstoreOutlined />}
          </span>
          <Space direction="vertical" size={0}>
            <Text strong>{record.moduleName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.moduleCode}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Paket Durumu',
      key: 'packageStatus',
      width: 140,
      render: (_, record) => (
        record.isAvailableInPackage ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Pakette Var
          </Tag>
        ) : (
          <Tag icon={<LockOutlined />} color="default">
            Pakette Yok
          </Tag>
        )
      ),
    },
    {
      title: 'Aktif',
      key: 'isActive',
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleModule(record)}
          loading={activatingModule === record.moduleCode}
          disabled={!record.isAvailableInPackage}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
        />
      ),
    },
    {
      title: 'Limit',
      dataIndex: 'recordLimit',
      key: 'recordLimit',
      width: 100,
      render: (limit) => limit ? (
        <Text>{limit.toLocaleString()} kayıt</Text>
      ) : (
        <Tag color="gold">Sınırsız</Tag>
      ),
    },
    {
      title: 'Aktivasyon',
      key: 'enabledDate',
      width: 150,
      render: (_, record) => record.enabledDate ? (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            {new Date(record.enabledDate).toLocaleDateString('tr-TR')}
          </Text>
          {record.isTrial && (
            <Tag color="orange" style={{ marginTop: 2 }}>Deneme</Tag>
          )}
        </Space>
      ) : (
        <Text type="secondary">-</Text>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title={record.isAvailableInPackage ? 'Modülü aktifleştir/devre dışı bırak' : 'Paket yükseltmesi gerekiyor'}>
            <Button
              type={record.isActive ? 'default' : 'primary'}
              size="small"
              icon={record.isActive ? <CloseCircleOutlined /> : <RocketOutlined />}
              onClick={() => handleToggleModule(record)}
              disabled={!record.isAvailableInPackage}
              loading={activatingModule === record.moduleCode}
            >
              {record.isActive ? 'Kapat' : 'Aç'}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const activeModulesCount = moduleStatus?.modules.filter(m => m.isActive).length || 0;
  const availableModulesCount = moduleStatus?.modules.filter(m => m.isAvailableInPackage).length || 0;
  const totalModulesCount = moduleStatus?.modules.length || 0;

  return (
    <PageContainer
      header={{
        title: 'Tenant Modül Yönetimi',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa' },
            { title: 'Tenants' },
            { title: 'Modüller' },
          ],
        },
      }}
    >
      {/* Tenant Selection */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Tenant Seç:</Text>
          </Col>
          <Col flex="auto">
            <Select
              style={{ width: '100%', maxWidth: 400 }}
              placeholder="Tenant seçin"
              value={selectedTenantId}
              onChange={setSelectedTenantId}
              loading={loading}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={tenants.map(t => ({
                value: t.id,
                label: `${t.name} (${t.code})`,
              }))}
            />
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => selectedTenantId && loadModuleStatus(selectedTenantId)}
              loading={loadingModules}
            >
              Yenile
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      {moduleStatus && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Toplam Modül"
                value={totalModulesCount}
                prefix={<AppstoreOutlined style={{ color: '#667eea' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pakette Mevcut"
                value={availableModulesCount}
                prefix={<CrownOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Aktif Modül"
                value={activeModulesCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pasif Modül"
                value={availableModulesCount - activeModulesCount}
                prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: availableModulesCount - activeModulesCount > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tenant Info */}
      {moduleStatus && (
        <Alert
          message={
            <Space>
              <Text strong>Tenant: {moduleStatus.tenantName}</Text>
              <Tag color="blue">ID: {moduleStatus.tenantId.substring(0, 8)}...</Tag>
            </Space>
          }
          description={
            <Space size="large">
              <Text>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> {activeModulesCount} aktif modül
              </Text>
              <Text>
                <CrownOutlined style={{ color: '#faad14' }} /> {availableModulesCount} pakette mevcut
              </Text>
              {availableModulesCount < totalModulesCount && (
                <Text type="secondary">
                  <InfoCircleOutlined /> Diğer modüller için paket yükseltmesi gerekiyor
                </Text>
              )}
            </Space>
          }
          type="info"
          showIcon
          icon={<SettingOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Modules Table */}
      {loadingModules ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Modüller yükleniyor...</div>
          </div>
        </Card>
      ) : moduleStatus ? (
        <ProTable<AvailableModuleDto>
          columns={columns}
          dataSource={moduleStatus.modules}
          rowKey="moduleCode"
          search={false}
          pagination={false}
          rowClassName={(record) =>
            !record.isAvailableInPackage ? 'disabled-row' : ''
          }
          toolBarRender={false}
        />
      ) : (
        <Card>
          <Empty
            description="Modül durumunu görüntülemek için bir tenant seçin"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Help Section */}
      <Card title="Modül Aktivasyonu Hakkında" style={{ marginTop: 24 }}>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Title level={5}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> Modül Aktifleştirme
            </Title>
            <Paragraph>
              Tenant'ın paketinde bulunan modülleri aktifleştirerek kullanıcıların erişimine açabilirsiniz.
              Aktifleştirilen modüller için veritabanı tabloları otomatik olarak oluşturulur.
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={5}>
              <LockOutlined style={{ color: '#ff4d4f' }} /> Paket Kısıtlamaları
            </Title>
            <Paragraph>
              Gri renkli ve kilitle işaretlenmiş modüller tenant'ın mevcut paketinde bulunmuyor.
              Bu modülleri aktifleştirmek için önce tenant'ın paketini yükseltmeniz gerekiyor.
            </Paragraph>
          </Col>
        </Row>
      </Card>

      <style>{`
        .disabled-row {
          background-color: #f5f5f5;
        }
        .disabled-row td {
          color: #999;
        }
      `}</style>
    </PageContainer>
  );
};

export default TenantModulesPage;
