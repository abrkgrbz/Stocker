'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, DatePicker, InputNumber, Switch, Select, message } from 'antd';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
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
      message.success('Egitim basariyla guncellendi');
      router.push(`/hr/trainings/${id}`);
    } catch (error) {
      message.error('Guncelleme sirasinda bir hata olustu');
    }
  };

  return (
    <FormPageLayout
      title="Egitim Duzenle"
      subtitle={training?.title || 'Yukleniyor...'}
      icon={<AcademicCapIcon className="w-5 h-5" />}
      cancelPath={`/hr/trainings/${id}`}
      loading={updateTraining.isPending}
      onSave={() => form.submit()}
      saveButtonText="Guncelle"
      isDataLoading={isLoading}
      dataError={!!error || !training}
      errorMessage="Egitim Bulunamadi"
      errorDescription="Istenen egitim bulunamadi veya bir hata olustu."
      maxWidth="max-w-4xl"
    >
      <div className="bg-white border border-slate-200 rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6"
        >
          {/* Egitim Bilgileri */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Egitim Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="title"
                label={<span className="text-sm text-slate-700">Egitim Adi</span>}
                rules={[{ required: true, message: 'Egitim adi zorunludur' }]}
              >
                <Input placeholder="Egitim adi" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="trainingType"
                label={<span className="text-sm text-slate-700">Egitim Turu</span>}
              >
                <Input placeholder="Orn: Teknik, Soft Skills" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="provider"
                label={<span className="text-sm text-slate-700">Egitim Saglayicisi</span>}
              >
                <Input placeholder="Sirket veya kurulus adi" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="instructor"
                label={<span className="text-sm text-slate-700">Egitmen</span>}
              >
                <Input placeholder="Egitmen adi" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-700">Aciklama</span>}
                className="md:col-span-2"
              >
                <TextArea rows={3} placeholder="Egitim aciklamasi" className="rounded-md" />
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
                label={<span className="text-sm text-slate-700">Egitim Tarihleri</span>}
              >
                <RangePicker
                  format="DD.MM.YYYY"
                  placeholder={['Baslangic', 'Bitis']}
                  className="w-full rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="durationHours"
                label={<span className="text-sm text-slate-700">Sure (Saat)</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="isOnline"
                label={<span className="text-sm text-slate-700">Online Egitim</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="location"
                label={<span className="text-sm text-slate-700">Konum</span>}
              >
                <Input placeholder="Egitim yeri" className="rounded-md" />
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
                label={<span className="text-sm text-slate-700">Maks. Katilimci</span>}
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
                  placeholder="Secin"
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
                label={<span className="text-sm text-slate-700">Zorunlu Egitim</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
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
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="certificationValidityMonths"
                label={<span className="text-sm text-slate-700">Gecerlilik (Ay)</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="passingScore"
                label={<span className="text-sm text-slate-700">Gecme Puani</span>}
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
                label={<span className="text-sm text-slate-700">On Kosullar</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Egitime katilim icin gerekli on kosullar"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="materials"
                label={<span className="text-sm text-slate-700">Materyaller</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Egitim materyalleri ve kaynaklar"
                  className="rounded-md"
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </FormPageLayout>
  );
}
