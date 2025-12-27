'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Input, InputNumber, Row, Col, Switch, Spin, Empty } from 'antd';
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
      router.push(`/hr/leave-types/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !leaveType) {
    return (
      <div className="p-6">
        <Empty description="İzin türü bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/leave-types')}>Listeye Dön</Button>
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
              onClick={() => router.push(`/hr/leave-types/${id}`)}
            />
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" className="text-lg text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">İzin Türü Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {leaveType.name} - {leaveType.code}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/leave-types/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updateLeaveType.isPending}
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
                İzin Türü Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="İzin Türü Adı"
                    rules={[{ required: true, message: 'İzin türü adı gerekli' }]}
                  >
                    <Input placeholder="Örn: Yıllık İzin, Hastalık İzni" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="text-xs text-gray-400 mb-1">İzin Türü Kodu</div>
                  <div className="py-2 px-3 bg-gray-100 rounded-md text-gray-600">
                    {leaveType.code}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Kod değiştirilemez</div>
                </Col>
              </Row>
              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="İzin türü açıklaması" variant="filled" />
              </Form.Item>
            </div>
          </div>

          {/* Settings */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Ayarlar
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="defaultDays"
                    label="Varsayılan Gün Sayısı"
                    rules={[{ required: true, message: 'Gün sayısı gerekli' }]}
                  >
                    <InputNumber
                      placeholder="Gün"
                      style={{ width: '100%' }}
                      min={0}
                      max={365}
                      variant="filled"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="isPaid" label="Ücretli İzin" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="requiresApproval" label="Onay Gerekli" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
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
