'use client';

import React, { useEffect } from 'react';
import { Form, Select, DatePicker, InputNumber, Input, Row, Col, Typography } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { ExpenseDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface ExpenseFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ExpenseDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function ExpenseForm({ form, initialValues, onFinish, loading }: ExpenseFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        expenseDate: initialValues.expenseDate ? dayjs(initialValues.expenseDate) : undefined,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="expense-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WalletOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">Harcama Kaydı</p>
              <p className="text-sm text-white/60">Gider takibi yapın</p>
            </div>
          </div>

          {/* Category Info */}
          <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
            <div className="text-sm font-medium text-orange-700 mb-1">Kategoriler</div>
            <div className="text-xs text-orange-600">
              Seyahat, yemek, malzeme, ekipman, eğitim, iletişim, ulaşım, konaklama ve diğer
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-1 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  ₺{initialValues.amount?.toLocaleString('tr-TR') || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Tutar</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Expense Info Section */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Harcama Bilgileri
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
                <div className="text-xs text-gray-400 mb-1">Tarih *</div>
                <Form.Item
                  name="expenseDate"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
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
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Amount & Category */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Tutar ve Kategori
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kategori *</div>
                <Form.Item
                  name="category"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <Select
                    placeholder="Kategori seçin"
                    variant="filled"
                    options={[
                      { value: 'Travel', label: 'Seyahat' },
                      { value: 'Meals', label: 'Yemek' },
                      { value: 'Supplies', label: 'Malzeme' },
                      { value: 'Equipment', label: 'Ekipman' },
                      { value: 'Training', label: 'Eğitim' },
                      { value: 'Communication', label: 'İletişim' },
                      { value: 'Transportation', label: 'Ulaşım' },
                      { value: 'Accommodation', label: 'Konaklama' },
                      { value: 'Other', label: 'Diğer' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Tutar *</div>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-4"
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                    variant="filled"
                  />
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
            <Form.Item
              name="description"
              rules={[{ required: true, message: 'Gerekli' }]}
              className="mb-4"
            >
              <Input placeholder="Harcama açıklaması" variant="filled" />
            </Form.Item>
            <Form.Item name="notes" className="mb-0">
              <TextArea rows={3} placeholder="Ek notlar..." variant="filled" />
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
