'use client';

/**
 * Create Delivery Note Page
 * Yeni irsaliye olusturma formu - Monochrome Design System
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Form, Input, Select, DatePicker, Switch } from 'antd';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useCreateDeliveryNote } from '@/features/sales';
import type { CreateDeliveryNoteDto } from '@/features/sales';

dayjs.locale('tr');

const { TextArea } = Input;

const typeOptions = [
  { value: 'Sales', label: 'Satis' },
  { value: 'Return', label: 'Iade' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Sample', label: 'Numune' },
  { value: 'Other', label: 'Diger' },
];

const transportModeOptions = [
  { value: 'Road', label: 'Karayolu' },
  { value: 'Sea', label: 'Denizyolu' },
  { value: 'Air', label: 'Havayolu' },
  { value: 'Rail', label: 'Demiryolu' },
  { value: 'Multimodal', label: 'Multimodal' },
];

export default function NewDeliveryNotePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMutation = useCreateDeliveryNote();

  const handleSubmit = async (values: any) => {
    const payload: CreateDeliveryNoteDto = {
      series: values.series,
      deliveryNoteDate: values.deliveryNoteDate?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
      deliveryNoteType: values.deliveryNoteType,
      senderTaxId: values.senderTaxId,
      senderName: values.senderName,
      senderAddress: values.senderAddress,
      senderTaxOffice: values.senderTaxOffice,
      senderCity: values.senderCity,
      senderDistrict: values.senderDistrict,
      receiverTaxId: values.receiverTaxId,
      receiverName: values.receiverName,
      receiverAddress: values.receiverAddress,
      receiverTaxOffice: values.receiverTaxOffice,
      receiverCity: values.receiverCity,
      receiverDistrict: values.receiverDistrict,
      salesOrderId: values.salesOrderId,
      description: values.description,
      items: [],
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        router.push('/sales/delivery-notes');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/sales/delivery-notes"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Yeni Irsaliye</h1>
                <p className="text-xs text-slate-500">Sevkiyat irsaliye bilgilerini girin</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sales/delivery-notes"
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Vazgec
            </Link>
            <button
              onClick={() => form.submit()}
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            deliveryNoteType: 'Sales',
            deliveryNoteDate: dayjs(),
            isEDeliveryNote: false,
          }}
        >
          {/* Section: Irsaliye Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Irsaliye Bilgileri</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Temel irsaliye bilgileri
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Form.Item
                name="series"
                label={<span className="text-sm font-medium text-slate-700">Seri</span>}
                rules={[{ required: true, message: 'Seri zorunludur' }]}
              >
                <Input placeholder="A" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="deliveryNoteDate"
                label={<span className="text-sm font-medium text-slate-700">Tarih</span>}
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full rounded-lg" format="DD.MM.YYYY" />
              </Form.Item>

              <Form.Item
                name="deliveryNoteType"
                label={<span className="text-sm font-medium text-slate-700">Tip</span>}
              >
                <div className="flex flex-wrap gap-2">
                  {typeOptions.slice(0, 4).map((opt) => {
                    const currentValue = Form.useWatch('deliveryNoteType', form);
                    const isSelected = currentValue === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => form.setFieldValue('deliveryNoteType', opt.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </Form.Item>

              <Form.Item
                name="isEDeliveryNote"
                label={<span className="text-sm font-medium text-slate-700">E-Irsaliye</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>
            </div>
          </div>

          {/* Section: Gonderici Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Gonderici Bilgileri</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Gonderici firma bilgileri
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="senderTaxId"
                label={<span className="text-sm font-medium text-slate-700">VKN/TCKN</span>}
                rules={[{ required: true, message: 'VKN zorunludur' }]}
              >
                <Input placeholder="Vergi kimlik numarasi" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="senderName"
                label={<span className="text-sm font-medium text-slate-700">Unvan</span>}
                rules={[{ required: true, message: 'Unvan zorunludur' }]}
              >
                <Input placeholder="Firma unvani" className="rounded-lg" />
              </Form.Item>

              <div className="md:col-span-2">
                <Form.Item
                  name="senderAddress"
                  label={<span className="text-sm font-medium text-slate-700">Adres</span>}
                  rules={[{ required: true, message: 'Adres zorunludur' }]}
                >
                  <TextArea placeholder="Tam adres" rows={2} className="rounded-lg" />
                </Form.Item>
              </div>

              <Form.Item
                name="senderCity"
                label={<span className="text-sm font-medium text-slate-700">Il</span>}
              >
                <Input placeholder="Istanbul" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="senderDistrict"
                label={<span className="text-sm font-medium text-slate-700">Ilce</span>}
              >
                <Input placeholder="Atasehir" className="rounded-lg" />
              </Form.Item>
            </div>
          </div>

          {/* Section: Alici Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Alici Bilgileri</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Alici firma bilgileri
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="receiverTaxId"
                label={<span className="text-sm font-medium text-slate-700">VKN/TCKN</span>}
                rules={[{ required: true, message: 'VKN zorunludur' }]}
              >
                <Input placeholder="Vergi kimlik numarasi" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="receiverName"
                label={<span className="text-sm font-medium text-slate-700">Unvan</span>}
                rules={[{ required: true, message: 'Unvan zorunludur' }]}
              >
                <Input placeholder="Firma unvani" className="rounded-lg" />
              </Form.Item>

              <div className="md:col-span-2">
                <Form.Item
                  name="receiverAddress"
                  label={<span className="text-sm font-medium text-slate-700">Adres</span>}
                  rules={[{ required: true, message: 'Adres zorunludur' }]}
                >
                  <TextArea placeholder="Tam adres" rows={2} className="rounded-lg" />
                </Form.Item>
              </div>

              <Form.Item
                name="receiverCity"
                label={<span className="text-sm font-medium text-slate-700">Il</span>}
              >
                <Input placeholder="Istanbul" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="receiverDistrict"
                label={<span className="text-sm font-medium text-slate-700">Ilce</span>}
              >
                <Input placeholder="Kadikoy" className="rounded-lg" />
              </Form.Item>
            </div>
          </div>

          {/* Section: Tasima Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Tasima Bilgileri</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Tasima ve surucu bilgileri
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="transportMode"
                label={<span className="text-sm font-medium text-slate-700">Tasima Modu</span>}
              >
                <Select
                  options={transportModeOptions}
                  placeholder="Secin"
                  allowClear
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                name="vehiclePlateNumber"
                label={<span className="text-sm font-medium text-slate-700">Arac Plakasi</span>}
              >
                <Input placeholder="34 ABC 123" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="driverName"
                label={<span className="text-sm font-medium text-slate-700">Surucu Adi</span>}
              >
                <Input placeholder="Ad Soyad" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="driverTcNumber"
                label={<span className="text-sm font-medium text-slate-700">Surucu TC No</span>}
              >
                <Input placeholder="TC Kimlik numarasi" className="rounded-lg" />
              </Form.Item>
            </div>
          </div>

          {/* Section: Siparis Baglantisi */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Siparis Baglantisi</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Iliskili siparis bilgisi (opsiyonel)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="salesOrderId"
                label={<span className="text-sm font-medium text-slate-700">Siparis</span>}
              >
                <Select
                  placeholder="Siparis secin (opsiyonel)"
                  allowClear
                  showSearch
                  className="w-full"
                  options={[]}
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-sm font-medium text-slate-700">Aciklama</span>}
              >
                <TextArea placeholder="Ek aciklama (opsiyonel)" rows={2} className="rounded-lg" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
