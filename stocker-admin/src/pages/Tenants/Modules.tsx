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
  Modal,
  List,
  Divider,
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
  SwapOutlined,
  UpCircleOutlined,
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import {
  tenantModuleService,
  tenantService,
  subscriptionService,
  type AvailableModuleDto,
  type TenantModuleStatusDto,
  type TenantDto,
} from '../../services/api/index';
import { packageService, type PackageDto } from '../../services/api/packageService';

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

  // Package change modal states
  const [packageModalVisible, setPackageModalVisible] = useState(false);
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [changingPackage, setChangingPackage] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

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

  const loadPackages = async () => {
    setLoadingPackages(true);
    try {
      const packageList = await packageService.getActivePackages();
      setPackages(packageList);
    } catch (error: any) {
      message.error(error.message || 'Paketler yüklenirken hata oluştu');
    } finally {
      setLoadingPackages(false);
    }
  };

  const openPackageModal = () => {
    setPackageModalVisible(true);
    setSelectedPackageId(null);
    loadPackages();
  };

  const handlePackageChange = async () => {
    if (!selectedTenantId || !selectedPackageId) {
      message.warning('Lütfen bir paket seçin');
      return;
    }

    const selectedPackage = packages.find(p => p.id === selectedPackageId);
    const selectedTenant = tenants.find(t => t.id === selectedTenantId);

    const result = await Swal.fire({
      title: 'Paket Değiştir',
      html: `
        <div style="text-align: left;">
          <p><strong>Tenant:</strong> ${selectedTenant?.name || '-'}</p>
          <p><strong>Yeni Paket:</strong> ${selectedPackage?.name || '-'}</p>
          <p><strong>Fiyat:</strong> ${selectedPackage?.basePrice?.amount?.toLocaleString()} ${selectedPackage?.basePrice?.currency || 'TRY'}</p>
          <hr style="margin: 10px 0;" />
          <p style="color: #faad14;">⚠️ Paket değişikliği hemen uygulanacaktır.</p>
          <p>Bu işlem geri alınamaz. Devam etmek istiyor musunuz?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Paketi Değiştir',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#667eea',
    });

    if (result.isConfirmed) {
      setChangingPackage(true);
      try {
        await subscriptionService.changePackage(selectedTenantId, {
          newPackageId: selectedPackageId,
        });

        await Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Paket başarıyla değiştirildi.',
          timer: 2000,
          showConfirmButton: false,
        });

        setPackageModalVisible(false);
        // Reload module status to reflect new package modules
        await loadModuleStatus(selectedTenantId);
      } catch (error: any) {
        message.error(error.message || 'Paket değiştirme işlemi başarısız oldu');
      } finally {
        setChangingPackage(false);
      }
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
            <Row justify="space-between" align="middle">
              <Col>
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
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<SwapOutlined />}
                  onClick={openPackageModal}
                >
                  Paket Değiştir
                </Button>
              </Col>
            </Row>
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

      {/* Package Change Modal */}
      <Modal
        title={
          <Space>
            <SwapOutlined style={{ color: '#667eea' }} />
            <span>Paket Değiştir</span>
          </Space>
        }
        open={packageModalVisible}
        onCancel={() => setPackageModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPackageModalVisible(false)}>
            İptal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={changingPackage}
            disabled={!selectedPackageId}
            onClick={handlePackageChange}
            icon={<SwapOutlined />}
          >
            Paketi Değiştir
          </Button>,
        ]}
        width={700}
      >
        {loadingPackages ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Paketler yükleniyor...</div>
          </div>
        ) : (
          <>
            <Alert
              message="Paket değişikliği hakkında"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Yeni paket hemen uygulanacaktır</li>
                  <li>Fiyat farkı bir sonraki faturalandırmaya yansıyacaktır</li>
                  <li>Mevcut modüller yeni pakete göre güncellenecektir</li>
                </ul>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Divider orientation="left">Mevcut Paketler</Divider>

            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={packages}
              renderItem={(pkg) => (
                <List.Item>
                  <Card
                    hoverable
                    style={{
                      borderColor: selectedPackageId === pkg.id ? '#667eea' : '#d9d9d9',
                      borderWidth: selectedPackageId === pkg.id ? 2 : 1,
                      backgroundColor: selectedPackageId === pkg.id ? '#f0f5ff' : '#fff',
                    }}
                    onClick={() => setSelectedPackageId(pkg.id)}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong style={{ fontSize: 16 }}>
                            {pkg.name}
                          </Text>
                        </Col>
                        <Col>
                          {selectedPackageId === pkg.id && (
                            <CheckCircleOutlined style={{ color: '#667eea', fontSize: 18 }} />
                          )}
                        </Col>
                      </Row>

                      <Text type="secondary" ellipsis>
                        {pkg.description || 'Açıklama yok'}
                      </Text>

                      <Divider style={{ margin: '8px 0' }} />

                      <Row justify="space-between">
                        <Col>
                          <Text strong style={{ fontSize: 18, color: '#667eea' }}>
                            {pkg.basePrice?.amount?.toLocaleString()} {pkg.basePrice?.currency || 'TRY'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            /{pkg.billingCycle === 'Yearly' ? 'yıl' : 'ay'}
                          </Text>
                        </Col>
                        <Col>
                          <Tag color={pkg.isActive ? 'green' : 'default'}>
                            {pkg.isActive ? 'Aktif' : 'Pasif'}
                          </Tag>
                        </Col>
                      </Row>

                      <Space wrap size={[4, 4]} style={{ marginTop: 8 }}>
                        <Tag icon={<TeamOutlined />}>{pkg.maxUsers} kullanıcı</Tag>
                        <Tag icon={<DatabaseOutlined />}>{pkg.maxStorage} GB</Tag>
                      </Space>

                      {pkg.modules && pkg.modules.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Modüller:</Text>
                          <br />
                          <Space wrap size={[4, 4]}>
                            {pkg.modules
                              .filter(m => m.isIncluded)
                              .slice(0, 5)
                              .map(m => (
                                <Tag key={m.moduleCode} color="blue" style={{ fontSize: 11 }}>
                                  {m.moduleName}
                                </Tag>
                              ))}
                            {pkg.modules.filter(m => m.isIncluded).length > 5 && (
                              <Tag color="default" style={{ fontSize: 11 }}>
                                +{pkg.modules.filter(m => m.isIncluded).length - 5} daha
                              </Tag>
                            )}
                          </Space>
                        </div>
                      )}
                    </Space>
                  </Card>
                </List.Item>
              )}
            />

            {packages.length === 0 && (
              <Empty description="Aktif paket bulunamadı" />
            )}
          </>
        )}
      </Modal>

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
