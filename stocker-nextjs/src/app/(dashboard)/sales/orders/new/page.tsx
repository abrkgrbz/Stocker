'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { SalesOrderForm } from '@/components/sales/orders';
import { useCreateSalesOrder } from '@/lib/api/hooks/useSales';
import type { CreateSalesOrderCommand } from '@/lib/api/services/sales.service';

export default function NewSalesOrderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createOrder = useCreateSalesOrder();

  const handleSubmit = async (values: any) => {
    try {
      const orderData: CreateSalesOrderCommand = {
        orderDate: values.orderDate,
        customerId: values.customerId,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        currency: values.currency || 'TRY',
        shippingAddress: values.shippingAddress,
        billingAddress: values.billingAddress,
        notes: values.notes,
        salesPersonName: values.salesPersonName,
        deliveryDate: values.deliveryDate,
        discountRate: values.discountRate || 0,
        items: values.items.map((item: any, index: number) => ({
          lineNumber: index + 1,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit || 'Adet',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate || 18,
          description: item.description,
          discountRate: item.discountRate || 0,
        })),
      };
      await createOrder.mutateAsync(orderData);
      message.success('Sipariş başarıyla oluşturuldu');
      router.push('/sales/orders');
    } catch (error) {
      message.error('Sipariş oluşturulurken bir hata oluştu');
    }
  };

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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Sipariş
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni satış siparişi oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/sales/orders')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createOrder.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <SalesOrderForm
          form={form}
          onFinish={handleSubmit}
          loading={createOrder.isPending}
        />
      </div>
    </div>
  );
}
