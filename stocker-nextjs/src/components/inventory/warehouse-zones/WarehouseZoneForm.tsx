'use client';

import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useWarehouses } from '@/lib/api/hooks/useInventory';
import type { WarehouseZoneDto, CreateWarehouseZoneDto, UpdateWarehouseZoneDto } from '@/lib/api/services/inventory.types';
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

interface WarehouseZoneFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: WarehouseZoneDto;
  onFinish: (values: CreateWarehouseZoneDto | UpdateWarehouseZoneDto) => void;
  loading?: boolean;
  defaultWarehouseId?: number;
}

const zoneTypeOptions = [
  { value: 'General', label: 'Genel' },
  { value: 'ColdStorage', label: 'Soğuk Depo' },
  { value: 'Freezer', label: 'Dondurucu' },
  { value: 'DryStorage', label: 'Kuru Depo' },
  { value: 'Hazardous', label: 'Tehlikeli Madde' },
  { value: 'Quarantine', label: 'Karantina' },
  { value: 'Returns', label: 'İade' },
  { value: 'Picking', label: 'Toplama' },
  { value: 'Shipping', label: 'Sevkiyat' },
  { value: 'Receiving', label: 'Kabul' },
  { value: 'CrossDocking', label: 'Cross-Docking' },
  { value: 'HighValue', label: 'Yüksek Değerli' },
  { value: 'Bulk', label: 'Toplu Depolama' },
  { value: 'Other', label: 'Diğer' },
];

export default function WarehouseZoneForm({ form, initialValues, onFinish, loading, defaultWarehouseId }: WarehouseZoneFormProps) {
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
      setIsTemperatureControlled(initialValues.isTemperatureControlled ?? false);
      setIsHumidityControlled(initialValues.isHumidityControlled ?? false);
      setIsHazardous(initialValues.isHazardous ?? false);
      setRequiresSpecialAccess(initialValues.requiresSpecialAccess ?? false);
    } else {
      const initialData: Record<string, any> = {
        priority: 0,
        isDefaultPickingZone: false,
        isDefaultPutawayZone: false,
        isQuarantineZone: false,
        isReturnsZone: false,
      };
      if (defaultWarehouseId) {
        initialData.warehouseId = defaultWarehouseId;
      }
      form.setFieldsValue(initialData);
    }
  }, [form, initialValues, defaultWarehouseId]);

  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish(values);
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
          icon={<MapPinIcon className="w-6 h-6 text-slate-500" />}
          titleField="name"
          titlePlaceholder="Bölge Adı Girin... (örn: A Blok Soğuk Depo)"
          titleRules={nameFieldRules('Bölge adı', 100)}
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
                  label="Bölge Kodu"
                  required
                  placeholder="ZONE-A1"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Bölge kodu')}
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="warehouseId"
                  label="Depo"
                  required
                  placeholder="Depo seçin"
                  disabled={!!initialValues}
                  options={warehouseOptions}
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="zoneType"
                  label="Bölge Tipi"
                  required
                  placeholder="Tip seçin"
                  options={zoneTypeOptions}
                />
              </div>
              <div className="col-span-12">
                <FormTextArea
                  name="description"
                  label="Açıklama"
                  placeholder="Bölge hakkında açıklama..."
                  rows={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Kapasite Bilgileri */}
          <FormSection title="Kapasite Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormNumber
                  name="totalArea"
                  label="Toplam Alan (m²)"
                  placeholder="100"
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="usableArea"
                  label="Kullanılabilir Alan (m²)"
                  placeholder="80"
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="maxPalletCapacity"
                  label="Maks. Palet Kapasitesi"
                  placeholder="50"
                  min={0}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="maxHeight"
                  label="Maks. Yükseklik (m)"
                  placeholder="5"
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="maxWeightPerArea"
                  label="Maks. Alan Başı Ağırlık (kg/m²)"
                  placeholder="1000"
                  min={0}
                />
              </div>
            </div>
          </FormSection>

          {/* Sıcaklık Kontrolü */}
          <FormSection title="Sıcaklık Kontrolü">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="isTemperatureControlled"
                  title="Sıcaklık Kontrollü"
                  value={isTemperatureControlled}
                  onChange={setIsTemperatureControlled}
                  descriptionTrue="Sıcaklık kontrol edilir"
                  descriptionFalse="Sıcaklık kontrol edilmez"
                  disabled={loading}
                />
              </div>
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="requiresTemperatureMonitoring"
                  title="Sıcaklık İzleme Gerekli"
                  disabled={!isTemperatureControlled || loading}
                  descriptionTrue="İzleme aktif"
                  descriptionFalse="İzleme pasif"
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="minTemperature"
                  label="Min. Sıcaklık (°C)"
                  placeholder="-20"
                  disabled={!isTemperatureControlled}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="maxTemperature"
                  label="Maks. Sıcaklık (°C)"
                  placeholder="4"
                  disabled={!isTemperatureControlled}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="targetTemperature"
                  label="Hedef Sıcaklık (°C)"
                  placeholder="2"
                  disabled={!isTemperatureControlled}
                />
              </div>
            </div>
          </FormSection>

          {/* Nem Kontrolü */}
          <FormSection title="Nem Kontrolü">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="isHumidityControlled"
                  title="Nem Kontrollü"
                  value={isHumidityControlled}
                  onChange={setIsHumidityControlled}
                  descriptionTrue="Nem kontrol edilir"
                  descriptionFalse="Nem kontrol edilmez"
                  disabled={loading}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="minHumidity"
                  label="Min. Nem (%)"
                  placeholder="30"
                  min={0}
                  max={100}
                  disabled={!isHumidityControlled}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="maxHumidity"
                  label="Maks. Nem (%)"
                  placeholder="60"
                  min={0}
                  max={100}
                  disabled={!isHumidityControlled}
                />
              </div>
            </div>
          </FormSection>

          {/* Güvenlik ve Tehlike */}
          <FormSection title="Güvenlik ve Tehlike">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="isHazardous"
                  title="Tehlikeli Madde Bölgesi"
                  value={isHazardous}
                  onChange={setIsHazardous}
                  descriptionTrue="Tehlikeli madde içerebilir"
                  descriptionFalse="Tehlikeli madde yok"
                  disabled={loading}
                />
              </div>
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="requiresSpecialAccess"
                  title="Özel Erişim Gerekli"
                  value={requiresSpecialAccess}
                  onChange={setRequiresSpecialAccess}
                  descriptionTrue="Özel erişim gerekli"
                  descriptionFalse="Standart erişim"
                  disabled={loading}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="hazardClass"
                  label="Tehlike Sınıfı"
                  placeholder="2.1"
                  disabled={!isHazardous}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="unNumber"
                  label="UN Numarası"
                  placeholder="UN1234"
                  disabled={!isHazardous}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="accessLevel"
                  label="Erişim Seviyesi"
                  placeholder="1"
                  min={1}
                  max={10}
                  disabled={!requiresSpecialAccess}
                />
              </div>
            </div>
          </FormSection>

          {/* Operasyon Ayarları */}
          <FormSection title="Operasyon Ayarları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormNumber
                  name="priority"
                  label="Öncelik"
                  placeholder="0"
                  min={0}
                  formItemProps={{ initialValue: 0 }}
                />
              </div>
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="isDefaultPickingZone"
                  title="Varsayılan Toplama"
                  descriptionTrue="Bu bölgeden topla"
                  descriptionFalse="Varsayılan değil"
                  disabled={loading}
                />
              </div>
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="isDefaultPutawayZone"
                  title="Varsayılan Yerleştirme"
                  descriptionTrue="Bu bölgeye yerleştir"
                  descriptionFalse="Varsayılan değil"
                  disabled={loading}
                />
              </div>
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="isQuarantineZone"
                  title="Karantina Bölgesi"
                  descriptionTrue="Karantina için kullanılır"
                  descriptionFalse="Normal bölge"
                  disabled={loading}
                />
              </div>
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="isReturnsZone"
                  title="İade Bölgesi"
                  descriptionTrue="İadeler için kullanılır"
                  descriptionFalse="Normal bölge"
                  disabled={loading}
                />
              </div>
            </div>
          </FormSection>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
