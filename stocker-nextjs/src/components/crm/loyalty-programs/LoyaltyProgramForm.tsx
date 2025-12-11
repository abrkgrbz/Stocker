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
  GiftOutlined,
  StarOutlined,
  DollarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { LoyaltyProgramDto } from '@/lib/api/services/crm.types';
import { LoyaltyProgramType } from '@/lib/api/services/crm.types';

const { TextArea } = Input;
const { Text } = Typography;

// Program type options
const programTypeOptions = [
  { value: LoyaltyProgramType.PointsBased, label: '⭐ Puan' },
  { value: LoyaltyProgramType.TierBased, label: '🏆 Kademe' },
  { value: LoyaltyProgramType.SpendBased, label: '💰 Harcama' },
  { value: LoyaltyProgramType.Subscription, label: '📦 Abonelik' },
];

const allProgramTypeOptions = [
  { value: LoyaltyProgramType.PointsBased, label: 'Puan Tabanlı' },
  { value: LoyaltyProgramType.TierBased, label: 'Kademe Tabanlı' },
  { value: LoyaltyProgramType.SpendBased, label: 'Harcama Tabanlı' },
  { value: LoyaltyProgramType.Subscription, label: 'Abonelik' },
  { value: LoyaltyProgramType.Hybrid, label: 'Hibrit' },
];

interface LoyaltyProgramFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LoyaltyProgramDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function LoyaltyProgramForm({ form, initialValues, onFinish, loading }: LoyaltyProgramFormProps) {
  const [programType, setProgramType] = useState<LoyaltyProgramType>(LoyaltyProgramType.PointsBased);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setProgramType(initialValues.programType || LoyaltyProgramType.PointsBased);
    } else {
      form.setFieldsValue({
        programType: LoyaltyProgramType.PointsBased,
        isActive: true,
        pointsPerSpend: 1,
        spendUnit: 1,
        pointValue: 0.01,
        minimumRedemptionPoints: 100,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="loyalty-program-form-modern"
    >
      <Row gutter={48}>
        {/* Left Panel - Visual & Status (40%) */}
        <Col xs={24} lg={10}>
          {/* Loyalty Program Visual Representation */}
          <div className="mb-8">
            <div
              style={{
                background: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GiftOutlined style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
              <p className="mt-4 text-lg font-medium text-white/90">
                Sadakat Programı
              </p>
              <p className="text-sm text-white/60">
                Müşteri sadakatini ödüllendirin
              </p>
            </div>
          </div>

          {/* Program Type Selection */}
          <div className="mb-6">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <StarOutlined className="mr-1" /> Program Tipi
            </Text>
            <Form.Item name="programType" className="mb-0" initialValue={LoyaltyProgramType.PointsBased}>
              <Segmented
                block
                options={programTypeOptions}
                value={programType}
                onChange={(val) => {
                  setProgramType(val as LoyaltyProgramType);
                  form.setFieldValue('programType', val);
                }}
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <div className="p-4 bg-gray-50/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-sm font-medium text-gray-700 block">Aktif</Text>
                  <Text className="text-xs text-gray-400">Program aktif mi?</Text>
                </div>
                <Form.Item name="isActive" valuePropName="checked" className="mb-0" initialValue={true}>
                  <Switch />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && initialValues.tiers && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.tiers.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Kademe</div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-800">
                  {initialValues.rewards?.length || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Ödül</div>
              </div>
            </div>
          )}
        </Col>

        {/* Right Panel - Form Content (60%) */}
        <Col xs={24} lg={14}>
          {/* Program Name - Hero Input */}
          <div className="mb-8">
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Program adı zorunludur' },
                    { max: 100, message: 'En fazla 100 karakter' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Program Adı"
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
                  rules={[
                    { required: true, message: 'Kod zorunludur' },
                    { max: 20, message: 'En fazla 20 karakter' },
                  ]}
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
                placeholder="Program hakkında açıklama ekleyin..."
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

          {/* Points Rules */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <DollarOutlined className="mr-1" /> Puan Kazanma Kuralları
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Harcama Başına Puan</div>
                <Form.Item name="pointsPerSpend" className="mb-3" initialValue={1}>
                  <InputNumber
                    placeholder="1"
                    variant="filled"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Harcama Birimi (₺)</div>
                <Form.Item name="spendUnit" className="mb-3" initialValue={1}>
                  <InputNumber
                    placeholder="1"
                    variant="filled"
                    className="w-full"
                    min={0.01}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Min. Harcama (Puan için)</div>
                <Form.Item name="minimumSpendForPoints" className="mb-3">
                  <InputNumber
                    placeholder="0"
                    variant="filled"
                    className="w-full"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value) => (value?.replace(/\./g, '') || '0') as unknown as 0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">İşlem Başına Maks. Puan</div>
                <Form.Item name="maxPointsPerTransaction" className="mb-3">
                  <InputNumber
                    placeholder="1000"
                    variant="filled"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-8" />

          {/* Redemption Rules */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <GiftOutlined className="mr-1" /> Puan Kullanma Kuralları
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Puan Değeri (₺)</div>
                <Form.Item name="pointValue" className="mb-3" initialValue={0.01}>
                  <InputNumber
                    placeholder="0.01"
                    variant="filled"
                    className="w-full"
                    min={0.001}
                    step={0.001}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Min. Kullanım Puanı</div>
                <Form.Item name="minimumRedemptionPoints" className="mb-3" initialValue={100}>
                  <InputNumber
                    placeholder="100"
                    variant="filled"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Maks. İndirim Oranı (%)</div>
                <Form.Item name="maxRedemptionPercentage" className="mb-3">
                  <InputNumber
                    placeholder="50"
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

          {/* Bonus Points */}
          <div className="mb-8">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">
              <SettingOutlined className="mr-1" /> Bonus Puanlar
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Kayıt Bonusu</div>
                <Form.Item name="signUpBonusPoints" className="mb-3">
                  <InputNumber
                    placeholder="100"
                    variant="filled"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Doğum Günü Bonusu</div>
                <Form.Item name="birthdayBonusPoints" className="mb-3">
                  <InputNumber
                    placeholder="50"
                    variant="filled"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-xs text-gray-400 mb-1">Referans Bonusu</div>
                <Form.Item name="referralBonusPoints" className="mb-3">
                  <InputNumber
                    placeholder="200"
                    variant="filled"
                    className="w-full"
                    min={0}
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
