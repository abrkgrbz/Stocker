'use client';

/**
 * CreateSegmentModal Component
 * Modal for creating and editing customer segments
 * Feature-Based Architecture - Smart Component
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select } from 'antd';
import { useCreateSegment, useUpdateSegment } from '../../hooks';
import type {
  CustomerSegmentListDto,
  CreateCustomerSegmentCommand,
  UpdateCustomerSegmentCommand,
  SegmentCriteriaType,
} from '../../types';

interface CreateSegmentModalProps {
  open: boolean;
  onClose: () => void;
  editingSegment?: CustomerSegmentListDto | null;
}

export function CreateSegmentModal({
  open,
  onClose,
  editingSegment,
}: CreateSegmentModalProps) {
  const [form] = Form.useForm();

  // Mutations
  const createSegment = useCreateSegment();
  const updateSegment = useUpdateSegment();

  const isEditing = !!editingSegment;
  const isPending = createSegment.isPending || updateSegment.isPending;

  // Populate form when editing
  useEffect(() => {
    if (editingSegment) {
      form.setFieldsValue({
        name: editingSegment.name,
        code: editingSegment.code,
        description: editingSegment.description,
        discountRate: editingSegment.discountRate,
        priority: editingSegment.priority,
        isActive: editingSegment.isActive,
      });
    } else {
      form.resetFields();
    }
  }, [editingSegment, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing && editingSegment) {
        const updateData: UpdateCustomerSegmentCommand = {
          name: values.name,
          description: values.description,
          discountRate: values.discountRate,
          priority: values.priority,
          isActive: values.isActive,
          criteriaType: values.criteriaType,
          criteriaValue: values.criteriaValue,
          minOrderValue: values.minOrderValue,
          maxOrderValue: values.maxOrderValue,
        };

        updateSegment.mutate(
          { id: editingSegment.id, data: updateData },
          {
            onSuccess: () => {
              form.resetFields();
              onClose();
            },
          }
        );
      } else {
        const createData: CreateCustomerSegmentCommand = {
          name: values.name,
          code: values.code,
          description: values.description,
          discountRate: values.discountRate || 0,
          priority: values.priority || 1,
          isActive: values.isActive ?? true,
          criteriaType: values.criteriaType,
          criteriaValue: values.criteriaValue,
          minOrderValue: values.minOrderValue,
          maxOrderValue: values.maxOrderValue,
        };

        createSegment.mutate(createData, {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        });
      }
    } catch {
      // Form validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const criteriaTypeOptions: { value: SegmentCriteriaType; label: string }[] = [
    { value: 'OrderValue', label: 'Sipariş Tutarı' },
    { value: 'OrderFrequency', label: 'Sipariş Sıklığı' },
    { value: 'ProductCategory', label: 'Ürün Kategorisi' },
    { value: 'Location', label: 'Konum' },
    { value: 'Custom', label: 'Özel' },
  ];

  return (
    <Modal
      title={isEditing ? 'Segment Düzenle' : 'Yeni Segment Oluştur'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={isEditing ? 'Güncelle' : 'Oluştur'}
      cancelText="Vazgeç"
      confirmLoading={isPending}
      width={520}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        initialValues={{
          isActive: true,
          priority: 1,
          discountRate: 0,
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Segment Adı"
            rules={[{ required: true, message: 'Segment adı gerekli' }]}
          >
            <Input placeholder="Örn: VIP Müşteriler" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Segment Kodu"
            rules={[
              { required: !isEditing, message: 'Segment kodu gerekli' },
              { pattern: /^[A-Z0-9_]+$/, message: 'Sadece büyük harf, rakam ve alt çizgi' },
            ]}
          >
            <Input
              placeholder="Örn: VIP_CUSTOMERS"
              disabled={isEditing}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Açıklama">
          <Input.TextArea
            placeholder="Segment hakkında kısa açıklama..."
            rows={2}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="discountRate"
            label="İndirim Oranı (%)"
            rules={[{ required: true, message: 'İndirim oranı gerekli' }]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="0"
              className="w-full"
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Öncelik"
            rules={[{ required: true, message: 'Öncelik gerekli' }]}
            tooltip="Düşük sayı = yüksek öncelik"
          >
            <InputNumber
              min={1}
              max={10}
              placeholder="1"
              className="w-full"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="criteriaType"
          label="Kriter Türü"
        >
          <Select
            placeholder="Otomatik atama kriteri seçin"
            allowClear
            options={criteriaTypeOptions}
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.criteriaType !== currentValues.criteriaType
          }
        >
          {({ getFieldValue }) => {
            const criteriaType = getFieldValue('criteriaType');

            if (criteriaType === 'OrderValue') {
              return (
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="minOrderValue" label="Min. Sipariş Tutarı">
                    <InputNumber
                      min={0}
                      placeholder="0"
                      className="w-full"
                      formatter={(value) =>
                        `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                    />
                  </Form.Item>
                  <Form.Item name="maxOrderValue" label="Maks. Sipariş Tutarı">
                    <InputNumber
                      min={0}
                      placeholder="Sınırsız"
                      className="w-full"
                      formatter={(value) =>
                        value ? `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                      }
                    />
                  </Form.Item>
                </div>
              );
            }

            if (criteriaType && criteriaType !== 'OrderValue') {
              return (
                <Form.Item name="criteriaValue" label="Kriter Değeri">
                  <Input placeholder="Kriter değerini girin" />
                </Form.Item>
              );
            }

            return null;
          }}
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Durum"
          valuePropName="checked"
        >
          <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
