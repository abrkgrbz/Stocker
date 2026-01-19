'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  InputNumber,
  Typography,
  message,
  AutoComplete,
  Alert,
  Radio,
} from 'antd';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  ArrowUpIcon,
  CheckIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {
  useWarehouses,
  useLocations,
  useProducts,
  useStock,
  useCreateInventoryAdjustment,
  useSubmitInventoryAdjustment,
} from '@/lib/api/hooks/useInventory';
import {
  AdjustmentReason,
  AdjustmentType,
  type CreateInventoryAdjustmentDto,
  type CreateInventoryAdjustmentItemDto,
} from '@/lib/api/services/inventory.types';

const { Text } = Typography;
const { TextArea } = Input;

const adjustmentReasons: { value: AdjustmentReason; label: string }[] = [
  { value: AdjustmentReason.StockCountVariance, label: 'Sayım Farkı' },
  { value: AdjustmentReason.Damage, label: 'Hasar' },
  { value: AdjustmentReason.Theft, label: 'Kayıp/Çalıntı' },
  { value: AdjustmentReason.Expired, label: 'Son Kullanma Tarihi' },
  { value: AdjustmentReason.QualityRejection, label: 'Kalite Sorunu' },
  { value: AdjustmentReason.SystemCorrection, label: 'Sistem Hatası' },
  { value: AdjustmentReason.Loss, label: 'Kayıp' },
  { value: AdjustmentReason.CustomerReturn, label: 'Müşteri İadesi' },
  { value: AdjustmentReason.SupplierReturn, label: 'Tedarikçi İadesi' },
  { value: AdjustmentReason.ProductionScrap, label: 'Üretim Firesil' },
];

export default function NewStockAdjustmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('productId');
  const preselectedWarehouseId = searchParams.get('warehouseId');

  const [form] = Form.useForm();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(
    preselectedWarehouseId ? Number(preselectedWarehouseId) : undefined
  );
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [submitAction, setSubmitAction] = useState<'draft' | 'submit'>('submit');

  const { data: warehouses = [] } = useWarehouses();
  const { data: locations = [] } = useLocations(selectedWarehouse);
  const { data: products = [] } = useProducts();
  const { data: currentStock, refetch: refetchStock } = useStock(
    selectedWarehouse,
    selectedProduct?.id
  );
  const createAdjustment = useCreateInventoryAdjustment();
  const submitAdjustment = useSubmitInventoryAdjustment();

  const currentQuantity = currentStock?.[0]?.quantity || 0;
  const difference = newQuantity - currentQuantity;

  useEffect(() => {
    if (preselectedProductId) {
      const product = products.find((p) => p.id === Number(preselectedProductId));
      if (product) {
        setSelectedProduct({ id: product.id, name: product.name, code: product.code });
        form.setFieldsValue({ productId: product.id });
      }
    }
  }, [preselectedProductId, products, form]);

  const handleProductSelect = (value: string) => {
    const productId = Number(value);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct({ id: product.id, name: product.name, code: product.code });
      form.setFieldsValue({ productId: product.id });
    }
  };

  const handleWarehouseChange = (value: number) => {
    setSelectedWarehouse(value);
    form.setFieldsValue({ locationId: undefined });
    if (selectedProduct) {
      refetchStock();
    }
  };

  useEffect(() => {
    if (currentStock?.[0]) {
      setNewQuantity(currentStock[0].quantity);
    }
  }, [currentStock]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedProduct) {
        message.error('Lütfen bir ürün seçin');
        return;
      }

      if (newQuantity === currentQuantity) {
        message.warning('Yeni miktar mevcut stok ile aynı');
        return;
      }

      // Determine adjustment type based on difference (backend expects string like "Increase", "Decrease")
      const adjustmentTypeString = difference > 0 ? 'Increase' : 'Decrease';

      // Convert reason enum to string (backend expects string like "StockCountVariance", "Damage")
      const reasonEnumMap: Record<number, string> = {
        [AdjustmentReason.StockCountVariance]: 'StockCountVariance',
        [AdjustmentReason.Damage]: 'Damage',
        [AdjustmentReason.Loss]: 'Loss',
        [AdjustmentReason.Theft]: 'Theft',
        [AdjustmentReason.ProductionScrap]: 'ProductionScrap',
        [AdjustmentReason.Expired]: 'Expired',
        [AdjustmentReason.QualityRejection]: 'QualityRejection',
        [AdjustmentReason.CustomerReturn]: 'CustomerReturn',
        [AdjustmentReason.SupplierReturn]: 'SupplierReturn',
        [AdjustmentReason.SystemCorrection]: 'SystemCorrection',
        [AdjustmentReason.OpeningStock]: 'OpeningStock',
        [AdjustmentReason.Other]: 'Other',
      };
      const reasonString = typeof values.reason === 'number'
        ? reasonEnumMap[values.reason] || 'Other'
        : values.reason;

      // Create adjustment item
      const item: CreateInventoryAdjustmentItemDto = {
        productId: selectedProduct.id,
        systemQuantity: currentQuantity,
        actualQuantity: newQuantity,
        unitCost: 0, // Will be calculated by backend
        reasonCode: reasonString,
        notes: values.notes,
      };

      // Create adjustment DTO
      const data: CreateInventoryAdjustmentDto = {
        warehouseId: Number(values.warehouseId),
        locationId: values.locationId ? Number(values.locationId) : undefined,
        adjustmentType: adjustmentTypeString,
        reason: reasonString,
        description: values.notes,
        items: [item],
      };

      // Debug: Log the data being sent
      console.log('📤 Creating adjustment with data:', JSON.stringify(data, null, 2));

      // Create the adjustment (starts as Draft)
      const created = await createAdjustment.mutateAsync(data);

      // If user selected to submit for approval, do it now
      if (submitAction === 'submit' && created.id) {
        await submitAdjustment.mutateAsync(created.id);
        message.success('Stok düzeltme oluşturuldu ve onaya gönderildi');
      } else {
        message.success('Stok düzeltme taslak olarak kaydedildi');
      }

      router.push('/inventory/stock-adjustments');
    } catch (error) {
      console.error('Error creating adjustment:', error);
      message.error('Stok düzeltme oluşturulurken bir hata oluştu');
    }
  };

  const isLoading = createAdjustment.isPending || submitAdjustment.isPending;

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">Stok Düzeltme</h1>
              <p className="text-sm text-gray-400 m-0">Manuel stok düzeltmesi yapın</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/stock-adjustments')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={
                submitAction === 'submit' ? (
                  <PaperAirplaneIcon className="w-4 h-4" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )
              }
              loading={isLoading}
              onClick={handleSubmit}
              disabled={!selectedProduct || difference === 0}
              style={{ background: '#1a1a1a', borderColor: '#1a1a1a', color: 'white' }}
            >
              {submitAction === 'submit' ? 'Onaya Gönder' : 'Taslak Kaydet'}
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Product & Location */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Selection */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center">
                  <ShoppingBagIcon className="w-4 h-4 mr-2" /> Ürün Seçimi
                </h3>
                <Form.Item
                  name="productId"
                  rules={[{ required: true, message: 'Ürün seçiniz' }]}
                  className="mb-2"
                >
                  <AutoComplete
                    placeholder="Ürün kodu veya adı ile arayın..."
                    size="large"
                    value={selectedProduct?.name || ''}
                    options={products.map((p) => ({
                      value: String(p.id),
                      label: (
                        <div className="flex items-center justify-between py-1">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-gray-400">({p.code})</span>
                        </div>
                      ),
                    }))}
                    onSelect={handleProductSelect}
                    filterOption={(inputValue, option) =>
                      products
                        .find((p) => String(p.id) === option?.value)
                        ?.name?.toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                      products
                        .find((p) => String(p.id) === option?.value)
                        ?.code?.toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                      false
                    }
                  />
                </Form.Item>
                {selectedProduct && (
                  <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl mt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                        <ShoppingBagIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedProduct.name}</div>
                        <div className="text-sm text-gray-500">Kod: {selectedProduct.code}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2" /> Depo & Lokasyon
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Depo <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name="warehouseId"
                      rules={[{ required: true, message: 'Depo seçiniz' }]}
                      className="mb-0"
                      initialValue={preselectedWarehouseId ? Number(preselectedWarehouseId) : undefined}
                    >
                      <Select
                        placeholder="Depo seçin"
                        options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                        onChange={handleWarehouseChange}
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Lokasyon</label>
                    <Form.Item name="locationId" className="mb-0">
                      <Select
                        placeholder="Lokasyon seçin (opsiyonel)"
                        allowClear
                        options={locations.map((l) => ({ value: l.id, label: l.code }))}
                        disabled={!selectedWarehouse}
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Adjustment Details */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Düzeltme Detayları
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Düzeltme Nedeni <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name="reason"
                      rules={[{ required: true, message: 'Neden seçiniz' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="Neden seçin"
                        options={adjustmentReasons}
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
                    <Form.Item name="notes" className="mb-0">
                      <TextArea
                        rows={3}
                        placeholder="Düzeltme açıklaması..."
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Submit Action Selection */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Kayıt İşlemi
                </h3>
                <Radio.Group
                  value={submitAction}
                  onChange={(e) => setSubmitAction(e.target.value)}
                  className="w-full"
                >
                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        submitAction === 'submit'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSubmitAction('submit')}
                    >
                      <Radio value="submit" className="w-full">
                        <div className="ml-2">
                          <div className="font-medium text-gray-900">Onaya Gönder</div>
                          <div className="text-sm text-gray-500">
                            Düzeltme kaydedilecek ve onay için yetkili kişiye gönderilecek
                          </div>
                        </div>
                      </Radio>
                    </div>
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        submitAction === 'draft'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSubmitAction('draft')}
                    >
                      <Radio value="draft" className="w-full">
                        <div className="ml-2">
                          <div className="font-medium text-gray-900">Taslak Olarak Kaydet</div>
                          <div className="text-sm text-gray-500">
                            Düzeltme taslak olarak kaydedilecek, daha sonra düzenleyip onaya
                            gönderebilirsiniz
                          </div>
                        </div>
                      </Radio>
                    </div>
                  </div>
                </Radio.Group>
              </div>
            </div>

            {/* Right Panel - Quantity */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Stok Miktarı
                </h3>
                {selectedProduct && selectedWarehouse ? (
                  <>
                    <div className="text-center mb-6">
                      <Text type="secondary" className="text-xs block mb-1">
                        Mevcut Stok
                      </Text>
                      <div className="text-4xl font-bold text-gray-900">{currentQuantity}</div>
                    </div>

                    <div className="h-px bg-slate-100 my-4" />

                    <div className="mb-4">
                      <Text className="block text-sm font-medium text-slate-600 mb-2">
                        Yeni Miktar:
                      </Text>
                      <InputNumber
                        value={newQuantity}
                        onChange={(val) => setNewQuantity(val || 0)}
                        min={0}
                        style={{ width: '100%' }}
                        size="large"
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </div>

                    <div className="flex justify-center gap-2 mb-4">
                      <Button size="small" onClick={() => setNewQuantity(Math.max(0, newQuantity - 10))}>
                        -10
                      </Button>
                      <Button size="small" onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}>
                        -1
                      </Button>
                      <Button size="small" onClick={() => setNewQuantity(newQuantity + 1)}>
                        +1
                      </Button>
                      <Button size="small" onClick={() => setNewQuantity(newQuantity + 10)}>
                        +10
                      </Button>
                    </div>

                    <div className="h-px bg-slate-100 my-4" />

                    <div className="text-center">
                      <Text type="secondary" className="block text-xs mb-2">
                        Fark
                      </Text>
                      <div
                        className="text-3xl font-bold flex items-center justify-center gap-2"
                        style={{
                          color:
                            difference > 0
                              ? '#10b981'
                              : difference < 0
                                ? '#ef4444'
                                : '#6b7280',
                        }}
                      >
                        {difference > 0 ? (
                          <ArrowUpIcon className="w-5 h-5" />
                        ) : difference < 0 ? (
                          <ArrowDownIcon className="w-5 h-5" />
                        ) : (
                          <ArrowsRightLeftIcon className="w-5 h-5" />
                        )}
                        {difference > 0 ? '+' : ''}
                        {difference}
                      </div>
                    </div>

                    {difference !== 0 && (
                      <Alert
                        className="mt-4"
                        message={
                          difference > 0
                            ? `Stok ${difference} adet artırılacak`
                            : `Stok ${Math.abs(difference)} adet azaltılacak`
                        }
                        type={difference > 0 ? 'success' : 'warning'}
                        showIcon
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Text type="secondary">Stok bilgilerini görmek için ürün ve depo seçin</Text>
                  </div>
                )}
              </div>

              <Alert
                message="Onay Akışı"
                description={
                  submitAction === 'submit'
                    ? 'Düzeltme onaylandıktan sonra stok otomatik olarak güncellenecektir.'
                    : 'Taslak olarak kaydedilen düzeltmeler daha sonra onaya gönderilebilir.'
                }
                type="info"
                showIcon
              />
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
