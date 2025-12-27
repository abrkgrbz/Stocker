'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Row, Col, Typography, Switch, Select } from 'antd';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import type { TrainingDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface TrainingFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: TrainingDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function TrainingForm({ form, initialValues, onFinish, loading }: TrainingFormProps) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dateRange: initialValues.startDate && initialValues.endDate
          ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
          : undefined,
      });
      setIsOnline(initialValues.isOnline || false);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{ isOnline: false, isMandatory: false, hasCertification: false }}
      className="training-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpenIcon className="w-16 h-16 text-white/90" />
              <p className="mt-4 text-lg font-medium text-white/90">Eğitim Programı</p>
              <p className="text-sm text-white/60">Çalışan gelişimi için eğitim tanımlayın</p>
            </div>
          </div>

          {/* Training Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Online Eğitim
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  {isOnline ? 'Çevrimiçi eğitim' : 'Yüz yüze eğitim'}
                </div>
              </div>
              <Form.Item name="isOnline" valuePropName="checked" noStyle>
                <Switch
                  checked={isOnline}
                  onChange={(val) => {
                    setIsOnline(val);
                    form.setFieldValue('isOnline', val);
                    if (!val) {
                      form.setFieldValue('onlineUrl', undefined);
                    }
                  }}
                  checkedChildren="Online"
                  unCheckedChildren="Yüz yüze"
                  style={{
                    backgroundColor: isOnline ? '#1890ff' : '#d9d9d9',
                    minWidth: '80px',
                  }}
                />
              </Form.Item>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Zorunlu Eğitim
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Tüm çalışanlar için zorunlu
                </div>
              </div>
              <Form.Item name="isMandatory" valuePropName="checked" noStyle>
                <Switch
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{ minWidth: '70px' }}
                />
              </Form.Item>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <Text strong className="text-gray-700">
                  Sertifikalı
                </Text>
                <div className="text-xs text-gray-400 mt-0.5">
                  Tamamlayanlara sertifika verilir
                </div>
              </div>
              <Form.Item name="hasCertification" valuePropName="checked" noStyle>
                <Switch
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  style={{ minWidth: '70px' }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.currentParticipants || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Katılımcı</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.maxParticipants || '-'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kapasite</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Training Title - Hero Input */}
          <div className="mb-8">
            <Form.Item
              name="title"
              rules={[
                { required: true, message: 'Eğitim başlığı zorunludur' },
                { max: 200, message: 'En fazla 200 karakter' },
              ]}
              className="mb-0"
            >
              <Input
                placeholder="Eğitim başlığı"
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
                placeholder="Eğitim açıklaması ekleyin..."
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

          {/* Provider & Instructor */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Sağlayıcı ve Eğitmen
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Eğitim Sağlayıcısı</div>
                <Form.Item name="provider" className="mb-0">
                  <Input placeholder="Şirket adı" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Eğitmen</div>
                <Form.Item name="instructor" className="mb-0">
                  <Input placeholder="Eğitmen adı" variant="filled" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Konum</div>
                <Form.Item name="location" className="mb-0">
                  <Input placeholder="Eğitim yeri veya Online" variant="filled" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Eğitim Türü</div>
                <Form.Item name="trainingType" className="mb-0">
                  <Input placeholder="Teknik, Davranışsal, vb." variant="filled" />
                </Form.Item>
              </Col>
            </Row>
            {isOnline && (
              <Row gutter={16} className="mt-4">
                <Col span={24}>
                  <div className="text-xs text-gray-400 mb-1">Online Eğitim URL'si *</div>
                  <Form.Item
                    name="onlineUrl"
                    className="mb-0"
                    rules={[
                      { required: isOnline, message: 'Online eğitimler için URL zorunludur' },
                      { type: 'url', message: 'Geçerli bir URL giriniz' },
                    ]}
                  >
                    <Input placeholder="https://zoom.us/j/..." variant="filled" />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Schedule */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Zamanlama
            </Text>
            <div className="text-xs text-gray-400 mb-1">Eğitim Tarihleri *</div>
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

          {/* Details */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              Detaylar
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Süre (Saat) *</div>
                <Form.Item
                  name="durationHours"
                  className="mb-0"
                  rules={[{ required: true, message: 'Süre zorunludur' }]}
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={1}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Maksimum Katılımcı</div>
                <Form.Item name="maxParticipants" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={1}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Maliyet</div>
                <Form.Item name="cost" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => parseFloat(String(value).replace(/₺\s?|(,*)/g, '')) as unknown as 0}
                    min={0}
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
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
