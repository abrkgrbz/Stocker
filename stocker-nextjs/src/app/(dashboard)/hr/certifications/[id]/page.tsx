'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Spin, Progress } from 'antd';
import { PageContainer } from '@/components/patterns';
import {
  ArrowLeftIcon,
  PencilIcon,
  ShieldCheckIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  LinkIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { useCertification } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

export default function CertificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: certification, isLoading } = useCertification(id);

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return dayjs(date).format('DD.MM.YYYY');
  };

  const formatCurrency = (value?: number, currency?: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    }).format(value);
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </PageContainer>
    );
  }

  if (!certification) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Sertifika bulunamadı</p>
          <Link href="/hr/certifications" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Dön
          </Link>
        </div>
      </PageContainer>
    );
  }

  const getStatusInfo = () => {
    if (certification.isExpired) {
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Süresi Doldu', icon: ExclamationCircleIcon };
    }
    if (certification.isExpiringSoon) {
      return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Yakında Dolacak', icon: ExclamationTriangleIcon };
    }
    return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Geçerli', icon: CheckCircleIcon };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/hr/certifications"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Listeye Dön
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{certification.certificationName}</h1>
              <p className="text-sm text-slate-500 mt-1">{certification.employeeName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {certification.verificationUrl && (
              <a
                href={certification.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Doğrula
              </a>
            )}
            <Link href={`/hr/certifications/${id}/edit`}>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
                <PencilIcon className="w-4 h-4" />
                Düzenle
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* İki Kolonlu Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Ana Bilgiler (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sertifika Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrophyIcon className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-medium text-slate-900">Sertifika Bilgileri</h2>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusInfo.label}
              </span>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <InfoItem label="Sertifika Adı" value={certification.certificationName} />
                <InfoItem label="Tip" value={certification.certificationType} />
                <InfoItem label="Seviye" value={certification.certificationLevel} />
                <InfoItem label="Uzmanlık" value={certification.specialization} />
                <InfoItem label="Veren Kurum" value={certification.issuingAuthority} />
                <InfoItem label="Ülke" value={certification.issuingCountry} />
                <InfoItem label="Sertifika No" value={certification.certificationNumber} />
                <InfoItem label="Credential ID" value={certification.credentialId} />
              </dl>
            </div>
          </div>

          {/* Eğitim Bilgileri */}
          {certification.trainingRequired && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-medium text-slate-900">Eğitim Bilgileri</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Toplam Saat</p>
                    <p className="text-sm font-medium text-slate-900">{certification.totalTrainingHours || 0} saat</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tamamlanan</p>
                    <p className="text-sm font-medium text-slate-900">{certification.completedTrainingHours || 0} saat</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">İlerleme</p>
                  <Progress
                    percent={
                      certification.totalTrainingHours
                        ? Math.round(((certification.completedTrainingHours || 0) / certification.totalTrainingHours) * 100)
                        : 0
                    }
                    status={
                      (certification.completedTrainingHours || 0) >= (certification.totalTrainingHours || 0)
                        ? 'success'
                        : 'active'
                    }
                  />
                </div>
                {certification.trainingProvider && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-1">Eğitim Sağlayıcı</p>
                    <p className="text-sm text-slate-900">{certification.trainingProvider}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sınav Bilgileri */}
          {certification.examRequired && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Sınav Bilgileri</h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <InfoItem label="Sınav Tarihi" value={formatDate(certification.examDate)} />
                  <InfoItem label="Deneme Sayısı" value={certification.attemptNumber || 1} />
                  <div>
                    <dt className="text-xs text-slate-500 mb-1">Sınav Puanı</dt>
                    <dd className={`text-sm font-medium ${
                      certification.examScore && certification.passingScore && certification.examScore >= certification.passingScore
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}>
                      {certification.examScore || '-'}
                    </dd>
                  </div>
                  <InfoItem label="Geçme Puanı" value={certification.passingScore} />
                </dl>
              </div>
            </div>
          )}

          {/* CPE Bilgileri */}
          {certification.cpeRequired && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">CPE/CEU Bilgileri</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Gerekli CPE</p>
                    <p className="text-sm font-medium text-slate-900">{certification.requiredCpeUnits || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Kazanılan CPE</p>
                    <p className="text-sm font-medium text-slate-900">{certification.earnedCpeUnits || 0}</p>
                  </div>
                </div>
                <Progress
                  percent={
                    certification.requiredCpeUnits
                      ? Math.round(((certification.earnedCpeUnits || 0) / certification.requiredCpeUnits) * 100)
                      : 0
                  }
                  status={
                    (certification.earnedCpeUnits || 0) >= (certification.requiredCpeUnits || 0)
                      ? 'success'
                      : 'active'
                  }
                />
              </div>
            </div>
          )}

          {/* Açıklama ve Notlar */}
          {(certification.description || certification.notes) && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Açıklama ve Notlar</h2>
              </div>
              <div className="p-6 space-y-4">
                {certification.description && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-700">{certification.description}</p>
                  </div>
                )}
                {certification.notes && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Notlar</p>
                    <p className="text-sm text-slate-700">{certification.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Kolon - Meta Bilgiler (1/3) */}
        <div className="space-y-6">
          {/* Çalışan */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Çalışan</h3>
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-900">{certification.employeeName}</p>
            </div>
            <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">İş İçin Zorunlu</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${certification.requiredForJob ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                  {certification.requiredForJob ? 'Evet' : 'Hayır'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Şirket Sponsorlu</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${certification.companySponsored ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {certification.companySponsored ? 'Evet' : 'Hayır'}
                </span>
              </div>
            </div>
          </div>

          {/* Tarihler */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Tarihler</h3>
            <div className="space-y-3">
              <DateItem icon={CalendarIcon} label="Verilme Tarihi" date={formatDate(certification.issueDate)} color="text-emerald-500" />
              {certification.expiryDate && (
                <DateItem
                  icon={CalendarIcon}
                  label="Bitiş Tarihi"
                  date={formatDate(certification.expiryDate)}
                  color={certification.isExpired ? 'text-red-500' : certification.isExpiringSoon ? 'text-amber-500' : 'text-blue-500'}
                />
              )}
              {certification.lastRenewalDate && (
                <DateItem icon={CalendarIcon} label="Son Yenileme" date={formatDate(certification.lastRenewalDate)} color="text-violet-500" />
              )}
              {certification.nextRenewalDate && (
                <DateItem icon={CalendarIcon} label="Sonraki Yenileme" date={formatDate(certification.nextRenewalDate)} color="text-cyan-500" />
              )}
            </div>
          </div>

          {/* Maliyet */}
          {(certification.certificationCost || certification.renewalCost) && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-900">Maliyet</h3>
              </div>
              <div className="space-y-3">
                {certification.certificationCost && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Sertifika Ücreti</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(certification.certificationCost, certification.currency)}
                    </span>
                  </div>
                )}
                {certification.renewalCost && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Yenileme Ücreti</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(certification.renewalCost, certification.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rozet */}
          {certification.badgeUrl && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Rozet</h3>
              <div className="text-center">
                <img
                  src={certification.badgeUrl}
                  alt="Sertifika Rozeti"
                  className="max-w-full h-auto rounded-lg mx-auto"
                  style={{ maxHeight: 150 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

// Yardımcı Bileşenler
const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div>
    <dt className="text-xs text-slate-500 mb-1">{label}</dt>
    <dd className="text-sm text-slate-900">{value || '-'}</dd>
  </div>
);

const DateItem = ({ icon: Icon, label, date, color }: { icon: any; label: string; date: string; color: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-900">{date}</p>
    </div>
  </div>
);
