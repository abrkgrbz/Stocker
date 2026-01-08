'use client';

import React, { useEffect } from 'react';
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
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useSupplier, useUpdateSupplierProduct } from '@/lib/api/hooks/useInventory';
import { UpdateSupplierProductDto } from '@/lib/api/services/inventory.types';

export default function EditSupplierProductPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id as string;
  const productId = params.productId as string;
  const [form] = Form.useForm();

  const { data: supplier, isLoading: supplierLoading } = useSupplier(Number(supplierId));
  const updateProductMutation = useUpdateSupplierProduct();

  // Find the supplier product
  const supplierProduct = supplier?.products?.find(p => String(p.id) === productId);

  // Set form values when data is loaded
  useEffect(() => {
    if (supplierProduct) {
      form.setFieldsValue({
        supplierProductCode: supplierProduct.supplierProductCode,
        supplierProductName: supplierProduct.supplierProductName,
        unitPrice: supplierProduct.unitPrice,
        currency: supplierProduct.currency || 'TRY',
        minOrderQuantity: supplierProduct.minOrderQuantity || 1,
        leadTimeDays: supplierProduct.leadTimeDays || 0,
        isPreferred: supplierProduct.isPreferred,
        notes: supplierProduct.notes,
      });
    }
  }, [supplierProduct, form]);

  const handleSubmit = async (values: UpdateSupplierProductDto) => {
    try {
      await updateProductMutation.mutateAsync({
        supplierId,
        productId,
        data: values,
      });
      message.success('Ürün bilgileri güncellendi');
      router.push(`/inventory/suppliers/${supplierId}`);
    } catch {
      message.error('Ürün güncellenirken hata oluştu');
    }
  };

  if (supplierLoading) {
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

  if (!supplierProduct) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Ürün bulunamadı" />
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
                <PencilSquareIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 m-0">Ürün Düzenle</h1>
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

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="supplierProductCode"
                  label="Tedarikçi Ürün Kodu"
                  tooltip="Tedarikçinin bu ürün için kullandığı kod"
                >
                  <Input placeholder="Tedarikçi ürün kodu" size="large" />
                </Form.Item>

                <Form.Item
                  name="supplierProductName"
                  label="Tedarikçi Ürün Adı"
                  tooltip="Tedarikçinin bu ürün için kullandığı ad"
                >
                  <Input placeholder="Tedarikçi ürün adı" size="large" />
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
                  label="Birim Fiyat"
                  rules={[{ required: true, message: 'Birim fiyat giriniz' }]}
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

                <Form.Item
                  name="notes"
                  label="Notlar"
                  className="col-span-2"
                >
                  <Input.TextArea
                    placeholder="Ürün hakkında notlar..."
                    rows={3}
                    size="large"
                  />
                </Form.Item>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                <Button onClick={() => router.push(`/inventory/suppliers/${supplierId}`)}>
                  İptal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateProductMutation.isPending}
                  icon={<PencilSquareIcon className="w-4 h-4" />}
                >
                  Kaydet
                </Button>
              </div>
            </Form>
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
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Ürün</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{supplierProduct.productName}</div>
                <div className="text-sm text-slate-500">{supplierProduct.productCode}</div>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Bilgi</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Tedarikçi ürün kodu, tedarikçinin kendi sistemindeki ürün kodudur.</li>
              <li>• Birim fiyat, bu tedarikçiden alım yapılırken kullanılır.</li>
              <li>• Tercih edilen tedarikçi işareti, satın alma önerilerinde öncelik verir.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
