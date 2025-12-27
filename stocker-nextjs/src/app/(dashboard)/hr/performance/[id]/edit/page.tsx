'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Select, DatePicker, Input, Rate, message, Spin } from 'antd';
import { PageContainer } from '@/components/patterns';
import {
  ArrowLeftIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
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
      message.success('Değerlendirme başarıyla güncellendi');
      router.push(`/hr/performance/${id}`);
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

  if (error || !review) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Değerlendirme bulunamadı</p>
          <Link href="/hr/performance" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Dön
          </Link>
        </div>
      </PageContainer>
    );
  }

  if (review.status === 'Completed') {
    return (
      <PageContainer maxWidth="3xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Bu değerlendirme düzenlenemez. Tamamlanmış değerlendirmeler düzenlenemez.</p>
          <Link href={`/hr/performance/${id}`} className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Detaya Dön
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
          href={`/hr/performance/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Detaya Dön
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <TrophyIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Değerlendirme Düzenle</h1>
            <p className="text-sm text-slate-500 mt-1">
              {review.employeeName || `Çalışan #${review.employeeId}`} - {review.reviewPeriod}
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
          {/* Değerlendirme Bilgileri */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Değerlendirme Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="employeeId"
                label={<span className="text-sm text-slate-700">Çalışan</span>}
                rules={[{ required: true, message: 'Çalışan seçimi zorunludur' }]}
              >
                <Select
                  placeholder="Çalışan seçin"
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
                label={<span className="text-sm text-slate-700">Değerlendiren</span>}
                rules={[{ required: true, message: 'Değerlendiren seçimi zorunludur' }]}
              >
                <Select
                  placeholder="Değerlendiren seçin"
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
                label={<span className="text-sm text-slate-700">Değerlendirme Tarihi</span>}
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Tarih seçin"
                  className="w-full rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="reviewPeriod"
                label={<span className="text-sm text-slate-700">Değerlendirme Dönemi</span>}
                rules={[{ required: true, message: 'Dönem zorunludur' }]}
              >
                <Input placeholder="Örn: 2024 Q1, Yıllık 2024" className="rounded-md" />
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

          {/* Değerlendirme Detayları */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Değerlendirme Detayları
            </h2>
            <div className="space-y-4">
              <Form.Item
                name="strengths"
                label={<span className="text-sm text-slate-700">Güçlü Yönler</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Çalışanın güçlü yönlerini yazın"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="areasForImprovement"
                label={<span className="text-sm text-slate-700">Gelişim Alanları</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Geliştirilmesi gereken alanları yazın"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="developmentPlan"
                label={<span className="text-sm text-slate-700">Gelişim Planı</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Gelişim planını yazın"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="managerComments"
                label={<span className="text-sm text-slate-700">Yönetici Yorumları</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Yönetici yorumları"
                  className="rounded-md"
                />
              </Form.Item>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/hr/performance/${id}`}>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={updateReview.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateReview.isPending ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
          </div>
        </Form>
      </div>
    </PageContainer>
  );
}
