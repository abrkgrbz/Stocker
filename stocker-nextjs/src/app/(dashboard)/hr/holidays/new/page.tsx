'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, DatePicker, Row, Col, Switch } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { useCreateHoliday } from '@/lib/api/hooks/useHR';
import type { CreateHolidayDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;
const { TextArea } = Input;

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/holidays')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <CalendarOutlined className="mr-2" />
            Yeni Tatil Günü
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
              initialValues={{ isRecurring: false }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Tatil Adı"
                    rules={[{ required: true, message: 'Tatil adı gerekli' }]}
                  >
                    <Input placeholder="Örn: Yılbaşı, Ramazan Bayramı" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="date"
                    label="Tarih"
                    rules={[{ required: true, message: 'Tarih gerekli' }]}
                  >
                    <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} placeholder="Tarih seçin" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Tatil günü açıklaması" />
              </Form.Item>

              <Form.Item name="isRecurring" label="Yıllık Tekrarlayan" valuePropName="checked">
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/holidays')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createHoliday.isPending}
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
