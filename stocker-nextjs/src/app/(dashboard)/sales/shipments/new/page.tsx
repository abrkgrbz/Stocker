'use client';

/**
 * New Shipment Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { ShipmentForm } from '@/components/sales/shipments';
import { useCreateShipment, useSalesOrders } from '@/lib/api/hooks/useSales';
import type { CreateShipmentCommand } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

export default function NewShipmentPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createShipment = useCreateShipment();

  // Fetch orders for dropdown
  const { data: ordersData } = useSalesOrders({ pageSize: 1000 });
  const orders = ordersData?.items || [];

  const handleSubmit = async (values: any) => {
    try {
      // Transform form values to match API
      const command: CreateShipmentCommand = {
        salesOrderId: values.salesOrderId,
        shipmentType: values.shipmentType,
        priority: values.priority,
        warehouseId: values.warehouseId || undefined,
        shippingAddressLine1: values.shippingAddressLine1,
        shippingAddressLine2: values.shippingAddressLine2 || undefined,
        shippingCity: values.shippingCity,
        shippingState: values.shippingState || undefined,
        shippingPostalCode: values.shippingPostalCode || undefined,
        shippingCountry: values.shippingCountry,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone || undefined,
        recipientEmail: values.recipientEmail || undefined,
        carrierId: values.carrierId || undefined,
        carrierName: values.carrierName || undefined,
        estimatedShipDate: values.estimatedShipDate
          ? dayjs(values.estimatedShipDate).toISOString()
          : undefined,
        estimatedDeliveryDate: values.estimatedDeliveryDate
          ? dayjs(values.estimatedDeliveryDate).toISOString()
          : undefined,
        requiresSignature: values.requiresSignature || false,
        deliveryInstructions: values.deliveryInstructions || undefined,
        internalNotes: values.internalNotes || undefined,
      };

      await createShipment.mutateAsync(command);
      router.push('/sales/shipments');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Sevkiyat"
      subtitle="Yeni sevkiyat oluşturun"
      cancelPath="/sales/shipments"
      loading={createShipment.isPending}
      onSave={() => form.submit()}
    >
      <ShipmentForm
        form={form}
        onFinish={handleSubmit}
        loading={createShipment.isPending}
        orders={orders}
        carriers={[]} // TODO: Add carriers when available
        warehouses={[]} // TODO: Add warehouses when available
      />
    </CrmFormPageLayout>
  );
}
