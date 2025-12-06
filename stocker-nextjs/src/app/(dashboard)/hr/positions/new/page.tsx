'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, Row, Col, InputNumber, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useCreatePosition, useDepartments } from '@/lib/api/hooks/useHR';
import type { CreatePositionDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;
const { Text } = Typography;

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
                <SafetyCertificateOutlined className="mr-2" />
                Yeni Pozisyon
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir pozisyon oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/positions')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createPosition.isPending}
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
                  Pozisyon Bilgileri
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Pozisyon Adı"
                        rules={[{ required: true, message: 'Pozisyon adı gerekli' }]}
                      >
                        <Input placeholder="Pozisyon adı" variant="filled" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="code"
                        label="Pozisyon Kodu"
                        rules={[{ required: true, message: 'Pozisyon kodu gerekli' }]}
                      >
                        <Input placeholder="Örn: DEV, MGR, ANL" variant="filled" />
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
                      variant="filled"
                      options={departments.map((d) => ({ value: d.id, label: d.name }))}
                    />
                  </Form.Item>

                  <Form.Item name="description" label="Açıklama">
                    <TextArea rows={3} placeholder="Pozisyon açıklaması" variant="filled" />
                  </Form.Item>
                </div>
              </div>

              {/* Salary Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Maaş Aralığı
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="minSalary" label="Minimum Maaş">
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Minimum maaş"
                          min={0}
                          variant="filled"
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
                          variant="filled"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                          addonAfter="TRY"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Details Section */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4 block">
                  Detaylar
                </Text>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <Form.Item name="requirements" label="Gereksinimler">
                    <TextArea rows={4} placeholder="Pozisyon için gerekli nitelikler" variant="filled" />
                  </Form.Item>

                  <Form.Item name="responsibilities" label="Sorumluluklar" className="mb-0">
                    <TextArea rows={4} placeholder="Pozisyonun sorumlulukları" variant="filled" />
                  </Form.Item>
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
