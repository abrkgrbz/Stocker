'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Row, Col, Typography, Switch } from 'antd';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import type { LeaveTypeDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

interface LeaveTypeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LeaveTypeDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function LeaveTypeForm({ form, initialValues, onFinish, loading }: LeaveTypeFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isPaid, setIsPaid] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsPaid(initialValues.isPaid ?? true);
      setRequiresApproval(initialValues.requiresApproval ?? true);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{ isActive: true, isPaid: true, requiresApproval: true, defaultDays: 0 }}
      className="leave-type-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DocumentTextIcon className="w-16 h-16 text-white/90" />
              <p className="mt-4 text-lg font-medium text-white/90">İzin Türü</p>
              <p className="text-sm text-white/60">İzin politikalarını tanımlayın</p>
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
                  {isActive ? 'İzin türü aktif' : 'İzin türü pasif'}
                </div>
              </div>
              <Form.Item name="isActive" valuePropName="checked" noStyle>
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

          {/* Settings */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Ücretli
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isPaid ? 'Ücretli izin' : 'Ücretsiz izin'}
                </div>
              </div>
              <Form.Item name="isPaid" valuePropName="checked" noStyle>
                <Switch
                  checked={isPaid}
                  onChange={(val) => {
                    setIsPaid(val);
                    form.setFieldValue('isPaid', val);
                  }}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{
                    backgroundColor: isPaid ? '#1890ff' : '#d9d9d9',
                    minWidth: '80px',
                  }}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Onay Gerekli
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {requiresApproval ? 'Onay süreci var' : 'Onay gerekmez'}
                </div>
              </div>
              <Form.Item name="requiresApproval" valuePropName="checked" noStyle>
                <Switch
                  checked={requiresApproval}
                  onChange={(val) => {
                    setRequiresApproval(val);
                    form.setFieldValue('requiresApproval', val);
                  }}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{
                    backgroundColor: requiresApproval ? '#faad14' : '#d9d9d9',
                    minWidth: '80px',
                  }}
                />
              </Form.Item>
            </div>
          </div>
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Leave Type Name - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="name"
              rules={[
                { required: true, message: 'İzin türü adı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="İzin türü adı"
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
                placeholder="İzin türü açıklaması ekleyin..."
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
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">İzin Türü Kodu *</div>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Örn: YILLIK, HASTALIK"
                    variant="filled"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Varsayılan Gün *</div>
                <Form.Item
                  name="defaultDays"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={0}
                    max={365}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className="text-xs text-gray-400 mt-2">
              Varsayılan gün sayısı, her çalışana yıllık olarak tanınan izin hakkıdır
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
