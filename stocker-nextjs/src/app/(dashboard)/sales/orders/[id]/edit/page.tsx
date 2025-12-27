'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, message, Spin, Typography } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { SalesOrderForm } from '@/components/sales/orders';
import { useSalesOrder, useUpdateSalesOrder } from '@/lib/api/hooks/useSales';
import type { UpdateSalesOrderCommand } from '@/lib/api/services/sales.service';

const { Text } = Typography;

export default function EditSalesOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: order, isLoading } = useSalesOrder(id);
  const updateOrder = useUpdateSalesOrder();

  const handleSubmit = async (values: any) => {
    try {
      const updateData: Omit<UpdateSalesOrderCommand, 'id'> = {
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        currency: values.currency,
        shippingAddress: values.shippingAddress,
        billingAddress: values.billingAddress,
        notes: values.notes,
        salesPersonName: values.salesPersonName,
        deliveryDate: values.deliveryDate,
        discountRate: values.discountRate || 0,
      };
      await updateOrder.mutateAsync({ id, data: updateData });
      message.success('Sipariş başarıyla güncellendi');
      router.push(`/sales/orders/${id}`);
    } catch (error) {
      message.error('Sipariş güncellenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Text type="secondary">Sipariş bulunamadı</Text>
      </div>
    );
  }

  // Only Draft orders can be edited
  if (order.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-white">
        <div
          className="sticky top-0 z-50 px-8 py-4"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="flex items-center gap-4 max-w-7xl mx-auto">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Sipariş Düzenlenemez
              </h1>
              <p className="text-sm text-gray-400 m-0">
                Sadece taslak siparişler düzenlenebilir
              </p>
            </div>
          </div>
        </div>
        <div className="px-8 py-16 max-w-7xl mx-auto text-center">
          <Text type="secondary" className="text-lg">
            Bu sipariş &quot;{order.status}&quot; durumunda olduğu için düzenlenemez.
          </Text>
          <div className="mt-6">
            <Button type="primary" onClick={() => router.push(`/sales/orders/${id}`)}>
              Siparişi Görüntüle
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Sipariş Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{order.orderNumber}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/sales/orders/${id}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateOrder.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <SalesOrderForm
          form={form}
          initialValues={order}
          onFinish={handleSubmit}
          loading={updateOrder.isPending}
        />
      </div>
    </div>
  );
}
