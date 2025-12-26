'use client';

/**
 * Customer Segment Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Empty, Tag, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  UserIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useSegment, useSegmentMembers } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const segmentTypeLabels: Record<string, { label: string; color: string }> = {
  Static: { label: 'Statik', color: 'blue' },
  Dynamic: { label: 'Dinamik', color: 'green' },
  Manual: { label: 'Manuel', color: 'orange' },
  Automated: { label: 'Otomatik', color: 'purple' },
};

export default function SegmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const segmentId = params.id as string;

  const { data: segment, isLoading, error } = useSegment(segmentId);
  const { data: members } = useSegmentMembers(segmentId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !segment) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Segment bulunamadı" />
      </div>
    );
  }

  const typeInfo = segmentTypeLabels[segment.segmentType] || { label: segment.segmentType || 'Bilinmiyor', color: 'default' };
  const memberCount = members?.length || segment.memberCount || 0;

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
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/crm/segments')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  segment.isActive ? 'bg-cyan-100' : 'bg-slate-100'
                }`}
              >
                <UsersIcon
                  className={`w-6 h-6 ${segment.isActive ? 'text-cyan-600' : 'text-slate-400'}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{segment.name}</h1>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{memberCount} Müşteri</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/segments/${segment.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Düzenle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Info Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Segment Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Segment Adı</p>
                  <p className="text-sm font-medium text-slate-900">{segment.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Segment Tipi</p>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={segment.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                    color={segment.isActive ? 'success' : 'default'}
                  >
                    {segment.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Üye Sayısı</p>
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{memberCount}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {segment.createdAt ? dayjs(segment.createdAt).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Son Güncelleme</p>
                  <div className="flex items-center gap-1">
                    <ArrowPathIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {segment.updatedAt ? dayjs(segment.updatedAt).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {segment.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{segment.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Özet
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    segment.isActive ? 'bg-cyan-100' : 'bg-slate-100'
                  }`}
                >
                  <UsersIcon
                    className={`w-10 h-10 ${segment.isActive ? 'text-cyan-600' : 'text-slate-400'}`}
                  />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-3">{memberCount}</p>
                <p className="text-sm text-slate-500">Toplam Müşteri</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Segment Tipi</span>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Durum</span>
                  <span
                    className={`font-medium ${segment.isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {segment.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Card */}
          {segment.criteria && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FunnelIcon className="w-5 h-5 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Segment Kriterleri
                  </p>
                </div>
                {typeof segment.criteria === 'string' ? (
                  <pre className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg overflow-x-auto">
                    {segment.criteria}
                  </pre>
                ) : Array.isArray(segment.criteria) && segment.criteria.length > 0 ? (
                  <div className="space-y-2">
                    {segment.criteria.map((criterion: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg"
                      >
                        <Tag color="blue">{criterion.field}</Tag>
                        <span className="text-sm text-slate-600">{criterion.operator}</span>
                        <Tag>{String(criterion.value)}</Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Kriter tanımlanmamış</p>
                )}
              </div>
            </div>
          )}

          {/* Members Preview */}
          {members && members.length > 0 && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                      Segment Üyeleri
                    </p>
                  </div>
                  <span className="text-sm text-slate-500">
                    {members.length > 10 ? `İlk 10 / ${members.length} üye gösteriliyor` : `${members.length} üye`}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {members.slice(0, 10).map((member: any) => (
                    <div
                      key={member.id}
                      className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => router.push(`/crm/customers/${member.customerId}`)}
                    >
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {member.customerName || 'İsimsiz'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{member.customerEmail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
