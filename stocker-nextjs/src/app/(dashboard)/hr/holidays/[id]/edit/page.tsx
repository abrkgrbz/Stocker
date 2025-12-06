'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, DatePicker, Row, Col, Spin, Empty, Switch } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { useHoliday, useUpdateHoliday } from '@/lib/api/hooks/useHR';
import type { UpdateHolidayDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EditHolidayPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: holiday, isLoading, error } = useHoliday(id);
  const updateHoliday = useUpdateHoliday();

  // Populate form when holiday data loads
  useEffect(() => {
    if (holiday) {
      form.setFieldsValue({
        name: holiday.name,
        date: holiday.date ? dayjs(holiday.date) : null,
        description: holiday.description,
        isRecurring: holiday.isRecurring,
      });
    }
  }, [holiday, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateHolidayDto = {
        name: values.name,
        date: values.date?.format('YYYY-MM-DD'),
        description: values.description,
        isRecurring: values.isRecurring,
      };

      await updateHoliday.mutateAsync({ id, data });
      router.push(`/hr/holidays/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !holiday) {
    return (
      <div className="p-6">
        <Empty description="Tatil günü bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/holidays')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/holidays/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <CalendarOutlined className="mr-2" />
              Tatil Günü Düzenle
            </Title>
            <Text type="secondary">{holiday.name}</Text>
          </div>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                <Button onClick={() => router.push(`/hr/holidays/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updateHoliday.isPending}
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
