'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert } from '@/components/primitives/feedback/Alert';
import { Button } from '@/components/primitives/buttons/Button';
import {
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { billingService, IyzicoPaymentResult } from '@/lib/api/services/billing.service';

type PaymentStatus = 'loading' | 'success' | 'error';

export default function IyzicoCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [paymentResult, setPaymentResult] = useState<IyzicoPaymentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Ödeme token bilgisi bulunamadı');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await billingService.getIyzicoCheckoutResult(token);

        if (response.data?.success) {
          setPaymentResult(response.data);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(response.data?.errorMessage || 'Ödeme doğrulanamadı');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Ödeme sonucu alınırken bir hata oluştu');
        console.error('Payment verification error:', error);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/account/billing');
  };

  const handleRetry = () => {
    router.push('/account/billing');
  };

  const Spinner = () => (
    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="container max-w-lg mx-auto py-12">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-100">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <Spinner />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold text-slate-900">
            {status === 'loading' && 'Ödeme Doğrulanıyor...'}
            {status === 'success' && 'Ödeme Başarılı!'}
            {status === 'error' && 'Ödeme Başarısız'}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {status === 'loading' && 'Lütfen bekleyin, ödemeniz doğrulanıyor.'}
            {status === 'success' && 'Aboneliğiniz başarıyla aktif edildi.'}
            {status === 'error' && errorMessage}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {status === 'success' && paymentResult && (
            <>
              <Alert variant="success" title="Ödeme Detayları">
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Ödeme ID:</span>
                    <span className="font-mono">{paymentResult.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tutar:</span>
                    <span className="font-semibold">
                      {paymentResult.paidPrice?.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: paymentResult.currency || 'TRY'
                      })}
                    </span>
                  </div>
                  {paymentResult.installment && paymentResult.installment > 1 && (
                    <div className="flex justify-between">
                      <span>Taksit:</span>
                      <span>{paymentResult.installment} Taksit</span>
                    </div>
                  )}
                  {paymentResult.lastFourDigits && (
                    <div className="flex justify-between items-center">
                      <span>Kart:</span>
                      <span className="flex items-center gap-1">
                        <CreditCardIcon className="h-4 w-4" />
                        **** {paymentResult.lastFourDigits}
                      </span>
                    </div>
                  )}
                </div>
              </Alert>

              <Button onClick={handleContinue} fullWidth>
                Devam Et
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert variant="error" title="Hata">
                <div>
                  {errorMessage}
                  {paymentResult?.errorCode && (
                    <div className="mt-1 text-xs font-mono">
                      Hata Kodu: {paymentResult.errorCode}
                    </div>
                  )}
                </div>
              </Alert>

              <Button onClick={handleRetry} variant="secondary" fullWidth>
                Tekrar Dene
              </Button>
            </>
          )}

          {status === 'loading' && (
            <div className="text-center text-sm text-slate-500">
              Bu işlem birkaç saniye sürebilir...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
