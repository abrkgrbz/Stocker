'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, DatePicker, Switch, message, Spin } from 'antd';
import { PageContainer } from '@/components/patterns';
import {
  ArrowLeftIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
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
      message.success('Tatil günü başarıyla güncellendi');
      router.push(`/hr/holidays/${id}`);
    } catch (error) {
      message.error('Güncelleme sırasında bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </PageContainer>
    );
  }

  if (error || !holiday) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Tatil günü bulunamadı</p>
          <Link href="/hr/holidays" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Dön
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/hr/holidays/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Detaya Dön
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Tatil Günü Düzenle</h1>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-medium">{holiday.name}</span> tatilini düzenliyorsunuz
            </p>
          </div>
        </div>
      </div>

      {/* Form Kartı */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6"
        >
          {/* Tatil Bilgileri */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Tatil Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label={<span className="text-sm text-slate-700">Tatil Adı</span>}
                rules={[{ required: true, message: 'Tatil adı zorunludur' }]}
              >
                <Input placeholder="Örn: Yılbaşı, Ramazan Bayramı" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="date"
                label={<span className="text-sm text-slate-700">Tarih</span>}
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Tarih seçin"
                  className="w-full rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-700">Açıklama</span>}
                className="md:col-span-2"
              >
                <TextArea rows={3} placeholder="Tatil günü açıklaması (opsiyonel)" className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Ayarlar */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Ayarlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="isRecurring"
                label={<span className="text-sm text-slate-700">Yıllık Tekrarlayan</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="isHalfDay"
                label={<span className="text-sm text-slate-700">Yarım Gün</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="isNational"
                label={<span className="text-sm text-slate-700">Ulusal Tatil</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/hr/holidays/${id}`}>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={updateHoliday.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateHoliday.isPending ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
          </div>
        </Form>
      </div>
    </PageContainer>
  );
}
