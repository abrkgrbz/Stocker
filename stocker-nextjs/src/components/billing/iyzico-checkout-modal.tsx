'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Modal } from '@/components/primitives/overlay/Modal';
import { Button } from '@/components/primitives/buttons/Button';
import { Alert } from '@/components/primitives/feedback/Alert';
import { CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  billingService,
  IyzicoCheckoutRequest,
  IyzicoCheckoutResponse,
  IyzicoInstallmentOption,
} from '@/lib/api/services/billing.service';
import { cn } from '@/lib/cn';

interface IyzicoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  packageName: string;
  price: number;
  currency?: string;
  onSuccess?: () => void;
}

export function IyzicoCheckoutModal({
  isOpen,
  onClose,
  packageId,
  packageName,
  price,
  currency = 'TRY',
  onSuccess,
}: IyzicoCheckoutModalProps) {
  const [step, setStep] = useState<'form' | 'checkout' | 'loading'>('form');
  const [checkoutData, setCheckoutData] = useState<IyzicoCheckoutResponse | null>(null);
  const [installments, setInstallments] = useState<IyzicoInstallmentOption[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    billingAddress: {
      contactName: '',
      city: '',
      address: '',
      zipCode: '',
    },
  });

  const [cardBin, setCardBin] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('form');
      setCheckoutData(null);
      setError('');
      setInstallments([]);
      setSelectedInstallment(1);
    }
  }, [isOpen]);

  // Fetch installment options when card BIN changes
  const fetchInstallments = useCallback(async (bin: string) => {
    if (bin.length < 6) {
      setInstallments([]);
      return;
    }

    try {
      const response = await billingService.getIyzicoInstallments(bin.substring(0, 6), price);
      if (response.data?.success && response.data.installmentOptions) {
        setInstallments(response.data.installmentOptions);
      }
    } catch {
      console.error('Failed to fetch installments');
    }
  }, [price]);

  useEffect(() => {
    if (cardBin.length >= 6) {
      fetchInstallments(cardBin);
    }
  }, [cardBin, fetchInstallments]);

  const handleCreateCheckout = async () => {
    setIsLoading(true);
    setError('');

    try {
      const request: IyzicoCheckoutRequest = {
        packageId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        enableInstallment: true,
        billingAddress: formData.billingAddress.address ? {
          contactName: formData.billingAddress.contactName || formData.customerName,
          city: formData.billingAddress.city,
          address: formData.billingAddress.address,
          zipCode: formData.billingAddress.zipCode,
          country: 'Turkey',
        } : undefined,
      };

      const response = await billingService.createIyzicoCheckout(request);

      if (response.data?.success) {
        setCheckoutData(response.data);
        setStep('checkout');
      } else {
        setError('Ödeme formu oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('tr-TR', {
      style: 'currency',
      currency,
    });
  };

  const renderFormContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="customerName" className="block text-sm font-medium text-slate-700">
          Ad Soyad *
        </label>
        <input
          id="customerName"
          type="text"
          value={formData.customerName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, customerName: e.target.value })}
          placeholder="Adınız Soyadınız"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-700">
          Telefon
        </label>
        <input
          id="customerPhone"
          type="tel"
          value={formData.customerPhone}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, customerPhone: e.target.value })}
          placeholder="+90 5XX XXX XX XX"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3 text-slate-900">Fatura Adresi (Opsiyonel)</h4>

        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-slate-700">
              Şehir
            </label>
            <input
              id="city"
              type="text"
              value={formData.billingAddress.city}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  billingAddress: { ...formData.billingAddress, city: e.target.value },
                })
              }
              placeholder="İstanbul"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
              Adres
            </label>
            <input
              id="address"
              type="text"
              value={formData.billingAddress.address}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  billingAddress: { ...formData.billingAddress, address: e.target.value },
                })
              }
              placeholder="Mahalle, Cadde, Bina No"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Installment Preview */}
      <div className="border-t pt-4">
        <label htmlFor="cardBin" className="block text-sm font-medium text-slate-700">
          Taksit Seçenekleri İçin Kart Numarası
        </label>
        <input
          id="cardBin"
          type="text"
          value={cardBin}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCardBin(e.target.value.replace(/\D/g, '').substring(0, 6))}
          placeholder="İlk 6 hane"
          maxLength={6}
          className="w-full px-3 py-2 mt-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />

        {installments.length > 0 && (
          <div className="mt-3 space-y-2">
            <span className="block text-sm font-medium text-slate-700">Taksit Seçenekleri</span>
            <div className="grid grid-cols-2 gap-2">
              {installments.map((opt) => (
                <button
                  key={opt.installmentNumber}
                  type="button"
                  onClick={() => setSelectedInstallment(opt.installmentNumber)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-colors',
                    selectedInstallment === opt.installmentNumber
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="font-medium text-slate-900">
                    {opt.installmentNumber === 1 ? 'Tek Çekim' : `${opt.installmentNumber} Taksit`}
                  </div>
                  <div className="text-sm text-slate-500">
                    {opt.installmentNumber === 1
                      ? formatPrice(opt.totalPrice)
                      : `${formatPrice(opt.installmentPrice)} x ${opt.installmentNumber}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={onClose} fullWidth>
          İptal
        </Button>
        <Button
          onClick={handleCreateCheckout}
          disabled={!formData.customerName || isLoading}
          loading={isLoading}
          fullWidth
        >
          Ödemeye Devam Et
        </Button>
      </div>
    </div>
  );

  const renderCheckoutContent = () => (
    <div className="space-y-4">
      {/* Iyzico checkout form will be rendered here */}
      <div
        className="min-h-[400px]"
        dangerouslySetInnerHTML={{ __html: checkoutData?.checkoutFormContent || '' }}
      />

      <div className="text-center text-sm text-slate-500">
        <ShieldCheckIcon className="inline-block h-4 w-4 mr-1 text-emerald-600" />
        Ödemeniz Iyzico tarafından güvenle işlenmektedir
      </div>
    </div>
  );

  const renderLoadingContent = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <svg className="animate-spin h-8 w-8 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="mt-4 text-sm text-slate-500">Ödeme işleniyor...</p>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        step === 'form' ? 'Ödeme Bilgileri' : 'Güvenli Ödeme'
      }
      description={
        step === 'form'
          ? `${packageName} - ${formatPrice(price)}`
          : '3D Secure ile güvenli ödeme'
      }
      size="lg"
    >
      {error && (
        <Alert variant="error" title="Hata" message={error} className="mb-4" />
      )}

      {step === 'form' && renderFormContent()}
      {step === 'checkout' && checkoutData && renderCheckoutContent()}
      {step === 'loading' && renderLoadingContent()}
    </Modal>
  );
}
