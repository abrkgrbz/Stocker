import React, { useState, useEffect } from 'react';
import {
  Card,
  Progress,
  List,
  Button,
  Space,
  Typography,
  Badge,
  Tag,
  Tooltip,
  Row,
  Col,
  Divider,
  Alert,
  Spin,
  message,
  Drawer,
  Timeline
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RocketOutlined,
  ShopOutlined,
  TeamOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  CheckOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';
import './styles.css';

const { Title, Text, Paragraph } = Typography;

interface SetupChecklistProps {
  tenantId: string;
  onGoLive?: () => void;
  compact?: boolean;
}

interface ChecklistItem {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  completed: boolean;
  category: 'basic' | 'organization' | 'modules' | 'financial' | 'security' | 'advanced';
  action?: () => void;
  helpLink?: string;
}

const SetupChecklist: React.FC<SetupChecklistProps> = ({ 
  tenantId, 
  onGoLive,
  compact = false 
}) => {
  const [loading, setLoading] = useState(true);
  const [checklistData, setChecklistData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { key: 'all', label: 'Tümü', color: '#1890ff' },
    { key: 'basic', label: 'Temel Ayarlar', color: '#52c41a' },
    { key: 'organization', label: 'Organizasyon', color: '#722ed1' },
    { key: 'modules', label: 'Modüller', color: '#fa8c16' },
    { key: 'financial', label: 'Mali İşlemler', color: '#eb2f96' },
    { key: 'security', label: 'Güvenlik', color: '#f5222d' },
    { key: 'advanced', label: 'Gelişmiş', color: '#13c2c2' }
  ];

  const checklistItems: ChecklistItem[] = [
    // Basic Setup
    {
      key: 'companyinfo',
      title: 'Şirket Bilgileri',
      description: 'Temel şirket bilgilerini tamamlayın',
      icon: <ShopOutlined />,
      required: true,
      completed: checklistData?.companyInfoCompleted || false,
      category: 'basic',
      action: () => handleItemAction('companyinfo')
    },
    {
      key: 'logo',
      title: 'Logo Yükleme',
      description: 'Şirket logonuzu yükleyin',
      icon: <FileTextOutlined />,
      required: false,
      completed: checklistData?.logoUploaded || false,
      category: 'basic',
      action: () => handleItemAction('logo')
    },
    {
      key: 'adminuser',
      title: 'Yönetici Kullanıcı',
      description: 'Ana yönetici hesabını oluşturun',
      icon: <TeamOutlined />,
      required: true,
      completed: checklistData?.adminUserCreated || false,
      category: 'basic',
      action: () => handleItemAction('adminuser')
    },
    
    // Organization Setup
    {
      key: 'departments',
      title: 'Departmanlar',
      description: 'Departman yapısını oluşturun',
      icon: <TeamOutlined />,
      required: false,
      completed: checklistData?.departmentsCreated || false,
      category: 'organization',
      action: () => handleItemAction('departments')
    },
    {
      key: 'branches',
      title: 'Şubeler',
      description: 'Şube bilgilerini ekleyin',
      icon: <ShopOutlined />,
      required: false,
      completed: checklistData?.branchesCreated || false,
      category: 'organization',
      action: () => handleItemAction('branches')
    },
    {
      key: 'roles',
      title: 'Roller ve Yetkiler',
      description: 'Kullanıcı rollerini tanımlayın',
      icon: <SafetyOutlined />,
      required: true,
      completed: checklistData?.rolesConfigured || false,
      category: 'organization',
      action: () => handleItemAction('roles')
    },
    {
      key: 'users',
      title: 'Kullanıcıları Davet Et',
      description: 'Takım üyelerini sisteme davet edin',
      icon: <TeamOutlined />,
      required: false,
      completed: checklistData?.usersInvited || false,
      category: 'organization',
      action: () => handleItemAction('users')
    },
    
    // Module Setup
    {
      key: 'modules',
      title: 'Modül Seçimi',
      description: 'İhtiyacınız olan modülleri seçin',
      icon: <AppstoreOutlined />,
      required: true,
      completed: checklistData?.modulesSelected || false,
      category: 'modules',
      action: () => handleItemAction('modules')
    },
    {
      key: 'moduleconfig',
      title: 'Modül Yapılandırması',
      description: 'Seçili modülleri yapılandırın',
      icon: <SettingOutlined />,
      required: true,
      completed: checklistData?.modulesConfigured || false,
      category: 'modules',
      action: () => handleItemAction('moduleconfig')
    },
    
    // Financial Setup
    {
      key: 'chartofaccounts',
      title: 'Hesap Planı',
      description: 'Muhasebe hesap planını oluşturun',
      icon: <DatabaseOutlined />,
      required: true,
      completed: checklistData?.chartOfAccountsSetup || false,
      category: 'financial',
      action: () => handleItemAction('chartofaccounts')
    },
    {
      key: 'taxsettings',
      title: 'Vergi Ayarları',
      description: 'KDV ve diğer vergi ayarlarını yapın',
      icon: <DatabaseOutlined />,
      required: true,
      completed: checklistData?.taxSettingsConfigured || false,
      category: 'financial',
      action: () => handleItemAction('taxsettings')
    },
    {
      key: 'currency',
      title: 'Para Birimi',
      description: 'Varsayılan para birimini ayarlayın',
      icon: <DatabaseOutlined />,
      required: true,
      completed: checklistData?.currencyConfigured || false,
      category: 'financial',
      action: () => handleItemAction('currency')
    },
    
    // Security
    {
      key: 'security',
      title: 'Güvenlik Ayarları',
      description: 'Güvenlik politikalarını yapılandırın',
      icon: <SafetyOutlined />,
      required: true,
      completed: checklistData?.securitySettingsConfigured || false,
      category: 'security',
      action: () => handleItemAction('security')
    },
    {
      key: 'passwordpolicy',
      title: 'Şifre Politikası',
      description: 'Şifre kurallarını belirleyin',
      icon: <SafetyOutlined />,
      required: true,
      completed: checklistData?.passwordPolicySet || false,
      category: 'security',
      action: () => handleItemAction('passwordpolicy')
    },
    {
      key: 'backup',
      title: 'Yedekleme Ayarları',
      description: 'Otomatik yedekleme yapılandırın',
      icon: <CloudUploadOutlined />,
      required: true,
      completed: checklistData?.backupConfigured || false,
      category: 'security',
      action: () => handleItemAction('backup')
    }
  ];

  useEffect(() => {
    fetchChecklistData();
  }, [tenantId]);

  const fetchChecklistData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/master/tenants/${tenantId}/setup-checklist`);
      if (response.data?.success) {
        setChecklistData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching checklist:', error);
      message.error('Checklist bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChecklistData();
    setRefreshing(false);
    message.success('Checklist güncellendi');
  };

  const handleItemAction = async (itemKey: string) => {
    const item = checklistItems.find(i => i.key === itemKey);
    if (item) {
      setSelectedItem(item);
      setDetailDrawerVisible(true);
    }
  };

  const handleCompleteItem = async (itemKey: string) => {
    try {
      const response = await apiClient.put(
        `/api/master/tenants/${tenantId}/setup-checklist/${checklistData.id}`,
        {
          itemKey,
          isCompleted: true,
          completedBy: 'current-user' // This should come from auth context
        }
      );
      
      if (response.data?.success) {
        setChecklistData(response.data.data);
        message.success('Öğe tamamlandı olarak işaretlendi');
        setDetailDrawerVisible(false);
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
      message.error('İşlem sırasında hata oluştu');
    }
  };

  const handleGoLive = async () => {
    if (!checklistData?.canGoLive) {
      message.warning('Canlıya geçiş için tüm zorunlu adımlar tamamlanmalıdır');
      return;
    }
    
    // Call go-live process
    onGoLive?.();
  };

  const getFilteredItems = () => {
    if (selectedCategory === 'all') return checklistItems;
    return checklistItems.filter(item => item.category === selectedCategory);
  };

  const getProgressColor = () => {
    const progress = checklistData?.overallProgress || 0;
    if (progress < 30) return '#ff4d4f';
    if (progress < 60) return '#faad14';
    if (progress < 90) return '#52c41a';
    return '#1890ff';
  };

  const getCategoryProgress = (category: string) => {
    const items = checklistItems.filter(item => item.category === category);
    const completed = items.filter(item => item.completed).length;
    return items.length > 0 ? (completed / items.length) * 100 : 0;
  };

  if (loading) {
    return (
      <Card className="checklist-loading">
        <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} />} />
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="checklist-compact">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>Kurulum Durumu</Title>
            <Button size="small" onClick={() => setDetailDrawerVisible(true)}>
              Detaylar
            </Button>
          </div>
          <Progress
            percent={checklistData?.overallProgress || 0}
            strokeColor={getProgressColor()}
            size="small"
          />
          <Space>
            <Text type="secondary">
              {checklistData?.completedItems || 0} / {checklistData?.totalItems || 0} tamamlandı
            </Text>
            {checklistData?.canGoLive && (
              <Tag color="success">Canlıya Geçmeye Hazır</Tag>
            )}
          </Space>
        </Space>
      </Card>
    );
  }

  return (
    <div className="setup-checklist-container">
      <Card className="checklist-header-card">
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={3} style={{ margin: 0 }}>
                <CheckCircleOutlined /> Kurulum Kontrol Listesi
              </Title>
              <Text type="secondary">
                Sistemin canlıya geçmesi için gereken adımları takip edin
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SyncOutlined spin={refreshing} />}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                Yenile
              </Button>
              {checklistData?.canGoLive && (
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  onClick={handleGoLive}
                  size="large"
                >
                  Canlıya Geç
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <div className="progress-section">
              <Text strong>Genel İlerleme</Text>
              <Progress
                percent={checklistData?.overallProgress || 0}
                strokeColor={getProgressColor()}
                format={(percent) => (
                  <span style={{ fontSize: '16px', fontWeight: 500 }}>
                    %{Math.round(percent || 0)}
                  </span>
                )}
              />
              <Space style={{ marginTop: 8 }}>
                <Badge status="success" text={`${checklistData?.completedItems || 0} Tamamlandı`} />
                <Divider type="vertical" />
                <Badge status="processing" text={`${(checklistData?.totalItems || 0) - (checklistData?.completedItems || 0)} Bekliyor`} />
              </Space>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="progress-section">
              <Text strong>Zorunlu Adımlar</Text>
              <Progress
                percent={checklistData?.requiredProgress || 0}
                strokeColor="#ff4d4f"
                format={(percent) => (
                  <span style={{ fontSize: '16px', fontWeight: 500 }}>
                    %{Math.round(percent || 0)}
                  </span>
                )}
              />
              <Space style={{ marginTop: 8 }}>
                <Badge status="error" text={`${checklistData?.requiredCompletedItems || 0} / ${checklistData?.requiredItems || 0} Zorunlu`} />
                {!checklistData?.canGoLive && (
                  <>
                    <Divider type="vertical" />
                    <Text type="danger">
                      <WarningOutlined /> Canlıya geçiş için tamamlanmalı
                    </Text>
                  </>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="checklist-content-card">
        <div className="category-filters">
          <Space wrap>
            {categories.map(cat => (
              <Tag
                key={cat.key}
                color={selectedCategory === cat.key ? cat.color : 'default'}
                style={{ cursor: 'pointer', padding: '4px 12px' }}
                onClick={() => setSelectedCategory(cat.key)}
              >
                {cat.label}
                {cat.key !== 'all' && (
                  <Badge
                    count={checklistItems.filter(i => i.category === cat.key && !i.completed).length}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </Tag>
            ))}
          </Space>
        </div>

        <List
          className="checklist-items"
          dataSource={getFilteredItems()}
          renderItem={(item) => (
            <List.Item
              className={`checklist-item ${item.completed ? 'completed' : ''}`}
              actions={[
                item.completed ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleItemAction(item.key)}
                  >
                    Başla
                  </Button>
                )
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className={`item-icon ${item.completed ? 'completed' : ''}`}>
                    {item.icon}
                  </div>
                }
                title={
                  <Space>
                    {item.title}
                    {item.required && (
                      <Tag color="red" style={{ fontSize: 10 }}>ZORUNLU</Tag>
                    )}
                  </Space>
                }
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Drawer
        title={selectedItem?.title}
        placement="right"
        width={480}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setDetailDrawerVisible(false)}>İptal</Button>
            {selectedItem && !selectedItem.completed && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleCompleteItem(selectedItem.key)}
              >
                Tamamlandı Olarak İşaretle
              </Button>
            )}
          </Space>
        }
      >
        {selectedItem && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message={selectedItem.description}
              type={selectedItem.completed ? 'success' : 'info'}
              showIcon
            />
            
            {selectedItem.required && !selectedItem.completed && (
              <Alert
                message="Zorunlu Adım"
                description="Bu adım canlıya geçiş için tamamlanmalıdır."
                type="warning"
                showIcon
              />
            )}

            {selectedItem.completed && (
              <Alert
                message="Tamamlandı"
                description="Bu adım başarıyla tamamlandı."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            )}

            <Divider />

            <div>
              <Title level={5}>Yapılması Gerekenler</Title>
              <Timeline>
                <Timeline.Item color="blue">Gerekli bilgileri girin</Timeline.Item>
                <Timeline.Item color="blue">Ayarları yapılandırın</Timeline.Item>
                <Timeline.Item color="blue">Değişiklikleri kaydedin</Timeline.Item>
                <Timeline.Item color="green">Tamamlandı olarak işaretleyin</Timeline.Item>
              </Timeline>
            </div>

            {selectedItem.helpLink && (
              <Button
                type="link"
                icon={<InfoCircleOutlined />}
                href={selectedItem.helpLink}
                target="_blank"
              >
                Yardım Dokümantasyonu
              </Button>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default SetupChecklist;