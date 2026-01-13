'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Alert, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { MaterialReservationForm } from '@/components/manufacturing/material-reservations';
import { useMaterialReservation, useUpdateMaterialReservation } from '@/lib/api/hooks/useManufacturing';
import type { UpdateMaterialReservationRequest, ReservationStatus } from '@/lib/api/services/manufacturing.types';

const statusLabels: Record<ReservationStatus, string> = {
  Pending: 'Bekliyor',
  Approved: 'Onaylı',
  Allocated: 'Ayrıldı',
  Issued: 'Çıkış Yapıldı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

export default function EditMaterialReservationPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;
  const [form] = Form.useForm();

  const { data: reservation, isLoading, error } = useMaterialReservation(reservationId);
  const updateReservation = useUpdateMaterialReservation();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      await updateReservation.mutateAsync({ id: reservationId, data: values as unknown as UpdateMaterialReservationRequest });
      router.push(`/manufacturing/material-reservations/${reservationId}`);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="p-8">
        <Alert
          message="Rezervasyon Bulunamadı"
          description="İstenen malzeme rezervasyonu bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/material-reservations')}>
              Rezervasyonlara Dön
            </Button>
          }
        />
      </div>
    );
  }

  // Can only edit pending reservations
  if (reservation.status !== 'Pending') {
    return (
      <div className="p-8">
        <Alert
          message="Düzenleme Yapılamaz"
          description="Sadece bekleyen rezervasyonlar düzenlenebilir."
          type="warning"
          showIcon
          action={
            <Button onClick={() => router.push(`/manufacturing/material-reservations/${reservationId}`)}>
              Rezervasyon Detayına Dön
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
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
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {reservation.reservationNumber}
                  </h1>
                  <Tag color="default" className="ml-2">
                    {statusLabels[reservation.status]}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">{reservation.productName}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/manufacturing/material-reservations/${reservationId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateReservation.isPending}
              onClick={() => form.submit()}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <MaterialReservationForm
          form={form}
          initialValues={reservation}
          onFinish={handleSubmit}
          loading={updateReservation.isPending}
          isEdit
        />
      </div>
    </div>
  );
}
