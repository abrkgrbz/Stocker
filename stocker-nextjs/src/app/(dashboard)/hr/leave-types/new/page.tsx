'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, InputNumber, Row, Col, Switch } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FileTextOutlined } from '@ant-design/icons';
import { useCreateLeaveType } from '@/lib/api/hooks/useHR';
import type { CreateLeaveTypeDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;
const { TextArea } = Input;

export default function NewLeaveTypePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createLeaveType = useCreateLeaveType();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateLeaveTypeDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        defaultDays: values.defaultDays,
        isPaid: values.isPaid ?? true,
        requiresApproval: values.requiresApproval ?? true,
        isActive: values.isActive ?? true,
      };

      await createLeaveType.mutateAsync(data);
      router.push('/hr/leave-types');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/leave-types')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <FileTextOutlined className="mr-2" />
            Yeni İzin Türü
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
              initialValues={{ isPaid: true, requiresApproval: true, isActive: true, defaultDays: 0 }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="İzin Türü Adı"
                    rules={[{ required: true, message: 'İzin türü adı gerekli' }]}
                  >
                    <Input placeholder="Örn: Yıllık İzin, Hastalık İzni" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="code"
                    label="İzin Türü Kodu"
                    rules={[{ required: true, message: 'İzin türü kodu gerekli' }]}
                  >
                    <Input placeholder="Örn: YILLIK, HASTALIK, DOGUM" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="İzin türü açıklaması" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="defaultDays"
                    label="Varsayılan Gün Sayısı"
                    rules={[{ required: true, message: 'Gün sayısı gerekli' }]}
                  >
                    <InputNumber placeholder="Gün" style={{ width: '100%' }} min={0} max={365} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="isPaid" label="Ücretli İzin" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="requiresApproval" label="Onay Gerekli" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="isActive" label="Durum" valuePropName="checked">
                <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/leave-types')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createLeaveType.isPending}
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
