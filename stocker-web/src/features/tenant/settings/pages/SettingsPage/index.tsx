import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Switch, 
  Button, 
  Space, 
  Typography, 
  message, 
  Spin,
  Descriptions,
  Divider,
  Alert,
  Select
} from 'antd';
import { 
  SettingOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  LockOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  MailOutlined,
  BellOutlined
} from '@ant-design/icons';
import tenantSettingsService from '@/services/tenant/settingsService';
import { SettingCategoryDto, SettingDto } from '@/types/tenant/settings';
import './style.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingCategoryDto[]>([]);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('General');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await tenantSettingsService.getSettings();
      setSettings(data);
      
      // Form değerlerini ayarla
      const formValues: any = {};
      data.forEach(category => {
        category.settings.forEach(setting => {
          formValues[setting.settingKey] = setting.settingValue;
        });
      });
      form.setFieldsValue(formValues);
    } catch (error) {
      message.error('Ayarlar yüklenirken hata oluştu');
      // Error handling removed for production
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      const promises = Object.entries(values).map(([key, value]) => 
        tenantSettingsService.updateSettingValue(key, value as string)
      );
      
      await Promise.all(promises);
      message.success('Ayarlar başarıyla kaydedildi');
      loadSettings();
    } catch (error) {
      message.error('Ayarlar kaydedilirken hata oluştu');
      // Error handling removed for production
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'general': return <SettingOutlined />;
      case 'security': return <LockOutlined />;
      case 'localization': return <GlobalOutlined />;
      case 'database': return <DatabaseOutlined />;
      case 'email': return <MailOutlined />;
      case 'notifications': return <BellOutlined />;
      default: return <SettingOutlined />;
    }
  };

  const renderSettingField = (setting: SettingDto) => {
    const fieldProps = {
      label: setting.settingKey,
      name: setting.settingKey,
      help: setting.description,
      rules: [{ required: !setting.isPublic }]
    };

    if (setting.dataType === 'Boolean') {
      return (
        <Form.Item {...fieldProps} valuePropName="checked">
          <Switch disabled={setting.isSystemSetting} />
        </Form.Item>
      );
    }

    if (setting.dataType === 'Number') {
      return (
        <Form.Item {...fieldProps}>
          <Input 
            type="number" 
            disabled={setting.isSystemSetting}
            prefix={setting.isEncrypted ? <LockOutlined /> : undefined}
          />
        </Form.Item>
      );
    }

    if (setting.dataType === 'Select') {
      // Configuration'dan seçenekleri parse et
      const options = setting.configuration ? JSON.parse(setting.configuration) : [];
      return (
        <Form.Item {...fieldProps}>
          <Select disabled={setting.isSystemSetting}>
            {options.map((opt: any) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      );
    }

    return (
      <Form.Item {...fieldProps}>
        <Input 
          disabled={setting.isSystemSetting}
          type={setting.isEncrypted ? 'password' : 'text'}
          prefix={setting.isEncrypted ? <LockOutlined /> : undefined}
        />
      </Form.Item>
    );
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <Spin size="large" tip="Ayarlar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Card className="settings-header">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={2}>
            <SettingOutlined /> Sistem Ayarları
          </Title>
          <Text type="secondary">
            Sistemin genel ayarlarını bu sayfadan yönetebilirsiniz
          </Text>
        </Space>
      </Card>

      <Card className="settings-content">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          autoComplete="off"
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
          >
            {settings.map(category => (
              <TabPane 
                tab={
                  <span>
                    {getCategoryIcon(category.category)}
                    {' '}
                    {category.category}
                  </span>
                } 
                key={category.category}
              >
                {category.description && (
                  <Alert
                    message={category.description}
                    type="info"
                    showIcon
                    style={{ marginBottom: 20 }}
                  />
                )}

                <div className="settings-category">
                  {category.settings.map(setting => (
                    <div key={setting.id} className="setting-item">
                      {renderSettingField(setting)}
                      {setting.isSystemSetting && (
                        <Text type="warning" style={{ fontSize: 12 }}>
                          * Sistem ayarı - Değiştirilemez
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </TabPane>
            ))}
          </Tabs>

          <Divider />

          <Space>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              loading={saving}
              htmlType="submit"
            >
              Kaydet
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadSettings}
            >
              Yenile
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;