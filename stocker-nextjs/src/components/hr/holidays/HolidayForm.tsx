'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Row, Col, Typography, Switch } from 'antd';
import { CalendarIcon } from '@heroicons/react/24/outline';
import type { HolidayDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface HolidayFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: HolidayDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function HolidayForm({ form, initialValues, onFinish, loading }: HolidayFormProps) {
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : undefined,
      });
      setIsRecurring(initialValues.isRecurring ?? false);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{ isRecurring: false }}
      className="holiday-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarIcon className="w-16 h-16 text-white/90" />
              <p className="mt-4 text-lg font-medium text-white/90">Tatil Günü</p>
              <p className="text-sm text-white/60">Resmi tatil tanımlayın</p>
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Yıllık Tekrar
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isRecurring ? 'Her yıl tekrarlanır' : 'Tek seferlik'}
                </div>
              </div>
              <Form.Item name="isRecurring" valuePropName="checked" noStyle>
                <Switch
                  checked={isRecurring}
                  onChange={(val) => {
                    setIsRecurring(val);
                    form.setFieldValue('isRecurring', val);
                  }}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{
                    backgroundColor: isRecurring ? '#52c41a' : '#d9d9d9',
                    minWidth: '80px',
                  }}
                />
              </Form.Item>
            </div>
          </div>
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Holiday Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Tatil adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Tatil adı"
                variant="borderless"
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  padding: '0',
                  color: '#1a1a1a',
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
            <Form.Item name="description" className="mb-0 mt-2">
              <TextArea
                placeholder="Tatil açıklaması ekleyin..."
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  fontSize: '15px',
                  padding: '0',
                  color: '#666',
                  resize: 'none',
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Date */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Tarih Bilgisi
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Tatil Tarihi *</div>
                <Form.Item
                  name="date"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
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
            <div className="text-xs text-gray-400 mt-2">
              Yıllık tekrar seçeneği ile her yıl aynı tarihte otomatik oluşturulur
            </div>
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
