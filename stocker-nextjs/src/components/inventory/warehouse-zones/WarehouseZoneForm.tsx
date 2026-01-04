'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch } from 'antd';
import { CubeIcon, FireIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useWarehouses } from '@/lib/api/hooks/useInventory';
import type { WarehouseZoneDto, ZoneType } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

interface WarehouseZoneFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: WarehouseZoneDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const zoneTypeOptions = [
  { value: 1, label: 'Genel' },
  { value: 2, label: 'Soğuk Depo' },
  { value: 3, label: 'Dondurucu' },
  { value: 4, label: 'Kuru Depo' },
  { value: 5, label: 'Tehlikeli Madde' },
  { value: 6, label: 'Karantina' },
  { value: 7, label: 'İadeler' },
  { value: 8, label: 'Toplama' },
  { value: 9, label: 'Sevkiyat' },
  { value: 10, label: 'Teslim Alma' },
  { value: 11, label: 'Cross-Docking' },
  { value: 12, label: 'Yüksek Değerli' },
  { value: 13, label: 'Toplu Depo' },
  { value: 99, label: 'Diğer' },
];

export default function WarehouseZoneForm({ form, initialValues, onFinish, loading }: WarehouseZoneFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isTemperatureControlled, setIsTemperatureControlled] = useState(false);
  const [isHumidityControlled, setIsHumidityControlled] = useState(false);
  const [isHazardous, setIsHazardous] = useState(false);

  const { data: warehouses = [] } = useWarehouses(true);

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsTemperatureControlled(initialValues.isTemperatureControlled ?? false);
      setIsHumidityControlled(initialValues.isHumidityControlled ?? false);
      setIsHazardous(initialValues.isHazardous ?? false);
    } else {
      form.setFieldsValue({
        zoneType: 1,
        priority: 100,
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
            HEADER: Icon + Name + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Zone Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Zone Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Bölge adı zorunludur' },
                  { max: 200, message: 'Bölge adı en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Bölge Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Bölge hakkında kısa açıklama..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('isActive', val);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── TEMEL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bölge Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Bölge kodu zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="ZONE-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo <span className="text-red-500">*</span></label>
                <Form.Item
                  name="warehouseId"
                  rules={[{ required: true, message: 'Depo seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Depo seçin"
                    disabled={!!initialValues}
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bölge Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="zoneType"
                  rules={[{ required: true, message: 'Bölge tipi zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Tip seçin"
                    options={zoneTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
                <Form.Item name="priority" className="mb-0" initialValue={100}>
                  <InputNumber
                    placeholder="100"
                    min={1}
                    max={999}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
                <p className="text-xs text-slate-400 mt-1">Düşük değerler önce işlenir</p>
              </div>
            </div>
          </div>

          {/* ─────────────── SICAKLIK KONTROLÜ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <FireIcon className="w-4 h-4" />
              Sıcaklık Kontrolü
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">
                    {isTemperatureControlled ? 'Sıcaklık kontrollü' : 'Sıcaklık kontrolsüz'}
                  </div>
                  <Form.Item name="isTemperatureControlled" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={isTemperatureControlled}
                      onChange={(val) => {
                        setIsTemperatureControlled(val);
                        form.setFieldValue('isTemperatureControlled', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {isTemperatureControlled && (
                <>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Sıcaklık (°C)</label>
                    <Form.Item name="minTemperature" className="mb-0">
                      <InputNumber
                        placeholder="-20"
                        className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Max. Sıcaklık (°C)</label>
                    <Form.Item name="maxTemperature" className="mb-0">
                      <InputNumber
                        placeholder="8"
                        className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Sıcaklık (°C)</label>
                    <Form.Item name="targetTemperature" className="mb-0">
                      <InputNumber
                        placeholder="4"
                        className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 h-full">
                      <div className="text-sm text-slate-700">İzleme</div>
                      <Form.Item name="requiresTemperatureMonitoring" valuePropName="checked" noStyle>
                        <Switch size="small" />
                      </Form.Item>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ─────────────── NEM KONTROLÜ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Nem Kontrolü
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">
                    {isHumidityControlled ? 'Nem kontrollü' : 'Nem kontrolsüz'}
                  </div>
                  <Form.Item name="isHumidityControlled" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={isHumidityControlled}
                      onChange={(val) => {
                        setIsHumidityControlled(val);
                        form.setFieldValue('isHumidityControlled', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {isHumidityControlled && (
                <>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Nem (%)</label>
                    <Form.Item name="minHumidity" className="mb-0">
                      <InputNumber
                        placeholder="30"
                        min={0}
                        max={100}
                        className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Max. Nem (%)</label>
                    <Form.Item name="maxHumidity" className="mb-0">
                      <InputNumber
                        placeholder="60"
                        min={0}
                        max={100}
                        className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ─────────────── GÜVENLİK VE TEHLİKELİ MADDE ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              Güvenlik ve Tehlikeli Madde
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">
                    {isHazardous ? 'Tehlikeli madde bölgesi' : 'Normal bölge'}
                  </div>
                  <Form.Item name="isHazardous" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={isHazardous}
                      onChange={(val) => {
                        setIsHazardous(val);
                        form.setFieldValue('isHazardous', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {isHazardous && (
                <>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Tehlike Sınıfı</label>
                    <Form.Item name="hazardClass" className="mb-0">
                      <Input
                        placeholder="Class 3"
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">UN Numarası</label>
                    <Form.Item name="unNumber" className="mb-0">
                      <Input
                        placeholder="UN1203"
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                      />
                    </Form.Item>
                  </div>
                </>
              )}
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Özel Erişim Gerekli</div>
                  <Form.Item name="requiresSpecialAccess" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Erişim Seviyesi</label>
                <Form.Item name="accessLevel" className="mb-0">
                  <InputNumber
                    placeholder="1"
                    min={1}
                    max={10}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KAPASİTE ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kapasite
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Toplam Alan (m²)</label>
                <Form.Item name="totalArea" className="mb-0">
                  <InputNumber
                    placeholder="100"
                    min={0}
                    addonAfter="m²"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kullanılabilir Alan (m²)</label>
                <Form.Item name="usableArea" className="mb-0">
                  <InputNumber
                    placeholder="80"
                    min={0}
                    addonAfter="m²"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Max Palet Kapasitesi</label>
                <Form.Item name="maxPalletCapacity" className="mb-0">
                  <InputNumber
                    placeholder="500"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Max Yükseklik (m)</label>
                <Form.Item name="maxHeight" className="mb-0">
                  <InputNumber
                    placeholder="6"
                    min={0}
                    addonAfter="m"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Max Ağırlık (kg/m²)</label>
                <Form.Item name="maxWeightPerArea" className="mb-0">
                  <InputNumber
                    placeholder="1000"
                    min={0}
                    addonAfter="kg/m²"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── OPERASYON SEÇENEKLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Operasyon Seçenekleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Varsayılan Toplama</div>
                  <Form.Item name="isDefaultPickingZone" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Varsayılan Yerleştirme</div>
                  <Form.Item name="isDefaultPutawayZone" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Karantina Bölgesi</div>
                  <Form.Item name="isQuarantineZone" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">İade Bölgesi</div>
                  <Form.Item name="isReturnsZone" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İstatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.locationCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Lokasyon Sayısı</div>
                  </div>
                </div>
              </div>
            </div>
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
