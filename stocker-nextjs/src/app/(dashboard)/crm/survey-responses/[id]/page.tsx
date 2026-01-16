'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Spin } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  ChartBarIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { useSurveyResponse, useDeleteSurveyResponse } from '@/lib/api/hooks/useCRM';
import { SurveyType, SurveyResponseStatus } from '@/lib/api/services/crm.types';
import { confirmDelete, showDeleteSuccess, showError } from '@/lib/utils/sweetalert';

const surveyTypeLabels: Record<SurveyType, { label: string; icon: string }> = {
  [SurveyType.NPS]: { label: 'NPS', icon: '📊' },
  [SurveyType.CSAT]: { label: 'CSAT', icon: '😊' },
  [SurveyType.CES]: { label: 'CES', icon: '⚡' },
  [SurveyType.ProductFeedback]: { label: 'Urun Geribildirim', icon: '📦' },
  [SurveyType.ServiceFeedback]: { label: 'Hizmet Geribildirim', icon: '⭐' },
  [SurveyType.General]: { label: 'Genel', icon: '📝' },
  [SurveyType.Custom]: { label: 'Ozel', icon: '🔧' },
};

const statusLabels: Record<SurveyResponseStatus, { label: string; color: string }> = {
  [SurveyResponseStatus.Pending]: { label: 'Beklemede', color: 'bg-amber-100 text-amber-700' },
  [SurveyResponseStatus.Completed]: { label: 'Tamamlandi', color: 'bg-emerald-100 text-emerald-700' },
  [SurveyResponseStatus.Partial]: { label: 'Kismi', color: 'bg-blue-100 text-blue-700' },
  [SurveyResponseStatus.Expired]: { label: 'Suresi Doldu', color: 'bg-slate-100 text-slate-600' },
};

export default function SurveyResponseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: response, isLoading, error } = useSurveyResponse(id);
  const deleteResponse = useDeleteSurveyResponse();

  const handleDelete = async () => {
    if (!response) return;

    const confirmed = await confirmDelete(
      'Anket Yaniti',
      response.surveyName
    );

    if (confirmed) {
      try {
        await deleteResponse.mutateAsync(id);
        showDeleteSuccess('anket yaniti');
        router.push('/crm/survey-responses');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNPSCategory = (score?: number) => {
    if (score === undefined) return null;
    if (score >= 9) return { label: 'Promoter', color: 'text-emerald-600' };
    if (score >= 7) return { label: 'Passive', color: 'text-amber-600' };
    return { label: 'Detractor', color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (error || !response) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Anket yaniti bulunamadi</p>
          <Link href="/crm/survey-responses" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Don
          </Link>
        </div>
      </PageContainer>
    );
  }

  const typeInfo = surveyTypeLabels[response.surveyType];
  const statusInfo = statusLabels[response.status];
  const npsCategory = getNPSCategory(response.npsScore);

  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/crm/survey-responses"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Listeye Don
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
              <span className="text-2xl">{typeInfo?.icon || '📝'}</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{response.surveyName}</h1>
              <p className="text-sm text-slate-500 mt-1">{typeInfo?.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/crm/survey-responses/${id}/edit`}>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                <PencilIcon className="w-4 h-4" />
                Duzenle
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-slate-300 rounded-md hover:bg-red-50 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Sil
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Survey Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Anket Bilgileri</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Anket Tipi</dt>
                  <dd className="flex items-center gap-2">
                    <span>{typeInfo?.icon}</span>
                    <span className="text-sm text-slate-900 font-medium">{typeInfo?.label}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Anket Adi</dt>
                  <dd className="text-sm text-slate-900 font-medium">{response.surveyName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Durum</dt>
                  <dd>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo?.color || 'bg-slate-100 text-slate-600'}`}>
                      {statusInfo?.label || response.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Anonim Mi?</dt>
                  <dd className="text-sm text-slate-900">
                    {response.isAnonymous ? 'Evet' : 'Hayir'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Scores Card */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Puanlama</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <StarIcon className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {response.overallScore ? response.overallScore.toFixed(1) : '-'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Genel Puan</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <ChartBarIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className={`text-2xl font-bold ${npsCategory?.color || 'text-slate-900'}`}>
                    {response.npsScore !== undefined ? response.npsScore : '-'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    NPS {npsCategory ? `(${npsCategory.label})` : ''}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <ClockIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {response.completionTimeSeconds
                      ? `${Math.floor(response.completionTimeSeconds / 60)}:${String(response.completionTimeSeconds % 60).padStart(2, '0')}`
                      : '-'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Tamamlanma Suresi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Participant Card */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Katilimci Bilgileri</h2>
            </div>
            <div className="p-6">
              {response.isAnonymous ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 italic">Anonim Katilimci</p>
                    <p className="text-xs text-slate-400">Kimlik bilgisi gizli</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {response.customerName || response.contactName || response.respondentName || 'Belirtilmemis'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {response.customerName ? 'Musteri' : response.contactName ? 'Kisi' : response.respondentName ? 'Katilimci' : '-'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Card */}
          {response.comments && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-slate-600" />
                  <h2 className="text-sm font-medium text-slate-900">Yorumlar</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{response.comments}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Meta Info (1/3) */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Durum</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Anket Tipi</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                  <span>{typeInfo?.icon}</span>
                  {typeInfo?.label || response.surveyType}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Tamamlanma Durumu</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo?.color || 'bg-slate-100 text-slate-600'}`}>
                  {statusInfo?.label || response.status}
                </span>
              </div>
            </div>
          </div>

          {/* Date Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Tarihler</h3>
            <div className="space-y-3">
              {response.submittedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Gonderim Tarihi</p>
                    <p className="text-sm text-slate-900">{formatDate(response.submittedAt)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Olusturulma</p>
                  <p className="text-sm text-slate-900">{formatDate(response.createdAt)}</p>
                </div>
              </div>
              {response.updatedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Guncelleme</p>
                    <p className="text-sm text-slate-900">{formatDate(response.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
