'use client';

import React, { useEffect } from 'react';
import { Form, Select, DatePicker, Input, Row, Col, Typography, InputNumber, Slider } from 'antd';
import { AimOutlined } from '@ant-design/icons';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { PerformanceGoalDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface GoalFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PerformanceGoalDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const GOAL_CATEGORIES = [
  { value: 'Professional', label: 'Profesyonel Gelişim' },
  { value: 'Technical', label: 'Teknik Beceriler' },
  { value: 'Leadership', label: 'Liderlik' },
  { value: 'Communication', label: 'İletişim' },
  { value: 'Project', label: 'Proje' },
  { value: 'Sales', label: 'Satış' },
  { value: 'Customer', label: 'Müşteri İlişkileri' },
  { value: 'Other', label: 'Diğer' },
];

export default function GoalForm({ form, initialValues, onFinish, loading }: GoalFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
        targetDate: initialValues.targetDate ? dayjs(initialValues.targetDate) : undefined,
      });
    } else {
      form.setFieldsValue({
        weight: 1,
        startDate: dayjs(),
      });
    }
  }, [form, initialValues]);

  const progress = Form.useWatch('progressPercentage', form) || 0;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="goal-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AimOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">Performans Hedefi</p>
              <p className="text-sm text-white/60">Çalışan hedeflerini belirleyin</p>
            </div>
          </div>

          {/* Progress Display for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 bg-purple-50/50 rounded-xl text-center border border-purple-100">
                <div className="text-3xl font-semibold text-purple-700">
                  %{initialValues.progressPercentage || 0}
                </div>
                <div className="text-xs text-purple-500 mt-1">İlerleme</div>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl text-center border border-blue-100">
                <div className="text-lg font-semibold text-blue-700">
                  {initialValues.status === 'NotStarted' && 'Başlamadı'}
                  {initialValues.status === 'InProgress' && 'Devam Ediyor'}
                  {initialValues.status === 'Completed' && 'Tamamlandı'}
                  {initialValues.status === 'Cancelled' && 'İptal'}
                </div>
                <div className="text-xs text-blue-500 mt-1">Durum</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Goal Info Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Hedef Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
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
                      label: e.fullName,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kategori</div>
                <Form.Item name="category" className="mb-4">
                  <Select
                    placeholder="Kategori seçin"
                    allowClear
                    variant="filled"
                    options={GOAL_CATEGORIES}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-xs text-gray-400 mb-1">Hedef Başlığı *</div>
            <Form.Item
              name="title"
              rules={[{ required: true, message: 'Gerekli' }]}
              className="mb-4"
            >
              <Input placeholder="Hedef başlığını girin" variant="filled" />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Dates & Weight */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Tarihler ve Ağırlık
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Başlangıç Tarihi *</div>
                <Form.Item
                  name="startDate"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Başlangıç"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Hedef Tarihi *</div>
                <Form.Item
                  name="targetDate"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Hedef tarih"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Ağırlık (1-10)</div>
                <Form.Item name="weight" className="mb-4">
                  <InputNumber min={1} max={10} style={{ width: '100%' }} variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Metrics Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Ölçüm Kriterleri
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Ölçüm Kriteri</div>
                <Form.Item name="metrics" className="mb-4">
                  <Input placeholder="Örn: Satış Adedi" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Hedef Değer</div>
                <Form.Item name="targetValue" className="mb-4">
                  <Input placeholder="Örn: 100 adet" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Mevcut Değer</div>
                <Form.Item name="currentValue" className="mb-4">
                  <Input placeholder="Örn: 50 adet" variant="filled" disabled={!initialValues} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Description */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Açıklama
            </Text>
            <div className="text-xs text-gray-400 mb-1">Hedef Açıklaması</div>
            <Form.Item name="description" className="mb-0">
              <TextArea rows={4} placeholder="Hedef hakkında detaylı açıklama..." variant="filled" />
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
