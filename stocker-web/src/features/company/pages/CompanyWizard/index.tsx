import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Steps,
  Card,
  Button,
  Form,
  Input,
  Select,
  Row,
  Col,
  Checkbox,
  InputNumber,
  Upload,
  Switch,
  DatePicker,
  message,
  Progress,
  Badge,
  Divider,
  Typography,
  Space,
  Alert,
  Tooltip,
  Tag,
  Modal,
  Result,
  Timeline,
  Statistic,
  List,
  Avatar,
  Table
} from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  AppstoreOutlined,
  DollarOutlined,
  SafetyOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  GlobalOutlined,
  CalendarOutlined,
  PercentageOutlined,
  CloudUploadOutlined,
  SaveOutlined,
  RocketOutlined,
  WarningOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useSecureAuthStore } from '@/app/store/secureAuth.store';
import { getCitiesForSelect, getDistrictsByCityForSelect } from '@/data/turkey-cities';
import wizardService from '@/services/wizardService';
import companyService from '@/services/companyService';
import Swal from 'sweetalert2';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;
const { RangePicker } = DatePicker;

interface WizardStep {
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  required: boolean;
  category: 'required' | 'recommended' | 'optional';
  completed: boolean;
  skipped: boolean;
  data?: any;
}

const CompanyWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wizardId, setWizardId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useSecureAuthStore();
  
  const [wizardData, setWizardData] = useState<any>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [districts, setDistricts] = useState<{ label: string; value: string }[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [requiredProgress, setRequiredProgress] = useState(0);

  const steps: WizardStep[] = [
    {
      key: 'company',
      title: 'Şirket Bilgileri',
      icon: <BankOutlined />,
      description: 'Temel şirket bilgileri ve iletişim',
      required: true,
      category: 'required',
      completed: false,
      skipped: false
    },
    {
      key: 'organization',
      title: 'Organizasyon',
      icon: <TeamOutlined />,
      description: 'Departmanlar, şubeler ve kullanıcılar',
      required: false,
      category: 'recommended',
      completed: false,
      skipped: false
    },
    {
      key: 'modules',
      title: 'Modüller',
      icon: <AppstoreOutlined />,
      description: 'Kullanılacak modül ve özellikler',
      required: true,
      category: 'required',
      completed: false,
      skipped: false
    },
    {
      key: 'financial',
      title: 'Mali Ayarlar',
      icon: <DollarOutlined />,
      description: 'Para birimi, vergi ve muhasebe',
      required: true,
      category: 'required',
      completed: false,
      skipped: false
    },
    {
      key: 'security',
      title: 'Güvenlik',
      icon: <SafetyOutlined />,
      description: 'Güvenlik politikaları ve yedekleme',
      required: true,
      category: 'required',
      completed: false,
      skipped: false
    },
    {
      key: 'integration',
      title: 'Entegrasyonlar',
      icon: <ApiOutlined />,
      description: 'E-posta, SMS ve ödeme sistemleri',
      required: false,
      category: 'optional',
      completed: false,
      skipped: false
    },
    {
      key: 'import',
      title: 'Veri Aktarımı',
      icon: <DatabaseOutlined />,
      description: 'Mevcut verilerin sisteme aktarılması',
      required: false,
      category: 'optional',
      completed: false,
      skipped: false
    },
    {
      key: 'review',
      title: 'Gözden Geçir',
      icon: <CheckCircleOutlined />,
      description: 'Ayarları kontrol et ve tamamla',
      required: true,
      category: 'required',
      completed: false,
      skipped: false
    }
  ];

  const modules = [
    { id: 'crm', name: 'CRM', description: 'Müşteri ilişkileri yönetimi', icon: <UsergroupAddOutlined /> },
    { id: 'sales', name: 'Satış', description: 'Satış ve sipariş yönetimi', icon: <ShoppingCartOutlined /> },
    { id: 'inventory', name: 'Stok', description: 'Stok takibi ve yönetimi', icon: <DatabaseOutlined /> },
    { id: 'accounting', name: 'Muhasebe', description: 'Finansal işlemler ve raporlama', icon: <DollarOutlined /> },
    { id: 'hr', name: 'İnsan Kaynakları', description: 'Personel yönetimi', icon: <TeamOutlined /> },
    { id: 'project', name: 'Proje', description: 'Proje ve görev yönetimi', icon: <ProjectOutlined /> },
    { id: 'production', name: 'Üretim', description: 'Üretim planlama ve takibi', icon: <ToolOutlined /> },
    { id: 'service', name: 'Servis', description: 'Teknik servis yönetimi', icon: <CustomerServiceOutlined /> }
  ];

  // Import missing icons
  const ShoppingCartOutlined = () => <span>🛒</span>;
  const ProjectOutlined = () => <span>📊</span>;
  const ToolOutlined = () => <span>🔧</span>;
  const CustomerServiceOutlined = () => <span>🎧</span>;

  useEffect(() => {
    initializeWizard();
  }, []);

  useEffect(() => {
    if (autoSaveEnabled && wizardId) {
      const timer = setTimeout(() => {
        saveProgress();
      }, 30000); // Auto-save every 30 seconds
      return () => clearTimeout(timer);
    }
  }, [wizardData, autoSaveEnabled, wizardId]);

  const initializeWizard = async () => {
    try {
      // Check if wizard already exists
      const existingWizard = await wizardService.getActiveWizard();
      if (existingWizard) {
        setWizardId(existingWizard.id);
        setWizardData(existingWizard.savedConfiguration || {});
        setCurrentStep(existingWizard.currentStep - 1);
        setProgress(existingWizard.progressPercentage);
        
        // Restore completed/skipped steps
        if (existingWizard.completedStepsData) {
          setCompletedSteps(new Set(existingWizard.completedStepsData));
        }
        if (existingWizard.skippedStepsData) {
          setSkippedSteps(new Set(existingWizard.skippedStepsData));
        }
      } else {
        // Create new wizard
        const newWizard = await wizardService.createWizard({
          wizardType: 'CompanySetup',
          totalSteps: steps.length
        });
        setWizardId(newWizard.id);
      }
    } catch (error) {
      // Error handling removed for production
      message.error('Wizard başlatılamadı');
    }
  };

  const saveProgress = async () => {
    if (!wizardId) return;
    
    setSaving(true);
    try {
      await wizardService.saveProgress(wizardId, {
        currentStep: currentStep + 1,
        savedConfiguration: wizardData,
        completedStepsData: Array.from(completedSteps),
        skippedStepsData: Array.from(skippedSteps)
      });
      setLastSaveTime(new Date());
      message.success('İlerleme kaydedildi', 1);
    } catch (error) {
      // Error handling removed for production
      message.error('İlerleme kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      const stepKey = steps[currentStep].key;
      
      // Save step data
      setWizardData(prev => ({
        ...prev,
        [stepKey]: values
      }));
      
      // Mark step as completed
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      
      // Update progress
      updateProgress();
      
      // Save to backend
      if (wizardId) {
        await wizardService.updateStep(wizardId, {
          stepNumber: currentStep + 1,
          stepData: values,
          completed: true
        });
      }
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    } catch (error) {
      // Error handling removed for production
      message.error('Lütfen gerekli alanları doldurun');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSkip = async () => {
    const step = steps[currentStep];
    
    if (step.required) {
      message.warning('Bu adım zorunludur ve atlanamaz');
      return;
    }
    
    Modal.confirm({
      title: 'Adımı Atla',
      content: 'Bu adımı atlamak istediğinizden emin misiniz? Daha sonra geri dönebilirsiniz.',
      onOk: async () => {
        setSkippedSteps(prev => new Set(prev).add(currentStep));
        
        if (wizardId) {
          await wizardService.skipStep(wizardId, {
            stepNumber: currentStep + 1,
            reason: 'User skipped'
          });
        }
        
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Complete wizard
      if (wizardId) {
        await wizardService.completeWizard(wizardId);
      }
      
      // Create company with all collected data
      await companyService.createCompanyWithFullSetup(wizardData);
      
      // Show success
      Modal.success({
        title: 'Kurulum Tamamlandı!',
        content: (
          <div>
            <Result
              status="success"
              title="Şirket kurulumunuz başarıyla tamamlandı"
              subTitle="Artık sistemi kullanmaya başlayabilirsiniz"
            />
            <Progress percent={100} status="success" />
          </div>
        ),
        onOk: () => {
          localStorage.setItem('company_setup_complete', 'true');
          // Add a small delay to ensure localStorage is saved
          setTimeout(() => {
            navigate('/app');
          }, 100);
        }
      });
    } catch (error) {
      // Error handling removed for production
      message.error('Kurulum tamamlanamadı');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = () => {
    const completed = completedSteps.size;
    const requiredCompleted = Array.from(completedSteps).filter(
      i => steps[i].required
    ).length;
    const requiredTotal = steps.filter(s => s.required).length;
    
    setProgress((completed / steps.length) * 100);
    setRequiredProgress((requiredCompleted / requiredTotal) * 100);
  };

  const handleCityChange = (cityName: string) => {
    form.setFieldsValue({ district: undefined });
    setDistricts(getDistrictsByCityForSelect(cityName));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Company Information
        return (
          <div className="wizard-step-content">
            <Title level={4}>
              <BankOutlined /> Şirket Bilgileri
            </Title>
            <Paragraph type="secondary">
              Şirketinizin temel bilgilerini ve iletişim detaylarını girin
            </Paragraph>
            
            <Divider />
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="companyName"
                  label="Şirket Adı"
                  rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
                >
                  <Input size="large" prefix={<BankOutlined />} placeholder="Örn: ABC Teknoloji A.Ş." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="legalName"
                  label="Ticari Ünvan"
                  rules={[{ required: true, message: 'Ticari ünvan zorunludur' }]}
                >
                  <Input size="large" placeholder="Tam ticari ünvanınız" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="taxNumber"
                  label="Vergi Numarası"
                  rules={[
                    { required: true, message: 'Vergi numarası zorunludur' },
                    { pattern: /^\d{10,11}$/, message: '10 veya 11 haneli olmalıdır' }
                  ]}
                >
                  <Input size="large" placeholder="10 veya 11 haneli" maxLength={11} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="taxOffice"
                  label="Vergi Dairesi"
                  rules={[{ required: true, message: 'Vergi dairesi zorunludur' }]}
                >
                  <Input size="large" placeholder="Örn: Kadıköy V.D." />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="tradeRegisterNumber"
                  label="Ticaret Sicil No"
                  tooltip="Ticaret odasına kayıtlı sicil numaranız"
                >
                  <Input size="large" placeholder="Opsiyonel" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sector"
                  label="Sektör"
                  rules={[{ required: true, message: 'Sektör seçimi zorunludur' }]}
                >
                  <Select size="large" placeholder="Sektör seçiniz">
                    <Option value="Teknoloji">Teknoloji</Option>
                    <Option value="Üretim">Üretim</Option>
                    <Option value="Hizmet">Hizmet</Option>
                    <Option value="Ticaret">Ticaret</Option>
                    <Option value="İnşaat">İnşaat</Option>
                    <Option value="Sağlık">Sağlık</Option>
                    <Option value="Eğitim">Eğitim</Option>
                    <Option value="Gıda">Gıda</Option>
                    <Option value="Tekstil">Tekstil</Option>
                    <Option value="Lojistik">Lojistik</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">İletişim Bilgileri</Divider>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="E-posta"
                  rules={[
                    { required: true, message: 'E-posta zorunludur' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                  ]}
                >
                  <Input size="large" prefix={<MailOutlined />} placeholder="info@sirket.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Telefon"
                  rules={[{ required: true, message: 'Telefon zorunludur' }]}
                >
                  <Input size="large" prefix={<PhoneOutlined />} placeholder="0212 123 45 67" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Web Sitesi"
                  rules={[{ type: 'url', message: 'Geçerli bir URL girin' }]}
                >
                  <Input size="large" prefix={<GlobalOutlined />} placeholder="https://www.sirket.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="foundedYear"
                  label="Kuruluş Yılı"
                >
                  <InputNumber 
                    size="large" 
                    min={1900} 
                    max={new Date().getFullYear()} 
                    style={{ width: '100%' }}
                    placeholder="2020"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Logo</Divider>

            <Form.Item
              name="logo"
              label="Şirket Logosu"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
            >
              <Dragger
                name="logo"
                multiple={false}
                maxCount={1}
                accept="image/*"
                beforeUpload={() => false}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Logo yüklemek için tıklayın veya sürükleyin</p>
                <p className="ant-upload-hint">PNG, JPG veya SVG formatında, maksimum 2MB</p>
              </Dragger>
            </Form.Item>
          </div>
        );

      case 1: // Organization
        return (
          <div className="wizard-step-content">
            <Title level={4}>
              <TeamOutlined /> Organizasyon Yapısı
            </Title>
            <Paragraph type="secondary">
              Departmanlar, şubeler ve kullanıcı rolleri tanımlayın
            </Paragraph>
            
            <Divider />
            
            <Alert
              message="İpucu"
              description="Bu adımı atlayıp daha sonra detaylı olarak yapılandırabilirsiniz."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Divider orientation="left">Departmanlar</Divider>
            
            <Form.Item
              name="departments"
              label="Departman Listesi"
            >
              <Select
                mode="tags"
                size="large"
                placeholder="Departman ekleyin (Enter tuşu ile)"
                style={{ width: '100%' }}
              >
                <Option value="Yönetim">Yönetim</Option>
                <Option value="Satış">Satış</Option>
                <Option value="Pazarlama">Pazarlama</Option>
                <Option value="Muhasebe">Muhasebe</Option>
                <Option value="İnsan Kaynakları">İnsan Kaynakları</Option>
                <Option value="Bilgi İşlem">Bilgi İşlem</Option>
                <Option value="Üretim">Üretim</Option>
                <Option value="Ar-Ge">Ar-Ge</Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">Şubeler</Divider>
            
            <Form.Item
              name="branches"
              label="Şube/Lokasyon Listesi"
            >
              <Select
                mode="tags"
                size="large"
                placeholder="Şube ekleyin (Enter tuşu ile)"
                style={{ width: '100%' }}
              >
                <Option value="Merkez Ofis">Merkez Ofis</Option>
                <Option value="Fabrika">Fabrika</Option>
                <Option value="Depo">Depo</Option>
                <Option value="Şube">Şube</Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">Kullanıcı Rolleri</Divider>
            
            <Form.Item
              name="userRoles"
              label="Tanımlanacak Roller"
            >
              <Checkbox.Group style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Checkbox value="admin">Yönetici</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="manager">Müdür</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="supervisor">Süpervizör</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="accountant">Muhasebeci</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="sales">Satış Temsilcisi</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="support">Destek Personeli</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="warehouse">Depo Görevlisi</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="production">Üretim Personeli</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="hr">İK Uzmanı</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Divider orientation="left">Çalışan Sayısı</Divider>
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="employeeCount"
                  label="Toplam Çalışan Sayısı"
                >
                  <Select size="large" placeholder="Seçiniz">
                    <Option value="1-5">1-5</Option>
                    <Option value="6-10">6-10</Option>
                    <Option value="11-25">11-25</Option>
                    <Option value="26-50">26-50</Option>
                    <Option value="51-100">51-100</Option>
                    <Option value="101-250">101-250</Option>
                    <Option value="250+">250+</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expectedUsers"
                  label="Sistemi Kullanacak Kişi Sayısı"
                >
                  <InputNumber
                    size="large"
                    min={1}
                    style={{ width: '100%' }}
                    placeholder="Örn: 10"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      case 2: // Modules
        return (
          <div className="wizard-step-content">
            <Title level={4}>
              <AppstoreOutlined /> Modül Seçimi
            </Title>
            <Paragraph type="secondary">
              İşletmenizde kullanmak istediğiniz modülleri seçin
            </Paragraph>
            
            <Divider />
            
            <Alert
              message="Önemli"
              description="Seçtiğiniz modüller aylık ücretinizi etkileyebilir. Daha sonra modül ekleyebilir veya kaldırabilirsiniz."
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="selectedModules"
              rules={[{ required: true, message: 'En az bir modül seçmelisiniz' }]}
            >
              <Checkbox.Group
                style={{ width: '100%' }}
                onChange={setSelectedModules}
              >
                <Row gutter={[16, 16]}>
                  {modules.map(module => (
                    <Col span={12} key={module.id}>
                      <Card 
                        hoverable
                        className="module-card"
                        style={{ height: '100%' }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Checkbox value={module.id}>
                            <Space>
                              {module.icon}
                              <Text strong>{module.name}</Text>
                            </Space>
                          </Checkbox>
                          <Text type="secondary" style={{ marginLeft: 24 }}>
                            {module.description}
                          </Text>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Divider orientation="left">Modül Konfigürasyonu</Divider>

            <Form.Item
              name="moduleSettings"
              label="Varsayılan Ayarları Kullan"
              valuePropName="checked"
            >
              <Switch defaultChecked />
            </Form.Item>

            <Form.Item
              name="customModuleSettings"
              label="Özel Notlar"
            >
              <TextArea
                rows={4}
                placeholder="Modüllerle ilgili özel istekleriniz varsa belirtin..."
              />
            </Form.Item>
          </div>
        );

      case 3: // Financial Settings
        return (
          <div className="wizard-step-content">
            <Title level={4}>
              <DollarOutlined /> Mali Ayarlar
            </Title>
            <Paragraph type="secondary">
              Para birimi, vergi ve muhasebe ayarlarını yapılandırın
            </Paragraph>
            
            <Divider />

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="currency"
                  label="Ana Para Birimi"
                  rules={[{ required: true, message: 'Para birimi seçimi zorunludur' }]}
                  initialValue="TRY"
                >
                  <Select size="large">
                    <Option value="TRY">Türk Lirası (₺)</Option>
                    <Option value="USD">ABD Doları ($)</Option>
                    <Option value="EUR">Euro (€)</Option>
                    <Option value="GBP">İngiliz Sterlini (£)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="multiCurrency"
                  label="Çoklu Para Birimi"
                  valuePropName="checked"
                >
                  <Switch /> <Text type="secondary">Birden fazla para birimi kullan</Text>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Vergi Ayarları</Divider>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="defaultKDV"
                  label="Varsayılan KDV Oranı (%)"
                  rules={[{ required: true, message: 'KDV oranı zorunludur' }]}
                  initialValue={20}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    formatter={value => `${value}%`}
                    parser={value => value!.replace('%', '')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="withholdingTax"
                  label="Stopaj Oranı (%)"
                >
                  <InputNumber
                    size="large"
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    formatter={value => `${value}%`}
                    parser={value => value!.replace('%', '')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="specialTax"
                  label="ÖTV Kullan"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Mali Yıl</Divider>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="fiscalYearStart"
                  label="Mali Yıl Başlangıcı"
                  rules={[{ required: true, message: 'Mali yıl başlangıcı zorunludur' }]}
                >
                  <DatePicker
                    size="large"
                    style={{ width: '100%' }}
                    format="DD/MM"
                    placeholder="01/01"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="fiscalYearEnd"
                  label="Mali Yıl Bitişi"
                  rules={[{ required: true, message: 'Mali yıl bitişi zorunludur' }]}
                >
                  <DatePicker
                    size="large"
                    style={{ width: '100%' }}
                    format="DD/MM"
                    placeholder="31/12"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Hesap Planı</Divider>

            <Form.Item
              name="chartOfAccounts"
              label="Hesap Planı Şablonu"
              rules={[{ required: true, message: 'Hesap planı seçimi zorunludur' }]}
            >
              <Select size="large" placeholder="Seçiniz">
                <Option value="tekduzen">Tek Düzen Hesap Planı</Option>
                <Option value="custom">Özel Hesap Planı</Option>
                <Option value="import">Excel'den İçe Aktar</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="accountingMethod"
              label="Muhasebe Yöntemi"
              rules={[{ required: true, message: 'Muhasebe yöntemi seçimi zorunludur' }]}
            >
              <Select size="large" placeholder="Seçiniz">
                <Option value="bilanço">Bilanço Esası</Option>
                <Option value="işletme">İşletme Hesabı</Option>
                <Option value="basit">Basit Usul</Option>
              </Select>
            </Form.Item>
          </div>
        );

      case 4: // Security
        return (
          <div className="wizard-step-content">
            <Title level={4}>
              <SafetyOutlined /> Güvenlik ve Uyumluluk
            </Title>
            <Paragraph type="secondary">
              Güvenlik politikalarını ve yedekleme ayarlarını yapılandırın
            </Paragraph>
            
            <Divider />

            <Alert
              message="Güvenlik Önerisi"
              description="Verilerinizin güvenliği için tüm güvenlik özelliklerini etkinleştirmenizi öneriyoruz."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Divider orientation="left">Şifre Politikası</Divider>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="minPasswordLength"
                  label="Minimum Şifre Uzunluğu"
                  rules={[{ required: true }]}
                  initialValue={8}
                >
                  <InputNumber
                    size="large"
                    min={6}
                    max={32}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="passwordExpiry"
                  label="Şifre Yenileme Süresi (gün)"
                  initialValue={90}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    max={365}
                    style={{ width: '100%' }}
                    placeholder="0 = Süresiz"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="passwordRequirements">
              <Checkbox.Group>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Checkbox value="uppercase">Büyük harf zorunlu</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="lowercase">Küçük harf zorunlu</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="numbers">Rakam zorunlu</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="special">Özel karakter zorunlu</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Divider orientation="left">İki Faktörlü Doğrulama</Divider>

            <Form.Item
              name="twoFactorAuth"
              label="İki Faktörlü Doğrulama"
              valuePropName="checked"
            >
              <Switch defaultChecked /> <Text type="secondary">Tüm kullanıcılar için zorunlu</Text>
            </Form.Item>

            <Form.Item
              name="twoFactorMethods"
              label="Doğrulama Yöntemleri"
            >
              <Checkbox.Group>
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Checkbox value="sms">SMS</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="email">E-posta</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="app">Authenticator App</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Divider orientation="left">Yedekleme</Divider>

            <Form.Item
              name="backupEnabled"
              label="Otomatik Yedekleme"
              valuePropName="checked"
              rules={[{ required: true }]}
            >
              <Switch defaultChecked /> <Text type="secondary">Verileriniz düzenli olarak yedeklenir</Text>
            </Form.Item>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="backupFrequency"
                  label="Yedekleme Sıklığı"
                >
                  <Select size="large" defaultValue="daily">
                    <Option value="realtime">Gerçek Zamanlı</Option>
                    <Option value="hourly">Saatlik</Option>
                    <Option value="daily">Günlük</Option>
                    <Option value="weekly">Haftalık</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="backupRetention"
                  label="Saklama Süresi"
                >
                  <Select size="large" defaultValue="30">
                    <Option value="7">7 Gün</Option>
                    <Option value="30">30 Gün</Option>
                    <Option value="90">90 Gün</Option>
                    <Option value="365">1 Yıl</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Uyumluluk</Divider>

            <Form.Item name="compliance">
              <Checkbox.Group>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Checkbox value="kvkk">KVKK Uyumlu</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="gdpr">GDPR Uyumlu</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="iso27001">ISO 27001</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="iso9001">ISO 9001</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </div>
        );

      case 5: // Integration
        return (
          <div className="wizard-step-content">
            <Title level={4}>
              <ApiOutlined /> Entegrasyonlar
            </Title>
            <Paragraph type="secondary">
              Dış sistemlerle entegrasyon ayarlarını yapılandırın
            </Paragraph>
            
            <Divider />

            <Divider orientation="left">E-posta Entegrasyonu</Divider>

            <Form.Item
              name="emailIntegration"
              label="E-posta Servisi"
            >
              <Select size="large" placeholder="Seçiniz">
                <Option value="smtp">SMTP Sunucu</Option>
                <Option value="sendgrid">SendGrid</Option>
                <Option value="mailgun">Mailgun</Option>
                <Option value="ses">Amazon SES</Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">SMS Entegrasyonu</Divider>

            <Form.Item
              name="smsIntegration"
              label="SMS Servisi"
            >
              <Select size="large" placeholder="Seçiniz">
                <Option value="netgsm">NetGSM</Option>
                <Option value="iletimerkezi">İleti Merkezi</Option>
                <Option value="twilio">Twilio</Option>
                <Option value="mutlucell">Mutlucell</Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">Ödeme Sistemleri</Divider>

            <Form.Item name="paymentGateways">
              <Checkbox.Group>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Checkbox value="iyzico">Iyzico</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="paytr">PayTR</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="param">Param</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="payu">PayU</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="stripe">Stripe</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="paypal">PayPal</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Divider orientation="left">E-Fatura / E-Arşiv</Divider>

            <Form.Item
              name="einvoiceProvider"
              label="E-Fatura Entegratörü"
            >
              <Select size="large" placeholder="Seçiniz">
                <Option value="logo">Logo</Option>
                <Option value="mikro">Mikro</Option>
                <Option value="netsis">Netsis</Option>
                <Option value="foriba">Foriba</Option>
                <Option value="edmbilisim">EDM Bilişim</Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">Diğer Entegrasyonlar</Divider>

            <Form.Item name="otherIntegrations">
              <Checkbox.Group>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Checkbox value="excel">Excel İçe/Dışa Aktarım</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="api">REST API</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="webhook">Webhook</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="ldap">LDAP/Active Directory</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </div>
        );

      case 6: // Import Data
        return (
          <div className="wizard-step-content">
            <Title level={4}>
              <DatabaseOutlined /> Veri Aktarımı
            </Title>
            <Paragraph type="secondary">
              Mevcut verilerinizi sisteme aktarın
            </Paragraph>
            
            <Divider />

            <Alert
              message="Bilgi"
              description="Veri aktarımını şimdi veya daha sonra yapabilirsiniz. Excel şablonlarımızı kullanarak toplu veri aktarımı yapabilirsiniz."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Row gutter={[16, 24]}>
              <Col span={12}>
                <Card>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>
                      <UsergroupAddOutlined /> Müşteriler
                    </Title>
                    <Form.Item name="importCustomers" valuePropName="checked">
                      <Checkbox>Müşteri listesini içe aktar</Checkbox>
                    </Form.Item>
                    <Button icon={<DownloadOutlined />} block>
                      Excel Şablonunu İndir
                    </Button>
                    <Upload beforeUpload={() => false}>
                      <Button icon={<UploadOutlined />} block>
                        Excel Dosyası Yükle
                      </Button>
                    </Upload>
                  </Space>
                </Card>
              </Col>

              <Col span={12}>
                <Card>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>
                      <ShoppingCartOutlined /> Tedarikçiler
                    </Title>
                    <Form.Item name="importVendors" valuePropName="checked">
                      <Checkbox>Tedarikçi listesini içe aktar</Checkbox>
                    </Form.Item>
                    <Button icon={<DownloadOutlined />} block>
                      Excel Şablonunu İndir
                    </Button>
                    <Upload beforeUpload={() => false}>
                      <Button icon={<UploadOutlined />} block>
                        Excel Dosyası Yükle
                      </Button>
                    </Upload>
                  </Space>
                </Card>
              </Col>

              <Col span={12}>
                <Card>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>
                      <DatabaseOutlined /> Ürünler/Hizmetler
                    </Title>
                    <Form.Item name="importProducts" valuePropName="checked">
                      <Checkbox>Ürün/Hizmet listesini içe aktar</Checkbox>
                    </Form.Item>
                    <Button icon={<DownloadOutlined />} block>
                      Excel Şablonunu İndir
                    </Button>
                    <Upload beforeUpload={() => false}>
                      <Button icon={<UploadOutlined />} block>
                        Excel Dosyası Yükle
                      </Button>
                    </Upload>
                  </Space>
                </Card>
              </Col>

              <Col span={12}>
                <Card>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>
                      <DollarOutlined /> Hesap Planı
                    </Title>
                    <Form.Item name="importAccounts" valuePropName="checked">
                      <Checkbox>Hesap planını içe aktar</Checkbox>
                    </Form.Item>
                    <Button icon={<DownloadOutlined />} block>
                      Excel Şablonunu İndir
                    </Button>
                    <Upload beforeUpload={() => false}>
                      <Button icon={<UploadOutlined />} block>
                        Excel Dosyası Yükle
                      </Button>
                    </Upload>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Alert
              message="Veri Aktarım Durumu"
              description={
                <Space direction="vertical">
                  <Text>Müşteriler: 0 kayıt</Text>
                  <Text>Tedarikçiler: 0 kayıt</Text>
                  <Text>Ürünler: 0 kayıt</Text>
                  <Text>Hesaplar: 0 kayıt</Text>
                </Space>
              }
              type="warning"
            />
          </div>
        );

      case 7: // Review & Complete
        return (
          <div className="wizard-step-content">
            <Title level={4}>
              <CheckCircleOutlined /> Gözden Geçir ve Tamamla
            </Title>
            <Paragraph type="secondary">
              Kurulum ayarlarınızı gözden geçirin ve onaylayın
            </Paragraph>
            
            <Divider />

            <Row gutter={[24, 24]}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Tamamlanan Adımlar"
                    value={completedSteps.size}
                    suffix={`/ ${steps.length}`}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Zorunlu Adımlar"
                    value={requiredProgress}
                    suffix="%"
                    prefix={<SafetyOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Genel İlerleme"
                    value={progress}
                    suffix="%"
                    prefix={<RocketOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">Kurulum Özeti</Divider>

            <Timeline>
              {steps.map((step, index) => (
                <Timeline.Item
                  key={step.key}
                  color={
                    completedSteps.has(index) ? 'green' :
                    skippedSteps.has(index) ? 'orange' :
                    'gray'
                  }
                  dot={
                    completedSteps.has(index) ? <CheckCircleOutlined /> :
                    skippedSteps.has(index) ? <ExclamationCircleOutlined /> :
                    <ClockCircleOutlined />
                  }
                >
                  <Space>
                    <Text strong>{step.title}</Text>
                    {completedSteps.has(index) && <Tag color="success">Tamamlandı</Tag>}
                    {skippedSteps.has(index) && <Tag color="warning">Atlandı</Tag>}
                    {step.required && <Tag color="error">Zorunlu</Tag>}
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>

            <Divider orientation="left">Sonraki Adımlar</Divider>

            <Alert
              message="Kurulum Tamamlanıyor"
              description={
                <div>
                  <Paragraph>
                    Kurulumu tamamladıktan sonra aşağıdaki işlemleri yapabilirsiniz:
                  </Paragraph>
                  <ul>
                    <li>Kullanıcıları davet edin ve yetkilendirin</li>
                    <li>Ürün ve hizmetlerinizi tanımlayın</li>
                    <li>Müşteri ve tedarikçi bilgilerini girin</li>
                    <li>İlk faturanızı oluşturun</li>
                    <li>Raporları ve analizleri inceleyin</li>
                  </ul>
                </div>
              }
              type="success"
              showIcon
            />

            <Divider />

            <Form.Item
              name="acceptTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject('Şartları kabul etmelisiniz'),
                },
              ]}
            >
              <Checkbox>
                <Space>
                  <Text>Kullanım şartlarını ve gizlilik politikasını okudum, kabul ediyorum</Text>
                  <Tooltip title="Kullanım şartlarını görüntüle">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              </Checkbox>
            </Form.Item>
          </div>
        );

      default:
        return null;
    }
  };

  // Add missing import for DownloadOutlined
  const DownloadOutlined = () => <span>⬇️</span>;

  const canSkipStep = () => {
    return !steps[currentStep].required;
  };

  const getStepStatus = (index: number) => {
    if (completedSteps.has(index)) return 'finish';
    if (skippedSteps.has(index)) return 'error';
    if (index === currentStep) return 'process';
    return 'wait';
  };

  return (
    <div className="company-wizard-container">
      <Card className="wizard-card">
        <div className="wizard-header">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2}>
                <RocketOutlined /> Şirket Kurulum Sihirbazı
              </Title>
              <Text type="secondary">
                Sistemi kullanmaya başlamak için gerekli ayarları yapın
              </Text>
            </Col>
            <Col>
              <Space>
                {lastSaveTime && (
                  <Text type="secondary">
                    <SaveOutlined /> Son kayıt: {lastSaveTime.toLocaleTimeString()}
                  </Text>
                )}
                <Switch
                  checked={autoSaveEnabled}
                  onChange={setAutoSaveEnabled}
                  checkedChildren="Otomatik Kayıt"
                  unCheckedChildren="Manuel"
                />
              </Space>
            </Col>
          </Row>
        </div>

        <Divider />

        <Row gutter={24}>
          <Col span={6}>
            <Steps
              current={currentStep}
              direction="vertical"
              size="small"
              onChange={setCurrentStep}
            >
              {steps.map((step, index) => (
                <Steps.Step
                  key={step.key}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  status={getStepStatus(index)}
                />
              ))}
            </Steps>

            <Divider />

            <Card size="small">
              <Title level={5}>İlerleme Durumu</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Genel İlerleme</Text>
                  <Progress percent={Math.round(progress)} size="small" />
                </div>
                <div>
                  <Text type="secondary">Zorunlu Adımlar</Text>
                  <Progress 
                    percent={Math.round(requiredProgress)} 
                    size="small"
                    status={requiredProgress === 100 ? 'success' : 'active'}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          <Col span={18}>
            <Form
              form={form}
              layout="vertical"
              initialValues={wizardData[steps[currentStep]?.key] || {}}
            >
              {renderStepContent()}
            </Form>

            <Divider />

            <Row justify="space-between">
              <Col>
                {currentStep > 0 && (
                  <Button size="large" onClick={handlePrev}>
                    Geri
                  </Button>
                )}
              </Col>
              <Col>
                <Space>
                  {canSkipStep() && currentStep < steps.length - 1 && (
                    <Button size="large" onClick={handleSkip}>
                      Atla
                    </Button>
                  )}
                  <Button size="large" onClick={saveProgress} loading={saving}>
                    Kaydet
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleNext}
                    loading={loading}
                  >
                    {currentStep === steps.length - 1 ? 'Kurulumu Tamamla' : 'İleri'}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CompanyWizard;