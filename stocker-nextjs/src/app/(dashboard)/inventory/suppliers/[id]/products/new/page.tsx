'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Spin,
  Empty,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useSupplier, useProducts, useAddSupplierProduct } from '@/lib/api/hooks/useInventory';
import { CreateSupplierProductDto } from '@/lib/api/services/inventory.types';

export default function AddSupplierProductPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = Number(params.id);
  const [form] = Form.useForm();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data: supplier, isLoading: supplierLoading } = useSupplier(supplierId);
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const addProductMutation = useAddSupplierProduct();

  const products = productsData || [];

  // Filter out products that are already added to this supplier
  const existingProductIds = supplier?.products?.map((p: { productId: number }) => p.productId) || [];
  const availableProducts = products.filter((p: { id: number }) => !existingProductIds.includes(p.id));

  const handleSubmit = async (values: CreateSupplierProductDto) => {
    try {
      await addProductMutation.mutateAsync({
        ...values,
        supplierId,
      });
      message.success('Ürün tedarikçiye eklendi');
      router.push(`/inventory/suppliers/${supplierId}`);
    } catch {
      message.error('Ürün eklenirken hata oluştu');
    }
  };

  if (supplierLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Tedarikçi bulunamadı" />
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
              onClick={() => router.push(`/inventory/suppliers/${supplierId}`)}
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 m-0">Ürün Ekle</h1>
                <p className="text-sm text-slate-500 m-0">{supplier.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-6">Ürün Bilgileri</h3>

            {availableProducts.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Eklenecek ürün bulunamadı. Tüm ürünler zaten bu tedarikçiye eklenmiş."
              >
                <Button onClick={() => router.push(`/inventory/suppliers/${supplierId}`)}>
                  Tedarikçiye Dön
                </Button>
              </Empty>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  currency: 'TRY',
                  minOrderQuantity: 1,
                  leadTimeDays: 7,
                  isPreferred: false,
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="productId"
                    label="Ürün"
                    rules={[{ required: true, message: 'Ürün seçiniz' }]}
                    className="col-span-2"
                  >
                    <Select
                      showSearch
                      placeholder="Ürün seçiniz"
                      optionFilterProp="children"
                      onChange={(value) => setSelectedProductId(value)}
                      filterOption={(input, option) =>
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={availableProducts.map((p: { id: number; code: string; name: string }) => ({
                        value: p.id,
                        label: `${p.code} - ${p.name}`,
                      }))}
                      size="large"
                    />
                  </Form.Item>

                  {selectedProductId && (
                    <>
                      <Form.Item
                        name="supplierProductCode"
                        label="Tedarikçi Ürün Kodu"
                        tooltip="Tedarikçinin bu ürün için kullandığı kod"
                      >
                        <Input placeholder="Tedarikçi ürün kodu" size="large" />
                      </Form.Item>

                      <Form.Item
                        name="currency"
                        label="Para Birimi"
                        rules={[{ required: true, message: 'Para birimi seçiniz' }]}
                      >
                        <Select
                          size="large"
                          options={[
                            { value: 'TRY', label: '₺ TRY' },
                            { value: 'USD', label: '$ USD' },
                            { value: 'EUR', label: '€ EUR' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        name="unitPrice"
                        label="Birim Maliyet"
                        rules={[{ required: true, message: 'Birim maliyet giriniz' }]}
                      >
                        <InputNumber
                          className="w-full"
                          placeholder="0.00"
                          min={0}
                          precision={2}
                          size="large"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>

                      <Form.Item
                        name="minOrderQuantity"
                        label="Minimum Sipariş Miktarı"
                        rules={[{ required: true, message: 'Minimum sipariş miktarı giriniz' }]}
                      >
                        <InputNumber
                          className="w-full"
                          placeholder="1"
                          min={1}
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        name="leadTimeDays"
                        label="Teslim Süresi (Gün)"
                        rules={[{ required: true, message: 'Teslim süresi giriniz' }]}
                      >
                        <InputNumber
                          className="w-full"
                          placeholder="7"
                          min={0}
                          size="large"
                          addonAfter="gün"
                        />
                      </Form.Item>

                      <Form.Item
                        name="isPreferred"
                        label="Tercih Edilen Tedarikçi"
                        valuePropName="checked"
                        tooltip="Bu tedarikçi bu ürün için tercih edilen tedarikçi mi?"
                      >
                        <Switch />
                      </Form.Item>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                  <Button onClick={() => router.push(`/inventory/suppliers/${supplierId}`)}>
                    İptal
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={addProductMutation.isPending}
                    disabled={!selectedProductId}
                    icon={<PlusIcon className="w-4 h-4" />}
                  >
                    Ürün Ekle
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          {/* Supplier Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Tedarikçi</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingStorefrontIcon className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{supplier.name}</div>
                <div className="text-sm text-slate-500">{supplier.code}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Mevcut Ürün Sayısı</span>
                <span className="font-medium text-slate-900">{supplier.productCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Selected Product Info */}
          {selectedProductId && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Seçilen Ürün</h3>
              {(() => {
                const selectedProduct = products.find((p: { id: number }) => p.id === selectedProductId);
                if (!selectedProduct) return null;
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <CubeIcon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{selectedProduct.name}</div>
                      <div className="text-sm text-slate-500">{selectedProduct.code}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Help */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Bilgi</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Tedarikçi ürün kodu, tedarikçinin kendi sistemindeki ürün kodudur.</li>
              <li>• Birim maliyet, bu tedarikçiden alım yapılırken kullanılır.</li>
              <li>• Tercih edilen tedarikçi işareti, satın alma önerilerinde öncelik verir.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
