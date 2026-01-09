'use client';

import React from 'react';
import { Form, Input, Select, Switch, Spin } from 'antd';
import { EnvelopeIcon, PhoneIcon, UserGroupIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { getRoles, type Role } from '@/lib/api/roles';
import { getDepartments, type Department } from '@/lib/api/departments';

interface UserFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: any;
  onFinish: (values: any) => void;
  loading?: boolean;
  isEditMode?: boolean;
}

export function UserForm({ form, initialValues, onFinish, loading, isEditMode = false }: UserFormProps) {
  // Fetch available roles from backend
  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch available departments from backend
  const { data: departments, isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        roleIds: Array.isArray(initialValues.roleIds) ? initialValues.roleIds : [],
      });
    } else {
      form.setFieldsValue({ isActive: true, roleIds: [] });
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    // Auto-generate username from email
    const username = values.email.split('@')[0];
    onFinish({ ...values, username });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Ad <span className="text-red-500">*</span>
              </label>
              <Form.Item name="firstName" rules={[{ required: true, message: 'Ad gerekli' }]} className="mb-0">
                <Input
                  placeholder="Ahmet"
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                />
              </Form.Item>
            </div>
            <div className="col-span-6">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Soyad <span className="text-red-500">*</span>
              </label>
              <Form.Item name="lastName" rules={[{ required: true, message: 'Soyad gerekli' }]} className="mb-0">
                <Input
                  placeholder="Yılmaz"
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">
          {/* İletişim Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'E-posta gerekli' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    prefix={<EnvelopeIcon className="w-4 h-4 text-slate-400" />}
                    placeholder="ahmet.yilmaz@example.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Telefon
                </label>
                <Form.Item name="phoneNumber" className="mb-0">
                  <Input
                    prefix={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                    placeholder="+90 555 123 4567"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Davet Bildirimi - Sadece yeni kullanıcı için */}
          {!isEditMode && (
            <div className="mb-8">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <PaperAirplaneIcon className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Davet E-postası Gönderilecek</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Kullanıcı oluşturulduktan sonra, belirtilen e-posta adresine bir davet e-postası gönderilecektir.
                    Kullanıcı bu e-postadaki bağlantıya tıklayarak kendi şifresini belirleyebilecek ve hesabını aktifleştirebilecektir.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rol ve Departman */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Rol ve Departman
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Roller <span className="text-red-500">*</span>
                  <span className="text-xs text-slate-400 font-normal ml-2">(Birden fazla seçilebilir)</span>
                </label>
                <Form.Item
                  name="roleIds"
                  rules={[{ required: true, message: 'En az bir rol seçmelisiniz' }]}
                  className="mb-0"
                >
                  <Select
                    mode="multiple"
                    placeholder={rolesLoading ? 'Roller yükleniyor...' : 'Rol seçin'}
                    loading={rolesLoading}
                    disabled={rolesLoading}
                    maxTagCount="responsive"
                    notFoundContent={rolesLoading ? <Spin size="small" /> : 'Rol bulunamadı'}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  >
                    {roles?.map((role) => (
                      <Select.Option key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${role.isSystemRole ? 'text-slate-900' : 'text-slate-600'}`}>
                            {role.isSystemRole ? '★' : '●'}
                          </span>
                          <div>
                            <div>{role.name}</div>
                            {role.description && (
                              <div className="text-xs text-slate-400">{role.description}</div>
                            )}
                          </div>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Departman
                </label>
                <Form.Item name="department" className="mb-0">
                  <Select
                    placeholder={departmentsLoading ? 'Departmanlar yükleniyor...' : 'Departman seçin'}
                    loading={departmentsLoading}
                    disabled={departmentsLoading}
                    allowClear
                    notFoundContent={departmentsLoading ? <Spin size="small" /> : 'Departman bulunamadı'}
                    optionLabelProp="label"
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  >
                    {departments?.map((department) => (
                      <Select.Option key={department.id} value={department.id} label={department.name}>
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="w-4 h-4 text-slate-400" />
                          <div>
                            <div>{department.name}</div>
                            {department.code && (
                              <div className="text-xs text-slate-400">{department.code}</div>
                            )}
                          </div>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

          </div>

          {/* Hesap Durumu */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Hesap Durumu
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="text-sm font-medium text-slate-700">Hesap Aktif</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Pasif kullanıcılar sisteme giriş yapamaz
                </div>
              </div>
              <Form.Item name="isActive" valuePropName="checked" className="mb-0">
                <Switch
                  checkedChildren="Aktif"
                  unCheckedChildren="Pasif"
                  defaultChecked
                />
              </Form.Item>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
