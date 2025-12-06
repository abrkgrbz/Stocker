'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, DatePicker, InputNumber, Row, Col, Switch } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, BookOutlined } from '@ant-design/icons';
import { useCreateTraining } from '@/lib/api/hooks/useHR';
import type { CreateTrainingDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;
const { TextArea } = Input;
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/trainings')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <BookOutlined className="mr-2" />
            Yeni Eğitim
          </Title>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ isActive: true }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Eğitim Adı"
                    rules={[{ required: true, message: 'Eğitim adı gerekli' }]}
                  >
                    <Input placeholder="Eğitim adı" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="provider" label="Eğitim Sağlayıcısı">
                    <Input placeholder="Şirket veya eğitmen adı" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Eğitim açıklaması" />
              </Form.Item>

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
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="location" label="Konum">
                    <Input placeholder="Eğitim yeri veya Online" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="maxParticipants" label="Maksimum Katılımcı">
                    <InputNumber placeholder="0" style={{ width: '100%' }} min={1} />
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
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="isActive" label="Durum" valuePropName="checked">
                    <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/trainings')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createTraining.isPending}
                >
                  Kaydet
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
