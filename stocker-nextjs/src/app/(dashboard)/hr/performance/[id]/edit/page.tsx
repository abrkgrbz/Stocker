'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Select, DatePicker, Input, Row, Col, Spin, Empty, Rate } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined } from '@ant-design/icons';
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
        goals: review.goals,
        comments: review.comments,
      });
    }
  }, [review, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdatePerformanceReviewDto = {
        employeeId: values.employeeId,
        reviewerId: values.reviewerId,
        reviewDate: values.reviewDate?.format('YYYY-MM-DD'),
        reviewPeriod: values.reviewPeriod,
        overallScore: values.overallScore,
        strengths: values.strengths,
        areasForImprovement: values.areasForImprovement,
        goals: values.goals,
        comments: values.comments,
      };

      await updateReview.mutateAsync({ id, data });
      router.push(`/hr/performance/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="p-6">
        <Empty description="Değerlendirme bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/performance')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  if (review.status === 'Completed') {
    return (
      <div className="p-6">
        <Empty description="Bu değerlendirme düzenlenemez. Tamamlanmış değerlendirmeler düzenlenemez." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/hr/performance/${id}`)}>Detaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/hr/performance/${id}`)}
            />
            <div className="flex items-center gap-2">
              <TrophyOutlined className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Değerlendirme Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {review.employeeName || `Çalışan #${review.employeeId}`} - {review.reviewPeriod}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/performance/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateReview.isPending}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Değerlendirme Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="employeeId"
                    label="Çalışan"
                    rules={[{ required: true, message: 'Çalışan seçimi gerekli' }]}
                  >
                    <Select
                      placeholder="Çalışan seçin"
                      showSearch
                      optionFilterProp="children"
                      variant="filled"
                      options={employees.map((e) => ({
                        value: e.id,
                        label: e.fullName,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="reviewerId"
                    label="Değerlendiren"
                    rules={[{ required: true, message: 'Değerlendiren seçimi gerekli' }]}
                  >
                    <Select
                      placeholder="Değerlendiren seçin"
                      showSearch
                      optionFilterProp="children"
                      variant="filled"
                      options={employees.map((e) => ({
                        value: e.id,
                        label: e.fullName,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="reviewDate"
                    label="Değerlendirme Tarihi"
                    rules={[{ required: true, message: 'Tarih gerekli' }]}
                  >
                    <DatePicker
                      format="DD.MM.YYYY"
                      style={{ width: '100%' }}
                      placeholder="Tarih seçin"
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="reviewPeriod"
                    label="Değerlendirme Dönemi"
                    rules={[{ required: true, message: 'Dönem gerekli' }]}
                  >
                    <Input placeholder="Örn: 2024 Q1, Yıllık 2024" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="overallScore"
                    label="Genel Puan (1-10)"
                    rules={[{ required: true, message: 'Puan gerekli' }]}
                  >
                    <Rate count={10} allowHalf style={{ fontSize: 20 }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Evaluation Details */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Değerlendirme Detayları
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Form.Item name="strengths" label="Güçlü Yönler">
                <TextArea
                  rows={3}
                  placeholder="Çalışanın güçlü yönlerini yazın"
                  variant="filled"
                />
              </Form.Item>
              <Form.Item name="areasForImprovement" label="Gelişim Alanları">
                <TextArea
                  rows={3}
                  placeholder="Geliştirilmesi gereken alanları yazın"
                  variant="filled"
                />
              </Form.Item>
              <Form.Item name="goals" label="Hedefler">
                <TextArea rows={3} placeholder="Gelecek dönem hedeflerini yazın" variant="filled" />
              </Form.Item>
              <Form.Item name="comments" label="Genel Yorumlar" className="mb-0">
                <TextArea rows={3} placeholder="Ek yorumlar" variant="filled" />
              </Form.Item>
            </div>
          </div>

          {/* Hidden submit button for form.submit() */}
          <button type="submit" hidden />
        </Form>
      </div>
    </div>
  );
}
