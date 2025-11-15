'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Switch,
  Divider,
  message,
} from 'antd';
import {
  ThunderboltOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { CRMService } from '@/lib/api/services/crm.service';
import type { CreateWorkflowCommand, WorkflowAction } from '@/lib/api/services/crm.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function NewWorkflowPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<WorkflowAction[]>([]);

  const handleAddAction = () => {
    setActions([
      ...actions,
      {
        type: 'SendEmail',
        parameters: {},
      },
    ]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleActionChange = (index: number, field: 'type' | 'parameters', value: any) => {
    const newActions = [...actions];
    if (field === 'type') {
      newActions[index].type = value;
    } else {
      newActions[index].parameters = value;
    }
    setActions(newActions);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const command: CreateWorkflowCommand = {
        name: values.name,
        description: values.description,
        trigger: {
          type: values.triggerType,
          entityType: values.entityType,
          field: values.field,
          value: values.value,
        },
        actions: actions,
        isActive: values.isActive ?? false,
      };

      const workflowId = await CRMService.createWorkflow(command);
      showSuccess('Workflow başarıyla oluşturuldu');
      router.push(`/crm/workflows/${workflowId}`);
    } catch (error) {
      showApiError(error, 'Workflow oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Header */}
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => router.push('/crm/workflows')}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                      <ThunderboltOutlined /> Yeni Workflow Oluştur
                    </Title>
                  </Space>
                </Col>
              </Row>

              {/* Form */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  triggerType: 'Manual',
                  isActive: false,
                }}
              >
                {/* Basic Info */}
                <Card size="small" title="Temel Bilgiler" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="name"
                        label="Workflow Adı"
                        rules={[{ required: true, message: 'Workflow adı zorunludur' }]}
                      >
                        <Input placeholder="Örn: Müşteri hoş geldin e-postası" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="description" label="Açıklama">
                        <TextArea
                          rows={3}
                          placeholder="Workflow'un ne yaptığını açıklayın"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="isActive" label="Durum" valuePropName="checked">
                        <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Trigger Configuration */}
                <Card size="small" title="Tetikleyici (Trigger)" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="triggerType"
                        label="Tetikleyici Tipi"
                        rules={[{ required: true, message: 'Tetikleyici tipi zorunludur' }]}
                      >
                        <Select placeholder="Trigger tipini seçin">
                          <Option value="Manual">Manuel</Option>
                          <Option value="Scheduled">Zamanlanmış</Option>
                          <Option value="EntityCreated">Oluşturulduğunda</Option>
                          <Option value="EntityUpdated">Güncellendiğinde</Option>
                          <Option value="FieldChanged">Alan Değiştiğinde</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="entityType" label="Entity Tipi">
                        <Input placeholder="Örn: Customer, Lead" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="field" label="Alan Adı (İsteğe Bağlı)">
                        <Input placeholder="Hangi alan değiştiğinde" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="value" label="Değer (İsteğe Bağlı)">
                        <Input placeholder="Belirli bir değer için" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Actions */}
                <Card
                  size="small"
                  title="Aksiyonlar"
                  extra={
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={handleAddAction}
                      size="small"
                    >
                      Aksiyon Ekle
                    </Button>
                  }
                  style={{ marginBottom: 16 }}
                >
                  {actions.length === 0 ? (
                    <Text type="secondary">Henüz aksiyon eklenmedi. Aksiyon eklemek için yukarıdaki butonu kullanın.</Text>
                  ) : (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {actions.map((action, index) => (
                        <Card
                          key={index}
                          size="small"
                          title={`Aksiyon ${index + 1}`}
                          extra={
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveAction(index)}
                              size="small"
                            />
                          }
                        >
                          <Row gutter={16}>
                            <Col span={24}>
                              <div style={{ marginBottom: 8 }}>
                                <Text strong>Aksiyon Tipi:</Text>
                              </div>
                              <Select
                                value={action.type}
                                onChange={(value) => handleActionChange(index, 'type', value)}
                                style={{ width: '100%' }}
                              >
                                <Option value="SendEmail">E-posta Gönder</Option>
                                <Option value="CreateTask">Görev Oluştur</Option>
                                <Option value="UpdateField">Alan Güncelle</Option>
                                <Option value="SendNotification">Bildirim Gönder</Option>
                                <Option value="CallWebhook">Webhook Çağır</Option>
                              </Select>
                            </Col>
                            <Col span={24} style={{ marginTop: 16 }}>
                              <div style={{ marginBottom: 8 }}>
                                <Text strong>Parametreler (JSON):</Text>
                              </div>
                              <TextArea
                                rows={4}
                                placeholder='{"to": "user@example.com", "subject": "Hoş geldiniz"}'
                                value={JSON.stringify(action.parameters, null, 2)}
                                onChange={(e) => {
                                  try {
                                    const params = JSON.parse(e.target.value);
                                    handleActionChange(index, 'parameters', params);
                                  } catch {
                                    // Invalid JSON, ignore
                                  }
                                }}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </Space>
                  )}
                </Card>

                {/* Submit */}
                <Row justify="end">
                  <Space>
                    <Button onClick={() => router.push('/crm/workflows')}>İptal</Button>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                      Workflow Oluştur
                    </Button>
                  </Space>
                </Row>
              </Form>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
