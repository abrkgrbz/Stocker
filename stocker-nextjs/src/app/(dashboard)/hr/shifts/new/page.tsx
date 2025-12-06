'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, TimePicker, InputNumber, Row, Col, Switch } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useCreateShift } from '@/lib/api/hooks/useHR';
import type { CreateShiftDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/shifts')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <ClockCircleOutlined className="mr-2" />
            Yeni Vardiya
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
                    label="Vardiya Adı"
                    rules={[{ required: true, message: 'Vardiya adı gerekli' }]}
                  >
                    <Input placeholder="Örn: Sabah Vardiyası" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="code"
                    label="Vardiya Kodu"
                    rules={[{ required: true, message: 'Vardiya kodu gerekli' }]}
                  >
                    <Input placeholder="Örn: SABAH, AKSAM, GECE" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Vardiya açıklaması" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="startTime"
                    label="Başlangıç Saati"
                    rules={[{ required: true, message: 'Başlangıç saati gerekli' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Saat seçin" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="endTime"
                    label="Bitiş Saati"
                    rules={[{ required: true, message: 'Bitiş saati gerekli' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Saat seçin" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="breakDurationMinutes" label="Mola Süresi (dk)">
                    <InputNumber placeholder="Dakika" style={{ width: '100%' }} min={0} max={180} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="isActive" label="Durum" valuePropName="checked">
                <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/shifts')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createShift.isPending}
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
