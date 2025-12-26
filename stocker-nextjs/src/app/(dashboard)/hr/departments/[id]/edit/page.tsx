'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Input, Select, Row, Col, Empty } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import {
  useDepartment,
  useUpdateDepartment,
  useDepartments,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { UpdateDepartmentDto } from '@/lib/api/services/hr.types';

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
        description: values.description,
        parentDepartmentId: values.parentDepartmentId,
        managerId: values.managerId,
        displayOrder: values.displayOrder ?? 0,
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
        <Spinner size="lg" />
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
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/departments/${id}`)}
            />
            <div className="flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Departman Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {department.name} - {department.code}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/departments/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateDepartment.isPending}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Departman Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
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
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="parentDepartmentId" label="Üst Departman">
                    <Select
                      placeholder="Üst departman seçin"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      variant="filled"
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
                      variant="filled"
                      options={employees.map((e) => ({
                        value: e.id,
                        label: e.fullName,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Hidden submit button for form.submit() */}
          <button type="submit" hidden />
        </Form>
      </div>
    </div>
  );
}
