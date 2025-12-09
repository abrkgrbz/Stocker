'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Modal, Tabs, Tooltip, Badge } from 'antd'
import { getApiUrl } from '@/lib/env'
import Swal from 'sweetalert2'
import { usePricingSignalR } from '@/hooks/usePricingSignalR'

type SetupStep = 'package-type' | 'package' | 'custom-package' | 'users' | 'storage' | 'addons' | 'industry' | 'company' | 'complete'
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

interface UserPricing {
  userCount: number
  tierCode: string
  tierName: string
  pricePerUser: number
  basePrice: number
  totalMonthly: number
}

interface StoragePricing {
  planCode: string
  planName: string
  storageGB: number
  monthlyPrice: number
}

interface AddOnPricing {
  code: string
  name: string
  monthlyPrice: number
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
  userPricing?: UserPricing
  storagePricing?: StoragePricing
  addOns: AddOnPricing[]
}

// Setup Options Types
interface UserTier {
  id: string
  code: string
  name: string
  description?: string
  minUsers: number
  maxUsers: number
  pricePerUser: number
  basePrice?: number
  currency: string
  isActive: boolean
  displayOrder: number
}

interface StoragePlan {
  id: string
  code: string
  name: string
  description?: string
  storageGB: number
  monthlyPrice: number
  currency: string
  isActive: boolean
  isDefault: boolean
  displayOrder: number
}

interface AddOn {
  id: string
  code: string
  name: string
  description?: string
  icon?: string
  monthlyPrice: number
  currency: string
  isActive: boolean
  displayOrder: number
  category?: string
  features: Array<{
    featureName: string
    description?: string
  }>
}

interface Industry {
  id: string
  code: string
  name: string
  description?: string
  icon?: string
  isActive: boolean
  displayOrder: number
  recommendedModules: string[]
}

interface SetupOptions {
  userTiers: UserTier[]
  storagePlans: StoragePlan[]
  addOns: AddOn[]
  industries: Industry[]
}

interface SetupWizardModalProps {
  open: boolean
  onComplete: () => void
}

export default function SetupWizardModal({ open, onComplete }: SetupWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('package-type')
  const [isLoading, setIsLoading] = useState(false)

  // SignalR for real-time pricing
  const {
    isConnected: isPricingConnected,
    isCalculating: loadingPrice,
    priceResult: signalRPriceResult,
    error: pricingError,
    calculatePrice: calculatePriceViaSignalR,
    connect: connectPricing,
    disconnect: disconnectPricing
  } = usePricingSignalR()

  // Debounce ref for price calculation
  const priceCalculationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')

  // Setup options state (users, storage, add-ons, industries)
  const [setupOptions, setSetupOptions] = useState<SetupOptions | null>(null)
  const [loadingSetupOptions, setLoadingSetupOptions] = useState(false)
  const [userCount, setUserCount] = useState<number>(1)
  const [selectedStoragePlanCode, setSelectedStoragePlanCode] = useState<string>('')
  const [selectedAddOnCodes, setSelectedAddOnCodes] = useState<string[]>([])
  const [selectedIndustryCode, setSelectedIndustryCode] = useState<string>('')

  // Company information state
  const [companyName, setCompanyName] = useState('')
  const [sector, setSector] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [address, setAddress] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [taxNumber, setTaxNumber] = useState('')

  // Convert SignalR result to CustomPackagePrice format
  const customPrice = useMemo<CustomPackagePrice | null>(() => {
    if (!signalRPriceResult) return null

    return {
      monthlyTotal: signalRPriceResult.totalMonthlyPrice,
      quarterlyTotal: signalRPriceResult.totalMonthlyPrice * 3 * 0.95, // 5% discount
      semiAnnualTotal: signalRPriceResult.totalMonthlyPrice * 6 * 0.90, // 10% discount
      annualTotal: signalRPriceResult.totalAnnualPrice,
      currency: signalRPriceResult.currency,
      breakdown: signalRPriceResult.breakdown.modules.map(m => ({
        moduleCode: m.name,
        moduleName: m.name,
        monthlyPrice: m.total,
        isCore: false,
        isRequired: false
      })),
      quarterlyDiscount: 5,
      semiAnnualDiscount: 10,
      annualDiscount: signalRPriceResult.discounts.annualDiscount,
      userPricing: signalRPriceResult.breakdown.users ? {
        userCount: signalRPriceResult.breakdown.users.quantity,
        tierCode: '',
        tierName: signalRPriceResult.breakdown.users.name,
        pricePerUser: signalRPriceResult.breakdown.users.unitPrice,
        basePrice: 0,
        totalMonthly: signalRPriceResult.breakdown.users.total
      } : undefined,
      storagePricing: signalRPriceResult.breakdown.storage ? {
        planCode: '',
        planName: signalRPriceResult.breakdown.storage.name,
        storageGB: signalRPriceResult.breakdown.storage.quantity,
        monthlyPrice: signalRPriceResult.breakdown.storage.total
      } : undefined,
      addOns: signalRPriceResult.breakdown.addOns.map(a => ({
        code: a.name,
        name: a.name,
        monthlyPrice: a.total
      }))
    }
  }, [signalRPriceResult])

  // Load packages on mount
  useEffect(() => {
    if (open) {
      loadPackages()
    }
  }, [open])

  // Connect to SignalR when custom package is selected
  useEffect(() => {
    if (packageType === 'custom' && open) {
      connectPricing()
    }

    return () => {
      if (priceCalculationTimeoutRef.current) {
        clearTimeout(priceCalculationTimeoutRef.current)
      }
    }
  }, [packageType, open, connectPricing])

  // Disconnect SignalR when modal closes
  useEffect(() => {
    if (!open) {
      disconnectPricing()
    }
  }, [open, disconnectPricing])

  // Load modules when custom package is selected
  useEffect(() => {
    if (packageType === 'custom' && modules.length === 0) {
      loadModules()
    }
  }, [packageType])

  // Load setup options when custom package is selected
  useEffect(() => {
    if (packageType === 'custom' && !setupOptions) {
      loadSetupOptions()
    }
  }, [packageType])

  // Calculate price via SignalR when selections change (debounced)
  useEffect(() => {
    if (selectedModuleCodes.length > 0 && isPricingConnected) {
      // Debounce price calculation to avoid too many requests
      if (priceCalculationTimeoutRef.current) {
        clearTimeout(priceCalculationTimeoutRef.current)
      }

      priceCalculationTimeoutRef.current = setTimeout(() => {
        calculatePriceViaSignalR({
          selectedModuleCodes,
          userCount,
          storagePlanCode: selectedStoragePlanCode || undefined,
          selectedAddOnCodes: selectedAddOnCodes.length > 0 ? selectedAddOnCodes : undefined
        })
      }, 300) // 300ms debounce
    }
  }, [selectedModuleCodes, userCount, selectedStoragePlanCode, selectedAddOnCodes, isPricingConnected, calculatePriceViaSignalR])

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
        } else {
          console.error('Packages API returned error:', data.message)
        }
      } else {
        console.error('Failed to fetch packages:', response.status)
      }
    } catch (error) {
      console.error('Failed to load packages:', error)
      Swal.fire({
        icon: 'error',
        title: 'Bağlantı Hatası',
        text: 'Paketler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.',
        confirmButtonText: 'Tamam'
      })
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
        } else {
          console.error('Modules API returned error:', data.message)
        }
      } else {
        console.error('Failed to fetch modules:', response.status)
      }
    } catch (error) {
      console.error('Failed to load modules:', error)
      Swal.fire({
        icon: 'error',
        title: 'Bağlantı Hatası',
        text: 'Modüller yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
        confirmButtonText: 'Tamam'
      })
    } finally {
      setLoadingModules(false)
    }
  }

  const loadSetupOptions = async () => {
    try {
      setLoadingSetupOptions(true)
      const apiUrl = getApiUrl(false)
      const response = await fetch(`${apiUrl}/api/public/setup-options`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setSetupOptions(data.data)
          // Set default storage plan
          const defaultPlan = data.data.storagePlans.find((p: StoragePlan) => p.isDefault)
          if (defaultPlan) {
            setSelectedStoragePlanCode(defaultPlan.code)
          }
        } else {
          console.error('Setup options API returned error:', data.message)
        }
      } else {
        console.error('Failed to fetch setup options:', response.status)
      }
    } catch (error) {
      console.error('Failed to load setup options:', error)
      Swal.fire({
        icon: 'error',
        title: 'Bağlantı Hatası',
        text: 'Kurulum seçenekleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
        confirmButtonText: 'Tamam'
      })
    } finally {
      setLoadingSetupOptions(false)
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
    setCurrentStep('users')
  }

  const handleUsersNext = () => {
    if (userCount < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Uyarı',
        text: 'En az 1 kullanıcı seçmelisiniz',
        confirmButtonText: 'Tamam'
      })
      return
    }
    setCurrentStep('storage')
  }

  const handleStorageNext = () => {
    setCurrentStep('addons')
  }

  const handleAddOnsNext = () => {
    setCurrentStep('industry')
  }

  const handleIndustryNext = () => {
    // If industry is selected, apply recommended modules
    if (selectedIndustryCode && setupOptions) {
      const industry = setupOptions.industries.find(i => i.code === selectedIndustryCode)
      if (industry) {
        const newCodes = [...selectedModuleCodes]
        industry.recommendedModules.forEach(moduleCode => {
          if (!newCodes.includes(moduleCode)) {
            newCodes.push(moduleCode)
          }
        })
        setSelectedModuleCodes(newCodes)
      }
    }
    setCurrentStep('company')
  }

  const toggleAddOn = (addOnCode: string) => {
    setSelectedAddOnCodes(prev => {
      if (prev.includes(addOnCode)) {
        return prev.filter(c => c !== addOnCode)
      } else {
        return [...prev, addOnCode]
      }
    })
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
              billingCycle,
              userCount,
              storagePlanCode: selectedStoragePlanCode || null,
              selectedAddOnCodes: selectedAddOnCodes.length > 0 ? selectedAddOnCodes : null,
              industryCode: selectedIndustryCode || null
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
    if (packageType === 'ready') {
      switch (currentStep) {
        case 'package-type': return 1
        case 'package': return 2
        case 'company': return 3
        case 'complete': return 4
        default: return 1
      }
    } else {
      // Custom package has more steps
      switch (currentStep) {
        case 'package-type': return 1
        case 'custom-package': return 2
        case 'users': return 3
        case 'storage': return 4
        case 'addons': return 5
        case 'industry': return 6
        case 'company': return 7
        case 'complete': return 8
        default: return 1
      }
    }
  }

  const getTotalSteps = () => {
    return packageType === 'ready' ? 4 : 8
  }

  // Check if we should show price summary (custom package steps only)
  const showPriceSummary = packageType === 'custom' &&
    ['custom-package', 'users', 'storage', 'addons', 'industry', 'company'].includes(currentStep)

  // Price Summary Panel Component
  const PriceSummaryPanel = () => {
    if (!showPriceSummary) return null

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Module Count */}
            <div className="text-center">
              <div className="text-xs text-gray-500">Modüller</div>
              <div className="font-semibold text-gray-900">
                {selectedModuleCodes.filter(code => {
                  const m = modules.find(mod => mod.code === code)
                  return m && !m.isCore
                }).length}
              </div>
            </div>

            {/* Users */}
            <div className="text-center">
              <div className="text-xs text-gray-500">Kullanıcı</div>
              <div className="font-semibold text-gray-900">{userCount}</div>
            </div>

            {/* Storage */}
            {selectedStoragePlanCode && setupOptions && (
              <div className="text-center">
                <div className="text-xs text-gray-500">Depolama</div>
                <div className="font-semibold text-gray-900">
                  {setupOptions.storagePlans.find(p => p.code === selectedStoragePlanCode)?.storageGB || 0} GB
                </div>
              </div>
            )}

            {/* Add-ons */}
            {selectedAddOnCodes.length > 0 && (
              <div className="text-center">
                <div className="text-xs text-gray-500">Ek Özellik</div>
                <div className="font-semibold text-gray-900">{selectedAddOnCodes.length}</div>
              </div>
            )}

            {/* Industry */}
            {selectedIndustryCode && setupOptions && (
              <div className="text-center">
                <div className="text-xs text-gray-500">Sektör</div>
                <div className="font-semibold text-gray-900 text-sm">
                  {setupOptions.industries.find(i => i.code === selectedIndustryCode)?.name || '-'}
                </div>
              </div>
            )}
          </div>

          {/* Price Display */}
          <div className="flex items-center gap-4">
            {/* SignalR Connection Status */}
            {!isPricingConnected && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span>Bağlanıyor...</span>
              </div>
            )}
            {pricingError && (
              <div className="text-xs text-red-500">{pricingError}</div>
            )}
            {loadingPrice ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Hesaplanıyor...</span>
              </div>
            ) : customPrice ? (
              <div className="text-right">
                <div className="text-xs text-gray-500">{getBillingLabel()} Toplam</div>
                <div className="text-2xl font-bold text-blue-600">
                  ₺{getCurrentPrice().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
                {billingCycle !== 'monthly' && (
                  <div className="text-xs text-green-600">
                    %{billingCycle === 'quarterly' ? customPrice.quarterlyDiscount :
                      billingCycle === 'semiannual' ? customPrice.semiAnnualDiscount :
                      customPrice.annualDiscount} indirim
                  </div>
                )}
              </div>
            ) : (
              <div className="text-right">
                <div className="text-xs text-gray-500">Toplam</div>
                <div className="text-xl font-semibold text-gray-400">₺0,00</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      maskClosable={false}
      keyboard={false}
      width={['custom-package', 'addons', 'storage', 'industry'].includes(currentStep) ? 1100 : 900}
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

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Adım {getStepNumber()} / {getTotalSteps()}
            </span>
            <span className="text-sm text-gray-500">
              {currentStep === 'package-type' && 'Paket Türü'}
              {currentStep === 'package' && 'Paket Seçimi'}
              {currentStep === 'custom-package' && 'Modül Seçimi'}
              {currentStep === 'users' && 'Kullanıcı Sayısı'}
              {currentStep === 'storage' && 'Depolama Planı'}
              {currentStep === 'addons' && 'Ek Özellikler'}
              {currentStep === 'industry' && 'Sektör Seçimi'}
              {currentStep === 'company' && 'Firma Bilgileri'}
              {currentStep === 'complete' && 'Tamamlandı'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
            ></div>
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

        {/* Step: User Count Selection */}
        {currentStep === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Kaç Kullanıcı Kullanacak?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Sistemde aynı anda çalışacak kullanıcı sayısını belirleyin
            </p>

            {loadingSetupOptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Yükleniyor...</p>
              </div>
            ) : (
              <>
                {/* User Count Slider */}
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <button
                      onClick={() => setUserCount(Math.max(1, userCount - 1))}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl font-bold"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-blue-600">{userCount}</div>
                      <div className="text-gray-500 text-sm">Kullanıcı</div>
                    </div>
                    <button
                      onClick={() => setUserCount(userCount + 1)}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl font-bold"
                    >
                      +
                    </button>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={userCount}
                    onChange={(e) => setUserCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100+</span>
                  </div>
                </div>

                {/* User Tier Info */}
                {setupOptions && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {setupOptions.userTiers.map((tier) => {
                      const isActive = tier.minUsers <= userCount && (tier.maxUsers === -1 || tier.maxUsers >= userCount)
                      return (
                        <div
                          key={tier.id}
                          className={`border-2 rounded-lg p-4 transition-all ${
                            isActive
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {tier.minUsers}-{tier.maxUsers === -1 ? '∞' : tier.maxUsers} kullanıcı
                          </p>
                          <div className="text-lg font-bold text-blue-600">
                            ₺{tier.pricePerUser}/kullanıcı/ay
                          </div>
                          {tier.basePrice && tier.basePrice > 0 && (
                            <div className="text-xs text-gray-500">
                              + ₺{tier.basePrice} temel ücret
                            </div>
                          )}
                          {isActive && (
                            <div className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs inline-block">
                              Seçili
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Current Price Display */}
                {customPrice?.userPricing && (
                  <div className="mt-6 text-center">
                    <div className="text-gray-600">Kullanıcı maliyeti:</div>
                    <div className="text-2xl font-bold text-blue-600">
                      ₺{customPrice.userPricing.totalMonthly}/ay
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => setCurrentStep('custom-package')}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Geri
              </button>
              <button
                onClick={handleUsersNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step: Storage Plan Selection */}
        {currentStep === 'storage' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Depolama Planı Seçin
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Dosya, belge ve veritabanı depolama ihtiyacınıza göre plan seçin
            </p>

            {loadingSetupOptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : setupOptions && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                {setupOptions.storagePlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedStoragePlanCode(plan.code)}
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all text-center ${
                      selectedStoragePlanCode === plan.code
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.isDefault && (
                      <div className="text-xs text-green-600 font-medium mb-2">Ücretsiz</div>
                    )}
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <div className="text-2xl font-bold text-gray-900 my-2">
                      {plan.storageGB} GB
                    </div>
                    {plan.description && (
                      <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
                    )}
                    <div className="text-lg font-bold text-blue-600">
                      {plan.monthlyPrice === 0 ? 'Ücretsiz' : `₺${plan.monthlyPrice}/ay`}
                    </div>
                    {selectedStoragePlanCode === plan.code && (
                      <div className="mt-3">
                        <svg className="w-6 h-6 text-blue-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => setCurrentStep('users')}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Geri
              </button>
              <button
                onClick={handleStorageNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step: Add-ons Selection */}
        {currentStep === 'addons' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Ek Özellikler
            </h2>
            <p className="text-gray-600 text-center mb-6">
              İhtiyacınıza göre ek özellikler ekleyin (isteğe bağlı)
            </p>

            {loadingSetupOptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : setupOptions && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {setupOptions.addOns.map((addOn) => (
                  <div
                    key={addOn.id}
                    onClick={() => toggleAddOn(addOn.code)}
                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      selectedAddOnCodes.includes(addOn.code)
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                        {addOn.icon || '⚡'}
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedAddOnCodes.includes(addOn.code)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedAddOnCodes.includes(addOn.code) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{addOn.name}</h3>
                    {addOn.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{addOn.description}</p>
                    )}
                    <div className="text-lg font-bold text-blue-600">
                      ₺{addOn.monthlyPrice}/ay
                    </div>
                    {addOn.features.length > 0 && selectedAddOnCodes.includes(addOn.code) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <ul className="space-y-1">
                          {addOn.features.slice(0, 3).map((feature, idx) => (
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
            )}

            {/* Selected Add-ons Total */}
            {selectedAddOnCodes.length > 0 && customPrice && (
              <div className="text-center mt-4">
                <div className="text-gray-600">Seçili ek özellikler toplam:</div>
                <div className="text-xl font-bold text-blue-600">
                  ₺{customPrice.addOns.reduce((sum, a) => sum + a.monthlyPrice, 0)}/ay
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => setCurrentStep('storage')}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Geri
              </button>
              <button
                onClick={handleAddOnsNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {selectedAddOnCodes.length === 0 ? 'Atla' : 'Devam Et'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Industry Selection */}
        {currentStep === 'industry' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Sektörünüzü Seçin
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Sektörünüze özel modül önerileri alın (isteğe bağlı)
            </p>

            {loadingSetupOptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : setupOptions && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {setupOptions.industries.map((industry) => (
                  <div
                    key={industry.id}
                    onClick={() => setSelectedIndustryCode(
                      selectedIndustryCode === industry.code ? '' : industry.code
                    )}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-center ${
                      selectedIndustryCode === industry.code
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{industry.icon || '🏢'}</div>
                    <h3 className="font-semibold text-gray-900 text-sm">{industry.name}</h3>
                    {industry.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{industry.description}</p>
                    )}
                    {selectedIndustryCode === industry.code && industry.recommendedModules.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-blue-600 font-medium">
                          +{industry.recommendedModules.length} önerilen modül
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Recommended Modules Preview */}
            {selectedIndustryCode && setupOptions && (
              <div className="mt-6 max-w-2xl mx-auto">
                {(() => {
                  const industry = setupOptions.industries.find(i => i.code === selectedIndustryCode)
                  if (!industry || industry.recommendedModules.length === 0) return null
                  return (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        {industry.name} için Önerilen Modüller:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {industry.recommendedModules.map((moduleCode) => {
                          const module = modules.find(m => m.code === moduleCode)
                          return (
                            <span
                              key={moduleCode}
                              className={`px-2 py-1 rounded text-xs ${
                                selectedModuleCodes.includes(moduleCode)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {module?.name || moduleCode}
                              {selectedModuleCodes.includes(moduleCode) && ' ✓'}
                            </span>
                          )
                        })}
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        Bu modüller devam ettiğinizde otomatik olarak eklenecektir.
                      </p>
                    </div>
                  )
                })()}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => setCurrentStep('addons')}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Geri
              </button>
              <button
                onClick={handleIndustryNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {selectedIndustryCode ? 'Devam Et' : 'Atla'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Company Information */}
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
                onClick={() => setCurrentStep(packageType === 'custom' ? 'industry' : 'package')}
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

        {/* Bottom spacing for price summary panel */}
        {showPriceSummary && <div className="h-20"></div>}
      </div>

      {/* Floating Price Summary Panel */}
      <PriceSummaryPanel />
    </Modal>
  )
}
