'use client';

import React, { useEffect } from 'react';
import { Form, Select, DatePicker, Input, Row, Col, Typography, Rate } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { PerformanceReviewDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface PerformanceReviewFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PerformanceReviewDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function PerformanceReviewForm({ form, initialValues, onFinish, loading }: PerformanceReviewFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        reviewDate: initialValues.reviewDate ? dayjs(initialValues.reviewDate) : undefined,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="performance-review-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrophyOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">Performans Değerlendirmesi</p>
              <p className="text-sm text-white/60">Çalışan performansını değerlendirin</p>
            </div>
          </div>

          {/* Score Display for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 bg-purple-50/50 rounded-xl text-center border border-purple-100">
                <div className="text-3xl font-semibold text-purple-700">
                  {initialValues.overallScore || 0}/10
                </div>
                <div className="text-xs text-purple-500 mt-1">Genel Puan</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Review Info Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Değerlendirme Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Çalışan *</div>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Çalışan seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    disabled={!!initialValues}
                    options={employees.map((e) => ({
                      value: e.id,
                      label: `${e.firstName} ${e.lastName}`,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Değerlendiren *</div>
                <Form.Item
                  name="reviewerId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={employees.map((e) => ({
                      value: e.id,
                      label: `${e.firstName} ${e.lastName}`,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Tarih *</div>
                <Form.Item
                  name="reviewDate"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Period & Score */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Dönem ve Puan
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Değerlendirme Dönemi *</div>
                <Form.Item
                  name="reviewPeriod"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Input placeholder="Örn: 2024 Q1, Yıllık 2024" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Genel Puan (1-10) *</div>
                <Form.Item
                  name="overallScore"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Rate count={10} allowHalf style={{ fontSize: 20 }} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Feedback Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Geri Bildirim
            </Text>
            <div className="text-xs text-gray-400 mb-1">Güçlü Yönler</div>
            <Form.Item name="strengths" className="mb-4">
              <TextArea rows={3} placeholder="Çalışanın güçlü yönleri..." variant="filled" />
            </Form.Item>
            <div className="text-xs text-gray-400 mb-1">Gelişim Alanları</div>
            <Form.Item name="areasForImprovement" className="mb-0">
              <TextArea rows={3} placeholder="Geliştirilmesi gereken alanlar..." variant="filled" />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Goals & Comments */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Hedefler ve Yorumlar
            </Text>
            <div className="text-xs text-gray-400 mb-1">Hedefler</div>
            <Form.Item name="goals" className="mb-4">
              <TextArea rows={3} placeholder="Gelecek dönem hedefleri..." variant="filled" />
            </Form.Item>
            <div className="text-xs text-gray-400 mb-1">Genel Yorumlar</div>
            <Form.Item name="comments" className="mb-0">
              <TextArea rows={3} placeholder="Ek yorumlar..." variant="filled" />
            </Form.Item>
          </div>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
