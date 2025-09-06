import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Empty,
  Tag,
  Divider,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  MailOutlined,
  FileTextOutlined,
  BankOutlined,
} from '@ant-design/icons';
import tenantSettingsService from '@/services/tenant/settingsService';
import { SettingDto } from '@/types/tenant/settings';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface GroupedSettings {
  [category: string]: SettingDto[];
}

const SystemSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingDto[]>([]);
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});
  const [form] = Form.useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const categories = await tenantSettingsService.getSettings();
      
      // Flatten settings from categories
      const allSettings: SettingDto[] = [];
      const grouped: GroupedSettings = {};
      
      categories.forEach(category => {
        const categorySettings = category.settings.map(setting => ({
          ...setting,
          category: category.category
        }));
        allSettings.push(...categorySettings);
        grouped[category.category] = categorySettings;
      });
      
      setSettings(allSettings);
      setGroupedSettings(grouped);
      
      // Set initial form values
      const formValues: { [key: string]: any } = {};
      allSettings.forEach(setting => {
        formValues[setting.settingKey] = convertValue(setting.settingValue, setting.dataType);
      });
      form.setFieldsValue(formValues);
    } catch (error) {
      console.error('Settings load error:', error);
      message.error('Ayarlar yuklenirken bir hata olustu');
    }
    setLoading(false);
  };

  const convertValue = (value: string, dataType: string) => {
    if (dataType === 'boolean') return value === 'true';
    if (dataType === 'number') return parseInt(value) || 0;
    return value;
  };

  const handleFieldChange = (key: string, value: any, dataType: string) => {
    let stringValue = value;
    if (dataType === 'boolean') stringValue = value ? 'true' : 'false';
    else if (dataType === 'number') stringValue = value?.toString() || '0';
    else stringValue = value?.toString() || '';
    
    setEditedValues(prev => ({
      ...prev,
      [key]: stringValue
    }));
  };

  const handleSave = async () => {
    if (Object.keys(editedValues).length === 0) {
      message.info('Degisiklik yapilmadi');
      return;
    }

    setSaving(true);
    try {
      const promises = Object.entries(editedValues).map(([key, value]) =>
        tenantSettingsService.updateSettingValue(key, value)
      );
      
      await Promise.all(promises);
      message.success('Ayarlar basariyla kaydedildi');
      setEditedValues({});
      await loadSettings();
    } catch (error) {
      console.error('Save error:', error);
      message.error('Ayarlar kaydedilirken hata olustu');
    }
    setSaving(false);
  };

  const handleReset = () => {
    setEditedValues({});
    loadSettings();
    message.info('Degisiklikler geri alindi');
  };

  const getIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Genel': <GlobalOutlined />,
      'Guvenlik': <SecurityScanOutlined />,
      'E-posta': <MailOutlined />,
      'Fatura': <FileTextOutlined />,
      'Yerellesirme': <GlobalOutlined />,
    };
    return icons[category] || <SettingOutlined />;
  };

  const renderField = (setting: SettingDto) => {
    const { settingKey, dataType, isSystemSetting, description } = setting;
    const value = form.getFieldValue(settingKey);
    
    if (dataType === 'boolean') {
      return (
        <Switch
          checked={value}
          disabled={isSystemSetting}
          onChange={(checked) => handleFieldChange(settingKey, checked, dataType)}
        />
      );
    }
    
    if (dataType === 'number') {
      return (
        <InputNumber
          value={value}
          disabled={isSystemSetting}
          style={{ width: '100%' }}
          onChange={(val) => handleFieldChange(settingKey, val, dataType)}
        />
      );
    }
    
    if (settingKey.includes('description') || settingKey.includes('message')) {
      return (
        <TextArea
          value={value}
          disabled={isSystemSetting}
          rows={3}
          placeholder={description}
          onChange={(e) => handleFieldChange(settingKey, e.target.value, dataType)}
        />
      );
    }
    
    return (
      <Input
        value={value}
        disabled={isSystemSetting}
        placeholder={description}
        onChange={(e) => handleFieldChange(settingKey, e.target.value, dataType)}
      />
    );
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <Spin size="large" />
        <Title level={4}>Ayarlar Yukleniyor...</Title>
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <Card className="settings-empty">
        <Empty description="Ayar bulunamadi" />
      </Card>
    );
  }

  const tabItems = Object.entries(groupedSettings).map(([category, categorySettings]) => ({
    key: category,
    label: (
      <span>
        {getIcon(category)}
        <span style={{ marginLeft: 8 }}>{category}</span>
      </span>
    ),
    children: (
      <div className="settings-category">
        <Row gutter={[16, 16]}>
          {categorySettings.map(setting => (
            <Col xs={24} sm={24} md={12} key={setting.id}>
              <Card size="small" className="setting-card">
                <div className="setting-header">
                  <Text strong>{setting.settingKey}</Text>
                  {setting.isSystemSetting && (
                    <Tag color="orange" size="small">Sistem</Tag>
                  )}
                  {editedValues[setting.settingKey] !== undefined && (
                    <Tag color="blue" size="small">Degisti</Tag>
                  )}
                </div>
                {setting.description && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {setting.description}
                  </Text>
                )}
                <Form.Item
                  name={setting.settingKey}
                  style={{ marginBottom: 0, marginTop: 8 }}
                >
                  {renderField(setting)}
                </Form.Item>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    ),
  }));

  return (
    <div className="system-settings-page">
      <Card className="settings-header-card">
        <div className="settings-header">
          <div>
            <Title level={3}>
              <SettingOutlined /> Sistem Ayarlari
            </Title>
            <Text type="secondary">
              Tenant ayarlarinizi buradan yonetebilirsiniz
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={Object.keys(editedValues).length === 0}
            >
              Sifirla
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              disabled={Object.keys(editedValues).length === 0}
            >
              Kaydet ({Object.keys(editedValues).length})
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="settings-content">
        <Form form={form} layout="vertical">
          <Tabs items={tabItems} />
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettingsPage;