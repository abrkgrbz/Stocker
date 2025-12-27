'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, InputNumber, Switch, message, Spin } from 'antd';
import { PageContainer } from '@/components/patterns';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
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
      message.success('İzin türü başarıyla güncellendi');
      router.push(`/hr/leave-types/${id}`);
    } catch (error) {
      message.error('Güncelleme sırasında bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </PageContainer>
    );
  }

  if (error || !leaveType) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="text-center py-12">
          <p className="text-slate-500">İzin türü bulunamadı</p>
          <Link href="/hr/leave-types" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Dön
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/hr/leave-types/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Detaya Dön
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">İzin Türü Düzenle</h1>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-medium">{leaveType.name}</span> - {leaveType.code}
            </p>
          </div>
        </div>
      </div>

      {/* Form Kartı */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6"
        >
          {/* İzin Türü Bilgileri */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              İzin Türü Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label={<span className="text-sm text-slate-700">İzin Türü Adı</span>}
                rules={[{ required: true, message: 'İzin türü adı zorunludur' }]}
              >
                <Input placeholder="Örn: Yıllık İzin, Hastalık İzni" className="rounded-md" />
              </Form.Item>

              <div>
                <label className="block text-sm text-slate-700 mb-2">İzin Türü Kodu</label>
                <div className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
                  {leaveType.code}
                </div>
                <p className="text-xs text-slate-400 mt-1">Kod değiştirilemez</p>
              </div>

              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-700">Açıklama</span>}
                className="md:col-span-2"
              >
                <TextArea rows={3} placeholder="İzin türü açıklaması (opsiyonel)" className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Gün Ayarları */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Gün Ayarları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="defaultDays"
                label={<span className="text-sm text-slate-700">Varsayılan Gün</span>}
                rules={[{ required: true, message: 'Gün sayısı zorunludur' }]}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                  max={365}
                />
              </Form.Item>

              <Form.Item
                name="maxConsecutiveDays"
                label={<span className="text-sm text-slate-700">Maks. Ardışık Gün</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="minNoticeDays"
                label={<span className="text-sm text-slate-700">Min. Bildirim Günü</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                />
              </Form.Item>
            </div>
          </div>

          {/* Devir Ayarları */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Devir Ayarları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="carryForward"
                label={<span className="text-sm text-slate-700">Devir Yapılabilir</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="maxCarryForwardDays"
                label={<span className="text-sm text-slate-700">Maks. Devir Günü</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                />
              </Form.Item>
            </div>
          </div>

          {/* Genel Ayarlar */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Genel Ayarlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="isPaid"
                label={<span className="text-sm text-slate-700">Ücretli İzin</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="requiresApproval"
                label={<span className="text-sm text-slate-700">Onay Gerekli</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="requiresDocument"
                label={<span className="text-sm text-slate-700">Belge Gerekli</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="allowHalfDay"
                label={<span className="text-sm text-slate-700">Yarım Gün İzin</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="allowNegativeBalance"
                label={<span className="text-sm text-slate-700">Negatif Bakiye</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>

              <Form.Item
                name="color"
                label={<span className="text-sm text-slate-700">Renk Kodu</span>}
              >
                <Input placeholder="#3B82F6" className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/hr/leave-types/${id}`}>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={updateLeaveType.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLeaveType.isPending ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
          </div>
        </Form>
      </div>
    </PageContainer>
  );
}
