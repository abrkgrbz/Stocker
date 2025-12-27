'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, DatePicker, InputNumber, Switch, Select, message, Spin } from 'antd';
import { PageContainer } from '@/components/patterns';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { useTraining, useUpdateTraining } from '@/lib/api/hooks/useHR';
import type { UpdateTrainingDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function EditTrainingPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: training, isLoading, error } = useTraining(id);
  const updateTraining = useUpdateTraining();

  // Populate form when training data loads
  useEffect(() => {
    if (training) {
      form.setFieldsValue({
        title: training.title,
        description: training.description,
        trainingType: training.trainingType,
        provider: training.provider,
        instructor: training.instructor,
        dateRange: [
          training.startDate ? dayjs(training.startDate) : null,
          training.endDate ? dayjs(training.endDate) : null,
        ],
        location: training.location,
        isOnline: training.isOnline,
        onlineUrl: training.onlineUrl,
        durationHours: training.durationHours,
        maxParticipants: training.maxParticipants,
        cost: training.cost,
        currency: training.currency,
        isMandatory: training.isMandatory,
        hasCertification: training.hasCertification,
        certificationValidityMonths: training.certificationValidityMonths,
        passingScore: training.passingScore,
        prerequisites: training.prerequisites,
        materials: training.materials,
      });
    }
  }, [training, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateTrainingDto = {
        title: values.title,
        description: values.description,
        trainingType: values.trainingType,
        provider: values.provider,
        instructor: values.instructor,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        location: values.location,
        isOnline: values.isOnline ?? false,
        onlineUrl: values.onlineUrl,
        durationHours: values.durationHours || 0,
        maxParticipants: values.maxParticipants,
        cost: values.cost,
        currency: values.currency,
        isMandatory: values.isMandatory ?? false,
        hasCertification: values.hasCertification ?? false,
        certificationValidityMonths: values.certificationValidityMonths,
        passingScore: values.passingScore,
        prerequisites: values.prerequisites,
        materials: values.materials,
      };

      await updateTraining.mutateAsync({ id, data });
      message.success('Eğitim başarıyla güncellendi');
      router.push(`/hr/trainings/${id}`);
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

  if (error || !training) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Eğitim bulunamadı</p>
          <Link href="/hr/trainings" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
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
          href={`/hr/trainings/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Detaya Dön
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <AcademicCapIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Eğitim Düzenle</h1>
            <p className="text-sm text-slate-500 mt-1">{training.title}</p>
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
          {/* Eğitim Bilgileri */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Eğitim Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="title"
                label={<span className="text-sm text-slate-700">Eğitim Adı</span>}
                rules={[{ required: true, message: 'Eğitim adı zorunludur' }]}
              >
                <Input placeholder="Eğitim adı" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="trainingType"
                label={<span className="text-sm text-slate-700">Eğitim Türü</span>}
              >
                <Input placeholder="Örn: Teknik, Soft Skills" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="provider"
                label={<span className="text-sm text-slate-700">Eğitim Sağlayıcısı</span>}
              >
                <Input placeholder="Şirket veya kuruluş adı" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="instructor"
                label={<span className="text-sm text-slate-700">Eğitmen</span>}
              >
                <Input placeholder="Eğitmen adı" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-700">Açıklama</span>}
                className="md:col-span-2"
              >
                <TextArea rows={3} placeholder="Eğitim açıklaması" className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Tarih ve Konum */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Tarih ve Konum
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="dateRange"
                label={<span className="text-sm text-slate-700">Eğitim Tarihleri</span>}
              >
                <RangePicker
                  format="DD.MM.YYYY"
                  placeholder={['Başlangıç', 'Bitiş']}
                  className="w-full rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="durationHours"
                label={<span className="text-sm text-slate-700">Süre (Saat)</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="isOnline"
                label={<span className="text-sm text-slate-700">Online Eğitim</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="location"
                label={<span className="text-sm text-slate-700">Konum</span>}
              >
                <Input placeholder="Eğitim yeri" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="onlineUrl"
                label={<span className="text-sm text-slate-700">Online URL</span>}
                className="md:col-span-2"
              >
                <Input placeholder="https://..." className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Kapasite ve Maliyet */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Kapasite ve Maliyet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="maxParticipants"
                label={<span className="text-sm text-slate-700">Maks. Katılımcı</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={1}
                />
              </Form.Item>

              <Form.Item
                name="cost"
                label={<span className="text-sm text-slate-700">Maliyet</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="currency"
                label={<span className="text-sm text-slate-700">Para Birimi</span>}
              >
                <Select
                  placeholder="Seçin"
                  className="w-full"
                  options={[
                    { value: 'TRY', label: 'TRY' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="isMandatory"
                label={<span className="text-sm text-slate-700">Zorunlu Eğitim</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
            </div>
          </div>

          {/* Sertifikasyon */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Sertifikasyon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="hasCertification"
                label={<span className="text-sm text-slate-700">Sertifika Verilecek</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="certificationValidityMonths"
                label={<span className="text-sm text-slate-700">Geçerlilik (Ay)</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="passingScore"
                label={<span className="text-sm text-slate-700">Geçme Puanı</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                  max={100}
                />
              </Form.Item>
            </div>
          </div>

          {/* Ek Bilgiler */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Ek Bilgiler
            </h2>
            <div className="space-y-4">
              <Form.Item
                name="prerequisites"
                label={<span className="text-sm text-slate-700">Ön Koşullar</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Eğitime katılım için gerekli ön koşullar"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="materials"
                label={<span className="text-sm text-slate-700">Materyaller</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Eğitim materyalleri ve kaynaklar"
                  className="rounded-md"
                />
              </Form.Item>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/hr/trainings/${id}`}>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={updateTraining.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTraining.isPending ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
          </div>
        </Form>
      </div>
    </PageContainer>
  );
}
