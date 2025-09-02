import React, { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import Select from 'react-select';
import { apiClient } from '@/shared/api/client';
// SignalR validation will be passed as props from parent component
import {
  ShopOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  BankOutlined,
  TeamOutlined,
  CheckOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  RiseOutlined,
  GlobalOutlined,
  LoadingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
  RocketOutlined
} from '@ant-design/icons';
import './modern-wizard.css';
import './modern-wizard-phone-validation.css';
import './package-selection.css';

interface ModernWizardProps {
  onComplete: (data: any) => void;
  selectedPackage?: any;
  signalRValidation?: {
    isConnected: boolean;
    emailValidation: any;
    passwordStrength: any;
    domainCheck: any;
    phoneValidation: any;
    companyNameCheck: any;
    identityValidation: any;
    validateEmail: (email: string) => Promise<void>;
    checkPasswordStrength: (password: string) => Promise<void>;
    checkDomain: (domain: string) => Promise<void>;
    validatePhone: (phone: string, countryCode?: string) => Promise<void>;
    checkCompanyName: (name: string) => Promise<void>;
    validateIdentity: (identityNumber: string) => Promise<void>;
    error: string | null;
  };
}

export const ModernWizard: React.FC<ModernWizardProps> = ({ onComplete, selectedPackage, signalRValidation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [validating, setValidating] = useState<{ [key: string]: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [validationSuccess, setValidationSuccess] = useState<{ [key: string]: boolean }>({});
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    // Step 1 - Company Info
    companyName: '',
    companyCode: '',
    identityType: 'TC',
    identityNumber: '',
    sector: '',
    employeeCount: '',
    
    // Step 2 - Contact Info
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    
    // Step 3 - Security
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    
    // Step 4 - Package
    packageId: '',
    packageName: '',
    billingPeriod: 'Monthly'
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Use SignalR validation from props if provided
  const {
    isConnected = false,
    emailValidation = null,
    passwordStrength: signalRPasswordStrength = null,
    domainCheck = null,
    phoneValidation = null,
    companyNameCheck = null,
    identityValidation = null,
    validateEmail = async () => {},
    checkPasswordStrength: checkSignalRPasswordStrength = async () => {},
    checkDomain = async () => {},
    validatePhone = async () => {},
    checkCompanyName = async () => {},
    validateIdentity = async () => {},
    error: validationError = null
  } = signalRValidation || {};

  const steps = [
    { label: 'Şirket', icon: <ShopOutlined /> },
    { label: 'İletişim', icon: <UserOutlined /> },
    { label: 'Güvenlik', icon: <LockOutlined /> },
    { label: 'Paket', icon: <ShoppingCartOutlined /> }
  ];

  // Şirket tipleri ve sektörler için öneriler
  const companyTypes = [
    { suffix: 'A.Ş.', description: 'Anonim Şirket' },
    { suffix: 'Ltd. Şti.', description: 'Limited Şirket' },
    { suffix: 'Tic. Ltd. Şti.', description: 'Ticaret Limited' },
    { suffix: 'San. ve Tic. A.Ş.', description: 'Sanayi ve Ticaret' }
  ];

  const companySectors = [
    'Teknoloji',
    'Yazılım',
    'Bilişim',
    'Danışmanlık',
    'Pazarlama',
    'Reklam',
    'İnşaat',
    'Otomotiv',
    'Tekstil',
    'Gıda',
    'Lojistik',
    'Turizm',
    'Sağlık',
    'Eğitim',
    'Enerji',
    'Üretim',
    'Ticaret',
    'Hizmet'
  ];

  // Dinamik öneri oluşturucu
  const generateCompanySuggestions = (input: string): string[] => {
    if (!input || input.length < 2) return [];
    
    const suggestions: string[] = [];
    const capitalizedInput = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    
    // Temel şirket isimleri
    suggestions.push(`${capitalizedInput} A.Ş.`);
    suggestions.push(`${capitalizedInput} Ltd. Şti.`);
    
    // Sektör bazlı öneriler
    if (input.length >= 3) {
      suggestions.push(`${capitalizedInput} Teknoloji A.Ş.`);
      suggestions.push(`${capitalizedInput} Yazılım Ltd. Şti.`);
      suggestions.push(`${capitalizedInput} Bilişim Hizmetleri A.Ş.`);
      suggestions.push(`${capitalizedInput} Danışmanlık Ltd. Şti.`);
      suggestions.push(`${capitalizedInput} Ticaret A.Ş.`);
      suggestions.push(`${capitalizedInput} Sanayi ve Ticaret A.Ş.`);
      suggestions.push(`${capitalizedInput} İnşaat Ltd. Şti.`);
      suggestions.push(`${capitalizedInput} Otomotiv San. ve Tic. A.Ş.`);
    }
    
    // Grup/Holding önerileri (daha uzun isimler için)
    if (input.length >= 4) {
      suggestions.push(`${capitalizedInput} Holding A.Ş.`);
      suggestions.push(`${capitalizedInput} Grup Şirketleri`);
    }
    
    // Maksimum 8 öneri göster
    return suggestions.slice(0, 8);
  };

  // Ünvan (Title) önerileri oluşturucu
  const generateTitleSuggestions = (input: string): string[] => {
    if (!input || input.length < 1) return [];
    
    const titles = [
      'Genel Müdür',
      'Genel Koordinatör',
      'İnsan Kaynakları Müdürü',
      'İnsan Kaynakları Uzmanı',
      'Yazılım Müdürü',
      'Yazılım Geliştirici',
      'Proje Müdürü',
      'Proje Yöneticisi',
      'Satış Müdürü',
      'Satış Danışmanı',
      'Pazarlama Müdürü',
      'Pazarlama Uzmanı',
      'Muhasebe Müdürü',
      'Mali İşler Müdürü',
      'Operasyon Müdürü',
      'İdari İşler Müdürü',
      'Bilgi İşlem Müdürü',
      'Teknik Müdür',
      'Üretim Müdürü',
      'Kalite Müdürü',
      'Ar-Ge Müdürü',
      'İş Geliştirme Müdürü',
      'Satın Alma Müdürü',
      'Lojistik Müdürü',
      'Fabrika Müdürü',
      'Bölge Müdürü',
      'Şube Müdürü',
      'CEO',
      'CFO',
      'CTO',
      'COO',
      'CMO',
      'Kurucu',
      'Kurucu Ortak',
      'Yönetim Kurulu Başkanı',
      'Yönetim Kurulu Üyesi',
      'İcra Kurulu Üyesi'
    ];
    
    const lowerInput = input.toLowerCase();
    const filtered = titles.filter(title => 
      title.toLowerCase().includes(lowerInput)
    );
    
    // Başlangıç eşleşmelerini öne al
    const startsWith = filtered.filter(title => 
      title.toLowerCase().startsWith(lowerInput)
    );
    const contains = filtered.filter(title => 
      !title.toLowerCase().startsWith(lowerInput)
    );
    
    return [...startsWith, ...contains].slice(0, 8);
  };

  // Email domain önerileri oluşturucu
  const generateEmailSuggestions = (input: string): string[] => {
    if (!input || input.length < 2) return [];
    
    const suggestions: string[] = [];
    const [localPart, domainPart] = input.split('@');
    
    if (!localPart) return [];
    
    // Eğer @ işareti yoksa veya domain kısmı boşsa
    if (!domainPart || domainPart.length === 0) {
      // Şirket adına göre domain öner
      const companyName = formData.companyName.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/gi, '');
      
      if (companyName) {
        suggestions.push(`${localPart}@${companyName}.com`);
        suggestions.push(`${localPart}@${companyName}.com.tr`);
        suggestions.push(`${localPart}@${companyName}.net`);
        suggestions.push(`${localPart}@${companyName}.org`);
      }
      
      // Popüler domain önerileri
      suggestions.push(`${localPart}@gmail.com`);
      suggestions.push(`${localPart}@hotmail.com`);
      suggestions.push(`${localPart}@outlook.com`);
      suggestions.push(`${localPart}@yandex.com`);
    } else {
      // Domain kısmı yazılmaya başlandıysa tamamlama öner
      const domains = [
        'gmail.com',
        'hotmail.com',
        'outlook.com',
        'yahoo.com',
        'yandex.com',
        'icloud.com',
        'protonmail.com'
      ];
      
      const companyName = formData.companyName.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/gi, '');
      
      if (companyName) {
        domains.unshift(`${companyName}.com`);
        domains.unshift(`${companyName}.com.tr`);
      }
      
      const filtered = domains.filter(domain => 
        domain.startsWith(domainPart.toLowerCase())
      );
      
      filtered.forEach(domain => {
        suggestions.push(`${localPart}@${domain}`);
      });
    }
    
    return suggestions.slice(0, 8);
  };

  const sectorOptions = [
    { value: 'Teknoloji', label: 'Teknoloji' },
    { value: 'E-Ticaret', label: 'E-Ticaret' },
    { value: 'Perakende', label: 'Perakende' },
    { value: 'Üretim', label: 'Üretim' },
    { value: 'Hizmet', label: 'Hizmet' },
    { value: 'Sağlık', label: 'Sağlık' },
    { value: 'Eğitim', label: 'Eğitim' },
    { value: 'Diğer', label: 'Diğer' }
  ];

  const employeeCountOptions = [
    { value: '1-10', label: '1-10 Kişi' },
    { value: '11-50', label: '11-50 Kişi' },
    { value: '51-100', label: '51-100 Kişi' },
    { value: '101-500', label: '101-500 Kişi' },
    { value: '500+', label: '500+ Kişi' }
  ];

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '54px',
      border: state.isFocused 
        ? '2px solid #667eea' 
        : validationErrors[state.selectProps.name] 
          ? '2px solid #ef4444'
          : '2px solid #e5e7eb',
      borderRadius: '14px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none',
      backgroundColor: validationErrors[state.selectProps.name] ? '#fef2f2' : 'white',
      '&:hover': {
        borderColor: state.isFocused ? '#667eea' : '#d1d5db'
      }
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: '0 18px',
      height: '50px'
    }),
    input: (provided: any) => ({
      ...provided,
      margin: '0',
      padding: '0'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '16px'
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#1f2937',
      fontSize: '16px'
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginTop: '4px'
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '8px'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#667eea' 
        : state.isFocused 
          ? '#f3f4f6' 
          : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      padding: '12px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '15px',
      '&:active': {
        backgroundColor: state.isSelected ? '#667eea' : '#e5e7eb'
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (provided: any, state: any) => ({
      ...provided,
      color: state.isFocused ? '#667eea' : '#9ca3af',
      '&:hover': {
        color: '#667eea'
      }
    })
  };

  // Fetch packages when step 3 is reached
  useEffect(() => {
    if (currentStep === 3 && packages.length === 0) {
      fetchPackages();
    }
  }, [currentStep]);

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const response = await apiClient.get('/api/public/packages');
      
      if (response.data?.success && response.data?.data) {
        const packagesData = response.data.data.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.basePrice?.amount || 0,
          currency: pkg.basePrice?.currency || '₺',
          type: pkg.type,
          features: pkg.features?.map((f: any) => f.featureName || f.name || f) || [],
          maxUsers: pkg.maxUsers || 0,
          maxStorage: pkg.maxStorage || 0,
          modules: pkg.modules?.map((m: any) => m.moduleName || m) || [],
          isPopular: pkg.type === 'Professional',
          trialDays: pkg.trialDays || 14
        }));
        setPackages(packagesData);
      }
    } catch (error) {
      // Fallback to mock data
      setPackages([
        {
          id: 'starter-package',
          name: 'Başlangıç',
          description: 'Küçük işletmeler için',
          price: 499,
          currency: '₺',
          features: ['5 Kullanıcı', '10 GB Depolama', 'Temel Raporlama'],
          type: 'Starter'
        },
        {
          id: 'professional-package',
          name: 'Profesyonel',
          description: 'Büyüyen işletmeler için',
          price: 999,
          currency: '₺',
          features: ['20 Kullanıcı', '50 GB Depolama', 'Gelişmiş Raporlama'],
          isPopular: true,
          type: 'Professional'
        },
        {
          id: 'enterprise-package',
          name: 'Enterprise',
          description: 'Kurumsal çözümler',
          price: 2499,
          currency: '₺',
          features: ['Sınırsız Kullanıcı', '500 GB Depolama', 'Özel Raporlama'],
          type: 'Enterprise'
        }
      ]);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    if (formData.password) {
      checkPasswordStrength(formData.password);
      // Also check with SignalR
      if (isConnected) {
        checkSignalRPasswordStrength(formData.password);
      }
    }
  }, [formData.password, isConnected]);

  // Handle SignalR validation responses
  useEffect(() => {
    if (emailValidation) {
      setValidating(prev => ({ ...prev, email: false }));
      if (!emailValidation.isValid) {
        setValidationErrors(prev => ({ ...prev, email: emailValidation.message || 'Geçersiz e-posta' }));
      } else {
        setValidationErrors(prev => ({ ...prev, email: '' }));
      }
    }
  }, [emailValidation]);

  useEffect(() => {
    if (phoneValidation) {
      setValidating(prev => ({ ...prev, phone: false }));
      if (!phoneValidation.isValid) {
        setValidationErrors(prev => ({ ...prev, phone: phoneValidation.message || 'Geçersiz telefon' }));
      } else {
        setValidationErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  }, [phoneValidation]);

  useEffect(() => {
    if (identityValidation) {
      console.log('Identity validation result received:', identityValidation);
      setValidating(prev => ({ ...prev, identityNumber: false }));
      if (!identityValidation.isValid) {
        setValidationErrors(prev => ({ ...prev, identityNumber: identityValidation.message || 'Geçersiz kimlik/vergi numarası' }));
        setValidationSuccess(prev => ({ ...prev, identityNumber: false }));
      } else {
        setValidationErrors(prev => ({ ...prev, identityNumber: '' }));
        setValidationSuccess(prev => ({ ...prev, identityNumber: true }));
      }
    }
  }, [identityValidation]);

  useEffect(() => {
    if (companyNameCheck) {
      setValidating(prev => ({ ...prev, companyName: false }));
      
      // Check the actual validation result from API
      // API returns isValid: false when there are issues
      const isValid = companyNameCheck.isValid === true;
      const isUnique = companyNameCheck.isUnique !== false;
      const containsRestricted = companyNameCheck.containsRestrictedWords === true;
      
      // Company name is available only if it's valid, unique, and doesn't contain restricted words
      const isAvailable = isValid && isUnique && !containsRestricted;
      
      if (!isAvailable) {
        // Build detailed error message
        let errorMessage = companyNameCheck.message || 'Bu şirket adı kullanılamaz';
        
        // Add restriction details if available
        if (companyNameCheck.details?.restriction) {
          errorMessage += ` (${companyNameCheck.details.restriction})`;
        }
        
        setValidationErrors(prev => ({ ...prev, companyName: errorMessage }));
        setValidationSuccess(prev => ({ ...prev, companyName: false }));
      } else {
        // Company name is available - show success
        setValidationErrors(prev => ({ ...prev, companyName: '' }));
        setValidationSuccess(prev => ({ ...prev, companyName: true }));
      }
    }
  }, [companyNameCheck]);

  useEffect(() => {
    if (domainCheck) {
      setValidating(prev => ({ ...prev, companyCode: false }));
      if (!domainCheck.isAvailable) {
        setValidationErrors(prev => ({ ...prev, companyCode: 'Bu kod zaten kullanımda' }));
        setValidationSuccess(prev => ({ ...prev, companyCode: false }));
      } else {
        setValidationErrors(prev => ({ ...prev, companyCode: '' }));
        setValidationSuccess(prev => ({ ...prev, companyCode: true }));
      }
    }
  }, [domainCheck]);

  useEffect(() => {
    if (signalRPasswordStrength) {
      setPasswordStrength({
        score: signalRPasswordStrength.score,
        hasMinLength: signalRPasswordStrength.score >= 1,
        hasUpperCase: signalRPasswordStrength.hasUpperCase || false,
        hasLowerCase: signalRPasswordStrength.hasLowerCase || false,
        hasNumber: signalRPasswordStrength.hasDigit || false,
        hasSpecial: signalRPasswordStrength.hasSpecialChar || false
      });
    }
  }, [signalRPasswordStrength]);

  const checkPasswordStrength = (password: string) => {
    const strength = {
      score: 0,
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    let score = 0;
    if (strength.hasMinLength) score++;
    if (strength.hasUpperCase) score++;
    if (strength.hasLowerCase) score++;
    if (strength.hasNumber) score++;
    if (strength.hasSpecial) score++;

    strength.score = score;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength.score === 0) return '';
    if (passwordStrength.score <= 2) return 'weak';
    if (passwordStrength.score === 3) return 'fair';
    if (passwordStrength.score === 4) return 'good';
    return 'strong';
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear previous error and success states
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
    setValidationSuccess(prev => ({ ...prev, [field]: false }));
    
    // Company name autocomplete - dinamik öneri oluştur
    if (field === 'companyName') {
      if (value && value.length >= 2) {
        const generatedSuggestions = generateCompanySuggestions(value);
        setCompanySuggestions(generatedSuggestions);
        setShowCompanySuggestions(generatedSuggestions.length > 0);
      } else {
        setShowCompanySuggestions(false);
      }
    }
    
    // Title (Ünvan) autocomplete
    if (field === 'contactTitle') {
      if (value && value.length >= 1) {
        const generatedSuggestions = generateTitleSuggestions(value);
        setTitleSuggestions(generatedSuggestions);
        setShowTitleSuggestions(generatedSuggestions.length > 0);
      } else {
        setShowTitleSuggestions(false);
      }
    }
    
    // Email autocomplete
    if (field === 'contactEmail') {
      if (value && value.length >= 2) {
        const generatedSuggestions = generateEmailSuggestions(value);
        setEmailSuggestions(generatedSuggestions);
        setShowEmailSuggestions(generatedSuggestions.length > 0);
      } else {
        setShowEmailSuggestions(false);
      }
    }
    
    // Trigger real-time validation for specific fields
    if (isConnected) {
      switch(field) {
        case 'contactEmail':
          if (value && value.includes('@')) {
            setValidating(prev => ({ ...prev, email: true }));
            validateEmail(value);
          }
          break;
        case 'contactPhone':
          if (value && value.length >= 10) {
            setValidating(prev => ({ ...prev, phone: true }));
            validatePhone(value);
          }
          break;
        case 'companyName':
          if (value && value.length >= 3) {
            setValidating(prev => ({ ...prev, companyName: true }));
            checkCompanyName(value);
          }
          break;
        case 'companyCode':
          if (value && value.length >= 3) {
            setValidating(prev => ({ ...prev, companyCode: true }));
            checkDomain(value);
          }
          break;
        case 'identityNumber':
          // TC Kimlik No: 11 haneli, Vergi No: 10 haneli
          const cleanNumber = value.replace(/\D/g, '');
          console.log('Identity number changed:', cleanNumber, 'Length:', cleanNumber.length, 'Connected:', isConnected);
          
          if (cleanNumber.length === 10 || cleanNumber.length === 11) {
            // Sadece SignalR bağlı ise validation yap
            if (isConnected) {
              console.log('Starting identity validation via SignalR...');
              setValidating(prev => ({ ...prev, identityNumber: true }));
              
              // Async validation with proper error handling
              try {
                console.log('Calling validateIdentity...');
                validateIdentity(cleanNumber).then(() => {
                  console.log('ValidateIdentity completed successfully');
                }).catch(error => {
                  console.error('Identity validation error:', error);
                  setValidating(prev => ({ ...prev, identityNumber: false }));
                  setValidationErrors(prev => ({ ...prev, identityNumber: 'Doğrulama sırasında hata oluştu' }));
                });
              } catch (error) {
                console.error('Error calling validateIdentity:', error);
                setValidating(prev => ({ ...prev, identityNumber: false }));
                setValidationErrors(prev => ({ ...prev, identityNumber: 'Doğrulama sırasında hata oluştu' }));
              }
            } else {
              console.log('SignalR not connected, using client-side validation');
              // SignalR bağlı değilse basit client-side validation yap
              const isValidLength = (formData.identityType === 'TC' && cleanNumber.length === 11) || 
                                   (formData.identityType === 'VKN' && cleanNumber.length === 10);
              if (isValidLength) {
                setValidationSuccess(prev => ({ ...prev, identityNumber: true }));
              }
            }
          }
          break;
      }
    }
  };

  const selectCompanySuggestion = (company: string) => {
    setFormData(prev => ({ ...prev, companyName: company }));
    setShowCompanySuggestions(false);
    setValidationErrors(prev => ({ ...prev, companyName: '' }));
    
    // Auto-generate company code from name
    const code = company
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .slice(0, 2)
      .join('-')
      .substring(0, 20);
    setFormData(prev => ({ ...prev, companyCode: code }));
    
    // Validate if connected
    if (isConnected) {
      setValidating(prev => ({ ...prev, companyName: true }));
      checkCompanyName(company);
    }
  };

  const selectTitleSuggestion = (title: string) => {
    setFormData(prev => ({ ...prev, contactTitle: title }));
    setShowTitleSuggestions(false);
    setValidationErrors(prev => ({ ...prev, contactTitle: '' }));
  };

  const selectEmailSuggestion = (email: string) => {
    setFormData(prev => ({ ...prev, contactEmail: email }));
    setShowEmailSuggestions(false);
    setValidationErrors(prev => ({ ...prev, email: '' }));
    
    // Validate email if connected
    if (isConnected && email && email.includes('@')) {
      setValidating(prev => ({ ...prev, email: true }));
      validateEmail(email);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};
    let hasError = false;

    switch (step) {
      case 0:
        if (!formData.companyName) {
          errors.companyName = 'Şirket adı zorunludur';
          hasError = true;
        }
        if (!formData.companyCode) {
          errors.companyCode = 'Şirket kodu zorunludur';
          hasError = true;
        }
        if (!formData.identityNumber) {
          errors.identityNumber = 'Kimlik/Vergi numarası zorunludur';
          hasError = true;
        } else if (formData.identityType === 'TC' && formData.identityNumber.length !== 11) {
          errors.identityNumber = 'TC Kimlik numarası 11 haneli olmalıdır';
          hasError = true;
        } else if (formData.identityType === 'VKN' && formData.identityNumber.length !== 10) {
          errors.identityNumber = 'Vergi numarası 10 haneli olmalıdır';
          hasError = true;
        }
        if (!formData.sector) {
          errors.sector = 'Sektör seçimi zorunludur';
          hasError = true;
        }
        if (!formData.employeeCount) {
          errors.employeeCount = 'Çalışan sayısı zorunludur';
          hasError = true;
        }
        
        if (hasError) {
          setValidationErrors(prev => ({ ...prev, ...errors }));
          message.error('Lütfen tüm zorunlu alanları doldurun');
          return false;
        }
        return true;
        
      case 1:
        if (!formData.contactName) {
          errors.contactName = 'Ad Soyad zorunludur';
          hasError = true;
        }
        if (!formData.contactTitle) {
          errors.contactTitle = 'Ünvan zorunludur';
          hasError = true;
        }
        if (!formData.contactEmail) {
          errors.email = 'E-posta adresi zorunludur';
          hasError = true;
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.contactEmail)) {
            errors.email = 'Geçerli bir e-posta adresi girin';
            hasError = true;
          }
        }
        if (!formData.contactPhone) {
          errors.phone = 'Telefon numarası zorunludur';
          hasError = true;
        } else {
          const phoneRegex = /^[0-9]{10,11}$/;
          if (!phoneRegex.test(formData.contactPhone.replace(/\D/g, ''))) {
            errors.phone = 'Geçerli bir telefon numarası girin';
            hasError = true;
          }
        }
        
        if (hasError) {
          setValidationErrors(prev => ({ ...prev, ...errors }));
          message.error('Lütfen tüm zorunlu alanları doldurun');
          return false;
        }
        return true;
        
      case 2:
        if (!formData.password) {
          errors.password = 'Şifre zorunludur';
          hasError = true;
        } else if (passwordStrength.score < 3) {
          errors.password = 'Lütfen daha güçlü bir şifre seçin';
          hasError = true;
        }
        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Şifre tekrarı zorunludur';
          hasError = true;
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Şifreler eşleşmiyor';
          hasError = true;
        }
        if (!formData.termsAccepted) {
          errors.terms = 'Kullanım koşullarını kabul etmelisiniz';
          hasError = true;
        }
        
        if (hasError) {
          setValidationErrors(prev => ({ ...prev, ...errors }));
          message.error('Lütfen tüm zorunlu alanları doldurun');
          return false;
        }
        return true;
        
      case 3:
        if (!formData.packageId) {
          setValidationErrors(prev => ({ ...prev, packageId: 'Lütfen bir paket seçin' }));
          message.error('Lütfen bir paket seçin');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const [firstName, ...lastNameParts] = formData.contactName.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const registrationData = {
        companyName: formData.companyName,
        companyCode: formData.companyCode,
        identityType: formData.identityType,
        identityNumber: formData.identityNumber,
        sector: formData.sector,
        employeeCount: formData.employeeCount,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactTitle: formData.contactTitle,
        email: formData.contactEmail,
        username: formData.contactEmail.split('@')[0] || formData.companyCode,
        firstName: firstName,
        lastName: lastName,
        password: formData.password,
        domain: formData.companyCode,
        packageId: formData.packageId || selectedPackage?.id,
        billingPeriod: formData.billingPeriod || 'Monthly'
      };

      console.log('Sending registration data:', registrationData);
      const response = await apiClient.post('/api/public/register', registrationData);
      
      if (response.data?.success && response.data?.data?.id) {
        message.success('Kayıt başarıyla tamamlandı!');
        onComplete(response.data.data);
      } else {
        message.error('Kayıt sırasında bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
      
      // Detaylı hata mesajı
      let errorMessage = 'Kayıt işlemi başarısız';
      
      if (error.response?.data?.errors) {
        // Validation hataları varsa
        const errors = error.response.data.errors;
        const errorList = Object.keys(errors).map(key => 
          `${key}: ${Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key]}`
        ).join('\n');
        
        message.error({
          content: (
            <div>
              <strong>Kayıt hatası:</strong>
              <br />
              {errorList}
            </div>
          ),
          duration: 5
        });
      } else if (error.response?.data?.message) {
        // Genel hata mesajı
        errorMessage = error.response.data.message;
        message.error(errorMessage, 5);
      } else if (error.response?.status === 400) {
        errorMessage = 'Girdiğiniz bilgilerde hata var. Lütfen kontrol edin.';
        message.error(errorMessage, 5);
      } else if (error.response?.status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        message.error(errorMessage, 5);
      } else {
        message.error(errorMessage, 5);
      }
      
      // Debug için console'a detaylı bilgi
      console.log('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-fields">
            <div className="form-header">
              <h2 className="form-title">Şirket Bilgileri</h2>
              <p className="form-subtitle">İşletmenizin temel bilgilerini girin</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Şirket Adı <span className="form-label-required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"><ShopOutlined /></span>
                  <input
                    type="text"
                    className={`form-input form-input-icon ${validationErrors.companyName ? 'input-error' : ''} ${validationSuccess.companyName ? 'input-success' : ''} ${validating.companyName ? 'input-validating' : ''}`}
                    placeholder="Örn: ABC Teknoloji A.Ş."
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    onFocus={() => {
                      if (formData.companyName && formData.companyName.length >= 2) {
                        const generatedSuggestions = generateCompanySuggestions(formData.companyName);
                        setCompanySuggestions(generatedSuggestions);
                        setShowCompanySuggestions(generatedSuggestions.length > 0);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click on suggestions
                      setTimeout(() => setShowCompanySuggestions(false), 200);
                    }}
                  />
                  {validating.companyName && <Spin size="small" className="input-spinner" />}
                  
                  {/* Autocomplete Suggestions */}
                  {showCompanySuggestions && (
                    <div className="autocomplete-suggestions">
                      {companySuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => selectCompanySuggestion(suggestion)}
                        >
                          <ShopOutlined className="suggestion-icon" />
                          <span className="suggestion-text">{suggestion}</span>
                          {suggestion.includes('A.Ş.') && !suggestion.includes('San.') && !suggestion.includes('Holding') && (
                            <span className="suggestion-badge">A.Ş.</span>
                          )}
                          {suggestion.includes('Ltd. Şti.') && (
                            <span className="suggestion-badge">Ltd.</span>
                          )}
                          {suggestion.includes('Holding') && (
                            <span className="suggestion-badge">Holding</span>
                          )}
                          {suggestion.includes('Teknoloji') && (
                            <span className="suggestion-badge" style={{background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)'}}>Teknoloji</span>
                          )}
                          {suggestion.includes('Yazılım') && (
                            <span className="suggestion-badge" style={{background: 'linear-gradient(135deg, #10B981, #059669)'}}>Yazılım</span>
                          )}
                        </div>
                      ))}
                      <div className="suggestion-footer">
                        <span className="suggestion-hint">💡 Bir öneriyi seçin veya kendi şirket adınızı yazın</span>
                      </div>
                    </div>
                  )}
                </div>
                {validationErrors.companyName && <span className="error-message">{validationErrors.companyName}</span>}
                {validationSuccess.companyName && !validationErrors.companyName && <span className="success-message">✓ Şirket adı kullanılabilir</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Şirket Kodu <span className="form-label-required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"><IdcardOutlined /></span>
                  <input
                    type="text"
                    className={`form-input form-input-icon ${validationErrors.companyCode ? 'input-error' : ''} ${validationSuccess.companyCode ? 'input-success' : ''} ${validating.companyCode ? 'input-validating' : ''}`}
                    placeholder="Örn: abc-tech"
                    value={formData.companyCode}
                    onChange={(e) => handleInputChange('companyCode', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  />
                  {validating.companyCode && <Spin size="small" className="input-spinner" />}
                  {validationErrors.companyCode && <span className="error-message">{validationErrors.companyCode}</span>}
                {validationSuccess.companyCode && !validationErrors.companyCode && <span className="success-message">✓ Şirket kodu kullanılabilir</span>}
                </div>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label className="form-label">
                  Kimlik Türü <span className="form-label-required">*</span>
                </label>
                <div className="radio-cards">
                  <div className="radio-card">
                    <input
                      type="radio"
                      id="tc"
                      name="identityType"
                      value="TC"
                      checked={formData.identityType === 'TC'}
                      onChange={(e) => handleInputChange('identityType', e.target.value)}
                    />
                    <label htmlFor="tc" className="radio-card-label">
                      <div className="radio-card-icon"><UserOutlined /></div>
                      <div className="radio-card-text">
                        <div className="radio-card-title">TC Kimlik</div>
                        <div className="radio-card-desc">Şahıs şirketleri için</div>
                      </div>
                    </label>
                  </div>
                  <div className="radio-card">
                    <input
                      type="radio"
                      id="vkn"
                      name="identityType"
                      value="VKN"
                      checked={formData.identityType === 'VKN'}
                      onChange={(e) => handleInputChange('identityType', e.target.value)}
                    />
                    <label htmlFor="vkn" className="radio-card-label">
                      <div className="radio-card-icon"><BankOutlined /></div>
                      <div className="radio-card-text">
                        <div className="radio-card-title">Vergi No</div>
                        <div className="radio-card-desc">Kurumsal şirketler için</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label className="form-label">
                  {formData.identityType === 'TC' ? 'TC Kimlik No' : 'Vergi No'} <span className="form-label-required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className={`form-input ${validationErrors.identityNumber ? 'input-error' : ''} ${validationSuccess.identityNumber ? 'input-success' : ''} ${validating.identityNumber ? 'input-validating' : ''}`}
                    placeholder={formData.identityType === 'TC' ? '11 haneli TC kimlik numarası' : '10 haneli vergi numarası'}
                    value={formData.identityNumber}
                    onChange={(e) => handleInputChange('identityNumber', e.target.value.replace(/\D/g, ''))}
                    maxLength={formData.identityType === 'TC' ? 11 : 10}
                  />
                  {validating.identityNumber && (
                    <div className="input-spinner">
                      <LoadingOutlined style={{ fontSize: 16, color: '#667eea' }} />
                    </div>
                  )}
                </div>
                {validationErrors.identityNumber && <span className="error-message">{validationErrors.identityNumber}</span>}
                {validationSuccess.identityNumber && <span className="success-message">✓ {formData.identityType === 'TC' ? 'TC Kimlik numarası' : 'Vergi numarası'} geçerli</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Sektör <span className="form-label-required">*</span>
                </label>
                <Select
                  name="sector"
                  options={sectorOptions}
                  value={sectorOptions.find(opt => opt.value === formData.sector)}
                  onChange={(option) => handleInputChange('sector', option?.value || '')}
                  placeholder="Sektör seçin"
                  styles={customSelectStyles}
                  isSearchable={true}
                  isClearable={true}
                  noOptionsMessage={() => "Sonuç bulunamadı"}
                />
                {validationErrors.sector && <span className="error-message">{validationErrors.sector}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Çalışan Sayısı <span className="form-label-required">*</span>
                </label>
                <Select
                  name="employeeCount"
                  options={employeeCountOptions}
                  value={employeeCountOptions.find(opt => opt.value === formData.employeeCount)}
                  onChange={(option) => handleInputChange('employeeCount', option?.value || '')}
                  placeholder="Çalışan sayısı seçin"
                  styles={customSelectStyles}
                  isSearchable={false}
                  isClearable={true}
                  noOptionsMessage={() => "Sonuç bulunamadı"}
                />
                {validationErrors.employeeCount && <span className="error-message">{validationErrors.employeeCount}</span>}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="form-fields">
            <div className="form-header">
              <h2 className="form-title">İletişim Bilgileri</h2>
              <p className="form-subtitle">Hesap yöneticisi bilgilerini girin</p>
            </div>

            <div className="info-box">
              <span className="info-box-icon"><InfoCircleOutlined /></span>
              <div className="info-box-content">
                <div className="info-box-title">Önemli Bilgi</div>
                <div className="info-box-text">
                  Bu bilgiler hesabınızın ana yöneticisi için kullanılacaktır.
                  Kayıt sonrası ek kullanıcılar ekleyebilirsiniz.
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Ad Soyad <span className="form-label-required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"><UserOutlined /></span>
                  <input
                    type="text"
                    className={`form-input form-input-icon ${validationErrors.contactName ? 'input-error' : ''}`}
                    placeholder="Örn: Ahmet Yılmaz"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                  />
                </div>
                {validationErrors.contactName && <span className="error-message">{validationErrors.contactName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Ünvan <span className="form-label-required">*</span>
                </label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <span className="input-icon"><IdcardOutlined /></span>
                  <input
                    type="text"
                    className={`form-input form-input-icon ${validationErrors.contactTitle ? 'input-error' : ''}`}
                    placeholder="Örn: Genel Müdür"
                    value={formData.contactTitle}
                    onChange={(e) => handleInputChange('contactTitle', e.target.value)}
                    onFocus={() => {
                      if (formData.contactTitle.length >= 1) {
                        const suggestions = generateTitleSuggestions(formData.contactTitle);
                        setTitleSuggestions(suggestions);
                        setShowTitleSuggestions(suggestions.length > 0);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowTitleSuggestions(false), 200);
                    }}
                  />
                  {showTitleSuggestions && (
                    <div className="autocomplete-suggestions">
                      {titleSuggestions.map((title, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => selectTitleSuggestion(title)}
                        >
                          <span className="suggestion-icon">👤</span>
                          <span className="suggestion-text">{title}</span>
                        </div>
                      ))}
                      <div className="suggestion-footer">
                        <span className="suggestion-hint">💡 Yönetici pozisyonları</span>
                      </div>
                    </div>
                  )}
                </div>
                {validationErrors.contactTitle && <span className="error-message">{validationErrors.contactTitle}</span>}
              </div>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label className="form-label">
                  E-posta Adresi <span className="form-label-required">*</span>
                </label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <span className="input-icon"><MailOutlined /></span>
                  <input
                    type="email"
                    className={`form-input form-input-icon ${validationErrors.email ? 'input-error' : ''} ${validating.email ? 'input-validating' : ''}`}
                    placeholder="ornek@sirket.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    onFocus={() => {
                      if (formData.contactEmail.length >= 2) {
                        const suggestions = generateEmailSuggestions(formData.contactEmail);
                        setEmailSuggestions(suggestions);
                        setShowEmailSuggestions(suggestions.length > 0);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowEmailSuggestions(false), 200);
                    }}
                  />
                  {validating.email && <Spin size="small" className="input-spinner" />}
                  {showEmailSuggestions && (
                    <div className="autocomplete-suggestions">
                      {emailSuggestions.map((email, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => selectEmailSuggestion(email)}
                        >
                          <span className="suggestion-icon">✉️</span>
                          <span className="suggestion-text">{email}</span>
                          {email.includes(formData.companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '')) && (
                            <span className="suggestion-badge">Şirket</span>
                          )}
                        </div>
                      ))}
                      <div className="suggestion-footer">
                        <span className="suggestion-hint">🌐 Domain önerileri</span>
                      </div>
                    </div>
                  )}
                  {validationErrors.email && <span className="error-message">{validationErrors.email}</span>}
                </div>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label className="form-label">
                  Telefon <span className="form-label-required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"><PhoneOutlined /></span>
                  <input
                    type="tel"
                    className={`form-input form-input-icon ${validationErrors.phone ? 'input-error' : ''} ${validating.phone ? 'input-validating' : ''} ${phoneValidation?.isValid && !validating.phone ? 'input-success' : ''}`}
                    placeholder="5XX XXX XX XX"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                  {validating.phone && <Spin size="small" className="input-spinner" />}
                  {!validating.phone && phoneValidation && !validationErrors.phone && (
                    <span className="validation-icon">
                      {phoneValidation.isValid ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
                      )}
                    </span>
                  )}
                  {validationErrors.phone && <span className="error-message">{validationErrors.phone}</span>}
                  {!validating.phone && phoneValidation && phoneValidation.formattedNumber && phoneValidation.isValid && (
                    <span className="success-hint" style={{ color: '#52c41a', fontSize: '12px', marginTop: '4px' }}>
                      Formatlanmış: {phoneValidation.formattedNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-fields">
            <div className="form-header">
              <h2 className="form-title">Hesap Güvenliği</h2>
              <p className="form-subtitle">Güçlü bir şifre belirleyin</p>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label className="form-label">
                  Şifre <span className="form-label-required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"><LockOutlined /></span>
                  <input
                    type="password"
                    className={`form-input form-input-icon ${validationErrors.password ? 'input-error' : ''}`}
                    placeholder="En az 8 karakter"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
                {validationErrors.password && <span className="error-message">{validationErrors.password}</span>}
              </div>
            </div>

            <div className="form-row single">
              <div className="form-group">
                <label className="form-label">
                  Şifre Tekrar <span className="form-label-required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"><LockOutlined /></span>
                  <input
                    type="password"
                    className={`form-input form-input-icon ${validationErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Şifreyi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                </div>
                {validationErrors.confirmPassword && <span className="error-message">{validationErrors.confirmPassword}</span>}
              </div>
            </div>

            {formData.password && (
              <div className="password-meter">
                <div className="password-meter-bar">
                  <div className={`password-meter-fill ${getPasswordStrengthLabel()}`} />
                </div>
                <div className="password-requirements">
                  <div className={`requirement-item ${passwordStrength.hasMinLength ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasMinLength ? <CheckOutlined /> : '○'}</span>
                    En az 8 karakter
                  </div>
                  <div className={`requirement-item ${passwordStrength.hasUpperCase ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasUpperCase ? <CheckOutlined /> : '○'}</span>
                    Büyük harf
                  </div>
                  <div className={`requirement-item ${passwordStrength.hasLowerCase ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasLowerCase ? <CheckOutlined /> : '○'}</span>
                    Küçük harf
                  </div>
                  <div className={`requirement-item ${passwordStrength.hasNumber ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasNumber ? <CheckOutlined /> : '○'}</span>
                    Rakam
                  </div>
                  <div className={`requirement-item ${passwordStrength.hasSpecial ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasSpecial ? <CheckOutlined /> : '○'}</span>
                    Özel karakter
                  </div>
                </div>
              </div>
            )}

            <div className="form-row single">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  />
                  <span>
                    <a href="#" onClick={(e) => e.preventDefault()}>Kullanım koşullarını</a> ve 
                    <a href="#" onClick={(e) => e.preventDefault()}> gizlilik politikasını</a> okudum, kabul ediyorum.
                  </span>
                </label>
                {validationErrors.terms && <span className="error-message" style={{marginTop: '8px', display: 'block'}}>{validationErrors.terms}</span>}
              </div>
            </div>

            <div className="info-box">
              <span className="info-box-icon"><SafetyOutlined /></span>
              <div className="info-box-content">
                <div className="info-box-title">Güvenlik Garantisi</div>
                <div className="info-box-text">
                  Tüm verileriniz 256-bit SSL şifreleme ile korunur.
                  Şifreniz güvenli bir şekilde hashlenerek saklanır.
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="form-fields package-selection-step">
            <div className="form-header">
              <h2 className="form-title">Paket Seçimi</h2>
              <p className="form-subtitle">İşletmenize en uygun paketi seçin</p>
            </div>
            
            {/* Billing Period Toggle - Üstte */}
            <div className="billing-toggle-container">
              <div className="billing-toggle">
                <button 
                  className={`billing-toggle-btn ${formData.billingPeriod === 'Monthly' ? 'active' : ''}`}
                  onClick={() => handleInputChange('billingPeriod', 'Monthly')}
                >
                  Aylık
                </button>
                <button 
                  className={`billing-toggle-btn ${formData.billingPeriod === 'Yearly' ? 'active' : ''}`}
                  onClick={() => handleInputChange('billingPeriod', 'Yearly')}
                >
                  Yıllık
                  <span className="discount-badge">%20 İndirim</span>
                </button>
              </div>
            </div>
            
            {loadingPackages ? (
              <div className="packages-loading">
                <Spin size="large" />
                <p>Paketler yükleniyor...</p>
              </div>
            ) : (
              <div className="packages-container">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className={`package-item ${formData.packageId === pkg.id ? 'selected' : ''} ${pkg.isPopular ? 'popular' : ''}`}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        packageId: pkg.id,
                        packageName: pkg.name
                      }));
                    }}
                  >
                    {pkg.isPopular && (
                      <div className="package-badge">
                        <span>EN POPÜLER</span>
                      </div>
                    )}
                    
                    <div className="package-content">
                      <div className="package-header">
                        <div className="package-icon">
                          {pkg.type === 'Starter' && <RocketOutlined />}
                          {pkg.type === 'Professional' && <CrownOutlined />}
                          {pkg.type === 'Enterprise' && <GlobalOutlined />}
                        </div>
                        <div className="package-info">
                          <h3 className="package-name">{pkg.name}</h3>
                          <p className="package-description">{pkg.description}</p>
                        </div>
                      </div>
                      
                      <div className="package-price">
                        <span className="price-amount">
                          {pkg.currency}{formData.billingPeriod === 'Yearly' 
                            ? Math.floor(pkg.price * 12 * 0.8 / 12) 
                            : pkg.price}
                        </span>
                        <span className="price-period">/ay</span>
                        {formData.billingPeriod === 'Yearly' && (
                          <span className="price-original">{pkg.currency}{pkg.price}</span>
                        )}
                      </div>
                      
                      <ul className="package-features">
                        {pkg.features?.slice(0, 4).map((feature, idx) => (
                          <li key={idx}>
                            <CheckOutlined /> {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="package-select">
                        <div className={`package-radio ${formData.packageId === pkg.id ? 'checked' : ''}`}>
                          {formData.packageId === pkg.id && <CheckOutlined />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {validationErrors.packageId && (
              <span className="error-message package-error">
                {validationErrors.packageId}
              </span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getProgressWidth = () => {
    return `${((currentStep) / (steps.length - 1)) * 100}%`;
  };

  const getStepTitle = () => {
    switch(currentStep) {
      case 0: return 'Şirket Profili Oluşturun';
      case 1: return 'İletişim Bilgilerini Tamamlayın';
      case 2: return 'Güvenlik Ayarlarını Yapın';
      case 3: return 'Paket Seçimi Yapın';
      default: return 'İşletmenizi Güçlendirin';
    }
  };

  const getStepDescription = () => {
    switch(currentStep) {
      case 0: return 'Şirketinizin temel bilgilerini girerek profilinizi oluşturun. Bu bilgiler faturalama ve yasal süreçlerde kullanılacaktır.';
      case 1: return 'Hesap yöneticisi bilgilerinizi ekleyin. Size özel destek ve güncellemeler için iletişim bilgileriniz önemlidir.';
      case 2: return 'Güçlü bir şifre belirleyerek hesabınızı koruma altına alın. Verilerinizin güvenliği bizim için önceliklidir.';
      case 3: return 'İhtiyaçlarınıza en uygun paketi seçin. Her pakette farklı özellikler ve limitler bulunur.';
      default: return 'Modern CRM ve stok yönetimi çözümleriyle işletmenizin verimliliğini artırın.';
    }
  };

  return (
    <div className="modern-wizard-container">
      {/* Left Side - Form Panel */}
      <div className="wizard-form-panel">
        <div className="form-progress">
          <div className="progress-steps">
            <div className="progress-line" style={{ width: getProgressWidth() }} />
            {steps.map((step, index) => (
              <div
                key={index}
                className={`progress-step ${
                  index === currentStep ? 'active' : ''
                } ${
                  index < currentStep ? 'completed' : ''
                }`}
              >
                <div className="step-circle">
                  {index < currentStep ? <CheckOutlined /> : (index + 1)}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="form-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">İşleniyor...</div>
          </div>
        ) : (
          <>
            {renderStepContent()}

            <div className="form-actions">
              {currentStep > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  <ArrowLeftOutlined /> Geri
                </button>
              )}

              <div className="step-dots">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`step-dot ${index === currentStep ? 'active' : ''}`}
                  />
                ))}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={loading}
              >
                {currentStep === steps.length - 1 ? (
                  <>Kayıt Ol <CheckOutlined /></>
                ) : (
                  <>İleri <ArrowRightOutlined /></>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right Side - Visual Panel */}
      <div className="wizard-visual-panel">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>

        <div className="wizard-brand">
          <h1>
            <span className="wizard-brand-icon">📊</span>
            Stocker
          </h1>
          <p>İşletmenizi dijitalleştirin, büyütün</p>
          {isConnected && (
            <div className="connection-status">
              <span className="status-dot active"></span>
              <span className="status-text">Canlı doğrulama aktif</span>
            </div>
          )}
        </div>

        <div className="wizard-illustration">
          <div className="illustration-container step-illustration">
            <div className={`illustration-graphic step-${currentStep}-graphic`}>
              <div className="chart-bars">
                <div className="chart-bar"></div>
                <div className="chart-bar"></div>
                <div className="chart-bar"></div>
                <div className="chart-bar"></div>
                <div className="chart-bar"></div>
              </div>
            </div>
            <div className="illustration-text">
              <h2>{getStepTitle()}</h2>
              <p>{getStepDescription()}</p>
            </div>
          </div>
        </div>

        <div className="wizard-features">
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <div className="feature-text">
              <h4>Hızlı Kurulum</h4>
              <p>5 dakikada başlayın</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <div className="feature-text">
              <h4>Güvenli Altyapı</h4>
              <p>256-bit SSL şifreleme</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <div className="feature-text">
              <h4>Mobil Uyumlu</h4>
              <p>Her yerden erişim</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};