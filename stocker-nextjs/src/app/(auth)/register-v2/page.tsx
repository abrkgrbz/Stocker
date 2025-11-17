'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Steps } from 'antd';
import Step1MinimumRegistration from '@/components/register-v2/Step1MinimumRegistration';
import Step2Segmentation from '@/components/register-v2/Step2Segmentation';
import Step3AhaMoment from '@/components/register-v2/Step3AhaMoment';

interface RegistrationData {
  // Step 1
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  // Step 2
  useCases: string[];
  // Auto-generated
  companyCode?: string;
  packageId?: string;
}

export default function RegisterV2Page() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    useCases: [],
  });

  const handleStep1Complete = (data: { fullName: string; email: string; password: string; phone?: string }) => {
    // Auto-generate company code from email
    const emailPrefix = data.email.split('@')[0];
    const companyCode = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, '-');

    setRegistrationData(prev => ({
      ...prev,
      ...data,
      companyCode,
      packageId: 'free-trial', // Default to free trial
    }));

    // Move to segmentation
    setCurrentStep(2);
  };

  const handleStep2Complete = (data: { useCases: string[] }) => {
    setRegistrationData(prev => ({
      ...prev,
      useCases: data.useCases,
    }));

    // Move to Aha moment
    setCurrentStep(3);
  };

  const handleStep2Skip = () => {
    // Skip segmentation, go to Aha moment
    setCurrentStep(3);
  };

  const handleStep3Complete = async () => {
    // Here you would normally call your registration API
    console.log('Registration data:', registrationData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirect to app (or signin if backend registration needed)
    router.push('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Stocker</h1>
                <p className="text-xs text-gray-500">Modern Stok Yönetimi</p>
              </div>
            </div>

            {/* Progress Indicator */}
            {currentStep < 3 && (
              <div className="hidden md:block">
                <Steps
                  current={currentStep - 1}
                  size="small"
                  items={[
                    { title: 'Kayıt' },
                    { title: 'Tercihler' },
                    { title: 'Başlangıç' },
                  ]}
                  className="w-64"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {currentStep === 1 && (
              <Step1MinimumRegistration
                onComplete={handleStep1Complete}
                initialData={{
                  fullName: registrationData.fullName,
                  email: registrationData.email,
                  password: registrationData.password,
                  phone: registrationData.phone,
                }}
              />
            )}

            {currentStep === 2 && (
              <Step2Segmentation
                onComplete={handleStep2Complete}
                onSkip={handleStep2Skip}
                userName={registrationData.fullName}
              />
            )}

            {currentStep === 3 && (
              <Step3AhaMoment
                onComplete={handleStep3Complete}
                userName={registrationData.fullName}
              />
            )}
          </div>

          {/* Footer Info */}
          <div className="text-center mt-8 text-sm text-gray-600">
            <p>
              Kaydolarak{' '}
              <a href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                Kullanım Şartlarını
              </a>{' '}
              ve{' '}
              <a href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                Gizlilik Politikasını
              </a>{' '}
              kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}
