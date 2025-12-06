'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Button, Space, Card, Form, Input, Select, Row, Col, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ApartmentOutlined } from '@ant-design/icons';
import {
  useDepartment,
  useUpdateDepartment,
  useDepartments,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { UpdateDepartmentDto } from '@/lib/api/services/hr.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function EditDepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: department, isLoading, error } = useDepartment(id);
  const updateDepartment = useUpdateDepartment();
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();

  // Populate form when department data loads
  useEffect(() => {
    if (department) {
      form.setFieldsValue({
        name: department.name,
        code: department.code,
        description: department.description,
        parentDepartmentId: department.parentDepartmentId,
        managerId: department.managerId,
      });
    }
  }, [department, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateDepartmentDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        parentDepartmentId: values.parentDepartmentId,
        managerId: values.managerId,
      };

      await updateDepartment.mutateAsync({ id, data });
      router.push(`/hr/departments/${id}`);
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

  if (error || !department) {
    return (
      <div className="p-6">
        <Empty description="Departman bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/departments')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/hr/departments/${id}`)}>
            Geri
          </Button>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ApartmentOutlined className="mr-2" />
              Departman Düzenle
            </Title>
            <Text type="secondary">
              {department.name} - {department.code}
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
                      options={departments
                        .filter((d) => d.id !== id)
                        .map((d) => ({ value: d.id, label: d.name }))}
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
                <Button onClick={() => router.push(`/hr/departments/${id}`)}>İptal</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updateDepartment.isPending}
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
