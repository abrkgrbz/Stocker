'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Input, InputNumber, Select, Row, Col, Empty } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { usePosition, useUpdatePosition, useDepartments } from '@/lib/api/hooks/useHR';
import type { UpdatePositionDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;

export default function EditPositionPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: position, isLoading, error } = usePosition(id);
  const updatePosition = useUpdatePosition();
  const { data: departments = [] } = useDepartments();

  // Populate form when position data loads
  useEffect(() => {
    if (position) {
      form.setFieldsValue({
        title: position.title,
        description: position.description,
        departmentId: position.departmentId,
        level: position.level,
        minSalary: position.minSalary,
        maxSalary: position.maxSalary,
        currency: position.currency,
        headCount: position.headCount,
        requirements: position.requirements,
        responsibilities: position.responsibilities,
      });
    }
  }, [position, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdatePositionDto = {
        title: values.title,
        description: values.description,
        departmentId: values.departmentId,
        level: values.level || 1,
        minSalary: values.minSalary || 0,
        maxSalary: values.maxSalary || 0,
        currency: values.currency,
        headCount: values.headCount,
        requirements: values.requirements,
        responsibilities: values.responsibilities,
      };

      await updatePosition.mutateAsync({ id, data });
      router.push(`/hr/positions/${id}`);
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

  if (error || !position) {
    return (
      <div className="p-6">
        <Empty description="Pozisyon bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/positions')}>Listeye Dön</Button>
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
              onClick={() => router.push(`/hr/positions/${id}`)}
            />
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 m-0">Pozisyon Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">
                  {position.title} - {position.code}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/hr/positions/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={updatePosition.isPending}
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
                Pozisyon Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="title"
                    label="Pozisyon Adı"
                    rules={[{ required: true, message: 'Pozisyon adı gerekli' }]}
                  >
                    <Input placeholder="Pozisyon adı" variant="filled" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="level"
                    label="Seviye"
                  >
                    <InputNumber placeholder="Seviye" style={{ width: '100%' }} variant="filled" min={1} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="departmentId" label="Departman">
                <Select
                  placeholder="Departman seçin"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  variant="filled"
                  options={departments.map((d) => ({ value: d.id, label: d.name }))}
                />
              </Form.Item>
              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Pozisyon açıklaması" variant="filled" />
              </Form.Item>
            </div>
          </div>

          {/* Salary Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Maaş Bilgileri
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="minSalary" label="Minimum Maaş">
                    <InputNumber
                      placeholder="Minimum maaş"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="maxSalary" label="Maksimum Maaş">
                    <InputNumber
                      placeholder="Maksimum maaş"
                      style={{ width: '100%' }}
                      variant="filled"
                      formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          {/* Requirements & Responsibilities */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Gereksinimler ve Sorumluluklar
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="bg-gray-50/50 rounded-xl p-6">
              <Form.Item name="requirements" label="Gereksinimler">
                <TextArea
                  rows={4}
                  placeholder="Pozisyon için gerekli nitelikler ve beceriler"
                  variant="filled"
                />
              </Form.Item>
              <Form.Item name="responsibilities" label="Sorumluluklar" className="mb-0">
                <TextArea
                  rows={4}
                  placeholder="Pozisyonun sorumlulukları ve görevleri"
                  variant="filled"
                />
              </Form.Item>
            </div>
          </div>

          {/* Hidden submit button for form.submit() */}
          <button type="submit" hidden />
        </Form>
      </div>
    </div>
  );
}
