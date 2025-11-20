import React, { useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  Divider,
  InputNumber,
  Switch,
  message,
  Steps,
  Alert,
  Typography,
  Checkbox,
  Tag,
  Card,
  Radio,
} from 'antd';
import {
  TeamOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface CreateTenantDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTenantDrawer: React.FC<CreateTenantDrawerProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('professional');
  const [customDomain, setCustomDomain] = useState(false);

  const packages = [
    {
      id: 'starter',
      name: 'Starter',
      price: 99,
      features: ['10 Kullanıcı', '10 GB Depolama', 'E-posta Desteği', 'Temel Özellikler'],
      color: 'green',
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 299,
      features: ['50 Kullanıcı', '100 GB Depolama', 'Telefon Desteği', 'API Erişimi', 'Gelişmiş Özellikler'],
      color: 'blue',
      recommended: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 999,
      features: ['Sınırsız Kullanıcı', 'Sınırsız Depolama', 'Öncelikli Destek', 'Özel Entegrasyonlar', 'SLA Garantisi'],
      color: 'purple',
    },
  ];

  const steps = [
    {
      title: 'Temel Bilgiler',
      icon: <TeamOutlined />,
    },
    {
      title: 'Paket Seçimi',
      icon: <AppstoreOutlined />,
    },
    {
      title: 'Yapılandırma',
      icon: <SettingOutlined />,
    },
    {
      title: 'İletişim Bilgileri',
      icon: <UserOutlined />,
    },
    {
      title: 'Özet & Onay',
      icon: <CheckCircleOutlined />,
    },
  ];

  const handleNext = async () => {
    try {
      if (currentStep < steps.length - 1) {
        await form.validateFields();
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      message.error('Lütfen gerekli alanları doldurun');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));

      await Swal.fire({
        icon: 'success',
        title: 'Tenant Oluşturuldu!',
        text: `${values.name} başarıyla oluşturuldu.`,
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#667eea',
      });

      form.resetFields();
      setCurrentStep(0);
      onSuccess();
    } catch (error) {
      message.error('Tenant oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Temel Bilgiler
        return (
          <>
            <Form.Item
              name="name"
              label="Tenant Adı"
              rules={[{ required: true, message: 'Tenant adı zorunludur' }]}
            >
              <Input
                prefix={<TeamOutlined />}
                placeholder="ABC Corporation"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="subdomain"
              label="Subdomain"
              rules={[
                { required: true, message: 'Subdomain zorunludur' },
                {
                  pattern: /^[a-z0-9-]+$/,
                  message: 'Sadece küçük harf, rakam ve tire kullanılabilir'
                },
                {
                  min: 3,
                  message: 'En az 3 karakter olmalıdır'
                }
              ]}
              extra="Bu alan değiştirilemez, dikkatli seçin"
            >
              <Input
                addonBefore="https://"
                addonAfter=".stocker.app"
                placeholder="abc-corp"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Açıklama"
            >
              <TextArea
                rows={4}
                placeholder="Tenant hakkında kısa açıklama..."
              />
            </Form.Item>

            <Form.Item
              name="industry"
              label="Sektör"
              rules={[{ required: true, message: 'Sektör seçimi zorunludur' }]}
            >
              <Select placeholder="Sektör seçin" size="large">
                <Option value="technology">Teknoloji</Option>
                <Option value="finance">Finans</Option>
                <Option value="healthcare">Sağlık</Option>
                <Option value="education">Eğitim</Option>
                <Option value="retail">Perakende</Option>
                <Option value="manufacturing">Üretim</Option>
                <Option value="other">Diğer</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="employeeCount"
              label="Çalışan Sayısı"
            >
              <Select placeholder="Çalışan sayısı aralığı" size="large">
                <Option value="1-10">1-10</Option>
                <Option value="11-50">11-50</Option>
                <Option value="51-200">51-200</Option>
                <Option value="201-500">201-500</Option>
                <Option value="500+">500+</Option>
              </Select>
            </Form.Item>
          </>
        );

      case 1: // Paket Seçimi
        return (
          <>
            <Form.Item
              name="package"
              rules={[{ required: true, message: 'Paket seçimi zorunludur' }]}
            >
              <Radio.Group
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  {packages.map((pkg) => (
                    <Card
                      key={pkg.id}
                      hoverable
                      bordered
                      style={{
                        borderColor: selectedPackage === pkg.id ? '#667eea' : undefined,
                        borderWidth: selectedPackage === pkg.id ? 2 : 1,
                      }}
                      onClick={() => {
                        setSelectedPackage(pkg.id);
                        form.setFieldsValue({ package: pkg.id });
                      }}
                    >
                      {pkg.recommended && (
                        <Tag color="red" style={{ position: 'absolute', top: 10, right: 10 }}>
                          ÖNERİLEN
                        </Tag>
                      )}
                      <Radio value={pkg.id} style={{ marginBottom: 16 }}>
                        <Title level={5}>{pkg.name}</Title>
                      </Radio>
                      <Title level={3} style={{ margin: '16px 0' }}>
                        ₺{pkg.price}
                        <Text type="secondary" style={{ fontSize: 14 }}>/ay</Text>
                      </Title>
                      <Divider />
                      {pkg.features.map((feature, index) => (
                        <div key={index} style={{ marginBottom: 8 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {feature}
                        </div>
                      ))}
                    </Card>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>

            <Divider />

            <Form.Item
              name="billingCycle"
              label="Faturalama Periyodu"
              initialValue="monthly"
            >
              <Radio.Group size="large">
                <Radio.Button value="monthly">Aylık</Radio.Button>
                <Radio.Button value="yearly">
                  Yıllık
                  <Tag color="green" style={{ marginLeft: 8 }}>20% İndirim</Tag>
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="trialDays"
              label="Deneme Süresi"
              initialValue={14}
            >
              <InputNumber
                min={0}
                max={90}
                addonAfter="gün"
                style={{ width: 200 }}
                size="large"
              />
            </Form.Item>
          </>
        );

      case 2: // Yapılandırma
        return (
          <>
            <Title level={5}>Teknik Yapılandırma</Title>

            <Form.Item
              name="maxUsers"
              label="Maksimum Kullanıcı Sayısı"
              rules={[{ required: true, message: 'Kullanıcı sayısı zorunludur' }]}
              initialValue={50}
            >
              <InputNumber
                min={1}
                max={99999}
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="maxStorage"
              label="Maksimum Depolama (GB)"
              rules={[{ required: true, message: 'Depolama limiti zorunludur' }]}
              initialValue={100}
            >
              <InputNumber
                min={1}
                max={99999}
                addonAfter="GB"
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="enableCustomDomain"
              label="Özel Domain"
              valuePropName="checked"
            >
              <Switch
                onChange={setCustomDomain}
                checkedChildren="Aktif"
                unCheckedChildren="Pasif"
              />
            </Form.Item>

            {customDomain && (
              <Form.Item
                name="customDomain"
                label="Domain Adresi"
                rules={[
                  { required: true, message: 'Domain adresi zorunludur' },
                  { type: 'url', message: 'Geçerli bir URL giriniz' }
                ]}
              >
                <Input
                  prefix={<GlobalOutlined />}
                  placeholder="https://app.example.com"
                  size="large"
                />
              </Form.Item>
            )}

            <Divider />

            <Title level={5}>Özellikler</Title>

            <Form.Item name="features">
              <Checkbox.Group style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Checkbox value="api_access">API Erişimi</Checkbox>
                  </Col>
                  <Col span={24}>
                    <Checkbox value="custom_branding">Özel Marka</Checkbox>
                  </Col>
                  <Col span={24}>
                    <Checkbox value="advanced_analytics">Gelişmiş Analitik</Checkbox>
                  </Col>
                  <Col span={24}>
                    <Checkbox value="priority_support">Öncelikli Destek</Checkbox>
                  </Col>
                  <Col span={24}>
                    <Checkbox value="white_label">White Label</Checkbox>
                  </Col>
                  <Col span={24}>
                    <Checkbox value="sla_guarantee">SLA Garantisi</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="databaseRegion"
              label="Veritabanı Bölgesi"
              initialValue="eu-west-1"
            >
              <Select size="large">
                <Option value="eu-west-1">Avrupa (İrlanda)</Option>
                <Option value="eu-central-1">Avrupa (Frankfurt)</Option>
                <Option value="us-east-1">ABD (Virginia)</Option>
                <Option value="ap-southeast-1">Asya (Singapur)</Option>
              </Select>
            </Form.Item>
          </>
        );

      case 3: // İletişim Bilgileri
        return (
          <>
            <Title level={5}>Yönetici Bilgileri</Title>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['owner', 'firstName']}
                  label="Ad"
                  rules={[{ required: true, message: 'Ad zorunludur' }]}
                >
                  <Input prefix={<UserOutlined />} size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['owner', 'lastName']}
                  label="Soyad"
                  rules={[{ required: true, message: 'Soyad zorunludur' }]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name={['owner', 'email']}
              label="E-posta"
              rules={[
                { required: true, message: 'E-posta zorunludur' },
                { type: 'email', message: 'Geçerli bir e-posta giriniz' }
              ]}
            >
              <Input prefix={<MailOutlined />} size="large" />
            </Form.Item>

            <Form.Item
              name={['owner', 'phone']}
              label="Telefon"
              rules={[{ required: true, message: 'Telefon zorunludur' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="+90 555 123 4567" size="large" />
            </Form.Item>

            <Form.Item
              name={['owner', 'title']}
              label="Ünvan"
            >
              <Input placeholder="CEO, CTO, IT Müdürü..." size="large" />
            </Form.Item>

            <Divider />

            <Title level={5}>Şirket Bilgileri</Title>

            <Form.Item
              name={['company', 'name']}
              label="Şirket Adı"
              rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
            >
              <Input prefix={<HomeOutlined />} size="large" />
            </Form.Item>

            <Form.Item
              name={['company', 'taxNumber']}
              label="Vergi Numarası"
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              name={['company', 'address']}
              label="Adres"
            >
              <TextArea rows={3} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['company', 'city']}
                  label="Şehir"
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['company', 'country']}
                  label="Ülke"
                  initialValue="Türkiye"
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 4: // Özet & Onay
        const formValues = form.getFieldsValue();
        const selectedPkg = packages.find(p => p.id === selectedPackage);

        return (
          <>
            <Alert
              message="Lütfen bilgileri kontrol edin"
              description="Tenant oluşturulduktan sonra bazı bilgiler değiştirilemez."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Divider orientation="left">Tenant Bilgileri</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Tenant Adı:</Text>
                <br />
                <Text strong>{formValues.name}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Subdomain:</Text>
                <br />
                <Text strong>https://{formValues.subdomain}.stocker.app</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Sektör:</Text>
                <br />
                <Text strong>{formValues.industry}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Çalışan Sayısı:</Text>
                <br />
                <Text strong>{formValues.employeeCount}</Text>
              </Col>
            </Row>

            <Divider orientation="left">Paket Bilgileri</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Seçilen Paket:</Text>
                <br />
                <Tag color={selectedPkg?.color}>
                  <Text strong>{selectedPkg?.name}</Text>
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">Aylık Ücret:</Text>
                <br />
                <Text strong style={{ fontSize: 20 }}>₺{selectedPkg?.price}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Faturalama:</Text>
                <br />
                <Text strong>{formValues.billingCycle === 'monthly' ? 'Aylık' : 'Yıllık'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Deneme Süresi:</Text>
                <br />
                <Text strong>{formValues.trialDays} gün</Text>
              </Col>
            </Row>

            <Divider orientation="left">Yapılandırma</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Max Kullanıcı:</Text>
                <br />
                <Text strong>{formValues.maxUsers}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Max Depolama:</Text>
                <br />
                <Text strong>{formValues.maxStorage} GB</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Veritabanı Bölgesi:</Text>
                <br />
                <Text strong>{formValues.databaseRegion}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Özel Domain:</Text>
                <br />
                <Text strong>{formValues.enableCustomDomain ? 'Aktif' : 'Pasif'}</Text>
              </Col>
            </Row>

            <Divider orientation="left">Yönetici Bilgileri</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Ad Soyad:</Text>
                <br />
                <Text strong>
                  {formValues.owner?.firstName} {formValues.owner?.lastName}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">E-posta:</Text>
                <br />
                <Text strong>{formValues.owner?.email}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Telefon:</Text>
                <br />
                <Text strong>{formValues.owner?.phone}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Şirket:</Text>
                <br />
                <Text strong>{formValues.company?.name}</Text>
              </Col>
            </Row>

            <Divider />

            <Form.Item
              name="termsAccepted"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Sözleşmeyi kabul etmelisiniz')),
                },
              ]}
            >
              <Checkbox>
                <Text>
                  <a href="#" target="_blank">Hizmet Sözleşmesi</a> ve{' '}
                  <a href="#" target="_blank">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
                </Text>
              </Checkbox>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      title="Yeni Tenant Oluştur"
      width={720}
      open={visible}
      onClose={onClose}
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button onClick={onClose}>
            İptal
          </Button>

          <Space>
            {currentStep > 0 && (
              <Button
                onClick={handlePrev}
                icon={<ArrowLeftOutlined />}
              >
                Önceki
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                onClick={handleNext}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                Sonraki
              </Button>
            ) : (
              <Button
                type="primary"
                loading={loading}
                onClick={handleSubmit}
                icon={<SaveOutlined />}
              >
                Tenant Oluştur
              </Button>
            )}
          </Space>
        </Space>
      }
    >
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          package: 'professional',
          billingCycle: 'monthly',
          trialDays: 14,
          maxUsers: 50,
          maxStorage: 100,
          databaseRegion: 'eu-west-1',
          company: { country: 'Türkiye' },
        }}
      >
        {renderStepContent()}
      </Form>
    </Drawer>
  );
};

export default CreateTenantDrawer;
