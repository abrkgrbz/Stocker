'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, TimePicker, InputNumber, Row, Col, Switch, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useCreateShift } from '@/lib/api/hooks/useHR';
import type { CreateShiftDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

export default function NewShiftPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createShift = useCreateShift();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateShiftDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        startTime: values.startTime?.format('HH:mm:ss'),
        endTime: values.endTime?.format('HH:mm:ss'),
        breakDurationMinutes: values.breakDurationMinutes,
        isActive: values.isActive ?? true,
      };

      await createShift.mutateAsync(data);
      router.push('/hr/shifts');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <ClockCircleOutlined className="mr-2" />
                Yeni Vardiya
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir vardiya tanımlayın</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/shifts')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createShift.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
        >
          <Row gutter={48}>
            <Col xs={24} lg={16}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Vardiya Bilgileri
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Vardiya Adı"
                        rules={[{ required: true, message: 'Vardiya adı gerekli' }]}
                      >
                        <Input placeholder="Örn: Sabah Vardiyası" variant="filled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="code"
                        label="Vardiya Kodu"
                        rules={[{ required: true, message: 'Vardiya kodu gerekli' }]}
                      >
                        <Input placeholder="Örn: SABAH, AKSAM, GECE" variant="filled" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="description" label="Açıklama">
                    <TextArea rows={3} placeholder="Vardiya açıklaması" variant="filled" />
                  </Form.Item>
                </div>
              </div>

              {/* Time Settings Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Zaman Ayarları
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="startTime"
                        label="Başlangıç Saati"
                        rules={[{ required: true, message: 'Başlangıç saati gerekli' }]}
                      >
                        <TimePicker
                          format="HH:mm"
                          style={{ width: '100%' }}
                          placeholder="Saat seçin"
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="endTime"
                        label="Bitiş Saati"
                        rules={[{ required: true, message: 'Bitiş saati gerekli' }]}
                      >
                        <TimePicker
                          format="HH:mm"
                          style={{ width: '100%' }}
                          placeholder="Saat seçin"
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item name="breakDurationMinutes" label="Mola Süresi (dk)">
                        <InputNumber
                          placeholder="Dakika"
                          style={{ width: '100%' }}
                          min={0}
                          max={180}
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Durum
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item name="isActive" label="Vardiya Durumu" valuePropName="checked" className="mb-0">
                    <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
