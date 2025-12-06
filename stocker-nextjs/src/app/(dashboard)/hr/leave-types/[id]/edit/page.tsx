'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, InputNumber, Row, Col, Switch, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FileTextOutlined } from '@ant-design/icons';
import { useLeaveType, useUpdateLeaveType } from '@/lib/api/hooks/useHR';
import type { UpdateLeaveTypeDto } from '@/lib/api/services/hr.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EditLeaveTypePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: leaveType, isLoading, error } = useLeaveType(id);
  const updateLeaveType = useUpdateLeaveType();

  // Populate form when leave type data loads
  useEffect(() => {
    if (leaveType) {
      form.setFieldsValue({
        name: leaveType.name,
        code: leaveType.code,
        description: leaveType.description,
        defaultDays: leaveType.defaultDays,
        isPaid: leaveType.isPaid,
        requiresApproval: leaveType.requiresApproval,
      });
    }
  }, [leaveType, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateLeaveTypeDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        defaultDays: values.defaultDays,
        isPaid: values.isPaid,
        requiresApproval: values.requiresApproval,
      };

      await updateLeaveType.mutateAsync({ id, data });
      router.push(`/hr/leave-types/${id}`);
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

  if (error || !leaveType) {
    return (
      <div className="p-6">
        <Empty description="İzin türü bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/leave-types')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/leave-types/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <FileTextOutlined className="mr-2" />
              İzin Türü Düzenle
            </Title>
            <Text type="secondary">
              {leaveType.name} - {leaveType.code}
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

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push(`/hr/leave-types/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updateLeaveType.isPending}
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
