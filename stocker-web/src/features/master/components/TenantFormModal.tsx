import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  Upload,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Alert,
  message,
  Divider,
  Typography,
  Card,
  Tag,
  Checkbox,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  LockOutlined,
  TeamOutlined,
  CrownOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

interface TenantFormData {
  // Temel Bilgiler
  name: string;
  subdomain: string;
  description?: string;
  logo?: string;
  
  // Sahip Bilgileri
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  ownerPassword?: string;
  
  // Plan ve Abonelik
  plan: 'Başlangıç' | 'Profesyonel' | 'Kurumsal' | 'Özel';
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
  expiresAt: any;
  maxUsers: number;
  maxStorage: number;
  
  // Modüller
  modules: string[];
  
  // Ayarlar
  isActive: boolean;
  isTrial: boolean;
  trialDays?: number;
  autoRenew: boolean;
  
  // Özel Ayarlar
  customDomain?: string;
  apiAccess: boolean;
  whiteLabel: boolean;
  priority: 'low' | 'normal' | 'high';
}

interface TenantFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: TenantFormData) => Promise<void>;
  initialData?: Partial<TenantFormData>;
  mode: 'create' | 'edit';
}

const availableModules = [
  { key: 'crm', label: 'CRM', description: 'Müşteri ilişkileri yönetimi' },
  { key: 'stock', label: 'Stok', description: 'Stok takibi ve yönetimi' },
  { key: 'sales', label: 'Satış', description: 'Satış ve faturalama' },
  { key: 'purchase', label: 'Satın Alma', description: 'Tedarik yönetimi' },
  { key: 'accounting', label: 'Muhasebe', description: 'Finansal yönetim' },
  { key: 'hr', label: 'İnsan Kaynakları', description: 'Personel yönetimi' },
  { key: 'production', label: 'Üretim', description: 'Üretim planlama' },
  { key: 'project', label: 'Proje', description: 'Proje yönetimi' },
  { key: 'ecommerce', label: 'E-Ticaret', description: 'Online satış' },
  { key: 'pos', label: 'POS', description: 'Satış noktası' },
  { key: 'warehouse', label: 'Depo', description: 'Depo yönetimi' },
  { key: 'logistics', label: 'Lojistik', description: 'Kargo ve teslimat' },
];

const planPresets = {
  'Başlangıç': {
    maxUsers: 5,
    maxStorage: 10,
    modules: ['crm', 'stock', 'sales'],
    billingCycle: 'monthly',
  },
  'Profesyonel': {
    maxUsers: 25,
    maxStorage: 50,
    modules: ['crm', 'stock', 'sales', 'purchase', 'accounting', 'hr'],
    billingCycle: 'monthly',
  },
  'Kurumsal': {
    maxUsers: 100,
    maxStorage: 200,
    modules: ['crm', 'stock', 'sales', 'purchase', 'accounting', 'hr', 'production', 'project'],
    billingCycle: 'yearly',
  },
  'Özel': {
    maxUsers: 0,
    maxStorage: 0,
    modules: [],
    billingCycle: 'lifetime',
  },
};

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedPlan, setSelectedPlan] = useState<string>(initialData?.plan || 'Başlangıç');

  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          expiresAt: initialData.expiresAt ? dayjs(initialData.expiresAt) : undefined,
        });
        setSelectedPlan(initialData.plan || 'Başlangıç');
      } else {
        form.resetFields();
        // Set default values for new tenant
        const defaultPlan = 'Başlangıç';
        setSelectedPlan(defaultPlan);
        form.setFieldsValue({
          plan: defaultPlan,
          ...planPresets[defaultPlan],
          isActive: true,
          autoRenew: true,
          apiAccess: false,
          whiteLabel: false,
          priority: 'normal',
          expiresAt: dayjs().add(1, 'month'),
        });
      }
      setActiveTab('basic');
    }
  }, [visible, initialData, form]);

  const handlePlanChange = (plan: string) => {
    setSelectedPlan(plan);
    if (plan !== 'Özel') {
      const preset = planPresets[plan as keyof typeof planPresets];
      form.setFieldsValue(preset);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format data
      const formData: TenantFormData = {
        ...values,
        expiresAt: values.expiresAt?.toISOString(),
      };

      await onSubmit(formData);
      message.success(`Tenant başarıyla ${mode === 'create' ? 'oluşturuldu' : 'güncellendi'}`);
      form.resetFields();
      onClose();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        const firstError = error.errorFields[0];
        message.error(`Lütfen zorunlu alanları doldurun: ${firstError.errors[0]}`);
        
        // Switch to tab containing the error field
        if (['name', 'subdomain', 'description'].includes(firstError.name[0])) {
          setActiveTab('basic');
        } else if (['ownerName', 'ownerEmail', 'ownerPhone', 'ownerPassword'].includes(firstError.name[0])) {
          setActiveTab('owner');
        } else if (['plan', 'billingCycle', 'expiresAt', 'maxUsers', 'maxStorage'].includes(firstError.name[0])) {
          setActiveTab('plan');
        }
      } else {
        message.error('İşlem sırasında bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'logo',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} yüklendi`);
        form.setFieldValue('logo', info.file.response.url);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} yüklenemedi`);
      }
    },
  };

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          {mode === 'create' ? 'Yeni Tenant Oluştur' : 'Tenant Düzenle'}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose} icon={<CloseOutlined />}>
          İptal
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          icon={<SaveOutlined />}
        >
          {mode === 'create' ? 'Oluştur' : 'Güncelle'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Temel Bilgiler" key="basic">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tenant Adı"
                  rules={[{ required: true, message: 'Tenant adı zorunludur' }]}
                >
                  <Input prefix={<TeamOutlined />} placeholder="Örn: Teknoloji A.Ş." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="subdomain"
                  label="Subdomain"
                  rules={[
                    { required: true, message: 'Subdomain zorunludur' },
                    { pattern: /^[a-z0-9-]+$/, message: 'Sadece küçük harf, rakam ve tire kullanın' },
                  ]}
                  extra={<Text type="secondary">subdomain.stocker.app</Text>}
                >
                  <Input prefix={<GlobalOutlined />} placeholder="teknoloji" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Açıklama"
            >
              <TextArea rows={3} placeholder="Tenant hakkında kısa açıklama..." />
            </Form.Item>

            <Form.Item
              name="logo"
              label="Logo"
            >
              <Upload {...uploadProps} listType="picture" maxCount={1}>
                <Button icon={<UploadOutlined />}>Logo Yükle</Button>
              </Upload>
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="isActive"
                  label="Durum"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="isTrial"
                  label="Deneme Sürümü"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="trialDays"
                  label="Deneme Süresi (Gün)"
                  dependencies={['isTrial']}
                >
                  <InputNumber min={0} max={90} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Sahip Bilgileri" key="owner">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ownerName"
                  label="Ad Soyad"
                  rules={[{ required: true, message: 'Ad soyad zorunludur' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="John Doe" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ownerEmail"
                  label="E-posta"
                  rules={[
                    { required: true, message: 'E-posta zorunludur' },
                    { type: 'email', message: 'Geçerli bir e-posta giriniz' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="john@example.com" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ownerPhone"
                  label="Telefon"
                  rules={[
                    { pattern: /^[0-9]{10,11}$/, message: 'Geçerli bir telefon numarası giriniz' },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="5551234567" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ownerPassword"
                  label={mode === 'create' ? 'Şifre' : 'Yeni Şifre (Opsiyonel)'}
                  rules={mode === 'create' ? [
                    { required: true, message: 'Şifre zorunludur' },
                    { min: 6, message: 'Şifre en az 6 karakter olmalıdır' },
                  ] : []}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="••••••" />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Plan ve Abonelik" key="plan">
            <Form.Item
              name="plan"
              label="Plan Seçimi"
              rules={[{ required: true, message: 'Plan seçimi zorunludur' }]}
            >
              <Select 
                placeholder="Plan seçiniz" 
                onChange={handlePlanChange}
                size="large"
              >
                {Object.keys(planPresets).map(plan => (
                  <Option key={plan} value={plan}>
                    <Space>
                      <CrownOutlined style={{ color: plan === 'Kurumsal' ? '#faad14' : '#1890ff' }} />
                      <span>{plan}</span>
                      {plan === selectedPlan && <Tag color="blue">Seçili</Tag>}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="billingCycle"
                  label="Faturalandırma Periyodu"
                  rules={[{ required: true, message: 'Faturalandırma periyodu zorunludur' }]}
                >
                  <Select placeholder="Seçiniz">
                    <Option value="monthly">Aylık</Option>
                    <Option value="yearly">Yıllık</Option>
                    <Option value="lifetime">Ömür Boyu</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="expiresAt"
                  label="Abonelik Bitiş Tarihi"
                  rules={[{ required: true, message: 'Bitiş tarihi zorunludur' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="autoRenew"
                  label="Otomatik Yenileme"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="maxUsers"
                  label="Maksimum Kullanıcı"
                  rules={[{ required: true, message: 'Maksimum kullanıcı sayısı zorunludur' }]}
                >
                  <InputNumber
                    min={1}
                    max={9999}
                    style={{ width: '100%' }}
                    prefix={<TeamOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxStorage"
                  label="Maksimum Depolama (GB)"
                  rules={[{ required: true, message: 'Maksimum depolama alanı zorunludur' }]}
                >
                  <InputNumber
                    min={1}
                    max={99999}
                    style={{ width: '100%' }}
                    prefix={<DatabaseOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item
              name="modules"
              label="Modüller"
              rules={[{ required: true, message: 'En az bir modül seçmelisiniz' }]}
            >
              <Checkbox.Group style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  {availableModules.map(module => (
                    <Col span={12} key={module.key}>
                      <Card size="small" hoverable>
                        <Checkbox value={module.key}>
                          <Space direction="vertical" size={0}>
                            <Text strong>{module.label}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {module.description}
                            </Text>
                          </Space>
                        </Checkbox>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </TabPane>

          <TabPane tab="Gelişmiş Ayarlar" key="advanced">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="customDomain"
                  label="Özel Domain"
                  extra={<Text type="secondary">Örn: erp.sirketim.com</Text>}
                >
                  <Input prefix={<GlobalOutlined />} placeholder="erp.sirketim.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Öncelik"
                >
                  <Select defaultValue="normal">
                    <Option value="low">Düşük</Option>
                    <Option value="normal">Normal</Option>
                    <Option value="high">Yüksek</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="apiAccess"
                  label="API Erişimi"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="whiteLabel"
                  label="White Label"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Gelişmiş Ayarlar"
              description="Bu ayarlar tenant'ın sistem içindeki davranışını ve erişim yetkilerini belirler. Dikkatli kullanın."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default TenantFormModal;