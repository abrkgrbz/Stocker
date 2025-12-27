'use client';

/**
 * New Supplier Payment Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Spin,
  Tabs,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  WalletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCreateSupplierPayment, useSuppliers, usePurchaseInvoices } from '@/lib/api/hooks/usePurchase';
import { PaymentMethod, PurchaseInvoiceStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const typeOptions = [
  { value: 'Standard', label: 'Standart Ödeme' },
  { value: 'Advance', label: 'Avans' },
  { value: 'Partial', label: 'Kısmi Ödeme' },
  { value: 'Final', label: 'Son Ödeme' },
  { value: 'Refund', label: 'İade' },
];

const methodOptions = [
  { value: 'Cash', label: 'Nakit', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
  { value: 'BankTransfer', label: 'Havale/EFT', icon: <BuildingLibraryIcon className="w-4 h-4" /> },
  { value: 'CreditCard', label: 'Kredi Kartı', icon: <CreditCardIcon className="w-4 h-4" /> },
  { value: 'Check', label: 'Çek', icon: <WalletIcon className="w-4 h-4" /> },
  { value: 'DirectDebit', label: 'Otomatik Ödeme', icon: <ArrowPathIcon className="w-4 h-4" /> },
  { value: 'Other', label: 'Diğer', icon: <WalletIcon className="w-4 h-4" /> },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

export default function NewSupplierPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const [form] = Form.useForm();

  const createPayment = useCreateSupplierPayment();
  const { data: suppliersData } = useSuppliers({ pageSize: 1000 });
  const { data: invoicesData } = usePurchaseInvoices({ pageSize: 1000, status: PurchaseInvoiceStatus.Approved });

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.BankTransfer);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const suppliers = suppliersData?.items || [];
  const invoices = invoicesData?.items || [];

  useEffect(() => {
    if (invoiceId) {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setPaymentAmount(invoice.remainingAmount);
        const supplier = suppliers.find(s => s.name === invoice.supplierName);
        form.setFieldsValue({
          supplierId: supplier?.id,
          purchaseInvoiceId: invoiceId,
          amount: invoice.remainingAmount,
        });
      }
    }
  }, [invoiceId, invoices, suppliers, form]);

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setPaymentAmount(invoice.remainingAmount);
      const supplier = suppliers.find(s => s.name === invoice.supplierName);
      form.setFieldsValue({
        supplierId: supplier?.id,
        amount: invoice.remainingAmount,
      });
    } else {
      setSelectedInvoice(null);
    }
  };

  const handleSave = async (values: any) => {
    try {
      await createPayment.mutateAsync({
        ...values,
        paymentDate: values.paymentDate?.toISOString(),
        checkDate: values.checkDate?.toISOString(),
        currency: selectedCurrency,
        method: selectedMethod,
      });
      router.push('/purchase/payments');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/payments');
  };

  const isLoading = createPayment.isPending;
  const showBankFields = ['BankTransfer', 'DirectDebit'].includes(selectedMethod);
  const showCheckFields = selectedMethod === 'Check';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Yeni Tedarikçi Ödemesi
                </h1>
                <p className="text-sm text-slate-500">
                  Tedarikçiye ödeme kaydı oluşturun
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Spin spinning={isLoading}>
          <div className="bg-white border border-slate-200 rounded-xl p-8">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                paymentDate: dayjs(),
                type: 'Standard',
                method: 'BankTransfer',
                currency: 'TRY',
                exchangeRate: 1,
                amount: 0,
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel - Summary */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Visual Representation */}
                  <div className="bg-slate-900 rounded-xl p-8 text-center">
                    <WalletIcon className="w-16 h-16 text-white/80 mx-auto" />
                    <p className="mt-4 text-lg font-medium text-white/90">
                      Tedarikçi Ödemesi
                    </p>
                    <p className="text-sm text-white/60">
                      Ödeme detaylarını kaydedin
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>Ödeme Tutarı</span>
                      <span className="font-semibold text-slate-900 text-lg">
                        {paymentAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </span>
                    </div>
                    {selectedInvoice && (
                      <>
                        <div className="h-px bg-slate-200 my-2" />
                        <div className="flex justify-between text-slate-600 text-sm">
                          <span>Fatura Toplamı</span>
                          <span>{selectedInvoice.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-sm">
                          <span>Ödenen</span>
                          <span className="text-emerald-600">{selectedInvoice.paidAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-sm">
                          <span>Kalan Borç</span>
                          <span className="text-red-500">{selectedInvoice.remainingAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {methodOptions.find(m => m.value === selectedMethod)?.label || '-'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Ödeme Yöntemi</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {selectedCurrency}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Para Birimi</div>
                    </div>
                  </div>

                  {/* Currency Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      Para Birimi
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Para Birimi</div>
                        <Form.Item name="currency" className="mb-0">
                          <Select onChange={(value) => setSelectedCurrency(value)} variant="filled">
                            {currencyOptions.map(opt => (
                              <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                      {selectedCurrency !== 'TRY' && (
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Döviz Kuru</div>
                          <Form.Item name="exchangeRate" className="mb-0">
                            <InputNumber min={0} step={0.0001} className="w-full" placeholder="1.00" variant="filled" />
                          </Form.Item>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="text-xs text-slate-600 space-y-2">
                      <p>• Ödeme kaydedildikten sonra onay sürecine gönderilecektir.</p>
                      <p>• Onaylanan ödemeler işlendikten sonra tamamlanmış olarak işaretlenebilir.</p>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Form Content */}
                <div className="lg:col-span-8">
                  <Tabs
                    defaultActiveKey="basic"
                    className="[&_.ant-tabs-nav]:mb-6"
                    items={[
                      {
                        key: 'basic',
                        label: (
                          <span className="flex items-center gap-2">
                            <BuildingStorefrontIcon className="w-4 h-4" />
                            Ödeme Bilgileri
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Tedarikçi *</div>
                                <Form.Item
                                  name="supplierId"
                                  rules={[{ required: true, message: 'Tedarikçi seçin' }]}
                                  className="mb-0"
                                >
                                  <Select
                                    placeholder="Tedarikçi seçin"
                                    showSearch
                                    optionFilterProp="children"
                                    variant="filled"
                                  >
                                    {suppliers.map(supplier => (
                                      <Select.Option key={supplier.id} value={supplier.id}>
                                        {supplier.code} - {supplier.name}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </div>
                              <div>
                                <div className="text-xs text-slate-400 mb-1">İlişkili Fatura</div>
                                <Form.Item name="purchaseInvoiceId" className="mb-0">
                                  <Select
                                    placeholder="Fatura seçin (opsiyonel)"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    onChange={handleInvoiceSelect}
                                    variant="filled"
                                  >
                                    {invoices.map(invoice => (
                                      <Select.Option key={invoice.id} value={invoice.id}>
                                        {invoice.invoiceNumber} - {invoice.remainingAmount?.toLocaleString('tr-TR')} ₺
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Ödeme Tarihi *</div>
                                <Form.Item
                                  name="paymentDate"
                                  rules={[{ required: true, message: 'Tarih seçin' }]}
                                  className="mb-0"
                                >
                                  <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                                </Form.Item>
                              </div>
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Ödeme Tipi</div>
                                <Form.Item name="type" className="mb-0">
                                  <Select variant="filled">
                                    {typeOptions.map(opt => (
                                      <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </div>
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Ödeme Yöntemi</div>
                                <Form.Item name="method" className="mb-0">
                                  <Select onChange={(value) => setSelectedMethod(value)} variant="filled">
                                    {methodOptions.map(opt => (
                                      <Select.Option key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">
                                          {opt.icon} {opt.label}
                                        </span>
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Ödeme Tutarı *</div>
                                <Form.Item
                                  name="amount"
                                  rules={[{ required: true, message: 'Tutar girin' }]}
                                  className="mb-0"
                                >
                                  <InputNumber
                                    min={0}
                                    step={0.01}
                                    className="w-full"
                                    placeholder="0.00"
                                    variant="filled"
                                    onChange={(val) => setPaymentAmount(val || 0)}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  />
                                </Form.Item>
                              </div>
                              <div>
                                <div className="text-xs text-slate-400 mb-1">Referans No</div>
                                <Form.Item name="referenceNumber" className="mb-0">
                                  <Input placeholder="Ödeme referans numarası" variant="filled" />
                                </Form.Item>
                              </div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: 'bank',
                        label: (
                          <span className="flex items-center gap-2">
                            <BuildingLibraryIcon className="w-4 h-4" />
                            Banka Bilgileri
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            {showBankFields ? (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Banka Adı</div>
                                    <Form.Item name="bankName" className="mb-0">
                                      <Input placeholder="Banka adı" variant="filled" />
                                    </Form.Item>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Hesap No</div>
                                    <Form.Item name="bankAccountNumber" className="mb-0">
                                      <Input placeholder="Hesap numarası" variant="filled" />
                                    </Form.Item>
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-400 mb-1">IBAN</div>
                                  <Form.Item name="iban" className="mb-0">
                                    <Input placeholder="TR00 0000 0000 0000 0000 0000 00" variant="filled" />
                                  </Form.Item>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">SWIFT Kodu</div>
                                    <Form.Item name="swiftCode" className="mb-0">
                                      <Input placeholder="SWIFT kodu" variant="filled" />
                                    </Form.Item>
                                  </div>
                                </div>
                              </>
                            ) : showCheckFields ? (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Çek No</div>
                                    <Form.Item name="checkNumber" className="mb-0">
                                      <Input placeholder="Çek numarası" variant="filled" />
                                    </Form.Item>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Çek Tarihi</div>
                                    <Form.Item name="checkDate" className="mb-0">
                                      <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                                    </Form.Item>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-slate-400 mb-1">Banka</div>
                                    <Form.Item name="bankName" className="mb-0">
                                      <Input placeholder="Çekin bankası" variant="filled" />
                                    </Form.Item>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-center text-slate-400 py-8">
                                Seçilen ödeme yöntemi için banka bilgisi gerekli değil.
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        key: 'notes',
                        label: (
                          <span className="flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4" />
                            Notlar
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <div>
                              <div className="text-xs text-slate-400 mb-1">Açıklama</div>
                              <Form.Item name="description" className="mb-0">
                                <TextArea rows={2} placeholder="Ödeme açıklaması..." variant="filled" />
                              </Form.Item>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 mb-1">Genel Not</div>
                              <Form.Item name="notes" className="mb-0">
                                <TextArea rows={2} placeholder="Genel notlar..." variant="filled" />
                              </Form.Item>
                            </div>
                            <div>
                              <div className="text-xs text-slate-400 mb-1">Dahili Not</div>
                              <Form.Item name="internalNotes" className="mb-0">
                                <TextArea rows={2} placeholder="Dahili not (müşteriye gösterilmez)..." variant="filled" />
                              </Form.Item>
                            </div>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
            </Form>
          </div>
        </Spin>
      </div>
    </div>
  );
}
