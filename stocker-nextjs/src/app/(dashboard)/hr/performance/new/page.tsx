'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Select, DatePicker, Input, Row, Col, Rate } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, TrophyOutlined } from '@ant-design/icons';
import { useCreatePerformanceReview, useEmployees } from '@/lib/api/hooks/useHR';
import type { CreatePerformanceReviewDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;
const { TextArea } = Input;

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/performance')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <TrophyOutlined className="mr-2" />
            Yeni Performans Değerlendirmesi
          </Title>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={18}>
          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                    <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} placeholder="Tarih seçin" />
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
                    <Input placeholder="Örn: 2024 Q1, Yıllık 2024" />
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

              <Form.Item name="strengths" label="Güçlü Yönler">
                <TextArea rows={3} placeholder="Çalışanın güçlü yönlerini yazın" />
              </Form.Item>

              <Form.Item name="areasForImprovement" label="Gelişim Alanları">
                <TextArea rows={3} placeholder="Geliştirilmesi gereken alanları yazın" />
              </Form.Item>

              <Form.Item name="goals" label="Hedefler">
                <TextArea rows={3} placeholder="Gelecek dönem hedeflerini yazın" />
              </Form.Item>

              <Form.Item name="comments" label="Genel Yorumlar">
                <TextArea rows={3} placeholder="Ek yorumlar" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/performance')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createReview.isPending}
                >
                  Kaydet
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
