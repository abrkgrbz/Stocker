'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, Select, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useCreateDepartment, useDepartments, useEmployees } from '@/lib/api/hooks/useHR';
import type { CreateDepartmentDto } from '@/lib/api/services/hr.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function NewDepartmentPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  // API Hooks
  const createDepartment = useCreateDepartment();
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateDepartmentDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        parentDepartmentId: values.parentDepartmentId,
        managerId: values.managerId,
      };

      await createDepartment.mutateAsync(data);
      router.push('/hr/departments');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/hr/departments')}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ApartmentOutlined className="mr-2" />
              Yeni Departman
            </Title>
            <Text type="secondary">Yeni bir departman oluşturun</Text>
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
                    label="Departman Adı"
                    rules={[{ required: true, message: 'Departman adı gerekli' }]}
                  >
                    <Input placeholder="Departman adı" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="code"
                    label="Departman Kodu"
                    rules={[{ required: true, message: 'Departman kodu gerekli' }]}
                  >
                    <Input placeholder="Örn: HR, IT, FIN" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Departman açıklaması" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="parentDepartmentId" label="Üst Departman">
                    <Select
                      placeholder="Üst departman seçin"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      options={departments.map((d) => ({ value: d.id, label: d.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="managerId" label="Departman Yöneticisi">
                    <Select
                      placeholder="Yönetici seçin"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      options={employees.map((e) => ({
                        value: e.id,
                        label: `${e.firstName} ${e.lastName}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-end gap-2 mt-6">
                <Button onClick={() => router.push('/hr/departments')}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={createDepartment.isPending}
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
