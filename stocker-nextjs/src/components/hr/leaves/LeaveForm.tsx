'use client';

import React, { useEffect } from 'react';
import { Form, Select, DatePicker, Input, Row, Col, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useEmployees, useLeaveTypes } from '@/lib/api/hooks/useHR';
import type { LeaveDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface LeaveFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LeaveDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function LeaveForm({ form, initialValues, onFinish, loading }: LeaveFormProps) {
  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useLeaveTypes();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dateRange: initialValues.startDate && initialValues.endDate
          ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
          : undefined,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="leave-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarOutlined style={{ fontSize: '64px', color: 'rgba(0,0,0,0.6)' }} />
              <p className="mt-4 text-lg font-medium text-gray-700">İzin Talebi</p>
              <p className="text-sm text-gray-500">Çalışanlar için izin kaydı</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="text-sm font-medium text-blue-700 mb-1">Bilgi</div>
            <div className="text-xs text-blue-600">
              İzin talebi oluşturulduktan sonra onay sürecine alınacaktır.
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-1 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.totalDays || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Toplam Gün</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Leave Info Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              İzin Bilgileri
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
                      label: `${e.firstName} ${e.lastName}`,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">İzin Türü *</div>
                <Form.Item
                  name="leaveTypeId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="İzin türü seçin"
                    variant="filled"
                    options={leaveTypes.map((lt) => ({
                      value: lt.id,
                      label: lt.name,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Date Range */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Tarih Aralığı
            </Text>
            <div className="text-xs text-gray-400 mb-1">İzin Tarihleri *</div>
            <Form.Item
              name="dateRange"
              rules={[{ required: true, message: 'Gerekli' }]}
              className="mb-0"
            >
              <RangePicker
                format="DD.MM.YYYY"
                style={{ width: '100%' }}
                placeholder={['Başlangıç', 'Bitiş']}
                variant="filled"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Reason */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              İzin Nedeni
            </Text>
            <Form.Item
              name="reason"
              rules={[{ required: true, message: 'Gerekli' }]}
              className="mb-0"
            >
              <TextArea
                rows={4}
                placeholder="İzin talebinizin nedenini açıklayın..."
                variant="filled"
              />
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
