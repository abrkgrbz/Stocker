import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  message,
  notification,
  Row,
  Col,
  Spin,
  Badge,
  Tooltip,
  Progress,
  List,
  Tag,
  Modal,
  Empty,
} from 'antd';
import type { TabsProps } from 'antd';
import {
  SettingOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  MailOutlined,
  FileTextOutlined,
  DollarOutlined,
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CopyOutlined,
  BulbOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface SettingItem {
  id: string;
  settingKey: string;
  settingValue: string;
  description?: string;
  category: string;
  dataType: string;
  isSystemSetting: boolean;
  isEncrypted: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface SettingCategoryDto {
  category: string;
  settings: SettingItem[];
}

interface GroupedSettings {
  [category: string]: SettingItem[];
}

const SystemSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [activeTab, setActiveTab] = useState('Genel');
  const [editingSettings, setEditingSettings] = useState<{ [key: string]: any }>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Loading settings with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/api/tenant/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Settings API response status:', response.status);
      console.log('Settings API response URL:', response.url);
      console.log('Settings API response content-type:', response.headers.get('content-type'));

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Expected JSON but got:', contentType, 'Body:', text.substring(0, 200));
          message.error('API JSON formatında veri döndürmedi');
          return;
        }
        
        const data = await response.json();
        const categories: SettingCategoryDto[] = data.data || [];
        
        // Flatten settings from categories
        const allSettings: SettingItem[] = categories.flatMap(cat => 
          cat.settings.map(setting => ({ ...setting, category: cat.category }))
        );
        
        setSettings(allSettings);
        
        // Group settings by category
        const grouped = categories.reduce((acc: GroupedSettings, category) => {
          acc[category.category] = category.settings;
          return acc;
        }, {} as GroupedSettings);
        
        setGroupedSettings(grouped);
        
        // Set initial form values
        const formValues: { [key: string]: any } = {};
        allSettings.forEach((setting: SettingItem) => {
          formValues[setting.settingKey] = convertValueByDataType(setting.settingValue, setting.dataType);
        });
        form.setFieldsValue(formValues);
      } else {
        const errorText = await response.text();
        console.error('Settings API error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          body: errorText.substring(0, 500) // First 500 chars to see what HTML is returned
        });
        message.error(`Ayarlar yüklenemedi (${response.status}): ${response.statusText}`);
      }
    } catch (error) {
      console.error('Settings load error:', error);
      message.error('Ayarlar yüklenirken bir hata oluştu: ' + error.message);
    }
    setLoading(false);
  };

  const convertValueByDataType = (value: string, dataType: string) => {
    switch (dataType) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseInt(value) || 0;
      default:
        return value;
    }
  };

  const convertValueToString = (value: any, dataType: string): string => {
    switch (dataType) {
      case 'boolean':
        return value ? 'true' : 'false';
      case 'number':
        return value?.toString() || '0';
      default:
        return value?.toString() || '';
    }
  };

  const handleFieldChange = (settingKey: string, value: any, dataType: string) => {
    const stringValue = convertValueToString(value, dataType);
    setEditingSettings(prev => ({
      ...prev,
      [settingKey]: stringValue
    }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (Object.keys(editingSettings).length === 0) {
      message.info('Değişiklik yapılmadı');
      return;
    }

    setSaving(true);
    try {
      const updatePromises = Object.entries(editingSettings).map(([settingKey, settingValue]) => {
        return fetch(`/api/tenant/settings/${settingKey}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ settingValue }),
        });
      });

      const responses = await Promise.all(updatePromises);
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        message.success(`${Object.keys(editingSettings).length} ayar başarıyla güncellendi`);
        setEditingSettings({});
        setUnsavedChanges(false);
        await loadSettings(); // Reload to get updated data
      } else {
        message.error('Bazı ayarlar güncellenemedi');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      message.error('Ayarlar kaydedilirken bir hata oluştu');
    }
    setSaving(false);
  };

  const handleReset = () => {
    Modal.confirm({
      title: 'Değişiklikleri Geri Al',
      content: 'Kaydedilmemiş tüm değişiklikler kaybolacak. Devam etmek istiyor musunuz?',
      icon: <WarningOutlined />,
      onOk: () => {
        setEditingSettings({});
        setUnsavedChanges(false);
        
        // Reset form values to original
        const formValues: { [key: string]: any } = {};
        settings.forEach((setting: SettingItem) => {
          formValues[setting.settingKey] = convertValueByDataType(setting.settingValue, setting.dataType);
        });
        form.setFieldsValue(formValues);
        
        message.success('Değişiklikler geri alındı');
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Panoya kopyalandı');
  };

  const renderFormField = (setting: SettingItem) => {
    const { settingKey, settingValue, description, dataType, isEncrypted, isSystemSetting } = setting;
    const currentValue = form.getFieldValue(settingKey);
    
    const commonProps = {
      disabled: isSystemSetting,
      placeholder: description || `${settingKey} değerini girin`,
      onChange: (value: any) => handleFieldChange(settingKey, value, dataType),
    };

    switch (dataType) {
      case 'boolean':
        return (
          <Switch
            {...commonProps}
            checked={currentValue}
            checkedChildren="Açık"
            unCheckedChildren="Kapalı"
            onChange={(checked) => handleFieldChange(settingKey, checked, dataType)}
          />
        );
      
      case 'number':
        return (
          <InputNumber
            {...commonProps}
            value={currentValue}
            style={{ width: '100%' }}
            min={0}
            onChange={(value) => handleFieldChange(settingKey, value, dataType)}
          />
        );
      
      case 'string':
      default:
        if (isEncrypted) {
          return (
            <Input.Password
              {...commonProps}
              value={currentValue}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              onChange={(e) => handleFieldChange(settingKey, e.target.value, dataType)}
            />
          );
        }
        
        if (settingKey.includes('message') || settingKey.includes('description')) {
          return (
            <TextArea
              {...commonProps}
              value={currentValue}
              rows={3}
              onChange={(e) => handleFieldChange(settingKey, e.target.value, dataType)}
            />
          );
        }
        
        return (
          <Input
            {...commonProps}
            value={currentValue}
            suffix={
              !isEncrypted && currentValue && (
                <Tooltip title="Kopyala">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(currentValue)}
                  />
                </Tooltip>
              )
            }
            onChange={(e) => handleFieldChange(settingKey, e.target.value, dataType)}
          />
        );
    }
  };

  const getTabIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Genel': <GlobalOutlined />,
      'Güvenlik': <SecurityScanOutlined />,
      'E-posta': <MailOutlined />,
      'Fatura': <FileTextOutlined />,
      'Yerelleştirme': <GlobalOutlined />,
    };
    return icons[category] || <SettingOutlined />;
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Genel': '#1890ff',
      'Güvenlik': '#f5222d',
      'E-posta': '#52c41a',
      'Fatura': '#fa8c16',
      'Yerelleştirme': '#722ed1',
    };
    return colors[category] || '#1890ff';
  };

  if (loading) {
    return (
      <div className="system-settings-loading">
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 16 }}>Ayarlar Yükleniyor...</Title>
          </div>
        </Card>
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Henüz ayar bulunmuyor"
        />
      </Card>
    );
  }

  const tabItems: TabsProps['items'] = Object.entries(groupedSettings).map(([category, categorySettings]) => ({
    key: category,
    label: (
      <span style={{ color: getCategoryColor(category) }}>
        {getTabIcon(category)}
        <span style={{ marginLeft: 8 }}>{category}</span>
        <Badge count={categorySettings.length} showZero style={{ marginLeft: 8 }} />
      </span>
    ),
    children: (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: getCategoryColor(category), fontSize: 20 }}>
                {getTabIcon(category)}
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {category} Ayarları
                </Title>
                <Text type="secondary">
                  {categorySettings.length} ayar bulundu
                </Text>
              </div>
            </div>
          }
          className="settings-category-card"
        >
          <Row gutter={[24, 24]}>
            {categorySettings.map((setting) => (
              <Col xs={24} sm={24} md={12} lg={8} xl={6} key={setting.id}>
                <Card
                  size="small"
                  className={`setting-item-card ${setting.isSystemSetting ? 'system-setting' : ''}`}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {setting.settingKey.split('.').pop()}
                      </Text>
                      {setting.isSystemSetting && (
                        <Tooltip title="Sistem ayarı - değiştirilemez">
                          <Tag color="orange" size="small">Sistem</Tag>
                        </Tooltip>
                      )}
                      {setting.isEncrypted && (
                        <Tooltip title="Şifrelenmiş veri">
                          <Tag color="red" size="small">Şifreli</Tag>
                        </Tooltip>
                      )}
                    </div>
                  }
                  extra={
                    editingSettings[setting.settingKey] && (
                      <Tooltip title="Değişiklik var">
                        <Badge dot>
                          <EditOutlined style={{ color: '#fa8c16' }} />
                        </Badge>
                      </Tooltip>
                    )
                  }
                >
                  <div style={{ marginBottom: 12 }}>
                    {setting.description && (
                      <Paragraph
                        type="secondary"
                        style={{ fontSize: 12, margin: 0, marginBottom: 8 }}
                      >
                        {setting.description}
                      </Paragraph>
                    )}
                    <Form.Item
                      name={setting.settingKey}
                      style={{ margin: 0 }}
                    >
                      {renderFormField(setting)}
                    </Form.Item>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </motion.div>
    ),
  }));

  return (
    <div className="system-settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <SettingOutlined style={{ color: '#1890ff' }} />
            Sistem Ayarları
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Tenant ayarlarınızı buradan yapılandırabilirsiniz
          </Text>
        </div>
        <Space size="middle">
          <Badge dot={unsavedChanges}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={!unsavedChanges}
            >
              Sıfırla
            </Button>
          </Badge>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={Object.keys(editingSettings).length === 0}
          >
            {Object.keys(editingSettings).length > 0 
              ? `${Object.keys(editingSettings).length} Değişikliği Kaydet`
              : 'Kaydet'
            }
          </Button>
        </Space>
      </div>

      {/* Unsaved changes alert */}
      {unsavedChanges && (
        <Alert
          message="Kaydedilmemiş Değişiklikler"
          description={`${Object.keys(editingSettings).length} ayarda değişiklik yaptınız. Değişikliklerinizi kaydetmeyi unutmayın.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Space>
              <Button size="small" onClick={handleReset}>
                Geri Al
              </Button>
              <Button type="primary" size="small" onClick={handleSave}>
                Kaydet
              </Button>
            </Space>
          }
        />
      )}

      {/* Settings Form */}
      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => {
          // Form değişikliklerini takip et
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          size="large"
        />
      </Form>

      {/* Footer Info */}
      <Card className="settings-footer" style={{ marginTop: 24 }}>
        <Row gutter={24}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <InfoCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <Title level={5}>Otomatik Kaydetme</Title>
              <Text type="secondary">Değişiklikler anında etkin olur</Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
              <Title level={5}>Güvenli Saklama</Title>
              <Text type="secondary">Şifrelenmiş veriler güvenle saklanır</Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <BulbOutlined style={{ fontSize: 24, color: '#fa8c16', marginBottom: 8 }} />
              <Title level={5}>Akıllı Varsayılanlar</Title>
              <Text type="secondary">En uygun değerler önceden ayarlanmış</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SystemSettingsPage;
export { SystemSettingsPage };