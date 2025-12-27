'use client';

import React, { useEffect } from 'react';
import { Form, Select, TimePicker, Row, Col, Typography } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

const { Text } = Typography;

interface CheckInFormValues {
  employeeId: number;
  checkInTime?: ReturnType<typeof dayjs>;
}

interface AttendanceCheckInFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CheckInFormValues;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function AttendanceCheckInForm({ form, initialValues, onFinish, loading }: AttendanceCheckInFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="attendance-checkin-form-modern"
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
              <ClockIcon className="w-16 h-16 text-white/90" />
              <p className="mt-4 text-lg font-medium text-white/90">Manuel Giriş Kaydı</p>
              <p className="text-sm text-white/60">Çalışan için giriş kaydı oluşturun</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="text-sm font-medium text-blue-700 mb-1">Bilgi</div>
            <div className="text-xs text-blue-600">
              Giriş saati boş bırakılırsa, şu anki saat kullanılacaktır.
            </div>
          </div>
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Check-in Info Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Giriş Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Çalışan *</div>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Çalışan seçimi gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Çalışan seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Giriş Saati</div>
                <Form.Item name="checkInTime" className="mb-4">
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Şu anki saat"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Additional Info */}
          <div className="mb-8">
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <div className="text-sm text-gray-600">
                Manuel giriş kaydı oluşturulduktan sonra, çıkış kaydı için yoklama detay sayfasını kullanabilirsiniz.
              </div>
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
