'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Divider,
  Spin,
  Tabs,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  WalletOutlined,
  BankOutlined,
  CreditCardOutlined,
  DollarOutlined,
  SyncOutlined,
  ShopOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useCreateSupplierPayment, useSuppliers, usePurchaseInvoices } from '@/lib/api/hooks/usePurchase';
import { PaymentMethod, PurchaseInvoiceStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const typeOptions = [
  { value: 'Standard', label: 'Standart Ödeme' },
  { value: 'Advance', label: 'Avans' },
  { value: 'Partial', label: 'Kısmi Ödeme' },
  { value: 'Final', label: 'Son Ödeme' },
  { value: 'Refund', label: 'İade' },
];

const methodOptions = [
  { value: 'Cash', label: 'Nakit', icon: <DollarOutlined /> },
  { value: 'BankTransfer', label: 'Havale/EFT', icon: <BankOutlined /> },
  { value: 'CreditCard', label: 'Kredi Kartı', icon: <CreditCardOutlined /> },
  { value: 'Check', label: 'Çek', icon: <WalletOutlined /> },
  { value: 'DirectDebit', label: 'Otomatik Ödeme', icon: <SyncOutlined /> },
  { value: 'Other', label: 'Diğer', icon: <WalletOutlined /> },
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
    <div className="min-h-screen bg-gray-50/30">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}
              >
                <WalletOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Yeni Tedarikçi Ödemesi
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  Tedarikçiye ödeme kaydı oluşturun
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={isLoading}
              className="px-6"
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <Spin spinning={isLoading}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
              <Row gutter={48}>
                {/* Left Panel - Visual & Summary */}
                <Col xs={24} lg={10}>
                  {/* Visual Representation */}
                  <div className="mb-8">
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        borderRadius: '16px',
                        padding: '40px 20px',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <WalletOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
                      <p className="mt-4 text-lg font-medium text-white/90">
                        Tedarikçi Ödemesi
                      </p>
                      <p className="text-sm text-white/60">
                        Ödeme detaylarını kaydedin
                      </p>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gray-50/50 rounded-xl p-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Ödeme Tutarı</span>
                        <span className="font-semibold text-cyan-600 text-lg">
                          {paymentAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      </div>
                      {selectedInvoice && (
                        <>
                          <Divider className="my-2" />
                          <div className="flex justify-between text-gray-600 text-sm">
                            <span>Fatura Toplamı</span>
                            <span>{selectedInvoice.totalAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                          </div>
                          <div className="flex justify-between text-gray-600 text-sm">
                            <span>Ödenen</span>
                            <span className="text-green-600">{selectedInvoice.paidAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                          </div>
                          <div className="flex justify-between text-gray-600 text-sm">
                            <span>Kalan Borç</span>
                            <span className="text-red-500">{selectedInvoice.remainingAmount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-cyan-50/50 rounded-xl text-center">
                      <div className="text-sm font-semibold text-cyan-600 truncate">
                        {methodOptions.find(m => m.value === selectedMethod)?.label || '-'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Ödeme Yöntemi</div>
                    </div>
                    <div className="p-4 bg-green-50/50 rounded-xl text-center">
                      <div className="text-sm font-semibold text-green-600 truncate">
                        {selectedCurrency}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Para Birimi</div>
                    </div>
                  </div>

                  {/* Currency Settings */}
                  <div className="mt-6 space-y-4">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <DollarOutlined className="mr-1" />
                      Para Birimi
                    </div>
                    <div className="bg-gray-50/50 rounded-xl p-4 space-y-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Para Birimi</div>
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
                          <div className="text-xs text-gray-400 mb-1">Döviz Kuru</div>
                          <Form.Item name="exchangeRate" className="mb-0">
                            <InputNumber min={0} step={0.0001} className="w-full" placeholder="1.00" variant="filled" />
                          </Form.Item>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="mt-6 p-4 bg-blue-50/50 rounded-xl">
                    <div className="text-xs text-gray-600 space-y-2">
                      <p>• Ödeme kaydedildikten sonra onay sürecine gönderilecektir.</p>
                      <p>• Onaylanan ödemeler işlendikten sonra tamamlanmış olarak işaretlenebilir.</p>
                    </div>
                  </div>
                </Col>

                {/* Right Panel - Form Content */}
                <Col xs={24} lg={14}>
                  <Tabs
                    defaultActiveKey="basic"
                    items={[
                      {
                        key: 'basic',
                        label: (
                          <span>
                            <ShopOutlined className="mr-1" />
                            Ödeme Bilgileri
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Tedarikçi *</div>
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
                              </Col>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">İlişkili Fatura</div>
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
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={8}>
                                <div className="text-xs text-gray-400 mb-1">Ödeme Tarihi *</div>
                                <Form.Item
                                  name="paymentDate"
                                  rules={[{ required: true, message: 'Tarih seçin' }]}
                                  className="mb-0"
                                >
                                  <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <div className="text-xs text-gray-400 mb-1">Ödeme Tipi</div>
                                <Form.Item name="type" className="mb-0">
                                  <Select variant="filled">
                                    {typeOptions.map(opt => (
                                      <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <div className="text-xs text-gray-400 mb-1">Ödeme Yöntemi</div>
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
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Ödeme Tutarı *</div>
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
                              </Col>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Referans No</div>
                                <Form.Item name="referenceNumber" className="mb-0">
                                  <Input placeholder="Ödeme referans numarası" variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                      {
                        key: 'bank',
                        label: (
                          <span>
                            <BankOutlined className="mr-1" />
                            Banka Bilgileri
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            {showBankFields ? (
                              <>
                                <Row gutter={16}>
                                  <Col span={12}>
                                    <div className="text-xs text-gray-400 mb-1">Banka Adı</div>
                                    <Form.Item name="bankName" className="mb-0">
                                      <Input placeholder="Banka adı" variant="filled" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <div className="text-xs text-gray-400 mb-1">Hesap No</div>
                                    <Form.Item name="bankAccountNumber" className="mb-0">
                                      <Input placeholder="Hesap numarası" variant="filled" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Row gutter={16}>
                                  <Col span={24}>
                                    <div className="text-xs text-gray-400 mb-1">IBAN</div>
                                    <Form.Item name="iban" className="mb-0">
                                      <Input placeholder="TR00 0000 0000 0000 0000 0000 00" variant="filled" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Row gutter={16}>
                                  <Col span={12}>
                                    <div className="text-xs text-gray-400 mb-1">SWIFT Kodu</div>
                                    <Form.Item name="swiftCode" className="mb-0">
                                      <Input placeholder="SWIFT kodu" variant="filled" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </>
                            ) : showCheckFields ? (
                              <>
                                <Row gutter={16}>
                                  <Col span={12}>
                                    <div className="text-xs text-gray-400 mb-1">Çek No</div>
                                    <Form.Item name="checkNumber" className="mb-0">
                                      <Input placeholder="Çek numarası" variant="filled" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <div className="text-xs text-gray-400 mb-1">Çek Tarihi</div>
                                    <Form.Item name="checkDate" className="mb-0">
                                      <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Row gutter={16}>
                                  <Col span={12}>
                                    <div className="text-xs text-gray-400 mb-1">Banka</div>
                                    <Form.Item name="bankName" className="mb-0">
                                      <Input placeholder="Çekin bankası" variant="filled" />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </>
                            ) : (
                              <div className="text-center text-gray-400 py-8">
                                Seçilen ödeme yöntemi için banka bilgisi gerekli değil.
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        key: 'notes',
                        label: (
                          <span>
                            <FileTextOutlined className="mr-1" />
                            Notlar
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-gray-400 mb-1">Açıklama</div>
                                <Form.Item name="description" className="mb-0">
                                  <TextArea rows={2} placeholder="Ödeme açıklaması..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-gray-400 mb-1">Genel Not</div>
                                <Form.Item name="notes" className="mb-0">
                                  <TextArea rows={2} placeholder="Genel notlar..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-gray-400 mb-1">Dahili Not</div>
                                <Form.Item name="internalNotes" className="mb-0">
                                  <TextArea rows={2} placeholder="Dahili not (müşteriye gösterilmez)..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                    ]}
                  />
                </Col>
              </Row>
            </Form>
          </div>
        </Spin>
      </div>
    </div>
  );
}
