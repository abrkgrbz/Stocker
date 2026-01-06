'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, DatePicker, Switch } from 'antd';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { useHoliday, useUpdateHoliday } from '@/lib/api/hooks/useHR';
import type { UpdateHolidayDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditHolidayPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: holiday, isLoading, error } = useHoliday(id);
  const updateHoliday = useUpdateHoliday();

  // Populate form when holiday data loads
  useEffect(() => {
    if (holiday) {
      form.setFieldsValue({
        name: holiday.name,
        date: holiday.date ? dayjs(holiday.date) : null,
        description: holiday.description,
        isRecurring: holiday.isRecurring,
        holidayType: holiday.holidayType,
        isHalfDay: holiday.isHalfDay,
        isNational: holiday.isNational,
        affectedRegions: holiday.affectedRegions,
      });
    }
  }, [holiday, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateHolidayDto = {
        name: values.name,
        date: values.date?.format('YYYY-MM-DD'),
        description: values.description,
        isRecurring: values.isRecurring ?? false,
        holidayType: values.holidayType,
        isHalfDay: values.isHalfDay ?? false,
        isNational: values.isNational ?? true,
        affectedRegions: values.affectedRegions,
      };

      await updateHoliday.mutateAsync({ id, data });
      router.push(`/hr/holidays/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const subtitle = holiday
    ? `${holiday.name} tatilini duzenliyorsunuz`
    : 'Tatil gunu bilgilerini duzenleyin';

  return (
    <FormPageLayout
      title="Tatil Gunu Duzenle"
      subtitle={subtitle}
      cancelPath={`/hr/holidays/${id}`}
      loading={updateHoliday.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !holiday)}
      errorMessage="Tatil Gunu Bulunamadi"
      errorDescription="Istenen tatil gunu bulunamadi veya bir hata olustu."
      saveButtonText="Guncelle"
      icon={<CalendarIcon className="w-5 h-5" />}
      maxWidth="max-w-4xl"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Tatil Bilgileri */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Tatil Bilgileri
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Tatil Adi"
                rules={[{ required: true, message: 'Tatil adi zorunludur' }]}
              >
                <Input placeholder="Orn: Yilbasi, Ramazan Bayrami" variant="filled" />
              </Form.Item>

              <Form.Item
                name="date"
                label="Tarih"
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Tarih secin"
                  className="w-full"
                  variant="filled"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Aciklama"
                className="md:col-span-2"
              >
                <TextArea rows={3} placeholder="Tatil gunu aciklamasi (opsiyonel)" variant="filled" />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Ayarlar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Ayarlar
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="isRecurring"
                label="Yillik Tekrarlayan"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="isHalfDay"
                label="Yarim Gun"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="isNational"
                label="Ulusal Tatil"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Hidden submit button for form.submit() */}
        <button type="submit" hidden />
      </Form>
    </FormPageLayout>
  );
}
