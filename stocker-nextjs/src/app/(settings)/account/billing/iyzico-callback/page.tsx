'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
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
      setErrorMessage('Odeme token bilgisi bulunamadi');
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
          setErrorMessage(response.data?.errorMessage || 'Odeme dogrulanamadi');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Odeme sonucu alinirken bir hata olustu');
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

  return (
    <div className="container max-w-lg mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>

          <CardTitle className="text-xl">
            {status === 'loading' && 'Odeme Dogrulaniyor...'}
            {status === 'success' && 'Odeme Basarili!'}
            {status === 'error' && 'Odeme Basarisiz'}
          </CardTitle>

          <CardDescription>
            {status === 'loading' && 'Lutfen bekleyin, odemeniz dogrulaniyor.'}
            {status === 'success' && 'Aboneliginiz basariyla aktif edildi.'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && paymentResult && (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Odeme Detaylari</AlertTitle>
                <AlertDescription className="text-green-700">
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Odeme ID:</span>
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
                          <CreditCard className="h-4 w-4" />
                          **** {paymentResult.lastFourDigits}
                        </span>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <Button onClick={handleContinue} className="w-full">
                Devam Et
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                  {paymentResult?.errorCode && (
                    <div className="mt-1 text-xs font-mono">
                      Hata Kodu: {paymentResult.errorCode}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <Button onClick={handleRetry} variant="outline" className="w-full">
                Tekrar Dene
              </Button>
            </>
          )}

          {status === 'loading' && (
            <div className="text-center text-sm text-muted-foreground">
              Bu islem birkaç saniye sürebilir...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
