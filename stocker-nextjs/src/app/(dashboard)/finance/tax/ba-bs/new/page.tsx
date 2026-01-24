'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Select, Button, DatePicker, Table, Modal, Card, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useCreateBaBsForm, useGenerateBaBsFromInvoices } from '@/lib/api/hooks/useFinance';
import type { CreateBaBsFormItemDto, BaBsFormType, BaBsDocumentType } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const monthOptions = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 3 }, (_, i) => ({
  value: currentYear - i,
  label: `${currentYear - i}`,
}));

const documentTypeOptions = [
  { value: 'Invoice', label: 'Fatura' },
  { value: 'ProfessionalServiceReceipt', label: 'Serbest Meslek Makbuzu' },
  { value: 'ExpenseVoucher', label: 'Gider Pusulası' },
  { value: 'ProducerReceipt', label: 'Müstahsil Makbuzu' },
  { value: 'Other', label: 'Diğer' },
];

interface FormItem {
  key: string;
  counterpartyTaxId: string;
  counterpartyName: string;
  countryCode?: string;
  documentType?: BaBsDocumentType;
  documentCount: number;
  amountExcludingVat: number;
  vatAmount: number;
  notes?: string;
}

export default function NewBaBsFormPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createBaBsForm = useCreateBaBsForm();
  const generateFromInvoices = useGenerateBaBsFromInvoices();

  const [items, setItems] = useState<FormItem[]>([]);
  const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
  const [generateForm] = Form.useForm();

  const addItem = () => {
    const newItem: FormItem = {
      key: Date.now().toString(),
      counterpartyTaxId: '',
      counterpartyName: '',
      countryCode: 'TR',
      documentType: 'Invoice' as BaBsDocumentType,
      documentCount: 1,
      amountExcludingVat: 0,
      vatAmount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const updateItem = (key: string, field: string, value: unknown) => {
    setItems(items.map(item => {
      if (item.key !== key) return item;

      const updated = { ...item, [field]: value };

      // Auto-calculate VAT amount at 20% rate when base amount changes
      if (field === 'amountExcludingVat') {
        const baseAmount = (value as number) || 0;
        updated.vatAmount = baseAmount * 0.20;
      }

      return updated;
    }));
  };

  const getTotals = () => {
    return items.reduce(
      (acc, item) => ({
        count: acc.count + (item.documentCount || 0),
        amountExcludingVat: acc.amountExcludingVat + (item.amountExcludingVat || 0),
        vatAmount: acc.vatAmount + (item.vatAmount || 0),
        totalAmount: acc.totalAmount + (item.amountExcludingVat || 0) + (item.vatAmount || 0),
      }),
      { count: 0, amountExcludingVat: 0, vatAmount: 0, totalAmount: 0 }
    );
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = {
        formType: values.formType as BaBsFormType,
        periodYear: values.periodYear,
        periodMonth: values.periodMonth,
        taxId: values.taxId,
        taxOffice: values.taxOffice,
        companyName: values.companyName,
        accountingPeriodId: values.accountingPeriodId,
        notes: values.notes,
        items: items.map(({ key, ...item }) => item),
      };

      const result = await createBaBsForm.mutateAsync(formData);
      showSuccess('Ba-Bs formu oluşturuldu');
      router.push(`/finance/tax/ba-bs/${result.id}`);
    } catch (error) {
      showApiError(error, 'Ba-Bs formu oluşturulamadı');
    }
  };

  const handleGenerateFromInvoices = async (values: Record<string, unknown>) => {
    try {
      const result = await generateFromInvoices.mutateAsync({
        formType: values.formType as BaBsFormType,
        periodYear: values.periodYear as number,
        periodMonth: values.periodMonth as number,
        taxId: values.taxId as string || '',
        companyName: values.companyName as string || '',
      });
      showSuccess('Ba-Bs formu faturalardan oluşturuldu');
      setIsGenerateModalVisible(false);
      router.push(`/finance/tax/ba-bs/${result.id}`);
    } catch (error) {
      showApiError(error, 'Ba-Bs formu oluşturulamadı');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const itemColumns: ColumnsType<FormItem> = [
    {
      title: 'Vergi No',
      dataIndex: 'counterpartyTaxId',
      key: 'counterpartyTaxId',
      width: 140,
      render: (_, record) => (
        <Input
          value={record.counterpartyTaxId}
          onChange={(e) => updateItem(record.key, 'counterpartyTaxId', e.target.value)}
          placeholder="10 veya 11 haneli"
          maxLength={11}
        />
      ),
    },
    {
      title: 'Karşı Taraf',
      dataIndex: 'counterpartyName',
      key: 'counterpartyName',
      render: (_, record) => (
        <Input
          value={record.counterpartyName}
          onChange={(e) => updateItem(record.key, 'counterpartyName', e.target.value)}
          placeholder="Firma adı"
        />
      ),
    },
    {
      title: 'Belge Türü',
      dataIndex: 'documentType',
      key: 'documentType',
      width: 180,
      render: (_, record) => (
        <Select
          value={record.documentType}
          onChange={(value) => updateItem(record.key, 'documentType', value)}
          options={documentTypeOptions}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Belge Sayısı',
      dataIndex: 'documentCount',
      key: 'documentCount',
      width: 100,
      render: (_, record) => (
        <InputNumber
          value={record.documentCount}
          onChange={(value) => updateItem(record.key, 'documentCount', value)}
          min={1}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'KDV Hariç Tutar',
      dataIndex: 'amountExcludingVat',
      key: 'amountExcludingVat',
      width: 140,
      render: (_, record) => (
        <InputNumber
          value={record.amountExcludingVat}
          onChange={(value) => updateItem(record.key, 'amountExcludingVat', value)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value?.replace(/,/g, '') as unknown as number}
        />
      ),
    },
    {
      title: 'KDV Tutarı',
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      width: 140,
      render: (_, record) => (
        <InputNumber<number>
          value={record.vatAmount}
          onChange={(value) => updateItem(record.key, 'vatAmount', value)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
        />
      ),
    },
    {
      title: 'Toplam',
      key: 'total',
      width: 120,
      align: 'right',
      render: (_, record) => formatCurrency((record.amountExcludingVat || 0) + (record.vatAmount || 0)),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<TrashIcon className="w-4 h-4" />}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  const totals = getTotals();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/finance/tax/ba-bs')}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni Ba-Bs Formu</h1>
                <p className="text-sm text-slate-500 m-0">5.000 TL ve üzeri mal/hizmet alım-satım bildirimi</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsGenerateModalVisible(true)}>
              Faturalardan Oluştur
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={createBaBsForm.isPending}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            formType: 'Ba',
            periodYear: currentYear,
            periodMonth: new Date().getMonth() + 1,
          }}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Form Details */}
            <div className="col-span-12 lg:col-span-8">
              <Card title="Form Bilgileri" className="mb-6">
                <div className="grid grid-cols-4 gap-4">
                  <Form.Item
                    name="formType"
                    label="Form Türü"
                    rules={[{ required: true, message: 'Form türü seçiniz' }]}
                  >
                    <Select
                      options={[
                        { value: 'Ba', label: 'Ba - Mal ve Hizmet Alışları' },
                        { value: 'Bs', label: 'Bs - Mal ve Hizmet Satışları' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    name="periodYear"
                    label="Yıl"
                    rules={[{ required: true, message: 'Yıl seçiniz' }]}
                  >
                    <Select options={yearOptions} />
                  </Form.Item>
                  <Form.Item
                    name="periodMonth"
                    label="Ay"
                    rules={[{ required: true, message: 'Ay seçiniz' }]}
                  >
                    <Select options={monthOptions} />
                  </Form.Item>
                  <Form.Item name="accountingPeriodId" label="Muhasebe Dönemi">
                    <InputNumber style={{ width: '100%' }} placeholder="Dönem ID" />
                  </Form.Item>
                </div>
              </Card>

              <Card title="Firma Bilgileri" className="mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <Form.Item
                    name="companyName"
                    label="Firma Adı"
                    rules={[{ required: true, message: 'Firma adı giriniz' }]}
                  >
                    <Input placeholder="Firma unvanı" />
                  </Form.Item>
                  <Form.Item
                    name="taxId"
                    label="Vergi Kimlik No"
                    rules={[{ required: true, message: 'Vergi numarası giriniz' }]}
                  >
                    <Input placeholder="10 veya 11 haneli" maxLength={11} />
                  </Form.Item>
                  <Form.Item name="taxOffice" label="Vergi Dairesi">
                    <Input placeholder="Vergi dairesi adı" />
                  </Form.Item>
                </div>
              </Card>

              <Card
                title="Bildirim Kalemleri"
                extra={
                  <Button
                    type="primary"
                    ghost
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={addItem}
                  >
                    Kalem Ekle
                  </Button>
                }
              >
                <Table
                  columns={itemColumns}
                  dataSource={items}
                  rowKey="key"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Henüz kalem eklenmedi. "Kalem Ekle" butonuna tıklayın.' }}
                />

                {items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-end">
                      <div className="w-80">
                        <div className="flex justify-between py-1">
                          <span className="text-sm text-slate-500">Toplam Belge Sayısı:</span>
                          <span className="text-sm font-medium">{totals.count}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-sm text-slate-500">KDV Hariç Toplam:</span>
                          <span className="text-sm font-medium">{formatCurrency(totals.amountExcludingVat)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-sm text-slate-500">Toplam KDV:</span>
                          <span className="text-sm font-medium">{formatCurrency(totals.vatAmount)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-slate-200">
                          <span className="text-sm font-semibold">Genel Toplam:</span>
                          <span className="text-base font-bold">{formatCurrency(totals.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Notes */}
            <div className="col-span-12 lg:col-span-4">
              <Card title="Notlar" className="sticky top-24">
                <Form.Item name="notes">
                  <Input.TextArea
                    rows={4}
                    placeholder="İsteğe bağlı notlar..."
                  />
                </Form.Item>

                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-700 mb-2">Önemli Bilgiler:</p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li>• 5.000 TL ve üzeri alım/satışlar bildirilir</li>
                    <li>• Son gönderim: Takip eden ayın sonuna kadar</li>
                    <li>• Vergi numarası 10 (tüzel) veya 11 (gerçek) haneli olmalıdır</li>
                    <li>• Aynı vergi numaralı birden fazla işlem tek satırda toplanır</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </Form>
      </div>

      {/* Generate from Invoices Modal */}
      <Modal
        title="Faturalardan Ba-Bs Formu Oluştur"
        open={isGenerateModalVisible}
        onCancel={() => setIsGenerateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={handleGenerateFromInvoices}
          initialValues={{
            formType: 'Ba',
            periodYear: currentYear,
            periodMonth: new Date().getMonth() + 1,
          }}
        >
          <Form.Item
            name="formType"
            label="Form Türü"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: 'Ba', label: 'Ba - Alış Faturaları' },
                { value: 'Bs', label: 'Bs - Satış Faturaları' },
              ]}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="periodYear"
              label="Yıl"
              rules={[{ required: true }]}
            >
              <Select options={yearOptions} />
            </Form.Item>
            <Form.Item
              name="periodMonth"
              label="Ay"
              rules={[{ required: true }]}
            >
              <Select options={monthOptions} />
            </Form.Item>
          </div>

          <Form.Item
            name="taxId"
            label="Vergi Kimlik No"
            rules={[{ required: true, message: 'Vergi numarası giriniz' }]}
          >
            <Input placeholder="10 veya 11 haneli" maxLength={11} />
          </Form.Item>

          <Form.Item
            name="companyName"
            label="Firma Adı"
            rules={[{ required: true, message: 'Firma adı giriniz' }]}
          >
            <Input placeholder="Firma unvanı" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsGenerateModalVisible(false)}>
              İptal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={generateFromInvoices.isPending}
            >
              Oluştur
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
