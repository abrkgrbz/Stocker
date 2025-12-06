'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, InputNumber, Select, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import {
  usePosition,
  useUpdatePosition,
  useDepartments,
} from '@/lib/api/hooks/useHR';
import type { UpdatePositionDto } from '@/lib/api/services/hr.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EditPositionPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: position, isLoading, error } = usePosition(id);
  const updatePosition = useUpdatePosition();
  const { data: departments = [] } = useDepartments();

  // Populate form when position data loads
  useEffect(() => {
    if (position) {
      form.setFieldsValue({
        name: position.name,
        code: position.code,
        description: position.description,
        departmentId: position.departmentId,
        minSalary: position.minSalary,
        maxSalary: position.maxSalary,
        requirements: position.requirements,
        responsibilities: position.responsibilities,
      });
    }
  }, [position, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdatePositionDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        departmentId: values.departmentId,
        minSalary: values.minSalary,
        maxSalary: values.maxSalary,
        requirements: values.requirements,
        responsibilities: values.responsibilities,
      };

      await updatePosition.mutateAsync({ id, data });
      router.push(`/hr/positions/${id}`);
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

  if (error || !position) {
    return (
      <div className="p-6">
        <Empty description="Pozisyon bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/positions')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/positions/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <SafetyCertificateOutlined className="mr-2" />
              Pozisyon Düzenle
            </Title>
            <Text type="secondary">
              {position.name} - {position.code}
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
                    <Input placeholder="Örn: DEV, MGR, HR" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="departmentId" label="Departman">
                <Select
                  placeholder="Departman seçin"
                  allowClear
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
                      placeholder="Minimum maaş"
                      style={{ width: '100%' }}
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="maxSalary" label="Maksimum Maaş">
                    <InputNumber
                      placeholder="Maksimum maaş"
                      style={{ width: '100%' }}
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="requirements" label="Gereksinimler">
                <TextArea rows={4} placeholder="Pozisyon için gerekli nitelikler ve beceriler" />
              </Form.Item>

              <Form.Item name="responsibilities" label="Sorumluluklar">
                <TextArea rows={4} placeholder="Pozisyonun sorumlulukları ve görevleri" />
              </Form.Item>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push(`/hr/positions/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updatePosition.isPending}
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
