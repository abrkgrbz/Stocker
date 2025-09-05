import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Badge,
  Switch,
  Button,
  Space,
  Tag,
  Statistic,
  message,
  Spin,
  Modal,
  Descriptions,
  Progress,
  Alert,
  Tooltip
} from 'antd';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  WarningOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  DatabaseOutlined,
  FolderOutlined
} from '@ant-design/icons';
import tenantModulesService from '../../../../../services/tenant/modulesService';
import { ModuleDto, ModulesSummaryDto } from '../../../../../types/tenant/modules';
import './style.css';

const { Title, Text, Paragraph } = Typography;

const ModulesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [summary, setSummary] = useState<ModulesSummaryDto | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const [modulesData, summaryData] = await Promise.all([
        tenantModulesService.getModules(),
        tenantModulesService.getModulesSummary()
      ]);
      setModules(modulesData);
      setSummary(summaryData);
    } catch (error) {
      message.error('Modüller yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (module: ModuleDto) => {
    try {
      setToggleLoading(module.moduleCode);
      const newStatus = !module.isEnabled;
      await tenantModulesService.toggleModule(module.moduleCode, newStatus);
      message.success(`${module.moduleName} ${newStatus ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`);
      loadModules();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'İşlem başarısız oldu');
      console.error(error);
    } finally {
      setToggleLoading(null);
    }
  };

  const showModuleDetail = (module: ModuleDto) => {
    setSelectedModule(module);
    setDetailModalVisible(true);
  };

  const getModuleIcon = (moduleCode: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      CRM: <TeamOutlined />,
      HR: <TeamOutlined />,
      INVENTORY: <DatabaseOutlined />,
      FINANCE: <FolderOutlined />,
      SALES: <AppstoreOutlined />,
      PURCHASE: <AppstoreOutlined />
    };
    return icons[moduleCode] || <AppstoreOutlined />;
  };

  const getModuleColor = (module: ModuleDto) => {
    if (!module.isEnabled) return '#d9d9d9';
    if (module.isExpired) return '#ff4d4f';
    if (module.isTrial) return '#faad14';
    return '#52c41a';
  };

  const getModuleStatus = (module: ModuleDto) => {
    if (module.isExpired) return <Tag color="error">Süresi Dolmuş</Tag>;
    if (!module.isEnabled) return <Tag>Devre Dışı</Tag>;
    if (module.isTrial) return <Tag color="warning">Deneme</Tag>;
    return <Tag color="success">Aktif</Tag>;
  };

  const calculateUsagePercentage = (used?: number, limit?: number) => {
    if (!used || !limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="modules-loading">
        <Spin size="large" tip="Modüller yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="modules-page">
      <Card className="modules-header">
        <Row gutter={[16, 16]} align="middle">
          <Col flex="1">
            <Title level={2}>
              <AppstoreOutlined /> Modül Yönetimi
            </Title>
            <Text type="secondary">
              Sistemde bulunan modülleri yönetin ve durumlarını kontrol edin
            </Text>
          </Col>
          <Col>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadModules}
            >
              Yenile
            </Button>
          </Col>
        </Row>
      </Card>

      {summary && (
        <Row gutter={[16, 16]} className="modules-stats">
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Toplam Modül"
                value={summary.totalModules}
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Aktif Modül"
                value={summary.enabledModules}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Devre Dışı"
                value={summary.disabledModules}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#d9d9d9' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Deneme"
                value={summary.trialModules}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Süresi Dolmuş"
                value={summary.expiredModules}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} className="modules-grid">
        {modules.map(module => (
          <Col xs={24} sm={12} md={8} lg={6} key={module.id}>
            <Card
              className={`module-card ${!module.isEnabled ? 'disabled' : ''} ${module.isExpired ? 'expired' : ''}`}
              actions={[
                <Switch
                  checked={module.isEnabled}
                  onChange={() => handleToggleModule(module)}
                  loading={toggleLoading === module.moduleCode}
                  disabled={module.isExpired}
                />,
                <Button
                  type="link"
                  icon={<InfoCircleOutlined />}
                  onClick={() => showModuleDetail(module)}
                >
                  Detay
                </Button>
              ]}
            >
              <Card.Meta
                avatar={
                  <div className="module-icon" style={{ color: getModuleColor(module) }}>
                    {getModuleIcon(module.moduleCode)}
                  </div>
                }
                title={
                  <Space>
                    {module.moduleName}
                    {getModuleStatus(module)}
                  </Space>
                }
                description={module.description}
              />

              {module.userLimit && (
                <div className="module-limit">
                  <Text type="secondary">Kullanıcı Limiti:</Text>
                  <Progress
                    percent={calculateUsagePercentage(0, module.userLimit)}
                    size="small"
                    format={() => `0 / ${module.userLimit}`}
                  />
                </div>
              )}

              {module.storageLimit && (
                <div className="module-limit">
                  <Text type="secondary">Depolama Limiti:</Text>
                  <Progress
                    percent={calculateUsagePercentage(0, module.storageLimit)}
                    size="small"
                    format={() => `0 / ${module.storageLimit} MB`}
                  />
                </div>
              )}

              {module.expiryDate && (
                <div className="module-expiry">
                  <ClockCircleOutlined />
                  <Text type="secondary">
                    Son Kullanım: {new Date(module.expiryDate).toLocaleDateString('tr-TR')}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`${selectedModule?.moduleName} Modül Detayı`}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>
        ]}
        width={600}
      >
        {selectedModule && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Modül Adı">
              {selectedModule.moduleName}
            </Descriptions.Item>
            <Descriptions.Item label="Modül Kodu">
              {selectedModule.moduleCode}
            </Descriptions.Item>
            <Descriptions.Item label="Açıklama">
              {selectedModule.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Durum">
              {getModuleStatus(selectedModule)}
            </Descriptions.Item>
            <Descriptions.Item label="Etkinleştirme Tarihi">
              {selectedModule.enabledDate
                ? new Date(selectedModule.enabledDate).toLocaleString('tr-TR')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Devre Dışı Bırakma Tarihi">
              {selectedModule.disabledDate
                ? new Date(selectedModule.disabledDate).toLocaleString('tr-TR')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Kullanıcı Limiti">
              {selectedModule.userLimit || 'Sınırsız'}
            </Descriptions.Item>
            <Descriptions.Item label="Depolama Limiti">
              {selectedModule.storageLimit ? `${selectedModule.storageLimit} MB` : 'Sınırsız'}
            </Descriptions.Item>
            <Descriptions.Item label="Kayıt Limiti">
              {selectedModule.recordLimit || 'Sınırsız'}
            </Descriptions.Item>
            <Descriptions.Item label="Son Kullanım Tarihi">
              {selectedModule.expiryDate
                ? new Date(selectedModule.expiryDate).toLocaleString('tr-TR')
                : 'Süresiz'}
            </Descriptions.Item>
            <Descriptions.Item label="Oluşturulma Tarihi">
              {new Date(selectedModule.createdAt).toLocaleString('tr-TR')}
            </Descriptions.Item>
            <Descriptions.Item label="Güncellenme Tarihi">
              {selectedModule.updatedAt
                ? new Date(selectedModule.updatedAt).toLocaleString('tr-TR')
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ModulesPage;