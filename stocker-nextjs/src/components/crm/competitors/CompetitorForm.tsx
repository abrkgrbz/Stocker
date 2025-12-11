'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Segmented,
  InputNumber,
  Switch,
} from 'antd';
import {
  AimOutlined,
  GlobalOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { CompetitorDto } from '@/lib/api/services/crm.types';
import { ThreatLevel, PriceComparison } from '@/lib/api/services/crm.types';

const { TextArea } = Input;
const { Text } = Typography;

// Threat level options
const threatLevelOptions = [
  { value: ThreatLevel.VeryLow, label: '🟢 Çok Düşük' },
  { value: ThreatLevel.Low, label: '🟡 Düşük' },
  { value: ThreatLevel.Medium, label: '🟠 Orta' },
  { value: ThreatLevel.High, label: '🔴 Yüksek' },
  { value: ThreatLevel.VeryHigh, label: '⚫ Çok Yüksek' },
];

// Price comparison options
const priceComparisonOptions = [
  { value: PriceComparison.MuchLower, label: 'Çok Düşük' },
  { value: PriceComparison.Lower, label: 'Düşük' },
  { value: PriceComparison.Similar, label: 'Benzer' },
  { value: PriceComparison.Higher, label: 'Yüksek' },
  { value: PriceComparison.MuchHigher, label: 'Çok Yüksek' },
];

interface CompetitorFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CompetitorDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CompetitorForm({ form, initialValues, onFinish, loading }: CompetitorFormProps) {
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>(ThreatLevel.Medium);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setThreatLevel(initialValues.threatLevel || ThreatLevel.Medium);
    } else {
      form.setFieldsValue({
        threatLevel: ThreatLevel.Medium,
        isActive: true,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="competitor-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Competitor Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AimOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Rakip
              </p>
              <p className="text-sm text-white/60">
                Rakip analizi yapın
              </p>
            </div>
          </div>

          {/* Threat Level Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <AimOutlined className="mr-1" /> Tehdit Seviyesi
            </Text>
            <Form.Item name="threatLevel" className="mb-0" initialValue={ThreatLevel.Medium}>
              <Select
                options={threatLevelOptions}
                variant="filled"
                size="large"
                className="w-full"
                onChange={(val) => {
                  setThreatLevel(val);
                  form.setFieldValue('threatLevel', val);
                }}
              />
            </Form.Item>
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-sm font-medium text-gray-700 block">Aktif</Text>
                  <Text className="text-xs text-gray-400">Rakip takip ediliyor mu?</Text>
                </div>
                <Form.Item name="isActive" valuePropName="checked" className="mb-0" initialValue={true}>
                  <Switch />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.encounterCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Karşılaşma</div>
              </div>
              <div className="p-4 bg-green-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-green-600">
                  {initialValues.winCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kazanılan</div>
              </div>
              <div className="p-4 bg-red-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-red-600">
                  {initialValues.lossCount || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kaybedilen</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Competitor Name - Hero Input */}
          <div className="mb-8">
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Rakip adı zorunludur' },
                    { max: 200, message: 'En fazla 200 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Rakip Adı"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="code"
                  className="mb-0"
                >
                  <Input
                    placeholder="Kod"
                    variant="borderless"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      padding: '0',
                      color: '#1a1a1a',
                    }}
                    className="placeholder:text-gray-300"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" className="mb-0 mt-2">
              <TextArea
                placeholder="Rakip hakkında açıklama ekleyin..."
                variant="borderless"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  fontSize: '15px',
                  padding: '0',
                  color: '#666',
                  resize: 'none'
                }}
                className="placeholder:text-gray-300"
              />
            </Form.Item>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Company Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <BankOutlined className="mr-1" /> Firma Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Website</div>
                <Form.Item name="website" className="mb-3">
                  <Input
                    placeholder="https://www.rakip.com"
                    variant="filled"
                    prefix={<GlobalOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Merkez</div>
                <Form.Item name="headquarters" className="mb-3">
                  <Input
                    placeholder="İstanbul, Türkiye"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kuruluş Yılı</div>
                <Form.Item name="foundedYear" className="mb-3">
                  <InputNumber
                    placeholder="2010"
                    variant="filled"
                    className="w-full"
                    min={1900}
                    max={2100}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Çalışan Sayısı</div>
                <Form.Item name="employeeCount" className="mb-3">
                  <Input
                    placeholder="100-500"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Market Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <FileTextOutlined className="mr-1" /> Pazar Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Fiyat Karşılaştırması</div>
                <Form.Item name="priceComparison" className="mb-3">
                  <Select
                    placeholder="Bizimle karşılaştır"
                    options={priceComparisonOptions}
                    variant="filled"
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Pazar Payı (%)</div>
                <Form.Item name="marketShare" className="mb-3">
                  <InputNumber
                    placeholder="15"
                    variant="filled"
                    className="w-full"
                    min={0}
                    max={100}
                    addonAfter="%"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Contact Info */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <MailOutlined className="mr-1" /> İletişim Bilgileri
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">İletişim Kişisi</div>
                <Form.Item name="contactPerson" className="mb-3">
                  <Input
                    placeholder="Ad Soyad"
                    variant="filled"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">E-posta</div>
                <Form.Item name="email" className="mb-3">
                  <Input
                    placeholder="info@rakip.com"
                    variant="filled"
                    prefix={<MailOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <div className="text-xs text-gray-400 mb-1">Telefon</div>
                <Form.Item name="phone" className="mb-3">
                  <Input
                    placeholder="+90 (555) 123-4567"
                    variant="filled"
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
