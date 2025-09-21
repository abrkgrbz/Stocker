import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Form,
  Input,
  Select,
  Checkbox,
  Upload,
  message,
  Modal,
  Progress,
  Alert,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  notification
} from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import axiosInstance from '../../utils/axios';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface WizardData {
  id: string;
  tenantId: string;
  wizardType: string;
  status: string;
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  progressPercentage: number;
  currentStepName: string;
  currentStepDescription: string;
  isCurrentStepRequired: boolean;
  canSkipCurrentStep: boolean;
}

interface SetupWizardProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ visible, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  // Wizard adımları
  const steps = [
    {
      title: 'Şirket Bilgileri',
      icon: <ShopOutlined />,
      description: 'Temel şirket bilgilerini tamamlayın',
      required: true
    },
    {
      title: 'Kullanıcılar',
      icon: <TeamOutlined />,
      description: 'Yönetici ve kullanıcı tanımlamaları',
      required: true
    },
    {
      title: 'Modüller',
      icon: <ApiOutlined />,
      description: 'Kullanılacak modülleri seçin',
      required: false
    },
    {
      title: 'Güvenlik',
      icon: <SafetyCertificateOutlined />,
      description: 'İki faktörlü doğrulama, IP kısıtlamaları',
      required: false
    },
    {
      title: 'Entegrasyonlar',
      icon: <SettingOutlined />,
      description: 'E-fatura, muhasebe entegrasyonları',
      required: false
    },
    {
      title: 'Tamamlandı',
      icon: <CheckCircleOutlined />,
      description: 'Kurulum tamamlandı',
      required: false
    }
  ];

  // Wizard durumunu yükle
  useEffect(() => {
    if (visible) {
      fetchWizardStatus();
    }
  }, [visible]);

  const fetchWizardStatus = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/tenant/dashboard/setup-wizard');
      if (response.data.success && response.data.data) {
        setWizardData(response.data.data);
        setCurrentStep(response.data.data.currentStep - 1); // 0-indexed
      }
    } catch (error) {
      message.error('Kurulum durumu yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      // Form validasyonu
      if (currentStep < 5) { // Son adım hariç
        await form.validateFields();
      }

      setLoading(true);
      
      // Backend'e adım güncelleme gönder
      if (wizardData) {
        const response = await axiosInstance.put(`/api/public/tenant-registration/wizard/${wizardData.id}/step`, {
          action: 'complete',
          stepData: form.getFieldsValue()
        });

        if (response.data.success) {
          if (currentStep === steps.length - 1) {
            // Son adım tamamlandı
            notification.success({
              message: 'Kurulum Tamamlandı',
              description: 'Sistem kurulumunuz başarıyla tamamlandı. Artık tüm özellikleri kullanabilirsiniz.',
              duration: 5
            });
            onComplete();
          } else {
            setCurrentStep(currentStep + 1);
            form.resetFields();
            message.success('Adım başarıyla kaydedildi');
          }
        }
      }
    } catch (error) {
      message.error('İşlem sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSkip = async () => {
    if (!steps[currentStep].required && wizardData?.canSkipCurrentStep) {
      try {
        setLoading(true);
        const response = await axiosInstance.put(`/api/public/tenant-registration/wizard/${wizardData.id}/step`, {
          action: 'skip',
          reason: 'Kullanıcı atladı'
        });

        if (response.data.success) {
          setCurrentStep(currentStep + 1);
          message.info('Adım atlandı');
        }
      } catch (error) {
        message.error('İşlem sırasında bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }
  };

  // Adım içerikleri
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Şirket Bilgileri
        return (
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Şirket Adı"
                  name="companyName"
                  rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
                >
                  <Input placeholder="Örn: ABC Teknoloji A.Ş." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Vergi No"
                  name="taxNumber"
                  rules={[{ required: true, message: 'Vergi numarası zorunludur' }]}
                >
                  <Input placeholder="Vergi numaranızı girin" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Telefon"
                  name="phone"
                  rules={[{ required: true, message: 'Telefon numarası zorunludur' }]}
                >
                  <Input placeholder="+90 (212) 123 45 67" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="E-posta"
                  name="email"
                  rules={[
                    { required: true, message: 'E-posta zorunludur' },
                    { type: 'email', message: 'Geçerli bir e-posta girin' }
                  ]}
                >
                  <Input placeholder="info@sirket.com" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Adres"
              name="address"
              rules={[{ required: true, message: 'Adres zorunludur' }]}
            >
              <Input.TextArea rows={3} placeholder="Şirket adresi" />
            </Form.Item>

            <Form.Item
              label="Logo"
              name="logo"
            >
              <Upload>
                <Button icon={<UploadOutlined />}>Logo Yükle</Button>
              </Upload>
            </Form.Item>
          </Form>
        );

      case 1: // Kullanıcılar
        return (
          <Form form={form} layout="vertical">
            <Alert
              message="Kullanıcı Tanımlama"
              description="Sistemi kullanacak personelleri tanımlayın. Daha sonra da ekleyebilirsiniz."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item label="Kullanıcı Listesi">
              <Button type="dashed" icon={<UserOutlined />} block>
                Yeni Kullanıcı Ekle
              </Button>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Ad Soyad"
                  name="userName"
                >
                  <Input placeholder="Kullanıcı adı" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="E-posta"
                  name="userEmail"
                >
                  <Input placeholder="kullanici@sirket.com" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Rol"
              name="userRole"
            >
              <Select placeholder="Kullanıcı rolü seçin">
                <Option value="admin">Yönetici</Option>
                <Option value="user">Kullanıcı</Option>
                <Option value="viewer">Görüntüleyici</Option>
              </Select>
            </Form.Item>
          </Form>
        );

      case 2: // Modüller
        return (
          <Form form={form} layout="vertical">
            <Alert
              message="Modül Seçimi"
              description="İhtiyacınız olan modülleri seçin. Daha sonra da aktif edebilirsiniz."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item name="modules">
              <Checkbox.Group style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card hoverable>
                      <Checkbox value="crm">
                        <Space>
                          <UserOutlined />
                          <div>
                            <div><strong>CRM Modülü</strong></div>
                            <Text type="secondary">Müşteri ilişkileri yönetimi</Text>
                          </div>
                        </Space>
                      </Checkbox>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card hoverable>
                      <Checkbox value="finance">
                        <Space>
                          <ShopOutlined />
                          <div>
                            <div><strong>Finans Modülü</strong></div>
                            <Text type="secondary">Muhasebe ve finans yönetimi</Text>
                          </div>
                        </Space>
                      </Checkbox>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card hoverable>
                      <Checkbox value="hr">
                        <Space>
                          <TeamOutlined />
                          <div>
                            <div><strong>İK Modülü</strong></div>
                            <Text type="secondary">İnsan kaynakları yönetimi</Text>
                          </div>
                        </Space>
                      </Checkbox>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card hoverable>
                      <Checkbox value="inventory">
                        <Space>
                          <ShopOutlined />
                          <div>
                            <div><strong>Stok Modülü</strong></div>
                            <Text type="secondary">Envanter ve stok takibi</Text>
                          </div>
                        </Space>
                      </Checkbox>
                    </Card>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Form>
        );

      case 3: // Güvenlik
        return (
          <Form form={form} layout="vertical">
            <Alert
              message="Güvenlik Ayarları"
              description="Sistem güvenliğinizi artıracak ayarları yapın."
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item name="twoFactor" valuePropName="checked">
              <Checkbox>
                <Space>
                  <SafetyCertificateOutlined />
                  <div>
                    <div><strong>İki Faktörlü Doğrulama</strong></div>
                    <Text type="secondary">Tüm kullanıcılar için zorunlu olsun</Text>
                  </div>
                </Space>
              </Checkbox>
            </Form.Item>

            <Divider />

            <Form.Item name="ipRestriction" valuePropName="checked">
              <Checkbox>
                <Space>
                  <SafetyCertificateOutlined />
                  <div>
                    <div><strong>IP Kısıtlaması</strong></div>
                    <Text type="secondary">Sadece belirli IP adreslerinden erişime izin ver</Text>
                  </div>
                </Space>
              </Checkbox>
            </Form.Item>

            <Form.Item
              label="İzin Verilen IP Adresleri"
              name="allowedIPs"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Her satıra bir IP adresi&#10;Örn:&#10;192.168.1.1&#10;10.0.0.0/24"
                disabled={!form.getFieldValue('ipRestriction')}
              />
            </Form.Item>
          </Form>
        );

      case 4: // Entegrasyonlar
        return (
          <Form form={form} layout="vertical">
            <Alert
              message="Entegrasyon Ayarları"
              description="Dış sistemlerle entegrasyonları yapılandırın."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card title="E-Fatura Entegrasyonu" style={{ marginBottom: 16 }}>
              <Form.Item name="einvoice" valuePropName="checked">
                <Checkbox>E-Fatura sistemini aktif et</Checkbox>
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Kullanıcı Adı" name="einvoiceUser">
                    <Input disabled={!form.getFieldValue('einvoice')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Şifre" name="einvoicePass">
                    <Input.Password disabled={!form.getFieldValue('einvoice')} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Muhasebe Entegrasyonu">
              <Form.Item name="accounting" valuePropName="checked">
                <Checkbox>Muhasebe programı entegrasyonu</Checkbox>
              </Form.Item>
              <Form.Item label="Program Seçimi" name="accountingProgram">
                <Select disabled={!form.getFieldValue('accounting')}>
                  <Option value="logo">Logo</Option>
                  <Option value="netsis">Netsis</Option>
                  <Option value="mikro">Mikro</Option>
                  <Option value="eta">ETA</Option>
                </Select>
              </Form.Item>
            </Card>
          </Form>
        );

      case 5: // Tamamlandı
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
            <Title level={2}>Kurulum Tamamlandı!</Title>
            <Paragraph>
              Tebrikler! Sistem kurulumunuz başarıyla tamamlandı.
            </Paragraph>
            <Paragraph>
              Artık Stocker'ın tüm özelliklerini kullanmaya başlayabilirsiniz.
            </Paragraph>
            
            {wizardData && (
              <Card style={{ marginTop: 24, textAlign: 'left' }}>
                <Title level={4}>Kurulum Özeti</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Tamamlanan Adımlar:</Text> {wizardData.completedSteps} / {wizardData.totalSteps}
                  </div>
                  <div>
                    <Text strong>İlerleme:</Text>
                    <Progress percent={Math.round(wizardData.progressPercentage)} status="success" />
                  </div>
                </Space>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title="Kurulum Sihirbazı"
      visible={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      maskClosable={false}
    >
      <div style={{ padding: '20px 0' }}>
        <Steps current={currentStep}>
          {steps.map((item, index) => (
            <Step 
              key={index} 
              title={item.title} 
              icon={item.icon}
              description={item.description}
            />
          ))}
        </Steps>

        <div style={{ marginTop: 40, minHeight: 400 }}>
          {renderStepContent()}
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button onClick={handlePrev}>
                Geri
              </Button>
            )}
            
            {!steps[currentStep].required && currentStep < steps.length - 1 && (
              <Button onClick={handleSkip}>
                Atla
              </Button>
            )}
            
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext} loading={loading}>
                İleri
              </Button>
            )}
            
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleNext} loading={loading}>
                Tamamla
              </Button>
            )}
          </Space>
        </div>

        {wizardData && (
          <div style={{ marginTop: 16 }}>
            <Progress 
              percent={Math.round(wizardData.progressPercentage)} 
              status={wizardData.status === 'Completed' ? 'success' : 'active'}
              size="small"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SetupWizard;