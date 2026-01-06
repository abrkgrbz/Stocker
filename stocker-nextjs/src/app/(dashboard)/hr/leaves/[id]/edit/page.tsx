'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Empty, Button } from 'antd';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { Badge } from '@/components/primitives';
import { LeaveForm } from '@/components/hr';
import { useLeave, useUpdateLeave } from '@/lib/api/hooks/useHR';
import type { UpdateLeaveDto } from '@/lib/api/services/hr.types';
import { LeaveStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const statusConfig: Record<number, { variant: 'success' | 'error' | 'warning' | 'info' | 'neutral'; label: string }> = {
  [LeaveStatus.Pending]: { variant: 'warning', label: 'Beklemede' },
  [LeaveStatus.Approved]: { variant: 'success', label: 'Onaylandı' },
  [LeaveStatus.Rejected]: { variant: 'error', label: 'Reddedildi' },
  [LeaveStatus.Cancelled]: { variant: 'neutral', label: 'İptal Edildi' },
  [LeaveStatus.Taken]: { variant: 'info', label: 'Kullanıldı' },
  [LeaveStatus.PartiallyTaken]: { variant: 'info', label: 'Kısmen Kullanıldı' },
};

export default function EditLeavePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: leave, isLoading, error } = useLeave(id);
  const updateLeave = useUpdateLeave();

  // Populate form when leave data loads
  useEffect(() => {
    if (leave) {
      form.setFieldsValue({
        employeeId: leave.employeeId,
        leaveTypeId: leave.leaveTypeId,
        dateRange: [
          leave.startDate ? dayjs(leave.startDate) : null,
          leave.endDate ? dayjs(leave.endDate) : null,
        ],
        reason: leave.reason,
        contactDuringLeave: leave.contactDuringLeave,
        handoverNotes: leave.handoverNotes,
        substituteEmployeeId: leave.substituteEmployeeId,
        isHalfDay: leave.isHalfDay,
        isHalfDayMorning: leave.isHalfDayMorning,
      });
    }
  }, [leave, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateLeaveDto = {
        leaveTypeId: values.leaveTypeId,
        startDate: values.dateRange[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange[1]?.format('YYYY-MM-DD'),
        isHalfDay: values.isHalfDay ?? false,
        isHalfDayMorning: values.isHalfDayMorning ?? false,
        reason: values.reason,
        contactDuringLeave: values.contactDuringLeave,
        handoverNotes: values.handoverNotes,
        substituteEmployeeId: values.substituteEmployeeId,
      };

      await updateLeave.mutateAsync({ id, data });
      router.push(`/hr/leaves/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Check if leave can be edited
  if (!isLoading && leave && leave.status !== LeaveStatus.Pending) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md text-center">
          <Empty description="Bu izin talebi düzenlenemez. Sadece bekleyen talepler düzenlenebilir." />
          <Button
            onClick={() => router.push(`/hr/leaves/${id}`)}
            className="mt-4"
          >
            Detaya Dön
          </Button>
        </div>
      </div>
    );
  }

  const status = leave ? statusConfig[leave.status] || { variant: 'neutral' as const, label: '-' } : null;

  return (
    <FormPageLayout
      title="İzin Talebi Düzenle"
      subtitle={leave ? `${leave.employeeName || `Çalışan #${leave.employeeId}`} - İzin bilgilerini güncelleyin` : 'İzin bilgilerini güncelleyin'}
      icon={<CalendarIcon className="w-5 h-5" />}
      cancelPath={`/hr/leaves/${id}`}
      loading={updateLeave.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !leave)}
      errorMessage="İzin Talebi Bulunamadı"
      errorDescription="İstenen izin talebi bulunamadı veya bir hata oluştu."
      maxWidth="max-w-5xl"
      titleExtra={
        status && (
          <Badge variant={status.variant}>{status.label}</Badge>
        )
      }
    >
      <LeaveForm
        form={form}
        initialValues={leave}
        onFinish={handleSubmit}
        loading={updateLeave.isPending}
      />
    </FormPageLayout>
  );
}
