'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, DatePicker, Row, Col, Switch, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { useCreateHoliday } from '@/lib/api/hooks/useHR';
import type { CreateHolidayDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

export default function NewHolidayPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createHoliday = useCreateHoliday();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateHolidayDto = {
        name: values.name,
        date: values.date?.format('YYYY-MM-DD'),
        description: values.description,
        isRecurring: values.isRecurring ?? false,
      };

      await createHoliday.mutateAsync(data);
      router.push('/hr/holidays');
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
                <CalendarOutlined className="mr-2" />
                Yeni Tatil Günü
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir tatil günü ekleyin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/holidays')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createHoliday.isPending}
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
          initialValues={{ isRecurring: false }}
        >
          <Row gutter={48}>
            <Col xs={24} lg={16}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Tatil Bilgileri
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Tatil Adı"
                        rules={[{ required: true, message: 'Tatil adı gerekli' }]}
                      >
                        <Input placeholder="Örn: Yılbaşı, Ramazan Bayramı" variant="filled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="date"
                        label="Tarih"
                        rules={[{ required: true, message: 'Tarih gerekli' }]}
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

                  <Form.Item name="description" label="Açıklama">
                    <TextArea rows={3} placeholder="Tatil günü açıklaması" variant="filled" />
                  </Form.Item>
                </div>
              </div>

              {/* Settings Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Ayarlar
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Yıllık Tekrarlayan</div>
                      <div className="text-xs text-gray-400">Her yıl aynı tarihte tekrarlansın</div>
                    </div>
                    <Form.Item name="isRecurring" valuePropName="checked" noStyle>
                      <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                    </Form.Item>
                  </div>
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
