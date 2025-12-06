'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Select, DatePicker, Input, Row, Col, Rate, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, TrophyOutlined } from '@ant-design/icons';
import { useCreatePerformanceReview, useEmployees } from '@/lib/api/hooks/useHR';
import type { CreatePerformanceReviewDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

export default function NewPerformancePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createReview = useCreatePerformanceReview();
  const { data: employees = [] } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreatePerformanceReviewDto = {
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

      await createReview.mutateAsync(data);
      router.push('/hr/performance');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <TrophyOutlined className="mr-2" />
                Yeni Performans Değerlendirmesi
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir performans değerlendirmesi oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/performance')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createReview.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={48}>
            <Col xs={24} lg={18}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Değerlendirme Bilgileri
                </Text>
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
                            label: `${e.firstName} ${e.lastName}`,
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
                            label: `${e.firstName} ${e.lastName}`,
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

              {/* Feedback Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Geri Bildirim
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item name="strengths" label="Güçlü Yönler">
                    <TextArea rows={3} placeholder="Çalışanın güçlü yönlerini yazın" variant="filled" />
                  </Form.Item>

                  <Form.Item name="areasForImprovement" label="Gelişim Alanları">
                    <TextArea rows={3} placeholder="Geliştirilmesi gereken alanları yazın" variant="filled" />
                  </Form.Item>
                </div>
              </div>

              {/* Goals and Comments Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Hedefler ve Yorumlar
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item name="goals" label="Hedefler">
                    <TextArea rows={3} placeholder="Gelecek dönem hedeflerini yazın" variant="filled" />
                  </Form.Item>

                  <Form.Item name="comments" label="Genel Yorumlar" className="mb-0">
                    <TextArea rows={3} placeholder="Ek yorumlar" variant="filled" />
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
