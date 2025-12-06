'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, TimePicker, InputNumber, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useShift, useUpdateShift } from '@/lib/api/hooks/useHR';
import type { UpdateShiftDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EditShiftPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: shift, isLoading, error } = useShift(id);
  const updateShift = useUpdateShift();

  // Populate form when shift data loads
  useEffect(() => {
    if (shift) {
      form.setFieldsValue({
        name: shift.name,
        code: shift.code,
        description: shift.description,
        startTime: shift.startTime ? dayjs(shift.startTime, 'HH:mm:ss') : null,
        endTime: shift.endTime ? dayjs(shift.endTime, 'HH:mm:ss') : null,
        breakDurationMinutes: shift.breakDurationMinutes,
      });
    }
  }, [shift, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateShiftDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        startTime: values.startTime?.format('HH:mm:ss'),
        endTime: values.endTime?.format('HH:mm:ss'),
        breakDurationMinutes: values.breakDurationMinutes,
      };

      await updateShift.mutateAsync({ id, data });
      router.push(`/hr/shifts/${id}`);
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

  if (error || !shift) {
    return (
      <div className="p-6">
        <Empty description="Vardiya bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/shifts')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/shifts/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ClockCircleOutlined className="mr-2" />
              Vardiya Düzenle
            </Title>
            <Text type="secondary">
              {shift.name} - {shift.code}
            </Text>
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

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push(`/hr/shifts/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updateShift.isPending}
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
