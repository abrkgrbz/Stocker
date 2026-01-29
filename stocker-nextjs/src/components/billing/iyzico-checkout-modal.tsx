'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, AlertCircle, ShieldCheck } from 'lucide-react';
import {
  billingService,
  IyzicoCheckoutRequest,
  IyzicoCheckoutResponse,
  IyzicoInstallmentOption,
} from '@/lib/api/services/billing.service';

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
        setError('Odeme formu olusturulamadi. Lutfen tekrar deneyin.');
      }
    } catch {
      setError('Bir hata olustu. Lutfen tekrar deneyin.');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {step === 'form' ? 'Odeme Bilgileri' : 'Guvenli Odeme'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' ? (
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                {packageName} - {formatPrice(price)}
              </span>
            ) : (
              '3D Secure ile guvenli odeme'
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'form' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Ad Soyad *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Adiniz Soyadiniz"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telefon</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+90 5XX XXX XX XX"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Fatura Adresi (Opsiyonel)</h4>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Sehir</Label>
                  <Input
                    id="city"
                    value={formData.billingAddress.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, city: e.target.value },
                      })
                    }
                    placeholder="Istanbul"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={formData.billingAddress.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, address: e.target.value },
                      })
                    }
                    placeholder="Mahalle, Cadde, Bina No"
                  />
                </div>
              </div>
            </div>

            {/* Installment Preview */}
            <div className="border-t pt-4">
              <Label htmlFor="cardBin">Taksit Secenekleri Icin Kart Numarasi</Label>
              <Input
                id="cardBin"
                value={cardBin}
                onChange={(e) => setCardBin(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="Ilk 6 hane"
                maxLength={6}
                className="mt-2"
              />

              {installments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label>Taksit Secenekleri</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {installments.map((opt) => (
                      <button
                        key={opt.installmentNumber}
                        type="button"
                        onClick={() => setSelectedInstallment(opt.installmentNumber)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedInstallment === opt.installmentNumber
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">
                          {opt.installmentNumber === 1 ? 'Tek Cekim' : `${opt.installmentNumber} Taksit`}
                        </div>
                        <div className="text-sm text-muted-foreground">
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
              <Button variant="outline" onClick={onClose} className="flex-1">
                Iptal
              </Button>
              <Button
                onClick={handleCreateCheckout}
                disabled={!formData.customerName || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yukleniyor...
                  </>
                ) : (
                  'Odemeye Devam Et'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'checkout' && checkoutData && (
          <div className="space-y-4">
            {/* Iyzico checkout form will be rendered here */}
            <div
              className="min-h-[400px]"
              dangerouslySetInnerHTML={{ __html: checkoutData.checkoutFormContent }}
            />

            <div className="text-center text-sm text-muted-foreground">
              <ShieldCheck className="inline-block h-4 w-4 mr-1 text-green-600" />
              Odemeniz Iyzico tarafindan guvenle islenmektedir
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Odeme isleniyor...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
