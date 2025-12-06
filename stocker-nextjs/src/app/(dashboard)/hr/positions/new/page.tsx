'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, Select, Row, Col, InputNumber } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useCreatePosition, useDepartments } from '@/lib/api/hooks/useHR';
import type { CreatePositionDto } from '@/lib/api/services/hr.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function NewPositionPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  // API Hooks
  const createPosition = useCreatePosition();
  const { data: departments = [] } = useDepartments();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreatePositionDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        departmentId: values.departmentId,
        minSalary: values.minSalary,
        maxSalary: values.maxSalary,
        requirements: values.requirements,
        responsibilities: values.responsibilities,
      };

      await createPosition.mutateAsync(data);
      router.push('/hr/positions');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/positions')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <SafetyCertificateOutlined className="mr-2" />
              Yeni Pozisyon
            </Title>
            <Text type="secondary">Yeni bir pozisyon oluşturun</Text>
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
                    label="Pozisyon Adı"
                    rules={[{ required: true, message: 'Pozisyon adı gerekli' }]}
                  >
                    <Input placeholder="Pozisyon adı" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="code"
                    label="Pozisyon Kodu"
                    rules={[{ required: true, message: 'Pozisyon kodu gerekli' }]}
                  >
                    <Input placeholder="Örn: DEV, MGR, ANL" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="departmentId"
                label="Departman"
                rules={[{ required: true, message: 'Departman gerekli' }]}
              >
                <Select
                  placeholder="Departman seçin"
                  showSearch
                  optionFilterProp="children"
                  options={departments.map((d) => ({ value: d.id, label: d.name }))}
                />
              </Form.Item>

              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Pozisyon açıklaması" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="minSalary" label="Minimum Maaş">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Minimum maaş"
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="TRY"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="maxSalary" label="Maksimum Maaş">
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Maksimum maaş"
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="TRY"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="requirements" label="Gereksinimler">
                <TextArea rows={4} placeholder="Pozisyon için gerekli nitelikler" />
              </Form.Item>

              <Form.Item name="responsibilities" label="Sorumluluklar">
                <TextArea rows={4} placeholder="Pozisyonun sorumlulukları" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/positions')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createPosition.isPending}
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
