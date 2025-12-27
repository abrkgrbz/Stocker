'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, TimePicker, InputNumber, Row, Col, Typography, Switch } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { ShiftDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface ShiftFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ShiftDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function ShiftForm({ form, initialValues, onFinish, loading }: ShiftFormProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startTime: initialValues.startTime ? dayjs(initialValues.startTime, 'HH:mm:ss') : undefined,
        endTime: initialValues.endTime ? dayjs(initialValues.endTime, 'HH:mm:ss') : undefined,
      });
      setIsActive(initialValues.isActive ?? true);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{ isActive: true }}
      className="shift-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ClockIcon className="w-16 h-16 text-white/90" />
              <p className="mt-4 text-lg font-medium text-white/90">Vardiya Bilgileri</p>
              <p className="text-sm text-white/60">Çalışma saatlerini düzenleyin</p>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Durum
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isActive ? 'Vardiya aktif' : 'Vardiya pasif'}
                </div>
              </div>
              <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                <Switch
                  checked={isActive}
                  onChange={(val) => {
                    setIsActive(val);
                    form.setFieldValue('isActive', val);
                  }}
                  checkedChildren="Aktif"
                  unCheckedChildren="Pasif"
                  style={{
                    backgroundColor: isActive ? '#52c41a' : '#d9d9d9',
                    minWidth: '80px',
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-1 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.employeeCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Bu Vardiyada Çalışan</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Shift Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'Vardiya adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Vardiya adı"
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
                placeholder="Vardiya açıklaması ekleyin..."
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

          {/* Basic Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Temel Bilgiler
            </Text>
            <Row gutter={16}>
              <Col span={24}>
                <div className="text-xs text-gray-400 mb-1">Vardiya Kodu *</div>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Örn: SABAH, AKSAM, GECE"
                    variant="filled"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Time Settings */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Zaman Ayarları
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Başlangıç *</div>
                <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Saat"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Bitiş *</div>
                <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Saat"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Mola (dk)</div>
                <Form.Item name="breakDurationMinutes" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={0}
                    max={180}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-xs text-gray-400 mt-2">
              Çalışma saatleri ve mola süresi
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
