'use client'

import { useState, useEffect } from 'react'
import { Modal } from 'antd'
import { getApiUrl } from '@/lib/env'
import Swal from 'sweetalert2'

type SetupStep = 'package' | 'company' | 'complete'

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

interface SetupWizardModalProps {
  open: boolean
  onComplete: () => void
}

export default function SetupWizardModal({ open, onComplete }: SetupWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('package')
  const [isLoading, setIsLoading] = useState(false)

  // Package selection state
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')
  const [loadingPackages, setLoadingPackages] = useState(true)

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

  const loadPackages = async () => {
    try {
      setLoadingPackages(true)
      const apiUrl = getApiUrl(false) // Client-side: use public API URL
      console.log('📦 Loading packages from:', `${apiUrl}/api/public/packages`)

      const response = await fetch(`${apiUrl}/api/public/packages`)
      console.log('📦 Packages response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📦 Packages data:', data)

        if (data.success && data.data) {
          setPackages(data.data)
          console.log('✅ Loaded packages:', data.data.length)

          // Auto-select first package
          if (data.data.length > 0) {
            setSelectedPackageId(data.data[0].id)
          }
        } else {
          console.warn('⚠️ Invalid packages response format:', data)
        }
      } else {
        console.error('❌ Failed to load packages:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Failed to load packages:', error)
    } finally {
      setLoadingPackages(false)
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

  const handleCompanySubmit = async () => {
    // Validate required fields
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
      const apiUrl = getApiUrl(false) // Client-side: use NEXT_PUBLIC_API_URL
      const token = localStorage.getItem('token') // Token saved during registration
      console.log('🔧 Submitting setup to:', `${apiUrl}/api/setup/complete`)
      console.log('🔑 Token exists:', !!token)
      console.log('🔑 Token value (first 50 chars):', token?.substring(0, 50))

      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Oturum Hatası',
          text: 'Token bulunamadı. Lütfen tekrar giriş yapın.',
          confirmButtonText: 'Tamam'
        })
        setIsLoading(false)
        return
      }

      const response = await fetch(`${apiUrl}/api/setup/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: selectedPackageId,
          companyName,
          // companyCode removed - already set during registration
          sector,
          employeeCount,
          contactPhone,
          address,
          taxOffice,
          taxNumber
        }),
      })

      console.log('📊 Response status:', response.status, response.statusText)

      const data = await response.json()
      console.log('🔧 Setup response:', data)

      if (response.ok && data.success) {
        console.log('✅ Setup completed successfully')
        setCurrentStep('complete')

        // Call onComplete after 2 seconds
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        console.error('❌ Setup failed:', data)
        Swal.fire({
          icon: 'error',
          title: 'Kurulum Başarısız',
          text: data.message || 'Kurulum tamamlanamadı',
          confirmButtonText: 'Tamam'
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error('❌ Setup error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: 'Kurulum sırasında bir hata oluştu',
        confirmButtonText: 'Tamam'
      })
      setIsLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      maskClosable={false}
      keyboard={false}
      width={900}
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
            <div className={`flex items-center space-x-2 ${
              currentStep === 'package' ? 'text-blue-600' :
              currentStep === 'company' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'package' ? 'bg-blue-600 text-white' :
                currentStep === 'company' || currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="font-medium">Paket Seçimi</span>
            </div>

            <div className="w-12 h-0.5 bg-gray-300"></div>

            <div className={`flex items-center space-x-2 ${
              currentStep === 'company' ? 'text-blue-600' :
              currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'company' ? 'bg-blue-600 text-white' :
                currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium">Firma Bilgileri</span>
            </div>

            <div className="w-12 h-0.5 bg-gray-300"></div>

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
                      <div className="text-sm font-medium text-gray-900">Özellikler:</div>
                      <ul className="space-y-1">
                        {pkg.features.slice(0, 3).map((feature) => (
                          <li key={feature.featureCode} className="text-sm text-gray-600 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {feature.featureName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-6">
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

              {/* Firma Kodu kaldırıldı - zaten kayıt sırasında oluşturuldu */}

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
                onClick={() => setCurrentStep('package')}
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
