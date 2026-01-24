'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Table,
  Tooltip,
  Empty,
  Switch,
} from 'antd';
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { Customer } from '@/lib/api/services/crm.service';
import type { ProductDto } from '@/lib/api/services/inventory.types';
import type { Invoice } from '@/lib/api/services/invoice.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface InvoiceItem {
  key: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  description?: string;
}

interface InvoiceFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Invoice;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

const typeOptions = [
  { value: 'Sales', label: 'Satış Faturası' },
  { value: 'Return', label: 'İade Faturası' },
  { value: 'Credit', label: 'Alacak Dekontu' },
  { value: 'Debit', label: 'Borç Dekontu' },
];

const vatOptions = [
  { value: 0, label: '%0' },
  { value: 1, label: '%1' },
  { value: 8, label: '%8' },
  { value: 10, label: '%10' },
  { value: 18, label: '%18' },
  { value: 20, label: '%20' },
];

const unitOptions = [
  { value: 'Adet', label: 'Adet' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Lt', label: 'Lt' },
  { value: 'M', label: 'M' },
  { value: 'M2', label: 'M²' },
  { value: 'Paket', label: 'Paket' },
  { value: 'Kutu', label: 'Kutu' },
];

export default function InvoiceForm({ form, initialValues, onFinish, loading }: InvoiceFormProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [isEInvoice, setIsEInvoice] = useState(false);

  // Fetch customers
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    searchTerm: customerSearch,
    status: 'Active',
    pageSize: 50,
  });

  // Fetch products for selection
  const { data: productsData, isLoading: productsLoading } = useProducts(false);

  const customerOptions = useMemo(() =>
    customersData?.items?.map((customer: Customer) => ({
      value: customer.id.toString(),
      label: customer.companyName || customer.contactPerson,
      customer,
    })) || [], [customersData]);

  const productOptions = useMemo(() =>
    (productsData || []).map((product: ProductDto) => ({
      value: product.id,
      label: `${product.code} - ${product.name}`,
      product,
    })), [productsData]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        customerId: initialValues.customerId,
        customerEmail: initialValues.customerEmail,
        customerTaxNumber: initialValues.customerTaxNumber,
        customerAddress: initialValues.customerAddress,
        invoiceDate: initialValues.invoiceDate ? dayjs(initialValues.invoiceDate) : dayjs(),
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : dayjs().add(30, 'day'),
        currency: initialValues.currency || 'TRY',
        type: initialValues.type || 'Sales',
        notes: initialValues.notes,
        discountRate: initialValues.discountRate || 0,
        isEInvoice: initialValues.isEInvoice || false,
      });
      setSelectedCurrency(initialValues.currency || 'TRY');
      setIsEInvoice(initialValues.isEInvoice || false);
      if (initialValues.items) {
        setItems(initialValues.items.map((item, index) => ({
          key: `item-${index}`,
          productId: item.productId || undefined,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate || 0,
          description: item.description || undefined,
        })));
      }
    } else {
      form.setFieldsValue({
        invoiceDate: dayjs(),
        dueDate: dayjs().add(30, 'day'),
        currency: 'TRY',
        type: 'Sales',
        discountRate: 0,
        isEInvoice: false,
      });
      setItems([{
        key: 'item-0',
        productCode: '',
        productName: '',
        unit: 'Adet',
        quantity: 1,
        unitPrice: 0,
        vatRate: 18,
        discountRate: 0,
      }]);
    }
  }, [form, initialValues]);

  const handleCustomerSelect = (value: string) => {
    const customer = customerOptions.find((opt: { value: string }) => opt.value === value)?.customer as Customer;
    if (customer) {
      form.setFieldsValue({
        customerEmail: customer.email,
        customerTaxNumber: customer.taxId,
        customerAddress: customer.address,
        notes: customer.paymentTerms,
      });
    }
  };

  const handleProductSelect = (productId: number, itemKey: string) => {
    const product = productOptions.find((opt) => opt.value === productId)?.product as ProductDto;
    if (product) {
      setItems(prev => prev.map(item =>
        item.key === itemKey
          ? {
              ...item,
              productId: product.id.toString(),
              productCode: product.code,
              productName: product.name,
              unitPrice: product.unitPrice || 0,
              unit: 'Adet',
            }
          : item
      ));
    }
  };

  const updateItem = (key: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    const newKey = `item-${Date.now()}`;
    setItems(prev => [...prev, {
      key: newKey,
      productCode: '',
      productName: '',
      unit: 'Adet',
      quantity: 1,
      unitPrice: 0,
      vatRate: 18,
      discountRate: 0,
    }]);
  };

  const removeItem = (key: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.key !== key));
    }
  };

  // Calculate totals
  const calculations = useMemo(() => {
    let subTotal = 0;
    let totalVat = 0;
    let totalItemDiscount = 0;

    items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineDiscount = lineTotal * (item.discountRate / 100);
      const lineAfterDiscount = lineTotal - lineDiscount;
      const lineVat = lineAfterDiscount * (item.vatRate / 100);

      subTotal += lineAfterDiscount;
      totalVat += lineVat;
      totalItemDiscount += lineDiscount;
    });

    const invoiceDiscountRate = form.getFieldValue('discountRate') || 0;
    const invoiceDiscount = subTotal * (invoiceDiscountRate / 100);
    const grandTotal = subTotal - invoiceDiscount + totalVat;

    return {
      subTotal,
      totalVat,
      totalItemDiscount,
      invoiceDiscount,
      grandTotal,
    };
  }, [items, form]);

  const handleSubmit = () => {
    form.validateFields().then((values: any) => {
      const invoiceData = {
        ...values,
        invoiceDate: values.invoiceDate?.toISOString(),
        dueDate: values.dueDate?.toISOString(),
        isEInvoice,
        items: items.map((item, index) => ({
          lineNumber: index + 1,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate,
          description: item.description,
        })),
      };
      onFinish(invoiceData);
    });
  };

  // Trigger form submit from parent via form.submit()
  useEffect(() => {
    const originalSubmit = form.submit;
    form.submit = () => {
      handleSubmit();
    };
    return () => {
      form.submit = originalSubmit;
    };
  }, [form, items, isEInvoice]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: selectedCurrency
    }).format(amount);

  const itemColumns = [
    {
      title: 'Ürün',
      key: 'product',
      width: 280,
      render: (_: any, record: InvoiceItem) => (
        <div className="space-y-1">
          <Select
            showSearch
            placeholder="Ürün seçin"
            loading={productsLoading}
            filterOption={false}
            onSearch={setProductSearch}
            onChange={(value) => value && handleProductSelect(Number(value), record.key)}
            value={record.productId}
            options={productOptions}
            style={{ width: '100%' }}
            size="small"
            allowClear
          />
          <Input
            placeholder="veya manuel girin"
            value={record.productCode}
            onChange={(e) => updateItem(record.key, 'productCode', e.target.value)}
            size="small"
            style={{ width: '45%', marginRight: '5%' }}
          />
          <Input
            placeholder="Ürün adı"
            value={record.productName}
            onChange={(e) => updateItem(record.key, 'productName', e.target.value)}
            size="small"
            style={{ width: '50%' }}
          />
        </div>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 100,
      render: (_: any, record: InvoiceItem) => (
        <InputNumber
          min={0.01}
          value={record.quantity}
          onChange={(value) => updateItem(record.key, 'quantity', value || 0)}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim',
      key: 'unit',
      width: 90,
      render: (_: any, record: InvoiceItem) => (
        <Select
          value={record.unit}
          onChange={(value) => updateItem(record.key, 'unit', value)}
          options={unitOptions}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      key: 'unitPrice',
      width: 120,
      render: (_: any, record: InvoiceItem) => (
        <InputNumber
          min={0}
          precision={2}
          value={record.unitPrice}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          size="small"
          style={{ width: '100%' }}
          prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
        />
      ),
    },
    {
      title: 'İnd. %',
      key: 'discountRate',
      width: 80,
      render: (_: any, record: InvoiceItem) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountRate}
          onChange={(value) => updateItem(record.key, 'discountRate', value || 0)}
          size="small"
          style={{ width: '100%' }}
          suffix="%"
        />
      ),
    },
    {
      title: 'KDV %',
      key: 'vatRate',
      width: 80,
      render: (_: any, record: InvoiceItem) => (
        <Select
          value={record.vatRate}
          onChange={(value) => updateItem(record.key, 'vatRate', value)}
          options={vatOptions}
          size="small"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Tutar',
      key: 'total',
      width: 120,
      align: 'right' as const,
      render: (_: any, record: InvoiceItem) => {
        const lineTotal = record.quantity * record.unitPrice;
        const discount = lineTotal * (record.discountRate / 100);
        const afterDiscount = lineTotal - discount;
        const vat = afterDiscount * (record.vatRate / 100);
        return (
          <span className="font-medium">{formatCurrency(afterDiscount + vat)}</span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: (_: any, record: InvoiceItem) => (
        <Tooltip title="Sil">
          <Button
            type="text"
            danger
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={() => removeItem(record.key)}
            disabled={items.length === 1}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Title + E-Invoice Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Invoice Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Invoice Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {initialValues ? `Fatura: ${initialValues.invoiceNumber}` : 'Yeni Fatura'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {items.length} kalem | {formatCurrency(calculations.grandTotal)}
              </p>
            </div>

            {/* E-Invoice Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isEInvoice ? 'E-Fatura' : 'Normal Fatura'}
                </span>
                <Switch
                  checked={isEInvoice}
                  onChange={setIsEInvoice}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── MÜŞTERİ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Müşteri Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri <span className="text-red-500">*</span></label>
                <Form.Item
                  name="customerId"
                  rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    showSearch
                    placeholder="Müşteri seçin"
                    loading={customersLoading}
                    filterOption={false}
                    onSearch={setCustomerSearch}
                    onChange={handleCustomerSelect}
                    options={customerOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                <Form.Item name="customerEmail" className="mb-0">
                  <Input
                    placeholder="E-posta adresi"
                    type="email"
                    className="!bg-slate-50 !border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vergi Numarası</label>
                <Form.Item name="customerTaxNumber" className="mb-0">
                  <Input
                    placeholder="Vergi numarası"
                    className="!bg-slate-50 !border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fatura Tipi</label>
                <Form.Item name="type" className="mb-0">
                  <Select
                    options={typeOptions}
                    placeholder="Fatura Tipi"
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİH VE PARA BİRİMİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih ve Para Birimi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fatura Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="invoiceDate"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                  className="mb-0"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Fatura Tarihi"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vade Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="dueDate"
                  rules={[{ required: true, message: 'Zorunlu' }]}
                  className="mb-0"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Vade Tarihi"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={currencyOptions}
                    onChange={setSelectedCurrency}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ADRES VE ÖDEME ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Adres ve Ödeme
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri Adresi</label>
                <Form.Item name="customerAddress" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Müşteri adresi"
                    className="!bg-slate-50 !border-slate-300 !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Fatura notları"
                    className="!bg-slate-50 !border-slate-300 !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FATURA KALEMLERİ ─────────────── */}
          <div className="mb-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fatura Kalemleri ({items.length})
              </h3>
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={addItem}
                size="small"
                className="!bg-slate-900 !border-slate-900 hover:!bg-slate-800"
              >
                Kalem Ekle
              </Button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="key"
                pagination={false}
                size="small"
                scroll={{ x: 900 }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Henüz kalem eklenmedi"
                    />
                  ),
                }}
              />
            </div>
          </div>

          {/* ─────────────── ÖZET VE NOTLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Fatura Özeti
            </h3>
            <div className="grid grid-cols-12 gap-4">
              {/* Sol: İndirim ve Notlar */}
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fatura İndirimi (%)</label>
                <Form.Item name="discountRate" className="mb-4">
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    placeholder="0"
                    addonAfter="%"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>

                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Fatura notları..."
                    className="!bg-slate-50 !border-slate-300 !resize-none"
                  />
                </Form.Item>
              </div>

              {/* Sağ: Toplam Özeti */}
              <div className="col-span-6">
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Ara Toplam</span>
                      <span className="font-medium text-slate-800">{formatCurrency(calculations.subTotal)}</span>
                    </div>
                    {calculations.totalItemDiscount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Satır İndirimi</span>
                        <span className="text-red-600">-{formatCurrency(calculations.totalItemDiscount)}</span>
                      </div>
                    )}
                    {calculations.invoiceDiscount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Fatura İndirimi</span>
                        <span className="text-red-600">-{formatCurrency(calculations.invoiceDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">KDV Toplam</span>
                      <span className="font-medium text-slate-800">{formatCurrency(calculations.totalVat)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Genel Toplam</span>
                        <span className="text-2xl font-bold text-slate-900">{formatCurrency(calculations.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── DÜZENLEME MODU İSTATİSTİKLERİ ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Fatura Durumu
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-lg font-semibold text-slate-800">
                      {initialValues.invoiceNumber}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Fatura No</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-lg font-semibold text-slate-800">
                      {initialValues.items?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kalem Sayısı</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className={`text-lg font-semibold ${initialValues.status === 'Paid' ? 'text-green-600' : initialValues.status === 'Overdue' ? 'text-red-600' : 'text-amber-600'}`}>
                      {initialValues.status === 'Draft' && 'Taslak'}
                      {initialValues.status === 'Issued' && 'Kesildi'}
                      {initialValues.status === 'Sent' && 'Gönderildi'}
                      {initialValues.status === 'Paid' && 'Ödendi'}
                      {initialValues.status === 'PartiallyPaid' && 'Kısmi Ödeme'}
                      {initialValues.status === 'Overdue' && 'Vadesi Geçmiş'}
                      {initialValues.status === 'Cancelled' && 'İptal'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Durum</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
