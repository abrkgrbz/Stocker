'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { getApiUrl } from '@/lib/env'
import Swal from 'sweetalert2'
import { usePricingSignalR } from '@/hooks/usePricingSignalR'
import SetupProgressModal from './SetupProgressModal'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Box,
  Layers,
  Users,
  Database,
  Zap,
  Briefcase,
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react'

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
  onCancel?: () => void
}

export default function SetupWizardModal({ open, onComplete, onCancel }: SetupWizardModalProps) {
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
      }, 300)
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
        }
      }
    } catch (error) {
      console.error('Failed to load packages:', error)
      Swal.fire({
        icon: 'error',
        title: 'Bağlantı Hatası',
        text: 'Paketler yüklenirken bir hata oluştu.',
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

  const loadSetupOptions = async () => {
    try {
      setLoadingSetupOptions(true)
      const apiUrl = getApiUrl(false)
      const response = await fetch(`${apiUrl}/api/public/setup-options`)

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setSetupOptions(data.data)
          const defaultPlan = data.data.storagePlans.find((p: StoragePlan) => p.isDefault)
          if (defaultPlan) {
            setSelectedStoragePlanCode(defaultPlan.code)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load setup options:', error)
    } finally {
      setLoadingSetupOptions(false)
    }
  }

  const toggleModule = (moduleCode: string) => {
    const module = modules.find(m => m.code === moduleCode)
    if (module?.isCore) return

    setSelectedModuleCodes(prev => {
      if (prev.includes(moduleCode)) {
        const dependentModules = modules.filter(m =>
          prev.includes(m.code) && m.dependencies.includes(moduleCode)
        )
        if (dependentModules.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Bağımlılık Uyarısı',
            text: `Bu modül şu modüller tarafından kullanılıyor: ${dependentModules.map(m => m.name).join(', ')}`,
            timer: 3000
          })
          return prev
        }
        return prev.filter(c => c !== moduleCode)
      } else {
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
      Swal.fire({ icon: 'warning', text: 'Lütfen bir paket seçin' })
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
      Swal.fire({ icon: 'warning', text: 'Lütfen en az bir modül seçin' })
      return
    }
    setCurrentStep('users')
  }

  const handleUsersNext = () => setCurrentStep('storage')
  const handleStorageNext = () => setCurrentStep('addons')
  const handleAddOnsNext = () => setCurrentStep('industry')

  const handleIndustryNext = () => {
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
        ? { packageId: selectedPackageId }
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

      if (response.ok && responseData.success) {
        const data = responseData.data || responseData
        if (data.provisioningStarted && data.tenantId) {
          setSetupTenantId(data.tenantId)
          setShowProgressModal(true)
        } else {
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
        })
        setIsLoading(false)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: 'Kurulum sırasında bir hata oluştu',
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

  const getStepNumber = () => {
    if (packageType === 'ready') {
      switch (currentStep) {
        case 'package-type': return 1
        case 'package': return 2
        case 'complete': return 3
        default: return 1
      }
    } else {
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

  const getTotalSteps = () => packageType === 'ready' ? 3 : 7

  const showPriceSummary = packageType === 'custom' &&
    ['custom-package', 'users', 'storage', 'addons', 'industry'].includes(currentStep)

  // integrated into footer


  // --- Render ---

  return (
    <AnimatePresence>
      {open && !showProgressModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-h-[90vh] flex flex-col shadow-2xl rounded-3xl overflow-hidden ring-1 ring-black/5"
            style={{
              maxWidth: ['custom-package', 'addons', 'storage'].includes(currentStep) ? 1000 : 800
            }}
          >
            {/* Header Section */}
            <div className="px-8 pt-8 pb-4 flex-shrink-0 bg-white z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">Hesap Kurulumu</h1>
                  <p className="text-slate-500 text-sm">İşletmenizi yapılandırmak için adımları takip edin</p>
                </div>
                <button
                  onClick={onCancel}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Custom Stepper */}
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 rounded-full -translate-y-1/2" />
                <motion.div
                  className="absolute top-1/2 left-0 h-1 bg-slate-900 rounded-full -translate-y-1/2"
                  initial={false}
                  animate={{ width: `${(getStepNumber() / getTotalSteps()) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                <div className="relative flex justify-between">
                  {/* We can map generic steps or just use the bar for cleaner look. keeping it clean. */}
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-semibold text-slate-900">
                  Adım {getStepNumber()} <span className="text-slate-400 font-normal">/ {getTotalSteps()}</span>
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {currentStep === 'package-type' && 'Başlangıç'}
                  {currentStep === 'package' && 'Paket Seçimi'}
                  {currentStep === 'custom-package' && 'Modül Konfigürasyonu'}
                  {currentStep === 'users' && 'Kullanıcı Sayısı'}
                  {currentStep === 'storage' && 'Depolama Alanı'}
                  {currentStep === 'addons' && 'Ek Özellikler'}
                  {currentStep === 'industry' && 'Sektör Seçimi'}
                  {currentStep === 'complete' && 'Tamamlandı'}
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-4 min-h-[400px]">
              <AnimatePresence mode="wait">

                {/* PACKAGE TYPE */}
                {currentStep === 'package-type' && (
                  <motion.div
                    key="step-type"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col justify-center"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div
                        onClick={() => setPackageType('ready')}
                        className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${packageType === 'ready'
                          ? 'border-slate-900 bg-slate-50/50 shadow-xl shadow-slate-200/50'
                          : 'border-slate-100 hover:border-slate-300 hover:shadow-lg'
                          }`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${packageType === 'ready' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          }`}>
                          <Layers className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Hazır Paketler</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                          İhtiyacınıza uygun önceden hazırlanmış paketlerden birini seçin. Hızlı başlangıç için ideal.
                        </p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-600">STARTER</span>
                          <span className="px-2 py-1 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-600">PRO</span>
                        </div>
                        {packageType === 'ready' && <div className="absolute top-4 right-4 text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>}
                      </div>

                      <div
                        onClick={() => setPackageType('custom')}
                        className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${packageType === 'custom'
                          ? 'border-slate-900 bg-slate-50/50 shadow-xl shadow-slate-200/50'
                          : 'border-slate-100 hover:border-slate-300 hover:shadow-lg'
                          }`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${packageType === 'custom' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          }`}>
                          <Box className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Özel Paket Oluştur</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                          Sadece ihtiyacınız olan modülleri seçin, size özel fiyatlandırma ile tasarruf edin.
                        </p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-600">ESNEK</span>
                          <span className="px-2 py-1 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-600">EKONOMİK</span>
                        </div>
                        {packageType === 'custom' && <div className="absolute top-4 right-4 text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>}
                      </div>
                    </div>
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={handlePackageTypeNext}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                      >
                        Devam Et <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* READY PACKAGE LIST */}
                {currentStep === 'package' && (
                  <motion.div
                    key="step-package"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {loadingPackages ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-slate-300 mb-4" />
                        <p className="text-slate-400 font-medium">Paketler yükleniyor...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {packages.map((pkg) => (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedPackageId === pkg.id
                              ? 'border-slate-900 bg-slate-50 shadow-xl scale-[1.02]'
                              : 'border-slate-100 hover:border-slate-300 hover:shadow-lg'
                              }`}
                          >
                            <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                            <div className="mt-2 text-3xl font-bold text-slate-900">
                              ₺{pkg.basePrice.amount}<span className="text-sm font-normal text-slate-500">/ay</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-2 mb-4 line-clamp-2">{pkg.description}</p>

                            <div className="space-y-2 mb-4">
                              {pkg.modules.filter(m => m.isIncluded).slice(0, 5).map(m => (
                                <div key={m.moduleCode} className="flex items-center gap-2 text-sm text-slate-600">
                                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                  <span className="truncate">{m.moduleName}</span>
                                </div>
                              ))}
                              {pkg.modules.filter(m => m.isIncluded).length > 5 && (
                                <div className="text-xs text-slate-400 pl-6">+ {pkg.modules.filter(m => m.isIncluded).length - 5} diğer modül</div>
                              )}
                            </div>
                            {selectedPackageId === pkg.id && (
                              <div className="absolute top-4 right-4 text-emerald-500">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between pt-6">
                      <button onClick={() => setCurrentStep('package-type')} className="text-slate-500 hover:text-slate-800 font-medium px-4">Geri</button>
                      <button onClick={handlePackageNext} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all">
                        Seç ve Devam Et <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* CUSTOM MODULE CONFIG */}
                {currentStep === 'custom-package' && (
                  <motion.div
                    key="step-custom"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold text-slate-900">Modülleri Seçin</h2>
                      <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        {['monthly', 'annual'].map((cycle) => (
                          <button
                            key={cycle}
                            onClick={() => setBillingCycle(cycle as BillingCycle)}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${billingCycle === cycle
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                              }`}
                          >
                            {cycle === 'monthly' ? 'Aylık' : 'Yıllık %20 İndirim'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {loadingModules ? (
                      <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
                        {Object.entries(modulesByCategory).map(([category, catModules]) => (
                          <div key={category} className="col-span-full md:col-span-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">{category}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {catModules.map(module => {
                                const isSelected = selectedModuleCodes.includes(module.code)
                                return (
                                  <div
                                    key={module.id}
                                    onClick={() => !module.isCore && toggleModule(module.code)}
                                    className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected
                                      ? 'bg-slate-50 border-slate-900 shadow-md'
                                      : 'bg-white border-slate-100 hover:border-slate-300'
                                      } ${module.isCore ? 'opacity-80 pointer-events-none' : ''}`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-semibold text-slate-900">{module.name}</h4>
                                          {module.isCore && <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">TEMEL</span>}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{module.description}</p>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold text-slate-900">₺{module.monthlyPrice}</div>
                                        {/* Green circle removed */}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="fixed bottom-0 left-0 w-full p-4 pointer-events-none z-0">
                      {/* Spacer for fixed footer */}
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-auto border-t border-slate-100 bg-white">
                      <button onClick={() => setCurrentStep('package-type')} className="text-slate-500 hover:text-slate-800 font-medium px-4">Geri</button>

                      <div className="flex items-center gap-6">
                        {customPrice && (
                          <div className="text-right hidden sm:block">
                            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mb-0.5">{getBillingLabel()} Tutar</div>
                            <div className="text-xl font-bold text-slate-900 leading-none tracking-tight">
                              ₺{getCurrentPrice().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={handleCustomPackageNext}
                          className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                          Devam Et <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* GENERIC STEPS: USERS, STORAGE, ADDONS, INDUSTRY */}
                {['users', 'storage', 'addons', 'industry'].includes(currentStep) && (
                  <motion.div
                    key="step-generic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 pb-20"
                  >
                    {currentStep === 'users' && (
                      <div className="text-center py-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Kaç kişilik bir ekipsiniz?</h2>
                        <div className="flex items-center justify-center gap-6 mb-8">
                          <button onClick={() => setUserCount(c => Math.max(1, c - 1))} className="w-12 h-12 rounded-full border-2 border-slate-200 hover:border-slate-900 flex items-center justify-center text-2xl font-bold transition-colors">-</button>
                          <div className="text-center w-32">
                            <div className="text-5xl font-black text-slate-900 tracking-tighter">{userCount}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">KULLANICI</div>
                          </div>
                          <button onClick={() => setUserCount(c => c + 1)} className="w-12 h-12 rounded-full border-2 border-slate-200 hover:border-slate-900 flex items-center justify-center text-2xl font-bold transition-colors">+</button>
                        </div>
                      </div>
                    )}

                    {currentStep === 'storage' && setupOptions && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {setupOptions.storagePlans.map(plan => (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedStoragePlanCode(plan.code)}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all text-center ${selectedStoragePlanCode === plan.code
                              ? 'border-slate-900 bg-slate-50 shadow-lg'
                              : 'border-slate-100 hover:border-slate-300'
                              }`}
                          >
                            <Database className={`w-8 h-8 mx-auto mb-3 ${selectedStoragePlanCode === plan.code ? 'text-slate-900' : 'text-slate-300'}`} />
                            <h3 className="font-bold text-slate-900">{plan.name}</h3>
                            <div className="text-2xl font-bold text-slate-900 my-2">{plan.storageGB} GB</div>
                            <div className="text-sm text-slate-500 font-medium">₺{plan.monthlyPrice}/ay</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentStep === 'addons' && setupOptions && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {setupOptions.addOns.map(addon => (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddOn(addon.code)}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddOnCodes.includes(addon.code)
                              ? 'border-slate-900 bg-slate-50 shadow-lg'
                              : 'border-slate-100 hover:border-slate-300'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-bold text-slate-900">{addon.name}</div>
                              {/* Green circle removed */}
                            </div>
                            <p className="text-sm text-slate-500 mb-3">{addon.description}</p>
                            <div className="font-bold text-slate-900">₺{addon.monthlyPrice}/ay</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-6 mt-12 border-t border-slate-100">
                      <button onClick={() => setCurrentStep(currentStep === 'users' ? 'custom-package' : currentStep === 'storage' ? 'users' : currentStep === 'addons' ? 'storage' : 'addons')} className="text-slate-500 hover:text-slate-800 font-medium px-4">Geri</button>

                      <div className="flex items-center gap-6">
                        {customPrice && (
                          <div className="text-right hidden sm:block">
                            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide mb-0.5">{getBillingLabel()} Tutar</div>
                            <div className="text-xl font-bold text-slate-900 leading-none tracking-tight">
                              ₺{getCurrentPrice().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (currentStep === 'users') handleUsersNext();
                            else if (currentStep === 'storage') handleStorageNext();
                            else if (currentStep === 'addons') handleAddOnsNext();
                            else handleIndustryNext(); // Industry is simplified here or kept as is
                          }}
                          className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all"
                        >
                          {currentStep === 'industry' ? 'Tamamla' : 'Devam Et'} <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* COMPLETE STEP */}
                {currentStep === 'complete' && (
                  <motion.div
                    key="step-complete"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                      <Check className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Kurulum Başarılı!</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                      Hesabınız başarıyla oluşturuldu. Yönetim paneline yönlendiriliyorsunuz, lütfen bekleyin.
                    </p>
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>



          </motion.div>
        </motion.div>
      )}

      {/* Progress Modal (Keep original if it was good, or assume it works) */}
      {showProgressModal && setupTenantId && (
        <SetupProgressModal
          visible={showProgressModal}
          tenantId={setupTenantId}
          onComplete={() => {
            setShowProgressModal(false)
            onComplete()
          }}
          onError={(error) => {
            setShowProgressModal(false)
            Swal.fire({ icon: 'error', title: 'Hata', text: error })
            onComplete()
          }}
        />
      )}
    </AnimatePresence>
  )
}
