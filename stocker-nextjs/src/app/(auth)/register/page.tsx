'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSignalRValidation } from '@/hooks/useSignalRValidation'
import Logo from '@/components/Logo'

export default function UltraPremiumRegisterPage() {
  const router = useRouter()
  const {
    isConnected,
    validateEmail,
    validatePhone,
    checkPasswordStrength,
    validateTenantCode,
    checkCompanyName
  } = useSignalRValidation()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [packages, setPackages] = useState<any[]>([])
  const [error, setError] = useState('')

  // Fetch packages on mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('https://api.stoocker.app/api/public/packages?OnlyActive=true')
        const data = await response.json()
        if (data.success && data.data) {
          setPackages(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch packages:', err)
      } finally {
        setLoadingPackages(false)
      }
    }
    fetchPackages()
  }, [])

  // Validation states
  const [validations, setValidations] = useState({
    companyCode: { status: 'idle', message: '', suggestions: [] as string[] },
    companyName: { status: 'idle', message: '' },
    identity: { status: 'idle', message: '' },
    contactEmail: { status: 'idle', message: '' },
    contactPhone: { status: 'idle', message: '' },
    adminEmail: { status: 'idle', message: '' },
    adminPassword: { status: 'idle', message: '', strength: 0, level: '', color: '' }
  })

  // Form data
  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    identityType: 'corporate', // 'corporate' or 'individual'
    taxNumber: '',
    nationalId: '',
    taxOffice: '',
    tradeRegistryNumber: '',
    mersisNumber: '',
    contactEmail: '',
    contactPhone: '',
    contactFax: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'TR',
    postalCode: '',
    industryType: '',
    businessType: '',
    employeeCountRange: '',
    currency: 'TRY',
    adminEmail: '',
    adminUsername: '',
    adminFirstName: '',
    adminLastName: '',
    adminPhone: '',
    adminTitle: '',
    adminPassword: '',
    adminPasswordConfirm: '',
    packageId: '',
    selectedModules: [] as string[],
    billingCycle: 'monthly',
    preferredLanguage: 'tr',
    preferredTimeZone: 'Europe/Istanbul',
    acceptTerms: false,
    acceptPrivacyPolicy: false,
    allowMarketing: false,
    captchaToken: ''
  })

  const sanitizeDigits = (value: string) => value.replace(/\D/g, '')

  const isValidTaxNumber = (value: string) => /^\d{10}$/.test(value)

  const isValidNationalId = (value: string) => {
    if (!/^\d{11}$/.test(value) || value[0] === '0') return false
    const digits = value.split('').map(Number)
    const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
    const sumEven = digits[1] + digits[3] + digits[5] + digits[7]
    const tenthDigit = ((sumOdd * 7) - sumEven) % 10
    if (tenthDigit !== digits[9]) return false
    const eleventhDigit = digits.slice(0, 10).reduce((sum, d) => sum + d, 0) % 10
    return eleventhDigit === digits[10]
  }

  const getActiveIdentityNumber = () =>
    formData.identityType === 'corporate' ? formData.taxNumber : formData.nationalId

  const availableModules = [
    { code: 'CRM', name: 'Müşteri İlişkileri', icon: '👥', description: 'Müşteri yönetimi ve takibi', color: 'from-blue-500 to-cyan-500' },
    { code: 'FINANCE', name: 'Finans', icon: '💰', description: 'Muhasebe ve finans yönetimi', color: 'from-green-500 to-emerald-500' },
    { code: 'HR', name: 'İnsan Kaynakları', icon: '👨', description: 'Personel ve bordro yönetimi', color: 'from-purple-500 to-pink-500' },
    { code: 'INVENTORY', name: 'Envanter', icon: '📦', description: 'Stok ve depo yönetimi', color: 'from-orange-500 to-red-500' },
    { code: 'PURCHASE', name: 'Satın Alma', icon: '🛒', description: 'Tedarik ve satın alma', color: 'from-indigo-500 to-blue-500' },
    { code: 'SALES', name: 'Satış', icon: '📊', description: 'Satış ve sipariş yönetimi', color: 'from-pink-500 to-rose-500' }
  ]

  // Turkey cities and districts data
  const turkeyData: Record<string, string[]> = {
    'İstanbul': ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
    'Ankara': ['Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kahramankazan', 'Kalecik', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'],
    'İzmir': ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
    'Adana': ['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'],
    'Bursa': ['Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'],
    'Adıyaman': ['Merkez', 'Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Samsat', 'Sincik', 'Tut'],
    'Afyonkarahisar': ['Merkez', 'Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'],
    'Ağrı': ['Merkez', 'Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Patnos', 'Taşlıçay', 'Tutak'],
    'Aksaray': ['Merkez', 'Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Ortaköy', 'Sarıyahşi'],
    'Amasya': ['Merkez', 'Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merzifon', 'Suluova', 'Taşova'],
    'Antalya': ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'],
    'Artvin': ['Merkez', 'Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Murgul', 'Şavşat', 'Yusufeli'],
    'Aydın': ['Merkez', 'Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'],
    'Balıkesir': ['Merkez', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'],
    'Bartın': ['Merkez', 'Amasra', 'Kurucaşile', 'Ulus'],
    'Batman': ['Merkez', 'Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Sason'],
    'Bayburt': ['Merkez', 'Aydıntepe', 'Demirözü'],
    'Bilecik': ['Merkez', 'Bozüyük', 'Gölpazarı', 'İnhisar', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'],
    'Bingöl': ['Merkez', 'Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Solhan', 'Yayladere', 'Yedisu'],
    'Bitlis': ['Merkez', 'Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Mutki', 'Tatvan'],
    'Bolu': ['Merkez', 'Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Mudurnu', 'Seben', 'Yeniçağa'],
    'Burdur': ['Merkez', 'Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Tefenni', 'Yeşilova']
  }

  const [districts, setDistricts] = useState<string[]>([])

  const handleCityChange = (city: string) => {
    handleInputChange('city', city)
    handleInputChange('state', '') // Reset district
    setDistricts(turkeyData[city] || [])
  }

  const steps = [
    { number: 1, title: 'Şirket', icon: '🏢' },
    { number: 2, title: 'Paket', icon: '💎' },
    { number: 3, title: 'İletişim', icon: '📧' },
    { number: 4, title: 'Yönetici', icon: '👤' },
    { number: 5, title: 'Tamamla', icon: '✓' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setError('')

    if (field === 'businessType') {
      const nextIdentityType = value === 'sahis' ? 'tc' : 'tax'
      setFormData(prev => ({
        ...prev,
        businessType: value,
        identityType: nextIdentityType,
        taxNumber: nextIdentityType === 'tax' ? prev.taxNumber : '',
        nationalId: nextIdentityType === 'tc' ? prev.nationalId : '',
        taxOffice: nextIdentityType === 'tax' ? prev.taxOffice : ''
      }))
      setValidations(prev => ({
        ...prev,
        identity: { status: 'idle', message: '' }
      }))
      return
    }

    if (field === 'identityType') {
      setFormData(prev => ({
        ...prev,
        identityType: value,
        taxNumber: value === 'tax' ? prev.taxNumber : '',
        nationalId: value === 'tc' ? prev.nationalId : '',
        taxOffice: value === 'tax' ? prev.taxOffice : ''
      }))
      setValidations(prev => ({
        ...prev,
        identity: { status: 'idle', message: '' }
      }))
      return
    }

    setFormData(prev => ({ ...prev, [field]: value }))

    // Real-time validations
    if (field === 'companyCode' && value.length >= 3) {
      setValidations(prev => ({ ...prev, companyCode: { ...prev.companyCode, status: 'validating' } }))
      validateTenantCode(value, (result) => {
        setValidations(prev => ({
          ...prev,
          companyCode: {
            status: result.isAvailable ? 'success' : 'error',
            message: result.message,
            suggestions: result.suggestedCodes
          }
        }))
      })
    }

    if (field === 'companyName' && value.length >= 3) {
      setValidations(prev => ({ ...prev, companyName: { ...prev.companyName, status: 'validating' } }))
      checkCompanyName(value, (result) => {
        setValidations(prev => ({
          ...prev,
          companyName: {
            status: result.isValid ? 'success' : 'error',
            message: result.message
          }
        }))
      })
    }

    if (field === 'contactEmail' && value.includes('@')) {
      setValidations(prev => ({ ...prev, contactEmail: { ...prev.contactEmail, status: 'validating' } }))
      validateEmail(value, (result) => {
        setValidations(prev => ({
          ...prev,
          contactEmail: {
            status: result.isValid ? 'success' : 'error',
            message: result.message
          }
        }))
      })
    }

    if (field === 'contactPhone' && value.length >= 10) {
      setValidations(prev => ({ ...prev, contactPhone: { ...prev.contactPhone, status: 'validating' } }))
      validatePhone(value, (result) => {
        setValidations(prev => ({
          ...prev,
          contactPhone: {
            status: result.isValid ? 'success' : 'error',
            message: result.message
          }
        }))
      })
    }

    if (field === 'adminEmail' && value.includes('@')) {
      setValidations(prev => ({ ...prev, adminEmail: { ...prev.adminEmail, status: 'validating' } }))
      validateEmail(value, (result) => {
        setValidations(prev => ({
          ...prev,
          adminEmail: {
            status: result.isValid ? 'success' : 'error',
            message: result.message
          }
        }))
      })
    }

    if (field === 'adminPassword' && value.length > 0) {
      setValidations(prev => ({ ...prev, adminPassword: { ...prev.adminPassword, status: 'validating' } }))
      checkPasswordStrength(value, (result) => {
        setValidations(prev => ({
          ...prev,
          adminPassword: {
            status: result.score >= 3 ? 'success' : result.score >= 2 ? 'warning' : 'error',
            message: result.level,
            strength: result.score,
            level: result.level,
            color: result.color
          }
        }))
      })
    }
  }

  const handleIdentityNumberChange = (rawValue: string) => {
    const sanitized = sanitizeDigits(rawValue)
    const currentType = formData.identityType

    setFormData(prev => ({
      ...prev,
      taxNumber: currentType === 'tax' ? sanitized : prev.taxNumber,
      nationalId: currentType === 'tc' ? sanitized : prev.nationalId
    }))

    if (!sanitized) {
      setValidations(prev => ({
        ...prev,
        identity: { status: 'idle', message: '' }
      }))
      return
    }

    if (currentType === 'tax') {
      const valid = isValidTaxNumber(sanitized)
      setValidations(prev => ({
        ...prev,
        identity: {
          status: valid ? 'success' : 'error',
          message: valid ? 'Vergi numarası doğrulandı' : 'Vergi numarası 10 haneli olmalıdır'
        }
      }))
    } else {
      const valid = isValidNationalId(sanitized)
      setValidations(prev => ({
        ...prev,
        identity: {
          status: valid ? 'success' : 'error',
          message: valid ? 'TC kimlik numarası doğrulandı' : 'Geçerli bir TC kimlik numarası giriniz'
        }
      }))
    }
  }

  const toggleModule = (moduleCode: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedModules.includes(moduleCode)
      return {
        ...prev,
        selectedModules: isSelected
          ? prev.selectedModules.filter(m => m !== moduleCode)
          : [...prev.selectedModules, moduleCode]
      }
    })
  }

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'validating':
        return <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        if (!formData.companyName || !formData.companyCode) {
          setError('Şirket adı ve kodu zorunludur')
          return false
        }
        if (validations.companyCode.status === 'error') {
          setError('Geçerli bir şirket kodu giriniz')
          return false
        }
        const identityValue = getActiveIdentityNumber()
        if (!identityValue) {
          setError('Vergi veya kimlik numarası zorunludur')
          return false
        }
        const identityValid = formData.identityType === 'tax'
          ? isValidTaxNumber(identityValue)
          : isValidNationalId(identityValue)
        if (!identityValid) {
          setError(formData.identityType === 'tax' ? 'Geçerli bir vergi numarası giriniz' : 'Geçerli bir TC kimlik numarası giriniz')
          return false
        }
        if (validations.identity.status === 'error') {
          setError(validations.identity.message || 'Kimlik bilgisi doğrulanamadı')
          return false
        }
        if (formData.identityType === 'tax' && !formData.taxOffice) {
          setError('Vergi dairesi zorunludur')
          return false
        }
        return true
      }
      case 2:
        if (!formData.packageId) {
          setError('Lutfen bir paket seciniz')
          return false
        }
        return true
      case 3:
        if (!formData.contactEmail || !formData.contactPhone) {
          setError('E-posta ve telefon zorunludur')
          return false
        }
        if (!formData.addressLine1 || !formData.city || !formData.postalCode) {
          setError('Adres bilgileri zorunludur')
          return false
        }
        return true
      case 4:
        if (!formData.adminEmail || !formData.adminUsername || !formData.adminFirstName || !formData.adminLastName) {
          setError('Tüm yönetici bilgileri zorunludur')
          return false
        }
        if (!formData.adminPassword || formData.adminPassword.length < 8) {
          setError('Şifre en az 8 karakter olmalıdır')
          return false
        }
        if (formData.adminPassword !== formData.adminPasswordConfirm) {
          setError('Şifreler eşleşmiyor')
          return false
        }
        return true
      case 5:
        if (!formData.acceptTerms || !formData.acceptPrivacyPolicy) {
          setError('Kullanım şartlarını ve gizlilik politikasını kabul etmelisiniz')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/public/tenant-registration/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (!data.success) {
        setError(data.message || 'Kayıt sırasında bir hata oluştu')
        return
      }

      router.push(`/register/verify-email?email=${encodeURIComponent(formData.contactEmail)}`)
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT - Premium Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-black overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20" />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

          {/* Glowing Orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white overflow-y-auto">
          <div>
            <Link href="/" className="mb-16 inline-block">
              <Logo variant="white" size="lg" />
            </Link>

            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold mb-4 leading-tight">
                  Modern İşletme<br />Yönetimi Başlıyor
                </h1>
                <p className="text-xl text-white/70 max-w-md">
                  Stoocker ile işletmenizi dijital çağa taşıyın. Güçlü özellikler, kolay kullanım.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6 max-w-md">
                <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Gerçek Zamanlı Doğrulama</div>
                    <p className="text-sm text-white/60">Form doldururken anlık validasyon</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Güvenli Altyapı</div>
                    <p className="text-sm text-white/60">256-bit şifreleme ile korunan veriler</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Hızlı Başlangıç</div>
                    <p className="text-sm text-white/60">5 dakikada sistemi kullanmaya başlayın</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">99.9%</div>
              <div className="text-sm text-white/60 mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">2M+</div>
              <div className="text-sm text-white/60 mt-1">İşlem</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">256-bit</div>
              <div className="text-sm text-white/60 mt-1">Şifreleme</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-2xl py-8">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden mb-8 inline-block">
            <Logo variant="gradient" size="md" />
          </Link>

          {/* SignalR Connection Status */}
          {isConnected && (
            <div className="mb-6 inline-flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-700 font-medium">Gerçek zamanlı doğrulama aktif</span>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all ${
                      currentStep > step.number
                        ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 scale-90'
                        : currentStep === step.number
                        ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-2xl shadow-violet-500/50 ring-4 ring-violet-100 scale-105'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {currentStep > step.number ? '✓' : step.icon}
                    </div>
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-semibold ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded transition-all ${
                      currentStep > step.number
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-900/5 p-8 border border-gray-100">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 animate-shake">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 flex-1 font-medium">{error}</p>
              </div>
            )}

            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Şirket Bilgileri</h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Şirket Adı *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-4 py-4 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 text-lg placeholder:text-gray-400"
                        placeholder="Örnek Teknoloji A.Ş."
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {getValidationIcon(validations.companyName.status)}
                      </div>
                    </div>
                    {validations.companyName.message && (
                      <p className={`mt-2 text-sm font-medium ${validations.companyName.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {validations.companyName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Şirket Kodu *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.companyCode}
                        onChange={(e) => handleInputChange('companyCode', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="w-full px-4 py-4 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 text-lg placeholder:text-gray-400"
                        placeholder="ornek-teknoloji"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {getValidationIcon(validations.companyCode.status)}
                      </div>
                    </div>
                    {validations.companyCode.message && (
                      <div className="mt-2">
                        <p className={`text-sm font-medium ${validations.companyCode.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {validations.companyCode.message}
                        </p>
                        {validations.companyCode.suggestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {validations.companyCode.suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => handleInputChange('companyCode', suggestion)}
                                className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-medium rounded-lg transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Subdomain: <span className="font-medium ml-1">{formData.companyCode || 'kodunuz'}.stoocker.app</span>
                    </p>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">İşletme Türü *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange('identityType', 'individual')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          formData.identityType === 'individual'
                            ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/20'
                            : 'border-gray-200 bg-white hover:border-violet-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">👤</div>
                          <div className="font-bold text-gray-900">Şahıs Şirketi</div>
                          <div className="text-sm text-gray-500 mt-1">TC Kimlik No ile</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInputChange('identityType', 'corporate')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          formData.identityType === 'corporate'
                            ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/20'
                            : 'border-gray-200 bg-white hover:border-violet-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">🏢</div>
                          <div className="font-bold text-gray-900">Kurumsal</div>
                          <div className="text-sm text-gray-500 mt-1">Vergi No ile</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {formData.identityType === 'individual' ? (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">TC Kimlik No *</label>
                        <input
                          type="text"
                          value={formData.nationalId}
                          onChange={(e) => handleInputChange('nationalId', e.target.value)}
                          className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="12345678901"
                          maxLength={11}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Vergi Numarası *</label>
                          <input
                            type="text"
                            value={formData.taxNumber}
                            onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                            className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                            placeholder="1234567890"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Vergi Dairesi</label>
                          <input
                            type="text"
                            value={formData.taxOffice}
                            onChange={(e) => handleInputChange('taxOffice', e.target.value)}
                            className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                            placeholder="Kadıköy"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Package Selection */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Paketinizi Seçin</h3>
                <p className="text-gray-600 mb-6">İşletmeniz için en uygun paketi seçin. İstediğiniz zaman değiştirebilirsiniz.</p>

                {loadingPackages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {packages.map((pkg, index) => {
                      const isSelected = formData.packageId === pkg.id
                      const isPopular = index === 1 // Middle package is popular
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => handleInputChange('packageId', pkg.id)}
                          className={`relative p-6 rounded-3xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-2xl shadow-violet-500/30 scale-105'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xl'
                          } ${isPopular && !isSelected ? 'ring-2 ring-violet-200' : ''}`}
                        >
                          {/* Popular Badge */}
                          {isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                              <div className="px-4 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold rounded-full shadow-lg">
                                ⭐ POPÜLER
                              </div>
                            </div>
                          )}

                          {/* Checkmark */}
                          <div className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 scale-100'
                              : 'bg-gray-200 scale-0'
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>

                          {/* Package Info */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-2xl font-bold text-gray-900">{pkg.name}</h4>
                              {pkg.description && (
                                <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline space-x-2">
                              <span className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                ₺{pkg.basePrice.amount.toLocaleString('tr-TR')}
                              </span>
                              <span className="text-gray-600 text-sm">/ay</span>
                            </div>

                            {/* Trial Days */}
                            {pkg.trialDays > 0 && (
                              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                                <span className="text-xs font-bold text-green-700">
                                  🎁 {pkg.trialDays} gün ücretsiz deneme
                                </span>
                              </div>
                            )}

                            {/* Modules */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dahil Modüller</p>
                              <div className="flex flex-wrap gap-2">
                                {pkg.modules.filter((m: any) => m.isIncluded).map((module: any) => {
                                  const moduleInfo = availableModules.find(am => am.code === module.moduleCode)
                                  return (
                                    <div key={module.moduleCode} className="inline-flex items-center space-x-1 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs">
                                      <span>{moduleInfo?.icon || '📦'}</span>
                                      <span className="font-medium text-gray-700">{module.moduleName}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Limits */}
                            <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                              <div className="flex items-center justify-between">
                                <span>👥 Max Kullanıcı:</span>
                                <span className="font-semibold text-gray-900">{pkg.maxUsers}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>💾 Depolama:</span>
                                <span className="font-semibold text-gray-900">{pkg.maxStorage} GB</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {formData.packageId && !loadingPackages && (
                  <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-2xl">
                    <p className="text-sm text-violet-700 font-medium">
                      ✓ Paket seçildi
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">İletişim Bilgileri</h3>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta *</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                          className="w-full px-4 py-4 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="info@ornek.com"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {getValidationIcon(validations.contactEmail.status)}
                        </div>
                      </div>
                      {validations.contactEmail.message && (
                        <p className={`mt-2 text-sm font-medium ${validations.contactEmail.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {validations.contactEmail.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon *</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={formData.contactPhone}
                          onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                          className="w-full px-4 py-4 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="+90 212 123 45 67"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {getValidationIcon(validations.contactPhone.status)}
                        </div>
                      </div>
                      {validations.contactPhone.message && (
                        <p className={`mt-2 text-sm font-medium ${validations.contactPhone.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {validations.contactPhone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Adres *</label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="Cadde, Sokak, No"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Şehir *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900"
                      >
                        <option value="">Şehir Seçiniz</option>
                        {Object.keys(turkeyData).sort().map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">İlçe</label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={!formData.city || districts.length === 0}
                        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">İlçe Seçiniz</option>
                        {districts.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Posta Kodu *</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="34000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Admin User */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Yönetici Hesabı</h3>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ad *</label>
                      <input
                        type="text"
                        value={formData.adminFirstName}
                        onChange={(e) => handleInputChange('adminFirstName', e.target.value)}
                        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Soyad *</label>
                      <input
                        type="text"
                        value={formData.adminLastName}
                        onChange={(e) => handleInputChange('adminLastName', e.target.value)}
                        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta *</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                        className="w-full px-4 py-4 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="yönetici@ornek.com"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {getValidationIcon(validations.adminEmail.status)}
                      </div>
                    </div>
                    {validations.adminEmail.message && (
                      <p className={`mt-2 text-sm font-medium ${validations.adminEmail.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {validations.adminEmail.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kullanıcı Adı *</label>
                    <input
                      type="text"
                      value={formData.adminUsername}
                      onChange={(e) => handleInputChange('adminUsername', e.target.value.toLowerCase())}
                      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="yönetici"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre *</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                        className="w-full px-4 py-4 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="••••••••"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {getValidationIcon(validations.adminPassword.status)}
                      </div>
                    </div>
                    {validations.adminPassword.strength > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Şifre Gücü: {validations.adminPassword.level}</span>
                          <span className="text-sm font-medium" style={{ color: validations.adminPassword.color }}>
                            {validations.adminPassword.strength}/5
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{
                              width: `${(validations.adminPassword.strength / 5) * 100}%`,
                              backgroundColor: validations.adminPassword.color
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre Tekrar *</label>
                    <input
                      type="password"
                      value={formData.adminPasswordConfirm}
                      onChange={(e) => handleInputChange('adminPasswordConfirm', e.target.value)}
                      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Son Kontrol</h3>

                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl border-2 border-violet-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white text-lg">
                        🏢
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Şirket</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Şirket:</span>
                        <p className="font-semibold text-gray-900 mt-1">{formData.companyName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Kod:</span>
                        <p className="font-semibold text-gray-900 mt-1">{formData.companyCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg">
                        💎
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Seçili Paket</h4>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const selectedPackage = packages.find(p => p.id === formData.packageId)
                        return selectedPackage ? (
                          <>
                            <div>
                              <span className="text-gray-600">Paket:</span>
                              <p className="font-semibold text-gray-900 mt-1">{selectedPackage.name}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Fiyat:</span>
                              <p className="font-semibold text-gray-900 mt-1">₺{selectedPackage.basePrice.amount.toLocaleString('tr-TR')}/ay</p>
                            </div>
                            <div>
                              <span className="text-gray-600 text-sm">Dahil Modüller:</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedPackage.modules.filter((m: any) => m.isIncluded).map((module: any) => {
                                  const moduleInfo = availableModules.find(am => am.code === module.moduleCode)
                                  return (
                                    <div key={module.moduleCode} className="inline-flex items-center space-x-1 px-3 py-1 bg-white rounded-lg border border-purple-200 text-xs">
                                      <span>{moduleInfo?.icon || '📦'}</span>
                                      <span className="font-medium text-gray-700">{module.moduleName}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Paket seçilmedi</p>
                        )
                      })()}
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-lg">
                        📧
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">İletişim</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">E-posta:</span>
                        <p className="font-semibold text-gray-900 mt-1">{formData.contactEmail}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Telefon:</span>
                        <p className="font-semibold text-gray-900 mt-1">{formData.contactPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-lg">
                        ­şæñ
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">Yönetici</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Ad Soyad:</span>
                        <p className="font-semibold text-gray-900 mt-1">{formData.adminFirstName} {formData.adminLastName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">E-posta:</span>
                        <p className="font-semibold text-gray-900 mt-1">{formData.adminEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t-2 border-gray-100">
                  <label className="flex items-start space-x-3 cursor-pointer group p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      className="mt-1 w-5 h-5 text-violet-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-violet-500/20"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                      <Link href="/terms" className="font-bold text-violet-600 hover:text-violet-700 underline">Kullan─▒m ┼Şartlar─▒</Link>&apos;n─▒ okudum ve kabul ediyorum
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer group p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.acceptPrivacyPolicy}
                      onChange={(e) => handleInputChange('acceptPrivacyPolicy', e.target.checked)}
                      className="mt-1 w-5 h-5 text-violet-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-violet-500/20"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                      <Link href="/privacy" className="font-bold text-violet-600 hover:text-violet-700 underline">Gizlilik Politikas─▒</Link>&apos;n─▒ okudum ve kabul ediyorum
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer group p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.allowMarketing}
                      onChange={(e) => handleInputChange('allowMarketing', e.target.checked)}
                      className="mt-1 w-5 h-5 text-violet-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-violet-500/20"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                      Kampanya ve duyurular için e-posta almak istiyorum
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-100">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-3.5 text-gray-600 hover:text-gray-900 font-semibold disabled:opacity-0 disabled:cursor-not-allowed transition-all hover:bg-gray-100 rounded-xl"
              >
                ← Geri
              </button>

              <div className="flex items-center space-x-3">
                {currentStep < 5 ? (
                  <button
                    onClick={handleNext}
                    className="px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 flex items-center space-x-3 group hover:scale-105 active:scale-95"
                  >
                    <span>Devam Et</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 flex items-center space-x-3 hover:scale-105 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Hesap Oluştur</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="font-bold text-violet-600 hover:text-violet-700 underline">
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


