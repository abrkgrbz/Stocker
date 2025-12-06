'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, DatePicker, InputNumber, Row, Col, Switch, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, BookOutlined } from '@ant-design/icons';
import { useCreateTraining } from '@/lib/api/hooks/useHR';
import type { CreateTrainingDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function NewTrainingPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createTraining = useCreateTraining();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateTrainingDto = {
        name: values.name,
        description: values.description,
        provider: values.provider,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        location: values.location,
        maxParticipants: values.maxParticipants,
        cost: values.cost,
        isActive: values.isActive ?? true,
      };

      await createTraining.mutateAsync(data);
      router.push('/hr/trainings');
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
                <BookOutlined className="mr-2" />
                Yeni Eğitim
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir eğitim programı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/trainings')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createTraining.isPending}
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
                  Eğitim Bilgileri
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Eğitim Adı"
                        rules={[{ required: true, message: 'Eğitim adı gerekli' }]}
                      >
                        <Input placeholder="Eğitim adı" variant="filled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="provider" label="Eğitim Sağlayıcısı">
                        <Input placeholder="Şirket veya eğitmen adı" variant="filled" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="description" label="Açıklama">
                    <TextArea rows={3} placeholder="Eğitim açıklaması" variant="filled" />
                  </Form.Item>
                </div>
              </div>

              {/* Schedule Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Zamanlama ve Konum
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="dateRange"
                        label="Eğitim Tarihleri"
                        rules={[{ required: true, message: 'Tarih aralığı gerekli' }]}
                      >
                        <RangePicker
                          format="DD.MM.YYYY"
                          style={{ width: '100%' }}
                          placeholder={['Başlangıç', 'Bitiş']}
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="location" label="Konum">
                        <Input placeholder="Eğitim yeri veya Online" variant="filled" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Details Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Detaylar
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item name="maxParticipants" label="Maksimum Katılımcı">
                        <InputNumber
                          placeholder="0"
                          style={{ width: '100%' }}
                          min={1}
                          variant="filled"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item name="cost" label="Maliyet">
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
                    <Col xs={24} sm={8}>
                      <Form.Item name="isActive" label="Durum" valuePropName="checked">
                        <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                      </Form.Item>
                    </Col>
                  </Row>
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
