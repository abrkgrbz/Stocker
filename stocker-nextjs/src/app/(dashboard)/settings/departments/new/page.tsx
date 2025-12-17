'use client';

/**
 * New Department Page
 * Modern full-page layout for creating departments (CRM Customer style)
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  Space,
  Row,
  Col,
  Typography,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ApartmentOutlined,
  TeamOutlined,
  CodeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  createDepartment,
  getDepartments,
  type Department,
  type CreateDepartmentRequest,
} from '@/lib/api/departments';
import { showCreateSuccess, showError } from '@/lib/utils/sweetalert';

const { Text } = Typography;
const { TextArea } = Input;

// Get color based on employee count
const getDepartmentColor = (count: number): string => {
  if (count >= 50) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  if (count >= 20) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
  if (count >= 10) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
  return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
};

export default function NewDepartmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [autoCode, setAutoCode] = useState('');

  // Fetch existing departments for parent selection
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showCreateSuccess('departman');
      router.push('/settings/departments');
    },
    onError: (error: any) => {
      showError(error?.message || 'Departman oluşturulurken bir hata oluştu');
    },
  });

  const handleSubmit = async (values: any) => {
    const data: CreateDepartmentRequest = {
      name: values.name,
      code: values.code || autoCode,
      description: values.description,
      parentDepartmentId: values.parentDepartmentId,
    };
    await createMutation.mutateAsync(data);
  };

  // Auto-generate department code from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!form.getFieldValue('code')) {
      const code = name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 10);
      setAutoCode(code);
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
                Yeni Departman
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir departman oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/settings/departments')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createMutation.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
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
          disabled={createMutation.isPending}
        >
          <Row gutter={48}>
            {/* Left Panel - Visual & Stats (40%) */}
            <Col xs={24} lg={10}>
              {/* Department Visual Card */}
              <div className="mb-8">
                <div
                  style={{
                    background: getDepartmentColor(0),
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
                    Yeni Departman
                  </p>
                  <p className="text-sm text-white/60">
                    Organizasyon yapısını genişletin
                  </p>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-purple-50/50 rounded-xl text-center border border-purple-100">
                  <div className="text-2xl font-semibold text-purple-600">
                    {departments.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Mevcut Departman</div>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-xl text-center border border-blue-100">
                  <div className="text-2xl font-semibold text-blue-600">
                    {departments.reduce((sum, d) => sum + d.employeeCount, 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Toplam Çalışan</div>
                </div>
              </div>

              {/* Auto Code Preview */}
              {autoCode && (
                <div className="mb-6">
                  <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                    <CodeOutlined className="mr-1" /> Otomatik Oluşturulan Kod
                  </Text>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-800 text-center">
                      {autoCode}
                    </div>
                    <div className="text-xs text-gray-400 text-center mt-1">
                      İsimden otomatik oluşturuldu
                    </div>
                  </div>
                </div>
              )}

              {/* Parent Department Info */}
              <div className="mb-6">
                <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
                  <ApartmentOutlined className="mr-1" /> Üst Departman (Opsiyonel)
                </Text>
                <Form.Item name="parentDepartmentId" className="mb-0">
                  <Select
                    placeholder="Üst departman seçin"
                    allowClear
                    size="large"
                    options={departments.map((d) => ({
                      label: d.name,
                      value: d.id,
                    }))}
                  />
                </Form.Item>
              </div>
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
                    onChange={handleNameChange}
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
                          İsimden otomatik oluşturulur veya manuel girin
                        </Text>
                      </div>
                    </div>
                  </div>
                  <Form.Item name="code" className="mb-0 mt-3">
                    <Input
                      placeholder={autoCode || 'Otomatik oluşturulacak'}
                      size="large"
                      className="rounded-lg"
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
                      <Text className="font-medium block">Çalışan Sayısı</Text>
                      <Text className="text-xs text-gray-500">
                        Departman oluşturulduktan sonra kullanıcılar atanabilir
                      </Text>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-xs text-gray-400">Başlangıç</div>
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
