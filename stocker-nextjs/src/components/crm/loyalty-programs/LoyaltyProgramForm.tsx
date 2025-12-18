'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import type { LoyaltyProgramDto } from '@/lib/api/services/crm.types';
import { LoyaltyProgramType } from '@/lib/api/services/crm.types';

const { TextArea } = Input;

// Program type options
const programTypeOptions = [
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
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setProgramType(initialValues.programType || LoyaltyProgramType.PointsBased);
      setIsActive(initialValues.isActive ?? true);
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
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Loyalty Program Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <GiftOutlined className="text-xl text-slate-500" />
              </div>
            </div>

            {/* Program Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Program adı zorunludur' },
                  { max: 100, message: 'En fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Program Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Program hakkında kısa not..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="programType" className="mb-0" initialValue={LoyaltyProgramType.PointsBased}>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setProgramType(LoyaltyProgramType.PointsBased);
                      form.setFieldValue('programType', LoyaltyProgramType.PointsBased);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      programType === LoyaltyProgramType.PointsBased
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Puan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProgramType(LoyaltyProgramType.TierBased);
                      form.setFieldValue('programType', LoyaltyProgramType.TierBased);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      programType === LoyaltyProgramType.TierBased
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Kademe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProgramType(LoyaltyProgramType.SpendBased);
                      form.setFieldValue('programType', LoyaltyProgramType.SpendBased);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      programType === LoyaltyProgramType.SpendBased
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Harcama
                  </button>
                </div>
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── PROGRAM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Program Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Program Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: 'Program kodu zorunludur' },
                    { max: 20, message: 'En fazla 20 karakter olabilir' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="LP001"
                    maxLength={20}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm text-slate-700">
                      {isActive ? 'Program aktif' : 'Program pasif'}
                    </div>
                  </div>
                  <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                    <Switch
                      checked={isActive}
                      onChange={(val) => {
                        setIsActive(val);
                        form.setFieldValue('isActive', val);
                      }}
                      checkedChildren="Aktif"
                      unCheckedChildren="Pasif"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── PUAN KAZANMA KURALLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Puan Kazanma Kuralları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Harcama Başına Puan</label>
                <Form.Item name="pointsPerSpend" className="mb-0" initialValue={1}>
                  <InputNumber
                    placeholder="1"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Harcama Birimi (₺)</label>
                <Form.Item name="spendUnit" className="mb-0" initialValue={1}>
                  <InputNumber
                    placeholder="1"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0.01}
                    step={0.01}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Harcama (Puan için)</label>
                <Form.Item name="minimumSpendForPoints" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İşlem Başına Maks. Puan</label>
                <Form.Item name="maxPointsPerTransaction" className="mb-0">
                  <InputNumber
                    placeholder="1000"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── PUAN KULLANMA KURALLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Puan Kullanma Kuralları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Puan Değeri (₺)</label>
                <Form.Item name="pointValue" className="mb-0" initialValue={0.01}>
                  <InputNumber
                    placeholder="0.01"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0.001}
                    step={0.001}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Kullanım Puanı</label>
                <Form.Item name="minimumRedemptionPoints" className="mb-0" initialValue={100}>
                  <InputNumber
                    placeholder="100"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. İndirim Oranı (%)</label>
                <Form.Item name="maxRedemptionPercentage" className="mb-0">
                  <InputNumber
                    placeholder="50"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                    max={100}
                    addonAfter="%"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── BONUS PUANLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Bonus Puanlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kayıt Bonusu</label>
                <Form.Item name="signUpBonusPoints" className="mb-0">
                  <InputNumber
                    placeholder="100"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Doğum Günü Bonusu</label>
                <Form.Item name="birthdayBonusPoints" className="mb-0">
                  <InputNumber
                    placeholder="50"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Referans Bonusu</label>
                <Form.Item name="referralBonusPoints" className="mb-0">
                  <InputNumber
                    placeholder="200"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
