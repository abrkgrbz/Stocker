'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Switch } from 'antd';
import { MapPinIcon } from '@heroicons/react/24/outline';
import type { WorkLocationDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;

interface WorkLocationFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialData?: WorkLocationDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function WorkLocationForm({ form, initialData, onFinish, loading }: WorkLocationFormProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        code: initialData.code,
        description: initialData.description,
        street: initialData.street,
        city: initialData.city,
        state: initialData.state,
        postalCode: initialData.postalCode,
        country: initialData.country,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        phone: initialData.phone,
        email: initialData.email,
        capacity: initialData.capacity,
        isHeadquarters: initialData.isHeadquarters,
        isRemote: initialData.isRemote,
        isActive: initialData.isActive,
      });
      setIsActive(initialData.isActive ?? true);
    } else {
      form.setFieldsValue({
        isHeadquarters: false,
        isRemote: false,
        isActive: true,
        country: 'Turkiye',
      });
    }
  }, [form, initialData]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Location Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Lokasyon adi zorunludur' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Lokasyon Adi Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Lokasyon hakkinda kisa aciklama..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('isActive', val);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-6">

          {/* TEMEL BILGILER */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lokasyon Kodu</label>
                <Form.Item name="code" className="mb-0">
                  <Input
                    placeholder="Orn: IST-HQ"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kapasite</label>
                <Form.Item name="capacity" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Orn: 100"
                    min={0}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ADRES BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Adres Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Adres</label>
                <Form.Item name="street" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Sokak, mahalle, bina no..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sehir</label>
                <Form.Item name="city" className="mb-0">
                  <Input
                    placeholder="Orn: Istanbul"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ilce</label>
                <Form.Item name="state" className="mb-0">
                  <Input
                    placeholder="Orn: Kadikoy"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Posta Kodu</label>
                <Form.Item name="postalCode" className="mb-0">
                  <Input
                    placeholder="Orn: 34710"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ulke</label>
                <Form.Item name="country" className="mb-0">
                  <Input
                    placeholder="Orn: Turkiye"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Enlem</label>
                <Form.Item name="latitude" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Orn: 40.9906"
                    step={0.0001}
                    precision={6}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Boylam</label>
                <Form.Item name="longitude" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Orn: 29.0297"
                    step={0.0001}
                    precision={6}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ILETISIM BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Iletisim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="phone" className="mb-0">
                  <Input
                    placeholder="Orn: +90 216 123 4567"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                <Form.Item
                  name="email"
                  rules={[{ type: 'email', message: 'Gecerli bir e-posta adresi giriniz' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Orn: istanbul@sirket.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* LOKASYON SECENEKLERI */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Lokasyon Secenekleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Merkez Ofis</div>
                  <Form.Item name="isHeadquarters" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checkedChildren="Evet"
                      unCheckedChildren="Hayir"
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Uzaktan Calisma Lokasyonu</div>
                  <Form.Item name="isRemote" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checkedChildren="Evet"
                      unCheckedChildren="Hayir"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
