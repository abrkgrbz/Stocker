'use client';

import React from 'react';
import { Modal, Form, Input, Card, Alert } from 'antd';
import {
  BankOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SwapOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

interface ConvertLeadModalProps {
  open: boolean;
  loading: boolean;
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export function ConvertLeadModal({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}: ConvertLeadModalProps) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
            <SwapOutlined className="text-white text-lg" />
          </div>
          <div className="text-lg font-semibold text-gray-800">Müşteriye Dönüştür</div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
      styles={{ body: { paddingTop: 24 } }}
      okText="Dönüştür"
      cancelText="İptal"
      okButtonProps={{ className: 'bg-green-600 hover:bg-green-700' }}
    >
      <Alert
        message="Lead'i Müşteriye Dönüştür"
        description="Bu işlem, potansiyel müşteriyi aktif müşteri olarak sisteme kaydedecektir. Bilgileri kontrol edin ve gerekli düzenlemeleri yapın."
        type="success"
        showIcon
        className="mb-6"
      />

      <Form form={form} layout="vertical">
        {/* Firma Bilgileri */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BankOutlined className="text-blue-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Firma Bilgileri</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Form.Item
              label={<span className="text-gray-700 font-medium">Firma Adı</span>}
              name="companyName"
              rules={[{ required: true, message: 'Firma adı gerekli' }]}
            >
              <Input
                prefix={<BankOutlined className="text-gray-400" />}
                placeholder="Firma adı"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">İletişim Kişisi</span>}
              name="contactPerson"
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Ad Soyad"
                className="rounded-lg"
              />
            </Form.Item>
          </Card>
        </div>

        {/* İletişim Bilgileri */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <MailOutlined className="text-green-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">İletişim Bilgileri</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Form.Item
              label={<span className="text-gray-700 font-medium">E-posta</span>}
              name="email"
              rules={[
                { required: true, message: 'E-posta gerekli' },
                { type: 'email', message: 'Geçerli bir e-posta girin' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="ornek@firma.com"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Telefon</span>}
              name="phone"
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="+90 (555) 123-4567"
                className="rounded-lg"
              />
            </Form.Item>
          </Card>
        </div>

        {/* Adres Bilgileri */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <EnvironmentOutlined className="text-purple-600 text-lg" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 m-0">Adres</h3>
          </div>
          <Card className="shadow-sm border-gray-200">
            <Form.Item
              label={<span className="text-gray-700 font-medium">Adres</span>}
              name="address"
            >
              <TextArea rows={3} placeholder="Şirket adresi..." className="rounded-lg" />
            </Form.Item>
          </Card>
        </div>
      </Form>
    </Modal>
  );
}
