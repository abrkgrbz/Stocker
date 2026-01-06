'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Switch } from 'antd';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { useLeaveType, useUpdateLeaveType } from '@/lib/api/hooks/useHR';
import type { UpdateLeaveTypeDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;

export default function EditLeaveTypePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: leaveType, isLoading, error } = useLeaveType(id);
  const updateLeaveType = useUpdateLeaveType();

  // Populate form when leave type data loads
  useEffect(() => {
    if (leaveType) {
      form.setFieldsValue({
        name: leaveType.name,
        description: leaveType.description,
        defaultDays: leaveType.defaultDays,
        isPaid: leaveType.isPaid,
        requiresApproval: leaveType.requiresApproval,
        requiresDocument: leaveType.requiresDocument,
        maxConsecutiveDays: leaveType.maxConsecutiveDays,
        minNoticeDays: leaveType.minNoticeDays,
        allowHalfDay: leaveType.allowHalfDay,
        allowNegativeBalance: leaveType.allowNegativeBalance,
        carryForward: leaveType.carryForward,
        maxCarryForwardDays: leaveType.maxCarryForwardDays,
        color: leaveType.color,
      });
    }
  }, [leaveType, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateLeaveTypeDto = {
        name: values.name,
        description: values.description,
        defaultDays: values.defaultDays,
        isPaid: values.isPaid ?? false,
        requiresApproval: values.requiresApproval ?? true,
        requiresDocument: values.requiresDocument ?? false,
        maxConsecutiveDays: values.maxConsecutiveDays,
        minNoticeDays: values.minNoticeDays,
        allowHalfDay: values.allowHalfDay ?? true,
        allowNegativeBalance: values.allowNegativeBalance ?? false,
        carryForward: values.carryForward ?? false,
        maxCarryForwardDays: values.maxCarryForwardDays,
        color: values.color,
      };

      await updateLeaveType.mutateAsync({ id, data });
      router.push(`/hr/leave-types/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const subtitle = leaveType
    ? `${leaveType.name} - ${leaveType.code}`
    : 'Izin turu bilgilerini duzenleyin';

  return (
    <FormPageLayout
      title="Izin Turu Duzenle"
      subtitle={subtitle}
      cancelPath={`/hr/leave-types/${id}`}
      loading={updateLeaveType.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !leaveType)}
      errorMessage="Izin Turu Bulunamadi"
      errorDescription="Istenen izin turu bulunamadi veya bir hata olustu."
      saveButtonText="Guncelle"
      icon={<DocumentTextIcon className="w-5 h-5" />}
      maxWidth="max-w-4xl"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Izin Turu Bilgileri */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Izin Turu Bilgileri
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Izin Turu Adi"
                rules={[{ required: true, message: 'Izin turu adi zorunludur' }]}
              >
                <Input placeholder="Orn: Yillik Izin, Hastalik Izni" variant="filled" />
              </Form.Item>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Izin Turu Kodu</label>
                <div className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
                  {leaveType?.code || '-'}
                </div>
                <p className="text-xs text-slate-400 mt-1">Kod degistirilemez</p>
              </div>

              <Form.Item
                name="description"
                label="Aciklama"
                className="md:col-span-2"
              >
                <TextArea rows={3} placeholder="Izin turu aciklamasi (opsiyonel)" variant="filled" />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Gun Ayarlari */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Gun Ayarlari
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="defaultDays"
                label="Varsayilan Gun"
                rules={[{ required: true, message: 'Gun sayisi zorunludur' }]}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full"
                  min={0}
                  max={365}
                  variant="filled"
                />
              </Form.Item>

              <Form.Item
                name="maxConsecutiveDays"
                label="Maks. Ardisik Gun"
              >
                <InputNumber
                  placeholder="0"
                  className="w-full"
                  min={0}
                  variant="filled"
                />
              </Form.Item>

              <Form.Item
                name="minNoticeDays"
                label="Min. Bildirim Gunu"
              >
                <InputNumber
                  placeholder="0"
                  className="w-full"
                  min={0}
                  variant="filled"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Devir Ayarlari */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Devir Ayarlari
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="carryForward"
                label="Devir Yapilabilir"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="maxCarryForwardDays"
                label="Maks. Devir Gunu"
              >
                <InputNumber
                  placeholder="0"
                  className="w-full"
                  min={0}
                  variant="filled"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Genel Ayarlar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Genel Ayarlar
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
          <div className="bg-gray-50/50 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="isPaid"
                label="Ucretli Izin"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="requiresApproval"
                label="Onay Gerekli"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="requiresDocument"
                label="Belge Gerekli"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="allowHalfDay"
                label="Yarim Gun Izin"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="allowNegativeBalance"
                label="Negatif Bakiye"
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>

              <Form.Item
                name="color"
                label="Renk Kodu"
              >
                <Input placeholder="#3B82F6" variant="filled" />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Hidden submit button for form.submit() */}
        <button type="submit" hidden />
      </Form>
    </FormPageLayout>
  );
}
