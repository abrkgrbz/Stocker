'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserForm } from '@/features/users/components/UserForm';
import { createUser, type CreateUserRequest } from '@/lib/api/users';
import { showCreateSuccess, showError } from '@/lib/utils/sweetalert';

export default function NewUserPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      showCreateSuccess('kullanıcı');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
      router.push('/settings/users');
    },
    onError: (error: any) => {
      showError(error?.message || error?.error?.message || 'Kullanıcı oluşturulurken bir hata oluştu');
    },
  });

  const handleSubmit = async (values: any) => {
    const createData: CreateUserRequest = {
      username: values.username,
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      roleIds: values.roleIds,
      department: values.department,
    };
    await createMutation.mutateAsync(createData);
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Kullanıcı Davet Et
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni kullanıcı oluştur ve davet gönder</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/settings/users')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createMutation.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Davet Gönder
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <UserForm
          form={form}
          onFinish={handleSubmit}
          loading={createMutation.isPending}
          isEditMode={false}
        />
      </div>
    </div>
  );
}
