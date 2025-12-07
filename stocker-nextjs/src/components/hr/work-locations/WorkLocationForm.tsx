'use client';

import React from 'react';
import { Form, Input, InputNumber, Switch, Row, Col, Card } from 'antd';
import type { WorkLocationDto } from '@/lib/api/services/hr.types';

interface WorkLocationFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialData?: WorkLocationDto;
  onFinish: (values: any) => void;
}

export default function WorkLocationForm({ form, initialData, onFinish }: WorkLocationFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={
        initialData
          ? {
              name: initialData.name,
              code: initialData.code,
              description: initialData.description,
              street: initialData.street,
              city: initialData.city,
              state: initialData.state,
              postalCode: initialData.postalCode,
              country: initialData.country,
              latitude: initialData.latitude,
              longitude: initialData.longitude,
              phone: initialData.phone,
              email: initialData.email,
              capacity: initialData.capacity,
              isHeadquarters: initialData.isHeadquarters,
              isRemote: initialData.isRemote,
              isActive: initialData.isActive,
            }
          : {
              isHeadquarters: false,
              isRemote: false,
              isActive: true,
              country: 'Türkiye',
            }
      }
    >
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* Basic Info */}
          <Card title="Temel Bilgiler" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={16}>
                <Form.Item
                  name="name"
                  label="Lokasyon Adı"
                  rules={[{ required: true, message: 'Lokasyon adı zorunludur' }]}
                >
                  <Input placeholder="Örn: İstanbul Merkez Ofis" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="code"
                  label="Kod"
                >
                  <Input placeholder="Örn: IST-HQ" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Açıklama">
              <Input.TextArea rows={3} placeholder="Lokasyon hakkında açıklama..." />
            </Form.Item>
          </Card>

          {/* Address Info */}
          <Card title="Adres Bilgileri" className="mb-6">
            <Form.Item name="street" label="Adres">
              <Input.TextArea rows={2} placeholder="Sokak, mahalle, bina no..." />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="city" label="Şehir">
                  <Input placeholder="Örn: İstanbul" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="state" label="İlçe">
                  <Input placeholder="Örn: Kadıköy" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="postalCode" label="Posta Kodu">
                  <Input placeholder="Örn: 34710" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="country" label="Ülke">
                  <Input placeholder="Örn: Türkiye" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="latitude" label="Enlem">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Örn: 40.9906"
                    step={0.0001}
                    precision={6}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="longitude" label="Boylam">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Örn: 29.0297"
                    step={0.0001}
                    precision={6}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Contact Info */}
          <Card title="İletişim Bilgileri">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Telefon"
                >
                  <Input placeholder="Örn: +90 216 123 4567" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="E-posta"
                  rules={[{ type: 'email', message: 'Geçerli bir e-posta adresi giriniz' }]}
                >
                  <Input placeholder="Örn: istanbul@sirket.com" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Settings */}
          <Card title="Ayarlar" className="mb-6">
            <Form.Item
              name="capacity"
              label="Kapasite"
              tooltip="Bu lokasyonda çalışabilecek maksimum kişi sayısı"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Örn: 100"
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="isHeadquarters"
              label="Merkez Ofis"
              valuePropName="checked"
              tooltip="Bu lokasyon şirketin merkez ofisi mi?"
            >
              <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
            </Form.Item>

            <Form.Item
              name="isRemote"
              label="Uzaktan Çalışma Lokasyonu"
              valuePropName="checked"
              tooltip="Bu bir uzaktan çalışma lokasyonu mu?"
            >
              <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Durum"
              valuePropName="checked"
            >
              <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );
}
