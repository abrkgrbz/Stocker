'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Row, Col, Typography, Switch, InputNumber } from 'antd';
import { SafetyCertificateOutlined, DollarOutlined } from '@ant-design/icons';
import { useDepartments } from '@/lib/api/hooks/useHR';
import type { PositionDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

interface PositionFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PositionDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function PositionForm({ form, initialValues, onFinish, loading }: PositionFormProps) {
  const [isActive, setIsActive] = useState(true);

  const { data: departments = [] } = useDepartments();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="position-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SafetyCertificateOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">Pozisyon Bilgileri</p>
              <p className="text-sm text-white/60">Kariyer yapısını tanımlayın</p>
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
                  {isActive ? 'Pozisyon aktif' : 'Pozisyon pasif'}
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
                <div className="text-xs text-gray-500 mt-1">Bu Pozisyondaki Çalışan</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Position Title - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="title"
              rules={[
                { required: true, message: 'Pozisyon adı zorunludur' },
                { max: 100, message: 'En fazla 100 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Pozisyon adı"
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
                placeholder="Pozisyon açıklaması ekleyin..."
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
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Pozisyon Kodu *</div>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Input placeholder="Örn: DEV, MGR" variant="filled" disabled={!!initialValues} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Departman *</div>
                <Form.Item
                  name="departmentId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Departman seçin"
                    showSearch
                    optionFilterProp="label"
                    variant="filled"
                    options={departments.map((d) => ({ value: d.id, label: d.name }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Seviye</div>
                <Form.Item
                  name="level"
                  initialValue={0}
                  className="mb-0"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Salary Range */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Maaş Aralığı
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Minimum</div>
                <Form.Item name="minSalary" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    variant="filled"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    addonAfter="TRY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Maksimum</div>
                <Form.Item name="maxSalary" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    variant="filled"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    addonAfter="TRY"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Requirements & Responsibilities */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Gereksinimler ve Sorumluluklar
            </Text>
            <div className="text-xs text-gray-400 mb-1">Gereksinimler</div>
            <Form.Item name="requirements" className="mb-4">
              <TextArea rows={3} placeholder="Pozisyon için gerekli nitelikler" variant="filled" />
            </Form.Item>
            <div className="text-xs text-gray-400 mb-1">Sorumluluklar</div>
            <Form.Item name="responsibilities" className="mb-0">
              <TextArea rows={3} placeholder="Pozisyonun sorumlulukları" variant="filled" />
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
