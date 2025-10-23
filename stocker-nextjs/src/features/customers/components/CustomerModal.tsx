'use client';

import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Radio,
  Row,
  Col,
  Space,
  message,
} from 'antd';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';

const { Option } = Select;
const { TextArea } = Input;

interface CustomerModalProps {
  open: boolean;
  customer?: Customer | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CustomerModal({
  open,
  customer,
  onCancel,
  onSuccess,
}: CustomerModalProps) {
  const [form] = Form.useForm();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const isEditMode = !!customer;
  const customerType = Form.useWatch('customerType', form);

  // Initialize form with customer data when editing
  useEffect(() => {
    if (open && customer) {
      form.setFieldsValue({
        companyName: customer.companyName,
        contactPerson: customer.contactPerson || '',
        email: customer.email,
        phone: customer.phone || '',
        website: customer.website || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || 'Türkiye',
        postalCode: customer.postalCode || '',
        customerType: customer.customerType,
        status: customer.status,
        creditLimit: customer.creditLimit,
        taxId: customer.taxId || '',
        paymentTerms: customer.paymentTerms || '',
        notes: customer.notes || '',
      });
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        customerType: 'Corporate',
        status: 'Active',
        country: 'Türkiye',
        creditLimit: 0,
      });
    }
  }, [open, customer, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode && customer) {
        await updateCustomer.mutateAsync({
          id: customer.id,
          data: values,
        });
        message.success('Müşteri başarıyla güncellendi');
      } else {
        await createCustomer.mutateAsync(values);
        message.success('Müşteri başarıyla oluşturuldu');
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEditMode ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={isEditMode ? 'Güncelle' : 'Oluştur'}
      cancelText="İptal"
      width={800}
      confirmLoading={createCustomer.isPending || updateCustomer.isPending}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          customerType: 'Corporate',
          status: 'Active',
          country: 'Türkiye',
          creditLimit: 0,
        }}
      >
        {/* Customer Type */}
        <Form.Item
          label="Müşteri Tipi"
          name="customerType"
          rules={[{ required: true, message: 'Müşteri tipi seçiniz' }]}
        >
          <Radio.Group>
            <Radio value="Corporate">Kurumsal</Radio>
            <Radio value="Individual">Bireysel</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Basic Information */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={customerType === 'Corporate' ? 'Firma Adı' : 'Ad Soyad'}
              name="companyName"
              rules={[
                { required: true, message: `${customerType === 'Corporate' ? 'Firma adı' : 'Ad soyad'} gereklidir` },
                { min: 2, message: 'En az 2 karakter olmalıdır' },
              ]}
            >
              <Input placeholder={customerType === 'Corporate' ? 'Firma adını girin' : 'Ad soyad girin'} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="İrtibat Kişisi"
              name="contactPerson"
              rules={[
                { max: 100, message: 'En fazla 100 karakter olabilir' },
              ]}
            >
              <Input placeholder="İrtibat kişisi" />
            </Form.Item>
          </Col>
        </Row>

        {/* Contact Information */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="E-posta"
              name="email"
              rules={[
                { required: true, message: 'E-posta gereklidir' },
                { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
              ]}
            >
              <Input placeholder="ornek@firma.com" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Telefon"
              name="phone"
              rules={[
                { pattern: /^[0-9+\s()-]+$/, message: 'Geçerli bir telefon numarası girin' },
              ]}
            >
              <Input placeholder="+90 (555) 123-4567" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Website"
          name="website"
          rules={[
            { type: 'url', message: 'Geçerli bir website adresi girin (http:// veya https:// ile başlamalı)' },
          ]}
        >
          <Input placeholder="https://www.firma.com" />
        </Form.Item>

        {/* Address Information */}
        <Form.Item
          label="Adres"
          name="address"
        >
          <TextArea rows={2} placeholder="Sokak, Mahalle, Bina No, vb." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Şehir"
              name="city"
            >
              <Input placeholder="İstanbul" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="İlçe/Bölge"
              name="state"
            >
              <Input placeholder="Kadıköy" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Posta Kodu"
              name="postalCode"
              rules={[
                { pattern: /^[0-9]{5}$/, message: '5 haneli posta kodu girin' },
              ]}
            >
              <Input placeholder="34000" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Ülke"
          name="country"
        >
          <Select>
            <Option value="Türkiye">Türkiye</Option>
            <Option value="Almanya">Almanya</Option>
            <Option value="İngiltere">İngiltere</Option>
            <Option value="ABD">ABD</Option>
            <Option value="Fransa">Fransa</Option>
          </Select>
        </Form.Item>

        {/* Financial Information */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Vergi Numarası"
              name="taxId"
              rules={[
                { pattern: /^[0-9]{10,11}$/, message: '10 veya 11 haneli vergi numarası girin' },
              ]}
            >
              <Input placeholder="1234567890" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Kredi Limiti (₺)"
              name="creditLimit"
              rules={[
                { type: 'number', min: 0, message: 'Kredi limiti negatif olamaz' },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="0"
                formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as any}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Ödeme Koşulları"
          name="paymentTerms"
        >
          <Select placeholder="Ödeme koşulu seçin">
            <Option value="Peşin">Peşin</Option>
            <Option value="15 Gün">15 Gün Vadeli</Option>
            <Option value="30 Gün">30 Gün Vadeli</Option>
            <Option value="45 Gün">45 Gün Vadeli</Option>
            <Option value="60 Gün">60 Gün Vadeli</Option>
            <Option value="90 Gün">90 Gün Vadeli</Option>
          </Select>
        </Form.Item>

        {/* Status */}
        <Form.Item
          label="Durum"
          name="status"
          rules={[{ required: true, message: 'Durum seçiniz' }]}
        >
          <Select>
            <Option value="Active">Aktif</Option>
            <Option value="Inactive">Pasif</Option>
            <Option value="Potential">Potansiyel</Option>
          </Select>
        </Form.Item>

        {/* Notes */}
        <Form.Item
          label="Notlar"
          name="notes"
        >
          <TextArea
            rows={3}
            placeholder="Müşteri hakkında notlar..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
