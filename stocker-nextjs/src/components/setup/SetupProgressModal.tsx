'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  TableProperties,
  HardDriveUpload,
  Settings,
  ShieldCheck,
  Rocket,
  AlertCircle
} from 'lucide-react'
import { useSetupProgress, SetupStep } from '@/lib/hooks/use-setup-progress'

interface SetupProgressModalProps {
  visible: boolean
  tenantId: string
  onComplete?: () => void
  onError?: (error: string) => void
  redirectUrl?: string
}

interface StepConfig {
  title: string
  description: string
  icon: React.ReactNode
}

const stepConfigs: Record<SetupStep, StepConfig> = {
  initializing: {
    title: 'Başlatılıyor',
    description: 'Kurulum hazırlanıyor...',
    icon: <Loader2 className="w-5 h-5 animate-spin" />,
  },
  'creating-database': {
    title: 'Veritabanı',
    description: 'Veritabanı oluşturuluyor...',
    icon: <Database className="w-5 h-5" />,
  },
  'running-migrations': {
    title: 'Tablolar',
    description: 'Tablolar oluşturuluyor...',
    icon: <TableProperties className="w-5 h-5" />,
  },
  'seeding-data': {
    title: 'Veriler',
    description: 'Temel veriler yükleniyor...',
    icon: <HardDriveUpload className="w-5 h-5" />,
  },
  'configuring-modules': {
    title: 'Modüller',
    description: 'Modüller yapılandırılıyor...',
    icon: <Settings className="w-5 h-5" />,
  },
  'creating-storage': {
    title: 'Depolama',
    description: 'Depolama alanı hazırlanıyor...',
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  'activating-tenant': {
    title: 'Aktivasyon',
    description: 'Hesap aktifleştiriliyor...',
    icon: <Rocket className="w-5 h-5" />,
  },
  completed: {
    title: 'Tamamlandı',
    description: 'Kurulum başarıyla tamamlandı!',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  failed: {
    title: 'Hata',
    description: 'Kurulum sırasında bir hata oluştu',
    icon: <XCircle className="w-5 h-5" />,
  },
}

const stepOrder: SetupStep[] = [
  'initializing',
  'creating-database',
  'running-migrations',
  'seeding-data',
  'configuring-modules',
  'activating-tenant',
  'completed',
]

export default function SetupProgressModal({
  visible,
  tenantId,
  onComplete,
  onError,
  redirectUrl = '/dashboard',
}: SetupProgressModalProps) {
  const [hasConnected, setHasConnected] = useState(false)

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    } else {
      window.location.href = redirectUrl
    }
  }

  const {
    progress,
    currentStep,
    isConnected,
    isCompleted,
    hasError,
    errorMessage,
    connect,
  } = useSetupProgress({
    tenantId,
    onComplete: handleComplete,
    onError,
    autoRedirectDelay: 2000,
  })

  useEffect(() => {
    if (visible && tenantId && !hasConnected) {
      connect()
        .then(() => setHasConnected(true))
        .catch((err) => {
          console.error('Failed to connect to setup progress:', err)
        })
    }
  }, [visible, tenantId, hasConnected, connect])

  const getCurrentStepIndex = () => {
    const index = stepOrder.indexOf(currentStep)
    return index >= 0 ? index : 0
  }

  const currentConfig = stepConfigs[currentStep] || stepConfigs['initializing']
  const progressPercent = progress?.progressPercentage || 0

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-lg shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5"
          >
            {/* Result Views */}
            {hasError ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Kurulum Başarısız</h2>
                <p className="text-slate-500 mb-6">{errorMessage || 'Beklenmedik bir hata oluştu.'}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">Tekrar Dene</button>
                  <button onClick={() => window.open('mailto:destek@stoocker.app')} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">Destek Al</button>
                </div>
              </div>
            ) : isCompleted ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Hesabınız Hazır!</h2>
                <p className="text-slate-500 mb-2">Kurulum başarıyla tamamlandı.</p>
                <p className="text-sm text-slate-400 animate-pulse">Yönlendiriliyorsunuz...</p>
              </div>
            ) : (
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-slate-900 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-slate-900">
                      <Rocket className="w-6 h-6" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Hesabınız Hazırlanıyor</h2>
                  <p className="text-sm text-slate-500 mt-1">Bu işlem birkaç dakika sürebilir, lütfen bekleyin...</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs font-medium text-slate-900 mb-2">
                    <span>{Math.round(progressPercent)}%</span>
                    <span>{currentConfig.title}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-slate-900 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ ease: "linear" }}
                    />
                  </div>
                </div>

                {/* Current Active Step Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                    {currentConfig.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{currentConfig.title}</div>
                    <div className="text-xs text-slate-500">{progress?.message || currentConfig.description}</div>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                    {isConnected ? 'Bağlantı Aktif' : 'Bağlanıyor...'}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
