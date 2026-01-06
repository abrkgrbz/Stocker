'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DetailPageLayout } from '@/components/patterns';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FireIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PencilIcon,
  StarIcon,
  StopCircleIcon,
  TagIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useJobPosting,
  usePublishJobPosting,
  useUnpublishJobPosting,
  useCloseJobPosting,
} from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

// Status options
const statusOptions: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
  Published: { label: 'Yayinda', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  Closed: { label: 'Kapali', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  OnHold: { label: 'Beklemede', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  Filled: { label: 'Dolu', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
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

function DateItem({ label, date }: { label: string; date?: string }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-medium text-slate-500 mb-1">{label}</dt>
      <dd className="text-sm text-slate-900">
        {date ? dayjs(date).format('DD.MM.YYYY') : '-'}
      </dd>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function JobPostingDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: jobPosting, isLoading, error } = useJobPosting(id);
  const publishJobPosting = usePublishJobPosting();
  const unpublishJobPosting = useUnpublishJobPosting();
  const closeJobPosting = useCloseJobPosting();

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const statusInfo = jobPosting ? (statusOptions[jobPosting.status] || { label: jobPosting.status, bgColor: 'bg-slate-100', textColor: 'text-slate-700' }) : null;

  const renderActions = () => {
    if (!jobPosting) return null;
    return (
      <>
        {jobPosting.status === 'Draft' && (
          <button
            onClick={() => publishJobPosting.mutateAsync(id)}
            disabled={publishJobPosting.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            {publishJobPosting.isPending ? 'Yayinlaniyor...' : 'Yayinla'}
          </button>
        )}
        {jobPosting.status === 'Published' && (
          <>
            <button
              onClick={() => unpublishJobPosting.mutateAsync(id)}
              disabled={unpublishJobPosting.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-4 h-4" />
              {unpublishJobPosting.isPending ? 'Kaldiriliyor...' : 'Yayindan Kaldir'}
            </button>
            <button
              onClick={() => closeJobPosting.mutateAsync(id)}
              disabled={closeJobPosting.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <StopCircleIcon className="w-4 h-4" />
              {closeJobPosting.isPending ? 'Kapatiliyor...' : 'Kapat'}
            </button>
          </>
        )}
        <Link
          href={`/hr/job-postings/${id}/edit`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
          Duzenle
        </Link>
      </>
    );
  };

  return (
    <DetailPageLayout
      title={jobPosting?.title || 'Is Ilani Detayi'}
      subtitle={jobPosting ? `${jobPosting.postingCode} - ${jobPosting.departmentName}` : undefined}
      backPath="/hr/job-postings"
      icon={<BriefcaseIcon className="w-5 h-5 text-white" />}
      iconBgColor="bg-slate-600"
      isLoading={isLoading}
      isError={!!error || !jobPosting}
      errorMessage="Is Ilani Bulunamadi"
      errorDescription="Istenen is ilani bulunamadi."
      statusBadge={
        jobPosting && statusInfo && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
              {statusInfo.label}
            </span>
            {jobPosting.isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                <FireIcon className="w-3 h-3" />
                Acil
              </span>
            )}
            {jobPosting.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                <StarIcon className="w-3 h-3" />
                One Cikan
              </span>
            )}
          </div>
        )
      }
      actions={renderActions()}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={UserGroupIcon}
          label="Basvurular"
          value={jobPosting?.totalApplications || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={EyeIcon}
          label="Goruntuleme"
          value={jobPosting?.viewsCount || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Ise Alinan"
          value={jobPosting?.hiredCount || 0}
          color="bg-emerald-500"
        />
        <StatCard
          icon={BriefcaseIcon}
          label="Acik Pozisyon"
          value={jobPosting?.numberOfOpenings || 0}
          color="bg-amber-500"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Temel Bilgiler</h2>
              {statusInfo && (
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InfoItem label="Departman" value={jobPosting?.departmentName} />
              <InfoItem label="Pozisyon" value={jobPosting?.positionTitle} />
              <InfoItem
                label="Calisma Tipi"
                value={
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {jobPosting?.employmentType}
                  </span>
                }
              />
              <InfoItem
                label="Deneyim Seviyesi"
                value={
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {jobPosting?.experienceLevel}
                  </span>
                }
              />
              <InfoItem label="Ise Alim Yoneticisi" value={jobPosting?.hiringManagerName} />
              <InfoItem
                label="Uzaktan Calisma"
                value={
                  jobPosting?.remoteWorkType === 'Remote' ? 'Uzaktan' :
                  jobPosting?.remoteWorkType === 'Hybrid' ? 'Hibrit' : 'Ofiste'
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Aciklama
            </h2>
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {jobPosting?.description || '-'}
            </p>
          </div>

          {/* Requirements & Responsibilities */}
          {(jobPosting?.requirements || jobPosting?.responsibilities) && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Gereksinimler ve Sorumluluklar
              </h2>
              {jobPosting?.requirements && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-slate-700 mb-2">Gereksinimler</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    {jobPosting.requirements}
                  </p>
                </div>
              )}
              {jobPosting?.responsibilities && (
                <div>
                  <h3 className="text-xs font-medium text-slate-700 mb-2">Sorumluluklar</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    {jobPosting.responsibilities}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Qualifications */}
          {(jobPosting?.qualifications || jobPosting?.preferredQualifications) && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Nitelikler
              </h2>
              {jobPosting?.qualifications && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-slate-700 mb-2">Aranan Nitelikler</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    {jobPosting.qualifications}
                  </p>
                </div>
              )}
              {jobPosting?.preferredQualifications && (
                <div>
                  <h3 className="text-xs font-medium text-slate-700 mb-2">Tercih Edilen</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-line">
                    {jobPosting.preferredQualifications}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Benefits */}
          {jobPosting?.benefits && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-medium text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Yan Haklar
              </h2>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {jobPosting.benefits}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <MapPinIcon className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-medium text-slate-900">Konum</h2>
            </div>
            <div className="space-y-0">
              <InfoItem label="Calisma Lokasyonu" value={jobPosting?.workLocationName} />
              <InfoItem label="Sehir" value={jobPosting?.city} />
              <InfoItem label="Ulke" value={jobPosting?.country} />
            </div>
          </div>

          {/* Salary */}
          {jobPosting?.showSalary && (jobPosting?.salaryMin || jobPosting?.salaryMax) && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-medium text-slate-900">Maas Bilgisi</h2>
              </div>
              <div className="space-y-0">
                <InfoItem
                  label="Aralik"
                  value={
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(jobPosting.salaryMin)} - {formatCurrency(jobPosting.salaryMax)}
                    </span>
                  }
                />
                <InfoItem label="Periyot" value={jobPosting.salaryPeriod} />
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <ClockIcon className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-medium text-slate-900">Tarihler</h2>
            </div>
            <div className="space-y-0">
              <DateItem label="Olusturulma" date={jobPosting?.createdAt} />
              {jobPosting?.postedDate && (
                <DateItem label="Yayin Tarihi" date={jobPosting.postedDate} />
              )}
              {jobPosting?.applicationDeadline && (
                <div className="py-3 border-b border-slate-100">
                  <dt className="text-xs font-medium text-slate-500 mb-1">Son Basvuru</dt>
                  <dd className={`text-sm font-medium ${
                    dayjs(jobPosting.applicationDeadline).isBefore(dayjs())
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}>
                    {dayjs(jobPosting.applicationDeadline).format('DD.MM.YYYY')}
                  </dd>
                </div>
              )}
              {jobPosting?.expectedStartDate && (
                <DateItem label="Beklenen Baslangic" date={jobPosting.expectedStartDate} />
              )}
              {jobPosting?.closedDate && (
                <DateItem label="Kapanis Tarihi" date={jobPosting.closedDate} />
              )}
            </div>
          </div>

          {/* Tags */}
          {(jobPosting?.tags || jobPosting?.keywords) && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <TagIcon className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-medium text-slate-900">Etiketler</h2>
              </div>
              {jobPosting?.tags && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {jobPosting.tags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              {jobPosting?.keywords && (
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Anahtar Kelimeler:</span> {jobPosting.keywords}
                </p>
              )}
            </div>
          )}

          {/* Internal Notes */}
          {jobPosting?.internalNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h2 className="text-sm font-medium text-amber-900 mb-2">Ic Notlar</h2>
              <p className="text-sm text-amber-800">
                {jobPosting.internalNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </DetailPageLayout>
  );
}
