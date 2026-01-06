'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useOvertime,
  useApproveOvertime,
  useRejectOvertime,
} from '@/lib/api/hooks/useHR';
import { DetailPageLayout } from '@/components/patterns';
import dayjs from 'dayjs';

// Status options
const statusOptions: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Pending: { label: 'Beklemede', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  Approved: { label: 'Onaylandi', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  Rejected: { label: 'Reddedildi', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  Completed: { label: 'Tamamlandi', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  Cancelled: { label: 'Iptal Edildi', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
};

// Overtime type options
const overtimeTypeLabels: Record<string, string> = {
  Regular: 'Normal Mesai',
  Weekend: 'Hafta Sonu',
  Holiday: 'Tatil Gunu',
  Night: 'Gece Mesaisi',
  Emergency: 'Acil Durum',
  Project: 'Proje Bazli',
};

// Helper components
function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-medium text-slate-500 mb-1">{label}</dt>
      <dd className="text-sm text-slate-900">{value || '-'}</dd>
    </div>
  );
}

function DateItem({ label, date, format = 'DD.MM.YYYY' }: { label: string; date?: string; format?: string }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-medium text-slate-500 mb-1">{label}</dt>
      <dd className="text-sm text-slate-900">
        {date ? dayjs(date).format(format) : '-'}
      </dd>
    </div>
  );
}

export default function OvertimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: overtime, isLoading, isError } = useOvertime(id);
  const approveOvertime = useApproveOvertime();
  const rejectOvertime = useRejectOvertime();

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const formatCurrency = (value?: number, currency?: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    }).format(value);
  };

  const statusInfo = overtime ? (statusOptions[overtime.status] || { label: overtime.status, bgColor: 'bg-slate-100', textColor: 'text-slate-700' }) : { label: '-', bgColor: 'bg-slate-100', textColor: 'text-slate-700' };

  return (
    <DetailPageLayout
      title="Fazla Mesai Detayi"
      subtitle={overtime ? `${overtime.employeeName} - ${dayjs(overtime.date).format('DD.MM.YYYY')}` : undefined}
      backPath="/hr/overtimes"
      icon={<ClockIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-amber-600"
      statusBadge={
        overtime && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
              {statusInfo.label}
            </span>
            {overtime.isEmergency && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                <ExclamationTriangleIcon className="w-3 h-3" />
                Acil
              </span>
            )}
          </div>
        )
      }
      isLoading={isLoading}
      isError={isError || !overtime}
      errorMessage="Mesai Kaydi Bulunamadi"
      errorDescription="Istenen mesai kaydi bulunamadi veya bir hata olustu."
      actions={
        overtime && (
          <>
            {overtime.status === 'Pending' && (
              <>
                <button
                  onClick={() => approveOvertime.mutateAsync({ id })}
                  disabled={approveOvertime.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  {approveOvertime.isPending ? 'Onaylaniyor...' : 'Onayla'}
                </button>
                <button
                  onClick={() => rejectOvertime.mutateAsync({ id, reason: 'Talep reddedildi' })}
                  disabled={rejectOvertime.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <XCircleIcon className="w-4 h-4" />
                  {rejectOvertime.isPending ? 'Reddediliyor...' : 'Reddet'}
                </button>
              </>
            )}
            <Link
              href={`/hr/overtimes/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Duzenle
            </Link>
          </>
        )
      }
    >
      {overtime && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mesai Bilgileri */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Mesai Bilgileri</h2>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InfoItem label="Calisan" value={overtime.employeeName} />
                <InfoItem
                  label="Mesai Tipi"
                  value={
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {overtimeTypeLabels[overtime.overtimeType] || overtime.overtimeType}
                    </span>
                  }
                />
                <DateItem label="Tarih" date={overtime.date} />
                <InfoItem
                  label="Saat Araligi"
                  value={`${formatTime(overtime.startTime)} - ${formatTime(overtime.endTime)}`}
                />
                <InfoItem label="Planlanan Saat" value={`${overtime.plannedHours} saat`} />
                <InfoItem
                  label="Gerceklesen Saat"
                  value={overtime.actualHours ? `${overtime.actualHours} saat` : '-'}
                />
                <InfoItem label="Mola" value={`${overtime.breakMinutes} dakika`} />
                <InfoItem label="Odeme Carpani" value={`x${overtime.payMultiplier}`} />
              </div>
            </div>

            {/* Sebep ve Aciklama */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Sebep ve Aciklama
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-slate-700 mb-2">Sebep</h3>
                  <p className="text-sm text-slate-600">{overtime.reason || '-'}</p>
                </div>
                {overtime.description && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-700 mb-2">Aciklama</h3>
                    <p className="text-sm text-slate-600">{overtime.description}</p>
                  </div>
                )}
                {overtime.workDetails && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-700 mb-2">Yapilan Isler</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{overtime.workDetails}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Proje / Gorev Bilgileri */}
            {(overtime.projectName || overtime.taskId || overtime.costCenter) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <DocumentTextIcon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-medium text-slate-900">Proje / Gorev Bilgileri</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  {overtime.projectName && <InfoItem label="Proje" value={overtime.projectName} />}
                  {overtime.taskId && <InfoItem label="Gorev ID" value={overtime.taskId} />}
                  {overtime.costCenter && <InfoItem label="Maliyet Merkezi" value={overtime.costCenter} />}
                </div>
              </div>
            )}

            {/* Onay Bilgileri */}
            {(overtime.approvedByName || overtime.approvalDate || overtime.approvalNotes || overtime.rejectionReason) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-medium text-slate-900">Onay Bilgileri</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  {overtime.approvedByName && <InfoItem label="Onaylayan" value={overtime.approvedByName} />}
                  {overtime.approvalDate && <DateItem label="Onay Tarihi" date={overtime.approvalDate} format="DD.MM.YYYY HH:mm" />}
                </div>
                {overtime.approvalNotes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-medium text-slate-700 mb-2">Onay Notlari</h3>
                    <p className="text-sm text-slate-600">{overtime.approvalNotes}</p>
                  </div>
                )}
                {overtime.rejectionReason && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-medium text-red-700 mb-2">Red Sebebi</h3>
                    <p className="text-sm text-red-600">{overtime.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notlar */}
            {overtime.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Notlar
                </h2>
                <p className="text-sm text-slate-600">{overtime.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calisan Karti */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-8 h-8 text-white" />
                </div>
                <p className="font-medium text-slate-900">{overtime.employeeName}</p>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mt-2 ${
                  overtime.overtimeType === 'Emergency' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {overtimeTypeLabels[overtime.overtimeType] || overtime.overtimeType}
                </span>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">On Onayli</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    overtime.isPreApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {overtime.isPreApproved ? 'Evet' : 'Hayir'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Acil</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    overtime.isEmergency ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {overtime.isEmergency ? 'Evet' : 'Hayir'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Telafi Izni</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    overtime.isCompensatoryTimeOff ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {overtime.isCompensatoryTimeOff ? 'Evet' : 'Hayir'}
                  </span>
                </div>
              </div>
            </div>

            {/* Odeme Bilgileri */}
            {!overtime.isCompensatoryTimeOff && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-medium text-slate-900">Odeme Bilgileri</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Hesaplanan Tutar</span>
                    <span className="text-lg font-semibold text-emerald-600">
                      {formatCurrency(overtime.calculatedAmount, overtime.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Odendi</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      overtime.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {overtime.isPaid ? 'Evet' : 'Hayir'}
                    </span>
                  </div>
                  {overtime.paidDate && (
                    <DateItem label="Odeme Tarihi" date={overtime.paidDate} />
                  )}
                </div>
              </div>
            )}

            {/* Telafi Izni */}
            {overtime.isCompensatoryTimeOff && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-purple-900 mb-4">Telafi Izni</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-700">Kazanilan Saat</span>
                    <span className="font-semibold text-purple-900">
                      {overtime.compensatoryHoursEarned || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-purple-700">Kullanilan Saat</span>
                    <span className="text-purple-900">
                      {overtime.compensatoryHoursUsed || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tarihler */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-medium text-slate-900">Zaman Cizelgesi</h2>
              </div>
              <div className="space-y-0">
                <DateItem label="Talep Tarihi" date={overtime.requestDate} format="DD.MM.YYYY HH:mm" />
                {overtime.approvalDate && (
                  <DateItem
                    label={overtime.status === 'Approved' ? 'Onay Tarihi' : 'Red Tarihi'}
                    date={overtime.approvalDate}
                    format="DD.MM.YYYY HH:mm"
                  />
                )}
                {overtime.paidDate && (
                  <DateItem label="Odeme Tarihi" date={overtime.paidDate} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DetailPageLayout>
  );
}
