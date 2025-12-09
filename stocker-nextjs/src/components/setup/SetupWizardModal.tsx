'use client'

import { useState, useEffect, useMemo } from 'react'
import { Modal, Tabs, Tooltip, Badge } from 'antd'
import { getApiUrl } from '@/lib/env'
import Swal from 'sweetalert2'

type SetupStep = 'package-type' | 'package' | 'custom-package' | 'company' | 'complete'
type PackageType = 'ready' | 'custom'
type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

interface PackageOption {
  id: string
  name: string
  description: string
  basePrice: {
    amount: number
    currency: string
  }
  features: Array<{
    featureCode: string
    featureName: string
    isEnabled: boolean
  }>
  modules: Array<{
    moduleCode: string
    moduleName: string
    isIncluded: boolean
  }>
  trialDays: number
  displayOrder: number
}

interface ModuleDefinition {
  id: string
  code: string
  name: string
  description?: string
  icon?: string
  monthlyPrice: number
  currency: string
  isCore: boolean
  isActive: boolean
  displayOrder: number
  category?: string
  features: Array<{
    featureName: string
    description?: string
  }>
  dependencies: string[]
}

interface PriceBreakdown {
  moduleCode: string
  moduleName: string
  monthlyPrice: number
  isCore: boolean
  isRequired: boolean
}

interface CustomPackagePrice {
  monthlyTotal: number
  quarterlyTotal: number
  semiAnnualTotal: number
  annualTotal: number
  currency: string
  breakdown: PriceBreakdown[]
  quarterlyDiscount: number
  semiAnnualDiscount: number
  annualDiscount: number
}

interface SetupWizardModalProps {
  open: boolean
  onComplete: () => void
}

export default function SetupWizardModal({ open, onComplete }: SetupWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('package-type')
  const [isLoading, setIsLoading] = useState(false)

  // Package type selection
  const [packageType, setPackageType] = useState<PackageType>('ready')

  // Ready package selection state
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')
  const [loadingPackages, setLoadingPackages] = useState(true)

  // Custom package selection state
  const [modules, setModules] = useState<ModuleDefinition[]>([])
  const [selectedModuleCodes, setSelectedModuleCodes] = useState<string[]>([])
  const [loadingModules, setLoadingModules] = useState(false)
  const [customPrice, setCustomPrice] = useState<CustomPackagePrice | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')

  // Company information state
  const [companyName, setCompanyName] = useState('')
  const [sector, setSector] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [address, setAddress] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [taxNumber, setTaxNumber] = useState('')

  // Load packages on mount
  useEffect(() => {
    if (open) {
      loadPackages()
    }
  }, [open])

  // Load modules when custom package is selected
  useEffect(() => {
    if (packageType === 'custom' && modules.length === 0) {
      loadModules()
    }
  }, [packageType])

  // Calculate price when modules change
  useEffect(() => {
    if (selectedModuleCodes.length > 0) {
      calculatePrice()
    } else {
      setCustomPrice(null)
    }
  }, [selectedModuleCodes])

  const loadPackages = async () => {
    try {
      setLoadingPackages(true)
      const apiUrl = getApiUrl(false)
      const response = await fetch(`${apiUrl}/api/public/packages`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setPackages(data.data)
          if (data.data.length > 0) {
            setSelectedPackageId(data.data[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load packages:', error)
    } finally {
      setLoadingPackages(false)
    }
  }

  const loadModules = async () => {
    try {
      setLoadingModules(true)
      const apiUrl = getApiUrl(false)
      const response = await fetch(`${apiUrl}/api/public/modules`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setModules(data.data)
          // Auto-select core modules
          const coreCodes = data.data.filter((m: ModuleDefinition) => m.isCore).map((m: ModuleDefinition) => m.code)
          setSelectedModuleCodes(coreCodes)
        }
      }
    } catch (error) {
      console.error('Failed to load modules:', error)
    } finally {
      setLoadingModules(false)
    }
  }

  const calculatePrice = async () => {
    try {
      setLoadingPrice(true)
      const apiUrl = getApiUrl(false)
      const response = await fetch(`${apiUrl}/api/public/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedModuleCodes })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setCustomPrice(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to calculate price:', error)
    } finally {
      setLoadingPrice(false)
    }
  }

  const toggleModule = (moduleCode: string) => {
    const module = modules.find(m => m.code === moduleCode)
    if (module?.isCore) return // Core modules can't be deselected

    setSelectedModuleCodes(prev => {
      if (prev.includes(moduleCode)) {
        // Check if other modules depend on this
        const dependentModules = modules.filter(m =>
          prev.includes(m.code) && m.dependencies.includes(moduleCode)
        )
        if (dependentModules.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Bağımlılık Uyarısı',
            text: `Bu modül şu modüller tarafından kullanılıyor: ${dependentModules.map(m => m.name).join(', ')}`,
            confirmButtonText: 'Tamam'
          })
          return prev
        }
        return prev.filter(c => c !== moduleCode)
      } else {
        // Add module and its dependencies
        const newCodes = [...prev, moduleCode]
        if (module?.dependencies) {
          module.dependencies.forEach(dep => {
            if (!newCodes.includes(dep)) {
              newCodes.push(dep)
            }
          })
        }
        return newCodes
      }
    })
  }

  const handlePackageTypeNext = () => {
    if (packageType === 'ready') {
      setCurrentStep('package')
    } else {
      loadModules()
      setCurrentStep('custom-package')
    }
  }

  const handlePackageNext = () => {
    if (!selectedPackageId) {
      Swal.fire({
        icon: 'warning',
        title: 'Uyarı',
        text: 'Lütfen bir paket seçin',
        confirmButtonText: 'Tamam'
      })
      return
    }
    setCurrentStep('company')
  }

  const handleCustomPackageNext = () => {
    const nonCoreSelected = selectedModuleCodes.filter(code => {
      const module = modules.find(m => m.code === code)
      return module && !module.isCore
    })

    if (nonCoreSelected.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Uyarı',
        text: 'Lütfen en az bir modül seçin',
        confirmButtonText: 'Tamam'
      })
      return
    }
    setCurrentStep('company')
  }

  const handleCompanySubmit = async () => {
    if (!companyName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Eksik Bilgi',
        text: 'Firma adı zorunludur',
        confirmButtonText: 'Tamam'
      })
      return
    }

    setIsLoading(true)

    try {
      const apiUrl = getApiUrl(false)

      const body = packageType === 'ready'
        ? {
            packageId: selectedPackageId,
            companyName,
            sector,
            employeeCount,
            contactPhone,
            address,
            taxOffice,
            taxNumber
          }
        : {
            customPackage: {
              selectedModuleCodes,
              billingCycle
            },
            companyName,
            sector,
            employeeCount,
            contactPhone,
            address,
            taxOffice,
            taxNumber
          }

      const response = await fetch(`${apiUrl}/api/setup/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCurrentStep('complete')
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Kurulum Başarısız',
          text: data.message || 'Kurulum tamamlanamadı',
          confirmButtonText: 'Tamam'
        })
        setIsLoading(false)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: 'Kurulum sırasında bir hata oluştu',
        confirmButtonText: 'Tamam'
      })
      setIsLoading(false)
    }
  }

  // Group modules by category
  const modulesByCategory = useMemo(() => {
    const grouped: Record<string, ModuleDefinition[]> = {}
    modules.forEach(module => {
      const category = module.category || 'Diğer'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(module)
    })
    return grouped
  }, [modules])

  // Get current price based on billing cycle
  const getCurrentPrice = () => {
    if (!customPrice) return 0
    switch (billingCycle) {
      case 'quarterly': return customPrice.quarterlyTotal
      case 'semiannual': return customPrice.semiAnnualTotal
      case 'annual': return customPrice.annualTotal
      default: return customPrice.monthlyTotal
    }
  }

  const getBillingLabel = () => {
    switch (billingCycle) {
      case 'quarterly': return '3 Aylık'
      case 'semiannual': return '6 Aylık'
      case 'annual': return 'Yıllık'
      default: return 'Aylık'
    }
  }

  // Get step number for progress
  const getStepNumber = () => {
    switch (currentStep) {
      case 'package-type': return 1
      case 'package':
      case 'custom-package': return 2
      case 'company': return 3
      case 'complete': return 4
      default: return 1
    }
  }

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      maskClosable={false}
      keyboard={false}
      width={currentStep === 'custom-package' ? 1100 : 900}
      centered
      destroyOnClose
    >
      <div className="p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hesap Kurulumu
          </h1>
          <p className="text-gray-600">
            İşletmenizi kullanmaya hazırlamak için birkaç adım kaldı
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {/* Step 1 */}
            <div className={`flex items-center space-x-2 ${
              getStepNumber() >= 1 ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepNumber() > 1 ? 'bg-green-600 text-white' :
                getStepNumber() === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {getStepNumber() > 1 ? '✓' : '1'}
              </div>
              <span className="font-medium">Paket Türü</span>
            </div>

            <div className="w-12 h-0.5 bg-gray-300"></div>

            {/* Step 2 */}
            <div className={`flex items-center space-x-2 ${
              getStepNumber() >= 2 ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepNumber() > 2 ? 'bg-green-600 text-white' :
                getStepNumber() === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {getStepNumber() > 2 ? '✓' : '2'}
              </div>
              <span className="font-medium">
                {packageType === 'custom' ? 'Modül Seçimi' : 'Paket Seçimi'}
              </span>
            </div>

            <div className="w-12 h-0.5 bg-gray-300"></div>

            {/* Step 3 */}
            <div className={`flex items-center space-x-2 ${
              getStepNumber() >= 3 ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepNumber() > 3 ? 'bg-green-600 text-white' :
                getStepNumber() === 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {getStepNumber() > 3 ? '✓' : '3'}
              </div>
              <span className="font-medium">Firma Bilgileri</span>
            </div>

            <div className="w-12 h-0.5 bg-gray-300"></div>

            {/* Step 4 */}
            <div className={`flex items-center space-x-2 ${
              currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                ✓
              </div>
              <span className="font-medium">Tamamlandı</span>
            </div>
          </div>
        </div>

        {/* Step Content */}

        {/* Step 1: Package Type Selection */}
        {currentStep === 'package-type' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Nasıl Başlamak İstersiniz?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Ready Package Option */}
              <div
                onClick={() => setPackageType('ready')}
                className={`border-2 rounded-xl p-8 cursor-pointer transition-all ${
                  packageType === 'ready'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    packageType === 'ready' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <svg className={`w-8 h-8 ${packageType === 'ready' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Hazır Paketler
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Önceden yapılandırılmış paketlerden birini seçin. Hızlı ve kolay başlangıç.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Starter</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Professional</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Enterprise</span>
                  </div>
                </div>
              </div>

              {/* Custom Package Option */}
              <div
                onClick={() => setPackageType('custom')}
                className={`border-2 rounded-xl p-8 cursor-pointer transition-all ${
                  packageType === 'custom'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    packageType === 'custom' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <svg className={`w-8 h-8 ${packageType === 'custom' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Özel Paket Oluştur
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    İhtiyacınız olan modülleri seçin, size özel fiyatlandırma alın.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Esnek</span>
                    <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">Uygun Fiyat</span>
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">Özelleştirilebilir</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={handlePackageTypeNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 2A: Ready Package Selection */}
        {currentStep === 'package' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Size Uygun Paketi Seçin
            </h2>

            {loadingPackages ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Paketler yükleniyor...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Henüz paket bulunamadı</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPackageId === pkg.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {pkg.name}
                    </h3>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ₺{pkg.basePrice.amount}
                      <span className="text-sm text-gray-600 font-normal">/ay</span>
                    </div>
                    {pkg.trialDays > 0 && (
                      <div className="text-sm text-green-600 font-medium mb-4">
                        {pkg.trialDays} gün ücretsiz deneme
                      </div>
                    )}
                    {pkg.description && (
                      <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">Modüller:</div>
                      <ul className="space-y-1">
                        {pkg.modules.filter(m => m.isIncluded).slice(0, 5).map((module) => (
                          <li key={module.moduleCode} className="text-sm text-gray-600 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {module.moduleName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setCurrentStep('package-type')}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Geri
              </button>
              <button
                onClick={handlePackageNext}
                disabled={!selectedPackageId}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 2B: Custom Package Selection */}
        {currentStep === 'custom-package' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Modüllerinizi Seçin
              </h2>
              {/* Billing Cycle Selection */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Ödeme Periyodu:</span>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Aylık</option>
                  <option value="quarterly">3 Aylık (%10 indirim)</option>
                  <option value="semiannual">6 Aylık (%15 indirim)</option>
                  <option value="annual">Yıllık (%20 indirim)</option>
                </select>
              </div>
            </div>

            {loadingModules ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Modüller yükleniyor...</p>
              </div>
            ) : (
              <div className="flex gap-6">
                {/* Module List */}
                <div className="flex-1 max-h-[450px] overflow-y-auto pr-2">
                  {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryModules.map((module) => (
                          <div
                            key={module.id}
                            onClick={() => toggleModule(module.code)}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedModuleCodes.includes(module.code)
                                ? module.isCore
                                  ? 'border-green-400 bg-green-50'
                                  : 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${module.isCore ? 'cursor-default' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{module.name}</h4>
                                  {module.isCore && (
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                      Zorunlu
                                    </span>
                                  )}
                                </div>
                                {module.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {module.description}
                                  </p>
                                )}
                                <div className="text-sm font-medium text-blue-600 mt-2">
                                  ₺{module.monthlyPrice}/ay
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedModuleCodes.includes(module.code)
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300'
                              }`}>
                                {selectedModuleCodes.includes(module.code) && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {/* Features */}
                            {module.features.length > 0 && selectedModuleCodes.includes(module.code) && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <ul className="space-y-1">
                                  {module.features.slice(0, 3).map((feature, idx) => (
                                    <li key={idx} className="text-xs text-gray-500 flex items-center">
                                      <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      {feature.featureName}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="w-80 flex-shrink-0">
                  <div className="bg-gray-50 rounded-xl p-6 sticky top-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Fiyat Özeti
                    </h3>

                    {loadingPrice ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : customPrice ? (
                      <>
                        {/* Breakdown */}
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                          {customPrice.breakdown.map((item) => (
                            <div key={item.moduleCode} className="flex justify-between text-sm">
                              <span className={`${item.isCore ? 'text-green-700' : item.isRequired ? 'text-orange-600' : 'text-gray-600'}`}>
                                {item.moduleName}
                                {item.isCore && ' (Zorunlu)'}
                                {item.isRequired && !item.isCore && ' (Bağımlılık)'}
                              </span>
                              <span className="font-medium">₺{item.monthlyPrice}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-4">
                          {/* Billing Cycle Prices */}
                          <div className="space-y-2 mb-4">
                            <div className={`flex justify-between text-sm ${billingCycle === 'monthly' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                              <span>Aylık</span>
                              <span>₺{customPrice.monthlyTotal}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${billingCycle === 'quarterly' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                              <span>3 Aylık <span className="text-green-600">(%{customPrice.quarterlyDiscount} indirim)</span></span>
                              <span>₺{customPrice.quarterlyTotal}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${billingCycle === 'semiannual' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                              <span>6 Aylık <span className="text-green-600">(%{customPrice.semiAnnualDiscount} indirim)</span></span>
                              <span>₺{customPrice.semiAnnualTotal}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${billingCycle === 'annual' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                              <span>Yıllık <span className="text-green-600">(%{customPrice.annualDiscount} indirim)</span></span>
                              <span>₺{customPrice.annualTotal}</span>
                            </div>
                          </div>

                          {/* Selected Total */}
                          <div className="bg-blue-600 text-white rounded-lg p-4 text-center">
                            <div className="text-sm opacity-90">{getBillingLabel()} Toplam</div>
                            <div className="text-3xl font-bold">
                              ₺{getCurrentPrice()}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">
                        Modül seçin
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => setCurrentStep('package-type')}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Geri
              </button>
              <button
                onClick={handleCustomPackageNext}
                disabled={selectedModuleCodes.filter(code => !modules.find(m => m.code === code)?.isCore).length === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Company Information */}
        {currentStep === 'company' && (
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Firma Bilgilerinizi Girin
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firma Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: ABC Teknoloji Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sektör
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seçiniz...</option>
                  <option value="teknoloji">Teknoloji</option>
                  <option value="perakende">Perakende</option>
                  <option value="uretim">Üretim</option>
                  <option value="hizmet">Hizmet</option>
                  <option value="egitim">Eğitim</option>
                  <option value="saglik">Sağlık</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Çalışan Sayısı
                </label>
                <select
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seçiniz...</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İletişim Telefonu
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vergi Dairesi
                </label>
                <input
                  type="text"
                  value={taxOffice}
                  onChange={(e) => setTaxOffice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: Kadıköy V.D."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vergi Numarası
                </label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10 haneli vergi numarası"
                  maxLength={10}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Firma adresiniz"
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setCurrentStep(packageType === 'custom' ? 'custom-package' : 'package')}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Geri
              </button>
              <button
                onClick={handleCompanySubmit}
                disabled={isLoading || !companyName.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    İşleniyor...
                  </>
                ) : (
                  'Kurulumu Tamamla'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 'complete' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kurulum Tamamlandı!
            </h2>
            <p className="text-gray-600 mb-6">
              Hesabınız başarıyla oluşturuldu. Dashboard yükleniyor...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>
    </Modal>
  )
}
