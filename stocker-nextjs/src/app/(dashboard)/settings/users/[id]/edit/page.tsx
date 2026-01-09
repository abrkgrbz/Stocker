'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Form, Spin } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserForm } from '@/features/users/components/UserForm';
import { getUserById, updateUser, type UpdateUserRequest } from '@/lib/api/users';
import { showUpdateSuccess, showError } from '@/lib/utils/sweetalert';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => updateUser(userId, data),
    onSuccess: () => {
      showUpdateSuccess('kullanıcı');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      router.push(`/settings/users/${userId}`);
    },
    onError: (error: any) => {
      showError(error?.message || 'Kullanıcı güncellenirken bir hata oluştu');
    },
  });

  const handleSubmit = async (values: any) => {
    const updateData: UpdateUserRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber,
    };
    await updateMutation.mutateAsync(updateData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Kullanıcı bulunamadı</h2>
          <Button onClick={() => router.push('/settings/users')} className="mt-4">
            Listeye Dön
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Kullanıcıyı Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/settings/users/${userId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateMutation.isPending}
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
        <UserForm
          form={form}
          initialValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            roleIds: user.roles?.map((r: any) => r.id) || [],
            department: user.department?.id,
            isActive: user.isActive,
          }}
          onFinish={handleSubmit}
          loading={updateMutation.isPending}
          isEditMode={true}
        />
      </div>
    </div>
  );
}
