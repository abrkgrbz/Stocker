'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Select, DatePicker, Input, Rate, message } from 'antd';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { usePerformanceReview, useUpdatePerformanceReview, useEmployees } from '@/lib/api/hooks/useHR';
import type { UpdatePerformanceReviewDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditPerformancePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: review, isLoading, error } = usePerformanceReview(id);
  const updateReview = useUpdatePerformanceReview();
  const { data: employees = [] } = useEmployees();

  // Populate form when review data loads
  useEffect(() => {
    if (review) {
      form.setFieldsValue({
        employeeId: review.employeeId,
        reviewerId: review.reviewerId,
        reviewDate: review.reviewDate ? dayjs(review.reviewDate) : null,
        reviewPeriod: review.reviewPeriod,
        overallScore: review.overallScore,
        strengths: review.strengths,
        areasForImprovement: review.areasForImprovement,
        developmentPlan: review.developmentPlan,
        managerComments: review.managerComments,
      });
    }
  }, [review, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdatePerformanceReviewDto = {
        strengths: values.strengths,
        areasForImprovement: values.areasForImprovement,
        developmentPlan: values.developmentPlan,
        managerComments: values.managerComments,
      };

      await updateReview.mutateAsync({ id, data });
      message.success('Degerlendirme basariyla guncellendi');
      router.push(`/hr/performance/${id}`);
    } catch (error) {
      message.error('Guncelleme sirasinda bir hata olustu');
    }
  };

  // Check if review is completed (cannot edit)
  const isCompleted = review?.status === 'Completed';

  return (
    <FormPageLayout
      title="Degerlendirme Duzenle"
      subtitle={review ? `${review.employeeName || `Calisan #${review.employeeId}`} - ${review.reviewPeriod}` : 'Yukleniyor...'}
      icon={<TrophyIcon className="w-5 h-5" />}
      cancelPath={`/hr/performance/${id}`}
      loading={updateReview.isPending}
      onSave={() => form.submit()}
      saveButtonText="Guncelle"
      isDataLoading={isLoading}
      dataError={!!error || !review || isCompleted}
      errorMessage={isCompleted ? 'Duzenlenemez' : 'Kayit Bulunamadi'}
      errorDescription={isCompleted ? 'Bu degerlendirme duzenlenemez. Tamamlanmis degerlendirmeler duzenlenemez.' : 'Istenen kayit bulunamadi veya bir hata olustu.'}
      maxWidth="max-w-4xl"
    >
      <div className="bg-white border border-slate-200 rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6"
        >
          {/* Degerlendirme Bilgileri */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Degerlendirme Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="employeeId"
                label={<span className="text-sm text-slate-700">Calisan</span>}
                rules={[{ required: true, message: 'Calisan secimi zorunludur' }]}
              >
                <Select
                  placeholder="Calisan secin"
                  showSearch
                  optionFilterProp="children"
                  className="w-full"
                  options={employees.map((e) => ({
                    value: e.id,
                    label: e.fullName,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="reviewerId"
                label={<span className="text-sm text-slate-700">Degerlendiren</span>}
                rules={[{ required: true, message: 'Degerlendiren secimi zorunludur' }]}
              >
                <Select
                  placeholder="Degerlendiren secin"
                  showSearch
                  optionFilterProp="children"
                  className="w-full"
                  options={employees.map((e) => ({
                    value: e.id,
                    label: e.fullName,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="reviewDate"
                label={<span className="text-sm text-slate-700">Degerlendirme Tarihi</span>}
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Tarih secin"
                  className="w-full rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="reviewPeriod"
                label={<span className="text-sm text-slate-700">Degerlendirme Donemi</span>}
                rules={[{ required: true, message: 'Donem zorunludur' }]}
              >
                <Input placeholder="Orn: 2024 Q1, Yillik 2024" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="overallScore"
                label={<span className="text-sm text-slate-700">Genel Puan (1-10)</span>}
                rules={[{ required: true, message: 'Puan zorunludur' }]}
                className="md:col-span-2"
              >
                <Rate count={10} allowHalf style={{ fontSize: 20 }} />
              </Form.Item>
            </div>
          </div>

          {/* Degerlendirme Detaylari */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Degerlendirme Detaylari
            </h2>
            <div className="space-y-4">
              <Form.Item
                name="strengths"
                label={<span className="text-sm text-slate-700">Guclu Yonler</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Calisanin guclu yonlerini yazin"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="areasForImprovement"
                label={<span className="text-sm text-slate-700">Gelisim Alanlari</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Gelistirilmesi gereken alanlari yazin"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="developmentPlan"
                label={<span className="text-sm text-slate-700">Gelisim Plani</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Gelisim planini yazin"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="managerComments"
                label={<span className="text-sm text-slate-700">Yonetici Yorumlari</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Yonetici yorumlari"
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
