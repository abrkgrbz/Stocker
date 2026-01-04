'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch } from 'antd';
import { MapPinIcon } from '@heroicons/react/24/outline';

const { TextArea } = Input;
import { useWarehouses } from '@/lib/api/hooks/useInventory';
import type { WarehouseZoneDto } from '@/lib/api/services/inventory.types';

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
  { value: 7, label: 'İade' },
  { value: 8, label: 'Toplama' },
  { value: 9, label: 'Sevkiyat' },
  { value: 10, label: 'Kabul' },
  { value: 11, label: 'Cross-Docking' },
  { value: 12, label: 'Yüksek Değerli' },
  { value: 13, label: 'Toplu Depolama' },
  { value: 99, label: 'Diğer' },
];

export default function WarehouseZoneForm({ form, initialValues, onFinish, loading }: WarehouseZoneFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isTemperatureControlled, setIsTemperatureControlled] = useState(false);
  const [isHumidityControlled, setIsHumidityControlled] = useState(false);
  const [isHazardous, setIsHazardous] = useState(false);
  const [requiresSpecialAccess, setRequiresSpecialAccess] = useState(false);

  const { data: warehouses = [] } = useWarehouses();

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: `${w.code} - ${w.name}`,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsTemperatureControlled(initialValues.isTemperatureControlled ?? false);
      setIsHumidityControlled(initialValues.isHumidityControlled ?? false);
      setIsHazardous(initialValues.isHazardous ?? false);
      setRequiresSpecialAccess(initialValues.requiresSpecialAccess ?? false);
    } else {
      form.setFieldsValue({
        priority: 0,
        isDefaultPickingZone: false,
        isDefaultPutawayZone: false,
        isQuarantineZone: false,
        isReturnsZone: false,
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
                <MapPinIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Zone Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Bölge adı zorunludur' },
                  { max: 100, message: 'Bölge adı en fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Bölge Adı Girin... (örn: A Blok Soğuk Depo)"
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
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
                    placeholder="ZONE-A1"
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
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    disabled={!!initialValues}
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
                >
                  <Select
                    placeholder="Tip seçin"
                    showSearch
                    optionFilterProp="label"
                    options={zoneTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    placeholder="Bölge hakkında açıklama..."
                    rows={2}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KAPASİTE BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kapasite Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Toplam Alan (m²)</label>
                <Form.Item name="totalArea" className="mb-0">
                  <InputNumber
                    placeholder="100"
                    min={0}
                    step={0.1}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kullanılabilir Alan (m²)</label>
                <Form.Item name="usableArea" className="mb-0">
                  <InputNumber
                    placeholder="80"
                    min={0}
                    step={0.1}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. Palet Kapasitesi</label>
                <Form.Item name="maxPalletCapacity" className="mb-0">
                  <InputNumber
                    placeholder="50"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. Yükseklik (m)</label>
                <Form.Item name="maxHeight" className="mb-0">
                  <InputNumber
                    placeholder="5"
                    min={0}
                    step={0.1}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. Alan Başı Ağırlık (kg/m²)</label>
                <Form.Item name="maxWeightPerArea" className="mb-0">
                  <InputNumber
                    placeholder="1000"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SICAKLIK KONTROLÜ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sıcaklık Kontrolü
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Sıcaklık Kontrollü</span>
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
              <div className="col-span-6">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Sıcaklık İzleme Gerekli</span>
                  <Form.Item name="requiresTemperatureMonitoring" valuePropName="checked" noStyle initialValue={false}>
                    <Switch disabled={!isTemperatureControlled} />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Sıcaklık (°C)</label>
                <Form.Item name="minTemperature" className="mb-0">
                  <InputNumber
                    placeholder="-20"
                    disabled={!isTemperatureControlled}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. Sıcaklık (°C)</label>
                <Form.Item name="maxTemperature" className="mb-0">
                  <InputNumber
                    placeholder="4"
                    disabled={!isTemperatureControlled}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Sıcaklık (°C)</label>
                <Form.Item name="targetTemperature" className="mb-0">
                  <InputNumber
                    placeholder="2"
                    disabled={!isTemperatureControlled}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NEM KONTROLÜ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Nem Kontrolü
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Nem Kontrollü</span>
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
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Min. Nem (%)</label>
                <Form.Item name="minHumidity" className="mb-0">
                  <InputNumber
                    placeholder="30"
                    min={0}
                    max={100}
                    disabled={!isHumidityControlled}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. Nem (%)</label>
                <Form.Item name="maxHumidity" className="mb-0">
                  <InputNumber
                    placeholder="60"
                    min={0}
                    max={100}
                    disabled={!isHumidityControlled}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── GÜVENLİK VE TEHLİKE ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Güvenlik ve Tehlike
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Tehlikeli Madde Bölgesi</span>
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
              <div className="col-span-6">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Özel Erişim Gerekli</span>
                  <Form.Item name="requiresSpecialAccess" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={requiresSpecialAccess}
                      onChange={(val) => {
                        setRequiresSpecialAccess(val);
                        form.setFieldValue('requiresSpecialAccess', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tehlike Sınıfı</label>
                <Form.Item name="hazardClass" className="mb-0">
                  <Input
                    placeholder="2.1"
                    disabled={!isHazardous}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">UN Numarası</label>
                <Form.Item name="unNumber" className="mb-0">
                  <Input
                    placeholder="UN1234"
                    disabled={!isHazardous}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Erişim Seviyesi</label>
                <Form.Item name="accessLevel" className="mb-0">
                  <InputNumber
                    placeholder="1"
                    min={1}
                    max={10}
                    disabled={!requiresSpecialAccess}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── OPERASYON AYARLARI ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Operasyon Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
                <Form.Item name="priority" className="mb-0" initialValue={0}>
                  <InputNumber
                    placeholder="0"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 h-full">
                  <span className="text-sm font-medium text-slate-600">Varsayılan Toplama</span>
                  <Form.Item name="isDefaultPickingZone" valuePropName="checked" noStyle initialValue={false}>
                    <Switch />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 h-full">
                  <span className="text-sm font-medium text-slate-600">Varsayılan Yerleştirme</span>
                  <Form.Item name="isDefaultPutawayZone" valuePropName="checked" noStyle initialValue={false}>
                    <Switch />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Karantina Bölgesi</span>
                  <Form.Item name="isQuarantineZone" valuePropName="checked" noStyle initialValue={false}>
                    <Switch />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">İade Bölgesi</span>
                  <Form.Item name="isReturnsZone" valuePropName="checked" noStyle initialValue={false}>
                    <Switch />
                  </Form.Item>
                </div>
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
