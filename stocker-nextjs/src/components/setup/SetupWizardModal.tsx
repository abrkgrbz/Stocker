'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Modal, Tabs, Tooltip, Badge } from 'antd'
import { getApiUrl } from '@/lib/env'
import Swal from 'sweetalert2'
import { usePricingSignalR } from '@/hooks/usePricingSignalR'
import SetupProgressModal from './SetupProgressModal'

type SetupStep = 'package-type' | 'package' | 'custom-package' | 'users' | 'storage' | 'addons' | 'industry' | 'complete'
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

  // Progress modal state for tenant provisioning
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [setupTenantId, setSetupTenantId] = useState<string | null>(null)

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


  // Convert SignalR result to CustomPackagePrice format
  // Backend returns CustomPackagePriceResponseDto directly
  const customPrice = useMemo<CustomPackagePrice | null>(() => {
    if (!signalRPriceResult) return null

    return {
      monthlyTotal: signalRPriceResult.monthlyTotal,
      quarterlyTotal: signalRPriceResult.quarterlyTotal,
      semiAnnualTotal: signalRPriceResult.semiAnnualTotal,
      annualTotal: signalRPriceResult.annualTotal,
      currency: signalRPriceResult.currency,
      breakdown: signalRPriceResult.breakdown?.map(m => ({
        moduleCode: m.moduleCode,
        moduleName: m.moduleName,
        monthlyPrice: m.monthlyPrice,
        isCore: m.isCore,
        isRequired: m.isRequired
      })) || [],
      quarterlyDiscount: signalRPriceResult.quarterlyDiscount,
      semiAnnualDiscount: signalRPriceResult.semiAnnualDiscount,
      annualDiscount: signalRPriceResult.annualDiscount,
      userPricing: signalRPriceResult.userPricing ? {
        userCount: signalRPriceResult.userPricing.userCount,
        tierCode: signalRPriceResult.userPricing.tierCode,
        tierName: signalRPriceResult.userPricing.tierName,
        pricePerUser: signalRPriceResult.userPricing.pricePerUser,
        basePrice: signalRPriceResult.userPricing.basePrice,
        totalMonthly: signalRPriceResult.userPricing.totalMonthly
      } : undefined,
      storagePricing: signalRPriceResult.storagePricing ? {
        planCode: signalRPriceResult.storagePricing.planCode,
        planName: signalRPriceResult.storagePricing.planName,
        storageGB: signalRPriceResult.storagePricing.storageGB,
        monthlyPrice: signalRPriceResult.storagePricing.monthlyPrice
      } : undefined,
      addOns: signalRPriceResult.addOns?.map(a => ({
        code: a.code,
        name: a.name,
        monthlyPrice: a.monthlyPrice
      })) || []
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
    handleSetupComplete()
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
    handleSetupComplete()
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

  const handleSetupComplete = async () => {
    setIsLoading(true)

    try {
      const apiUrl = getApiUrl(false)

      const body = packageType === 'ready'
        ? {
            packageId: selectedPackageId
          }
        : {
            customPackage: {
              selectedModuleCodes,
              billingCycle,
              userCount,
              storagePlanCode: selectedStoragePlanCode || null,
              selectedAddOnCodes: selectedAddOnCodes.length > 0 ? selectedAddOnCodes : null,
              industryCode: selectedIndustryCode || null
            }
          }

      const response = await fetch(`${apiUrl}/api/setup/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const responseData = await response.json()
      console.log('[SetupWizardModal] Complete response:', responseData)

      if (response.ok && responseData.success) {
        // Extract the actual data from the response wrapper (API returns { success, data, message })
        const data = responseData.data || responseData
        console.log('[SetupWizardModal] Extracted data:', data)

        // Check if provisioning was started - show progress modal
        if (data.provisioningStarted && data.tenantId) {
          console.log('[SetupWizardModal] Provisioning started, showing progress modal for tenant:', data.tenantId)
          setSetupTenantId(data.tenantId)
          setShowProgressModal(true)
        } else {
          // No provisioning needed, redirect to dashboard
          console.log('[SetupWizardModal] No provisioning needed, redirecting to dashboard. provisioningStarted:', data.provisioningStarted, 'tenantId:', data.tenantId)
          setCurrentStep('complete')
          setTimeout(() => {
            onComplete()
          }, 2000)
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Kurulum Başarısız',
          text: responseData.message || 'Kurulum tamamlanamadı',
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
        case 'complete': return 3
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
        case 'complete': return 7
        default: return 1
      }
    }
  }

  const getTotalSteps = () => {
    return packageType === 'ready' ? 3 : 7
  }

  // Check if we should show price summary (custom package steps only)
  const showPriceSummary = packageType === 'custom' &&
    ['custom-package', 'users', 'storage', 'addons', 'industry'].includes(currentStep)

  // Price Summary Panel Component
  const PriceSummaryPanel = () => {
    if (!showPriceSummary) return null

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Module Count */}
            <div className="text-center">
              <div className="text-xs text-slate-500">Modüller</div>
              <div className="font-semibold text-slate-900">
                {selectedModuleCodes.filter(code => {
                  const m = modules.find(mod => mod.code === code)
                  return m && !m.isCore
                }).length}
              </div>
            </div>

            {/* Users */}
            <div className="text-center">
              <div className="text-xs text-slate-500">Kullanıcı</div>
              <div className="font-semibold text-slate-900">{userCount}</div>
            </div>

            {/* Storage */}
            {selectedStoragePlanCode && setupOptions && (
              <div className="text-center">
                <div className="text-xs text-slate-500">Depolama</div>
                <div className="font-semibold text-slate-900">
                  {setupOptions.storagePlans.find(p => p.code === selectedStoragePlanCode)?.storageGB || 0} GB
                </div>
              </div>
            )}

            {/* Add-ons */}
            {selectedAddOnCodes.length > 0 && (
              <div className="text-center">
                <div className="text-xs text-slate-500">Ek Özellik</div>
                <div className="font-semibold text-slate-900">{selectedAddOnCodes.length}</div>
              </div>
            )}

            {/* Industry */}
            {selectedIndustryCode && setupOptions && (
              <div className="text-center">
                <div className="text-xs text-slate-500">Sektör</div>
                <div className="font-semibold text-slate-900 text-sm">
                  {setupOptions.industries.find(i => i.code === selectedIndustryCode)?.name || '-'}
                </div>
              </div>
            )}
          </div>

          {/* Price Display */}
          <div className="flex items-center gap-4">
            {/* SignalR Connection Status */}
            {!isPricingConnected && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span>Bağlanıyor...</span>
              </div>
            )}
            {pricingError && (
              <div className="text-xs text-red-500">{pricingError}</div>
            )}
            {loadingPrice ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
                <span className="text-sm text-slate-500">Hesaplanıyor...</span>
              </div>
            ) : customPrice ? (
              <div className="text-right">
                <div className="text-xs text-slate-500">{getBillingLabel()} Toplam</div>
                <div className="text-2xl font-bold text-slate-900">
                  ₺{getCurrentPrice().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
                {billingCycle !== 'monthly' && (
                  <div className="text-xs text-emerald-600">
                    %{billingCycle === 'quarterly' ? customPrice.quarterlyDiscount :
                      billingCycle === 'semiannual' ? customPrice.semiAnnualDiscount :
                      customPrice.annualDiscount} indirim
                  </div>
                )}
              </div>
            ) : (
              <div className="text-right">
                <div className="text-xs text-slate-500">Toplam</div>
                <div className="text-xl font-semibold text-slate-400">₺0,00</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <Modal
      open={open && !showProgressModal}
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

        {/* Progress Bar - Minimal & Non-intimidating */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">
              {currentStep === 'package-type' && 'Başlangıç'}
              {currentStep === 'package' && 'Paket Seçimi'}
              {currentStep === 'custom-package' && 'Modüller'}
              {currentStep === 'users' && 'Detaylar'}
              {currentStep === 'storage' && 'Detaylar'}
              {currentStep === 'addons' && 'Detaylar'}
              {currentStep === 'industry' && 'Tamamla'}
              {currentStep === 'complete' && 'Hazır'}
            </span>
            {/* Grouped steps indicator */}
            <div className="flex items-center gap-2">
              {packageType === 'ready' ? (
                // Ready package: 3 dots
                <>
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        getStepNumber() >= step ? 'bg-slate-900' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </>
              ) : (
                // Custom package: 3 grouped dots (Paket -> Detaylar -> Tamamla)
                <>
                  <div className={`w-2 h-2 rounded-full transition-all ${getStepNumber() >= 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  <div className={`w-2 h-2 rounded-full transition-all ${getStepNumber() >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  <div className={`w-2 h-2 rounded-full transition-all ${getStepNumber() >= 3 ? 'bg-slate-900' : 'bg-slate-200'}`} />
                </>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-slate-900 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}

        {/* Step 1: Package Type Selection */}
        {currentStep === 'package-type' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
              Nasıl Başlamak İstersiniz?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Ready Package Option */}
              <div
                onClick={() => setPackageType('ready')}
                className={`relative border-2 rounded-2xl p-8 cursor-pointer transition-all duration-200 ${
                  packageType === 'ready'
                    ? 'border-slate-900 bg-slate-50 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Check Circle */}
                {packageType === 'ready' && (
                  <div className="absolute top-4 right-4">
                    <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-colors ${
                    packageType === 'ready' ? 'bg-slate-900' : 'bg-slate-100'
                  }`}>
                    <svg className={`w-8 h-8 ${packageType === 'ready' ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Hazır Paketler
                  </h3>
                  <p className="text-slate-500 text-sm mb-5">
                    Önceden yapılandırılmış paketlerden birini seçin. Hızlı ve kolay başlangıç.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">Starter</span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">Pro</span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">Enterprise</span>
                  </div>
                </div>
              </div>

              {/* Custom Package Option */}
              <div
                onClick={() => setPackageType('custom')}
                className={`relative border-2 rounded-2xl p-8 cursor-pointer transition-all duration-200 ${
                  packageType === 'custom'
                    ? 'border-slate-900 bg-slate-50 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Check Circle */}
                {packageType === 'custom' && (
                  <div className="absolute top-4 right-4">
                    <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-colors ${
                    packageType === 'custom' ? 'bg-slate-900' : 'bg-slate-100'
                  }`}>
                    <svg className={`w-8 h-8 ${packageType === 'custom' ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Özel Paket Oluştur
                  </h3>
                  <p className="text-slate-500 text-sm mb-5">
                    İhtiyacınız olan modülleri seçin, size özel fiyatlandırma alın.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">Esnek</span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">Uygun Fiyat</span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">Özel</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={handlePackageTypeNext}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 2A: Ready Package Selection */}
        {currentStep === 'package' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
              Size Uygun Paketi Seçin
            </h2>

            {loadingPackages ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-4 text-slate-500">Paketler yükleniyor...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Henüz paket bulunamadı</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[420px] overflow-y-auto">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                      selectedPackageId === pkg.id
                        ? 'border-slate-900 bg-slate-50 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Check Circle */}
                    {selectedPackageId === pkg.id && (
                      <div className="absolute top-4 right-4">
                        <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {pkg.name}
                    </h3>
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                      ₺{pkg.basePrice.amount}
                      <span className="text-sm text-slate-500 font-normal">/ay</span>
                    </div>
                    {pkg.trialDays > 0 && (
                      <div className="text-sm text-emerald-600 font-medium mb-4">
                        {pkg.trialDays} gün ücretsiz deneme
                      </div>
                    )}
                    {pkg.description && (
                      <p className="text-sm text-slate-500 mb-4">{pkg.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-slate-700">Modüller:</div>
                      <ul className="space-y-1.5">
                        {pkg.modules.filter(m => m.isIncluded).slice(0, 5).map((module) => (
                          <li key={module.moduleCode} className="text-sm text-slate-600 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
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
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handlePackageNext}
                disabled={!selectedPackageId}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 2B: Custom Package Selection */}
        {currentStep === 'custom-package' && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Modüllerinizi Seçin
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  İhtiyacınız olan özellikleri seçerek kendi paketinizi oluşturun
                </p>
              </div>
              {/* Billing Cycle Selection */}
              <div className="flex items-center gap-2">
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                >
                  <option value="monthly">Aylık</option>
                  <option value="quarterly">3 Aylık (%10)</option>
                  <option value="semiannual">6 Aylık (%15)</option>
                  <option value="annual">Yıllık (%20)</option>
                </select>
              </div>
            </div>

            {loadingModules ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-4 text-slate-500">Modüller yükleniyor...</p>
              </div>
            ) : (
              <div className="flex gap-6 flex-1 min-h-0">
                {/* Module List - Scrollable */}
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide" style={{ maxHeight: '400px' }}>
                  {Object.entries(modulesByCategory).map(([category, categoryModules]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryModules.map((module) => {
                          const isSelected = selectedModuleCodes.includes(module.code)
                          return (
                            <div
                              key={module.id}
                              onClick={() => !module.isCore && toggleModule(module.code)}
                              className={`relative border-2 rounded-xl p-4 transition-all duration-200 ${
                                isSelected
                                  ? 'border-slate-900 bg-white shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              } ${module.isCore ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              {/* Check Circle - Top Right */}
                              {isSelected && (
                                <div className="absolute top-3 right-3">
                                  <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}

                              <div className="pr-6">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-slate-900">{module.name}</h4>
                                  {module.isCore && (
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                                      Temel
                                    </span>
                                  )}
                                </div>
                                {module.description && (
                                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                    {module.description}
                                  </p>
                                )}
                                <div className="text-sm font-semibold text-slate-900">
                                  ₺{module.monthlyPrice}<span className="text-slate-400 font-normal">/ay</span>
                                </div>
                              </div>

                              {/* Features - Show when selected */}
                              {module.features.length > 0 && isSelected && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <ul className="space-y-1">
                                    {module.features.slice(0, 3).map((feature, idx) => (
                                      <li key={idx} className="text-xs text-slate-500 flex items-center">
                                        <svg className="w-3 h-3 mr-1.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {feature.featureName}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary - Right Panel */}
                <div className="w-72 flex-shrink-0">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">
                      Konfigürasyon Özeti
                    </h3>

                    {loadingPrice ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 mx-auto"></div>
                      </div>
                    ) : customPrice ? (
                      <>
                        {/* Module Breakdown */}
                        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto scrollbar-hide">
                          {customPrice.breakdown.map((item) => (
                            <div key={item.moduleCode} className="flex justify-between text-sm">
                              <span className="text-slate-600 truncate pr-2">
                                {item.moduleName}
                                {item.isCore && <span className="text-slate-400 text-xs ml-1">(Temel)</span>}
                              </span>
                              <span className="font-medium text-slate-900 flex-shrink-0">₺{item.monthlyPrice}</span>
                            </div>
                          ))}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-200 pt-4">
                          {/* Billing Options - Compact */}
                          <div className="space-y-1.5 mb-4">
                            {[
                              { key: 'monthly', label: 'Aylık', price: customPrice.monthlyTotal },
                              { key: 'quarterly', label: '3 Aylık', price: customPrice.quarterlyTotal, discount: customPrice.quarterlyDiscount },
                              { key: 'semiannual', label: '6 Aylık', price: customPrice.semiAnnualTotal, discount: customPrice.semiAnnualDiscount },
                              { key: 'annual', label: 'Yıllık', price: customPrice.annualTotal, discount: customPrice.annualDiscount },
                            ].map((option) => (
                              <div
                                key={option.key}
                                className={`flex justify-between text-xs py-1 ${
                                  billingCycle === option.key ? 'text-slate-900 font-medium' : 'text-slate-400'
                                }`}
                              >
                                <span>
                                  {option.label}
                                  {option.discount && <span className="text-emerald-600 ml-1">-%{option.discount}</span>}
                                </span>
                                <span>₺{option.price}</span>
                              </div>
                            ))}
                          </div>

                          {/* Total Price - Clean Display */}
                          <div className="pt-3 border-t border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">{getBillingLabel()} Toplam</div>
                            <div className="text-2xl font-bold text-slate-900">
                              ₺{getCurrentPrice().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">KDV Dahil</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-400 text-sm text-center py-4">
                        Modül seçin
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sticky Footer - Main Action Area */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep('package-type')}
                className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                ← Geri
              </button>

              <div className="flex items-center gap-6">
                {/* Price Display in Footer */}
                {customPrice && (
                  <div className="text-right">
                    <span className="text-sm text-slate-500">Toplam: </span>
                    <span className="text-lg font-bold text-slate-900">
                      ₺{getCurrentPrice().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleCustomPackageNext}
                  disabled={selectedModuleCodes.filter(code => !modules.find(m => m.code === code)?.isCore).length === 0}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  Devam Et
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: User Count Selection */}
        {currentStep === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
              Kaç Kullanıcı Kullanacak?
            </h2>
            <p className="text-slate-500 text-center mb-6">
              Sistemde aynı anda çalışacak kullanıcı sayısını belirleyin
            </p>

            {loadingSetupOptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-4 text-slate-500">Yükleniyor...</p>
              </div>
            ) : (
              <>
                {/* User Count Slider */}
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <button
                      onClick={() => setUserCount(Math.max(1, userCount - 1))}
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-700 transition-colors"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-slate-900">{userCount}</div>
                      <div className="text-slate-500 text-sm">Kullanıcı</div>
                    </div>
                    <button
                      onClick={() => setUserCount(userCount + 1)}
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-700 transition-colors"
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
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
                          className={`relative border-2 rounded-2xl p-4 transition-all duration-200 ${
                            isActive
                              ? 'border-slate-900 bg-slate-50 shadow-md'
                              : 'border-slate-200'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute top-3 right-3">
                              <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <h3 className="font-semibold text-slate-900">{tier.name}</h3>
                          <p className="text-sm text-slate-500 mb-2">
                            {tier.minUsers}-{tier.maxUsers === -1 ? '∞' : tier.maxUsers} kullanıcı
                          </p>
                          <div className="text-lg font-bold text-slate-900">
                            ₺{tier.pricePerUser}/kullanıcı/ay
                          </div>
                          {tier.basePrice && tier.basePrice > 0 && (
                            <div className="text-xs text-slate-500">
                              + ₺{tier.basePrice} temel ücret
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
                    <div className="text-slate-500">Kullanıcı maliyeti:</div>
                    <div className="text-2xl font-bold text-slate-900">
                      ₺{customPrice.userPricing.totalMonthly}/ay
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep('custom-package')}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handleUsersNext}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step: Storage Plan Selection */}
        {currentStep === 'storage' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
              Depolama Planı Seçin
            </h2>
            <p className="text-slate-500 text-center mb-6">
              Dosya, belge ve veritabanı depolama ihtiyacınıza göre plan seçin
            </p>

            {loadingSetupOptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              </div>
            ) : setupOptions && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                {setupOptions.storagePlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedStoragePlanCode(plan.code)}
                    className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 text-center ${
                      selectedStoragePlanCode === plan.code
                        ? 'border-slate-900 bg-slate-50 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Check Circle */}
                    {selectedStoragePlanCode === plan.code && (
                      <div className="absolute top-3 right-3">
                        <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {plan.isDefault && (
                      <div className="text-xs text-emerald-600 font-medium mb-2">Ücretsiz</div>
                    )}
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${
                      selectedStoragePlanCode === plan.code ? 'bg-slate-900' : 'bg-slate-100'
                    }`}>
                      <svg className={`w-6 h-6 ${selectedStoragePlanCode === plan.code ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                    <div className="text-2xl font-bold text-slate-900 my-2">
                      {plan.storageGB} GB
                    </div>
                    {plan.description && (
                      <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                    )}
                    <div className="text-lg font-bold text-slate-700">
                      {plan.monthlyPrice === 0 ? 'Ücretsiz' : `₺${plan.monthlyPrice}/ay`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep('users')}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handleStorageNext}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step: Add-ons Selection */}
        {currentStep === 'addons' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
              Ek Özellikler
            </h2>
            <p className="text-slate-500 text-center mb-6">
              İhtiyacınıza göre ek özellikler ekleyin (isteğe bağlı)
            </p>

            {loadingSetupOptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              </div>
            ) : setupOptions && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {setupOptions.addOns.map((addOn) => (
                  <div
                    key={addOn.id}
                    onClick={() => toggleAddOn(addOn.code)}
                    className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                      selectedAddOnCodes.includes(addOn.code)
                        ? 'border-slate-900 bg-slate-50 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
                        selectedAddOnCodes.includes(addOn.code) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {addOn.icon || '⚡'}
                      </div>
                      {/* Check Circle */}
                      {selectedAddOnCodes.includes(addOn.code) && (
                        <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{addOn.name}</h3>
                    {addOn.description && (
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{addOn.description}</p>
                    )}
                    <div className="text-lg font-bold text-slate-700">
                      ₺{addOn.monthlyPrice}/ay
                    </div>
                    {addOn.features.length > 0 && selectedAddOnCodes.includes(addOn.code) && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <ul className="space-y-1">
                          {addOn.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-xs text-slate-500 flex items-center">
                              <svg className="w-3 h-3 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
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
                <div className="text-slate-500">Seçili ek özellikler toplam:</div>
                <div className="text-xl font-bold text-slate-900">
                  ₺{customPrice.addOns.reduce((sum, a) => sum + a.monthlyPrice, 0)}/ay
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep('storage')}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handleAddOnsNext}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                {selectedAddOnCodes.length === 0 ? 'Atla' : 'Devam Et'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Industry Selection */}
        {currentStep === 'industry' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
              Sektörünüzü Seçin
            </h2>
            <p className="text-slate-500 text-center mb-6">
              Sektörünüze özel modül önerileri alın (isteğe bağlı)
            </p>

            {loadingSetupOptions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              </div>
            ) : setupOptions && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {setupOptions.industries.map((industry) => (
                  <div
                    key={industry.id}
                    onClick={() => setSelectedIndustryCode(
                      selectedIndustryCode === industry.code ? '' : industry.code
                    )}
                    className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 text-center ${
                      selectedIndustryCode === industry.code
                        ? 'border-slate-900 bg-slate-50 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Check Circle */}
                    {selectedIndustryCode === industry.code && (
                      <div className="absolute top-3 right-3">
                        <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="text-3xl mb-2">{industry.icon || '🏢'}</div>
                    <h3 className="font-semibold text-slate-900 text-sm">{industry.name}</h3>
                    {industry.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{industry.description}</p>
                    )}
                    {selectedIndustryCode === industry.code && industry.recommendedModules.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-xs text-slate-600 font-medium">
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
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {industry.name} için Önerilen Modüller:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {industry.recommendedModules.map((moduleCode) => {
                          const module = modules.find(m => m.code === moduleCode)
                          return (
                            <span
                              key={moduleCode}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                selectedModuleCodes.includes(moduleCode)
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {module?.name || moduleCode}
                              {selectedModuleCodes.includes(moduleCode) && ' ✓'}
                            </span>
                          )
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Bu modüller devam ettiğinizde otomatik olarak eklenecektir.
                      </p>
                    </div>
                  )
                })()}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep('addons')}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handleIndustryNext}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                {selectedIndustryCode ? 'Devam Et' : 'Atla'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {currentStep === 'complete' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Kurulum Tamamlandı!
            </h2>
            <p className="text-slate-500 mb-6">
              Hesabınız başarıyla oluşturuldu. Dashboard yükleniyor...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          </div>
        )}

        {/* Bottom spacing for price summary panel */}
        {showPriceSummary && <div className="h-20"></div>}
      </div>

      {/* Floating Price Summary Panel */}
      <PriceSummaryPanel />
    </Modal>

    {/* Setup Progress Modal for tenant provisioning */}
    {showProgressModal && setupTenantId && (
      <SetupProgressModal
        visible={showProgressModal}
        tenantId={setupTenantId}
        onComplete={() => {
          console.log('[SetupWizardModal] Setup progress completed')
          setShowProgressModal(false)
          onComplete()
        }}
        onError={(error: string) => {
          console.error('[SetupWizardModal] Setup progress error:', error)
          setShowProgressModal(false)
          Swal.fire({
            icon: 'error',
            title: 'Kurulum Hatası',
            text: error || 'Kurulum sırasında bir hata oluştu',
            confirmButtonText: 'Tamam'
          }).then(() => {
            // Still try to redirect to dashboard
            onComplete()
          })
        }}
      />
    )}
  </>
  )
}
