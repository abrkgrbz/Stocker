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
  Spin,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  BuildingOffice2Icon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
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
  { value: TransferType.Standard, label: 'Standart' },
  { value: TransferType.Urgent, label: 'Acil' },
  { value: TransferType.Replenishment, label: 'İkmal' },
  { value: TransferType.Return, label: 'İade' },
  { value: TransferType.Internal, label: 'Dahili' },
  { value: TransferType.CrossDock, label: 'Cross-Dock' },
  { value: TransferType.Consolidation, label: 'Konsolidasyon' },
];

export default function NewStockTransferPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<TransferItem[]>([]);
  const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState<number | null>(null);
  const [selectedDestWarehouse, setSelectedDestWarehouse] = useState<number | null>(null);

  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();
  const { data: sourceLocations = [] } = useLocations(selectedSourceWarehouse || undefined);
  const { data: destLocations = [] } = useLocations(selectedDestWarehouse || undefined);
  const { data: products = [], isLoading: productsLoading } = useProducts();
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
        createdByUserId: 0,
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
  const warehousesSelected = selectedSourceWarehouse && selectedDestWarehouse;

  if (warehousesLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

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
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni Stok Transferi</h1>
                <p className="text-sm text-slate-500 m-0">Depolar arası stok hareketi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6">Transfer Bilgileri</h3>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                transferDate: dayjs(),
                transferType: TransferType.Standard,
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Depo seçimi - Her zaman görünür */}
                <Form.Item
                  name="sourceWarehouseId"
                  label="Kaynak Depo"
                  rules={[{ required: true, message: 'Kaynak depo seçiniz' }]}
                >
                  <Select
                    showSearch
                    placeholder="Kaynak depo seçiniz"
                    optionFilterProp="children"
                    onChange={(value) => {
                      setSelectedSourceWarehouse(value);
                      setItems(items.map(item => ({ ...item, sourceLocationId: undefined })));
                    }}
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                    size="large"
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
                    showSearch
                    placeholder="Hedef depo seçiniz"
                    optionFilterProp="children"
                    onChange={(value) => {
                      setSelectedDestWarehouse(value);
                      setItems(items.map(item => ({ ...item, destinationLocationId: undefined })));
                    }}
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                    size="large"
                  />
                </Form.Item>

                {/* Diğer alanlar - Depolar seçildikten sonra görünür */}
                {warehousesSelected && (
                  <>
                    <Form.Item
                      name="transferNumber"
                      label="Transfer Numarası"
                      rules={[{ required: true, message: 'Transfer numarası gerekli' }]}
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
                        options={transferTypeOptions}
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

                    {/* Transfer Kalemleri */}
                    <div className="col-span-2 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-medium text-slate-700">Transfer Kalemleri</label>
                        <Button
                          type="dashed"
                          size="small"
                          icon={<PlusIcon className="w-3 h-3" />}
                          onClick={handleAddItem}
                        >
                          Ürün Ekle
                        </Button>
                      </div>

                      {items.length === 0 ? (
                        <div
                          className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all"
                          onClick={handleAddItem}
                        >
                          <CubeIcon className="w-8 h-8 text-gray-300 mb-2 mx-auto" />
                          <p className="text-gray-500 text-sm">Transfer edilecek ürünleri ekleyin</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {items.map((item, index) => (
                            <div
                              key={item.key}
                              className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm font-medium text-slate-700">
                                    {item.productName || 'Ürün seçiniz'}
                                  </span>
                                </div>
                                <Button
                                  type="text"
                                  size="small"
                                  danger
                                  icon={<TrashIcon className="w-4 h-4" />}
                                  onClick={() => handleRemoveItem(item.key)}
                                />
                              </div>

                              <div className="grid grid-cols-4 gap-3">
                                <div className="col-span-2">
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
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    placeholder="Miktar"
                                    value={item.requestedQuantity}
                                    onChange={(val) => handleItemChange(item.key, 'requestedQuantity', val || 1)}
                                    size="small"
                                  />
                                </div>

                                <div>
                                  <Select
                                    style={{ width: '100%' }}
                                    placeholder="Kaynak Lok."
                                    value={item.sourceLocationId}
                                    onChange={(val) => handleItemChange(item.key, 'sourceLocationId', val)}
                                    allowClear
                                    options={sourceLocations.map((l) => ({
                                      value: l.id,
                                      label: l.code,
                                    }))}
                                    size="small"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                <Button onClick={() => router.push('/inventory/stock-transfers')}>
                  İptal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createTransfer.isPending}
                  disabled={!warehousesSelected || items.length === 0}
                  icon={<PlusIcon className="w-4 h-4" />}
                >
                  Transfer Oluştur
                </Button>
              </div>
            </Form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          {/* Kaynak Depo */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Kaynak Depo</h3>
            {sourceWarehouse ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                  <BuildingOffice2Icon className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{sourceWarehouse.name}</div>
                  <div className="text-sm text-slate-500">{sourceWarehouse.code}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Depo seçilmedi</div>
            )}
          </div>

          {/* Hedef Depo */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Hedef Depo</h3>
            {destWarehouse ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                  <BuildingOffice2Icon className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{destWarehouse.name}</div>
                  <div className="text-sm text-slate-500">{destWarehouse.code}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Depo seçilmedi</div>
            )}
          </div>

          {/* Transfer Özeti */}
          {warehousesSelected && items.length > 0 && (
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
          )}

          {/* Bilgi */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Bilgi</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Önce kaynak ve hedef depoları seçin.</li>
              <li>• Transfer taslak olarak kaydedilir.</li>
              <li>• Onaylandıktan sonra sevkiyat başlatılabilir.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
