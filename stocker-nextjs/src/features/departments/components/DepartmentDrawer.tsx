'use client';

/**
 * Department Create/Edit Drawer Component
 * Matches User Modal pattern for consistency
 * Auto-generates department code from name
 */

import { useEffect } from 'react';
import { Drawer, Form, Input, Button, message } from 'antd';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

const { TextArea } = Input;

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  employeeCount: number;
}

interface DepartmentDrawerProps {
  open: boolean;
  department?: Department | null;
  onClose: () => void;
  onSubmit?: (values: any) => Promise<void>;
}

export function DepartmentDrawer({ open, department, onClose, onSubmit }: DepartmentDrawerProps) {
  const [form] = Form.useForm();
  const isEditMode = !!department;

  useEffect(() => {
    if (open) {
      if (department) {
        // Edit mode - populate form
        form.setFieldsValue({
          name: department.name,
          code: department.code,
          description: department.description,
        });
      } else {
        // Create mode - reset form
        form.resetFields();
      }
    }
  }, [open, department, form]);

  // Auto-generate department code from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;

    // Only auto-generate if creating new department and code field is empty
    if (!isEditMode && !form.getFieldValue('code')) {
      // Generate code: "Satış ve Pazarlama" → "SP"
      const code = name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 10); // Limit to 10 characters

      form.setFieldValue('code', code);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (onSubmit) {
        await onSubmit(values);
      } else {
        // Mock success for now
        message.success(
          isEditMode
            ? `${values.name} departmanı başarıyla güncellendi`
            : `${values.name} departmanı başarıyla oluşturuldu`
        );
      }

      onClose();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Drawer
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 18,
          fontWeight: 600,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 10,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BuildingOfficeIcon className="w-5 h-5 text-white" />
          </div>
          <span>{isEditMode ? 'Departman Düzenle' : 'Yeni Departman Oluştur'}</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width={650}
      destroyOnClose
      styles={{
        header: {
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: 16,
          marginBottom: 24,
        },
        body: {
          paddingTop: 24,
          paddingBottom: 80, // Extra space for sticky footer
        },
      }}
      footer={
        <div style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          padding: '16px 24px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          zIndex: 10,
        }}>
          <Button
            size="large"
            onClick={onClose}
            style={{ minWidth: 100 }}
          >
            İptal
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            style={{
              minWidth: 120,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            }}
          >
            {isEditMode ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
      >
        {/* Department Name */}
        <Form.Item
          name="name"
          label={<span style={{ fontWeight: 500 }}>Departman Adı</span>}
          rules={[
            { required: true, message: 'Departman adı gerekli' },
            { min: 2, message: 'En az 2 karakter olmalı' },
          ]}
        >
          <Input
            size="large"
            placeholder="Satış ve Pazarlama"
            onChange={handleNameChange}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        {/* Department Code - Auto-generated with explanation */}
        <Form.Item
          name="code"
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>Departman Kodu</span>
              <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
                (Otomatik oluşturulur, dilerseniz değiştirin)
              </span>
            </div>
          }
          extra={
            <span style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4, display: 'block' }}>
              Departman adından otomatik oluşturulur. Örn: "Satış ve Pazarlama" → "SP"
            </span>
          }
        >
          <Input
            size="large"
            placeholder="SP"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>Açıklama</span>
              <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
                (Opsiyonel)
              </span>
            </div>
          }
        >
          <TextArea
            rows={3}
            placeholder="Departman hakkında kısa bir açıklama"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
