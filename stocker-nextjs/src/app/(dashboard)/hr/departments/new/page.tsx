'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useCreateDepartment, useDepartments, useEmployees } from '@/lib/api/hooks/useHR';
import type { CreateDepartmentDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

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
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <ApartmentOutlined className="mr-2" />
                Yeni Departman
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir departman oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/departments')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createDepartment.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={48}>
            <Col xs={24} lg={16}>
              {/* Basic Info Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Departman Bilgileri
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Departman Adı"
                        rules={[{ required: true, message: 'Departman adı gerekli' }]}
                      >
                        <Input placeholder="Departman adı" variant="filled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="code"
                        label="Departman Kodu"
                        rules={[{ required: true, message: 'Departman kodu gerekli' }]}
                      >
                        <Input placeholder="Örn: HR, IT, FIN" variant="filled" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="description" label="Açıklama">
                    <TextArea rows={3} placeholder="Departman açıklaması" variant="filled" />
                  </Form.Item>
                </div>
              </div>

              {/* Organization Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Organizasyon
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="parentDepartmentId" label="Üst Departman">
                        <Select
                          placeholder="Üst departman seçin"
                          allowClear
                          showSearch
                          optionFilterProp="children"
                          variant="filled"
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
                          variant="filled"
                          options={employees.map((e) => ({
                            value: e.id,
                            label: `${e.firstName} ${e.lastName}`,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
