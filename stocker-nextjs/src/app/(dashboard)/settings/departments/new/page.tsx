'use client';

/**
 * New Department Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Sticky action bar at bottom
 * - No colored backgrounds on content cards
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Select } from 'antd';
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  createDepartment,
  getDepartments,
  type Department,
  type CreateDepartmentRequest,
} from '@/lib/api/departments';
import { showCreateSuccess, showError } from '@/lib/utils/sweetalert';

const { TextArea } = Input;

export default function NewDepartmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [autoCode, setAutoCode] = useState('');

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Minimal Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Yeni Departman</h1>
              <p className="text-sm text-slate-500">Departman bilgilerini girin</p>
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
          disabled={createMutation.isPending}
        >
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
                    onChange={handleNameChange}
                  />
                </Form.Item>

                <Form.Item
                  name="code"
                  label={<span className="text-sm text-slate-600">Departman Kodu</span>}
                  className="mb-0"
                >
                  <Input
                    placeholder={autoCode || 'Otomatik oluşturulacak'}
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
                  options={departments.map((d) => ({
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

          {/* Stats Preview */}
          {departments.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-medium text-slate-900 mb-4">Mevcut Durum</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#8b5cf615' }}
                    >
                      <BuildingOffice2Icon className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-slate-900">{departments.length}</div>
                      <div className="text-xs text-slate-500">Mevcut Departman</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#3b82f615' }}
                    >
                      <span style={{ color: '#3b82f6' }}>👥</span>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-slate-900">
                        {departments.reduce((sum, d) => sum + d.employeeCount, 0)}
                      </div>
                      <div className="text-xs text-slate-500">Toplam Çalışan</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

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
              {autoCode ? (
                <span className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-emerald-500" />
                  Kod otomatik oluşturulacak: <span className="font-medium text-slate-700">{autoCode}</span>
                </span>
              ) : (
                <span>Departman bilgilerini doldurun</span>
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
                disabled={createMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMutation.isPending ? 'Kaydediliyor...' : 'Departman Oluştur'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
