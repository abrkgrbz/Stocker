'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  InputNumber,
  message,
  Card,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  BuildingOffice2Icon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  useWarehouses,
  useLocations,
  useProducts,
  useCreateStockTransfer,
} from '@/lib/api/hooks/useInventory';
import { TransferType, type CreateStockTransferDto, type CreateStockTransferItemDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface TransferItem extends CreateStockTransferItemDto {
  key: string;
  productCode?: string;
  productName?: string;
}

const transferTypeOptions = [
  { value: TransferType.Standard, label: 'Standart', description: 'Normal depo transferi' },
  { value: TransferType.Urgent, label: 'Acil', description: 'Öncelikli transfer' },
  { value: TransferType.Replenishment, label: 'İkmal', description: 'Stok takviyesi' },
  { value: TransferType.Return, label: 'İade', description: 'Ürün iadesi' },
  { value: TransferType.Internal, label: 'Dahili', description: 'Aynı tesis içi' },
  { value: TransferType.CrossDock, label: 'Cross-Dock', description: 'Geçiş transferi' },
  { value: TransferType.Consolidation, label: 'Konsolidasyon', description: 'Birleştirme' },
];

export default function NewStockTransferPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<TransferItem[]>([]);
  const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState<number | undefined>();
  const [selectedDestWarehouse, setSelectedDestWarehouse] = useState<number | undefined>();

  const { data: warehouses = [] } = useWarehouses();
  const { data: sourceLocations = [] } = useLocations(selectedSourceWarehouse);
  const { data: destLocations = [] } = useLocations(selectedDestWarehouse);
  const { data: products = [] } = useProducts();
  const createTransfer = useCreateStockTransfer();

  const handleAddItem = () => {
    const newItem: TransferItem = {
      key: `item-${Date.now()}`,
      productId: 0,
      requestedQuantity: 1,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof TransferItem, value: unknown) => {
    setItems(
      items.map((item) => {
        if (item.key === key) {
          if (field === 'productId') {
            const product = products.find((p) => p.id === value);
            return {
              ...item,
              productId: value as number,
              productCode: product?.code,
              productName: product?.name,
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = async (values: {
    transferNumber: string;
    transferDate: dayjs.Dayjs;
    sourceWarehouseId: number;
    destinationWarehouseId: number;
    transferType: TransferType;
    description?: string;
    notes?: string;
    expectedArrivalDate?: dayjs.Dayjs;
  }) => {
    try {
      if (items.length === 0) {
        message.error('En az bir ürün eklemelisiniz');
        return;
      }

      const invalidItems = items.filter((item) => !item.productId || item.requestedQuantity <= 0);
      if (invalidItems.length > 0) {
        message.error('Tüm ürünlerin geçerli bilgilere sahip olduğundan emin olun');
        return;
      }

      const data: CreateStockTransferDto = {
        transferNumber: values.transferNumber,
        transferDate: values.transferDate?.toISOString() || new Date().toISOString(),
        sourceWarehouseId: values.sourceWarehouseId,
        destinationWarehouseId: values.destinationWarehouseId,
        transferType: values.transferType,
        description: values.description,
        notes: values.notes,
        expectedArrivalDate: values.expectedArrivalDate?.toISOString(),
        createdByUserId: 0, // Will be set by backend from auth context
        items: items.map((item) => ({
          productId: item.productId,
          sourceLocationId: item.sourceLocationId,
          destinationLocationId: item.destinationLocationId,
          requestedQuantity: item.requestedQuantity,
          serialNumber: item.serialNumber,
          lotNumber: item.lotNumber,
          notes: item.notes,
        })),
      };

      await createTransfer.mutateAsync(data);
      message.success('Stok transferi oluşturuldu');
      router.push('/inventory/stock-transfers');
    } catch {
      message.error('Transfer oluşturulurken bir hata oluştu');
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + (item.requestedQuantity || 0), 0);
  const sourceWarehouse = warehouses.find(w => w.id === selectedSourceWarehouse);
  const destWarehouse = warehouses.find(w => w.id === selectedDestWarehouse);

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/inventory/stock-transfers')}
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <ArrowsRightLeftIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni Stok Transferi</h1>
                <p className="text-sm text-slate-500 m-0">Depolar arası stok hareketi oluşturun</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/inventory/stock-transfers')}>
              İptal
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={createTransfer.isPending}
              disabled={items.length === 0 || !selectedSourceWarehouse || !selectedDestWarehouse}
            >
              Transfer Oluştur
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              transferDate: dayjs(),
              transferType: TransferType.Standard,
            }}
          >
            {/* Transfer Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h3 className="text-base font-semibold text-slate-900 mb-6">Transfer Bilgileri</h3>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="transferNumber"
                  label="Transfer Numarası"
                  rules={[{ required: true, message: 'Transfer numarası gerekli' }]}
                  className="col-span-2"
                >
                  <Input placeholder="TR-2024-001" size="large" />
                </Form.Item>

                <Form.Item
                  name="transferType"
                  label="Transfer Türü"
                  rules={[{ required: true, message: 'Transfer türü seçiniz' }]}
                >
                  <Select
                    size="large"
                    placeholder="Tür seçin"
                    options={transferTypeOptions.map(t => ({
                      value: t.value,
                      label: t.label,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  name="transferDate"
                  label="Transfer Tarihi"
                  rules={[{ required: true, message: 'Tarih gerekli' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="sourceWarehouseId"
                  label="Kaynak Depo"
                  rules={[{ required: true, message: 'Kaynak depo seçiniz' }]}
                >
                  <Select
                    size="large"
                    placeholder="Kaynak depo seçin"
                    options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                    onChange={(value) => {
                      setSelectedSourceWarehouse(value);
                      // Clear items when source warehouse changes
                      if (items.length > 0) {
                        setItems(items.map(item => ({ ...item, sourceLocationId: undefined })));
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="destinationWarehouseId"
                  label="Hedef Depo"
                  rules={[
                    { required: true, message: 'Hedef depo seçiniz' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('sourceWarehouseId') !== value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Kaynak ve hedef depo aynı olamaz'));
                      },
                    }),
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Hedef depo seçin"
                    options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                    onChange={(value) => {
                      setSelectedDestWarehouse(value);
                      // Clear items when dest warehouse changes
                      if (items.length > 0) {
                        setItems(items.map(item => ({ ...item, destinationLocationId: undefined })));
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="expectedArrivalDate"
                  label="Tahmini Varış Tarihi"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Açıklama"
                  className="col-span-2"
                >
                  <TextArea rows={2} placeholder="Transfer açıklaması..." />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label="Notlar"
                  className="col-span-2"
                >
                  <TextArea rows={2} placeholder="Ek notlar..." />
                </Form.Item>
              </div>
            </div>

            {/* Transfer Items Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold text-slate-900 m-0">Transfer Kalemleri</h3>
                <Button
                  type="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleAddItem}
                  disabled={!selectedSourceWarehouse || !selectedDestWarehouse}
                >
                  Ürün Ekle
                </Button>
              </div>

              {!selectedSourceWarehouse || !selectedDestWarehouse ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <BuildingOffice2Icon className="w-10 h-10 text-gray-300 mb-3 mx-auto" />
                  <p className="text-gray-500 font-medium">Önce depoları seçin</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Ürün ekleyebilmek için kaynak ve hedef depoları seçmelisiniz
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all"
                  onClick={handleAddItem}
                >
                  <CubeIcon className="w-10 h-10 text-gray-300 mb-3 mx-auto" />
                  <p className="text-gray-500 font-medium">Henüz ürün eklenmedi</p>
                  <p className="text-gray-400 text-sm mt-1">Transfer edilecek ürünleri ekleyin</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <Card
                      key={item.key}
                      size="small"
                      className="border-slate-200"
                      title={
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">
                            {item.productName || 'Ürün seçiniz'}
                          </span>
                          {item.productCode && (
                            <span className="text-xs text-slate-400">({item.productCode})</span>
                          )}
                        </div>
                      }
                      extra={
                        <Button
                          type="text"
                          danger
                          icon={<TrashIcon className="w-4 h-4" />}
                          onClick={() => handleRemoveItem(item.key)}
                        />
                      }
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <label className="text-xs text-slate-500 mb-1 block">Ürün</label>
                          <Select
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Ürün seçiniz"
                            value={item.productId || undefined}
                            optionFilterProp="children"
                            onChange={(value) => handleItemChange(item.key, 'productId', value)}
                            filterOption={(input, option) =>
                              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={products.map((p) => ({
                              value: p.id,
                              label: `${p.code} - ${p.name}`,
                            }))}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Miktar</label>
                          <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            value={item.requestedQuantity}
                            onChange={(val) => handleItemChange(item.key, 'requestedQuantity', val || 1)}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Kaynak Lokasyon</label>
                          <Select
                            style={{ width: '100%' }}
                            placeholder="Opsiyonel"
                            value={item.sourceLocationId}
                            onChange={(val) => handleItemChange(item.key, 'sourceLocationId', val)}
                            allowClear
                            options={sourceLocations.map((l) => ({
                              value: l.id,
                              label: l.code,
                            }))}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Hedef Lokasyon</label>
                          <Select
                            style={{ width: '100%' }}
                            placeholder="Opsiyonel"
                            value={item.destinationLocationId}
                            onChange={(val) => handleItemChange(item.key, 'destinationLocationId', val)}
                            allowClear
                            options={destLocations.map((l) => ({
                              value: l.id,
                              label: l.code,
                            }))}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Lot No</label>
                          <Input
                            placeholder="Lot numarası"
                            value={item.lotNumber}
                            onChange={(e) => handleItemChange(item.key, 'lotNumber', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Seri No</label>
                          <Input
                            placeholder="Seri numarası"
                            value={item.serialNumber}
                            onChange={(e) => handleItemChange(item.key, 'serialNumber', e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Add another item button at bottom */}
                  <Button
                    type="dashed"
                    onClick={handleAddItem}
                    block
                    icon={<PlusIcon className="w-4 h-4" />}
                    className="mt-4"
                  >
                    Başka Ürün Ekle
                  </Button>
                </div>
              )}
            </div>
          </Form>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          {/* Transfer Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Transfer Özeti</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Toplam Kalem</span>
                <span className="font-medium text-slate-900">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Toplam Miktar</span>
                <span className="font-medium text-slate-900">{totalQuantity}</span>
              </div>
            </div>
          </div>

          {/* Source Warehouse Info */}
          {sourceWarehouse && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <BuildingOffice2Icon className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-amber-700 uppercase">Kaynak Depo</span>
              </div>
              <div className="font-medium text-slate-900">{sourceWarehouse.name}</div>
              {sourceWarehouse.address && (
                <div className="text-sm text-slate-500 mt-1">{sourceWarehouse.address}</div>
              )}
            </div>
          )}

          {/* Destination Warehouse Info */}
          {destWarehouse && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TruckIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-emerald-700 uppercase">Hedef Depo</span>
              </div>
              <div className="font-medium text-slate-900">{destWarehouse.name}</div>
              {destWarehouse.address && (
                <div className="text-sm text-slate-500 mt-1">{destWarehouse.address}</div>
              )}
            </div>
          )}

          {/* Arrow indicator between warehouses */}
          {sourceWarehouse && destWarehouse && (
            <div className="flex justify-center -my-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-4 h-4 text-slate-400 rotate-90" />
              </div>
            </div>
          )}

          {/* Help Info */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Bilgi</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Transfer taslak olarak kaydedilir ve onay bekler.</span>
              </li>
              <li className="flex items-start gap-2">
                <TruckIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Onaylandıktan sonra sevkiyat başlatılabilir.</span>
              </li>
              <li className="flex items-start gap-2">
                <CubeIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Lokasyon seçimi opsiyoneldir, boş bırakılabilir.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
