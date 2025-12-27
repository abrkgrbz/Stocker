'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Switch } from 'antd';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import { useDepartments, useEmployees } from '@/lib/api/hooks/useHR';
import type { AnnouncementDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface AnnouncementFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: AnnouncementDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function AnnouncementForm({ form, initialValues, onFinish, loading }: AnnouncementFormProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [requiresAck, setRequiresAck] = useState(false);

  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        publishDate: initialValues.publishDate ? dayjs(initialValues.publishDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
      });
      setIsPinned(initialValues.isPinned ?? false);
      setRequiresAck(initialValues.requiresAcknowledgment ?? false);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{ priority: 'Normal', isPinned: false, requiresAcknowledgment: false }}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Announcement Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <MegaphoneIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Announcement Title */}
            <div className="flex-1">
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: 'Baslik zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Duyuru Basligi Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="summary" className="mb-0 mt-1">
                <Input
                  placeholder="Kisa ozet ekleyin..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Pinned Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isPinned ? 'Sabitlendi' : 'Sabit Degil'}
                </span>
                <Form.Item name="isPinned" valuePropName="checked" noStyle>
                  <Switch
                    checked={isPinned}
                    onChange={(val) => {
                      setIsPinned(val);
                      form.setFieldValue('isPinned', val);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-6">

          {/* ICERIK */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Icerik
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Duyuru Icerigi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="content"
                  rules={[{ required: true, message: 'Icerik zorunludur' }]}
                  className="mb-0"
                >
                  <TextArea
                    rows={6}
                    placeholder="Duyuru icerigi..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ZAMANLAMA VE ONCELIK */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Zamanlama ve Oncelik
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Oncelik</label>
                <Form.Item name="priority" className="mb-0">
                  <Select
                    options={[
                      { value: 'Low', label: 'Dusuk' },
                      { value: 'Normal', label: 'Normal' },
                      { value: 'High', label: 'Yuksek' },
                      { value: 'Urgent', label: 'Acil' },
                    ]}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yayin Tarihi</label>
                <Form.Item name="publishDate" className="mb-0">
                  <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitis Tarihi</label>
                <Form.Item name="expiryDate" className="mb-0">
                  <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* YAZAR VE TIP */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Yazar ve Tip
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yazar <span className="text-red-500">*</span></label>
                <Form.Item
                  name="authorId"
                  rules={[{ required: true, message: 'Yazar secimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Yazar secin"
                    showSearch
                    optionFilterProp="label"
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Duyuru Tipi</label>
                <Form.Item name="announcementType" className="mb-0">
                  <Select
                    placeholder="Genel"
                    options={[
                      { value: 'General', label: 'Genel' },
                      { value: 'Policy', label: 'Politika' },
                      { value: 'Event', label: 'Etkinlik' },
                      { value: 'Achievement', label: 'Basari' },
                      { value: 'Welcome', label: 'Hosgeldin' },
                      { value: 'Farewell', label: 'Veda' },
                    ]}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* HEDEF KITLE */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Hedef Kitle
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Departman (bos = herkese)</label>
                <Form.Item name="targetDepartmentId" className="mb-0">
                  <Select
                    placeholder="Tum departmanlar"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={departments.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Onay Gerekli</label>
                <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg h-[38px]">
                  <span className="text-sm font-medium text-slate-600">
                    {requiresAck ? 'Calisanlar onaylamali' : 'Onay gerekmez'}
                  </span>
                  <Form.Item name="requiresAcknowledgment" valuePropName="checked" noStyle>
                    <Switch
                      checked={requiresAck}
                      onChange={(val) => {
                        setRequiresAck(val);
                        form.setFieldValue('requiresAcknowledgment', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ISTATISTIKLER (Duzenleme Modu) */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Istatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.acknowledgmentCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Onaylayan</div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.viewCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Goruntuleme</div>
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
