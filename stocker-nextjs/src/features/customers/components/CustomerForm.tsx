'use client';

import React, { useEffect } from 'react';
import { Form, Card, Row, Col, Button, Space, Divider, message } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { FormField } from '@/components/forms/FormField';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import { customerSchema, type CustomerFormData } from '../schemas/customer-schema';

export interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: CustomerFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, isDirty },
  } = useFormBuilder<CustomerFormData>({
    schema: customerSchema,
    defaultValues: {
      type: 'corporate',
      status: 'active',
      country: 'Türkiye',
      paymentTerm: '30-days',
      segment: 'wholesale',
      ...initialData,
    },
  });

  const customerType = watch('type');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: CustomerFormData) => {
    try {
      await onSubmit(data);
      message.success('Müşteri başarıyla kaydedildi');
    } catch (error) {
      message.error('Müşteri kaydedilemedi');
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
      <Card title="Müşteri Bilgileri" className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <FormField
              name="type"
              label="Müşteri Tipi"
              type="select"
              control={control}
              required
              options={[
                { label: 'Bireysel', value: 'individual' },
                { label: 'Kurumsal', value: 'corporate' },
              ]}
            />
          </Col>

          <Col xs={24} md={8}>
            <FormField
              name="segment"
              label="Müşteri Segmenti"
              type="select"
              control={control}
              required
              options={[
                { label: 'Perakende', value: 'retail' },
                { label: 'Toptan', value: 'wholesale' },
                { label: 'Kurumsal', value: 'corporate' },
                { label: 'VIP', value: 'vip' },
              ]}
            />
          </Col>

          <Col xs={24} md={8}>
            <FormField
              name="status"
              label="Durum"
              type="select"
              control={control}
              required
              options={[
                { label: 'Aktif', value: 'active' },
                { label: 'Pasif', value: 'inactive' },
                { label: 'Bloke', value: 'blocked' },
              ]}
            />
          </Col>
        </Row>

        <Divider />

        {customerType === 'individual' ? (
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <FormField
                name="firstName"
                label="Ad"
                type="text"
                control={control}
                required
                placeholder="Müşteri adı"
              />
            </Col>
            <Col xs={24} md={12}>
              <FormField
                name="lastName"
                label="Soyad"
                type="text"
                control={control}
                required
                placeholder="Müşteri soyadı"
              />
            </Col>
          </Row>
        ) : (
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <FormField
                name="companyName"
                label="Firma Adı"
                type="text"
                control={control}
                required
                placeholder="ABC Ticaret Ltd. Şti."
              />
            </Col>
            <Col xs={24} md={6}>
              <FormField
                name="taxId"
                label="Vergi Numarası"
                type="tax-id"
                control={control}
                required
                placeholder="1234567890"
              />
            </Col>
            <Col xs={24} md={6}>
              <FormField
                name="taxOffice"
                label="Vergi Dairesi"
                type="text"
                control={control}
                placeholder="Kadıköy"
              />
            </Col>
          </Row>
        )}
      </Card>

      <Card title="İletişim Bilgileri" className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <FormField
              name="email"
              label="E-posta"
              type="email"
              control={control}
              required
              placeholder="info@firma.com"
            />
          </Col>
          <Col xs={24} md={6}>
            <FormField
              name="phone"
              label="Telefon"
              type="phone"
              control={control}
              required
              placeholder="0212 XXX XX XX"
            />
          </Col>
          <Col xs={24} md={6}>
            <FormField
              name="mobilePhone"
              label="Cep Telefonu"
              type="phone"
              control={control}
              placeholder="0532 XXX XX XX"
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <FormField
              name="website"
              label="Web Sitesi"
              type="text"
              control={control}
              placeholder="https://www.firma.com"
            />
          </Col>
        </Row>
      </Card>

      <Card title="Adres Bilgileri" className="mb-6">
        <Row gutter={16}>
          <Col xs={24}>
            <FormField
              name="address"
              label="Adres"
              type="textarea"
              control={control}
              required
              placeholder="Açık adres bilgisi"
              rows={3}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <FormField
              name="district"
              label="İlçe"
              type="text"
              control={control}
              required
              placeholder="Kadıköy"
            />
          </Col>
          <Col xs={24} md={8}>
            <FormField
              name="city"
              label="Şehir"
              type="text"
              control={control}
              required
              placeholder="İstanbul"
            />
          </Col>
          <Col xs={24} md={4}>
            <FormField
              name="postalCode"
              label="Posta Kodu"
              type="text"
              control={control}
              required
              placeholder="34000"
            />
          </Col>
          <Col xs={24} md={4}>
            <FormField
              name="country"
              label="Ülke"
              type="text"
              control={control}
              required
            />
          </Col>
        </Row>
      </Card>

      <Card title="Finansal Bilgiler" className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <FormField
              name="iban"
              label="IBAN"
              type="iban"
              control={control}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              help="Banka hesap numarası (opsiyonel)"
            />
          </Col>
          <Col xs={24} md={6}>
            <FormField
              name="creditLimit"
              label="Kredi Limiti"
              type="currency"
              control={control}
              placeholder="0.00"
            />
          </Col>
          <Col xs={24} md={6}>
            <FormField
              name="paymentTerm"
              label="Ödeme Vadesi"
              type="select"
              control={control}
              required
              options={[
                { label: 'Peşin', value: 'immediate' },
                { label: '15 Gün', value: '15-days' },
                { label: '30 Gün', value: '30-days' },
                { label: '45 Gün', value: '45-days' },
                { label: '60 Gün', value: '60-days' },
                { label: '90 Gün', value: '90-days' },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <FormField
              name="notes"
              label="Notlar"
              type="textarea"
              control={control}
              placeholder="Müşteri hakkında notlar..."
              rows={3}
            />
          </Col>
        </Row>
      </Card>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            size="large"
            icon={<CloseOutlined />}
            onClick={onCancel}
            disabled={isSubmitting || loading}
          >
            İptal
          </Button>
        )}
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={isSubmitting || loading}
          disabled={!isDirty}
        >
          Kaydet
        </Button>
      </div>
    </Form>
  );
}
