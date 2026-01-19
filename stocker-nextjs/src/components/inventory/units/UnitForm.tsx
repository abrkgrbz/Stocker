'use client';

import React, { useEffect, useState } from 'react';
import { Form, Alert } from 'antd';
import { HashtagIcon } from '@heroicons/react/24/outline';
import { useUnits } from '@/lib/api/hooks/useInventory';
import type { UnitDto, CreateUnitDto, UpdateUnitDto } from '@/lib/api/services/inventory.types';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormTextArea,
  FormNumber,
  FormSelect,
  FormSwitch,
  useUnsavedChanges,
  nameFieldRules,
  codeFieldRules,
} from '@/components/forms';

interface UnitFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: UnitDto;
  onFinish: (values: CreateUnitDto | UpdateUnitDto) => void;
  loading?: boolean;
}

export default function UnitForm({ form, initialValues, onFinish, loading }: UnitFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [hasBaseUnit, setHasBaseUnit] = useState(false);
  const [allowDecimals, setAllowDecimals] = useState(false);

  const { data: units = [] } = useUnits(true);

  // Filter out the current unit from base unit options
  const baseUnitOptions = units
    .filter(u => !initialValues || u.id !== initialValues.id)
    .filter(u => !u.baseUnitId) // Only show base units
    .map(u => ({
      value: u.id,
      label: `${u.name} (${u.symbol || u.code})`,
    }));

  // Unsaved changes tracking
  const { markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
    initialValues: initialValues || {},
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setHasBaseUnit(!!initialValues.baseUnitId);
      setAllowDecimals(initialValues.allowDecimals ?? false);
    } else {
      form.setFieldsValue({
        conversionFactor: 1,
        displayOrder: 0,
        allowDecimals: false,
        decimalPlaces: 0,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish(values);
  };

  const handleAllowDecimalsChange = (val: boolean) => {
    setAllowDecimals(val);
    if (!val) {
      form.setFieldValue('decimalPlaces', 0);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* Header */}
        <FormHeader
          form={form}
          icon={<HashtagIcon className="w-6 h-6 text-slate-500" />}
          titleField="name"
          titlePlaceholder="Birim Adı Girin... (örn: Kilogram)"
          titleRules={nameFieldRules('Birim adı', 100)}
          showStatusToggle={true}
          statusValue={isActive}
          onStatusChange={setIsActive}
          loading={loading}
        />

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Temel Bilgiler */}
          <FormSection title="Temel Bilgiler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="code"
                  label="Birim Kodu"
                  required
                  placeholder="KG"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Birim kodu')}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="symbol"
                  label="Sembol"
                  placeholder="kg"
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="displayOrder"
                  label="Sıralama"
                  placeholder="0"
                  min={0}
                  formItemProps={{ initialValue: 0 }}
                />
              </div>
              <div className="col-span-12">
                <FormTextArea
                  name="description"
                  label="Açıklama"
                  placeholder="Birim hakkında açıklama..."
                  rows={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Ondalık Ayarları */}
          <FormSection title="Ondalık Ayarları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="allowDecimals"
                  title="Ondalık Kullan"
                  value={allowDecimals}
                  onChange={handleAllowDecimalsChange}
                  descriptionTrue="Ondalıklı değerler kabul edilir"
                  descriptionFalse="Sadece tam sayılar kabul edilir"
                  disabled={loading}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="decimalPlaces"
                  label="Ondalık Basamak"
                  placeholder="0"
                  min={0}
                  max={6}
                  disabled={!allowDecimals}
                  formItemProps={{ initialValue: 0 }}
                />
              </div>
            </div>
          </FormSection>

          {/* Dönüşüm Ayarları */}
          <FormSection title="Dönüşüm Ayarları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="baseUnitId"
                  label="Temel Birim"
                  placeholder="Temel birim seçin (opsiyonel)"
                  allowClear
                  options={baseUnitOptions}
                  onChange={(val) => setHasBaseUnit(!!val)}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="conversionFactor"
                  label="Dönüşüm Faktörü"
                  placeholder="1"
                  min={0.0001}
                  step={0.01}
                  disabled={!hasBaseUnit}
                  rules={[{ required: hasBaseUnit, message: 'Dönüşüm faktörü zorunludur' }]}
                />
              </div>
            </div>
            <Alert
              type="info"
              message="Örnek"
              description="Eğer temel birim 'Kilogram' ve bu birim 'Gram' ise, dönüşüm faktörü 0.001 olmalıdır (1 gram = 0.001 kilogram)"
              showIcon
              className="!mt-4 !bg-slate-50 !border-slate-200"
            />
          </FormSection>

          {/* Türetilmiş Birimler (Düzenleme Modu) */}
          {initialValues && initialValues.derivedUnits && initialValues.derivedUnits.length > 0 && (
            <FormSection title="Türetilmiş Birimler">
              <div className="grid grid-cols-12 gap-4">
                {initialValues.derivedUnits.map(du => (
                  <div key={du.id} className="col-span-6">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <span className="text-sm text-slate-700">{du.name}</span>
                      <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">x{du.conversionFactor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
