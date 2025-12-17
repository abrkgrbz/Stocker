'use client';

/**
 * Edit Department Page
 * Modern full-page layout for editing departments (CRM Customer style)
 */

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Form,
  Input,
  Space,
  Row,
  Col,
  Typography,
  Select,
  Spin,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ApartmentOutlined,
  TeamOutlined,
  CodeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useDepartment, useDepartments, useUpdateDepartment } from '@/hooks/useDepartments';
import type { UpdateDepartmentRequest } from '@/lib/api/departments';

const { Text } = Typography;
const { TextArea } = Input;

// Get color based on employee count
const getDepartmentColor = (count: number): string => {
  if (count >= 50) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  if (count >= 20) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
  if (count >= 10) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
  return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
};

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id as string;
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch department data
  const { data: department, isLoading } = useDepartment(departmentId);

  // Fetch all departments for parent selection (excluding current)
  const { data: allDepartments = [] } = useDepartments();
  const availableParents = allDepartments.filter(d => d.id !== departmentId);

  // Update mutation
  const updateMutation = useUpdateDepartment();

  // Populate form when data loads
  useEffect(() => {
    if (department) {
      form.setFieldsValue({
        name: department.name,
        code: department.code,
        description: department.description,
        parentDepartmentId: department.parentDepartmentId,
      });
    }
  }, [department, form]);

  const handleSubmit = async (values: any) => {
    const data: UpdateDepartmentRequest = {
      name: values.name,
      code: values.code,
      description: values.description,
    };

    try {
      await updateMutation.mutateAsync({ departmentId, data });
      router.push('/settings/departments');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleValuesChange = () => {
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Text type="secondary">Departman bulunamadı</Text>
          <br />
          <Button type="link" onClick={() => router.push('/settings/departments')}>
            Departmanlara Dön
          </Button>
        </div>
      </div>
    );
  }

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
                Departman Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{department.name}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/settings/departments')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateMutation.isPending}
              onClick={() => form.submit()}
              disabled={!hasChanges}
              style={{
                background: hasChanges ? '#1a1a1a' : undefined,
                borderColor: hasChanges ? '#1a1a1a' : undefined,
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          disabled={updateMutation.isPending}
        >
          <Row gutter={48}>
            {/* Left Panel - Visual & Stats (40%) */}
            <Col xs={24} lg={10}>
              {/* Department Visual Card */}
              <div className="mb-8">
                <div
                  style={{
                    background: getDepartmentColor(department.employeeCount),
                    borderRadius: '16px',
                    padding: '40px 20px',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ApartmentOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
                  <p className="mt-4 text-lg font-medium text-white/90">
                    {department.name}
                  </p>
                  <p className="text-sm text-white/60">
                    {department.employeeCount} çalışan
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-blue-50/50 rounded-xl text-center border border-blue-100">
                  <div className="text-2xl font-semibold text-blue-600">
                    {department.employeeCount}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Çalışan Sayısı</div>
                </div>
                <div className="p-4 bg-green-50/50 rounded-xl text-center border border-green-100">
                  <div className="flex items-center justify-center">
                    {department.isActive ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>Aktif</Tag>
                    ) : (
                      <Tag color="error" icon={<CloseCircleOutlined />}>Pasif</Tag>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Durum</div>
                </div>
              </div>

              {/* Code Display */}
              {department.code && (
                <div className="mb-6">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                    <CodeOutlined className="mr-1" /> Mevcut Kod
                  </Text>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-800 text-center">
                      {department.code}
                    </div>
                  </div>
                </div>
              )}

              {/* Parent Department Info */}
              {department.parentDepartmentName && (
                <div className="mb-6">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                    <ApartmentOutlined className="mr-1" /> Üst Departman
                  </Text>
                  <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <ApartmentOutlined className="text-purple-600" />
                      </div>
                      <div>
                        <Text className="font-medium block">{department.parentDepartmentName}</Text>
                        <Text className="text-xs text-gray-500">Üst Departman</Text>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Col>

            {/* Right Panel - Form Content (60%) */}
            <Col xs={24} lg={14}>
              {/* Department Name - Hero Input */}
              <div className="mb-8">
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Departman adı zorunludur' },
                    { min: 2, message: 'En az 2 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Departman Adı"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
                <Form.Item name="description" className="mb-0 mt-2">
                  <TextArea
                    placeholder="Departman hakkında kısa bir açıklama yazın..."
                    variant="borderless"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    style={{
                      fontSize: '15px',
                      padding: '0',
                      color: '#666',
                      resize: 'none'
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

              {/* Department Details */}
              <div className="mb-8">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <FileTextOutlined className="mr-1" /> Departman Detayları
                </Text>

                {/* Department Code */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <CodeOutlined className="text-purple-600" />
                      </div>
                      <div>
                        <Text className="font-medium block">Departman Kodu</Text>
                        <Text className="text-xs text-gray-500">
                          Benzersiz tanımlayıcı kod
                        </Text>
                      </div>
                    </div>
                  </div>
                  <Form.Item name="code" className="mb-0 mt-3">
                    <Input
                      placeholder="Departman kodu girin"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </div>

                {/* Parent Department Selector */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <ApartmentOutlined className="text-indigo-600" />
                    </div>
                    <div>
                      <Text className="font-medium block">Üst Departman</Text>
                      <Text className="text-xs text-gray-500">
                        Bu departmanın bağlı olduğu üst departman
                      </Text>
                    </div>
                  </div>
                  <Form.Item name="parentDepartmentId" className="mb-0">
                    <Select
                      placeholder="Üst departman seçin (opsiyonel)"
                      allowClear
                      size="large"
                      options={availableParents.map((d) => ({
                        label: d.name,
                        value: d.id,
                      }))}
                    />
                  </Form.Item>
                </div>

                {/* Employee Info */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TeamOutlined className="text-blue-600" />
                    </div>
                    <div>
                      <Text className="font-medium block">Çalışan Bilgisi</Text>
                      <Text className="text-xs text-gray-500">
                        Bu departmana atanmış çalışanlar
                      </Text>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{department.employeeCount}</div>
                    <div className="text-xs text-gray-400">Aktif Çalışan</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <button type="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
