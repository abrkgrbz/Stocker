'use client';

/**
 * Edit Department Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Sticky action bar at bottom
 * - No colored backgrounds on content cards
 */

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Input, Select, Spin } from 'antd';
import {
  ArrowLeftOutlined,
  ApartmentOutlined,
  TeamOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useDepartment, useDepartments, useUpdateDepartment } from '@/hooks/useDepartments';
import type { UpdateDepartmentRequest } from '@/lib/api/departments';

const { TextArea } = Input;

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id as string;
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: department, isLoading } = useDepartment(departmentId);
  const { data: allDepartments = [] } = useDepartments();
  const availableParents = allDepartments.filter(d => d.id !== departmentId);

  const updateMutation = useUpdateDepartment();

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Departman bulunamadı</p>
          <button
            onClick={() => router.push('/settings/departments')}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Departmanlara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Minimal Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftOutlined />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Departman Düzenle</h1>
              <p className="text-sm text-slate-500">{department.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          disabled={updateMutation.isPending}
        >
          {/* Department Stats */}
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#8b5cf615' }}
                  >
                    <ApartmentOutlined style={{ color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Kod</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {department.code || '—'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#3b82f615' }}
                  >
                    <TeamOutlined style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Çalışan</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {department.employeeCount}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: department.isActive ? '#10b98115' : '#ef444415' }}
                  >
                    <span style={{ color: department.isActive ? '#10b981' : '#ef4444' }}>
                      {department.isActive ? '✓' : '✕'}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Durum</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {department.isActive ? 'Aktif' : 'Pasif'}
                    </div>
                  </div>
                </div>
              </div>
              {department.parentDepartmentName && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#6366f115' }}
                    >
                      <ApartmentOutlined style={{ color: '#6366f1' }} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Üst Departman</div>
                      <div className="text-sm font-semibold text-slate-900 truncate max-w-[100px]">
                        {department.parentDepartmentName}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Department Details Section */}
          <section className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4">Departman Bilgileri</h2>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="name"
                  label={<span className="text-sm text-slate-600">Departman Adı</span>}
                  rules={[
                    { required: true, message: 'Departman adı zorunludur' },
                    { min: 2, message: 'En az 2 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="örn: İnsan Kaynakları"
                    className="h-10"
                  />
                </Form.Item>

                <Form.Item
                  name="code"
                  label={<span className="text-sm text-slate-600">Departman Kodu</span>}
                  className="mb-0"
                >
                  <Input
                    placeholder="Departman kodu girin"
                    className="h-10"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-600">Açıklama</span>}
                className="mb-0 mt-6"
              >
                <TextArea
                  placeholder="Departman hakkında kısa bir açıklama yazın..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            </div>
          </section>

          {/* Parent Department Section */}
          <section className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4">Organizasyon Yapısı</h2>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <Form.Item
                name="parentDepartmentId"
                label={<span className="text-sm text-slate-600">Üst Departman</span>}
                className="mb-0"
              >
                <Select
                  placeholder="Üst departman seçin (isteğe bağlı)"
                  allowClear
                  className="h-10"
                  options={availableParents.map((d) => ({
                    label: d.name,
                    value: d.id,
                  }))}
                />
              </Form.Item>
              <p className="text-xs text-slate-400 mt-2">
                Bu departmanın bağlı olduğu üst departmanı seçin. Boş bırakabilirsiniz.
              </p>
            </div>
          </section>

          <Form.Item hidden>
            <button type="submit" />
          </Form.Item>
        </Form>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {hasChanges ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  Kaydedilmemiş değişiklikler var
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckOutlined className="text-emerald-500" />
                  Tüm değişiklikler kaydedildi
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/settings/departments')}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => form.submit()}
                disabled={updateMutation.isPending || !hasChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updateMutation.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
