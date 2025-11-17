'use client';

import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, RocketOutlined, PhoneOutlined } from '@ant-design/icons';

interface Step1Props {
  onComplete: (data: { fullName: string; email: string; password: string; phone?: string }) => void;
  initialData?: { fullName?: string; email?: string; password?: string; phone?: string };
}

export default function Step1MinimumRegistration({ onComplete, initialData }: Step1Props) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    password: initialData?.password || '',
    phone: initialData?.phone || '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Turkish phone format: 5XX XXX XX XX (10 digits without 0)
    const phoneRegex = /^5\d{9}$/;
    const cleanedPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanedPhone);
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    // Apply Turkish phone format: 5XX XXX XX XX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // Auto-format phone number
    if (field === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      phone: '',
    };

    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad Soyad zorunludur';
      isValid = false;
    } else if (formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Lütfen ad ve soyadınızı girin';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta zorunludur';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Şifre zorunludur';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
      isValid = false;
    }

    // Phone is optional, but if provided, must be valid
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası girin (5XX XXX XX XX)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsLoading(false);
    onComplete(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4">
          <RocketOutlined className="text-3xl text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Hemen Başlayın
        </h2>
        <p className="text-lg text-gray-600">
          Sadece 3 zorunlu bilgi ile 30 saniyede başlayın
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Ad Soyad <span className="text-red-500">*</span>
          </label>
          <Input
            id="fullName"
            size="large"
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Ahmet Yılmaz"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            status={errors.fullName ? 'error' : ''}
            className="h-12"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            E-posta <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            size="large"
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="ornek@sirket.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            status={errors.email ? 'error' : ''}
            className="h-12"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Şifre <span className="text-red-500">*</span>
          </label>
          <Input.Password
            id="password"
            size="large"
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="En az 6 karakter"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            status={errors.password ? 'error' : ''}
            className="h-12"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefon <span className="text-gray-400 text-xs">(İsteğe bağlı)</span>
          </label>
          <Input
            id="phone"
            size="large"
            prefix={<PhoneOutlined className="text-gray-400" />}
            placeholder="5XX XXX XX XX"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            status={errors.phone ? 'error' : ''}
            className="h-12"
            maxLength={15}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
          {!errors.phone && formData.phone && (
            <p className="mt-1 text-xs text-gray-500">
              💡 Destek ekibimizle daha hızlı iletişim kurabilirsiniz
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          loading={isLoading}
          block
          className="btn-neon-green h-14 text-lg font-bold mt-6"
          icon={<RocketOutlined />}
        >
          Hesabımı Oluştur
        </Button>

        {/* Trust Indicators */}
        <div className="mt-6 flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>14 gün ücretsiz deneme - kredi kartı gerekmez</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>İstediğiniz zaman iptal edebilirsiniz</span>
          </div>
        </div>

        {/* Already have account */}
        <div className="text-center text-sm text-gray-600 mt-6">
          Zaten hesabınız var mı?{' '}
          <a href="/signin" className="text-purple-600 hover:text-purple-700 font-medium">
            Giriş Yapın
          </a>
        </div>
      </form>
    </div>
  );
}
